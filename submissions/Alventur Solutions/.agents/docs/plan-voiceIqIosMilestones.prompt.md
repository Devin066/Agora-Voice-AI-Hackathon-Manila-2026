## Plan: Clara iOS SwiftUI Milestones

Build the iOS app in milestone slices that deliver a demo-ready P0 first, then layer P1 enhancements. The approach is functional-first UI: establish navigation and live-session flow quickly with mocked/live-safe data paths, then harden metrics fidelity and polish native iOS experiences.

**Steps**
1. Milestone 1: Foundation and app skeleton. Replace the starter template with Clara app structure across Presentation, Domain, Services, Native Features, and Data layers; define ScenarioType and session state contracts; set up dependency injection at app entry. This unblocks all later milestones.
2. Milestone 2: Scenario selection and root navigation (*depends on 1*). Implement ScenarioPicker screen and navigation routing into a Live Session screen shell and Summary screen shell; persist selected scenario preference locally.
3. Milestone 3: Live session UI with simulated metrics (*depends on 2*). Build the full Live Session SwiftUI surface (timer, pitch graph area, metric cards, waveform placeholder, AI speaking indicator, stop action) with mock/live-preview data so interaction flow is demoable before deep integrations.
4. Milestone 4: On-device analysis pipeline integration (*depends on 3*). Connect AVAudioEngine + pitch analysis and Speech framework streams into a MetricsAggregator, wiring real-time WPM/filler/pitch/energy updates to Live Session UI; add pause-detection signals for coaching windows.
5. Milestone 5: Session orchestration and persistence (*depends on 4*). Implement VoiceSessionCoordinator state machine (IDLE, CONNECTING, ACTIVE, STOPPING, SUMMARY), capture final metric aggregates, compute weighted scores, and persist VoiceSession + SessionMetrics via SwiftData.
6. Milestone 6: Summary experience and replay loop (*depends on 5*). Implement Session Summary UI (overall score ring, sub-scores, intonation label, filler breakdown, WPM range comparison) and Practice Again path back to scenario picker.
7. Milestone 7: Native iOS interactions for demo impact (*depends on 5; parallel with 6*). Add Back Tap handling that triggers a Dynamic Island prompt for scenario selection to start the session. Implement CoreHaptics filler alerts; include safe fallback controls in-app for non-device/simulator limitations. (Dynamic Island is now a P0 requirement).
8. Milestone 8: P0 hardening and demo readiness (*depends on 6 and 7*). Add error/permission states, recovery paths, loading states, and manual QA scripts for a continuous 3-minute no-crash run.
9. Milestone 9: P1 enhancements (*depends on 8*). Add History screen, monotone detection and intonation segment labels, and Active Session metrics in Dynamic Island (pitch/WPM); finish with visual polish pass (animations/spacing/typography consistency).

**Relevant files**
- /Agora-Voice-AI-Hackathon-Manila-2026/submissions/Alventur Solutions/.agents/PRD.md — source of iOS scope, layer definitions, metrics, state machine, and success criteria.
- /Agora-Voice-AI-Hackathon-Manila-2026/submissions/Alventur Solutions/Clara/Clara/ClaraApp.swift — app composition root; set model container and dependency wiring.
- /Agora-Voice-AI-Hackathon-Manila-2026/submissions/Alventur Solutions/Clara/Clara/ContentView.swift — replace template entry UI with Clara root navigation.
- /Agora-Voice-AI-Hackathon-Manila-2026/submissions/Alventur Solutions/Clara/Clara/Item.swift — retire/replace template model with VoiceSession and SessionMetrics models.
- /Agora-Voice-AI-Hackathon-Manila-2026/submissions/Alventur Solutions/Clara/Clara.xcodeproj/project.pbxproj — add required package/capability/plist settings for microphone/speech/native features.

**Verification**
1. Milestone-end UI walkthrough checks: Scenario Picker -> Live Session -> Summary -> Practice Again.
2. Real-device checks for microphone, speech recognition, and Back Tap behavior (simulator not accepted for these features).
3. Metrics validation checks: pitch stream cadence, WPM refresh cadence, filler counting behavior, pause event emission.
4. Persistence checks: session appears with expected summary fields after stop and app relaunch.
5. P0 exit gate: all success criteria in PRD section 14 pass in one uninterrupted 3-minute demo run.
6. P1 exit gate: Dynamic Island updates during active session and history list renders prior sessions correctly.

**Decisions**
- Include both P0 and P1 milestones.
- Keep planning at high-level roadmap granularity, not task-by-task coding checklist.
- UI execution strategy is functional-first, then polish.
- Backend implementation details are explicitly excluded; iOS will consume API contracts as-is.

**Further Considerations**
1. Decide whether to create one monolithic iOS target first, then split widget/live-activity target during P1, or scaffold both targets early to reduce late integration risk.
2. Decide if charts are custom-drawn SwiftUI (Canvas/Path) or use Apple Charts for faster delivery and simpler maintenance.
3. Decide whether session-history persistence remains fully local for hackathon scope or includes optional sync hooks for future backend expansion.