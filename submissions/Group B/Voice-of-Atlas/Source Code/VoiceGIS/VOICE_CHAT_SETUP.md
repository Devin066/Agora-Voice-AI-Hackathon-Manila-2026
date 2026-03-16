# Voice & Chat Setup (Voice of Atlas)

This document covers credentials and setup for **chat** and **voice** modes. The project complies with the [hackathon README](../../README.md) required technologies (Agora RTC, Agora Conversational AI, TRAE IDE). For full feature and TRAE IDE documentation, see [TRAE Usage → Documentation](../../TRAE%20Usage/Documentation.md).

---

## 1. Add credentials to `frontend/.env.local`

Copy `frontend/.env.example` to `frontend/.env.local` and fill in values. Do **not** commit `.env.local` (it is gitignored).

### Required for chat

```env
# Geoapify – location search and amenities geocoding (https://www.geoapify.com/)
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key

# OpenRouter – LLM (https://openrouter.ai/keys). Model: google/gemma-3n-e4b-it:free
OPENROUTER_API_KEY=sk-or-v1-...
```

### Required for voice (Agora path)

```env
# Agora – from https://console.agora.io/ (Project → App ID, Primary Certificate)
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_primary_certificate
NEXT_PUBLIC_AGORA_APP_ID=your_app_id

# Agora REST API – required for starting the voice agent
# Console → Developer Toolkit → RESTful API → “Add a secret” → download key_and_secret.txt once
AGORA_CUSTOMER_ID=your_customer_id
AGORA_CUSTOMER_SECRET=your_customer_secret

# ElevenLabs – TTS for Agora voice (https://elevenlabs.io/)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Optional

```env
# TomTom – traffic incidents in current map view (https://developer.tomtom.com/)
TOMTOM_API_KEY=your_tomtom_key

# Local LLM – Ollama (unlimited chat; set USE_LOCAL_LLM=true)
USE_LOCAL_LLM=false
LOCAL_LLM_URL=http://localhost:11434/v1/chat/completions
LOCAL_LLM_MODEL=gemma3:4b
# Voice with local LLM – set to your tunnel URL + /api/agora/llm-proxy
AGORA_LLM_PROXY_URL=

# ElevenLabs – optional voice/model override
# ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
# ELEVENLABS_MODEL_ID=eleven_flash_v2_5
```

- **Chat mode** works with `NEXT_PUBLIC_GEOAPIFY_API_KEY` and `OPENROUTER_API_KEY`.
- **Voice mode (Agora)** needs all Agora vars plus `ELEVENLABS_API_KEY`. Without REST credentials, the “Start voice” button will show an error asking for `AGORA_CUSTOMER_ID` and `AGORA_CUSTOMER_SECRET`.
- **Traffic incidents** require `TOMTOM_API_KEY`; zoom in on the map if the view is large to avoid API bbox limits.

---

## 2. Agora RESTful API (for voice)

1. Go to [Agora Console](https://console.agora.io/).
2. Open **Developer Toolkit** → **RESTful API**.
3. Click **Add a secret** and confirm.
4. Download the generated `key_and_secret.txt` (you can only do this once).
5. Put **Customer ID** and **Customer Secret** into `AGORA_CUSTOMER_ID` and `AGORA_CUSTOMER_SECRET` in `frontend/.env.local`.

---

## 3. Run the app

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Chat (left toggle):** Type in the bar and press Enter or Send. Supports location search, amenities (“show health facilities in the Philippines”), traffic incidents (“show traffic incidents”), zoom, and reset. Replies use OpenRouter (or local Ollama if `USE_LOCAL_LLM=true`).
- **Voice (right toggle):** Click the mic, say **“Hey Atlas”** then your command. Uses Agora Conversational AI (ASR → LLM → ElevenLabs TTS) when credentials are set; otherwise falls back to browser speech recognition and synthesis.

---

## Documentation

- [Team README](../../README.md) — project overview and submission structure
- [TRAE Usage → Documentation](../../TRAE%20Usage/Documentation.md) — TRAE IDE usage and all features
- [Frontend README](frontend/README.md) — app setup and env reference
