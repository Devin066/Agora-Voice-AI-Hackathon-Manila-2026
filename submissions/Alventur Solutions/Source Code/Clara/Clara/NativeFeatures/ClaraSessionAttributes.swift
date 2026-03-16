import Foundation
import ActivityKit

/// The shared ActivityAttributes model used by both the app and the Widget Extension
/// for the Dynamic Island Live Activity.
struct ClaraSessionAttributes: ActivityAttributes {
    
    /// Dynamic content that updates during the Live Activity lifecycle.
    public struct ContentState: Codable, Hashable {
        /// Current phase: "prompt" (scenario selection), "active" (session running), "ended"
        var phase: String
        
        /// The selected scenario name (empty during "prompt" phase before selection)
        var scenarioName: String
        
        /// Live metrics (only populated during "active" phase)
        var currentWPM: Int
        var currentPitchHz: Int
        var fillerCount: Int
        var elapsedSeconds: Int
    }
    
    /// Static context set when the activity is started (does not change).
    var sessionId: String
}
