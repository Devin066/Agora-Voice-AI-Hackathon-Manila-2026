import Foundation
import AVFoundation
import Accelerate
import AgoraRtcKit

class PitchAnalyzer {
    var onPitchDetected: ((Float) -> Void)?
    var onEnergyDetected: ((Float) -> Void)?

    // Called directly from Agora's audio frame delegate
    func processAgoraFrame(_ frame: AgoraAudioFrame) {
        guard let buffer = frame.buffer else { return }
        let sampleCount = Int(frame.samplesPerChannel)
        let channels = Int(frame.channels)
        guard sampleCount > 0, channels > 0 else { return }

        let samples = buffer.bindMemory(
            to: Int16.self,
            capacity: sampleCount * channels
        )
        let sampleRate = Float(frame.samplesPerSec)

        // Convert Int16 → Float32
        var floatBuffer = [Float](repeating: 0, count: sampleCount)
        if channels == 1 {
            for i in 0..<sampleCount {
                floatBuffer[i] = Float(samples[i]) / 32768.0
            }
        } else {
            for frameIndex in 0..<sampleCount {
                var mixed: Float = 0
                for channel in 0..<channels {
                    mixed += Float(samples[(frameIndex * channels) + channel])
                }
                floatBuffer[frameIndex] = (mixed / Float(channels)) / 32768.0
            }
        }

        // RMS energy
        var rms: Float = 0
        vDSP_rmsqv(floatBuffer, 1, &rms, vDSP_Length(sampleCount))
        
        DispatchQueue.main.async {
            self.onEnergyDetected?(rms)
        }

        guard rms > 0.01 else { return } // silence gate

        // Pitch via autocorrelation
        let hz = autocorrelate(floatBuffer, sampleRate: sampleRate)
        if hz > 80 && hz < 300 {
            DispatchQueue.main.async {
                self.onPitchDetected?(hz)
            }
        }
    }

    // No more start()/stop() — Agora controls the lifecycle
    func start() {} // no-op, kept for interface compatibility
    func stop() {}  // no-op

    private func autocorrelate(_ buffer: [Float], sampleRate: Float) -> Float {
        let size = buffer.count
        var correlation = [Float](repeating: 0, count: size)
        vDSP_conv(buffer, 1, buffer, 1, &correlation, 1,
                  vDSP_Length(size), vDSP_Length(size))

        var maxVal: Float = 0
        var maxIdx: vDSP_Length = 0
        vDSP_maxvi(Array(correlation.dropFirst(20)), 1, &maxVal, &maxIdx, vDSP_Length(size - 20))
        let period = Int(maxIdx) + 20
        guard period > 0 else { return 0 }
        return sampleRate / Float(period)
    }
}
