import Foundation
import UIKit

/// Handles the Back Tap (Magic Tap) accessibility gesture.
/// When the user double-taps the back of the phone, this handler fires a callback.
///
/// **How it works:**
/// - We use UIAccessibility's "Magic Tap" (two-finger double-tap) as a proxy
///   for Back Tap since Back Tap itself is configured in iOS Settings and triggers
///   Accessibility Shortcut → which we map to our app's magic tap handler.
/// - The user must configure Back Tap in Settings → Accessibility → Touch → Back Tap → Double Tap → Magic Tap
///
/// Alternatively, we post a notification that any view can listen to.
class BackTapHandler {
    static let backTapNotification = Notification.Name.backTapTriggered
    
    /// Call this from your app's root view controller or SwiftUI WindowGroup scene
    /// to register the magic tap responder.
    static func registerMagicTapHandler() {
        // SwiftUI doesn't directly support accessibilityPerformMagicTap,
        // so we rely on AppDelegate / UIApplication-level handling.
        // The actual handler is in ClaraAppDelegate below.
    }
    
    /// Fires the back tap notification. Called from the AppDelegate magic tap handler.
    static func triggerBackTap() {
        NotificationCenter.default.post(name: .backTapTriggered, object: nil)
    }
}

extension Notification.Name {
    static let backTapTriggered = Notification.Name("backTapTriggered")
}

/// A UIApplicationDelegate that intercepts the Magic Tap accessibility gesture.
/// This is the bridge between the hardware Back Tap (configured via iOS Settings)
/// and our app logic.
class ClaraAppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        return true
    }

    override func accessibilityPerformMagicTap() -> Bool {
        BackTapHandler.triggerBackTap()
        return true
    }
}
