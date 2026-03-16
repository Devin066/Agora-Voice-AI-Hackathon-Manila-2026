from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import asyncio
import os
import base64
import httpx
import json
import random
import string
import logging
from urllib.parse import urlparse, parse_qs
from prompts import get_system_prompt

router = APIRouter(prefix="/session", tags=["session"])
logger = logging.getLogger("uvicorn.error")
MAX_CHANNEL_BYTES = 64


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
        from agora_token_builder import RtcTokenBuilder
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


def _parse_modalities(raw: str, fallback: list[str]) -> list[str]:
    parsed = [item.strip() for item in raw.split(",") if item.strip()]
    return parsed or fallback


def _infer_llm_style(llm_url: str, configured_style: str) -> str:
    if configured_style and configured_style.strip():
        style = configured_style.strip().lower()
    else:
        style = "openai"

    normalized_url = llm_url.lower()
    if "generativelanguage.googleapis.com" in normalized_url and style == "openai":
        return "gemini"

    return style


def _infer_llm_vendor(llm_style: str) -> str:
    normalized = llm_style.strip().lower()
    allowed = {"custom", "openai", "gemini", "anthropic", "dify"}
    return normalized if normalized in allowed else "openai"


def _infer_llm_api_key(llm_url: str) -> str:
    # FIX: check both LLM_API_KEY and LLM_TOKEN (PRD uses LLM_TOKEN)
    api_key = (
        os.getenv("LLM_API_KEY", "").strip()
        or os.getenv("LLM_TOKEN", "").strip()
    )
    if api_key:
        return api_key

    try:
        parsed = urlparse(llm_url)
        query = parse_qs(parsed.query)
        values = query.get("key")
        if values:
            return values[0].strip()
    except Exception:
        return ""

    return ""


def _is_task_conflict_error(response_text: str) -> bool:
    normalized = response_text.lower()
    return "taskconflict" in normalized or "conflict task" in normalized


def _extract_agent_id_from_error(response_text: str) -> Optional[str]:
    try:
        payload = json.loads(response_text)
    except Exception:
        return None

    agent_id = payload.get("agent_id") or payload.get("id")
    if agent_id:
        return str(agent_id)

    detail = payload.get("detail")
    if isinstance(detail, str):
        try:
            detail_payload = json.loads(detail)
            detail_agent_id = detail_payload.get("agent_id") or detail_payload.get("id")
            if detail_agent_id:
                return str(detail_agent_id)
        except Exception:
            return None

    return None


async def _log_agent_status_snapshot(
    client: httpx.AsyncClient,
    base_url: str,
    app_id: str,
    agent_id: str,
    auth_header: str,
) -> None:
    try:
        delay = float(os.getenv("CONVOAI_STATUS_CHECK_DELAY_SEC", "2.0"))
        if delay > 0:
            await asyncio.sleep(delay)

        resp = await client.get(
            f"{base_url}/{app_id}/agents/{agent_id}",
            headers={"Content-Type": "application/json", "Authorization": auth_header},
        )

        if resp.status_code >= 400:
            logger.warning("[convoai] agent_status_query_failed status=%s body=%s", resp.status_code, resp.text)
            return

        data = resp.json()
        status = data.get("status")
        reason = data.get("reason")
        message = data.get("message")

        logger.info(
            "[convoai] agent_status %s",
            json.dumps({
                "agent_id": data.get("agent_id") or data.get("id") or agent_id,
                "status": status,
                "message": message,
                "reason": reason,
            }),
        )

        # FIX: warn loudly if agent stopped immediately — helps diagnose TTS/LLM failures
        if status == "STOPPED":
            logger.warning(
                "[convoai] agent stopped immediately after joining — likely TTS or LLM init failure. "
                "Check ElevenLabs API key, voice_id, model_id, and Gemini LLM_TOKEN."
            )
    except Exception:
        logger.exception("[convoai] agent_status_unexpected_error")


