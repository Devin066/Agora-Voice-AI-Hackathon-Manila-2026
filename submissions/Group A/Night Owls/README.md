# Night Owls — Serene

Serene is a real-time, voice-first “support circle” where you speak once and receive responses from three distinct AI agent personalities:

- **Empath**: emotional validation & warmth
- **Strategist**: practical planning & actionable steps
- **Stoic**: grounded perspective & brief wisdom

The experience is designed to feel like you’re in a shared space with the agents: when an agent speaks, their node lights up in the circle and the app plays their audio with ultra-low latency using Agora RTC.

---

## What You See In The App

### 1) Circle (Main)

The Circle tab is the primary interaction surface.

- **Spatial Circle UI**
  - You are in the center.
  - The three agents sit around you (Empath / Strategist / Stoic).
  - The currently speaking participant is highlighted via pulsing rings and scaling.
- **System Pipeline Panel**
  - Shows a “pipeline” status (Agora link, audio sync, STT, AI, TTS, spatial).
  - In this codebase, the UI fully tracks:
    - **Agora Link** (connected to channel or not)
    - **Audio Sync** (user mic capture started)
  - The remaining flags represent the conceptual end-to-end pipeline that is performed by the AI agent service (speech-to-text → LLM → text-to-speech → publish audio).
- **Transcript Cards**
  - When an AI agent starts publishing audio, a new transcript card is added for that agent (currently a placeholder `"..."` to represent “agent response incoming”).
  - When the app is waiting for the agent response, a “Synthesizing Cognitive Insights…” loading card appears.

### 2) Logs

The Logs tab is the debugging view of the session.

- Records key runtime events such as join status, mic publish/unpublish, and remote agent publish/unpublish.
- Includes a **Save** button to download the full session log as `virtual-circle-logs.txt`.

### 3) Settings (Agent Setup)

The Settings tab documents the three agent personas used by the experience.

- Each agent has:
  - role name
  - voice style description
  - a “system prompt” describing how that agent should behave

---

## How The App Works (End-to-End)

### Architecture Overview

Serene has two main parts:

1) **This UI (web app)** — joins an Agora RTC channel, captures your microphone audio, publishes it, plays incoming audio, and drives the circle UI.
2) **AI Agent side (Agora Conversational AI Engine)** — connects to the same channel as separate participants (one per agent), listens to your audio, generates a response, and publishes synthesized speech back into the channel.

High-level flow:

1. UI joins channel (Agora RTC).
2. You hold-to-talk → UI publishes microphone audio.
3. You release → UI unpublishes mic, switches to “processing”.
4. AI agents detect your speech, generate responses, then publish their audio back to the channel.
5. UI receives agent audio, plays it, highlights the speaking agent in the circle.
6. When agent stops publishing, UI returns to idle state.

### Key Runtime States

The UI uses a simple state machine:

- `idle`: ready to start a new turn
- `recording`: user is holding the Talk button; mic is being published
- `processing`: user released mic; waiting for an AI agent to respond
- `speaking`: an agent is currently publishing audio

### Real-Time Voice With Agora RTC

At startup, the app creates an Agora RTC client and joins the configured channel:

- The UI uses `agora-rtc-sdk-ng` to:
  - `join(APP_ID, CHANNEL, TOKEN)`
  - publish a local microphone audio track
  - subscribe to remote audio tracks from agents

When a remote user publishes audio, the UI:

- subscribes to the audio track
- plays it immediately (`user.audioTrack.play()`)
- checks the remote user’s `uid` to see if it matches any known agent UID
- updates the UI to highlight the correct agent node

When a remote user unpublishes audio, the UI:

- clears the active speaker highlight
- returns the app state to `idle`

### Hold-to-Talk Interaction

The Talk button works like a walkie-talkie:

- **Press/hold**
  - Requests microphone access
  - Creates a microphone track
  - Publishes audio to the channel
  - Samples volume level (for the ring animation)
- **Release**
  - Unpublishes and closes the mic track (hot-mic protection)
  - Switches to `processing` while waiting for AI audio
  - Starts a 15-second safety timeout; if no agent responds, returns to `idle`

### Agent Identification (How the UI Knows “Who Is Speaking”)

Each AI agent joins the channel using a known Agora UID. The UI maps those UIDs to roles:

- Empath → `VITE_AGENT_ID_EMPATH`
- Strategist → `VITE_AGENT_ID_STRATEGIST`
- Stoic → `VITE_AGENT_ID_STOIC`

When the UI detects a remote audio publish event, it matches the publisher UID to one of these IDs and sets the `activeSpeaker` accordingly.

---

## Project Structure (Important Files)

- UI entry and orchestration:
  - `Source Code/src/App.jsx`
- Circle screen UI and transcript rendering:
  - `Source Code/src/components/MainScreen.jsx`
  - `Source Code/src/components/SpatialCircle.jsx`
  - `Source Code/src/components/TranscriptCard.jsx`
- Talk button (hold-to-talk logic in the UI layer):
  - `Source Code/src/components/TalkButton.jsx`
- Logs view:
  - `Source Code/src/components/LogsScreen.jsx`
- Agent persona documentation UI:
  - `Source Code/src/components/SettingsScreen.jsx`
- Env/config constants:
  - `Source Code/src/constants.js`

---

## Configuration (.env)

Create/update `Source Code/.env` with your Agora values (do not commit real secrets for production):

- `VITE_AGORA_APP_ID`: Agora App ID
- `VITE_AGORA_CHANNEL`: Channel name used by the UI and the agents
- `VITE_AGORA_TOKEN`: Optional token (recommended for secured projects)
- `VITE_AGENT_ID_EMPATH`, `VITE_AGENT_ID_STRATEGIST`, `VITE_AGENT_ID_STOIC`: the Agora UIDs used by each agent participant

Notes:

- If you use tokens, ensure the token matches the channel and UID rules you are using.
- The `VITE_AGORA_CUSTOMER_ID` / `VITE_AGORA_CUSTOMER_SECRET` values are not required for the UI to run; they are typically used for admin/server-side workflows.

---

## Run Locally

From `submissions/Group A/Night Owls/Source Code`:

```bash
npm install --legacy-peer-deps
npm run dev
```

Then open:

- http://localhost:5173/

---

## Typical Demo Script

1. Open the app → confirm **Agora Active** is shown in the Circle tab.
2. Hold the Talk button and speak a short prompt (e.g., “I feel overwhelmed with school work.”).
3. Release → the app enters **Synthesizing…** while waiting for agent audio.
4. As each agent responds, their node lights up and you hear their voice in real time.
5. Open **Logs** → download the log file for debugging and submission evidence.

---

## Known Limitations (Current State of This Repo)

- Transcript text is currently a placeholder (`"..."`) when an agent begins speaking; the UI does not yet receive actual text transcripts from the agent service.
- The “System Pipeline” panel visualizes the conceptual pipeline, but only Agora connection and mic capture are tracked directly by the UI here.
