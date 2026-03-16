from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
import os
from datetime import datetime, timezone
import random
import string

router = APIRouter(prefix="/token", tags=["token"])
MAX_CHANNEL_BYTES = 64

class TokenResponse(BaseModel):
    token: str
    channelName: str
    uid: int
    expiresAt: str

class TokenRequest(BaseModel):
    channelName: str | None = None
    uid: int | None = 0

    @field_validator("channelName")
    @classmethod
    def validate_channel_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if len(value.encode("utf-8")) > MAX_CHANNEL_BYTES:
            raise ValueError(f"channelName must be within {MAX_CHANNEL_BYTES} bytes")
        return value

def generate_channel_name() -> str:
    timestamp = int(datetime.now().timestamp())
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"ai-conversation-{timestamp}-{random_str}"

@router.post("/generate", response_model=TokenResponse)
async def generate_token_post(body: TokenRequest):
    try:
        from agora_token_builder import RtcTokenBuilder  # lazy import
    except Exception:
        raise HTTPException(status_code=500, detail="agora-token-builder is not installed")

    if not os.getenv("AGORA_APP_ID") or not os.getenv("AGORA_APP_CERTIFICATE"):
        raise HTTPException(status_code=500, detail="Agora credentials are not set")

    channel_name = body.channelName or generate_channel_name()
    uid = int(body.uid or 0)
    expiration_time = int(datetime.now().timestamp()) + 3600

    try:
        token = RtcTokenBuilder.buildTokenWithUid(
            appId=os.getenv("AGORA_APP_ID"),
            appCertificate=os.getenv("AGORA_APP_CERTIFICATE"),
            channelName=channel_name,
            uid=uid,
            role=1,
            privilegeExpiredTs=expiration_time
        )
        return TokenResponse(
            token=token,
            uid=uid,
            channelName=channel_name,
            expiresAt=datetime.fromtimestamp(expiration_time, tz=timezone.utc).isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Agora token: {str(e)}")
