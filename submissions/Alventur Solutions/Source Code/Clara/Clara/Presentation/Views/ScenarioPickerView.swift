import SwiftUI
import SwiftData

struct ScenarioPickerView: View {
    @Query(sort: \VoiceSession.startedAt, order: .reverse) private var sessions: [VoiceSession]
    @State private var selectedScenario: ScenarioType?
    @State private var isSessionActive = false
    @State private var showBackTapSheet = false
    @State private var showLiveActivityAlert = false
    @State private var liveActivityAlertMessage = ""
    @State private var statusText: String = "Idle"
    @State private var errorText: String = ""
    
    private let liveActivityManager = LiveActivityManager()
    private let hapticsEngine = HapticsEngine()

    var body: some View {
        VStack(spacing: 20) {
            Text("Clara Voice Coach")
                .font(.largeTitle)
                .bold()
                .padding(.top)
            
            Text("Select a scenario to practice:")
                .font(.headline)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                ForEach(ScenarioType.allCases) { scenario in
                    Button(action: {
                        selectedScenario = scenario
                    }) {
                        VStack {
                            Text(scenario.label)
                                .font(.headline)
                                .multilineTextAlignment(.center)
                            
                            Text(scenario.descriptor)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 120)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(selectedScenario == scenario ? Color.blue.opacity(0.1) : Color(UIColor.secondarySystemBackground))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(selectedScenario == scenario ? Color.blue : Color.clear, lineWidth: 2)
                        )
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding()
            
            Spacer()
            
            // Start Session button (normal flow)
            Button(action: {
                if selectedScenario != nil {
                    isSessionActive = true
                }
            }) {
                Text("Start Session")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedScenario == nil ? Color.gray : Color.blue)
                    .cornerRadius(12)
            }
            .disabled(selectedScenario == nil)
            .padding(.horizontal)
            
            // Fallback: Simulate Back Tap (for Simulator / testing)
            #if DEBUG
            Button(action: {
                BackTapHandler.triggerBackTap()
            }) {
                HStack {
                    Image(systemName: "hand.tap")
                    Text("Simulate Back Tap")
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
            .padding(.bottom)
            #endif

            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Status: \(statusText)")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Button("Check Backend") {
                        Task {
                            await checkHealth()
                        }
                    }
                    .font(.footnote)
                }

                if !errorText.isEmpty {
                    Text(errorText)
                        .font(.footnote)
                        .foregroundStyle(.red)
                }

                Text("Recent Sessions")
                    .font(.subheadline)
                    .bold()

                if sessions.isEmpty {
                    Text("No sessions yet.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(Array(sessions.prefix(3))) { session in
                        VStack(alignment: .leading, spacing: 2) {
                            Text(ScenarioType(rawValue: session.scenario)?.label ?? session.scenario)
                                .font(.footnote)
                                .bold()
                            Text("\(session.status) • \(session.durationSeconds)s")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .navigationTitle("Scenarios")
        .navigationBarHidden(true)
        // Navigate to SessionView
        .navigationDestination(isPresented: $isSessionActive) {
            if let scenario = selectedScenario {
                SessionView(scenario: scenario)
            }
        }
        // Listen for Back Tap notification
        .onReceive(NotificationCenter.default.publisher(for: BackTapHandler.backTapNotification)) { _ in
            hapticsEngine.playConfirmationTap()
            let started = liveActivityManager.startPrompt()
            if started {
                showBackTapSheet = true
            } else {
                liveActivityAlertMessage = liveActivityManager.liveActivitiesDisabledReason
                showLiveActivityAlert = true
            }
        }
        // Back Tap scenario selection sheet (Dynamic Island prompt companion)
        .sheet(isPresented: $showBackTapSheet) {
            BackTapScenarioSheet(
                onScenarioSelected: { scenario in
                    selectedScenario = scenario
                    liveActivityManager.transitionToActive(scenario: scenario)
                    showBackTapSheet = false
                    isSessionActive = true
                },
                onCancel: {
                    liveActivityManager.endActivity()
                    showBackTapSheet = false
                }
            )
            .presentationDetents([.medium])
        }
        .alert("Dynamic Island Unavailable", isPresented: $showLiveActivityAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(liveActivityAlertMessage)
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
}

/// A compact sheet shown when the user Back Taps, mirroring what Dynamic Island would prompt.
struct BackTapScenarioSheet: View {
    let onScenarioSelected: (ScenarioType) -> Void
    let onCancel: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Quick Start")
                .font(.title2)
                .bold()
            
            Text("What would you like to practice?")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            ForEach(ScenarioType.allCases) { scenario in
                Button(action: {
                    onScenarioSelected(scenario)
                }) {
                    HStack {
                        Text(scenario.label)
                            .font(.headline)
                        Spacer()
                        Text(scenario.descriptor)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                }
                .buttonStyle(PlainButtonStyle())
            }
            
            Button("Cancel", role: .cancel) {
                onCancel()
            }
            .padding(.top)
        }
        .padding()
    }
}

#Preview {
    NavigationStack {
        ScenarioPickerView()
    }
}
