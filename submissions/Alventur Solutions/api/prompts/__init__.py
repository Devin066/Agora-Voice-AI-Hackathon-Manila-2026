from enum import Enum

class Scenario(str, Enum):
    public_speaking = "public_speaking"
    job_interview = "job_interview"
    debate = "debate"
    english_fluency = "english_fluency"

def get_system_prompt(scenario: str) -> str:
    if scenario == Scenario.public_speaking:
        from .public_speaking import SYSTEM_PROMPT
        return SYSTEM_PROMPT
    if scenario == Scenario.job_interview:
        from .job_interview import SYSTEM_PROMPT
        return SYSTEM_PROMPT
    if scenario == Scenario.debate:
        from .debate import SYSTEM_PROMPT
        return SYSTEM_PROMPT
    if scenario == Scenario.english_fluency:
        from .english_fluency import SYSTEM_PROMPT
        return SYSTEM_PROMPT
    raise ValueError("Unsupported scenario")