@router.post("/start", response_model=StartSessionResponse)
async def start_session(body: StartSessionRequest):
    try:
        base_url = os.getenv("AGORA_CONVO_AI_BASE_URL")
        app_id = os.getenv("AGORA_APP_ID")
        agent_uid = int(os.getenv("AGENT_UID", "10001"))
        if not base_url or not app_id:
            raise HTTPException(status_code=500, detail="Missing AGORA_CONVO_AI_BASE_URL or AGORA_APP_ID")

        channel = body.channelName or _generate_channel_name()
        token = _generate_agent_token(channel, agent_uid)

        system_prompt = get_system_prompt(body.scenario)

        # input_modalities intentionally omitted — not supported by Agora ConvoAI
        output_modalities = _parse_modalities(os.getenv("OUTPUT_MODALITIES", "text,audio"), ["text", "audio"])
        llm_url = os.getenv("LLM_URL", "")
        llm_style = _infer_llm_style(llm_url, os.getenv("LLM_STYLE", "openai"))
        llm_vendor = _infer_llm_vendor(llm_style)
        llm_api_key = _infer_llm_api_key(llm_url)

        if not llm_url:
            raise HTTPException(status_code=500, detail="Missing LLM_URL")

        # FIX: warn at startup if LLM key is missing rather than silently failing later
        if not llm_api_key:
            logger.warning("[convoai] LLM_API_KEY and LLM_TOKEN are both empty — agent will likely stop immediately")

        remote_rtc_uids: list[str] = ["*"]
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
                    # FIX: ElevenLabs flash models output at 24000 Hz, not 16000
                    "sample_rate": int(os.getenv("ELEVENLABS_SAMPLE_RATE", "24000")),
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
                "enable_string_uid": False,
                "idle_timeout": 30,
                "asr": {"language": "en-US", "task": "conversation"},
                "llm": {
                    "url": llm_url,
                    "api_key": llm_api_key,
                    "vendor": llm_vendor,
                    "system_messages": [{"role": "system", "content": system_prompt}],
                    "greeting_message": os.getenv(
                        "GREETING_MESSAGE",
                        "Hello! I'm ready to help you practice. Let's get started."
                    ),
                    "failure_message": "Please wait a moment.",
                    "max_history": 10,
                    "style": llm_style,
                    "ignore_empty": True,
                    "params": {
                        "model": os.getenv("LLM_MODEL", "gemini-2.0-flash"),
                        "max_tokens": 150,
                        "temperature": 0.7,
                        "top_p": 0.95,
                    },
                    # input_modalities intentionally omitted — not supported by Agora ConvoAI
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
            json.dumps({
                "channel": channel,
                "agent_uid": agent_uid,
                "remote_rtc_uids": remote_rtc_uids,
                "enable_string_uid": False,
                "has_greeting": True,
                "llm_vendor": llm_vendor,
                "llm_style": llm_style,
                "has_llm_api_key": bool(llm_api_key),
                "output_modalities": output_modalities,
                "tts_vendor": tts_vendor,
            }),
        )

        async with httpx.AsyncClient() as client:
            auth_header = f"Basic {_basic_credentials()}"

            async def _join_with_payload(payload: dict) -> httpx.Response:
                return await client.post(
                    f"{base_url}/{app_id}/join",
                    json=payload,
                    headers={"Content-Type": "application/json", "Authorization": auth_header},
                )

            active_payload = request_body
            resp = await _join_with_payload(active_payload)

            # Safety net: strip input_modalities if Agora still rejects it
            if resp.status_code >= 400 and "input_modalities" in resp.text.lower() and "not supported" in resp.text.lower():
                logger.warning("[convoai] join retry: removing unsupported llm.input_modalities")
                active_payload = json.loads(json.dumps(active_payload))
                active_payload.get("properties", {}).get("llm", {}).pop("input_modalities", None)
                resp = await _join_with_payload(active_payload)

            # FIX: wait 1.5s after evicting a stale agent before retrying
            if resp.status_code == 409 and _is_task_conflict_error(resp.text):
                stale_agent_id = _extract_agent_id_from_error(resp.text)
                if stale_agent_id:
                    logger.warning(
                        "[convoai] join retry: resolving TaskConflict via leave agent_id=%s",
                        stale_agent_id
                    )
                    leave_resp = await client.post(
                        f"{base_url}/{app_id}/agents/{stale_agent_id}/leave",
                        headers={"Content-Type": "application/json", "Authorization": auth_header},
                    )
                    if leave_resp.status_code >= 400 and not _is_task_not_found_error(leave_resp.text):
                        leave_resp.raise_for_status()
                    # FIX: give Agora time to clean up the channel before rejoining
                    await asyncio.sleep(1.5)
                    resp = await _join_with_payload(active_payload)

            resp.raise_for_status()
            data = resp.json()
            logger.info(
                "[convoai] join_response %s",
                json.dumps({
                    "status_code": resp.status_code,
                    "agent_id": data.get("agent_id") or data.get("id"),
                    "agent_rtc_uid": data.get("agent_rtc_uid"),
                    "status": data.get("status"),
                    "response_keys": sorted(list(data.keys())),
                }),
            )

            session_id = data.get("agent_id") or data.get("id")
            if not session_id:
                raise HTTPException(status_code=500, detail="Missing agent_id in Agora response")
            session_id = str(session_id)

            # FIX: warn if agent_rtc_uid is null — falling back to configured AGENT_UID
            resolved_agent_uid = data.get("agent_rtc_uid")
            if resolved_agent_uid is None:
                logger.warning(
                    "[convoai] agent_rtc_uid was null, falling back to configured AGENT_UID=%s",
                    agent_uid
                )
            try:
                resolved_agent_uid_int = int(resolved_agent_uid) if resolved_agent_uid is not None else agent_uid
            except (TypeError, ValueError):
                resolved_agent_uid_int = agent_uid

            await _log_agent_status_snapshot(
                client=client,
                base_url=base_url,
                app_id=app_id,
                agent_id=session_id,
                auth_header=auth_header,
            )

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
            return StopSessionResponse(
                sessionId=str(body.sessionId),
                status="stopped",
                stoppedAt=datetime.utcnow().isoformat() + "Z",
            )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))