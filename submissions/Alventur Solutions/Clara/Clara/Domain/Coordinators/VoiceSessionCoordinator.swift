import Foundation
import Combine

@MainActor
class VoiceSessionCoordinator: ObservableObject {
    @Published var state: SessionState = .idle
    @Published var session: VoiceSession?
    @Published var metrics: SessionMetrics = SessionMetrics()
    
    @Published var wpm: Int = 0
    @Published var fillerCount: Int = 0
    @Published var currentPitch: Float = 0
    @Published var currentEnergy: Float = 0
    @Published var isAgentSpeaking: Bool = false
    @Published var liveTranscript: String = ""
    @Published var errorMessage: String?
    
    private let pitchAnalyzer = PitchAnalyzer()
    private let speechAnalyzer = SpeechAnalyzer()
    private let hapticsEngine = HapticsEngine()
    private let apiClient: APIClient
    private let agoraService: AgoraVoiceServiceProtocol
    let liveActivityManager = LiveActivityManager()

    private var activeSessionId: String?
    private var activeChannelName: String?
    
    enum SessionState {
        case idle
        case connecting
        case active
        case stopping
        case summary
    }
    
    // Accumulators
    private var pitchSamples: [Float] = []
    private var pauseCount = 0
    private var totalPauseDuration: TimeInterval = 0

    init(apiClient: APIClient? = nil, agoraService: AgoraVoiceServiceProtocol? = nil) {
        self.apiClient = apiClient ?? APIClient.shared
        self.agoraService = agoraService ?? AgoraVoiceService()

        self.agoraService.onAgentSpeakingChanged = { [weak self] speaking in
            Task { @MainActor in
                self?.isAgentSpeaking = speaking
            }
        }
    }
    
    func requestPermissions(completion: @escaping (Bool) -> Void) {
        speechAnalyzer.requestAuthorization { granted in
            completion(granted)
        }
    }
    
    func startSession(scenario: ScenarioType) async {
        guard state != .active && state != .connecting else { return }

        resetMetricsForNewSession()
        self.state = .connecting
        self.errorMessage = nil
        
        // Hooks
        pitchAnalyzer.onPitchDetected = { [weak self] hz in
            self?.currentPitch = hz
            self?.pitchSamples.append(hz)
        }
        
        pitchAnalyzer.onEnergyDetected = { [weak self] energy in
            self?.currentEnergy = energy
        }
        
        speechAnalyzer.onTranscriptionUpdated = { [weak self] text in
            Task { @MainActor in
                self?.liveTranscript = text
            }
        }
        
        speechAnalyzer.onFillerWordDetected = { [weak self] word in
            self?.fillerCount += 1
            self?.hapticsEngine.playFillerWordBuzz()
        }
        
        speechAnalyzer.onWPMUpdated = { [weak self] newWPM in
            self?.wpm = newWPM
        }
        
        speechAnalyzer.onPauseDetected = { [weak self] duration in
            self?.pauseCount += 1
            self?.totalPauseDuration += duration
        }

        do {
            let localUid = Int.random(in: 100000...900000)
            let token = try await apiClient.generateToken(channelName: nil, uid: localUid)
            let resolvedAppId = token.appId?.trimmingCharacters(in: .whitespacesAndNewlines)
            let appId: String
            if let resolvedAppId, !resolvedAppId.isEmpty {
                appId = resolvedAppId
            } else {
                appId = try AppRuntimeConfiguration.load().agoraAppId
            }

            // Join RTC first so an immediate greeting from the agent is audible.
            try await agoraService.start(
                appId: appId,
                token: token.token,
                channelName: token.channelName,
                uid: UInt(token.uid),
                agentUid: 0
            )

            let startResponse = try await apiClient.startSession(
                channelName: token.channelName,
                scenario: scenario,
                userId: token.uid
            )

            agoraService.setExpectedAgentUid(UInt(startResponse.agentUid))

            if startResponse.channelName != token.channelName {
                print("[agora] warning: token channel=\(token.channelName) start channel=\(startResponse.channelName)")
            }

            try speechAnalyzer.start()
            pitchAnalyzer.start()

            let newSession = VoiceSession(
                id: startResponse.sessionId,
                scenario: scenario.rawValue,
                startedAt: Date(),
                status: startResponse.status,
                channelName: startResponse.channelName,
                userTokenExpiresAt: token.expiresAt
            )
            self.session = newSession
            self.activeSessionId = startResponse.sessionId
            self.activeChannelName = startResponse.channelName
            self.state = .active
        } catch {
            await agoraService.stop()
            print("Failed to start speech analyzer: \(error)")
            self.errorMessage = error.localizedDescription
            self.state = .idle
        }
    }

    func stopSession() async {
        self.state = .stopping
        speechAnalyzer.stop()
        pitchAnalyzer.stop()
        hapticsEngine.stop()
        liveActivityManager.endActivity()

        if let sessionId = activeSessionId {
            do {
                _ = try await apiClient.stopSession(sessionId: sessionId, channelName: activeChannelName)
            } catch {
                self.errorMessage = error.localizedDescription
            }
        }

        await agoraService.stop()
        
        guard let activeSession = session else { return }
        let ended = Date()
        activeSession.endedAt = ended
        activeSession.durationSeconds = Int(ended.timeIntervalSince(activeSession.startedAt))
        
        computeFinalMetrics()
        
        self.activeSessionId = nil
        self.activeChannelName = nil
        self.state = .summary
    }
    
    private func computeFinalMetrics() {
        // Aggregate Pitch
        let avgPitch = pitchSamples.isEmpty ? 0 : pitchSamples.reduce(0, +) / Float(pitchSamples.count)
        let maxPitch = pitchSamples.max() ?? 0
        let minPitch = pitchSamples.min() ?? 0
        let range = maxPitch - minPitch
        
        // Fillers
        let durMins = Float(session?.durationSeconds ?? 0) / 60.0
        let fillerRate = durMins > 0 ? Float(fillerCount) / durMins : 0
        
        // Scoring heuristics (mocked weights for hackathon)
        let pacingScore: Float = wpm >= 130 && wpm <= 160 ? 100 : 70
        let intonationScore: Float = range > 40 ? 100 : 60 // High range = good
        let filScore: Float = max(100 - (fillerRate * 5), 0)
        let overall = (pacingScore * 0.2) + (intonationScore * 0.25) + (filScore * 0.25) + 20 // pad confidence
        
        let newMetrics = SessionMetrics(
            overallScore: overall,
            pacingScore: pacingScore,
            intonationScore: intonationScore,
            fillerScore: filScore,
            confidenceScore: 80.0,
            fluencyScore: 85.0,
            averagePitchHz: avgPitch,
            pitchRangeHz: range,
            pitchVariance: 0,
            intonationPattern: range > 40 ? "Expressive" : "Monotone",
            averageWPM: wpm,
            totalFillerWords: fillerCount,
            fillerWordsPerMinute: fillerRate,
            totalPauses: pauseCount,
            averagePauseDuration: pauseCount > 0 ? Float(totalPauseDuration) / Float(pauseCount) : 0
        )
        
        self.metrics = newMetrics
        self.session?.metrics = newMetrics
        
        // SwiftData Context persist done externally or via auto-save
    }
    
    private func resetMetricsForNewSession() {
        wpm = 0
        fillerCount = 0
        currentPitch = 0
        currentEnergy = 0
        isAgentSpeaking = false
        liveTranscript = ""
        pitchSamples = []
        pauseCount = 0
        totalPauseDuration = 0
    }
}
