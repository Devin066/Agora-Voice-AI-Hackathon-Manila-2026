# TRAE Handoff: VisionVoice Implementation Brief

## What You're Building

VisionVoice is a webcam-based assistive smart-glasses simulator that helps visually impaired users navigate their environment through AI-powered voice guidance. Think of it as a copilot that sees what's ahead and speaks concise, helpful information.

## MVP Scope (Must Build First)

### Core Features (Non-Negotiable)
1. **Webcam Integration** - Live camera feed with 30 FPS preview
2. **Object Detection** - Detect chairs, tables, stairs, doors using COCO-SSD
3. **Hazard Alerts** - Proactive spoken warnings for nearby obstacles
4. **Known Person Recognition** - Pre-registered contacts only (opt-in)
5. **Agora ConvoAI Integration** - Real voice interaction, not browser speech
6. **Voice Commands** - "What's in front?" "Is path clear?" "Who's here?"
7. **Dashboard UI** - Status panels, transcript, confidence scores

### Technical Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **CV Libraries**: `@tensorflow-models/coco-ssd` + `@vladmandic/face-api`
- **Voice**: Agora Web SDK + Agora ConvoAI
- **Build**: Vite

## Implementation Order

Follow this order strictly to maintain momentum during the 1-day hackathon:

### Phase 1: Foundation (Hours 1-2)
1. Initialize React + Vite + Tailwind project.
2. Set up Agora credentials and basic layout.
3. Get `getUserMedia()` working and displayed.

### Phase 2: Local Perception (Hours 2-4)
1. Add `@tensorflow-models/coco-ssd`.
2. Draw bounding boxes on the video feed.
3. Add simple hazard logic (e.g., if bounding box area > 30% of screen).
4. *Optional*: Add `@vladmandic/face-api` if time permits.

### Phase 3: Voice Integration (Hours 4-6)
1. Connect Agora ConvoAI SDK.
2. Build the context logic: "I see a chair and a person."
3. Trigger proactive alerts when hazards are detected.
4. Allow user to ask questions via voice.

### Phase 4: Polish & Demo Prep (Hours 6-8)
1. Clean up the UI (status indicators, transcripts).
2. Build fallback modes (e.g., a button to force an alert for the demo).
3. Practice and record the demo.

## What to Avoid

❌ **Don't build these**:
- Full navigation system
- Medical device features  
- Public face recognition
- Complex chatbot conversations
- Route planning algorithms
- Multi-language support (for MVP)

❌ **Don't use these**:
- Browser text-to-speech (must use Agora)
- External databases (keep it local)
- AWS services (not required)
- Complex authentication

## Success Criteria

### Demo Must Work
1. Camera starts immediately
2. Detects chair placed in front
3. Agora says: "Chair ahead, slightly left"
4. Teammate enters frame
5. Agora says: "[Name] is in front of you"
6. User asks: "What's in front?"
7. Agora responds with current scene

### Performance Targets
- Voice response <2 seconds
- Object detection 2-3 FPS
- Face recognition <1 second
- No false positives in demo

## Key Files to Create

```
src/
├── components/
│   ├── WebcamFeed.tsx
│   ├── ObjectDetector.tsx
│   ├── FaceRecognizer.tsx
│   ├── Dashboard.tsx
│   └── VoiceInterface.tsx
├── services/
│   ├── agora.ts
│   ├── cvPipeline.ts
│   └── contextBuilder.ts
├── hooks/
│   ├── useWebcam.ts
│   ├── useObjectDetection.ts
│   └── useFaceRecognition.ts
└── utils/
    ├── hazardAnalysis.ts
    └── voiceCommands.ts
```

## Testing Strategy

### Local Testing
1. Use household objects (chair, bottle, bag)
2. Test with 1-2 pre-registered teammates
3. Verify voice responses are concise
4. Check fallback modes work

### Demo Preparation
1. Create 3 test scenarios
2. Prepare backup video
3. Set confidence thresholds
4. Practice voice commands

## Common Pitfalls

### CV Issues
- Poor lighting affects detection
- Multiple objects cause confusion
- Face recognition needs clear angles

### Agora Issues  
- Network latency impacts voice
- ConvoAI context limits
- Audio permission problems

### Demo Issues
- False positives ruin pitch
- Slow responses seem broken
- Complex UI distracts judges

## Emergency Fallbacks

If CV fails:
- Use manual trigger buttons
- Pre-record object names
- Show detection confidence

If Agora fails:
- Show text transcript
- Use local TTS backup
- Explain voice component

## Final Checklist

Before calling it done:
- [ ] Webcam feed works
- [ ] Objects detected and named
- [ ] Hazards trigger alerts
- [ ] Known faces recognized
- [ ] Agora speaks responses
- [ ] Voice commands work
- [ ] UI shows status clearly
- [ ] Demo scenarios tested
- [ ] Fallback modes ready

Remember: Build the smallest, strongest version that clearly demonstrates assistive awareness through Agora voice interaction.