import SwiftUI
import SwiftData

struct MetricsDashboardView: View {
    let session: VoiceSession
    let metrics: SessionMetrics
    
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                
                // Header
                Text("Session Summary")
                    .font(.largeTitle)
                    .bold()
                    .padding(.top)
                
                Text(ScenarioType(rawValue: session.scenario)?.label ?? session.scenario)
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                // Overall Score Ring
                ZStack {
                    Circle()
                        .stroke(lineWidth: 20)
                        .opacity(0.2)
                        .foregroundColor(.blue)
                    
                    Circle()
                        .trim(from: 0.0, to: CGFloat(metrics.overallScore) / 100.0)
                        .stroke(style: StrokeStyle(lineWidth: 20, lineCap: .round, lineJoin: .round))
                        .foregroundColor(.blue)
                        .rotationEffect(Angle(degrees: 270.0))
                    
                    VStack {
                        Text("\(Int(metrics.overallScore))")
                            .font(.system(size: 60, weight: .bold))
                        Text("Overall")
                            .font(.title3)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(width: 200, height: 200)
                .padding()
                
                // Sub-scores Breakdown
                VStack(spacing: 16) {
                    ScoreRow(title: "Pacing", score: Int(metrics.pacingScore), icon: "speedometer")
                    ScoreRow(title: "Intonation", score: Int(metrics.intonationScore), icon: "waveform.path.ecg")
                    ScoreRow(title: "Filler Words", score: Int(metrics.fillerScore), icon: "exclamationmark.bubble")
                    ScoreRow(title: "Confidence", score: Int(metrics.confidenceScore), icon: "star.fill")
                    ScoreRow(title: "Fluency (Pauses)", score: Int(metrics.fluencyScore), icon: "pause.circle")
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
                
                // Details
                VStack(alignment: .leading, spacing: 12) {
                    Text("Details")
                        .font(.title2)
                        .bold()
                        .padding(.bottom, 4)
                    
                    DetailRow(t: "Intonation Pattern", v: metrics.intonationPattern)
                    DetailRow(t: "Total Fillers", v: "\(metrics.totalFillerWords)")
                    DetailRow(t: "Average WPM", v: "\(metrics.averageWPM)")
                    DetailRow(t: "Pitch Range", v: "\(Int(metrics.pitchRangeHz)) Hz")
                    DetailRow(t: "Average Pause", v: String(format: "%.1fs", metrics.averagePauseDuration))
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(16)
                .padding(.horizontal)
                
                // Practice Again Button
                Button(action: {
                    // Navigate back to root
                    dismiss()
                }) {
                    Text("Practice Again")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                .padding()
            }
        }
    }
}

struct ScoreRow: View {
    let title: String
    let score: Int
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 30)
                .foregroundColor(.blue)
            Text(title)
                .font(.body)
            Spacer()
            Text("\(score)/100")
                .bold()
                .monospacedDigit()
        }
    }
}

struct DetailRow: View {
    let t: String
    let v: String
    var body: some View {
        HStack {
            Text(t)
                .foregroundColor(.secondary)
            Spacer()
            Text(v)
                .bold()
        }
        .padding(.vertical, 2)
    }
}

#Preview {
    let mockMetrics = SessionMetrics(overallScore: 85, pacingScore: 90, intonationScore: 80, fillerScore: 75, confidenceScore: 88, fluencyScore: 92, averagePitchHz: 120, pitchRangeHz: 45, pitchVariance: 12, intonationPattern: "Expressive", averageWPM: 145, totalFillerWords: 3, fillerWordsPerMinute: 1.5, totalPauses: 2, averagePauseDuration: 2.1)
    let mockSession = VoiceSession(scenario: .publicSpeaking, durationSeconds: 120)
    MetricsDashboardView(session: mockSession, metrics: mockMetrics)
}
