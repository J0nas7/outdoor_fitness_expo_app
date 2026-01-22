//
//  TimeTrackingPlayerBundle.swift
//  TimeTrackingPlayer
//
//  Created by Jonas Alexander Sørensen on 09/01/2026.
//

import WidgetKit
import SwiftUI

@main
struct TimeTrackingPlayerBundle: WidgetBundle {
    var body: some Widget {
        TimeTrackingPlayer()
        TimeTrackingPlayerControl()
        TimeTrackingPlayerLiveActivity()
    }
}
