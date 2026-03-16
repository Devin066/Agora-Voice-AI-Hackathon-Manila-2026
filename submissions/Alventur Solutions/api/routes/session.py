from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import os
import base64
import httpx
import json
import asyncio
import random
import string
import logging
from prompts import get_system_prompt

router = APIRouter(prefix="/session", tags=["session"])
logger = logging.getLogger("uvicorn.error")
MAX_CHANNEL_BYTES = 64
SESSION_REGISTRY: dict[str, dict[str, str]] = {}
SESSION_REGISTRY_LOCK = asyncio.Lock()


class StartSessionRequest(BaseModel):
    channelName: Optional[str] = None
    scenario: str = Field(..., description="public_speaking | job_interview | debate | english_fluency")
    userId: Optional[str | int] = None

    @field_validator("scenario")
    @classmethod
    def validate_scenario(cls, v: str) -> str:
        allowed = {"public_speaking", "job_interview", "debate", "english_fluency"}
        if v not in allowed:
            raise ValueError("Unsupported scenario")
        return v

    @field_validator("channelName")
    @classmethod
    def validate_channel_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if len(value.encode("utf-8")) > MAX_CHANNEL_BYTES:
            raise ValueError(f"channelName must be within {MAX_CHANNEL_BYTES} bytes")
        return value


class StartSessionResponse(BaseModel):
    sessionId: str
    agentUid: int
    channelName: str
    status: str


class StopSessionRequest(BaseModel):
    sessionId: str
    channelName: Optional[str] = None


class StopSessionResponse(BaseModel):
    sessionId: str
    status: str
    stoppedAt: str


def _basic_credentials() -> str:
    customer_id = str(os.getenv("AGORA_CUSTOMER_ID"))
    customer_secret = str(os.getenv("AGORA_CUSTOMER_SECRET"))
    creds = f"{customer_id}:{customer_secret}".encode("utf-8")
    return base64.b64encode(creds).decode("utf-8")


