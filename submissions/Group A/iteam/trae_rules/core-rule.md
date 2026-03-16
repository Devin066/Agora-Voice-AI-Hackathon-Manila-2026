# VisionVoice Core Project Rules

1. **Workflow**: Analyze -> Architect -> Document -> Code. Mandatory docs: ARCHITECTURE.md, TRAE_HANDOFF.md, PROJECT_DOCS.md, README.md, PITCH.md, TASKS.md.

2. **Tech Stack**: React, TS, Tailwind. Voice: Agora ConvoAI & Web SDK. CV: `getUserMedia()`, `coco-ssd` (objects), `face-api` (faces), `Tesseract.js` (OCR). Backend/AWS: Avoid unless critical. Start with Agora boilerplate.

3. **Scope**: Assistive awareness copilot (smart-glasses sim). NOT a medical device, nav system, or chatbot. Face matching restricted to pre-registered contacts only.

4. **Voice Rules**: 
   - Proactive: Hazards or known contacts only. 
   - Reactive: Based ONLY on visual context. 
   - Output: Short, calm, <1 sentence via Agora (e.g., "Chair ahead"). No chatty LLM text.

5. **Escalation**: Safeword/button triggers Agora A/V feed to remote caregiver. AI is primary.