//
//  IslandBundle.swift
//  Island
//
//  Created by Ali on 3/16/26.
//

import WidgetKit
import SwiftUI

@main
struct IslandBundle: WidgetBundle {
    var body: some Widget {
        Island()
        IslandControl()
        IslandLiveActivity()
    }
}
