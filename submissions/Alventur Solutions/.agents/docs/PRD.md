# Clara — Real-Time AI Voice Trainer
## Product Requirements Document + System Architecture
**Hackathon:** AWS Cloud Clubs x Agora Philippines  
**Track:** Conversational AI / Real-Time Engagement  
**Stack:** iOS (SwiftUI) + Agora ConvoAI + Custom Backend  
**Version:** 1.0 — Hackathon Build  

---

## 1. Product Overview

### 1.1 Problem Statement
Public speaking is the #1 fear globally, yet existing training tools (Toastmasters apps, Speeko, VirtualSpeech) only provide feedback *after* a speech ends. There is no tool that listens in real time, analyzes voice characteristics as you speak, and provides intelligent, context-aware feedback *during* the session — the way a human coach would.

### 1.2 Solution
Clara is an iOS application powered by Agora ConvoAI that acts as a real-time AI voice coach. The user speaks in a chosen scenario (public speech, job interview, debate, English fluency practice). The app simultaneously analyzes pitch, intonation, pacing, filler words, and vocal energy using native iOS audio APIs, while an Agora ConvoAI agent listens and delivers intelligent spoken feedback during natural pauses — without interrupting the speaker's flow.

### 1.3 Core Value Proposition
- Feedback happens **during** the session, not after
- The AI coach **speaks back** to the user — it is a two-way voice conversation
- Native iOS features (Back Tap to trigger Dynamic Island prompts, CoreHaptics) make the experience feel premium and frictionless
- Metrics are scientific, specific, and actionable — not generic

### 1.4 Target Users
- Students preparing for oral presentations or debates
- Fresh graduates practicing for job interviews
- Professionals preparing pitches or public talks
- Filipino ESL learners building English speaking confidence

---

## 2. Team Responsibilities

### 2.1 iOS Developer (Frontend)
Owns everything inside the iOS app:
- SwiftUI UI across all screens
- AVAudioEngine audio pipeline and pitch analysis
- Apple Speech framework integration for filler word detection
- Agora iOS SDK integration (joining channel, receiving agent voice)
- CoreHaptics, Back Tap, Dynamic Island, Live Activity
- Local data persistence (SwiftData)
- Calling all backend REST API endpoints

### 2.2 Backend Developer
Owns everything outside the iOS app:
- Agora ConvoAI agent setup, configuration, and system prompts per scenario
- Agora token generation server
- REST API endpoints that the iOS app calls
- Agent start/stop lifecycle management
- LLM prompt engineering for each scenario persona
- Any cloud infrastructure (AWS preferred per hackathon guidelines)

### 2.3 Integration Contract
The iOS app and backend communicate exclusively via REST API over HTTPS. The iOS app never directly manages the ConvoAI agent — it only calls backend endpoints. The backend never touches the iOS UI layer.

---

## 3. Feature Scope (Hackathon Build)

### 3.1 Must-Have (P0)
These features must work in the demo.

| Feature | Description |
|---|---|
| Scenario selection | User picks a training mode before starting |
| Live voice session | User speaks, ConvoAI agent listens and responds |
| Real-time pitch graph | Live Hz visualization during speech |
| Filler word counter | Live count of um, uh, ano, like during speech |
| WPM meter | Words per minute tracked in real time |
| AI spoken feedback | ConvoAI agent speaks feedback during user's pauses |
| Session summary | Post-session report with all metrics |
| Back Tap & Dynamic Island | Double tap Apple logo expands Dynamic Island prompting the user for scenario selection to start session |

### 3.2 Should-Have (P1)
Include if time permits.

| Feature | Description |
|---|---|
| Dynamic Island live metrics | Pitch + WPM shown on Dynamic Island during active session |
| CoreHaptics on filler words | Phone buzzes every time a filler word is detected |
| Session history | Past sessions stored and viewable |
| Monotone detection | Alert when pitch variance is too low for too long |
| Intonation pattern label | Rising / falling / flat label per sentence segment |

### 3.3 Out of Scope (Hackathon)
- Android support
- User accounts or authentication
- Social sharing
- Video analysis
- Offline AI (ConvoAI requires network)

