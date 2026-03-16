import Foundation
import Speech

enum SpeechAnalyzerError: LocalizedError {
    case requestCreationFailed

    var errorDescription: String? {
        switch self {
        case .requestCreationFailed:
            return "Unable to create speech recognition request."
        }
    }
}

class SpeechAnalyzer {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    private var isRunning = false
    
    // Output hooks
    var onTranscriptionUpdated: ((String) -> Void)?
    var onFillerWordDetected: ((String) -> Void)?
    var onWPMUpdated: ((Int) -> Void)?
    var onPauseDetected: ((TimeInterval) -> Void)?
    
    // State
    private var sessionStartTime: Date?
    private let targetFillerWords = ["um", "uh", "ano", "kasi", "like", "you know"]
    private var detectedFillersCount = 0
    private var previousText = ""
    private var lastSpokenTime: Date?
    private var pauseTimer: Timer?
    
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            DispatchQueue.main.async {
                completion(authStatus == .authorized)
            }
        }
    }
    
    func start() throws {
        if isRunning { return }
        
        // Reset state
        sessionStartTime = Date()
        detectedFillersCount = 0
        previousText = ""
        lastSpokenTime = Date()
        
        recognitionTask?.cancel()
        self.recognitionTask = nil
        
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(
            .playAndRecord,
            mode: .measurement,
            options: [.defaultToSpeaker, .allowBluetoothHFP, .allowBluetoothA2DP, .duckOthers]
        )
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            throw SpeechAnalyzerError.requestCreationFailed
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, when) in
            self.recognitionRequest?.append(buffer)
        }
        
        audioEngine.prepare()
        try audioEngine.start()
        
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            var isFinal = false
            
            if let result = result {
                let currentText = result.bestTranscription.formattedString
                self.onTranscriptionUpdated?(currentText)
                
                // Diff text to find new words
                let oldWords = self.previousText.lowercased().split(separator: " ").map(String.init)
                let newWords = currentText.lowercased().split(separator: " ").map(String.init)
                
                if newWords.count > oldWords.count {
                    let newlySpoken = Array(newWords[oldWords.count...])
                    for word in newlySpoken {
                        if self.targetFillerWords.contains(word) {
                            self.detectedFillersCount += 1
                            self.onFillerWordDetected?(word)
                        }
                    }
                }
                
                self.previousText = currentText
                
                // Update WPM
                if let startTime = self.sessionStartTime {
                    let elapsedMins = Date().timeIntervalSince(startTime) / 60.0
                    if elapsedMins > 0 {
                        let wpm = Double(newWords.count) / elapsedMins
                        self.onWPMUpdated?(Int(wpm))
                    }
                }
                
                // Pause detection logic
                self.lastSpokenTime = Date()
                isFinal = result.isFinal
            }
            
            if error != nil || isFinal {
                self.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                self.recognitionRequest = nil
                self.recognitionTask = nil
                self.isRunning = false
            }
        }
        
        // Pause timer monitor
        startPauseTimer()
        isRunning = true
    }
    
    private func startPauseTimer() {
        pauseTimer?.invalidate()
        pauseTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            guard let self = self, self.isRunning, let lastSpoken = self.lastSpokenTime else { return }
            let idleTime = Date().timeIntervalSince(lastSpoken)
            if idleTime > 1.5 {
                // Detected a pause > 1.5s
                self.onPauseDetected?(idleTime)
                // Rest last spoken so we don't spam pause callbacks
                self.lastSpokenTime = Date()
            }
        }
    }
    
    func stop() {
        guard isRunning else { return }
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        pauseTimer?.invalidate()
        isRunning = false
    }
}
