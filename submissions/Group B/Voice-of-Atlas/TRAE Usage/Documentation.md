# Voice of Atlas / VoiceGIS — Documentation (Trae IDE)

This document describes the **Trae IDE** usage and all features implemented for the Agora Voice AI Hackathon Manila 2026. The project was **created from scratch** with Trae IDE: scaffoldings, configuration, APIs, and UI were built and iterated on using Trae.

---

## Submission compliance with main README

This submission fulfills the [main hackathon README](../../README.md) requirements:

| Required technology | Implementation |
|---------------------|----------------|
| **Agora RTC SDK** | Real-time audio channel for voice mode; token and join via `/api/agora/token` and Agora RTC client in the frontend. |
| **Agora Conversational AI Engine** | Voice mode uses Agora Conversational AI (ASR → LLM → TTS). Join config sent via `/api/agora/join`; ElevenLabs TTS and OpenRouter (or custom LLM proxy) configured in the join payload. |
| **TRAE IDE** | Entire project created and developed with TRAE IDE; this folder (`TRAE Usage`) contains the usage and feature documentation. |

Folder structure aligns with the submission guidelines: `README.md`, `TRAE Usage/`, `Source Code/`, and optional `Deck & Demo/`.

---

## Project Overview

**Voice of Atlas** (VoiceGIS) is a map-centric assistant that supports both **chat** and **voice** modes. Users can search locations, show amenities and traffic incidents, zoom and reset the map via natural language in the chat bar or by saying **"Hey Atlas"** followed by a command.

- **Stack:** Next.js (App Router), React, Leaflet, Geoapify, OpenRouter / Ollama, Agora Conversational AI, ElevenLabs, TomTom Traffic API, OpenStreetMap Overpass API.
- **Scaffolding:** All project structure, dependencies, environment templates, and API routes were set up and maintained using Trae IDE.

---

## Features Implemented with Trae IDE

### 1. Core scaffold and configuration

- Next.js app with App Router, TypeScript, and Tailwind CSS.
- Map UI (Leaflet) with `MapProvider` and dynamic import for SSR-safe rendering.
- Bottom bar with chat/voice toggle, input, send button, and microphone.
- Zoom In / Zoom Out / Reset map controls.
- Location search bar (Geoapify autocomplete) and integration with the map.
- Environment setup: `.env.example` and `.env.local` for all API keys (Geoapify, OpenRouter, Agora, ElevenLabs, TomTom, optional local LLM and Agora LLM proxy).

### 2. Chat mode

- Text input with send; messages displayed in an expandable area.
- **LLM:** OpenRouter (e.g. `google/gemma-3n-e4b-it:free`) or **local Ollama** when `USE_LOCAL_LLM=true` (`LOCAL_LLM_URL`, `LOCAL_LLM_MODEL`).
- Rate-limit handling (e.g. 429) with clear error messages and comments in `/api/chat` and `atlas-llm.ts`.
- Chat uses `/api/chat` only; Agora is not involved in chat.

### 3. Voice mode — Agora path

- **Agora Conversational AI** as the voice orchestrator: STT → agent LLM → TTS.
- Join flow: `/api/agora/token` and `/api/agora/join`; join payload configures ASR (e.g. `en-US`), **ElevenLabs TTS** (configurable `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`), and LLM (OpenRouter or **custom LLM proxy** for local Ollama when `AGORA_LLM_PROXY_URL` is set).
- Optional **LLM proxy** at `/api/agora/llm-proxy` so Agora can call a local Ollama instance via a tunnel (e.g. ngrok).

### 4. Voice mode — browser fallback

- When Agora is unavailable or join fails: browser **Web Speech API** for STT (`SpeechRecognition`) and TTS (`SpeechSynthesis`).
- **Preferred TTS voice** selection (`getPreferredTtsVoice`, `setUtteranceVoice`) for more natural-sounding responses (e.g. Samantha, Google US English).
- All short confirmations (zoom, location, reset, amenities, traffic incidents) use this preferred voice when on the browser path.

### 5. Wake word and robust command capture

- Commands are only processed after **"Hey Atlas"** (or **"Okay Atlas"**, **"Atlas"**).
- **Wake word anywhere in transcript:** Trae IDE was used to implement logic that finds the wake word **anywhere** in the captured audio (not only at the start), so phrases like *"noise … hey atlas zoom in"* still work. The **last** occurrence of the wake word is used so the most recent intent is executed.
- Transcript is normalized (e.g. collapse spaces) before parsing.

### 6. Map commands (chat and voice)

All of the following work in **both chat and voice** (voice requires the wake word first).

- **Zoom in / zoom out:** Parsed via `parseZoomCommand` (supports e.g. "by 30%"); map zoom level updated; TTS confirms (e.g. "Zoomed in.").
- **Reset map:** `parseResetCommand`; clears marker, amenity markers, traffic incident markers, and search; resets view to default; TTS confirms "Map reset."
- **Search / show location:** `parseLocationCommand` extracts a place query; Geoapify geocodes it; map flies to the location and shows a **single yellow marker**; search bar is updated; TTS confirms (e.g. "Showing Manila on the map.").
- **Show amenities in a place:** `parseAmenityCommand` for phrases like *"show health facilities in the Philippines"*, *"can you show police stations in Quezon City"*. Supports:
  - **Natural phrasing:** "can you show … in …", "could you show … in …", "please show … in …".
  - **Place normalization:** Leading *"the"* is stripped (e.g. "the philippines" → "philippines") for better geocoding.
