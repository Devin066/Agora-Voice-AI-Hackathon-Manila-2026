import Foundation
import Combine

class VoiceSessionCoordinator: ObservableObject {
    @Published var state: SessionState = .idle
    @Published var session: VoiceSession?
    @Published var metrics: SessionMetrics = SessionMetrics()
    
    @Published var wpm: Int = 0
    @Published var fillerCount: Int = 0
    @Published var currentPitch: Float = 0
    @Published var currentEnergy: Float = 0
    @Published var isAgentSpeaking: Bool = false
    
    private let pitchAnalyzer = PitchAnalyzer()
    private let speechAnalyzer = SpeechAnalyzer()
    private let hapticsEngine = HapticsEngine()
    let liveActivityManager = LiveActivityManager()
    
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
    
    func requestPermissions(completion: @escaping (Bool) -> Void) {
        speechAnalyzer.requestAuthorization { granted in
            completion(granted)
        }
    }
    
    func startSession(scenario: ScenarioType) {
        let newSession = VoiceSession(scenario: scenario, startedAt: Date())
        self.session = newSession
        self.state = .connecting
        
        // Hooks
        pitchAnalyzer.onPitchDetected = { [weak self] hz in
            self?.currentPitch = hz
            self?.pitchSamples.append(hz)
        }
        
        pitchAnalyzer.onEnergyDetected = { [weak self] energy in
            self?.currentEnergy = energy
        }
        
        speechAnalyzer.onTranscriptionUpdated = { text in
            // Handle logging if needed
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
            
            // This is the trigger for the ConvoAI agent to speak!
            // In a real integration, we'd signal Agora.
            // For now, let's mock the agent speaking feedback back.
            self?.triggerAgentMockFeedback()
        }
        
        // Start APIs
        do {
            try speechAnalyzer.start()
            pitchAnalyzer.start()
            self.state = .active
        } catch {
            print("Failed to start speech analyzer: \(error)")
            self.state = .idle
        }
    }
    
    func stopSession() {
        self.state = .stopping
        speechAnalyzer.stop()
        pitchAnalyzer.stop()
        hapticsEngine.stop()
        liveActivityManager.endActivity()
        
        guard let activeSession = session else { return }
        let ended = Date()
        activeSession.endedAt = ended
        activeSession.durationSeconds = Int(ended.timeIntervalSince(activeSession.startedAt))
        
        computeFinalMetrics()
        
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
    
    private func triggerAgentMockFeedback() {
        DispatchQueue.main.async { [weak self] in
            // Simulate agent speaking for 3 seconds
            self?.isAgentSpeaking = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                self?.isAgentSpeaking = false
            }
        }
    }
}
