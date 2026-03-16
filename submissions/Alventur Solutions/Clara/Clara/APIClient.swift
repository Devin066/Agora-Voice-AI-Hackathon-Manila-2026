import Foundation

final class APIClient {
    static let shared = APIClient()
    var baseURL: URL

    init(baseURL: URL = URL(string: "http://127.0.0.1:8000")!) {
        self.baseURL = baseURL
    }

    func health() async throws -> HealthResponse {
        let url = baseURL.appendingPathComponent("health")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(HealthResponse.self, from: data)
    }

    func generateToken(channelName: String, uid: Int) async throws -> TokenResponse {
        let url = baseURL.appendingPathComponent("token").appendingPathComponent("generate")
        let body = TokenGenerateRequest(channelName: channelName, uid: uid)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    func startSession(channelName: String?, scenario: ScenarioType, userId: String?) async throws -> StartSessionResponse {
        let url = baseURL.appendingPathComponent("session").appendingPathComponent("start")
        let body = StartSessionRequest(channelName: channelName, scenario: scenario, userId: userId)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(StartSessionResponse.self, from: data)
    }

    func stopSession(sessionId: String, channelName: String?) async throws -> StopSessionResponse {
        let url = baseURL.appendingPathComponent("session").appendingPathComponent("stop")
        let body = StopSessionRequest(sessionId: sessionId, channelName: channelName)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(StopSessionResponse.self, from: data)
    }
}