---

## 4. Scenarios

Each scenario changes the ConvoAI agent's persona, system prompt, and evaluation criteria. The iOS app sends the selected scenario identifier to the backend when starting a session. The backend configures the agent accordingly.

### 4.1 Public Speaking Coach
- **Agent persona:** Strict but encouraging TED talk coach
- **Evaluates:** Pacing, pitch variety, pause usage, filler words, opening and closing strength
- **Feedback style:** Constructive, specific, motivating

### 4.2 Job Interview Prep
- **Agent persona:** HR interviewer conducting a mock behavioral interview
- **Evaluates:** Clarity of answers, confidence (pitch), filler frequency, conciseness, answer structure
- **Feedback style:** Professional, direct, STAR-method aware

### 4.3 Debate Coach
- **Agent persona:** Strict debate judge
- **Evaluates:** Argument coherence, speaking speed, vocal authority (pitch and volume), rebuttal clarity
- **Feedback style:** Formal, point-by-point critique

### 4.4 English Fluency (Filipino-focused)
- **Agent persona:** Friendly English conversation partner
- **Evaluates:** Pronunciation clarity, grammar in speech, filler words (including Filipino fillers: ano, eh, kasi), pacing
- **Feedback style:** Warm, patient, celebrates improvement

---

## 5. Metrics Definitions

These are the specific measurements the iOS app computes locally from the audio stream.

| Metric | Source | Computation | Update Rate |
|---|---|---|---|
| Pitch (Hz) | AVAudioEngine + vDSP autocorrelation | Fundamental frequency of voice | Every 100ms |
| Pitch range | PitchAnalyzer | Max Hz − Min Hz over segment | Per sentence segment |
| Pitch variance | PitchAnalyzer | Statistical variance of Hz samples | Per sentence segment |
| Intonation pattern | PitchAnalyzer | Compare first 5 vs last 5 Hz samples | Per pause |
| Monotone flag | PitchAnalyzer | Variance < 25 threshold | Per segment |
| WPM | Apple Speech framework | Word count / elapsed time × 60 | Every 5 seconds |
| Filler word count | Apple Speech framework | Pattern match on transcription | Real-time |
| Pause detection | Apple Speech framework | Silence gap > 1.5 seconds | Real-time |
| Vocal energy (RMS) | AVAudioEngine | Root mean square of PCM buffer | Every 100ms |

### 5.1 Score Calculation (Post-Session)
The session summary screen shows an overall score (0–100) computed from weighted sub-scores.

| Sub-score | Weight | Based on |
|---|---|---|
| Pacing score | 20% | WPM within 130–160 range for natural speech |
| Intonation score | 25% | Pitch variance and range — higher = more expressive |
| Filler score | 25% | Fewer fillers per minute = higher score |
| Confidence score | 20% | Average vocal energy RMS level |
| Fluency score | 10% | Pause frequency and length |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    iOS App (SwiftUI)                │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐   │
│  │ Presentation│  │    Domain    │  │   Data    │   │
│  │   Layer     │  │    Layer     │  │   Layer   │   │
│  └─────────────┘  └──────────────┘  └───────────┘   │
│                                                     │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Agora   │  │ AVAudio +  │  │ Apple Speech    │  │
│  │  iOS SDK │  │ PitchAnalyz│  │ Framework       │  │
│  └──────────┘  └────────────┘  └─────────────────┘  │
│                                                     │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ Back Tap │  │CoreHaptics │  │ ActivityKit     │  │
│  │(Accessib)│  │            │  │ Dynamic Island  │  │
│  └──────────┘  └────────────┘  └─────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API
          ┌────────────▼────────────────────┐
          │         Backend (AWS)           │
          │                                 │
          │  ┌──────────────────────────┐   │
          │  │  Token Generation Server │   │
          │  └──────────────────────────┘   │
          │                                 │
          │  ┌──────────────────────────┐   │
          │  │  ConvoAI Agent Manager   │   │
          │  │  (start / stop / config) │   │
          │  └──────────────────────────┘   │
          │                                 │
          │  ┌──────────────────────────┐   │
          │  │  Scenario Prompt Engine  │   │
          │  └──────────────────────────┘   │
          └────────────────┬────────────────┘
                           │ Agora Cloud APIs
          ┌────────────────▼────────────────┐
          │           Agora Cloud           │
          │  RTC Infrastructure             │
          │  ConvoAI Agent (LLM-powered)    │
          └─────────────────────────────────┘
