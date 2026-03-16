# Requirements Document

## Introduction

VoiceIQ is a real-time AI voice trainer application for iOS that provides live coaching feedback during speech practice sessions. The system consists of an iOS native application that performs local audio analysis and a Python FastAPI backend deployed on AWS Lambda that orchestrates Agora ConvoAI agent lifecycle. The iOS app analyzes voice characteristics (pitch, WPM, filler words, intonation) locally while an Agora ConvoAI agent listens to the user's speech via Agora RTC and provides spoken coaching feedback during natural pauses. The backend handles only session orchestration and token generation, never participating in the real-time voice conversation path.

## Glossary

- **iOS_App**: The native iOS application built with SwiftUI that handles UI, local audio analysis, and Agora RTC client integration
- **Backend**: The Python FastAPI server deployed as AWS Lambda Lambdalith that orchestrates ConvoAI agent lifecycle
- **ConvoAI_Agent**: The Agora ConvoAI agent instance that listens to user speech and provides spoken feedback
- **RTC_Channel**: The Agora Real-Time Communication channel where audio streams flow between iOS app and ConvoAI agent
- **Audio_Analyzer**: The iOS component using AVAudioEngine and vDSP for pitch analysis
- **Speech_Recognizer**: The iOS component using Apple Speech framework for transcription and filler word detection
- **Metrics_Aggregator**: The iOS component that accumulates and computes session metrics
- **Session**: A single voice training practice session from start to stop
- **Scenario**: A training mode (public speaking, job interview, debate, English fluency) that determines agent persona
- **Filler_Word**: Speech disfluencies including "um", "uh", "like", "ano", "eh", "kasi", "parang"
- **Pitch**: The fundamental frequency of the user's voice measured in Hertz (Hz)
- **WPM**: Words per minute, the speaking rate metric
- **Intonation_Pattern**: The pitch contour classification (rising, falling, flat) over a sentence segment
- **VAD**: Voice Activity Detection, the mechanism that detects speech vs silence
- **System_Prompt**: The LLM instruction text that defines the ConvoAI agent's persona and behavior
- **RTC_Token**: The Agora authentication token required to join an RTC channel
- **Session_ID**: The unique identifier for a ConvoAI agent instance returned by Agora API

## Requirements

### Requirement 1: Scenario Selection

**User Story:** As a user, I want to select a training scenario before starting a session, so that the AI coach provides feedback appropriate to my practice context.

#### Acceptance Criteria

1. THE iOS_App SHALL present four scenario options: public speaking, job interview, debate, and English fluency
2. WHEN a user selects a scenario, THE iOS_App SHALL store the selected scenario identifier for the session
3. WHEN the user initiates session start, THE iOS_App SHALL include the scenario identifier in the POST /session/start request body
4. THE Backend SHALL map each scenario identifier to a corresponding System_Prompt module
5. THE Backend SHALL configure the ConvoAI_Agent with the System_Prompt matching the requested scenario

### Requirement 2: RTC Token Generation

**User Story:** As a user, I want the system to handle authentication automatically, so that I can join voice sessions without manual configuration.

#### Acceptance Criteria

1. WHEN the iOS_App prepares to start a session, THE iOS_App SHALL send a POST request to /token/generate endpoint
2. THE Backend SHALL generate a valid RTC_Token using the Agora App ID and App Certificate
3. THE Backend SHALL set the RTC_Token expiration time to 1 hour from generation
4. THE Backend SHALL return the RTC_Token, channel name, UID, and expiration timestamp in the response
5. WHERE the iOS_App omits the channel name in the request, THE Backend SHALL generate a unique channel name and return it
6. WHERE the iOS_App omits the UID in the request, THE Backend SHALL default to UID 0

### Requirement 3: Session Start and Agent Initialization

**User Story:** As a user, I want the AI coach to join my session when I start practicing, so that I can receive real-time feedback.

#### Acceptance Criteria

