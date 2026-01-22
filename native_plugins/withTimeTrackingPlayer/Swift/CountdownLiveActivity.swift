import ActivityKit
import WidgetKit
import SwiftUI

struct CountdownAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var remainingSeconds: Int
    }
    var title: String
}

struct CountdownLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: CountdownAttributes.self) { context in
            VStack {
                Text(context.attributes.title)
                    .font(.headline)
                Text("\(context.state.remainingSeconds)s")
                    .font(.largeTitle)
            }
            .activityBackgroundTint(.blue)
            .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            // optional: iPhone Dynamic Island configuration
            DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    Text("\(context.state.remainingSeconds)s left")
                        .font(.headline)
                }
            } compactLeading: {
                Text("\(context.state.remainingSeconds)s")
            } compactTrailing: {
                Text("\(context.state.remainingSeconds)s")
            } minimal: {
                Text("\(context.state.remainingSeconds)s")
            }
        }
    }
}
