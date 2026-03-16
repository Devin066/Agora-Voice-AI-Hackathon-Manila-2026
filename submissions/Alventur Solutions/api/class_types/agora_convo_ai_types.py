from enum import Enum
from pydantic import BaseModel

class TTSVendor(str, Enum):
    MICROSOFT = "microsoft"
    ELEVENLABS = "elevenlabs"

class TTSConfig(BaseModel):
    vendor: TTSVendor
    params: dict

class AgentResponse(BaseModel):
    agent_id: str
    create_ts: int
    status: str