```

### 6.2 iOS App Layer Breakdown

#### Presentation Layer (SwiftUI Views)
- `ScenarioPickerView` — grid of scenario cards, user picks before session
- `SessionView` — the main live session screen with real-time meters
- `MetricsDashboardView` — post-session summary with scores and breakdown
- `HistoryView` — list of past sessions (P1)
- `LiveActivityWidget` — Dynamic Island / Lock Screen live metrics (P1)

#### Domain Layer (Swift Classes / Actors)
- `VoiceSessionCoordinator` — master state machine, orchestrates session lifecycle
- `MetricsAggregator` — collects raw samples from analyzers, computes scores
- `ScenarioEngine` — holds scenario definitions and maps to API payloads

#### Services Layer
- `AgoraRTCService` — wraps Agora iOS SDK, manages channel join/leave
- `PitchAnalyzer` — AVAudioEngine tap + vDSP autocorrelation → Hz output
- `SpeechAnalyzer` — Apple Speech framework → transcription, fillers, WPM

#### Native Features Layer
- `BackTapHandler` — registers UIAccessibility magic tap, triggers Dynamic Island scenario prompt
- `HapticsEngine` — CoreHaptics patterns for filler word alerts
- `LiveActivityManager` — handles Dynamic Island UI (scenario prompt and active session metrics)

#### Data Layer
- `SwiftData` — stores `VoiceSession` and `SessionMetrics` models locally
- `UserDefaults` — stores scenario preference and onboarding state
- `Keychain` — stores Agora token securely

### 6.3 Audio Pipeline (iOS-side)

```
Device Microphone
        │
        ▼
AVAudioEngine (inputNode)
        │
        ├──── installTap(bufferSize: 4096)
        │              │
        │              ├──► PitchAnalyzer
        │              │    vDSP autocorrelation
        │              │    Output: Hz every 100ms
        │              │
        │              └──► MetricsAggregator
        │                   accumulates samples
        │
        └──── Agora SDK reads same mic stream
                       │
                       ▼
              Agora RTC Channel
                       │
                       ▼
              ConvoAI Agent (cloud)
                       │
                       ▼
              Agent voice comes back
              through Agora channel
                       │
                       ▼
              Plays through iOS speaker

Apple Speech Framework runs in parallel:
        │
        ├──► SFSpeechAudioBufferRecognitionRequest
        │    receives same audio
        │
        └──► Transcription result stream
             → filler word pattern match
             → WPM calculation
             → pause detection
```

### 6.4 Session State Machine

```
IDLE
  │
  │  [User taps Start in App OR User Back Taps -> Dynamic Island Prompts -> Selects Scenario]
  ▼
CONNECTING
  │  POST /session/start → backend
  │  Backend starts ConvoAI agent
  │  Backend returns: channelId, token, agentUid
  │
  ▼
ACTIVE
  │  AVAudioEngine running
  │  PitchAnalyzer running
  │  SpeechAnalyzer running
  │  Agora joined channel
  │  ConvoAI agent in channel
  │
  │  [User pauses for > 1.5 seconds]
  │      → ConvoAI agent speaks feedback
  │      → iOS resumes analysis after agent finishes
  │
  │  [User taps Stop in App OR Dynamic Island Stop Button]
  ▼
STOPPING
  │  POST /session/stop → backend
  │  Backend stops ConvoAI agent
  │  Agora leaves channel
  │  Analyzers stop
  │  MetricsAggregator computes final scores
  │  SwiftData saves session
  │
  ▼
SUMMARY
     Shows MetricsDashboardView
