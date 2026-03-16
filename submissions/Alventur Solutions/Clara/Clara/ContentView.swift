import SwiftUI
import SwiftData
import Foundation

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \VoiceSession.startedAt, order: .reverse) private var sessions: [VoiceSession]
    @State private var selectedScenario: ScenarioType = .publicSpeaking
    @State private var statusText: String = "Idle"
    @State private var errorText: String = ""
    @State private var currentSessionId: String?
    @State private var currentChannelName: String?
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            List {
                Section("Session Control") {
                    Picker("Scenario", selection: $selectedScenario) {
                        ForEach(ScenarioType.allCases) { scenario in
                            Text(scenario.label).tag(scenario)
                        }
                    }
                    Text("Status: \(statusText)")
                    if !errorText.isEmpty {
                        Text(errorText).foregroundStyle(.red)
                    }
                    Button(currentSessionId == nil ? "Start Session" : "Stop Session") {
                        Task {
                            if currentSessionId == nil {
                                await startSession()
                            } else {
                                await stopSession()
                            }
                        }
                    }
                    .disabled(isLoading)
                    Button("Check Backend Health") {
                        Task {
                            await checkHealth()
                        }
                    }
                }
                Section("Session History") {
                    if sessions.isEmpty {
                        Text("No sessions yet.")
                    } else {
                        ForEach(sessions) { session in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(ScenarioType(rawValue: session.scenario)?.label ?? session.scenario)
                                Text("Status: \(session.status)")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                                Text("Channel: \(session.channelName)")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                                Text("Duration: \(session.durationSeconds)s")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                                Text("Started: \(session.startedAt, format: Date.FormatStyle(date: .numeric, time: .standard))")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
            }
            .navigationTitle("VoiceIQ")
        }
    }

    private func checkHealth() async {
        do {
            let health = try await APIClient.shared.health()
            statusText = "Backend \(health.status)"
            errorText = ""
        } catch {
            statusText = "Backend unavailable"
            errorText = error.localizedDescription
        }
    }

    private func startSession() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let health = try await APIClient.shared.health()
            guard health.status.lowercased() == "ok" else {
                throw APIClientError.requestFailed("Backend health check did not return ok.")
            }
            let token = try await APIClient.shared.generateToken(channelName: nil, uid: nil)
            let start = try await APIClient.shared.startSession(
                channelName: token.channelName,
                scenario: selectedScenario,
                userId: nil
            )

            currentSessionId = start.sessionId
            currentChannelName = start.channelName
            statusText = "Session active"
            errorText = ""

            let record = VoiceSession(
                id: start.sessionId,
                scenario: selectedScenario.rawValue,
                startedAt: Date(),
                status: start.status,
                channelName: start.channelName,
                userTokenExpiresAt: token.expiresAt
            )
            modelContext.insert(record)
        } catch {
            statusText = "Start failed"
            errorText = error.localizedDescription
        }
    }

    private func stopSession() async {
        guard let currentSessionId else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            _ = try await APIClient.shared.stopSession(sessionId: currentSessionId, channelName: currentChannelName)
            let descriptor = FetchDescriptor<VoiceSession>(predicate: #Predicate { $0.id == currentSessionId })
            if let record = try modelContext.fetch(descriptor).first {
                let ended = Date()
                record.endedAt = ended
                record.durationSeconds = Int(ended.timeIntervalSince(record.startedAt))
                record.status = "stopped"
            }
            self.currentSessionId = nil
            self.currentChannelName = nil
            statusText = "Session stopped"
            errorText = ""
        } catch {
            statusText = "Stop failed"
            errorText = error.localizedDescription
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: VoiceSession.self, inMemory: true)
}
