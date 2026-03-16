# First Aid Bot - Source Code

This folder contains the hackathon submission source code for Group B (Chilimansi).

## Project Location

- App root: `voice-ai-agent`

## Stack

- Next.js (App Router)
- Progressive Web App setup via `next-pwa`
- Agora RTC SDK scaffolding
- Firebase client initialization and geolocation query utilities
- Next.js API routes prepared for AWS Lambda style serverless deployment

## Run Locally

1. Open terminal in `voice-ai-agent`
2. Install dependencies
3. Start development server

```bash
cd "submissions/Group B/Chilimansi/Source Code/voice-ai-agent"
npm install
npm run dev
```

## Build and Verify

```bash
npm run lint
npm run build
```

## Environment Variables

Create `.env.local` inside `voice-ai-agent` and configure:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
AWS_BEDROCK_MODEL_ID=
ELEVENLABS_VOICE_ID=
```
