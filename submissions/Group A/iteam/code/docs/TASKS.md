# VisionVoice: Implementation Tasks

## Team Split (Suggested)

**Team Lead**: Architecture, Agora integration, overall coordination
**CV Engineer**: Object detection, face recognition, hazard analysis  
**Voice/AI Engineer**: Agora ConvoAI integration, context building
**Frontend Developer**: UI dashboard, webcam integration, polish
**QA/Demo**: Testing, fallback modes, demo scenarios

## 📅 Implementation Timeline

**Duration**: 1-Day Hackathon

### Phase 1: Foundation (Hours 1-2)
- [ ] Initialize React + Vite + Tailwind project
- [ ] Set up Agora credentials and environment variables
- [ ] Build basic UI layout (Webcam feed, status bar, transcript)
- [ ] Implement `useWebcam` hook and display video stream

### Phase 2: Local Perception (Hours 2-4)
- [ ] Integrate `@tensorflow-models/coco-ssd` for object detection
- [ ] Draw bounding boxes on canvas overlay
- [ ] Implement basic hazard heuristics (size/position of objects)
- [ ] *Optional:* Integrate `@vladmandic/face-api` for known person recognition

### Phase 3: Voice Integration (Hours 4-6)
- [ ] Connect Agora ConvoAI SDK
- [ ] Build `contextBuilder.ts` to convert CV detections into text prompts
- [ ] Feed context into Agora Agent
- [ ] Verify agent speaks proactive alerts (e.g., "Chair ahead")

### Phase 4: Polish & Fallbacks (Hours 6-8)
- [ ] Refine UI/UX for live demo
- [ ] Implement "Call for Help" caregiver escalation button (Agora RTC)
- [ ] Test fallback modes (text input, mock data)
- [ ] Record backup demo video

## Must-Have vs Nice-to-Have

### 🔴 Must-Have (MVP Blockers)
- [ ] Webcam feed and capture
- [ ] Object detection for chair, table, bottle
- [ ] Hazard proximity alerts
- [ ] Agora ConvoAI voice responses
- [ ] Basic dashboard UI
- [ ] Voice commands "What's in front?" "Who's here?"
- [ ] Known person recognition (1-2 people)
- [ ] Demo scenario that works reliably

### 🟡 Should-Have (Demo Enhancers)
- [ ] Multiple object tracking
- [ ] Confidence indicators
- [ ] Voice transcript history
- [ ] Dark/light theme
- [ ] Caregiver escalation
- [ ] OCR for signs
- [ ] Mobile responsiveness
- [ ] Performance optimizations

### 🟢 Nice-to-Have (If Time Permits)
- [ ] Multiple language support
- [ ] Advanced hazard types (stairs, drop-offs)
- [ ] Gesture controls
- [ ] Advanced caregiver features
- [ ] Analytics dashboard
- [ ] Accessibility settings
- [ ] Offline mode
- [ ] Advanced OCR

## Risk Mitigation

### Technical Risks
**CV Accuracy Issues** → Lower confidence thresholds, manual triggers ready
**Agora Latency** → Local TTS backup, pre-recorded responses
**Browser Compatibility** → Test early, have fallback browsers ready

### Demo Risks  
**False Positives** → Tune confidence >70%, test extensively
**Network Failures** → Local modes, backup video recorded
**Lighting Problems** → Test multiple conditions, have portable lights

### Competition Risks
**Feature Creep** → Stick to MVP, avoid scope expansion
**Overpromising** → Clear accuracy disclaimers, demo what works
**Technical Difficulties** → Multiple backup plans, recorded demos

## Daily Checkpoints

**Day 1**: Webcam working, basic UI complete
**Day 2**: Object detection working, detects chair reliably  
**Day 3**: Face recognition working, knows teammates
**Day 4**: Agora voice integration complete, speaks detections
**Day 5**: UI polished, demo scenarios working
**Day 6**: Caregiver features added, testing complete
**Day 7**: Fallbacks ready, backup video recorded
**Day 8**: Pitch perfected, documentation complete
**Day 9**: Final testing, competition ready

## Final Deliverables

- [ ] Working demo application
- [ ] GitHub repository with documentation
- [ ] 2-minute pitch video
- [ ] Technical architecture explanation
- [ ] Backup demo video
- [ ] Team presentation materials

**Remember**: Build the smallest, strongest version that clearly demonstrates assistive awareness through Agora voice interaction. Perfect the demo, then add features.