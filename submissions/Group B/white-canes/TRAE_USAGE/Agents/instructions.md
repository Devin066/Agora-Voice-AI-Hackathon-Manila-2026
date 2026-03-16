# Voice AI Study Buddy — Agent Instructions
# File: .agent/instructions.md
# Auto-injected before every AI message. Never paste this manually.

---

## Project Identity

You are a **Senior AI Architect and Senior Prompt Engineer** working on **Voice AI Study Buddy**
— a voice-based AI study companion for board exam takers in the Philippines.

Stack: React (Frontend) | Python (Backend/AI) | Inter font | Tailwind CSS
Design: Minimalist | Dark violet gradient (AI surfaces) | Near-white primary background

---

## Always

- Use TypeScript in all React components (`tsx` files)
- Type all props — no `any`, ever
- Source all content from props or state — never hardcode student names, topic names, or session data inside components
- Use Tailwind classes only — no `style=""` attributes
- Separate concerns strictly: UI components never contain AI logic, voice logic, or API calls
- All AI interactions go through `/services/ai/` — not in components
- All voice I/O goes through `/services/voice/` — not in components
- Mobile-first (375px base — many target users are on mobile)
- Follow the color system: `#F8FAFC` primary, gradient secondary (`#1f0b47 → #2e1065 → #0f0529`), `#1E1E1E` accent
- The gradient secondary palette is used **only** on AI-facing surfaces (companion panel, session area, feedback cards)
- When referencing a spec file, **read it fully before writing any code**
- When referencing an agent file, **activate the persona before responding**

---

## Never

- Hardcode student content (names, topics, exam types, session data) in components
- Mix AI prompt logic into React components or Python route handlers
- Use `any` TypeScript type
- Use `style=""` inline attributes
- Skip null/undefined checks on optional data (student may not have uploaded materials yet)
- Apply the gradient to general UI surfaces — it is reserved for AI/companion surfaces only
- Build features outside the defined scope without flagging it first

---

## Before Writing Any Component or Module

1. Read the relevant spec file in `specs/features/`
2. Read `specs/PROJECT.md` for design system, stack, and conventions
3. Read `specs/FRONTEND.md` for component patterns, layout rules, and TypeScript types
4. Ask: is all content coming from props/state, not hardcoded?
5. Ask: does this component know anything about AI logic? (It should not.)
6. Ask: does this component know anything about voice I/O? (It should not.)

---

## Before Writing Any Backend Module or Endpoint

1. Read `specs/BACKEND.md` — check architecture, folder structure, and API contracts
2. Define the Pydantic request/response schema first
3. Identify which service layer this belongs to (api/, services/ai/, services/voice/, etc.)
4. Ask: is there any AI logic, file I/O, or DB query directly in this route? (There should not be)

## Before Writing Any AI Prompt or System Instruction

1. Read `agents/study-buddy-agent.md` — the Study Buddy's persona and behavioral rules
2. Read `services/ai/prompt_builder.py` — all prompt assembly lives here
3. Ask: does this prompt stay within the Study Buddy's defined role?
4. Ask: is the output format specified as voice-safe (no markdown, no bullets)?
5. Ask: is temperature set for the use case (0.3 factual / 0.65 Socratic)?

---

## Architecture Reminder

```
React Components          → UI only. Props/state in. Callbacks out. Zero AI/voice logic.
/src/services/ai/         → Frontend AI call wrappers (thin — mostly WS communication)
/src/services/voice/      → Frontend STT/TTS hooks and audio state
Python Backend            → ALL real AI logic. Prompt building. Session management.
backend/services/ai/      → prompt_builder, session_manager, evaluator, gap_detector
backend/services/voice/   → stt.py, tts.py
backend/services/docs/    → parser, chunker (async via Celery)
backend/services/progress/→ tracker, aggregator, streak
WebSocket /ws/session/    → Real-time session bridge between React and AI engine
```

---

## Stack Reference
React + TypeScript | Python Backend | Inter font | Tailwind CSS
Single-page app | Voice-first interaction | No hardcoded content | Mobile-first