1. WHEN the iOS_App sends a POST request to /session/start with channel name and scenario, THE Backend SHALL create a ConvoAI_Agent instance
2. THE Backend SHALL configure the ConvoAI_Agent with the System_Prompt corresponding to the requested scenario
3. THE Backend SHALL configure the ConvoAI_Agent VAD silence_duration_ms parameter to 480 milliseconds
4. THE Backend SHALL configure the ConvoAI_Agent idle_timeout parameter to 30 seconds
5. THE Backend SHALL instruct the ConvoAI_Agent to join the specified RTC_Channel
6. THE Backend SHALL return the Session_ID, agent UID, channel name, and status "active" in the response
7. THE Backend SHALL complete the /session/start request within 1000 milliseconds

### Requirement 4: Real-Time Audio Capture and Streaming

**User Story:** As a user, I want my voice to be transmitted to the AI coach in real time, so that the coach can listen and respond during my speech.

#### Acceptance Criteria

1. WHEN a session is active, THE iOS_App SHALL capture audio from the device microphone using AVAudioEngine
2. THE iOS_App SHALL configure the Agora iOS SDK to stream captured audio to the RTC_Channel
3. THE iOS_App SHALL maintain audio streaming until the session is stopped
4. THE ConvoAI_Agent SHALL receive the audio stream from the RTC_Channel
5. THE ConvoAI_Agent SHALL transcribe the audio stream using ASR (Automatic Speech Recognition)

### Requirement 5: Real-Time Pitch Analysis

**User Story:** As a user, I want to see my voice pitch in real time, so that I can monitor and adjust my vocal expression during practice.

#### Acceptance Criteria

1. WHEN a session is active, THE Audio_Analyzer SHALL compute the fundamental frequency of the user's voice using vDSP autocorrelation
2. THE Audio_Analyzer SHALL update the pitch measurement every 100 milliseconds
3. THE Audio_Analyzer SHALL express pitch values in Hertz (Hz)
4. THE iOS_App SHALL display the pitch value on a live graph during the session
5. WHERE the audio RMS level is below 0.01, THE Audio_Analyzer SHALL skip pitch computation to avoid noise

### Requirement 6: Pitch Variance and Monotone Detection

**User Story:** As a user, I want to be alerted when my voice sounds monotone, so that I can add more vocal variety to my speech.

#### Acceptance Criteria

1. THE Audio_Analyzer SHALL compute pitch variance over each sentence segment
2. THE Audio_Analyzer SHALL compute pitch range as maximum Hz minus minimum Hz over each segment
3. WHEN pitch variance falls below 25 for a segment, THE Audio_Analyzer SHALL flag the segment as monotone
4. THE iOS_App SHALL display a monotone indicator when a segment is flagged
5. THE Metrics_Aggregator SHALL include pitch variance and pitch range in the session summary

### Requirement 7: Intonation Pattern Classification

**User Story:** As a user, I want to understand my intonation patterns, so that I can improve the expressiveness of my speech.

#### Acceptance Criteria

1. THE Audio_Analyzer SHALL classify intonation patterns at each detected pause
2. THE Audio_Analyzer SHALL compare the first 5 pitch samples to the last 5 pitch samples of a segment
3. WHERE the last 5 samples average higher than the first 5 samples, THE Audio_Analyzer SHALL classify the pattern as "rising"
4. WHERE the last 5 samples average lower than the first 5 samples, THE Audio_Analyzer SHALL classify the pattern as "falling"
5. WHERE the difference between first and last samples is within 10 Hz, THE Audio_Analyzer SHALL classify the pattern as "flat"
6. THE Metrics_Aggregator SHALL include intonation pattern distribution in the session summary

### Requirement 8: Speech Recognition and Transcription

**User Story:** As a user, I want my speech to be transcribed in real time, so that the system can detect filler words and compute speaking rate.

#### Acceptance Criteria

1. WHEN a session is active, THE Speech_Recognizer SHALL transcribe audio using Apple Speech framework
2. THE Speech_Recognizer SHALL use on-device recognition mode for reduced latency
3. THE Speech_Recognizer SHALL provide partial transcription results during speech
4. THE Speech_Recognizer SHALL provide final transcription results at detected pauses
5. THE Speech_Recognizer SHALL continue transcription until the session is stopped

