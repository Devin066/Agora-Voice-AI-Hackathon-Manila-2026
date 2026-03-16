## Plan: Mobile-First Voice Cooking Assistant

Build a mobile-first, real-time voice cooking assistant where Agora RTC + Conversational AI Engine are core to every user interaction, then layer recipe generation, adaptive step guidance, and kitchen utilities for a reliable hackathon demo. Prioritize one polished end-to-end flow (voice recipe session) to maximize judging scores for Agora integration, functionality, architecture, and originality.

**Steps**
1. Phase 1 - Product Scope and Success Definition
1.1 Define the MVP user journey: user starts voice cooking mode, requests a recipe or gives his/her own recipe to follow, receives step-by-step guidance, asks clarifications/substitutions, and completes the dish.
1.2 Convert judging criteria into acceptance gates: Agora centrality, reliability, architecture clarity, originality, compliance artifacts.
1.3 Freeze scope boundaries: include core features 1-4; treat optional features as stretch if core passes reliability benchmark.

2. Phase 2 - Technical Foundation (*blocks all later phases*)
2.1 Set up mobile-first client shell and backend session service with clear environment variable management.
2.2 Integrate Agora RTC audio channel lifecycle (join, stream, reconnect, leave) and verify low-latency duplex audio.
2.3 Integrate Agora Conversational AI Engine for real-time voice AI turn handling.
2.4 Implement telemetry/logging hooks for latency, turn success, and failure states for demo readiness.

3. Phase 3 - Core Feature Implementation
3.1 Voice Cooking Mode (*depends on 2*)
- Implement hands-free conversation loop with wake intent (start/cancel/pause/resume).
- Add graceful fallback to tap-to-talk/text input if microphone or network fails.

3.2 Recipe Generation from User-Cited Recipes (*depends on 2, parallel with 3.1 once base audio works*)
- Accept references to known recipes/sources provided by user at runtime.
- Prompt flow asks personalization questions in-the-moment: dietary restrictions, spice tolerance, serving size, available appliances, time budget.
- Generate recipe with ingredient/tool lists and citation metadata from user-provided references.
- Support tool substitution and ingredient substitution logic when items are missing.
- Return nutrition info when available from source/API; otherwise provide best-effort estimate with confidence disclaimer.

3.3 Step-by-Step AI Cooking Guide (*depends on 3.2*)
- Maintain step state machine: current step, completed steps, repeats, corrections.
- Implement "repeat previous/current step" commands and "what’s next" pacing gate (never auto-advance without user cue).
- Add troubleshooting intents for "I did this wrong" with context-aware recovery suggestions.
- Add glossary intent for cooking terms (e.g., saute, deglaze, fold).

3.4 Integrated Cooking Tools (*parallel with 3.3 after state model exists*)
- Timer creation/control via voice (set, pause, resume, cancel, remaining time).
- Reminders/notifications for time-based and step-based prompts.
- Measurement conversion utility (volume, weight, temperature) integrated into assistant responses.

4. Phase 4 - Quality, Compliance, and Pitch Assets
4.1 Reliability hardening: reconnection handling, noisy input handling, guardrails for unsafe cooking advice.
4.2 Privacy/ethics documentation and consent language for voice capture/processing.
4.3 Round-1 submission compliance package prepared in this structure:
├── Deck & Demo
│   ├── TRAE_Usage/
│   ├── Source Code/
│   ├── README.md
Also include architecture diagram, setup guide, and demo video script + recording.
4.4 Round-2 presentation narrative: problem, differentiated solution, live demo flow, real-world impact.

5. Phase 5 - Optional Stretch Features (*only if core test pass rate >= target*)
5.1 Image ingredient recognition from camera input.
5.2 Meal planning assistant based on weekly constraints.
5.3 Taste-learning profile that adapts seasoning and style suggestions over sessions.

6. Verification Plan
6.1 Functional E2E tests for the main happy path across 3 recipe sessions.
6.2 Voice command tests for repeat/next/substitution/timer/conversion intents.
6.3 Failure-path tests: packet loss, API timeout, missing ingredient, misunderstood command.
6.4 Performance checks: turn latency targets and reconnect behavior under weak network.
6.5 Judging rubric dry-run scoring with internal checklist before submission.

7. Team Workload Split (4 Roles)
7.1 Project Manager
- Own 1-day execution plan using micro-sprints, strict scope control, and timeline guardrails.
- Own quality checking gates for every phase: feature complete, integration check, demo readiness, and submission readiness.
- Coordinate risk management, unblock the team quickly, and keep all work aligned to judging criteria.
- Prepare all required submissions in this structure:
├── Deck & Demo
│   ├── TRAE_Usage/
│   ├── Source Code/
│   ├── README.md
- Deliverables: day plan with sprint slots, quality checklist, submission package, final presentation flow.

7.2 UI/UX Designer
- Own mobile-first UX for React Native screens and voice-first interaction patterns.
- Design cooking session flows for onboarding, recipe generation, step guidance, and utility tools.
- Define accessibility, visual consistency, and error-state UX for interruptions/failures.
- Deliverables: wireframes, high-fidelity mockups, interaction specs, component/style guidelines.

7.3 Frontend Developer (React Native)
- Own React Native app implementation for screens, navigation, and client-side state.
- Integrate microphone controls, session UI, step-by-step pacing, timers/reminders UI, and conversion tools.
- Connect frontend to backend APIs and realtime events; implement fallback tap-to-talk/text states.
- Deliverables: working mobile app, reusable UI components, frontend test coverage for core flows.

7.4 Backend Developer
- Own Agora RTC + Conversational AI Engine backend orchestration and API services.
- Build recipe intelligence services: personalization intake, source citation handling, substitutions, nutrition enrichment.
- Implement session lifecycle, telemetry/logging, retry/reconnect logic, and safety/guardrail middleware.
- Deliverables: stable backend services, API contracts, observability dashboards, backend integration tests.

8. Parallelization and Dependencies
8.1 Parallel Track 1: Backend Developer starts platform integration while Project Manager prepares compliance/checklist scaffolding.
8.2 Parallel Track 2: After initial voice channel works, Frontend Developer and UI/UX Designer build guided cooking flow while Backend Developer finalizes recipe intelligence services.
8.3 Merge Gate: Step-state integration test blocks optional feature work.
8.4 Final Gate: No stretch features unless core reliability and demo script are stable.

**Relevant files**
- c:/Users/Ianne/CookingMama/Requirements.md - source of mandatory technologies, rules, and focus alignment.
- c:/Users/Ianne/CookingMama/Criteria.md - source of scoring rubric and compliance targets used as acceptance criteria.

**Decisions**
- Include all requested core features in planned scope.
- Treat optional items as stretch to protect reliability and demo quality.
- Keep Agora technologies central in the architecture to maximize judging score.
- Assume a 1-day hackathon cadence with micro-sprints; optional features are only attempted after core demo stability is confirmed.

**Further Considerations**
1. Mobile stack is fixed to React Native; finalize project setup immediately because it affects notification/timer strategy.
2. Nutrition data quality varies by source; define fallback behavior early to avoid demo-time uncertainty.
3. If real-time voice latency exceeds target, keep text fallback available to preserve end-to-end functionality for judging.
