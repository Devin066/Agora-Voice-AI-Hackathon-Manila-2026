**VoiceIQ**

Real-Time AI Voice Trainer

*Product Requirements Document \+ System Architecture*

**Hackathon: AWS Cloud Clubs x Agora Philippines**

Track: Conversational AI / Real-Time Engagement

Stack: iOS (SwiftUI) \+ Agora ConvoAI \+ Python FastAPI Backend (AWS Lambda)

*Version: 1.0 — Hackathon Build*

# **1\. Product Overview**

## **1.1 Problem Statement**

Public speaking is the \#1 fear globally, yet existing training tools (Toastmasters apps, Speeko, VirtualSpeech) only provide feedback after a speech ends. There is no tool that listens in real time, analyzes voice characteristics as you speak, and provides intelligent, context-aware feedback during the session — the way a human coach would.

## **1.2 Solution**

VoiceIQ is an iOS application powered by Agora ConvoAI that acts as a real-time AI voice coach. The user speaks in a chosen scenario (public speech, job interview, debate, English fluency practice). The app simultaneously analyzes pitch, intonation, pacing, filler words, and vocal energy using native iOS audio APIs, while an Agora ConvoAI agent listens and delivers intelligent spoken feedback during natural pauses — without interrupting the speaker's flow.

## **1.3 Core Value Proposition**

* Feedback happens during the session, not after

* The AI coach speaks back to the user — it is a two-way voice conversation

* Native iOS features (Back Tap, Dynamic Island, CoreHaptics) make the experience feel premium and frictionless

* Metrics are scientific, specific, and actionable — not generic

## **1.4 Target Users**

* Students preparing for oral presentations or debates

* Fresh graduates practicing for job interviews

* Professionals preparing pitches or public talks

* Filipino ESL learners building English speaking confidence

# **2\. Team Responsibilities**

## **2.1 iOS Developer (Frontend)**

Owns everything inside the iOS app:

* SwiftUI UI across all screens

* AVAudioEngine audio pipeline and pitch analysis

* Apple Speech framework integration for filler word detection

* Agora iOS SDK integration (joining channel, receiving agent voice)

* CoreHaptics, Back Tap, Dynamic Island, Live Activity

* Local data persistence (SwiftData)

* Calling all backend REST API endpoints

## **2.2 Backend Developer**

Owns everything outside the iOS app:

* FastAPI server deployed as AWS Lambda Lambdalith via Lambda Web Adapter

* Agora ConvoAI agent setup, configuration, and system prompts per scenario

* Agora RTC token generation endpoint

* REST API endpoints that the iOS app calls

* Agent start/stop lifecycle management via /session/start and /session/stop

* LLM prompt engineering for each scenario persona using Gemini 2.5 Flash

* AWS infrastructure: Lambda \+ API Gateway \+ ECR (container image deployment)

## **2.3 Backend Technology Stack**

| Component | Technology | Purpose |
| :---- | :---- | :---- |
| Language | Python 3.12 | Backend runtime |
| Framework | FastAPI | REST API server |
| Server | Uvicorn | ASGI server |
| Deployment | AWS Lambda (Lambdalith) | Serverless compute |
| Adapter | AWS Lambda Web Adapter | Runs Uvicorn inside Lambda |
| Container | Docker (python:3.12-alpine) | Lambda container image |
| Registry | AWS ECR | Container image storage |
| Gateway | AWS API Gateway | Exposes REST endpoints |
| LLM | Gemini 2.5 Flash | AI agent brain (OpenAI-compatible endpoint) |
| TTS | Microsoft Azure TTS or ElevenLabs | Agent voice synthesis |
| Token Builder | agora-token-builder | Generates Agora RTC tokens |

## **2.4 Integration Contract**

The iOS app and backend communicate exclusively via REST API over HTTPS. The iOS app never directly manages the ConvoAI agent — it only calls backend endpoints. The backend never touches the iOS UI layer.

# **3\. Feature Scope (Hackathon Build)**

## **3.1 Must-Have (P0)**

| Feature | Description |
| :---- | :---- |
| Scenario selection | User picks a training mode before starting |
| Live voice session | User speaks, ConvoAI agent listens and responds |
| Real-time pitch graph | Live Hz visualization during speech |
| Filler word counter | Live count of um, uh, ano, like during speech |
| WPM meter | Words per minute tracked in real time |
| AI spoken feedback | ConvoAI agent speaks feedback during user pauses |
| Session summary | Post-session report with all metrics |
| Back Tap to start/stop | Double tap Apple logo triggers session toggle |