### Requirement 9: Filler Word Detection and Counting

**User Story:** As a user, I want to see how many filler words I use, so that I can reduce them and speak more confidently.

#### Acceptance Criteria

1. THE Speech_Recognizer SHALL detect occurrences of the filler words: "um", "uh", "like", "ano", "eh", "kasi", "parang"
2. WHEN a Filler_Word is detected in the transcription, THE Speech_Recognizer SHALL increment the filler word counter
3. THE iOS_App SHALL display the filler word count in real time during the session
4. THE Metrics_Aggregator SHALL compute filler words per minute as total filler words divided by session duration in minutes
5. THE Metrics_Aggregator SHALL include total filler words and filler words per minute in the session summary

### Requirement 10: CoreHaptics Feedback on Filler Words

**User Story:** As a user, I want to feel a vibration when I say a filler word, so that I become more aware of my speech patterns without visual distraction.

#### Acceptance Criteria

1. WHEN a Filler_Word is detected, THE iOS_App SHALL trigger a CoreHaptics vibration pattern
2. THE iOS_App SHALL use a sharp, brief haptic pattern with intensity 0.8 and sharpness 0.9
3. THE iOS_App SHALL trigger the haptic within 100 milliseconds of filler word detection
4. WHERE the device does not support CoreHaptics, THE iOS_App SHALL skip haptic feedback without error

### Requirement 11: Words Per Minute (WPM) Calculation

**User Story:** As a user, I want to monitor my speaking rate, so that I can maintain an appropriate pace for my scenario.

#### Acceptance Criteria

1. THE Speech_Recognizer SHALL count the total number of words transcribed during the session
2. THE Metrics_Aggregator SHALL compute WPM as word count divided by elapsed time in minutes multiplied by 60
3. THE Metrics_Aggregator SHALL update the WPM value every 5 seconds
4. THE iOS_App SHALL display the current WPM value during the session
5. THE Metrics_Aggregator SHALL include average WPM in the session summary

### Requirement 12: Pause Detection

**User Story:** As a user, I want the system to detect when I pause, so that the AI coach can provide feedback at natural breaks in my speech.

#### Acceptance Criteria

1. THE Speech_Recognizer SHALL detect pauses as silence gaps exceeding 1.5 seconds
2. WHEN a pause is detected, THE Speech_Recognizer SHALL notify the iOS_App
3. THE Metrics_Aggregator SHALL count the total number of pauses during the session
4. THE Metrics_Aggregator SHALL compute average pause duration
5. THE Metrics_Aggregator SHALL include total pauses and average pause duration in the session summary

### Requirement 13: Vocal Energy (RMS) Measurement

**User Story:** As a user, I want the system to measure my vocal energy, so that I can understand my confidence level during speech.

#### Acceptance Criteria

1. THE Audio_Analyzer SHALL compute the root mean square (RMS) of the PCM audio buffer
2. THE Audio_Analyzer SHALL update the RMS measurement every 100 milliseconds
3. THE Metrics_Aggregator SHALL compute average vocal energy over the session
4. THE Metrics_Aggregator SHALL include average vocal energy in the session summary
5. THE Metrics_Aggregator SHALL use average vocal energy as a component of the confidence score

### Requirement 14: AI Coach Spoken Feedback

**User Story:** As a user, I want the AI coach to speak feedback to me during my practice, so that I receive guidance without interrupting my flow.

#### Acceptance Criteria

1. WHEN the ConvoAI_Agent detects a pause in user speech via VAD, THE ConvoAI_Agent SHALL generate a coaching response
2. THE ConvoAI_Agent SHALL send the transcribed user speech to the Gemini 2.5 Flash LLM via OpenAI-compatible endpoint
3. THE ConvoAI_Agent SHALL receive a text response from the LLM limited to 2-4 sentences
4. THE ConvoAI_Agent SHALL convert the text response to speech using the configured TTS vendor
5. THE ConvoAI_Agent SHALL stream the synthesized speech audio to the RTC_Channel
6. THE iOS_App SHALL receive the agent audio from the RTC_Channel and play it through the device speaker
7. THE ConvoAI_Agent SHALL NOT interrupt while the user is speaking

