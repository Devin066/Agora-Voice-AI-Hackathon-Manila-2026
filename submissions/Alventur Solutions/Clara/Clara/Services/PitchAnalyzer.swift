import Foundation
import AVFoundation
import Accelerate

class PitchAnalyzer {
    private let engine = AVAudioEngine()
    private var isRunning = false
    
    // Configurable output handler
    var onPitchDetected: ((Float) -> Void)?
    var onEnergyDetected: ((Float) -> Void)?
    
    func start() {
        guard !isRunning else { return }
        
        let inputNode = engine.inputNode
        let format = inputNode.inputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, time in
            self?.processBuffer(buffer)
        }
        
        engine.prepare()
        do {
            try engine.start()
            isRunning = true
            print("PitchAnalyzer engine started")
        } catch {
            print("Failed to start AVAudioEngine: \(error)")
        }
    }
    
    func stop() {
        guard isRunning else { return }
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        isRunning = false
        print("PitchAnalyzer engine stopped")
    }
    
    private func processBuffer(_ buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.floatChannelData?[0] else { return }
        let frames = Int(buffer.frameLength)
        
        // 1. Calculate RMS (Energy)
        var rms: Float = 0.0
        vDSP_rmsqv(channelData, 1, &rms, vDSP_Length(frames))
        
        DispatchQueue.main.async {
            self.onEnergyDetected?(rms)
        }
        
        // 2. Simple Zero-Crossing Pitch Detection (Mocking Autocorrelation for speed/simplicity in Hackathon unless strict vDSP Autocorr is needed)
        // Let's implement a very basic pitch proxy using zero crossings and RMS gate.
        if rms > 0.01 { // Noise gate
            var zeroCrossings = 0
            for i in 1..<frames {
                if (channelData[i] > 0 && channelData[i-1] <= 0) || (channelData[i] < 0 && channelData[i-1] >= 0) {
                    zeroCrossings += 1
                }
            }
            // Frequency = (Zero Crossings / 2) / (Duration of Buffer)
            // Duration = frames / sampleRate
            let sampleRate = Float(buffer.format.sampleRate)
            let duration = Float(frames) / sampleRate
            let frequency = (Float(zeroCrossings) / 2.0) / duration
            
            // Typical human voice range is roughly 80Hz to 300Hz.
            if frequency > 50 && frequency < 500 {
                DispatchQueue.main.async {
                    self.onPitchDetected?(frequency)
                }
            }
        }
    }
}
