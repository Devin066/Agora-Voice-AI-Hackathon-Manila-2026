import Foundation
import ActivityKit

/// Manages the Dynamic Island Live Activity lifecycle.
/// - Phase 1 ("prompt"): Back Tap triggers Live Activity showing scenario selection prompt.
/// - Phase 2 ("active"): Once a scenario is chosen, updates with live metrics (WPM, Pitch, Fillers).
/// - Phase 3 ("ended"): Session stops, activity is ended.
class LiveActivityManager {
    
    private var currentActivity: Activity<ClaraSessionAttributes>?

    var areLiveActivitiesEnabled: Bool {
        ActivityAuthorizationInfo().areActivitiesEnabled
    }

    var liveActivitiesDisabledReason: String {
        "Live Activities are disabled on this iPhone. Turn on Settings > Face ID & Passcode > Live Activities, then reopen Clara."
    }
    
    /// Start a Live Activity in "prompt" phase — Dynamic Island expands asking user to pick a scenario.
    @discardableResult
    func startPrompt() -> Bool {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("LiveActivityManager: Live Activities not enabled on this device.")
            return false
        }
        
        let attributes = ClaraSessionAttributes(sessionId: UUID().uuidString)
        let initialState = ClaraSessionAttributes.ContentState(
            phase: "prompt",
            scenarioName: "",
            currentWPM: 0,
            currentPitchHz: 0,
            fillerCount: 0,
            elapsedSeconds: 0
        )
        
        let content = ActivityContent(state: initialState, staleDate: nil)
        
        do {
            currentActivity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )
            print("LiveActivityManager: Prompt activity started.")
            return true
        } catch {
            print("LiveActivityManager: Failed to start prompt activity: \(error)")
            return false
        }
    }
    
    /// Transition the Live Activity to "active" phase after scenario is selected.
    func transitionToActive(scenario: ScenarioType) {
        guard let activity = currentActivity else { return }
        
        let updatedState = ClaraSessionAttributes.ContentState(
            phase: "active",
            scenarioName: scenario.rawValue,
            currentWPM: 0,
            currentPitchHz: 0,
            fillerCount: 0,
            elapsedSeconds: 0
        )
        
        let content = ActivityContent(state: updatedState, staleDate: nil)
        
        Task {
            await activity.update(content)
            print("LiveActivityManager: Transitioned to active phase for \(scenario.rawValue).")
        }
    }
    
    /// Update the Live Activity with live metrics during an active session.
    func updateMetrics(wpm: Int, pitchHz: Int, fillers: Int, elapsed: Int, scenario: ScenarioType) {
        guard let activity = currentActivity else { return }
        
        let updatedState = ClaraSessionAttributes.ContentState(
            phase: "active",
            scenarioName: scenario.rawValue,
            currentWPM: wpm,
            currentPitchHz: pitchHz,
            fillerCount: fillers,
            elapsedSeconds: elapsed
        )
        
        let content = ActivityContent(state: updatedState, staleDate: nil)
        
        Task {
            await activity.update(content)
        }
    }
    
    /// End the Live Activity when the session stops.
    func endActivity() {
        guard let activity = currentActivity else { return }
        
        let finalState = ClaraSessionAttributes.ContentState(
            phase: "ended",
            scenarioName: "",
            currentWPM: 0,
            currentPitchHz: 0,
            fillerCount: 0,
            elapsedSeconds: 0
        )
        
        let content = ActivityContent(state: finalState, staleDate: nil)
        
        Task {
            await activity.end(content, dismissalPolicy: .after(.now + 5))
            print("LiveActivityManager: Activity ended.")
        }
        
        currentActivity = nil
    }
}