### Requirement 15: Scenario-Specific System Prompts

**User Story:** As a user, I want the AI coach to behave differently based on my chosen scenario, so that the feedback is relevant to my practice context.

#### Acceptance Criteria

1. WHERE the scenario is "public_speaking", THE Backend SHALL configure the ConvoAI_Agent with the TED talk coach persona System_Prompt
2. WHERE the scenario is "job_interview", THE Backend SHALL configure the ConvoAI_Agent with the HR interviewer persona System_Prompt
3. WHERE the scenario is "debate", THE Backend SHALL configure the ConvoAI_Agent with the debate judge persona System_Prompt
4. WHERE the scenario is "english_fluency", THE Backend SHALL configure the ConvoAI_Agent with the Filipino ESL partner persona System_Prompt
5. THE System_Prompt SHALL instruct the ConvoAI_Agent to limit responses to 2-4 sentences
6. WHERE the scenario is "english_fluency", THE System_Prompt SHALL instruct the ConvoAI_Agent to detect Filipino filler words in addition to English filler words

### Requirement 16: Back Tap Gesture for Session Control

**User Story:** As a user, I want to start and stop sessions by double-tapping the back of my iPhone, so that I can control the app hands-free.

#### Acceptance Criteria

1. THE iOS_App SHALL register a handler for the Back Tap accessibility gesture
2. WHEN the user performs a double Back Tap while in idle state, THE iOS_App SHALL initiate session start
3. WHEN the user performs a double Back Tap while in active session state, THE iOS_App SHALL initiate session stop
4. THE iOS_App SHALL provide visual feedback confirming the Back Tap action was recognized
5. WHERE the device does not support Back Tap, THE iOS_App SHALL provide alternative UI controls for session start and stop

### Requirement 17: Dynamic Island Live Metrics Display

**User Story:** As a user, I want to see key metrics on the Dynamic Island while the screen is locked, so that I can monitor my performance without unlocking my device.

#### Acceptance Criteria

1. WHEN a session is active, THE iOS_App SHALL display current pitch and WPM values on the Dynamic Island
2. THE iOS_App SHALL update the Dynamic Island display every 1 second
3. THE iOS_App SHALL use a Live Activity to maintain the Dynamic Island display
4. WHEN the session stops, THE iOS_App SHALL remove the Live Activity from the Dynamic Island
5. WHERE the device does not have a Dynamic Island, THE iOS_App SHALL skip this feature without error

### Requirement 18: Session Stop and Agent Cleanup

**User Story:** As a user, I want the AI coach to leave the session when I stop practicing, so that resources are released and I can review my results.

#### Acceptance Criteria

1. WHEN the user stops a session, THE iOS_App SHALL send a POST request to /session/stop with the Session_ID and channel name
2. THE Backend SHALL instruct the ConvoAI_Agent to leave the RTC_Channel
3. THE Backend SHALL terminate the ConvoAI_Agent instance
4. THE Backend SHALL return the Session_ID, status "stopped", and timestamp in the response
5. THE iOS_App SHALL leave the RTC_Channel
6. THE iOS_App SHALL stop the Audio_Analyzer and Speech_Recognizer
7. THE iOS_App SHALL compute final session metrics

### Requirement 19: Post-Session Score Calculation

**User Story:** As a user, I want to receive a numerical score after my session, so that I can track my improvement over time.

#### Acceptance Criteria

1. WHEN a session ends, THE Metrics_Aggregator SHALL compute a pacing score based on WPM within the 130-160 range
2. THE Metrics_Aggregator SHALL compute an intonation score based on pitch variance and pitch range
3. THE Metrics_Aggregator SHALL compute a filler score based on filler words per minute
4. THE Metrics_Aggregator SHALL compute a confidence score based on average vocal energy RMS
5. THE Metrics_Aggregator SHALL compute a fluency score based on pause frequency and average pause duration
6. THE Metrics_Aggregator SHALL compute an overall score as the weighted sum: pacing (20%), intonation (25%), filler (25%), confidence (20%), fluency (10%)
7. THE Metrics_Aggregator SHALL express all scores as values between 0 and 100