```

---

## 7. API Contract

The iOS app communicates with the backend via these REST endpoints. All endpoints return JSON. All requests include `Content-Type: application/json`.

### 7.1 Generate Token
Used to get a valid Agora RTC token before joining a channel.

**Request**
```
POST /token/generate
```
```json
{
  "channelName": "string",
  "uid": "number"
}
```

**Response**
```json
{
  "token": "string",
  "channelName": "string",
  "uid": "number",
  "expiresAt": "ISO8601 timestamp"
}
```

### 7.2 Start Session
Starts the ConvoAI agent for this session. The backend creates an agent with the correct scenario system prompt and joins it to the channel.

**Request**
```
POST /session/start
```
```json
{
  "channelName": "string",
  "scenario": "public_speaking | job_interview | debate | english_fluency",
  "userId": "string (optional, for history)"
}
```

**Response**
```json
{
  "sessionId": "string",
  "agentUid": "number",
  "channelName": "string",
  "status": "active"
}
```

### 7.3 Stop Session
Stops the ConvoAI agent and cleans up the channel.

**Request**
```
POST /session/stop
```
```json
{
  "sessionId": "string",
  "channelName": "string"
}
```

**Response**
```json
{
  "sessionId": "string",
  "status": "stopped",
  "stoppedAt": "ISO8601 timestamp"
}
```

### 7.4 Health Check
Simple ping to verify backend is reachable before starting a session.

**Request**
```
GET /health
```

**Response**
```json
{
  "status": "ok",
  "timestamp": "ISO8601 timestamp"
}
```

---

## 8. Data Models

### 8.1 iOS Local Models (SwiftData)

```
VoiceSession
├── id: UUID
├── scenario: ScenarioType (enum)
├── startedAt: Date
├── endedAt: Date
├── durationSeconds: Int
└── metrics: SessionMetrics (relationship)

SessionMetrics
├── id: UUID
├── overallScore: Float (0–100)
├── pacingScore: Float
├── intonationScore: Float
├── fillerScore: Float
├── confidenceScore: Float
├── fluencyScore: Float
├── averagePitchHz: Float
├── pitchRangeHz: Float
├── pitchVariance: Float
├── intonationPattern: String
├── averageWPM: Int
├── totalFillerWords: Int
├── fillerWordsPerMinute: Float
├── totalPauses: Int
├── averagePauseDuration: Float
└── session: VoiceSession (relationship)
```

### 8.2 Scenario Type Enum

```
ScenarioType
├── publicSpeaking
├── jobInterview
├── debate
└── englishFluency
```

---

## 9. iOS Technical Requirements

### 9.1 Minimum Requirements
- iOS 17.0+
- Xcode 16+
- Swift 5.10+
- iPhone (iPad not required for hackathon)
- Physical device required for microphone and Back Tap testing (simulator has no mic)

### 9.2 Dependencies
- Agora iOS SDK (via Swift Package Manager)
  - URL: `https://github.com/AgoraIO/AgoraRtcEngine_iOS`
- All other dependencies are native Apple frameworks (no extra packages)
  - AVFoundation (audio engine)
  - Speech (transcription)
  - Accelerate / vDSP (pitch computation)
  - ActivityKit (Live Activity)
  - CoreHaptics
  - SwiftData
  - SwiftUI

### 9.3 Permissions Required (Info.plist)
```
NSMicrophoneUsageDescription
NSSpeechRecognitionUsageDescription
```

### 9.4 Capabilities Required (Xcode project)
```
Background Modes → Audio (for session to continue when app is backgrounded)
Push Notifications (for session summary notification)
```

---

## 10. Backend Technical Requirements

### 10.1 Responsibilities
The backend team owns all of the following. The iOS app treats all of this as a black box and only calls the API endpoints defined in Section 7.

- Agora project setup and App ID management
- Token generation server (Agora RTC token, expires in 1 hour per session)
- Agora ConvoAI agent initialization with correct scenario system prompts
- Agent lifecycle management (start agent when session starts, stop when session ends)
- LLM prompt design for each of the four scenarios
- Agent configuration: language detection, interruption sensitivity, response timing
- AWS hosting of the token server and agent manager

