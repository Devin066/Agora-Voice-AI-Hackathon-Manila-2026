# VisionVoice Master Prompt For TRAE

Paste the prompt below into `TRAE IDE` as the main implementation brief.

## Prompt

You are helping build `VisionVoice`, a webcam-based assistive smart-glasses simulator for visually impaired users.

Before writing production code, first analyze the project idea, confirm the architecture direction, and generate the core project documents needed for implementation and submission.

## Goal

Build a working hackathon MVP that:

- uses a webcam to simulate smart glasses
- detects nearby objects and hazards
- recognizes pre-registered known people only
- uses `Agora ConvoAI` and `Agora SDK` as the real voice interaction layer
- gives short, calm, assistive spoken responses
- supports both proactive alerts and reactive voice questions

## Your Working Mode

Work in this order:

1. analyze the project idea and official constraints
2. propose the implementation architecture
3. generate the necessary project docs
4. only then begin implementation

Do not skip the analysis and documentation phase.

## Official Hackathon Constraints

The build must align with these event requirements:

- `Agora ConvoAI` is required
- `Agora SDK` is required
- `TRAE IDE` is required
- `Agora boilerplate` is provided and should be used as the starting point
- `AWS` is optional and should not be treated as core scope

Do not build this as a local-only browser speech demo. The final product flow must actively use `Agora`.

## Product Framing

This is:

- an assistive awareness copilot
- an accessibility-first proof of concept
- a webcam simulation of future smart-glasses hardware
- a hands-free sensing interface, not a visual display device

This is not:

- a full navigation system
- a medical device
- unrestricted public face recognition
- a general-purpose chatbot

## Core MVP Scope

Must-have:

- webcam preview
- local object detection
- local known-person recognition for pre-registered contacts
- hazard heuristics
- transcript or response panel
- `Agora ConvoAI` spoken responses
- polished demo-friendly UI

Nice-to-have:

- OCR for signs
- multilingual responses
- better visual overlays
- caregiver escalation using `Agora` voice or video connection
- safeword or voice-triggered caregiver alert

Out of scope:

- route planning
- full indoor navigation
- unrestricted identity matching
- complex multi-agent systems

## Required Architecture

Use this flow:

1. capture webcam frames
2. run local computer vision in the browser
3. detect objects, hazards, and known contacts
4. convert detections into compact assistive context
5. pass that context into the `Agora ConvoAI` flow
6. let `Agora` generate and speak the assistive response
7. mirror the result in the UI as transcript and status cards

## Caregiver Support Model

The product should include a clear future-facing caregiver support path.

Core idea:

- the visually impaired user does not need to see a visual interface
- the camera provides first-person environmental context
- the AI converts that context into spoken assistive guidance
- if needed, a caregiver can join through `Agora` for live support

Caregiver support should be treated as:

- a secondary feature
- an escalation layer
- a strong real-world justification for the smart-glasses form factor

Do not make caregiver mode the whole product. The primary experience should still be AI-powered assistive awareness.

## Interaction Model

The product should support two behaviors:

### Proactive behavior

The assistant may speak without being asked, but only for important events such as:

- a nearby obstacle or hazard
- a new critical change in the scene
- a recognized known person appearing in front of the user

Example:

- `Caution. Chair ahead, slightly left.`
- `Angela is in front of you.`

### Reactive behavior

The assistant should also respond when the user asks a question such as:

- `Is there anything in front of me?`
- `Who is in front of me?`
- `Is the path clear?`

In reactive mode, the response should be based on the most recent visual context.

### Escalation behavior

The product may also support caregiver escalation through `Agora`.

Examples:

- user says `Call Angela`
- user says a predefined safeword
- user manually taps a call-for-help button
- the system escalates after repeated critical hazard events

In escalation mode:

- a caregiver may receive an alert
- a caregiver may join the live session
- the caregiver may view or hear the first-person context through `Agora`
- the AI remains the first layer, and the caregiver acts as human backup

## Alert Rules

Do not let the assistant talk constantly.

Use these rules:

- auto-speak only for important or urgent hazards
- auto-speak when a known registered contact is newly detected
- avoid repeating the same alert too often
- keep normal scene descriptions user-triggered unless the situation is important
- prioritize calm and useful guidance over frequent output
- keep caregiver escalation event-driven, not always active

## First Deliverables You Should Generate

After analyzing the project idea, generate or refine these docs before building:

- `ARCHITECTURE.md`
- `TRAE_HANDOFF.md`
- `PROJECT_DOCS.md`
- `README.md`
- `PITCH.md`
- `TASKS.md`

If a file already exists, improve it instead of replacing the project direction.

## What The Architecture Doc Must Cover