- **Show traffic incidents:** `parseTrafficIncidentsCommand` (e.g. "show traffic incidents", "traffic incidents"). Uses the **current map bounding box**; calls TomTom Traffic Incidents API; displays **red markers** with optional popup (description or category). Bbox is clamped to stay within TomTom’s area limit (e.g. 9,000 km²) to avoid 400 errors.

### 7. Amenities (OSM Overpass)

- **API:** `/api/overpass/amenities` — geocodes the place with Geoapify, then queries **OpenStreetMap Overpass** for nodes/ways with the requested amenity in that bbox.
- **Amenity types:** health facilities (hospital, clinic, pharmacy, doctors), police, schools, restaurants, banks, pharmacies, fuel, parking, etc. Mapped in `AMENITY_PHRASE_TO_KEY` and backend `AMENITY_OSM`.
- **Map:** Up to 300 results shown as **blue circular markers**; popups show name when available; map **fitBounds** (or setView for a single result).
- **Large areas:** Bbox from Geoapify is clamped (e.g. max ~2° per side) so Overpass does not timeout for large regions (e.g. country-level).

### 8. Traffic incidents (TomTom)

- **API:** `/api/tomtom/traffic-incidents` — accepts `south, west, north, east` (current map bounds); calls **TomTom Traffic API v5** Incident Details; returns incidents as markers.
- **Map:** **Red circular markers**; popup shows description or category label (Accident, Jam, Road works, etc.).
- **Robustness:** Bbox area is capped (e.g. 9,000 km²) so requests stay under TomTom’s 10,000 km² limit; request built with `URLSearchParams`; language `en-GB`; minimal `fields` for compatibility (e.g. evaluation keys).

### 9. Status and UX

- **Voice status:** UI indicates "Listening…", "Atlas is processing…", "Atlas is speaking…" (`voiceProcessing`, `atlasSpeaking`).
- **Continuous listening:** In voice mode, when recognition ends, it restarts (with a short delay) so the user can keep speaking without pressing the mic again.
- **Faster response for map commands:** Interim transcripts can trigger zoom/location/reset/amenities/traffic after a short delay (e.g. 380 ms) so the user doesn’t have to wait for the final result; `lastProcessedTranscriptRef` avoids running the same command twice.
- **Error handling:** Clear messages for network/recognition errors, rate limits, and API failures (Geoapify, Overpass, TomTom, Agora).

### 10. Map and markers

- **Single location:** Yellow pin (Geoapify result).
- **Amenities:** Blue markers (Overpass); optional popup with name.
- **Traffic incidents:** Red markers (TomTom); optional popup with description or category.
- **Fit bounds:** When showing multiple amenity or traffic markers, the map fits bounds (or setView for one point) so all markers are visible.

---

## File and API Summary (Trae IDE)

| Area | Path / API | Purpose |
|------|------------|--------|
| Map | `components/Map.tsx`, `MapProvider.tsx` | Leaflet map, markers, fitBounds |
| Chat/Voice bar | `components/ChatBar.tsx` | Toggle, input, send, mic, wake word, command parsers, TTS |
| Location search | `components/LocationSearchBar.tsx` | Geoapify autocomplete, map sync |
| Page | `app/page.tsx` | State, handlers (location, amenities, traffic, reset), layout |
| Chat API | `app/api/chat/route.ts` | OpenRouter or local Ollama, 429 handling |
| Agora | `app/api/agora/join/route.ts`, `token/route.ts`, `llm-proxy/route.ts` | Join config (ASR, TTS, LLM), token, optional Ollama proxy |
| Amenities | `app/api/overpass/amenities/route.ts` | Geoapify → bbox clamp → Overpass → markers |
| Traffic | `app/api/tomtom/traffic-incidents/route.ts` | Bbox clamp → TomTom Incident Details → markers |
| LLM config | `lib/atlas-llm.ts` | `getChatConfig`, OpenRouter vs local, Atlas context |

---

## Environment Variables (from Trae IDE setup)

Documented in `.env.example` and used in the app:

- **Geoapify:** `NEXT_PUBLIC_GEOAPIFY_API_KEY` — location search and amenities geocoding.
- **LLM:** `OPENROUTER_API_KEY`; optional `USE_LOCAL_LLM`, `LOCAL_LLM_URL`, `LOCAL_LLM_MODEL`; optional `AGORA_LLM_PROXY_URL` for voice with local Ollama.
- **Agora:** `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`, `NEXT_PUBLIC_AGORA_APP_ID`, `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`.
- **ElevenLabs:** `ELEVENLABS_API_KEY`; optional `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`.
- **TomTom:** `TOMTOM_API_KEY` — traffic incidents in the current map view.

---

## References (used during Trae IDE development)

- Agora Conversational AI: [Product overview](https://docs.agora.io/en/conversational-ai/overview/product-overview), [REST join](https://docs.agora.io/en/conversational-ai/rest-api/join).
- TomTom Traffic Incidents: [Incident Details](https://developer.tomtom.com/traffic-api/documentation/traffic-incidents/incident-details), bbox limit 10,000 km².
- OpenStreetMap Overpass: [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API); amenity tags for health, police, etc.

---

*This project was created from scratch and all scaffoldings, features, and integrations described above were implemented using **Trae IDE**.*
