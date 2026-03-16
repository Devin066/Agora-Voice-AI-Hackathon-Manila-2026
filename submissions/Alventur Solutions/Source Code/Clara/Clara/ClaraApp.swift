import SwiftUI
import SwiftData

@main
struct ClaraApp: App {
    @UIApplicationDelegateAdaptor(ClaraAppDelegate.self) var appDelegate
    @StateObject private var coordinator = VoiceSessionCoordinator()

    var sharedModelContainer: ModelContainer = {
        func makeContainer(using configuration: ModelConfiguration) throws -> ModelContainer {
            try ModelContainer(for: VoiceSession.self, SessionMetrics.self, migrationPlan: nil, configurations: configuration)
        }

        let schema = Schema([
            VoiceSession.self,
            SessionMetrics.self
        ])
        let modelConfiguration = ModelConfiguration(
            "Clara",
            schema: schema,
            isStoredInMemoryOnly: false,
            allowsSave: true,
            groupContainer: .automatic,
            cloudKitDatabase: .none
        )

        do {
            return try makeContainer(using: modelConfiguration)
        } catch {
            // Fall back to an in-memory store to keep the app bootable during schema churn.
            let fallbackConfiguration = ModelConfiguration(
                "ClaraMemoryFallback",
                schema: schema,
                isStoredInMemoryOnly: true,
                allowsSave: true,
                groupContainer: .automatic,
                cloudKitDatabase: .none
            )

            do {
                return try makeContainer(using: fallbackConfiguration)
            } catch {
                fatalError("Could not create ModelContainer: \(error)")
            }
        }
    }()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                ScenarioPickerView()
            }
            .environmentObject(coordinator)
        }
        .modelContainer(sharedModelContainer)
    }
}
