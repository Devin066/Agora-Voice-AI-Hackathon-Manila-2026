# Voice of Atlas (VoiceGIS)

**Agora Voice AI Hackathon Manila 2026 — Group B**

Voice of Atlas is a **map-centric voice and chat assistant** that lets you search locations, show health facilities and other amenities, view traffic incidents, and control the map (zoom, reset) using natural language—via **chat** or **voice** with the wake phrase **"Hey Atlas"**.

---

## Submission compliance with main README

This submission follows the repository structure and requirements from the [main README](../../README.md):

| Requirement | Implementation |
|-------------|----------------|
| **Agora RTC SDK** | Used for real-time audio in voice mode (channel join, token). |
| **Agora Conversational AI Engine** | Voice mode uses Agora Conversational AI (ASR → LLM → TTS) when credentials are set. |
| **TRAE IDE** | Project created from scratch and developed with TRAE IDE; see **[TRAE Usage](./TRAE%20Usage/Documentation.md)** for full documentation. |

### Folder structure

```text
submissions/Group B/Voice-of-Atlas/
├── README.md                 ← this file (project overview, setup, usage)
├── TRAE Usage/
│   └── Documentation.md     ← TRAE IDE usage and feature documentation
├── Source Code/
│   └── VoiceGIS/
│       ├── frontend/         ← Next.js app (run from here)
│       │   ├── README.md     ← App-level setup and run instructions
│       │   └── .env.example  ← Environment variables template
│       └── VOICE_CHAT_SETUP.md ← Voice & chat credentials and Agora setup
└── Deck & Demo/              ← (optional) Demo video or screenshots
```

---

## What it does

- **Chat mode:** Type commands or questions; Atlas replies via OpenRouter (or local Ollama). Supports location search, amenities, traffic incidents, zoom, and reset.
- **Voice mode:** Say **"Hey Atlas"** then a command (e.g. *"show health facilities in the Philippines"*, *"show traffic incidents"*, *"zoom in"*, *"reset the map"*). Uses Agora Conversational AI (ElevenLabs TTS) or browser fallback (Web Speech API).
- **Map:** Leaflet map with Geoapify search, single-location pin (yellow), amenity markers (blue, OSM Overpass), and traffic incident markers (red, TomTom).

---

## Setup and run

### Prerequisites

- Node.js 18+
- (Optional) [Ollama](https://ollama.com) for local LLM
- API keys: Geoapify, OpenRouter and/or Agora + ElevenLabs (+ optional TomTom for traffic incidents)

### Quick start

1. **Clone** the repo and go to the frontend:
   ```bash
   cd "submissions/Group B/Voice-of-Atlas/Source Code/VoiceGIS/frontend"
   ```

2. **Install and configure env:**
   ```bash
   npm install
   cp .env.example .env.local
   ```
   Edit `.env.local` with your keys. Minimum for **chat**: `NEXT_PUBLIC_GEOAPIFY_API_KEY`, `OPENROUTER_API_KEY`. For **voice**: add Agora and ElevenLabs vars (see [VOICE_CHAT_SETUP.md](./Source%20Code/VoiceGIS/VOICE_CHAT_SETUP.md)).

3. **Run:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### Special instructions

- **Voice mode** requires `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `NEXT_PUBLIC_AGORA_APP_ID`, `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`, and `ELEVENLABS_API_KEY`. Get Agora REST credentials from [Agora Console](https://console.agora.io/) → Developer Toolkit → RESTful API.
- **Traffic incidents:** Set `TOMTOM_API_KEY` in `.env.local` (TomTom Traffic Incidents API). If the map view is very large, zoom in so the requested area stays under the API limit.
- **Local LLM:** Set `USE_LOCAL_LLM=true` and run Ollama. For voice with local LLM, set `AGORA_LLM_PROXY_URL` to your tunnel URL (e.g. ngrok) + `/api/agora/llm-proxy`.

---

## Documentation

- **[TRAE Usage → Documentation.md](./TRAE%20Usage/Documentation.md)** — TRAE IDE usage, features implemented, APIs, and env vars.
- **[Source Code → VoiceGIS/frontend/README.md](./Source%20Code/VoiceGIS/frontend/README.md)** — App setup, scripts, and local LLM.
- **[Source Code → VoiceGIS/VOICE_CHAT_SETUP.md](./Source%20Code/VoiceGIS/VOICE_CHAT_SETUP.md)** — Voice and chat credentials (Agora, OpenRouter, ElevenLabs).

---

## Demo

For demo video or screenshots, add them under `Deck & Demo/` (or link from here).

---

*Built with TRAE IDE for Agora Voice AI Hackathon Manila 2026.*
