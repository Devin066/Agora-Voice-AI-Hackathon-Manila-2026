import Foundation

enum ScenarioType: String, Codable, CaseIterable, Identifiable {
    case publicSpeaking = "public_speaking"
    case jobInterview = "job_interview"
    case debate = "debate"
    case englishFluency = "english_fluency"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .publicSpeaking: return "Public Speaking"
        case .jobInterview: return "Job Interview"
        case .debate: return "Debate"
        case .englishFluency: return "English Fluency"
        }
    }

    var descriptor: String {
        switch self {
        case .publicSpeaking: return "TED talk coach"
        case .jobInterview: return "HR interviewer"
        case .debate: return "Strict debate judge"
        case .englishFluency: return "English partner"
        }
    }
}