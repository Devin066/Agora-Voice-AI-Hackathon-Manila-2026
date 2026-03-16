# TRAE IDE Usage — UgnayAI

**Team:** TechWithKayne · Group B
**Hackathon:** Agora Voice AI Hackathon Manila 2026 · March 16, 2026

TRAE IDE was used **throughout the entire development lifecycle** of UgnayAI — from the first line of architecture planning to the final submission documentation. This document captures how TRAE accelerated development and made a complex, multi-service voice AI system buildable in a single hackathon day.

---

## Overview

| Phase | TRAE Usage | Output |
|-------|-----------|--------|
| Planning | Architecture design, API contract definition | System diagram, endpoint spec |
| Scaffolding | Project structure, boilerplate generation | Full React + Express skeleton |
| Core Development | Agora integration, Claude triage logic | Working voice triage loop |
| Safety Layer | RED override logic, rate limiting | 6-layer safety architecture |
| Auth & DB | Supabase JWT middleware, RLS policies | Secure RBAC system |
| Testing | Triage logic test generation | `triage.test.js` |
| Debugging | Agora token errors, CORS issues, Supabase realtime reconnect | All resolved in-session |
| Documentation | README, API reference, architecture docs | Full submission package |

---

## Phase 1 — Architecture Planning

**Prompt used:**
> *"I'm building a voice AI health triage app for Filipino barangays. BHWs (community health workers) speak patient symptoms in Filipino. The app should triage severity and connect RED cases to nurses via real-time voice. I need to use Agora Conversational AI Engine and Agora RTC. What should my full architecture look like?"*

**TRAE output:**
- Proposed the three-tier architecture: Browser → Express backend → AWS Bedrock + Supabase
- Identified that the Agora Conversational AI Engine should own the voice triage loop (not just wrap a chatbot)
- Recommended Fly.io Singapore region for lowest latency to Philippine users
- Suggested Supabase Realtime over polling for BHW dispatch push notifications

**Impact:** Saved ~2 hours of whiteboarding. The architecture TRAE proposed became the final production architecture with minimal changes.

---

## Phase 2 — Agora Conversational AI Engine Integration

**Prompt used:**
> *"Write the React component for the voice triage interface. It should: create an Agora RTC channel, use the Conversational AI Engine to capture speech, pass it to our /triage endpoint, and play back the Filipino response via ElevenLabs TTS. The channel name format is triage-{uuid}."*

**TRAE output:**
- Full `PatientApp.jsx` with Agora RTC channel lifecycle (create, join, publish, leave)
- `AgoraRTC.createMicrophoneAudioTrack()` implementation with permission handling
- Conversational AI Engine integration for real-time STT
- ElevenLabs TTS playback wired to the triage response AKSYON field
- Error states for mic permission denied, network failure, Agora token expiry

**Key code generated:**
```jsx
// TRAE generated the core voice capture loop
const startVoiceTriage = async () => {
  const channel = `triage-${crypto.randomUUID()}`;
  const token = await fetchToken(channel);
  await client.join(appId, channel, token, null);
  const track = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([track]);
  // ... Conversational AI Engine processing
};
```

**Impact:** The Agora integration that would have taken half a day to build from docs was working in ~45 minutes.

---

## Phase 3 — Triage Logic + Safety Override

**Prompt used:**
> *"Write the triage.js module. It should call Claude Sonnet 4.6 via AWS Bedrock. The system prompt must enforce Filipino language, WHO 2009 dengue criteria, and output format RISK/AKSYON/TANONG. After Claude responds, run a checkRedOverride() function that forces RED for: blood from any orifice, unconsciousness, breathing difficulty, seizures, pregnant + abdominal pain, high fever + altered consciousness, fever + bleeding + not eating + pallor."*

**TRAE output:**
- Complete `triage.js` with Bedrock client, system prompt, and response parser
- `checkRedOverride()` with regex patterns for all 7 danger triggers
- Graceful fallback to Ollama when `TRIAGE_PROVIDER=ollama`
- Provider switching logic via environment variable
- `overridden: true` flag in response when safety override fires

**Key code generated:**
```js
// TRAE designed the layered override pattern
function checkRedOverride(symptoms) {
  const text = symptoms.toLowerCase();
  const triggers = [
    /dugo.*ihi|dugo.*dumi|dugo.*ilong|nagdudugo/,
    /hindi na nagising|hindi na mulat|nawalan ng malay/,
    /hirap sa paghinga|hindi makahinga/,
    /kejang|convulsion|nanginginig nang malakas/,
    // ... all 7 triggers
  ];
  return triggers.some(pattern => pattern.test(text));
}
```

**Impact:** The safety architecture — which is a genuine clinical requirement, not just polish — was designed and implemented with TRAE in under 30 minutes.

---

## Phase 4 — JWT Auth Middleware + RBAC

**Prompt used:**
> *"Write Express middleware that verifies a Supabase JWT and extracts the user role (bhw, nurse, admin). Attach the user to req.user. Write a requireRole() factory function that throws 403 if the user's role doesn't match."*