The architecture writeup should include:

- high-level system design
- frontend structure
- local CV pipeline
- how `Agora ConvoAI` fits into the request and response flow
- data flow from webcam to assistive output
- MVP boundaries
- risks and fallback strategy

## What The Other Docs Must Cover

### `TRAE_HANDOFF.md`

- a direct implementation brief
- what to build first
- what to avoid
- the exact MVP scope

### `PROJECT_DOCS.md`

- product overview
- problem and solution
- business framing
- user value
- risks and constraints

### `README.md`

- setup steps
- run steps
- short explanation of the product
- notes about `Agora` and required environment variables

### `PITCH.md`

- one-line pitch
- problem
- solution
- demo story
- judge-friendly positioning

### `TASKS.md`

- team split
- implementation order
- must-have vs nice-to-have tasks
- demo preparation tasks

## Suggested Technical Stack

- `React`
- `TypeScript`
- `Agora Web SDK`
- `Agora ConvoAI`
- browser `getUserMedia()`
- `@tensorflow-models/coco-ssd`
- `@vladmandic/face-api`
- optional `Tesseract.js` for OCR

## UI Requirements

Create a single-page dashboard with:

- left panel: live webcam feed
- top status strip: camera, local model status, Agora status
- right panel: scene summary, hazards, detected objects, known person, detected text
- bottom panel: transcript, known contacts, notes or fallback state

The UI should be:

- clear
- polished
- easy to read during a live pitch
- optimized for demo reliability over feature overload

## Voice Response Rules

Spoken output must be short, direct, and assistive.

Good examples:

- `Chair ahead, slightly left.`
- `The right side is clear.`
- `Angela is in front of you.`
- `The sign says Welcome Desk.`

Avoid:

- long paragraphs
- chatty behavior
- overly generic LLM responses
- speculative claims without confidence cues
- repeating the same alert too frequently
- relying on caregiver mode for every normal interaction

## Face Recognition Rules

Face recognition must be:

- opt-in
- limited to pre-registered known contacts
- clearly demo-safe and privacy-conscious

Do not implement public or open-ended identity recognition.

## Smart-Glasses Justification

If asked why smart glasses are useful for someone who cannot see visual output, use this reasoning:

- the smart-glasses format provides a hands-free first-person camera perspective
- the system does not depend on visual display for the user
- the value comes from spoken guidance and contextual sensing
- `Agora` enables remote caregiver escalation when extra help is needed

The product should be framed as:

- AI first for daily awareness
- caregiver backup for higher-risk or emergency situations

## Implementation Priorities

1. Analyze the idea against the official hackathon constraints.
2. Generate or refine the project docs listed above.
3. Start from the provided `Agora boilerplate`.
4. Get the base UI and webcam flow running.
5. Add local object detection.
6. Add known-person registration and matching.
7. Build the context builder for concise assistive output.
8. Connect that context into `Agora ConvoAI`.
9. If time permits, add caregiver escalation through `Agora`.
10. Polish the live demo flow.

## Demo Target

The best final demo looks like this:

1. Start the camera.
2. The app detects a chair ahead.
3. `Agora` says: `Caution. Chair ahead, slightly left.`
4. A registered teammate enters frame.
5. `Agora` says: `Angela is in front of you.`
6. The user asks: `Is there anything else in front of me?`
7. `Agora` answers based on the latest visual context.
8. Optional: the user says `Call Angela` or a safeword and the caregiver escalation flow is triggered through `Agora`.
9. Optional: a sign is shown and read aloud.

## Constraints To Respect

- keep the MVP narrow
- prefer reliability over ambition
- avoid overclaiming accuracy
- keep spoken responses under one sentence when possible
- maintain a fallback demo path in case detection becomes unstable
- treat caregiver escalation as a bonus differentiator, not a blocker for the core demo

## Deliverables To Support

The final result should make it easy to produce:

- working demo
- demo video
- GitHub repository
- pitch deck
- TRAE documentation

## Existing Docs To Reference

Use these project documents as supporting context:

- `ARCHITECTURE.md`
- `TRAE_HANDOFF.md`
- `PROJECT_DOCS.md`
- `PITCH.md`
- `TASKS.md`

## Final Instruction

Build the smallest, strongest version of `VisionVoice` that clearly demonstrates:

- scene awareness
- obstacle alerts
- known-person recognition
- real `Agora` voice interaction

If possible without risking the core MVP, also demonstrate:

- caregiver escalation through `Agora`
- voice-triggered help request or safeword alert

Do not drift into a broad chatbot or a generic computer vision dashboard.

Before implementation, explicitly produce the architecture and documentation outputs needed to keep the project aligned and hackathon-ready.
