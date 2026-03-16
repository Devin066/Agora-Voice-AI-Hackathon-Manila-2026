# Agora Voice AI Setup

## Can this app use Agora Voice AI?

Yes.

This app can use Agora for real-time voice transport while your AI agent runs through Agora Conversational AI infrastructure.

The recommended path is to run the official sample backend from Agora and connect this frontend to it.

## Architecture

1. This frontend handles scenario selection, resume/JD upload, and AI brain context.
2. Your backend AI brain handles analysis and feedback.
3. Agora backend handles token generation and agent orchestration.
4. Client and agent join the same channel through Agora SD-RTN.

## 1) Run Agora sample backend

Use the official repository:

- https://github.com/AgoraIO-Conversational-AI/agent-samples

Read `AGENT.md` in that repository and run the backend sample.

Required env in the Agora sample backend:

- `APP_ID`
- `APP_CERTIFICATE`
- Then either:
  - `PIPELINE_ID` (Agent Builder mode), or
  - provider keys for inline mode (LLM/TTS/ASR)

## 2) Keep this app backend running

This project still uses `server/brainServer.js` for:

- resume/JD analysis
- scenario-specific question generation
- end-of-session feedback

Run:

```bash
npm run brain
```

## 3) Add env in this project

Create/update `.env`:

```env
ANTHROPIC_API_KEY=your_key
AI_BRAIN_PORT=8787

VITE_VOICE_RUNTIME=agora
VITE_AGORA_APP_ID=your_agora_app_id
VITE_AGORA_SAMPLE_BACKEND_URL=http://localhost:8082
VITE_AGORA_AGENT_START_PATH=/start-agent
VITE_AGORA_AGENT_STOP_PATH=/hangup-agent
VITE_AGORA_PROFILE=VOICE
```

`VITE_AGORA_SAMPLE_BACKEND_URL` should point to the running Agora sample backend.

If your Agora backend uses different route names, override:

- `VITE_AGORA_AGENT_START_PATH`
- `VITE_AGORA_AGENT_STOP_PATH`

The app also includes endpoint auto-detection and will try common alternatives:

- Start: `/start-agent`, `/api/session/start`, `/api/agent/start`, `/api/agents/start`, `/session/start`
- Stop: `/hangup-agent`, `/api/session/stop`, `/api/agent/stop`, `/api/agents/stop`, `/session/stop`, `/stop-agent`

## 4) Start frontend

```bash
npm run dev
```

## 5) Session flow

1. Pick scenario.
2. Upload resume + JD.
3. AI brain builds tailored prompts/questions.
4. Start session.
5. Voice session runs through Agora transport.
6. End session to receive AI summary, strengths, tips, and keynotes.

## Notes

- If Agora runtime is not configured, app falls back to native browser speech + ElevenLabs TTS.
- Keep your `APP_CERTIFICATE` and provider keys server-side only.
