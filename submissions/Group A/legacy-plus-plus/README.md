# Alon — Voice AI Speech Practice for Kids

**Alon** (Filipino for *wave*) is a child-centered speech practice app built for the **Agora Voice AI Hackathon Manila 2026**. Children aged 5–13 practice pronunciation with **Wavi**, a friendly AI speech coach powered by Agora's Conversational AI, Groq LLM, and Microsoft Azure TTS — all in real-time, directly in the browser.

---

## What it does

A child opens the app, picks up a phrase on screen, taps the mic, and speaks. Wavi listens, repeats the phrase correctly, gives one focused tip, and cheers the child on — all within seconds. Parents get a separate dashboard to monitor progress over time.

### Key features

- **Live voice coaching** — Agora RTC + Conversational AI pipeline (ASR → Groq LLM → Azure TTS)
- **Wavi AI coach** — llama-3.3-70b-versatile via Groq, child-safe system prompt, age-adaptive responses
- **Level-based curriculum** — 5 levels (R → S → L/SH → TH → Mix & Master), progress persisted per child
- **Real-time mic meter** — 8-bar volume visualizer so children can see their voice
- **Live captions** — Agora RTM v2 streams Wavi's transcribed speech back to the UI
- **Gamification** — streak counter, star rewards, badges, 3-star session rating
- **Parent dashboard** — weekly progress chart, skill breakdown, session history
- **Parent consent gate** — COPPA-aware, role-based access, data deletion on request
- **Child-safe by design** — audio processed in real-time only, never stored

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI, Lucide React |
| Voice / RTC | Agora RTC SDK (`agora-rtc-sdk-ng`) |
| Conversational AI | Agora Conversational AI REST API v2 |
| LLM | Groq — `llama-3.3-70b-versatile` |
| TTS | Microsoft Azure (`en-US-AnaNeural`) |
| ASR | Agora built-in (`en-US`) |
| Live captions | Agora RTM v2 (`agora-rtm`) |
| Auth & DB | Supabase (Auth + Postgres) |
| Token generation | `agora-token` (RTC + RTM) |

---

## Project structure

```
app/
  page.tsx                  # Landing / onboarding / consent flow
  auth/page.tsx             # Supabase email auth
  child/home/page.tsx       # Child home — tabs: Home, Lessons, Rewards, Profile
  practice/page.tsx         # Live practice session with Wavi
  report/page.tsx           # Post-session report card
  parent/dashboard/page.tsx # Parent dashboard — Overview, Progress, History, Settings
  api/
    agora/token/route.ts    # Generates RTC + RTM tokens server-side
    agora/agent/route.ts    # Starts / stops the Conversational AI agent

lib/
  prompts.ts                # Phrase library + level-based filtering
  db.ts                     # Supabase helpers (sessions, scores, recommendations)
  supabase.ts               # Supabase browser client

context/
  AuthContext.tsx           # Auth state provider
```

---

## How the voice pipeline works

```
Child speaks into mic
  → Agora RTC publishes audio stream (speech_standard encoder)
  → Agora Conversational AI agent receives stream
  → Built-in ASR transcribes speech (en-US)
  → Groq LLM (llama-3.3-70b-versatile) generates coaching response
  → Microsoft Azure TTS synthesises Wavi's voice (en-US-AnaNeural)
  → Agent publishes audio back into the RTC channel
  → Child hears Wavi's feedback in real-time
  → RTM v2 streams live captions to the UI
```

The mic is published once at session start and muted/unmuted via `setEnabled()` — never unpublished — so Agora's VAD can detect speech activity continuously.

---

## Environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Agora
NEXT_PUBLIC_AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
AGORA_CUSTOMER_ID=
AGORA_CUSTOMER_SECRET=

# Groq (LLM)
GROQ_API_KEY=

# Microsoft Azure Speech (TTS)
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
```

---

## Getting started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Levels

| Level | Sound | Example phrases |
|---|---|---|
| 1 | R Sounds | red, rabbit, run |
| 2 | S Sounds | sun, sea, sing |
| 3 | L & SH | shell, she, like |
| 4 | TH Sounds | three, think, this |
| 5 | Mix & Master | all phonemes |

The active level is persisted in `localStorage` (`legacypp_level`). Practice sessions always pull phrases from the current level only.

---

## Team

**Group A — Legacy++**
Agora Voice AI Hackathon Manila 2026
