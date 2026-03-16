//
//  IslandLiveActivity.swift
//  Island
//
//  Clara Dynamic Island Live Activity
//

import ActivityKit
import WidgetKit
import SwiftUI

struct IslandLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ClaraSessionAttributes.self) { context in
            // Lock screen / banner UI
            lockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    expandedLeading(context: context)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    expandedTrailing(context: context)
                }
                DynamicIslandExpandedRegion(.center) {
                    expandedCenter(context: context)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    expandedBottom(context: context)
                }
            } compactLeading: {
                compactLeadingView(context: context)
            } compactTrailing: {
                compactTrailingView(context: context)
            } minimal: {
                minimalView(context: context)
            }
            .keylineTint(.blue)
        }
    }
    
    // MARK: - Lock Screen Banner
    
    @ViewBuilder
    private func lockScreenView(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        
        if state.phase == "prompt" {
            HStack {
                Image(systemName: "mic.circle.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
                VStack(alignment: .leading) {
                    Text("Clara Voice Coach")
                        .font(.headline)
                    Text("Tap to select a scenario")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8))
            .activitySystemActionForegroundColor(.white)
        } else if state.phase == "active" {
            HStack(spacing: 16) {
                VStack(alignment: .leading) {
                    Text(state.scenarioName)
                        .font(.headline)
                    Text(timeString(from: state.elapsedSeconds))
                        .font(.caption)
                        .monospacedDigit()
                }
                Spacer()
                metricPill(label: "WPM", value: "\(state.currentWPM)")
                metricPill(label: "Hz", value: "\(state.currentPitchHz)")
                metricPill(label: "Fillers", value: "\(state.fillerCount)")
            }
            .padding()
            .activityBackgroundTint(Color.blue.opacity(0.15))
            .activitySystemActionForegroundColor(.white)
        } else {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text("Session complete!")
                    .font(.headline)
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8))
            .activitySystemActionForegroundColor(.white)
        }
    }
    
    // MARK: - Expanded Dynamic Island Regions
    
    @ViewBuilder
    private func expandedLeading(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "active" {
            VStack(alignment: .leading, spacing: 2) {
                Image(systemName: "waveform")
                    .foregroundColor(.blue)
                Text("\(state.currentPitchHz)")
                    .font(.title3)
                    .bold()
                    .monospacedDigit()
                Text("Hz")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        } else {
            Image(systemName: "mic.circle.fill")
                .foregroundColor(.blue)
                .font(.title2)
        }
    }
    
    @ViewBuilder
    private func expandedTrailing(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "active" {
            VStack(alignment: .trailing, spacing: 2) {
                Image(systemName: "speedometer")
                    .foregroundColor(.green)
                Text("\(state.currentWPM)")
                    .font(.title3)
                    .bold()
                    .monospacedDigit()
                Text("WPM")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        } else {
            Image(systemName: "hand.tap")
                .foregroundColor(.blue)
                .font(.title2)
        }
    }
    
    @ViewBuilder
    private func expandedCenter(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "prompt" {
            Text("Select a scenario")
                .font(.headline)
        } else if state.phase == "active" {
            Text(state.scenarioName)
                .font(.headline)
        } else {
            Text("Done!")
                .font(.headline)
        }
    }
    
    @ViewBuilder
    private func expandedBottom(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "active" {
            HStack {
                Label("\(state.fillerCount) fillers", systemImage: "exclamationmark.bubble")
                    .font(.caption)
                Spacer()
                Text(timeString(from: state.elapsedSeconds))
                    .font(.caption)
                    .monospacedDigit()
            }
        } else if state.phase == "prompt" {
            Text("Open Clara to begin")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
    
    // MARK: - Compact Views (pill)
    
    @ViewBuilder
    private func compactLeadingView(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "active" {
            Image(systemName: "waveform")
                .foregroundColor(.blue)
        } else {
            Image(systemName: "mic.circle.fill")
                .foregroundColor(.blue)
        }
    }
    
    @ViewBuilder
    private func compactTrailingView(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        let state = context.state
        if state.phase == "active" {
            Text("\(state.currentWPM) wpm")
                .font(.caption2)
                .monospacedDigit()
        } else {
            Text("Clara")
                .font(.caption2)
        }
    }
    
    // MARK: - Minimal (when multiple Live Activities compete)
    
    @ViewBuilder
    private func minimalView(context: ActivityViewContext<ClaraSessionAttributes>) -> some View {
        Image(systemName: "waveform")
            .foregroundColor(.blue)
    }
    
    // MARK: - Helpers
    
    private func timeString(from seconds: Int) -> String {
        let min = seconds / 60
        let sec = seconds % 60
        return String(format: "%02d:%02d", min, sec)
    }
    
    private func metricPill(label: String, value: String) -> some View {
        VStack(spacing: 1) {
            Text(value)
                .font(.caption)
                .bold()
                .monospacedDigit()
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Previews

extension ClaraSessionAttributes {
    fileprivate static var preview: ClaraSessionAttributes {
        ClaraSessionAttributes(sessionId: "preview-123")
    }
}

extension ClaraSessionAttributes.ContentState {
    fileprivate static var promptState: ClaraSessionAttributes.ContentState {
        ClaraSessionAttributes.ContentState(
            phase: "prompt", scenarioName: "",
            currentWPM: 0, currentPitchHz: 0, fillerCount: 0, elapsedSeconds: 0
        )
    }
    
    fileprivate static var activeState: ClaraSessionAttributes.ContentState {
        ClaraSessionAttributes.ContentState(
            phase: "active", scenarioName: "Job Interview",
            currentWPM: 142, currentPitchHz: 128, fillerCount: 3, elapsedSeconds: 47
        )
    }
}

#Preview("Notification", as: .content, using: ClaraSessionAttributes.preview) {
    IslandLiveActivity()
} contentStates: {
    ClaraSessionAttributes.ContentState.promptState
    ClaraSessionAttributes.ContentState.activeState
}
