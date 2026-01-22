import Foundation
import ActivityKit

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {
    @objc
    func startCountdown(_ seconds: Int) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        let initialState = CountdownAttributes.ContentState(remainingSeconds: seconds)
        let attributes = CountdownAttributes(title: "Countdown")

        do {
            let activity = try Activity<CountdownAttributes>.request(attributes: attributes, contentState: initialState, pushType: nil)

            // Update every second
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
                var newSeconds = activity.contentState.remainingSeconds - 1
                if newSeconds <= 0 {
                    activity.end(dismissalPolicy: .immediate)
                    timer.invalidate()
                } else {
                    Task {
                        await activity.update(using: CountdownAttributes.ContentState(remainingSeconds: newSeconds))
                    }
                }
            }
        } catch {
            print("Failed to start Live Activity: \(error)")
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
