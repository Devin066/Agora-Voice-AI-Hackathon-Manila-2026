//
//  ContentView.swift
//  Clara
//
//  Created by Ali on 3/16/26.
//

import SwiftUI
import SwiftData
import Foundation

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var items: [Item]
    @State private var statusText: String = ""
    @State private var selectedScenario: ScenarioType = .publicSpeaking
    @State private var currentSessionId: String? = nil

    var body: some View {
        NavigationSplitView {
            List {
                ForEach(items) { item in
                    NavigationLink {
                        Text("Item at \(item.timestamp, format: Date.FormatStyle(date: .numeric, time: .standard))")
                    } label: {
                        Text(item.timestamp, format: Date.FormatStyle(date: .numeric, time: .standard))
                    }
                }
                .onDelete(perform: deleteItems)
                Section("VoiceIQ Backend") {
                    Text(statusText.isEmpty ? "Idle" : statusText)
                    Picker("Scenario", selection: $selectedScenario) {
                        ForEach(ScenarioType.allCases) { s in
                            Text(s.label).tag(s)
                        }
                    }
                    Button("Ping Backend") {
                        Task {
                            do {
                                let res = try await APIClient.shared.health()
                                statusText = "\(res.status)"
                            } catch {
                                statusText = "error"
                            }
                        }
                    }
                    Button(currentSessionId == nil ? "Start Session" : "Stop Session") {
                        Task {
                            if currentSessionId == nil {
                                do {
                                    let start = try await APIClient.shared.startSession(channelName: nil, scenario: selectedScenario, userId: nil)
                                    currentSessionId = start.sessionId
                                    statusText = start.status
                                } catch {
                                    statusText = "error"
                                }
                            } else if let id = currentSessionId {
                                do {
                                    let stop = try await APIClient.shared.stopSession(sessionId: id, channelName: nil)
                                    statusText = stop.status
                                    currentSessionId = nil
                                } catch {
                                    statusText = "error"
                                }
                            }
                        }
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addItem) {
                        Label("Add Item", systemImage: "plus")
                    }
                }
            }
        } detail: {
            Text("Select an item")
        }
    }

    private func addItem() {
        withAnimation {
            let newItem = Item(timestamp: Date())
            modelContext.insert(newItem)
        }
    }

    private func deleteItems(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(items[index])
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Item.self, inMemory: true)
}