### 10.2 Agora ConvoAI Configuration Guidance (for backend team)
- Agent should **not interrupt** while the user is speaking — only respond during detected silence gaps
- Response length should be **short** (2–4 sentences max) — this is real-time coaching, not a lecture
- Agent should be aware it is a **voice coach** — feedback references specific behaviors, not general advice
- System prompt should include the **scenario context** so the agent evaluates appropriately
- For English Fluency scenario, agent should **detect Filipino filler words** (ano, eh, kasi, parang) in addition to English ones

### 10.3 Recommended AWS Stack
- AWS Lambda for token generation (stateless, cheap, fast)
- AWS API Gateway to expose REST endpoints
- AWS Secrets Manager for Agora credentials
- EC2 or Lambda for ConvoAI agent manager (stateful per session)

---

## 11. Screens & User Flow

```
App Launch
    │
    ▼
Scenario Picker Screen
    │  User selects a scenario (4 cards)
    │  "Start Session" button
    │
    ▼
Live Session Screen
    │
    ├── Top: Session timer + scenario label
    │
    ├── Center: Real-time pitch graph (line chart, updates every 100ms)
    │
    ├── Metrics row:
    │   [WPM meter] [Filler count] [Pitch Hz] [Energy bar]
    │
    ├── Bottom: Waveform visualization + Stop button
    │
    │  Agent speaking indicator (pulsing orb when AI is talking)
    │
    ▼
Session Summary Screen
    │
    ├── Overall score (large, circular score ring)
    │
    ├── Sub-scores: Pacing / Intonation / Fillers / Confidence / Fluency
    │
    ├── Intonation pattern label (rising / falling / flat)
    │
    ├── Filler word breakdown (which words, how many)
    │
    ├── Average WPM with ideal range comparison
    │
    └── "Practice Again" button → back to Scenario Picker
```

---

## 12. Demo Script (Hackathon Presentation)

This is the recommended live demo flow for judges.

1. Open app → show Scenario Picker → select "Job Interview Prep"
2. **Double tap the Apple logo** → Dynamic Island expands, asking what scenario you want to practice. User selects and session starts (Back Tap + Dynamic Island wow moment)
3. Speak for 30 seconds, intentionally using filler words — show the live filler counter incrementing and the **phone buzzing** on each filler word
4. Pause deliberately — ConvoAI agent speaks back with feedback on the filler words
5. Continue speaking with more varied pitch — show the live pitch graph moving dynamically
6. Lock the screen → show the **Dynamic Island** displaying live WPM and pitch
7. Stop the session → session summary screen with scores
8. Point out: everything from pitch analysis to filler detection ran entirely on-device. Only the AI feedback voice required the cloud.

---

## 13. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Agora ConvoAI agent setup takes too long | Medium | Backend team starts this first, before any iOS work |
| Agent interrupts user mid-sentence | Medium | Configure interruption sensitivity in agent settings to high threshold |
| Pitch detection noisy in loud room | Low | Apply RMS threshold — only analyze when volume > 0.01 |
| Speech framework transcription lag | Low | Use on-device recognition mode (faster, no network) |
| Back Tap not working on device | Low | Ensure Accessibility > Touch > Back Tap is configured on test device before demo |
| No physical iPhone available | High risk | Must test on real device — simulator has no mic or Back Tap |

---

## 14. Success Criteria

The hackathon build is considered successful if all of the following are demonstrated:

- [ ] User can select a scenario and start a session
- [ ] ConvoAI agent joins the session and speaks feedback during pauses
- [ ] Real-time pitch graph updates live during speech
- [ ] Filler word counter increments correctly during speech
- [ ] WPM updates every 5 seconds
- [ ] Back Tap triggers Dynamic Island prompting user for scenario selection, which then starts the session
- [ ] Session summary shows meaningful scores after session ends
- [ ] Demo runs without crashing for at least 3 minutes

---

*Document version: 1.0 — Hackathon Build*  
*Last updated: March 2026*