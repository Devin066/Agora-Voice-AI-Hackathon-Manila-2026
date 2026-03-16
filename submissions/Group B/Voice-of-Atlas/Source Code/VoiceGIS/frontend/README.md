# Voice of Atlas — Frontend (VoiceGIS)

Next.js app for **Voice of Atlas**: map-centric chat and voice assistant (Agora Voice AI Hackathon Manila 2026). For submission overview and folder structure, see the [team README](../../../README.md).

---

## Getting started

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. Do not commit `.env.local`.

| Variable | Required for | Description |
|----------|--------------|-------------|
| `NEXT_PUBLIC_GEOAPIFY_API_KEY` | Chat, voice, amenities | [Geoapify](https://www.geoapify.com/) — location search and geocoding for amenities. |
| `OPENROUTER_API_KEY` | Chat, voice (cloud) | [OpenRouter](https://openrouter.ai/keys) — LLM (e.g. Gemma 3n). |
| `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `NEXT_PUBLIC_AGORA_APP_ID` | Voice (Agora) | [Agora Console](https://console.agora.io/) — project credentials. |
| `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET` | Voice (Agora) | Agora Console → Developer Toolkit → RESTful API → Add secret (download once). |
| `ELEVENLABS_API_KEY` | Voice (Agora) | [ElevenLabs](https://elevenlabs.io/) — TTS for Agora voice agent. |
| `TOMTOM_API_KEY` | Traffic incidents | [TomTom](https://developer.tomtom.com/) — traffic incidents in current map view. |

Optional: `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`; `USE_LOCAL_LLM`, `LOCAL_LLM_URL`, `LOCAL_LLM_MODEL`; `AGORA_LLM_PROXY_URL` (see [VOICE_CHAT_SETUP](../VOICE_CHAT_SETUP.md)).

---

## Local LLM (unlimited chat, no OpenRouter quota)

1. Install [Ollama](https://ollama.com) and run:
   ```bash
   ollama run gemma3:4b
   ```
2. In `.env.local` set:
   ```bash
   USE_LOCAL_LLM=true
   ```
   Optionally: `LOCAL_LLM_URL=http://localhost:11434/v1/chat/completions`, `LOCAL_LLM_MODEL=gemma3:4b` (defaults).

Chat will use your local model with no rate limit.

**Voice with local LLM:** Agora must reach your LLM. Use a tunnel and set `AGORA_LLM_PROXY_URL`:

1. Run the app (`npm run dev`) and Ollama (`ollama run gemma3:4b`).
2. Run a tunnel (e.g. [ngrok](https://ngrok.com)): `ngrok http 3000`
3. In `.env.local`: `AGORA_LLM_PROXY_URL=https://YOUR-TUNNEL-URL.ngrok.io/api/agora/llm-proxy`
4. Restart the dev server.

---

## Commands (chat and voice)

- **Chat:** Type in the bar and send. Voice: say **"Hey Atlas"** then the command.
- **Location:** "Show Manila on the map", "Search for Quezon City", "Pin Pasig".
- **Amenities:** "Show health facilities in the Philippines", "Can you show police stations in Quezon City".
- **Traffic incidents:** "Show traffic incidents" (uses current map view; zoom in if needed).
- **Map:** "Zoom in", "Zoom out", "Reset the map".

---

## Compliance with hackathon README

This project integrates the **required technologies**:

- **Agora RTC SDK** — real-time audio channel for voice mode.
- **Agora Conversational AI Engine** — voice agent (ASR → LLM → TTS) when Agora credentials are set.
- **TRAE IDE** — used for development and documentation; see [TRAE Usage → Documentation](../../../TRAE%20Usage/Documentation.md).

---

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Agora Conversational AI](https://docs.agora.io/en/conversational-ai/overview/product-overview)
- [TRAE IDE](https://trae.ai/)
