# Clara Voice Coach (Source Code)

Clara is a real-time AI voice coaching app built for the Agora Voice AI Hackathon Manila 2026.

This source folder contains:
- An iOS app (`Clara/`) for live speaking practice, on-device speech metrics, and Agora RTC voice streaming
- A Python FastAPI backend (`api/`) that generates Agora tokens and starts/stops Agora ConvoAI agents

## What Clara Does

Users pick a speaking scenario and start a live session:
- Public Speaking
- Job Interview
- Debate
- English Fluency

During a session, the iOS app tracks speaking metrics (pitch, pace, filler words, and pause behavior) while the AI voice agent joins the same Agora channel and gives spoken coaching feedback.

## Repository Layout

```text
Source Code/
	README.md
	api/                 # FastAPI backend for token + session orchestration
	Clara/               # iOS app + Dynamic Island widget target
	docs/                # PRD, requirements, and reference docs
```

## System Architecture

1. iOS app calls backend REST APIs:
	 - `POST /token/generate`
	 - `POST /session/start`
	 - `POST /session/stop`
2. Backend provisions token and starts/stops the ConvoAI agent.
3. iOS app and AI agent exchange audio directly through Agora RTC.

Important: the backend is orchestration-only and is not in the live audio media path.

## Prerequisites

### Backend
- Python 3.11+ (project uses Python dependencies compatible with 3.12)
- pip
- Agora project credentials
- LLM provider credentials (OpenAI-compatible endpoint)
- TTS provider credentials (`microsoft` or `elevenlabs`)

### iOS
- macOS + Xcode 15+
- iOS 17+ device recommended for full Live Activity / Dynamic Island flow
- Valid `AGORA_APP_ID` configured in app runtime settings

## Backend Setup (Local)

From `Source Code/api`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` in `api/` using the template below.

```env
# Agora
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
AGORA_CUSTOMER_ID=your_agora_customer_id
AGORA_CUSTOMER_SECRET=your_agora_customer_secret
AGORA_CONVO_AI_BASE_URL=https://api.agora.io/api/conversational-ai-agent/v2/projects
AGENT_UID=10001

# LLM
LLM_STYLE=openai
LLM_MODEL=gemini-2.0-flash
LLM_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
LLM_TOKEN=your_llm_api_token
OUTPUT_MODALITIES=text,audio

# TTS (choose one vendor)
TTS_VENDOR=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_SAMPLE_RATE=24000

# OR Microsoft TTS
# TTS_VENDOR=microsoft
# MICROSOFT_TTS_KEY=your_microsoft_tts_key
# MICROSOFT_TTS_REGION=your_region
# MICROSOFT_TTS_VOICE_NAME=en-US-JennyNeural
# MICROSOFT_TTS_RATE=1.0
# MICROSOFT_TTS_VOLUME=100.0
```

Run backend:

```bash
python main.py
```

Default local URL: `http://0.0.0.0:8000`

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## API Endpoints

### `GET /health`
Returns server health and UTC timestamp.

### `POST /token/generate`
Generates an Agora RTC token.

Request:

```json
{
	"channelName": "optional-channel",
	"uid": 0
}
```

Response fields:
- `appId`
- `token`
- `channelName`
- `uid`
- `expiresAt`

### `POST /session/start`
Starts ConvoAI agent for a scenario.

Request:

```json
{
	"channelName": "optional-channel",
	"scenario": "public_speaking",
	"userId": 123
}
```

Allowed `scenario` values:
- `public_speaking`
- `job_interview`
- `debate`
- `english_fluency`

Response fields:
- `sessionId`
- `agentUid`
- `channelName`
- `status`

### `POST /session/stop`
Stops an active ConvoAI session.

Request:

```json
{
	"sessionId": "your-session-id",
	"channelName": "optional-channel"
}
```

Response fields:
- `sessionId`
- `status`
- `stoppedAt`

## iOS App Setup

1. Open `Clara/Clara.xcodeproj` in Xcode.
2. Ensure Swift Package dependencies are resolved.
3. Configure runtime values:
	 - Add `AGORA_APP_ID` to app target Info settings (or launch environment).
	 - Ensure `APIClient.baseURL` points to your backend (default is a LAN address in `APIClient.swift`).
4. Build and run on device.

When testing with a local backend from a physical iPhone, use your Mac's LAN IP for `APIClient.baseURL`.

## Key Implementation Notes

- Backend uses FastAPI + Uvicorn.
- Token generation uses `agora-token-builder`.
- Session orchestration is in `api/routes/session.py`.
- Scenario prompts are in `api/prompts/`.
- iOS voice/session coordination is handled by `VoiceSessionCoordinator` and `AgoraVoiceService`.

## Docker (Backend)

The backend includes a Dockerfile designed for AWS Lambda Web Adapter deployment.

Build locally:

```bash
docker build -t clara-api ./api
```

## Security Notes

- Do not commit real credentials to source control.
- Rotate keys immediately if secrets were ever exposed.
- Prefer `.env` for local development and managed secrets in cloud deployment.

## Troubleshooting

- `500 Agora credentials are not set`:
	Verify `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` in `api/.env`.
- Agent starts then exits quickly:
	Verify LLM and TTS credentials and model IDs.
- iOS app cannot connect to backend:
	Check `APIClient.baseURL`, local network reachability, and CORS settings.
- Missing or invalid `AGORA_APP_ID` on iOS:
	Add key to target Info and rebuild.

## License

Hackathon project code for team submission. Add your preferred license if publishing beyond the event.
