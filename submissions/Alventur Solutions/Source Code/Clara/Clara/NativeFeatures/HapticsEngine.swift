import Foundation
import CoreHaptics
import UIKit

/// Provides haptic feedback when filler words are detected during a voice session.
class HapticsEngine {
    private var engine: CHHapticEngine?
    private var isSupported: Bool = false
    
    init() {
        isSupported = CHHapticEngine.capabilitiesForHardware().supportsHaptics
        prepareEngine()
    }
    
    private func prepareEngine() {
        guard isSupported else { return }
        
        do {
            engine = try CHHapticEngine()
            engine?.resetHandler = { [weak self] in
                do {
                    try self?.engine?.start()
                } catch {
                    print("HapticsEngine reset failed: \(error)")
                }
            }
            try engine?.start()
        } catch {
            print("HapticsEngine init failed: \(error)")
            isSupported = false
        }
    }
    
    /// Plays a sharp "buzz" pattern when a filler word is detected.
    func playFillerWordBuzz() {
        guard isSupported, let engine = engine else {
            // Fallback to basic UIKit haptic
            let generator = UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred()
            return
        }
        
        do {
            // Sharp transient hit followed by a brief continuous buzz
            let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
            let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)
            
            let transient = CHHapticEvent(
                eventType: .hapticTransient,
                parameters: [sharpness, intensity],
                relativeTime: 0
            )
            
            let continuous = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.6),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.4)
                ],
                relativeTime: 0.08,
                duration: 0.15
            )
            
            let pattern = try CHHapticPattern(events: [transient, continuous], parameters: [])
            let player = try engine.makePlayer(with: pattern)
            try player.start(atTime: CHHapticTimeImmediate)
        } catch {
            print("HapticsEngine playFillerWordBuzz failed: \(error)")
            // Fallback
            let generator = UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred()
        }
    }
    
    /// Lighter tap for UI confirmations (e.g., Back Tap acknowledged).
    func playConfirmationTap() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
    
    func stop() {
        engine?.stop(completionHandler: { _ in })
    }
}