## **3.2 Should-Have (P1)**

| Feature | Description |
| :---- | :---- |
| Dynamic Island live metrics | Pitch \+ WPM shown on Dynamic Island during session |
| CoreHaptics on filler words | Phone buzzes every time a filler word is detected |
| Session history | Past sessions stored and viewable |
| Monotone detection | Alert when pitch variance is too low for too long |
| Intonation pattern label | Rising / falling / flat label per sentence segment |

## **3.3 Out of Scope (Hackathon)**

* Android support

* User accounts or authentication

* Social sharing

* Video analysis

* Offline AI (ConvoAI requires network)

# **4\. Scenarios**

Each scenario changes the ConvoAI agent's persona, system prompt, and evaluation criteria. The iOS app sends the selected scenario identifier to the backend when starting a session via the scenario field in POST /session/start. The backend configures the agent accordingly using dedicated prompt modules.

| Scenario ID | Agent Persona | Feedback Style |
| :---- | :---- | :---- |
| public\_speaking | Strict but encouraging TED talk coach | Constructive, specific, motivating |
| job\_interview | HR interviewer conducting mock behavioral interview | Professional, direct, STAR-method aware |
| debate | Strict debate judge | Formal, point-by-point critique |
| english\_fluency | Friendly English conversation partner (Filipino-focused) | Warm, patient, celebrates improvement |

# **5\. Metrics Definitions**

These are the specific measurements the iOS app computes locally from the audio stream. The backend is not involved in metrics computation — all analysis runs on-device.

| Metric | Source | Computation | Update Rate |
| :---- | :---- | :---- | :---- |
| Pitch (Hz) | AVAudioEngine \+ vDSP autocorrelation | Fundamental frequency of voice | Every 100ms |
| Pitch range | PitchAnalyzer | Max Hz − Min Hz over segment | Per sentence segment |
| Pitch variance | PitchAnalyzer | Statistical variance of Hz samples | Per sentence segment |
| Intonation pattern | PitchAnalyzer | Compare first 5 vs last 5 Hz samples | Per pause |
| Monotone flag | PitchAnalyzer | Variance \< 25 threshold | Per segment |
| WPM | Apple Speech framework | Word count / elapsed time x 60 | Every 5 seconds |
| Filler word count | Apple Speech framework | Pattern match on transcription | Real-time |
| Pause detection | Apple Speech framework | Silence gap \> 1.5 seconds | Real-time |
| Vocal energy (RMS) | AVAudioEngine | Root mean square of PCM buffer | Every 100ms |

## **5.1 Score Calculation (Post-Session)**

| Sub-score | Weight | Based on |
| :---- | :---- | :---- |
| Pacing score | 20% | WPM within 130-160 range for natural speech |
| Intonation score | 25% | Pitch variance and range — higher \= more expressive |
| Filler score | 25% | Fewer fillers per minute \= higher score |
| Confidence score | 20% | Average vocal energy RMS level |
| Fluency score | 10% | Pause frequency and length |

# **6\. System Architecture**

## **6.1 Architecture Overview**

The system is composed of three layers: the iOS app (frontend), the Python FastAPI backend deployed as a Lambdalith on AWS Lambda, and Agora's cloud infrastructure (RTC \+ ConvoAI Engine). The backend acts exclusively as an orchestrator — it never handles audio or participates in the real-time voice conversation.

## **6.2 Lambda is NOT in the Realtime Path**

This is the most important architectural distinction. AWS Lambda handles only two short-lived API calls per session:

| Call | Endpoint | When | Duration |
| :---- | :---- | :---- | :---- |
| Session start | POST /session/start | User taps Start | \~500ms |
| Token generation | POST /token/generate | Before joining channel | \~200ms |
| Session stop | POST /session/stop | User taps Stop | \~200ms |

Between session start and session stop, Lambda is completely idle. The real-time voice conversation flows directly between the iOS app and Agora's infrastructure — Lambda is never in that path.

## **6.3 Realtime Voice Flow**

Once the session is started, the voice conversation flows as follows:

* User speaks into iPhone microphone

* Agora iOS SDK captures and streams audio to Agora RTC channel

* Agora ConvoAI Engine picks up the audio stream from the channel

* ASR (Automatic Speech Recognition) transcribes user speech to text

