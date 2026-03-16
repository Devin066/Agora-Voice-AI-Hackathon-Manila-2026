# VisionVoice Core Project Rules

1. **Mandatory Workflow**: You must strictly follow this order for all major tasks: 
   - Analyze constraints -> Propose architecture -> Generate/update docs -> Write production code. 
   - Never skip the documentation phase (ARCHITECTURE.md, TRAE_HANDOFF.md, PROJECT_DOCS.md, README.md, PITCH.md, TASKS.md).

2. **Core Tech Stack**: 
   - Frontend: React, TypeScript, TailwindCSS (or similar for polished UI).
   - Voice/Comms: Agora ConvoAI (mandatory), Agora Web SDK (mandatory).
   - Computer Vision: Browser-native `getUserMedia()`, `@tensorflow-models/coco-ssd` (objects), `@vladmandic/face-api` (faces). Optional: `Tesseract.js` (OCR).
   - Backend/Cloud: Avoid unless absolutely necessary (AWS is optional and out of core scope). Start from the Agora boilerplate.

3. **Product Framing & Scope**: 
   - This is an assistive awareness copilot and webcam simulation of smart-glasses, NOT a full navigation system, medical device, or general-purpose chatbot. 
   - Face recognition MUST be strictly limited to pre-registered, known contacts (no public/open identity matching).

4. **Interaction & Voice Rules**: 
   - **Proactive:** Only speak unprompted for important hazards/obstacles or when a newly registered contact is detected.
   - **Reactive:** Respond to user queries based ONLY on the most recent visual context.
   - **Output Style:** Spoken responses via Agora must be short, calm, direct, and ideally under one sentence (e.g., "Chair ahead, slightly left," "Angela is in front of you"). No chatty or generic LLM paragraphs.

5. **Caregiver Escalation (Secondary)**: 
   - Treat caregiver mode as an escalation/fallback layer triggered by a safeword or button, using Agora to connect a remote user to the audio/video feed. The AI remains the primary daily interface.