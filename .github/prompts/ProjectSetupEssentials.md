# Project Setup Essentials (1-Day Hackathon)

## 1. Monorepo Structure (or clear app/server split)
- `mobile/` (React Native app)
- `backend/` (API, Agora orchestration, AI logic)
- `docs/` (architecture, API contracts, setup guide)
- `Deck & Demo/` (submission-ready artifacts)

## 2. Required Submission Package
Prepare this structure early:

```text
Deck & Demo/
├── TRAE_Usage/
├── Source Code/
└── README.md
```

Content guidance:
- `TRAE_Usage/`: screenshots/logs proving TRAE-assisted workflow.
- `Source Code/`: code snapshot or clear reference/instructions to the repo.
- `README.md`: demo narrative, setup, usage, and architecture summary.

## 3. React Native App Baseline
- Navigation and screen shell.
- Voice session screen (start, pause, stop, reconnect status).
- Step-by-step cooking UI (repeat step, next step).
- Kitchen tools UI (timer, reminders/notifications, measurement conversion).
- Text fallback UI if voice/network fails.

## 4. Backend Baseline
- Session/auth endpoints for Agora token and room setup.
- Conversational turn handlers for real-time voice input/output.
- Recipe generation service with in-the-moment personalization prompts.
- Ingredient/tool substitution engine.
- Nutrition enrichment module with best-effort fallback when data is unavailable.

## 5. Config and Environment Management
- `.env.example` listing all required keys.
- Separate `dev` and `demo` configuration options.
- Secret-handling policy (never commit secrets).

## 6. Quality and Reliability Setup
- Health-check endpoint(s) and structured logs.
- Error handling for disconnects, API timeout, and invalid intents.
- Smoke test script for the full happy-path demo flow.

## 7. Documentation Minimum
- Root `README.md` with a quick start in under 5 minutes.
- Architecture diagram (voice flow and data flow).
- Demo script (2-3 minutes) plus fallback flow if voice fails.
- Judging checklist mapped to requirements and criteria.

## 8. Day-of-Hackathon Execution Board
- Hourly micro-sprints with explicit owners.
- Role ownership: Project Manager, UI/UX Designer, Frontend Developer, Backend Developer.
- Hard cut-off times: feature freeze, QA, demo recording, submission upload.
