import Foundation
import SwiftData

@Model
final class SessionMetrics {
    var id: UUID = UUID()
    
    // Scores
    var overallScore: Float = 0
    var pacingScore: Float = 0
    var intonationScore: Float = 0
    var fillerScore: Float = 0
    var confidenceScore: Float = 0
    var fluencyScore: Float = 0
    
    // Pitch Data
    var averagePitchHz: Float = 0
    var pitchRangeHz: Float = 0
    var pitchVariance: Float = 0
    var intonationPattern: String = "Flat"
    
    // Pacing / Speech Data
    var averageWPM: Int = 0
    var totalFillerWords: Int = 0
    var fillerWordsPerMinute: Float = 0
    var totalPauses: Int = 0
    var averagePauseDuration: Float = 0
    
    var session: VoiceSession?
    
    init(overallScore: Float = 0, pacingScore: Float = 0, intonationScore: Float = 0, fillerScore: Float = 0, confidenceScore: Float = 0, fluencyScore: Float = 0, averagePitchHz: Float = 0, pitchRangeHz: Float = 0, pitchVariance: Float = 0, intonationPattern: String = "Flat", averageWPM: Int = 0, totalFillerWords: Int = 0, fillerWordsPerMinute: Float = 0, totalPauses: Int = 0, averagePauseDuration: Float = 0) {
        self.overallScore = overallScore
        self.pacingScore = pacingScore
        self.intonationScore = intonationScore
        self.fillerScore = fillerScore
        self.confidenceScore = confidenceScore
        self.fluencyScore = fluencyScore
        self.averagePitchHz = averagePitchHz
        self.pitchRangeHz = pitchRangeHz
        self.pitchVariance = pitchVariance
        self.intonationPattern = intonationPattern
        self.averageWPM = averageWPM
        self.totalFillerWords = totalFillerWords
        self.fillerWordsPerMinute = fillerWordsPerMinute
        self.totalPauses = totalPauses
        self.averagePauseDuration = averagePauseDuration
    }
}
