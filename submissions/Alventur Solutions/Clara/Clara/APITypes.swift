import Foundation

struct HealthResponse: Decodable {
    let status: String
    let timestamp: String
}

struct TokenGenerateRequest: Encodable {
    let channelName: String?
    let uid: Int?
}

struct TokenResponse: Decodable {
    let token: String
    let channelName: String
    let uid: Int
    let expiresAt: String
}

struct StartSessionRequest: Encodable {
    let channelName: String?
    let scenario: String
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

struct BackendErrorResponse: Decodable {
    let detail: String
}