* Transcribed text is sent to Gemini 2.5 Flash via OpenAI-compatible endpoint

* Gemini generates a coaching response (2-4 sentences max)

* TTS (Microsoft Azure or ElevenLabs) converts response to audio

* Agent voice is injected back into the Agora RTC channel

* iOS app receives agent audio and plays it through the speaker

## **6.4 Why Gemini Uses OpenAI-Compatible Endpoint**

Agora ConvoAI Engine communicates with LLMs using the OpenAI Chat Completions API format. Gemini 2.5 Flash exposes an OpenAI-compatible endpoint at Google's servers, authenticated with a Gemini API key — not an OpenAI key. This means no code changes are needed to swap LLM providers; only the LLM\_URL, LLM\_TOKEN, and LLM\_MODEL environment variables need to change.

## **6.5 Backend Project Structure**

The api/ folder contains the complete Lambdalith:

| File / Folder | Purpose |
| :---- | :---- |
| Dockerfile | Container image build using python:3.12-alpine \+ Lambda Web Adapter |
| requirements.txt | Python dependencies (fastapi, uvicorn, httpx, agora-token-builder, etc.) |
| main.py | FastAPI app entry point, CORS config, route registration, health check |
| routes/token.py | POST /token/generate — Agora RTC token generation |
| routes/session.py | POST /session/start and POST /session/stop — agent lifecycle |
| class\_types/agora\_convo\_ai\_types.py | TTSVendor, TTSConfig, AgentResponse Pydantic models |
| class\_types/client\_request\_types.py | StartSessionRequest, StopSessionRequest Pydantic models |
| prompts/public\_speaking.py | System prompt for TED talk coach persona |
| prompts/job\_interview.py | System prompt for HR interviewer persona |
| prompts/debate.py | System prompt for debate judge persona |
| prompts/english\_fluency.py | System prompt for Filipino ESL partner persona |

## **6.6 Dockerfile**

The Dockerfile uses AWS Lambda Web Adapter to run Uvicorn natively inside Lambda without Mangum or any ASGI wrapper:

`FROM python:3.12-alpine`

`COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter`

`ENV PORT=8000`

`WORKDIR /var/task`

`COPY requirements.txt ./`

`RUN python -m pip install -r requirements.txt`

`COPY main.py ./`

`COPY class_types ./class_types`

`COPY routes ./routes`

`COPY prompts ./prompts`

`CMD exec uvicorn main:app --port=$PORT --host=0.0.0.0 --limit-concurrency=100`

## **6.7 iOS Audio Pipeline**

The iOS audio pipeline runs entirely on-device, in parallel with the Agora SDK:

* AVAudioEngine (inputNode) captures microphone input

* installTap(bufferSize: 4096\) forks the audio buffer to PitchAnalyzer (vDSP autocorrelation → Hz every 100ms)

* The same buffer feeds MetricsAggregator for accumulated samples

* Agora iOS SDK reads from the same microphone stream and sends to RTC channel

* Apple Speech Framework runs SFSpeechAudioBufferRecognitionRequest in parallel for transcription, filler detection, WPM, and pause detection

## **6.8 Session State Machine**

| State | Trigger | Backend Action | iOS Action |
| :---- | :---- | :---- | :---- |
| IDLE | App launch | None | Show Scenario Picker |
| CONNECTING | User taps Start / Back Tap | POST /token/generate then POST /session/start | Show connecting indicator |
| ACTIVE | Backend returns sessionId \+ token | Lambda idle | Join RTC, start analyzers, show live metrics |
| STOPPING | User taps Stop / Back Tap | POST /session/stop | Leave RTC, stop analyzers, compute scores |
| SUMMARY | Stop complete | None | Show MetricsDashboardView |

# **7\. API Contract**

All endpoints return JSON. All requests use Content-Type: application/json. Base URL is the AWS API Gateway endpoint pointing to the Lambda function.

## **7.1 Health Check**

**GET /health**

Simple ping to verify backend is reachable before starting a session.

Response:

`{ "status": "ok", "timestamp": "ISO8601 timestamp" }`

## **7.2 Generate Token**

**POST /token/generate**

Generates a valid Agora RTC token. Called by iOS before joining the channel.

Request body:

`{ "channelName": "string", "uid": "number" }`

Response:

`{ "token": "string", "channelName": "string", "uid": "number", "expiresAt": "ISO8601 timestamp" }`

