from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Union
from class_types.agora_convo_ai_types import TTSVendor, TTSConfig, AgentResponse
from class_types.client_request_types import InviteAgentRequest, RemoveAgentRequest
import os
import httpx
from datetime import datetime
import random
import string
import base64
import time

router = APIRouter(prefix="/agent", tags=["agent"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def generate_unique_name() -> str:
    timestamp = int(time.time() * 1000)
    random_string = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=6))
    return f"conversation-{timestamp}-{random_string}"

def generate_channel_name() -> str:
    timestamp = int(datetime.now().timestamp())
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"conversation-{timestamp}-{random_str}"

def generate_credentials() -> str:
    customer_id = str(os.getenv("AGORA_CUSTOMER_ID"))
    customer_secret = str(os.getenv("AGORA_CUSTOMER_SECRET"))
    credentials = f"{customer_id}:{customer_secret}"
    base64_credentials = base64.b64encode(credentials.encode("utf8"))
    return base64_credentials.decode("utf8")

async def _generate_token_(uid: int, channel: str) -> str:
    try:
        from agora_token_builder import RtcTokenBuilder  # lazy import
    except Exception:
        raise HTTPException(status_code=500, detail="agora-token-builder is not installed")
    if not os.getenv("AGORA_APP_ID") or not os.getenv("AGORA_APP_CERTIFICATE"):
        raise HTTPException(status_code=500, detail="Agora credentials are not set")

    expiration_time = int(datetime.now().timestamp()) + 3600

    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            appId=os.getenv("AGORA_APP_ID"),
            appCertificate=os.getenv("AGORA_APP_CERTIFICATE"),
            channelName=channel,
            uid=uid,
            role=1,
            privilegeExpiredTs=expiration_time
        )
        return token
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Agora token: {str(e)}")

def get_tts_config(vendor: TTSVendor) -> TTSConfig:
    if vendor == TTSVendor.MICROSOFT:
        required_vars = [
            "MICROSOFT_TTS_KEY", "MICROSOFT_TTS_REGION",
            "MICROSOFT_TTS_VOICE_NAME", "MICROSOFT_TTS_RATE",
            "MICROSOFT_TTS_VOLUME"
        ]
        if any(not os.getenv(var) for var in required_vars):
            raise ValueError("Missing Microsoft TTS environment variables")

        return TTSConfig(
            vendor=vendor,
            params={
                "key": os.getenv("MICROSOFT_TTS_KEY"),
                "region": os.getenv("MICROSOFT_TTS_REGION"),
                "voice_name": os.getenv("MICROSOFT_TTS_VOICE_NAME"),
                "rate": float(os.getenv("MICROSOFT_TTS_RATE", "1.0")),
                "volume": float(os.getenv("MICROSOFT_TTS_VOLUME", "1.0"))
            }
        )

    elif vendor == TTSVendor.ELEVENLABS:
        required_vars = ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL_ID"]
        if any(not os.getenv(var) for var in required_vars):
            raise ValueError("Missing ElevenLabs environment variables")

        return TTSConfig(
            vendor=vendor,
            params={
                "key": os.getenv("ELEVENLABS_API_KEY"),
                "model_id": os.getenv("ELEVENLABS_MODEL_ID"),
                "voice_id": os.getenv("ELEVENLABS_VOICE_ID")
            }
        )

    raise ValueError(f"Unsupported TTS vendor: {vendor}")


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/invite", response_model=AgentResponse)
async def invite_agent(request: InviteAgentRequest):
    try:
        name = generate_unique_name()
        channel_name = request.channel_name or generate_channel_name()
        token = await _generate_token_(uid=os.getenv("AGENT_UID"), channel=channel_name)

        tts_vendor = TTSVendor(os.getenv("TTS_VENDOR"))
        tts_config = get_tts_config(tts_vendor)

        request_body = {
            "name": name,
            "properties": {
                "channel": channel_name,
                "token": token,
                "agent_rtc_uid": os.getenv("AGENT_UID"),
                "remote_rtc_uids": [str(request.requester_id)],
                "enable_string_uid": isinstance(request.requester_id, str),
                "idle_timeout": 30,
                "asr": {
                    "language": "en-US",
                    "task": "conversation"
                },
                "llm": {
                    "url": os.getenv("LLM_URL"),
                    "api_key": os.getenv("LLM_TOKEN"),
                    "system_messages": [{
                        "role": "system",
                        "content": "You are a helpful assistant."
                    }],
                    "greeting_message": "Hello! How can I assist you today?",
                    "failure_message": "Please wait a moment.",
                    "max_history": 10,
                    "params": {
                        "model": os.getenv("LLM_MODEL"),
                        "max_tokens": 1024,
                        "temperature": 0.7,
                        "top_p": 0.95
                    },
                    "input_modalities": request.input_modalities or os.getenv("INPUT_MODALITIES", "text").split(","),
                    "output_modalities": request.output_modalities or os.getenv("OUTPUT_MODALITIES", "text,audio").split(",")
                },
                "tts": tts_config.dict(),
                "vad": {
                    "silence_duration_ms": 480,
                    "speech_duration_ms": 15000,
                    "threshold": 0.5,
                    "interrupt_duration_ms": 160,
                    "prefix_padding_ms": 300
                },
                "advanced_features": {
                    "enable_aivad": False,
                    "enable_bhvs": False
                }
            }
        }

        async with httpx.AsyncClient() as client:
            credential = generate_credentials()
            response = await client.post(
                f"{os.getenv('AGORA_CONVO_AI_BASE_URL')}/{os.getenv('AGORA_APP_ID')}/join",
                json=request_body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Basic {credential}"
                }
            )
            response.raise_for_status()
            return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start conversation: {str(e)}")


@router.post("/remove")
async def remove_agent(request: RemoveAgentRequest):
    try:
        async with httpx.AsyncClient() as client:
            credential = generate_credentials()
            response = await client.post(
                f"{os.getenv('AGORA_CONVO_AI_BASE_URL')}/{os.getenv('AGORA_APP_ID')}/agents/{request.agent_id}/leave",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Basic {credential}"
                }
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove agent: {str(e)}")
