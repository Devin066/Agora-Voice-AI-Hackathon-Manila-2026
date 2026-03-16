import Foundation
import SwiftData

@Model
final class VoiceSession {
    @Attribute(.unique) var id: String
    var scenario: String
    var startedAt: Date
    var endedAt: Date?
    var durationSeconds: Int
    var status: String
    var channelName: String
    var userTokenExpiresAt: String

    @Relationship(deleteRule: .cascade)
    var metrics: SessionMetrics?

    var scenarioType: ScenarioType {
        get { ScenarioType(rawValue: scenario) ?? .publicSpeaking }
        set { scenario = newValue.rawValue }
    }

    init(id: String = UUID().uuidString, scenario: String, startedAt: Date = Date(), endedAt: Date? = nil, durationSeconds: Int = 0, status: String = "active", channelName: String = "", userTokenExpiresAt: String = "") {
        self.id = id
        self.scenario = scenario
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.durationSeconds = durationSeconds
        self.status = status
        self.channelName = channelName
        self.userTokenExpiresAt = userTokenExpiresAt
    }

    convenience init(scenario: ScenarioType, startedAt: Date = Date(), endedAt: Date? = nil, durationSeconds: Int = 0) {
        self.init(
            scenario: scenario.rawValue,
            startedAt: startedAt,
            endedAt: endedAt,
            durationSeconds: durationSeconds
        )
    }
}