Notes:

* If channelName is omitted, backend generates a unique name and returns it

* If uid is omitted, backend defaults to 0

* Token expires in 1 hour

## **7.3 Start Session**

**POST /session/start**

Starts the ConvoAI agent for this session. The backend selects the correct scenario system prompt, configures the agent, and joins it to the specified channel.

Request body:

`{ "channelName": "string", "scenario": "public_speaking | job_interview | debate | english_fluency", "userId": "string (optional)" }`

Response:

`{ "sessionId": "string", "agentUid": "number", "channelName": "string", "status": "active" }`

Notes:

* sessionId is the Agora agent\_id returned by ConvoAI Engine — stored by iOS for the stop call

* agentUid is the AGENT\_UID environment variable value

* Agent is configured with scenario-specific system prompt, VAD settings, and TTS voice

* Agent will only speak during detected silence gaps (VAD silence\_duration\_ms: 480\)

* Agent responses are limited to 2-4 sentences via system prompt instruction

## **7.4 Stop Session**

**POST /session/stop**

Stops the ConvoAI agent and removes it from the channel.

Request body:

`{ "sessionId": "string", "channelName": "string" }`

Response:

`{ "sessionId": "string", "status": "stopped", "stoppedAt": "ISO8601 timestamp" }`

# **8\. Backend Environment Variables**

All credentials and configuration are passed via environment variables. In production, these are set as Lambda environment variables or pulled from AWS Secrets Manager. The .env file is for local development only and is never committed or deployed.

| Variable | Description | Example Value |
| :---- | :---- | :---- |
| AGORA\_APP\_ID | Agora project App ID | abc123... |
| AGORA\_APP\_CERTIFICATE | Agora App Certificate for token signing | xyz789... |
| AGORA\_CUSTOMER\_ID | Agora REST API customer ID | customer\_id |
| AGORA\_CUSTOMER\_SECRET | Agora REST API customer secret | customer\_secret |
| AGORA\_CONVO\_AI\_BASE\_URL | Agora ConvoAI Engine base URL | https://api.agora.io/api/conversational-ai-agent/v2/projects |
| AGENT\_UID | UID assigned to the AI agent in the RTC channel | 0 |
| LLM\_URL | Gemini OpenAI-compatible endpoint | https://generativelanguage.googleapis.com/v1beta/openai/chat/completions |
| LLM\_TOKEN | Gemini API key (not OpenAI key) | AIza... |
| LLM\_MODEL | Gemini model name | gemini-2.5-flash-preview-04-17 |
| TTS\_VENDOR | TTS provider selection | microsoft or elevenlabs |
| MICROSOFT\_TTS\_KEY | Azure TTS API key | (if TTS\_VENDOR=microsoft) |
| MICROSOFT\_TTS\_REGION | Azure TTS region | eastus |
| MICROSOFT\_TTS\_VOICE\_NAME | Azure TTS voice | en-US-AndrewMultilingualNeural |
| MICROSOFT\_TTS\_RATE | Speech rate (0.5-2.0) | 1.0 |
| MICROSOFT\_TTS\_VOLUME | Speech volume (0-100) | 100.0 |
| ELEVENLABS\_API\_KEY | ElevenLabs API key | (if TTS\_VENDOR=elevenlabs) |
| ELEVENLABS\_VOICE\_ID | ElevenLabs voice ID | voice\_id |
| ELEVENLABS\_MODEL\_ID | ElevenLabs model | eleven\_flash\_v2\_5 |
| INPUT\_MODALITIES | Agent input types | text |
| OUTPUT\_MODALITIES | Agent output types | text,audio |
| PORT | Server port (Lambda Web Adapter) | 8000 |

# **9\. Data Models**

## **9.1 iOS Local Models (SwiftData)**

All session data is stored locally on-device. The backend has no database.

* VoiceSession: id (UUID), scenario (ScenarioType), startedAt (Date), endedAt (Date), durationSeconds (Int), metrics (SessionMetrics relationship)

* SessionMetrics: id, overallScore, pacingScore, intonationScore, fillerScore, confidenceScore, fluencyScore, averagePitchHz, pitchRangeHz, pitchVariance, intonationPattern, averageWPM, totalFillerWords, fillerWordsPerMinute, totalPauses, averagePauseDuration, session relationship

## **9.2 Scenario Type Enum**

* publicSpeaking

* jobInterview

* debate

* englishFluency

