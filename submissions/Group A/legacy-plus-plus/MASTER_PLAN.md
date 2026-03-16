# Master Plan: Voice AI for Children’s Speech Therapy

## 1. Executive Summary
Voice AI for Speech Therapy is a child-centered web/mobile experience that provides guided speech practice with instant feedback on pronunciation, articulation, and fluency. The product is designed for children ages 5-13, with parent oversight and optional therapist monitoring.

The strategy is dual-track:
1. Hackathon Track: deliver a polished end-to-end MVP that proves value in one session loop.
2. Scale Track: evolve into a clinically useful, safe, and engaging platform for frequent at-home therapy support.

---

## 2. Project Overview

### Vision
Make speech practice accessible, affordable, and engaging for children who cannot consistently access in-person therapy.

### Problem Statement
Children with speech disorders often need frequent repetition and monitoring, but access to SLPs is limited by cost, location, and availability. Families need a guided, home-based companion that is safe, motivating, and easy to use.

### Goals
1. Enable daily home practice in short sessions (5-10 minutes).
2. Provide instant corrective feedback that children can understand.
3. Give parents clear progress visibility and practical next steps.
4. Support therapist follow-up with shareable performance summaries.

### Target Users
1. Primary: Children (5-13) with articulation, phonological, fluency, or pronunciation challenges.
2. Secondary: Parents/caregivers supervising practice.
3. Tertiary: Speech-language pathologists monitoring outcomes.

---

## 3. Scope and Features

### MVP Core Scope
1. Parent consent and child profile setup.
2. Guided speaking session with phrase prompts.
3. Real-time or near-real-time feedback chips.
4. End-of-session report card with actionable next exercise.
5. Progress history saved to database.
6. Parent dashboard with weekly trend and completion status.

### Post-MVP Optional Scope
1. Therapist assignment panel and custom drill prescriptions.
2. Story mode and character-based coaching.
3. Gamification with badges, streaks, and unlockables.
4. Bilingual support (English and Filipino).
5. Advanced analytics and adaptive lesson planning.

### Non-Goals for Initial Build
1. Medical diagnosis claims.
2. Fully autonomous clinical decision-making.
3. Broad social/community features for children.

---

## 4. UI/UX Master Plan

## 4.1 Persona Set

1. Child Persona A: Early Learner (5-7)  
Needs large visual cues, simple language, audio-first guidance, and immediate rewards.

2. Child Persona B: Growing Reader (8-10)  
Needs goal clarity, mini-challenges, and confidence-building corrections.

3. Child Persona C: Pre-Teen (11-13)  
Needs less "baby" tone, performance feedback, and progress ownership.

4. Parent Persona  
Needs trust, clarity, privacy confidence, and quick "what to do next" recommendations.

5. Therapist Persona  
Needs reliable trend summaries, adherence insights, and error pattern visibility.

## 4.2 Journey Maps

1. Child Daily Journey  
Open app -> see "Today’s Mission" -> complete 3-5 speaking tasks -> receive live prompts -> finish report card -> earn reward -> exit with next target.

2. Parent Journey  
Set reminder -> start child session -> review summary -> check weekly trend -> reinforce suggested home drill.

3. Therapist Journey  
Review child trend -> inspect recurring errors -> adjust target sounds/exercises -> export summary.

## 4.3 Wireframe Blueprint (Text-Based)

1. Screen: Parent Gate  
Layout: trust banner, consent toggle, profile creation form, primary CTA `Continue`.  
Behavior: blocks child session until consent captured.

2. Screen: Child Home  
Layout: mascot greeting, mission card, streak indicator, single primary CTA `Start Practice`.  
Behavior: one dominant action; distractions minimized.

3. Screen: Guided Practice  
Layout: top progress dots, center word/phrase card with image, bottom mic controls, live feedback chips.  
Behavior: immediate feedback after each attempt; `Repeat` and `Next` always visible.

4. Screen: Real-Time Coaching Overlay  
Layout: minimal floating cues such as `Slow down`, `Try R again`, `Great attempt`.  
Behavior: non-punitive, short language, color-coded coaching.

5. Screen: Session Report Card  
Layout: star summary, three skill bars (clarity, smoothness, confidence), recommended next drill.  
Behavior: gives one next action only, avoids overload.

6. Screen: Parent Dashboard  
Layout: weekly minutes, completion streak, trend chart, "top sounds this week," reminder controls.  
Behavior: simple interpretation language, no clinical jargon.

7. Screen: Therapist Summary (Phase 2)  
Layout: date filters, adherence stats, recurring phoneme flags, assignment area.  
Behavior: export/share support.

## 4.4 Design Principles
1. Child-first comprehension: every instruction should be understandable by a 7-year-old.
2. Positive reinforcement before correction.
3. One-task-per-screen interaction model.
4. Minimal cognitive load and low reading burden.
5. Safety and trust visible in every parent-facing touchpoint.

## 4.5 Style Guide

### Typography
1. Heading font: `Baloo 2`.
2. Body font: `Nunito`.
3. Data/labels: `Atkinson Hyperlegible`.

### Color System
1. `--bg`: `#F7FBFF`
2. `--surface`: `#FFFFFF`
3. `--primary`: `#0EA5A6`
4. `--secondary`: `#2563EB`
5. `--accent`: `#F59E0B`
6. `--success`: `#16A34A`
7. `--warning`: `#F97316`
8. `--error`: `#DC2626`
9. `--text`: `#0F172A`

### Interaction and Motion
1. Use gentle reward animations only at completion moments.
2. Avoid rapid or distracting transitions during live speaking.
3. Keep feedback motion purposeful and short (<300ms).

