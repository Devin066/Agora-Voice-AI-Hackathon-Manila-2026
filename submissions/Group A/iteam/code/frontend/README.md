# VisionVoice Frontend

VisionVoice is a webcam-based smart-glasses simulator for assistive scene awareness.
This frontend is built with React, TypeScript, and Vite and currently includes:

- patient full-screen camera view
- contact person dashboard
- local object detection with `@tensorflow-models/coco-ssd`
- loved-one registration and recognition with `@vladmandic/face-api`
- local Gemini + ElevenLabs testing through the backend
- Agora RTC camera/audio transport for the hackathon flow

## Project Layout

- `frontend/`: React + Vite app
- `../backend/`: FastAPI bridge for Gemini and ElevenLabs

## Frontend Env

The frontend `.env` should only contain client-safe values:

```env
VITE_AGORA_APP_ID=...
VITE_AGORA_CHANNEL=...
VITE_AGORA_TOKEN=...
VITE_LOCAL_AI_BASE_URL=http://localhost:8000
VITE_ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
```

Do not place Gemini or ElevenLabs secret keys in the frontend env.

## Backend Env

Create `../backend/.env` from `../backend/.env.example` and fill in:

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
```

## Run Locally

### 1. Start the backend

From `code/backend`:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start the frontend

From `code/frontend`:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Test Flow

### Contact dashboard

- register loved ones from a camera photo
- ask the local AI for a scene reply
- hear ElevenLabs speech through the backend

### Patient view

- full-screen camera
- smart assistive auto-speech for important updates
- duplicate speech suppressed to reduce noise

## Current Priority

The vision and UI layers are mostly in place.
The main remaining integration risk is the final Agora voice-agent behavior.
