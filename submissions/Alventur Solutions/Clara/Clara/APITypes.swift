import Foundation

struct HealthResponse: Decodable {
    let status: String
    let timestamp: String
}

struct TokenGenerateRequest: Encodable {
    let channelName: String
    let uid: Int
}

struct TokenResponse: Decodable {
    let token: String
    let channelName: String
    let uid: Int
    let expiresAt: String
}

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
}

struct StartSessionRequest: Encodable {
    let channelName: String?
    let scenario: ScenarioType
    let userId: String?
}

struct StartSessionResponse: Decodable {
    let sessionId: String
    let agentUid: Int
    let channelName: String
    let status: String
}

struct StopSessionRequest: Encodable {
    let sessionId: String
    let channelName: String?
}

struct StopSessionResponse: Decodable {
    let sessionId: String
    let status: String
    let stoppedAt: String
}
