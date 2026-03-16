from pydantic import BaseModel
from typing import List, Optional, Union

class InviteAgentRequest(BaseModel):
    requester_id: Union[str, int]
    channel_name: str
    rtc_codec: Optional[int] = None
    input_modalities: Optional[List[str]] = None
    output_modalities: Optional[List[str]] = None

class RemoveAgentRequest(BaseModel):
    agent_id: str