import SwiftUI
import SwiftData

struct SessionView: View {
    let scenario: ScenarioType
    
    @StateObject private var coordinator = VoiceSessionCoordinator()
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var showSummary = false
    
    // Timer for UI up-time (informational only)
    @State private var elapsedTime = 0
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 20) {
            
            // Top: Session timer + scenario label
            HStack {
                Text(scenario.label)
                    .font(.headline)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(8)
                
                Spacer()
                
                Text(timeString(from: elapsedTime))
                    .font(.system(.title3, design: .monospaced))
                    .bold()
            }
            .padding()
            
            // Center: Real-time pitch graph (Placeholder for custom chart)
            VStack(alignment: .leading) {
                Text("Pitch Graph")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(UIColor.secondarySystemBackground))
                    .frame(height: 150)
                    .overlay(
                        // Super simplified generic squiggly line representing dynamic view
                        GeometryReader { geometry in
                            Path { path in
                                let width = geometry.size.width
                                let height = geometry.size.height
                                let midY = height / 2
                                let amplitude = min(CGFloat(coordinator.currentPitch - 100), midY)
                                
                                path.move(to: CGPoint(x: 0, y: midY))
                                path.addCurve(to: CGPoint(x: width, y: midY),
                                              control1: CGPoint(x: width * 0.25, y: midY - amplitude),
                                              control2: CGPoint(x: width * 0.75, y: midY + amplitude))
                            }
                            .stroke(Color.blue, lineWidth: 2)
                        }
                    )
            }
            .padding(.horizontal)
            
            // Metrics row
            HStack(spacing: 15) {
                MetricCard(title: "WPM", value: "\(coordinator.wpm)")
                MetricCard(title: "Fillers", value: "\(coordinator.fillerCount)")
                MetricCard(title: "Pitch", value: "\(Int(coordinator.currentPitch)) Hz")
            }
            .padding(.horizontal)
            
            // Energy bar
            VStack(alignment: .leading) {
                Text("Vocal Energy")
                    .font(.caption)
                    .foregroundColor(.secondary)
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Capsule()
                            .frame(width: geometry.size.width, height: 10)
                            .opacity(0.3)
                            .foregroundColor(.gray)
                        Capsule()
                            .frame(width: min(geometry.size.width * CGFloat(coordinator.currentEnergy * 2.0), geometry.size.width), height: 10)
                            .foregroundColor(.green)
                            .animation(.linear(duration: 0.1), value: coordinator.currentEnergy)
                    }
                }
                .frame(height: 10)
            }
            .padding(.horizontal)
            
            Spacer()
            
            // AI speaking indicator
            if coordinator.isAgentSpeaking {
                HStack {
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 16, height: 16)
                        .scaleEffect(coordinator.isAgentSpeaking ? 1.2 : 0.8)
                        .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: coordinator.isAgentSpeaking)
                    
                    Text("Agent is speaking...")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
                .padding(.bottom, 10)
            }
            
            // Bottom: Waveform + Stop button
            Button(action: {
                stopSession()
            }) {
                HStack {
                    Image(systemName: "stop.fill")
                    Text("Stop Session")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .cornerRadius(12)
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
        .onAppear {
            startSession()
        }
        .onReceive(NotificationCenter.default.publisher(for: .backTapTriggered)) { _ in
            toggleSession()
        }
        .onDisappear {
            // Clean up if backed out unintentionally
            if coordinator.state == .active {
                coordinator.stopSession()
                timer?.invalidate()
            }
        }
        .navigationDestination(isPresented: $showSummary) {
            if let activeSession = coordinator.session {
                MetricsDashboardView(session: activeSession, metrics: coordinator.metrics)
            }
        }
    }
    
    private func timeString(from seconds: Int) -> String {
        let min = seconds / 60
        let sec = seconds % 60
        return String(format: "%02d:%02d", min, sec)
    }
    
    private func startSession() {
        coordinator.requestPermissions { granted in
            if granted {
                coordinator.startSession(scenario: scenario)
                coordinator.liveActivityManager.transitionToActive(scenario: scenario)
                timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                    elapsedTime += 1
                    // Push live metrics to Dynamic Island
                    coordinator.liveActivityManager.updateMetrics(
                        wpm: coordinator.wpm,
                        pitchHz: Int(coordinator.currentPitch),
                        fillers: coordinator.fillerCount,
                        elapsed: elapsedTime,
                        scenario: scenario
                    )
                }
            } else {
                print("Permissions denied by user.")
                // Should show error state here in M8
            }
        }
    }

    private func toggleSession() {
        switch coordinator.state {
        case .idle, .summary:
            startSession()
        case .active:
            stopSession()
        case .connecting, .stopping:
            break
        }
    }
    
    private func stopSession() {
        timer?.invalidate()
        timer = nil
        coordinator.stopSession()
        
        // Persist via SwiftData
        if let session = coordinator.session {
            modelContext.insert(session)
            // session.metrics gets inserted via cascade / reference
        }
        
        // Trigger navigation
        showSummary = true
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack {
            Text(value)
                .font(.title2)
                .bold()
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 70)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

#Preview {
    SessionView(scenario: .publicSpeaking)
}