# **10\. iOS Technical Requirements**

## **10.1 Minimum Requirements**

* iOS 17.0+

* Xcode 16+

* Swift 5.10+

* Physical device required for microphone and Back Tap testing (simulator has no mic)

## **10.2 Dependencies**

* Agora iOS SDK via Swift Package Manager: https://github.com/AgoraIO/AgoraRtcEngine\_iOS

* All other dependencies are native Apple frameworks — no extra packages

* AVFoundation (audio engine), Speech (transcription), Accelerate/vDSP (pitch), ActivityKit (Live Activity), CoreHaptics, SwiftData, SwiftUI

## **10.3 Permissions Required**

* NSMicrophoneUsageDescription

* NSSpeechRecognitionUsageDescription

# **11\. Backend Technical Requirements**

## **11.1 Responsibilities**

* Agora project setup and App ID management

* Token generation server (POST /token/generate — Agora RTC token, 1 hour expiry)

* Agora ConvoAI agent initialization with correct scenario system prompts (POST /session/start)

* Agent lifecycle management: start agent on session start, stop on session stop (POST /session/stop)

* LLM prompt design for all four scenarios in prompts/ module

* Agent configuration: VAD interruption sensitivity, response length limits, TTS voice

* AWS hosting: Lambda (Lambdalith) \+ API Gateway \+ ECR

## **11.2 Agora ConvoAI Configuration**

* Agent must not interrupt while the user is speaking — VAD silence\_duration\_ms: 480ms

* Response length: 2-4 sentences max enforced via system prompt

* System prompt includes scenario context so agent evaluates appropriately

* For English Fluency scenario: system prompt instructs agent to detect Filipino filler words (ano, eh, kasi, parang) in addition to English ones

* idle\_timeout: 30 seconds — agent auto-leaves if no audio detected

## **11.3 AWS Stack**

| Service | Purpose |
| :---- | :---- |
| AWS Lambda | Hosts the FastAPI Lambdalith (container image runtime) |
| AWS API Gateway | Exposes REST endpoints to iOS app over HTTPS |
| AWS ECR | Stores the Docker container image |
| AWS Secrets Manager | Stores Agora credentials, LLM keys, TTS keys |

# **12\. Demo Script (Hackathon Presentation)**

Recommended live demo flow for judges:

1. Open app → show Scenario Picker → select "Job Interview Prep"

2. Double tap the Apple logo → session starts immediately (Back Tap wow moment)

3. Speak for 30 seconds using filler words — show the live filler counter and phone vibrating on each filler

4. Pause deliberately — ConvoAI agent speaks back with coaching feedback

5. Continue speaking with varied pitch — show the live pitch graph moving dynamically

6. Lock screen → show Dynamic Island displaying live WPM and pitch

7. Stop the session → session summary screen with scores

8. Point out: pitch analysis, filler detection, WPM all ran on-device. Only the AI feedback voice required the cloud.

# **13\. Risks & Mitigations**

| Risk | Likelihood | Mitigation |
| :---- | :---- | :---- |
| Agora ConvoAI agent setup takes too long | Medium | Backend team starts agent config and prompts first, before any iOS work |
| Agent interrupts user mid-sentence | Medium | Tune VAD silence\_duration\_ms — increase to 600ms if needed during testing |
| Gemini endpoint latency | Low | Gemini 2.5 Flash is optimized for low latency; monitor response times during testing |
| Lambda cold start on first session | Low | Only affects /session/start which runs once — 500ms is acceptable for users |
| Pitch detection noisy in loud room | Low | Apply RMS threshold — only analyze when volume \> 0.01 |
| Speech framework transcription lag | Low | Use on-device recognition mode (faster, no network) |
| Back Tap not working on device | Low | Configure Accessibility \> Touch \> Back Tap before demo |
| No physical iPhone available | High risk | Must test on real device — simulator has no mic or Back Tap |

# **14\. Success Criteria**

* User can select a scenario and start a session

* POST /session/start returns sessionId and agent joins the RTC channel

* ConvoAI agent speaks feedback during user pauses

* Real-time pitch graph updates live during speech

* Filler word counter increments correctly during speech

* WPM updates every 5 seconds

* Back Tap successfully toggles session start/stop

* Session summary shows meaningful scores after session ends

* Demo runs without crashing for at least 3 minutes

*Document version: 1.1 — Corrected to align with actual backend setup*

*Last updated: March 2026*