def _generate_agent_token(channel: str, uid: int) -> str:
    try:
        from agora_token_builder import RtcTokenBuilder  # lazy import
    except Exception:
        raise HTTPException(status_code=500, detail="agora-token-builder is not installed")
    app_id = os.getenv("AGORA_APP_ID")
    app_cert = os.getenv("AGORA_APP_CERTIFICATE")
    if not app_id or not app_cert:
        raise HTTPException(status_code=500, detail="Agora credentials are not set")
    expiration_time = int(datetime.now().timestamp()) + 3600
    try:
        return RtcTokenBuilder.buildTokenWithUid(
            appId=app_id,
            appCertificate=app_cert,
            channelName=channel,
            uid=uid,
            role=1,
            privilegeExpiredTs=expiration_time,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Agora token: {str(e)}")

def _generate_channel_name() -> str:
    timestamp = int(datetime.now().timestamp())
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"ai-conversation-{timestamp}-{random_str}"

def _is_task_not_found_error(response_text: str) -> bool:
    normalized = response_text.lower()
    if "tasknotfound" in normalized or "task not found" in normalized:
        return True
    try:
        outer = json.loads(response_text)
        detail = outer.get("detail")
        if isinstance(detail, str):
            detail_normalized = detail.lower()
            if "tasknotfound" in detail_normalized or "task not found" in detail_normalized:
                return True
            try:
                inner = json.loads(detail)
                inner_text = json.dumps(inner).lower()
                return "tasknotfound" in inner_text or "task not found" in inner_text
            except Exception:
                return False
    except Exception:
        return False
    return False

async def _mark_session_active(session_id: str, channel_name: str) -> None:
    async with SESSION_REGISTRY_LOCK:
        SESSION_REGISTRY[session_id] = {"status": "active", "channelName": channel_name}

async def _mark_session_stopped(session_id: str) -> None:
    async with SESSION_REGISTRY_LOCK:
        existing = SESSION_REGISTRY.get(session_id)
        channel_name = existing["channelName"] if existing and "channelName" in existing else ""
        SESSION_REGISTRY[session_id] = {"status": "stopped", "channelName": channel_name}

async def _is_session_already_stopped(session_id: str) -> bool:
    async with SESSION_REGISTRY_LOCK:
        return SESSION_REGISTRY.get(session_id, {}).get("status") == "stopped"


@router.post("/start", response_model=StartSessionResponse)
async def start_session(body: StartSessionRequest):
    try:
        base_url = os.getenv("AGORA_CONVO_AI_BASE_URL")
        app_id = os.getenv("AGORA_APP_ID")
        configured_agent_uid = int(os.getenv("AGENT_UID", "10001"))
        agent_uid = configured_agent_uid if configured_agent_uid > 0 else 10001
        if not base_url or not app_id:
            raise HTTPException(status_code=500, detail="Missing AGORA_CONVO_AI_BASE_URL or AGORA_APP_ID")

        channel = body.channelName or _generate_channel_name()
        token = _generate_agent_token(channel, agent_uid)

        system_prompt = get_system_prompt(body.scenario)

        output_modalities = [s for s in os.getenv("OUTPUT_MODALITIES", "text,audio").split(",") if s]
        # Join schema expects string values in UID fields, but the iOS client
        # joins with numeric RTC UID. Keep numeric UID mode for compatibility.
        use_string_uid = False

        if body.userId is None:
            remote_rtc_uids: list[str] = []
        else:
            remote_rtc_uids = [str(body.userId)]

        agent_rtc_uid = str(agent_uid)

        tts_vendor = os.getenv("TTS_VENDOR", "microsoft")
        tts: dict
        if tts_vendor == "microsoft":
            required = ["MICROSOFT_TTS_KEY", "MICROSOFT_TTS_REGION", "MICROSOFT_TTS_VOICE_NAME"]
            if any(not os.getenv(k) for k in required):
                raise HTTPException(status_code=500, detail="Missing Microsoft TTS environment variables")
            tts = {
                "vendor": "microsoft",
                "params": {
                    "key": os.getenv("MICROSOFT_TTS_KEY"),
                    "region": os.getenv("MICROSOFT_TTS_REGION"),
                    "voice_name": os.getenv("MICROSOFT_TTS_VOICE_NAME"),
                    "rate": float(os.getenv("MICROSOFT_TTS_RATE", "1.0")),
                    "volume": float(os.getenv("MICROSOFT_TTS_VOLUME", "100.0")),
                },
            }
        elif tts_vendor == "elevenlabs":
            required = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL_ID"]
            if any(not os.getenv(k) for k in required):
                raise HTTPException(status_code=500, detail="Missing ElevenLabs environment variables")
            tts = {
                "vendor": "elevenlabs",
                "params": {
                    "key": os.getenv("ELEVENLABS_API_KEY"),
                    "model_id": os.getenv("ELEVENLABS_MODEL_ID"),
                    "voice_id": os.getenv("ELEVENLABS_VOICE_ID"),
                },
            }
        else:
            raise HTTPException(status_code=500, detail="Unsupported TTS vendor")

        request_body = {
            "name": f"conversation-{int(datetime.now().timestamp())}",
            "properties": {
                "channel": channel,
                "token": token,
                "agent_rtc_uid": agent_rtc_uid,
                "remote_rtc_uids": remote_rtc_uids,
                "enable_string_uid": use_string_uid,
                "idle_timeout": 30,
                "asr": {"language": "en-US", "task": "conversation"},
                "llm": {
                    "url": os.getenv("LLM_URL"),
                    "api_key": os.getenv("LLM_TOKEN"),
                    "system_messages": [{"role": "system", "content": system_prompt}],
                    "greeting_message": os.getenv("GREETING_MESSAGE"),
                    "failure_message": "Please wait a moment.",
                    "max_history": 10,
                    "params": {
                        "model": os.getenv("LLM_MODEL"),
                        "max_tokens": 150,
                        "temperature": 0.7,
                        "top_p": 0.95,
                    },
                    "output_modalities": output_modalities,
                },
                "tts": tts,
                "vad": {
                    "silence_duration_ms": 480,
                    "speech_duration_ms": 15000,
                    "threshold": 0.5,
                    "interrupt_duration_ms": 160,
                    "prefix_padding_ms": 300,
                },
                "advanced_features": {"enable_aivad": False, "enable_bhvs": False},
            },
        }

        logger.info(
            "[convoai] start_session %s",
            json.dumps(
                {
                    "channel": channel,
                    "agent_uid": agent_uid,
                    "remote_rtc_uids": remote_rtc_uids,
                    "enable_string_uid": use_string_uid,
                    "has_greeting": bool(os.getenv("GREETING_MESSAGE")),
                    "output_modalities": output_modalities,
                    "tts_vendor": tts_vendor,
                }
            ),
        )

        async with httpx.AsyncClient() as client:
            auth_header = f"Basic {_basic_credentials()}"
            resp = await client.post(
                f"{base_url}/{app_id}/join",
                json=request_body,
                headers={"Content-Type": "application/json", "Authorization": auth_header},
            )
            resp.raise_for_status()
            data = resp.json()
            logger.info(
                "[convoai] join_response %s",
                json.dumps(
                    {
                        "status_code": resp.status_code,
                        "agent_id": data.get("agent_id") or data.get("id"),
                        "agent_rtc_uid": data.get("agent_rtc_uid"),
                        "status": data.get("status"),
                        "response_keys": sorted(list(data.keys())),
                    }
                ),
            )
            session_id = data.get("agent_id") or data.get("id")
            if not session_id:
                raise HTTPException(status_code=500, detail="Missing agent_id in Agora response")
            session_id = str(session_id)

            resolved_agent_uid = data.get("agent_rtc_uid")
            if resolved_agent_uid is None:
                resolved_agent_uid = agent_uid

            try:
                resolved_agent_uid_int = int(resolved_agent_uid)
            except (TypeError, ValueError):
                resolved_agent_uid_int = agent_uid

            await _mark_session_active(session_id=session_id, channel_name=channel)
            return StartSessionResponse(
                sessionId=session_id,
                agentUid=resolved_agent_uid_int,
                channelName=channel,
                status=str(data.get("status") or "active"),
            )
    except httpx.HTTPStatusError as e:
        logger.error("[convoai] join_failed status=%s body=%s", e.response.status_code, e.response.text)
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        logger.exception("[convoai] unexpected_error")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop", response_model=StopSessionResponse)
async def stop_session(body: StopSessionRequest):
    try:
        if await _is_session_already_stopped(body.sessionId):
            return StopSessionResponse(
                sessionId=str(body.sessionId),
                status="stopped",
                stoppedAt=datetime.utcnow().isoformat() + "Z",
            )
        base_url = os.getenv("AGORA_CONVO_AI_BASE_URL")
        app_id = os.getenv("AGORA_APP_ID")
        if not base_url or not app_id:
            raise HTTPException(status_code=500, detail="Missing AGORA_CONVO_AI_BASE_URL or AGORA_APP_ID")
        async with httpx.AsyncClient() as client:
            auth_header = f"Basic {_basic_credentials()}"
            resp = await client.post(
                f"{base_url}/{app_id}/agents/{body.sessionId}/leave",
                headers={"Content-Type": "application/json", "Authorization": auth_header},
            )
            resp.raise_for_status()
            await _mark_session_stopped(body.sessionId)
            return StopSessionResponse(
                sessionId=str(body.sessionId),
                status="stopped",
                stoppedAt=datetime.utcnow().isoformat() + "Z",
            )
    except httpx.HTTPStatusError as e:
        if _is_task_not_found_error(e.response.text):
            await _mark_session_stopped(body.sessionId)
            return StopSessionResponse(
                sessionId=str(body.sessionId),
                status="stopped",
                stoppedAt=datetime.utcnow().isoformat() + "Z",
            )
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
