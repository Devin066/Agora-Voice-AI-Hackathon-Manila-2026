import Foundation

enum APIClientError: LocalizedError {
    case invalidResponse
    case requestFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server."
        case .requestFailed(let message):
            return message
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    var baseURL: URL

    init(baseURL: URL = URL(string: "http://172.20.10.5:8000")!) {
        self.baseURL = baseURL
    }

    func health() async throws -> HealthResponse {
        let url = baseURL.appendingPathComponent("health")
        let request = URLRequest(url: url)
        return try await perform(request)
    }

    func generateToken(channelName: String?, uid: Int?) async throws -> TokenResponse {
        let url = baseURL.appendingPathComponent("token").appendingPathComponent("generate")
        let body = TokenGenerateRequest(channelName: channelName, uid: uid)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        return try await perform(req)
    }

    func startSession(channelName: String?, scenario: ScenarioType, userId: Int?) async throws -> StartSessionResponse {
        let url = baseURL.appendingPathComponent("session").appendingPathComponent("start")
        let body = StartSessionRequest(channelName: channelName, scenario: scenario.rawValue, userId: userId)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        return try await perform(req)
    }

    func stopSession(sessionId: String, channelName: String?) async throws -> StopSessionResponse {
        let url = baseURL.appendingPathComponent("session").appendingPathComponent("stop")
        let body = StopSessionRequest(sessionId: sessionId, channelName: channelName)
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(body)
        return try await perform(req)
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIClientError.invalidResponse
        }

        guard 200..<300 ~= http.statusCode else {
            if let backendError = try? JSONDecoder().decode(BackendErrorResponse.self, from: data) {
                throw APIClientError.requestFailed(backendError.detail)
            }
            if let message = String(data: data, encoding: .utf8), !message.isEmpty {
                throw APIClientError.requestFailed(message)
            }
            throw APIClientError.requestFailed("Request failed with status code \(http.statusCode).")
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
