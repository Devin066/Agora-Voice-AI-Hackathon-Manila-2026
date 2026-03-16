// Shared ActivityAttributes for Clara Live Activity
// This file must be included in BOTH the main Clara target AND the Island widget extension target.

import Foundation
import ActivityKit

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
