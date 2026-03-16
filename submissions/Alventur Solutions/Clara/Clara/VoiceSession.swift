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

    init(id: String, scenario: String, startedAt: Date, endedAt: Date? = nil, durationSeconds: Int = 0, status: String, channelName: String, userTokenExpiresAt: String) {
        self.id = id
        self.scenario = scenario
        self.startedAt = startedAt
        self.endedAt = endedAt
        self.durationSeconds = durationSeconds
        self.status = status
        self.channelName = channelName
        self.userTokenExpiresAt = userTokenExpiresAt
    }
}