### Content Tone
1. Encouraging: "Great try."
2. Actionable: "Let’s say it slower together."
3. Never shaming or negative phrasing.

---

## 5. Technical Master Plan

### Core Stack
1. Frontend: Next.js App Router, TailwindCSS, Lucide React.
2. Real-time Voice: Agora RTC SDK, Agora Conversational AI Engine.
3. Backend: FastAPI.
4. Data: Supabase PostgreSQL + Auth.
5. Session Cache: Upstash Redis.
6. Optional AI/LLM: AWS Bedrock.
7. Optional TTS: ElevenLabs.
8. Deployment: Vercel (frontend), Railway + Docker (backend), optional S3 for assets.

### High-Level Architecture
1. Client captures audio and streams or uploads.
2. Agora handles real-time voice communication.
3. FastAPI scoring service evaluates pronunciation, fluency, articulation.
4. Feedback payload returned to UI in child-friendly template format.
5. Session metrics written to Supabase.
6. Short-lived conversational state kept in Redis.
7. Parent dashboard and analytics consume aggregated API endpoints.

### API Surface (Initial)
1. `POST /session/start`
2. `POST /analyze`  
Input: audio chunk or transcript metadata.  
Output: score components + coaching message.
3. `POST /session/end`
4. `GET /progress/{childId}`
5. `GET /recommendations/{childId}`

### Data Model (Initial)
1. `users` (parent, therapist, child roles)
2. `child_profiles` (age band, target sounds, language)
3. `sessions` (start/end, duration, completion)
4. `session_scores` (pronunciation, fluency, articulation, confidence proxy)
5. `feedback_events` (timestamped correction hints)
6. `practice_recommendations`
7. `consents` (parent consent logs, data retention preference)

### Privacy and Safety Controls
1. Parent consent required before child data capture.
2. Data retention policy with deletion option.
3. Encrypted transport and secure storage.
4. Role-based access control for parent/therapist visibility.
5. Product disclaimer: assistive practice tool, not diagnostic authority.

---

## 6. Timeline and Milestones

## 6.1 Hackathon Execution Plan (5 Hours)

1. Hour 1: Foundation  
Set up app shell, child home screen, prompt flow.

2. Hour 2: Speech Loop  
Mic capture + `POST /analyze` + feedback chips.

3. Hour 3: Session Completion  
Summary screen + store session results in Supabase.

4. Hour 4: Parent View  
Basic dashboard with trend and completion stats.

5. Hour 5: Polish and Demo  
Deploy, bug triage, scripted walkthrough, fallback recording.

### Hackathon Deliverables
1. Working hosted demo URL.
2. One complete child session flow.
3. Parent progress screen with stored data.
4. Architecture and impact slide.
5. Backup video in case of network issues.

## 6.2 Post-Hackathon Product Roadmap (12 Weeks)

1. Weeks 1-2: UX validation with children and caregivers.
2. Weeks 3-4: Improved scoring reliability and phoneme targeting.
3. Weeks 5-6: Better recommendation engine and reminders.
4. Weeks 7-8: Therapist view and exportable reports.
5. Weeks 9-10: Accessibility and performance hardening.
6. Weeks 11-12: Pilot cohort launch and iteration.

---

## 7. Risks and Mitigation

1. Accent and dialect variance affects scoring accuracy.  
Mitigation: local calibration datasets and human-reviewed prompt sets.

2. Child disengagement after novelty fades.  
Mitigation: short missions, progressive unlocks, varied prompts.

3. Feedback latency degrades user trust.  
Mitigation: lightweight models, async fallback mode, cached coaching templates.

4. Privacy concerns for minors.  
Mitigation: explicit consent, clear retention settings, role-based controls.

5. Scope creep during delivery.  
Mitigation: strict MVP definition and feature freeze checkpoint.

---

## 8. Success Metrics Framework

### Adoption
1. Parent sign-up to first completed session rate.
2. First-week activation rate.

### Engagement
1. Sessions per child per week.
2. 7-day and 30-day retention.
3. Average session completion percentage.
4. Streak continuation rate.

### Learning Impact
1. Improvement in target-sound performance over time.
2. Reduction in repeated error frequency per phoneme.
3. Parent-rated confidence improvement.

### Satisfaction and Trust
1. Parent CSAT score.
2. Therapist usefulness score.
3. Child "fun and confidence" in-app pulse.

### Reliability
1. Session success rate.
2. Feedback latency P50/P95.
3. Crash-free session rate.

---

## 9. Team Operating Model

### Recommended Roles
1. Product/PM: scope control, judging narrative, prioritization.
2. Frontend Lead: child flow UI + parent dashboard.
3. Backend Lead: scoring APIs + data persistence.
4. AI/Voice Integrator: Agora and feedback pipeline.
5. Design/UX: visual system, microcopy, usability fixes.
6. Demo Captain: deployment, script, fallback assets.

### Decision Rule
If a feature does not improve the core loop `Prompt -> Speak -> Feedback -> Progress`, defer it.

---

## 10. Demo Narrative for Judges

1. Start with the access problem for children and families.
2. Show child completing a 5-minute mission.
3. Highlight immediate corrective coaching in plain language.
4. Show parent dashboard proof of progress.
5. Close with scale path: therapist integration, local language support, broader reach.

---

## 11. Immediate Next Actions

1. Lock MVP acceptance criteria for the core session loop.
2. Set final UI copy for child-safe language.
3. Implement and test the 5 key endpoints.
4. Populate 20-30 prompt phrases by age band.
5. Run two full demo rehearsals with timing.
