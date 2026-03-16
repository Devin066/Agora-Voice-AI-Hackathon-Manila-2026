# VisionVoice

VisionVoice is a smart-glasses simulator that turns a webcam into an assistive awareness companion for visually impaired users. It detects nearby objects, recognizes pre-registered loved ones, builds short scene context, and speaks guidance through a patient-first voice workflow.

## What It Does

- Detects nearby objects such as chairs, tables, bottles, bags, and people
- Recognizes known faces that were registered in the contact dashboard
- Speaks short scene summaries in `Patient view`
- Answers follow-up voice or text questions using the current scene context
- Supports a caregiver-style contact dashboard for monitoring and face registration

## Current Demo Flow

- `Patient view`: the AI speaks here
- `Contact dashboard`: visual monitoring and setup only, no AI voice
- Patient narration is based on object detection plus recognized-face context
- The project currently prefers a stable local fallback voice path for demo reliability

## Project Structure

- `code/frontend`: React + Vite app
- `code/backend`: Express + TypeScript backend for Gemini, TTS, and Agora agent endpoints
- `code/docs`: supporting product and architecture notes

## Quick Start

### Prerequisites

- Node.js 18+
- Webcam and microphone access
- Backend API keys configured in `code/backend/.env`

### 1. Start the backend

```bash
cd "submissions/Group A/iteam/code/backend"
npm install
npm run dev
```

### 2. Start the frontend

```bash
cd "submissions/Group A/iteam/code/frontend"
npm install
npm run dev
```

### 3. Open the app

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

or

```text
http://localhost:5174
```

## How To Use The Demo

### Contact Dashboard

Use this view to:

- monitor the live camera feed
- see detected objects visually
- capture a face photo
- register a loved one by name
- test typed prompts manually

### Patient View

Use this view to:

- hear spoken context about detected objects
- hear recognized loved-one context when available
- ask follow-up questions
- experience the assistive voice workflow

## Recognition And Context

VisionVoice combines two perception layers:

- `Object detection`: identifies obstacles and useful nearby items
- `Face recognition`: identifies only pre-registered known people

These are merged into a short scene summary such as:

```text
Chair in front of you. Angela is in front of you.
```

If no strong reading is available yet, the assistant falls back to a cautious summary instead of inventing certainty.

## Voice Behavior

- AI speech only happens in `Patient view`
- The app prefers a stable local voice fallback path for reliability
- Agora token and agent routes still exist in the backend for the live voice architecture
- Browser native speech may be used when upstream TTS is unavailable

## Environment Notes

### Frontend

Client-safe variables belong in `code/frontend/.env`, for example:

```env
VITE_AGORA_APP_ID=...
VITE_AGORA_CHANNEL=...
VITE_AGORA_TOKEN=...
VITE_LOCAL_AI_BASE_URL=http://localhost:8000
```

### Backend

Create `code/backend/.env` from `code/backend/.env.example` and fill in your real keys there.

Do not commit backend secrets or frontend local `.env` files.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Express, TypeScript
- Object detection: `@tensorflow-models/coco-ssd`
- Face recognition: `@vladmandic/face-api`
- Voice/LLM integration: Gemini, Agora endpoints, local fallback speech

## Manual Test Checklist

1. Open `Contact dashboard`
2. Confirm the camera feed is visible
3. Put a chair or similar object in view
4. Register one teammate in the face library
5. Switch to `Patient view`
6. Confirm the assistant speaks object and face context
7. Ask a short follow-up question

## Known Demo Constraints

- Face recognition works only for people registered in the current browser
- Browser speech may be used if upstream TTS is unavailable
- Camera and mic permissions must be allowed
- Good lighting improves both object and face recognition

## Troubleshooting

### Camera not showing

- Allow browser camera permission
- Close other apps using the camera
- Hard refresh the page

### AI not speaking

- Make sure you are in `Patient view`
- Check that the backend is running on `http://localhost:8000`
- Hard refresh after backend changes

### Face recognition not naming people

- Register the person first in `Contact dashboard`
- Use a clear, front-facing photo
- Improve lighting and move closer

## Hackathon Positioning

VisionVoice is a hackathon MVP focused on assistive awareness, simple spoken guidance, and a clean demo flow. The strongest demo path is:

1. detect an object
2. recognize a known person
3. speak a combined scene summary
4. answer a short patient follow-up question