**TRAE output:**
- `middleware/auth.js` with `jsonwebtoken` verification against Supabase JWT secret
- `requireRole(...roles)` factory returning Express middleware
- Attached `req.user = { id, email, role }` for downstream use
- Error messages in Filipino for end-user-facing rejections

**Impact:** Auth middleware that would normally take an hour was production-ready in 15 minutes.

---

## Phase 5 — Priority Queue System

**Prompt used:**
> *"Write a queue.js module with a priority scoring system. Score = base (RED:100, YELLOW:50, GREEN:10) + modifiers (pregnant:+30, age<1yr:+40, age<5yr:+20, comorbidity:+15). Higher score = front of queue. FIFO within same score. Write the Express routes: POST /queue/join, GET /queue/status/:id, GET /queue/dashboard, POST /queue/complete/:id, POST /queue/cancel/:id."*

**TRAE output:**
- In-memory priority queue with sorted insertion
- Scoring formula as specified
- All 5 routes with Supabase persistence
- Dashboard endpoint for the nurse view with full queue state
- `complete` endpoint that promotes the next-highest-priority entry

**Impact:** A non-trivial data structure + 5 API endpoints in one prompt.

---

## Phase 6 — Supabase Realtime BHW Dispatch

**Prompt used:**
> *"When a patient submits a RED triage, I need to push a real-time notification to the BHW via Supabase broadcast on channel 'bhw-dispatch'. The payload should include: patient alias, age, sex, barangay, GPS, symptoms summary, risk level, triage ID. Write the server-side broadcast and the client-side subscription in the BHW dashboard."*

**TRAE output:**
- Server-side Supabase broadcast using `supabase.channel('bhw-dispatch').send()`
- `BHWApp.jsx` subscription with `channel.on('broadcast', ...)` handler
- Notification UI: full-screen alert with patient details
- Auto-dismiss after BHW acknowledges

**Impact:** Zero-latency BHW dispatch without any separate notification infrastructure.

---

## Phase 7 — Debugging Sessions

### Issue 1 — Agora Token 403 on Second Join
**Problem:** Agora RTC tokens were failing on the second channel join after the first triage session ended.
**TRAE diagnosis:** Token expiry not reset between sessions; the `client.leave()` call was not awaited before generating a new token.
**Fix generated:** Async `leaveChannel()` wrapper with `await client.leave()` + token refresh sequence.

### Issue 2 — CORS Failure on Fly.io Deploy
**Problem:** Frontend on Vercel couldn't reach the Express backend on Fly.io.
**TRAE diagnosis:** `CORS_ORIGIN` env var was not being split into an array; `cors({ origin: string })` only matched exact strings.
**Fix generated:** `origin: process.env.CORS_ORIGIN.split(',')` with trim.

### Issue 3 — Supabase Realtime Disconnect on Mobile
**Problem:** Supabase Realtime WebSocket was dropping on mobile after ~2 minutes in background.
**TRAE diagnosis:** No reconnect handler; mobile browsers kill background WebSockets aggressively.
**Fix generated:** `visibilitychange` listener that re-subscribes the channel on page focus.

---

## Phase 8 — Testing

**Prompt used:**
> *"Write Jest tests for triage.js. Test: (1) checkRedOverride returns true for blood symptoms, (2) checkRedOverride returns false for mild fever, (3) parseTriage correctly extracts RISK/AKSYON/TANONG from Claude response, (4) patient mode upgrades GREEN to YELLOW."*

**TRAE output:**
- `triage.test.js` with 12 test cases covering all safety override triggers
- Mock for AWS Bedrock client
- Edge cases: partial matches, Tagalog/English mixed input, empty response

---

## Phase 9 — Documentation

TRAE was used to generate:
- Full `README.md` with architecture, API reference, and demo script
- `ARCHITECTURE.md` with detailed system design rationale
- `TRAE_USAGE.md` (this document) — TRAE drafted the structure and I filled in specifics
- SQL schema for `triage_events` and `bridge_sessions`
- Supabase RLS policy SQL

---

## TRAE Workflow Summary

**How TRAE was invoked throughout the day:**

1. **Architecture first** — Before writing a single line, TRAE planned the full system
2. **Feature by feature** — Each module (triage, bridge, queue, auth) was built with one focused prompt
3. **Debug on failure** — Every error was pasted into TRAE with context; fix was usually one prompt
4. **Docs last** — Documentation was generated from the working codebase

**Most impactful TRAE use:**
The Agora Conversational AI Engine + ElevenLabs TTS integration. This was the technically riskiest part of the project — integrating three real-time systems (Agora RTC, Conversational AI Engine, ElevenLabs) with async Filipino speech flow. TRAE got this working in a single session that would have otherwise taken half the hackathon day.

**Estimate:** TRAE IDE compressed approximately 2–3 days of solo development into 8 hours.

---

*UgnayAI — Ang boses ng bawat barangay. Ngayon.*