### Requirement 20: Session Summary Display

**User Story:** As a user, I want to see a detailed summary of my session, so that I can understand my strengths and areas for improvement.

#### Acceptance Criteria

1. WHEN a session ends, THE iOS_App SHALL display a session summary screen
2. THE iOS_App SHALL display the overall score and all sub-scores
3. THE iOS_App SHALL display average pitch, pitch range, and pitch variance
4. THE iOS_App SHALL display average WPM
5. THE iOS_App SHALL display total filler words and filler words per minute
6. THE iOS_App SHALL display total pauses and average pause duration
7. THE iOS_App SHALL display session duration
8. THE iOS_App SHALL display the scenario that was practiced

### Requirement 21: Session History Persistence

**User Story:** As a user, I want my past sessions to be saved, so that I can review my progress over time.

#### Acceptance Criteria

1. WHEN a session ends, THE iOS_App SHALL persist the session data using SwiftData
2. THE iOS_App SHALL store session metadata: session ID, scenario, start time, end time, duration
3. THE iOS_App SHALL store session metrics: all scores, pitch statistics, WPM, filler counts, pause statistics
4. THE iOS_App SHALL provide a session history view listing all past sessions
5. WHEN the user selects a past session, THE iOS_App SHALL display the full session summary for that session

### Requirement 22: Health Check Endpoint

**User Story:** As a developer, I want to verify the backend is reachable before starting a session, so that I can provide clear error messages to users.

#### Acceptance Criteria

1. THE Backend SHALL expose a GET /health endpoint
2. WHEN the /health endpoint is called, THE Backend SHALL return a JSON response with status "ok" and current timestamp
3. THE Backend SHALL respond to /health requests within 200 milliseconds
4. THE iOS_App SHALL call the /health endpoint before attempting to start a session
5. IF the /health endpoint fails or times out, THE iOS_App SHALL display an error message indicating the backend is unavailable

### Requirement 23: TTS Vendor Configuration

**User Story:** As a developer, I want to configure the TTS vendor for the AI coach voice, so that I can choose between Microsoft Azure TTS and ElevenLabs based on quality and cost.

#### Acceptance Criteria

1. THE Backend SHALL read the TTS_VENDOR environment variable to determine the TTS provider
2. WHERE TTS_VENDOR is "microsoft", THE Backend SHALL configure the ConvoAI_Agent to use Microsoft Azure TTS
3. WHERE TTS_VENDOR is "elevenlabs", THE Backend SHALL configure the ConvoAI_Agent to use ElevenLabs TTS
4. WHERE TTS_VENDOR is "microsoft", THE Backend SHALL use MICROSOFT_TTS_KEY, MICROSOFT_TTS_REGION, MICROSOFT_TTS_VOICE_NAME, MICROSOFT_TTS_RATE, and MICROSOFT_TTS_VOLUME environment variables
5. WHERE TTS_VENDOR is "elevenlabs", THE Backend SHALL use ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, and ELEVENLABS_MODEL_ID environment variables
6. THE Backend SHALL include the TTS configuration in the ConvoAI_Agent initialization request

### Requirement 24: LLM Configuration via OpenAI-Compatible Endpoint

**User Story:** As a developer, I want to configure the LLM provider using OpenAI-compatible endpoints, so that I can use Gemini 2.5 Flash without custom integration code.

#### Acceptance Criteria

1. THE Backend SHALL read LLM_URL, LLM_TOKEN, and LLM_MODEL environment variables
2. THE Backend SHALL configure the ConvoAI_Agent to use the LLM_URL as the OpenAI-compatible endpoint
3. THE Backend SHALL configure the ConvoAI_Agent to use LLM_TOKEN as the API key for authentication
4. THE Backend SHALL configure the ConvoAI_Agent to use LLM_MODEL as the model identifier
5. THE ConvoAI_Agent SHALL send chat completion requests to the configured LLM_URL using OpenAI API format

### Requirement 25: Error Handling for Agent Initialization Failures

