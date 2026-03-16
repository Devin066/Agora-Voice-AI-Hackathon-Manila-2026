from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import os
import base64
import httpx
from prompts import get_system_prompt

router = APIRouter(prefix="/session", tags=["session"])


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


@router.post("/start", response_model=StartSessionResponse)
async def start_session(body: StartSessionRequest):
    try:
        base_url = os.getenv("AGORA_CONVO_AI_BASE_URL")
        app_id = os.getenv("AGORA_APP_ID")
        agent_uid = int(os.getenv("AGENT_UID", "0"))
        if not base_url or not app_id:
            raise HTTPException(status_code=500, detail="Missing AGORA_CONVO_AI_BASE_URL or AGORA_APP_ID")

        channel = body.channelName or f"ai-conversation-{int(datetime.now().timestamp())}"
        token = _generate_agent_token(channel, agent_uid)

        system_prompt = get_system_prompt(body.scenario)

        input_modalities = [s for s in os.getenv("INPUT_MODALITIES", "text").split(",") if s]
        output_modalities = [s for s in os.getenv("OUTPUT_MODALITIES", "text,audio").split(",") if s]

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
                "agent_rtc_uid": str(agent_uid),
                "remote_rtc_uids": [str(body.userId)] if body.userId is not None else [],
                "enable_string_uid": isinstance(body.userId, str),
                "idle_timeout": 30,
                "asr": {"language": "en-US", "task": "conversation"},
                "llm": {
                    "url": os.getenv("LLM_URL"),
                    "api_key": os.getenv("LLM_TOKEN"),
                    "system_messages": [{"role": "system", "content": system_prompt}],
                    "greeting_message": None,
                    "failure_message": "Please wait a moment.",
                    "max_history": 10,
                    "params": {
                        "model": os.getenv("LLM_MODEL"),
                        "max_tokens": 150,
                        "temperature": 0.7,
                        "top_p": 0.95,
                    },
                    "input_modalities": input_modalities,
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

        async with httpx.AsyncClient() as client:
            auth_header = f"Basic {_basic_credentials()}"
            resp = await client.post(
                f"{base_url}/{app_id}/join",
                json=request_body,
                headers={"Content-Type": "application/json", "Authorization": auth_header},
            )
            resp.raise_for_status()
            data = resp.json()
            session_id = data.get("agent_id") or data.get("id")
            if not session_id:
                raise HTTPException(status_code=500, detail="Missing agent_id in Agora response")
            return StartSessionResponse(
                sessionId=str(session_id),
                agentUid=agent_uid,
                channelName=channel,
                status="active",
            )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
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