**User Story:** As a user, I want to receive a clear error message if the AI coach fails to start, so that I understand what went wrong.

#### Acceptance Criteria

1. IF the Backend fails to create a ConvoAI_Agent instance, THE Backend SHALL return an HTTP 500 error with a descriptive error message
2. IF the ConvoAI_Agent fails to join the RTC_Channel, THE Backend SHALL return an HTTP 500 error with a descriptive error message
3. IF the iOS_App receives an error response from /session/start, THE iOS_App SHALL display the error message to the user
4. IF the iOS_App receives an error response from /session/start, THE iOS_App SHALL return to the scenario selection screen
5. THE iOS_App SHALL log all error responses for debugging purposes

### Requirement 26: Error Handling for Network Failures

**User Story:** As a user, I want to be notified if my network connection fails during a session, so that I understand why the AI coach stopped responding.

#### Acceptance Criteria

1. IF the iOS_App loses network connectivity during a session, THE iOS_App SHALL display a network error indicator
2. IF the RTC_Channel connection is lost, THE iOS_App SHALL attempt to reconnect for up to 10 seconds
3. IF reconnection fails, THE iOS_App SHALL stop the session and display an error message
4. THE iOS_App SHALL save partial session data if a network failure occurs
5. THE iOS_App SHALL allow the user to retry session start after a network failure

### Requirement 27: Microphone Permission Handling

**User Story:** As a user, I want to be prompted for microphone access when needed, so that I understand why the app needs this permission.

#### Acceptance Criteria

1. WHEN the iOS_App is launched for the first time, THE iOS_App SHALL request microphone permission
2. IF the user denies microphone permission, THE iOS_App SHALL display a message explaining that microphone access is required for voice training
3. IF the user denies microphone permission, THE iOS_App SHALL provide a button to open system settings
4. THE iOS_App SHALL check microphone permission status before starting a session
5. IF microphone permission is denied when starting a session, THE iOS_App SHALL display an error message and prevent session start

### Requirement 28: Speech Recognition Permission Handling

**User Story:** As a user, I want to be prompted for speech recognition access when needed, so that I understand why the app needs this permission.

#### Acceptance Criteria

1. WHEN the iOS_App is launched for the first time, THE iOS_App SHALL request speech recognition permission
2. IF the user denies speech recognition permission, THE iOS_App SHALL display a message explaining that speech recognition is required for filler word detection and WPM calculation
3. IF the user denies speech recognition permission, THE iOS_App SHALL provide a button to open system settings
4. THE iOS_App SHALL check speech recognition permission status before starting a session
5. IF speech recognition permission is denied when starting a session, THE iOS_App SHALL display an error message and prevent session start

### Requirement 29: Lambda Cold Start Handling

**User Story:** As a user, I want session start to complete within a reasonable time even on the first request, so that I don't experience long delays.

#### Acceptance Criteria

1. THE Backend SHALL complete /session/start requests within 1000 milliseconds under normal conditions
2. THE Backend SHALL complete /session/start requests within 2000 milliseconds during Lambda cold start
3. WHILE the iOS_App is waiting for /session/start response, THE iOS_App SHALL display a loading indicator
4. IF the /session/start request exceeds 5000 milliseconds, THE iOS_App SHALL timeout and display an error message
5. THE iOS_App SHALL allow the user to retry session start after a timeout

### Requirement 30: Agent Auto-Cleanup on Idle

**User Story:** As a developer, I want the AI coach to automatically leave the session if no audio is detected, so that resources are not wasted on abandoned sessions.

#### Acceptance Criteria

1. THE Backend SHALL configure the ConvoAI_Agent idle_timeout parameter to 30 seconds
2. WHEN no audio is detected in the RTC_Channel for 30 seconds, THE ConvoAI_Agent SHALL automatically leave the channel
3. WHEN the ConvoAI_Agent leaves due to idle timeout, THE iOS_App SHALL detect the agent departure
4. WHEN the iOS_App detects agent departure, THE iOS_App SHALL stop the session and display a timeout message
5. THE iOS_App SHALL save session data when an idle timeout occurs
