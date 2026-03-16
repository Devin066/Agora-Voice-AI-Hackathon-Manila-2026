import Foundation
import AVFoundation
import AgoraRtcKit

protocol AgoraVoiceServiceProtocol: AnyObject {
    var onAgentSpeakingChanged: ((Bool) -> Void)? { get set }
    var onAudioFrameCaptured: ((AgoraAudioFrame) -> Void)? { get set }

    func start(appId: String, token: String, channelName: String, uid: UInt, agentUid: UInt) async throws
    func setExpectedAgentUid(_ uid: UInt)
    func reconfigureAudioRoute()
    func stop() async
}

enum AgoraVoiceServiceError: LocalizedError {
    case missingAppId
    case invalidAppId
    case engineCreationFailed
    case joinFailed(code: Int32)
    case leaveFailed(code: Int32)
    case timeout

    var errorDescription: String? {
        switch self {
        case .missingAppId:
            return "AGORA_APP_ID is missing. Add it to your app target Info settings."
        case .invalidAppId:
            return "AGORA_APP_ID is invalid."
        case .engineCreationFailed:
            return "Unable to create Agora RTC engine."
        case .joinFailed(let code):
            return "Failed to join Agora channel (code: \(code))."
        case .leaveFailed(let code):
            return "Failed to leave Agora channel (code: \(code))."
        case .timeout:
            return "Timed out while waiting for Agora join confirmation."
        }
    }
}

struct AppRuntimeConfiguration {
    let agoraAppId: String

    static func load(bundle: Bundle = .main) throws -> AppRuntimeConfiguration {
        let infoValue = bundle.object(forInfoDictionaryKey: "AGORA_APP_ID")
        let envValue = ProcessInfo.processInfo.environment["AGORA_APP_ID"]

        let rawAppId = [infoValue.map { String(describing: $0) }, envValue]
            .compactMap { $0 }
            .first

        guard let rawAppId else {
            throw AgoraVoiceServiceError.missingAppId
        }

        let trimmedAppId = rawAppId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedAppId.isEmpty else {
            throw AgoraVoiceServiceError.missingAppId
        }

        guard trimmedAppId.range(of: "^[A-Za-z0-9]+$", options: .regularExpression) != nil else {
            throw AgoraVoiceServiceError.invalidAppId
        }

        return AppRuntimeConfiguration(agoraAppId: trimmedAppId)
    }
}

@MainActor
final class AgoraVoiceService: NSObject, AgoraVoiceServiceProtocol {
    var onAgentSpeakingChanged: ((Bool) -> Void)?
    var onAudioFrameCaptured: ((AgoraAudioFrame) -> Void)?

    private var engine: AgoraRtcEngineKit?
    private var expectedAgentUid: UInt?
    private var activeRemoteUid: UInt?
    private var joinContinuation: CheckedContinuation<Void, Error>?
    private var didLogFirstRecordFrame = false
    private var routeChangeObserver: NSObjectProtocol?
    private var interruptionObserver: NSObjectProtocol?

    func setExpectedAgentUid(_ uid: UInt) {
        expectedAgentUid = uid
        print("[agora] updated expectedAgentUid=\(uid)")
    }

    func reconfigureAudioRoute() {
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[agora] failed to activate audio session while reconfiguring route: \(error)")
        }

        _ = engine?.setEnableSpeakerphone(true)
        do {
            try AVAudioSession.sharedInstance().overrideOutputAudioPort(.speaker)
        } catch {
            print("[agora] failed to override output to speaker: \(error)")
        }
        logCurrentAudioRoute(context: "reconfigureAudioRoute")
        print("[agora] reconfigured audio route to speakerphone")
    }

    func start(appId: String, token: String, channelName: String, uid: UInt, agentUid: UInt) async throws {
        let normalizedAppId = appId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !normalizedAppId.isEmpty else {
            throw AgoraVoiceServiceError.invalidAppId
        }

        print("[agora] start localUid=\(uid) expectedAgentUid=\(agentUid) channel=\(channelName)")
        print("[agora] startup step=engine_init_begin")

        if engine == nil {
            let config = AgoraRtcEngineConfig()
            config.appId = normalizedAppId
            config.channelProfile = .communication
            let rtcEngine = AgoraRtcEngineKit.sharedEngine(with: config, delegate: self)
            rtcEngine.setAudioFrameDelegate(self)
            engine = rtcEngine
            installAudioSessionObserversIfNeeded()
        }
        print("[agora] startup step=engine_init_done")

        // In Agora iOS 4.x, register frame format explicitly so record callbacks fire predictably.
        if let engine {
            let result = engine.setRecordingAudioFrameParametersWithSampleRate(
                16_000,
                channel: 1,
                mode: .readOnly,
                samplesPerCall: 1024
            )
            if result != 0 {
                print("[agora] setRecordingAudioFrameParameters failed code=\(result)")
            }
        }
        print("[agora] startup step=record_frame_params_done")

        configureAudioSessionBestEffort()
        print("[agora] startup step=audio_session_config_done")
        onAgentSpeakingChanged?(false)
        expectedAgentUid = agentUid
        activeRemoteUid = nil

        _ = engine?.enableAudio()
        _ = engine?.enableLocalAudio(true)
        _ = engine?.muteAllRemoteAudioStreams(false)
        _ = engine?.setDefaultAudioRouteToSpeakerphone(true)
        _ = engine?.setEnableSpeakerphone(true)
        _ = engine?.enableAudioVolumeIndication(200, smooth: 3, reportVad: true)
        reconfigureAudioRoute()
        print("[agora] startup step=agora_audio_flags_done")

        print("[agora] startup step=join_begin")
        try await joinChannel(token: token, channelName: channelName, uid: uid)
        print("[agora] startup step=join_done")
    }

    func stop() async {
        joinContinuation?.resume(throwing: CancellationError())
        joinContinuation = nil

        onAgentSpeakingChanged?(false)
        expectedAgentUid = nil
        activeRemoteUid = nil

        guard let engine else { return }
        let result = engine.leaveChannel(nil)
        if result != 0 {
            print(AgoraVoiceServiceError.leaveFailed(code: result).localizedDescription)
        }
    }

    deinit {
        if let routeChangeObserver {
            NotificationCenter.default.removeObserver(routeChangeObserver)
        }
        if let interruptionObserver {
            NotificationCenter.default.removeObserver(interruptionObserver)
        }

        DispatchQueue.main.async {
            AgoraRtcEngineKit.destroy()
        }
    }

    private func configureAudioSessionBestEffort() {
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(
                .playAndRecord,
                mode: .voiceChat,
                options: [.defaultToSpeaker, .allowBluetooth]
            )
            try audioSession.setActive(true)
            try audioSession.overrideOutputAudioPort(.speaker)
            logCurrentAudioRoute(context: "configureAudioSession voiceChat")
            return
        } catch {
            print("[agora] voiceChat audio session config failed: \(error)")
        }

        // Fallback: keep call running even if preferred mode fails.
        do {
            try audioSession.setCategory(
                .playAndRecord,
                mode: .default,
                options: [.defaultToSpeaker, .allowBluetooth]
            )
            try audioSession.setActive(true)
            try audioSession.overrideOutputAudioPort(.speaker)
            logCurrentAudioRoute(context: "configureAudioSession fallback")
        } catch {
            print("[agora] fallback audio session config failed: \(error)")
        }
    }

    private func installAudioSessionObserversIfNeeded() {
        guard routeChangeObserver == nil, interruptionObserver == nil else { return }

        routeChangeObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.routeChangeNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self else { return }
            self.handleRouteChange(notification)
        }

        interruptionObserver = NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self else { return }
            self.handleInterruption(notification)
        }
    }

    private func handleRouteChange(_ notification: Notification) {
        let reasonValue = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
        let reason = reasonValue.flatMap { AVAudioSession.RouteChangeReason(rawValue: $0) }
        print("[agora] audio route changed reason=\(String(describing: reason))")
        logCurrentAudioRoute(context: "routeChange before recover")

        // Keep playback on speaker during active RTC sessions.
        reconfigureAudioRoute()
    }

    private func handleInterruption(_ notification: Notification) {
        let typeValue = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt
        let type = typeValue.flatMap { AVAudioSession.InterruptionType(rawValue: $0) }

        if type == .ended {
            print("[agora] audio interruption ended; restoring route")
            reconfigureAudioRoute()
        }
    }

    private func logCurrentAudioRoute(context: String) {
        let session = AVAudioSession.sharedInstance()
        let outputs = session.currentRoute.outputs.map { "\($0.portType.rawValue):\($0.portName)" }.joined(separator: ",")
        let inputs = session.currentRoute.inputs.map { "\($0.portType.rawValue):\($0.portName)" }.joined(separator: ",")
        print("[agora] audio route [\(context)] outputs=[\(outputs)] inputs=[\(inputs)] category=\(session.category.rawValue) mode=\(session.mode.rawValue)")
    }

    private func joinChannel(token: String, channelName: String, uid: UInt) async throws {
        guard let engine else {
            throw AgoraVoiceServiceError.engineCreationFailed
        }

        let options = AgoraRtcChannelMediaOptions()
        options.clientRoleType = .broadcaster
        options.channelProfile = .communication
        options.publishMicrophoneTrack = true
        options.autoSubscribeAudio = true

        let timeoutTask = Task { [weak self] in
            try await Task.sleep(nanoseconds: 45_000_000_000)
            await MainActor.run {
                guard let self else { return }
                if let continuation = self.joinContinuation {
                    print("[agora] join confirmation timeout after 45s")
                    self.joinContinuation = nil
                    continuation.resume(throwing: AgoraVoiceServiceError.timeout)
                }
            }
        }

        defer {
            timeoutTask.cancel()
        }

        try await withCheckedThrowingContinuation { continuation in
            self.joinContinuation = continuation

            let result = engine.joinChannel(byToken: token, channelId: channelName, uid: uid, mediaOptions: options)
            print("[agora] joinChannel invoked channel=\(channelName) uid=\(uid) result=\(result)")
            guard result == 0 else {
                self.joinContinuation = nil
                continuation.resume(throwing: AgoraVoiceServiceError.joinFailed(code: result))
                return
            }
        }
    }

    private func isTrackedAgentUid(_ uid: UInt) -> Bool {
        if let activeRemoteUid {
            return uid == activeRemoteUid
        }

        if let expectedAgentUid {
            if expectedAgentUid == 0 {
                return true
            }
            return uid == expectedAgentUid
        }

        return false
    }
}

extension AgoraVoiceService: AgoraRtcEngineDelegate {
    nonisolated func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        didJoinChannel channel: String,
        withUid uid: UInt,
        elapsed: Int
    ) {
        print("[agora] didJoinChannel channel=\(channel) localUid=\(uid)")
        Task { @MainActor [weak self] in
            guard let self else { return }
            self.joinContinuation?.resume()
            self.joinContinuation = nil
        }
    }

    nonisolated func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
        print("[agora] error code=\(errorCode.rawValue)")
        Task { @MainActor [weak self] in
            guard let self else { return }
            if let continuation = self.joinContinuation {
                continuation.resume(throwing: AgoraVoiceServiceError.joinFailed(code: Int32(errorCode.rawValue)))
                self.joinContinuation = nil
            }
        }
    }

    nonisolated func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        connectionChangedTo state: AgoraConnectionState,
        reason: AgoraConnectionChangedReason
    ) {
        print("[agora] connection state=\(state.rawValue) reason=\(reason.rawValue)")
        Task { @MainActor [weak self] in
            guard let self else { return }

            // Some SDK/runtime combinations report connected state without
            // immediately delivering didJoinChannel callback.
            if state == .connected, let continuation = self.joinContinuation {
                print("[agora] join continuation resumed from connection state")
                self.joinContinuation = nil
                continuation.resume()
            }

            if state == .failed {
                if let continuation = self.joinContinuation {
                    self.joinContinuation = nil
                    continuation.resume(throwing: AgoraVoiceServiceError.joinFailed(code: -1))
                }
            }
        }
    }

    nonisolated func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            print("[agora] remoteJoined uid=\(uid) expectedAgentUid=\(String(describing: self.expectedAgentUid))")

            self.reconfigureAudioRoute()
            _ = engine.muteRemoteAudioStream(uid, mute: false)

            if self.activeRemoteUid == nil {
                if let expectedUid = self.expectedAgentUid {
                    if uid == expectedUid || expectedUid == 0 {
                        self.activeRemoteUid = uid
                    }
                } else {
                    self.activeRemoteUid = uid
                }
            }

            if self.activeRemoteUid == nil && self.expectedAgentUid != uid && self.expectedAgentUid != 0 {
                // Fall back to the first remote UID so agent speech state still updates
                // when backend-assigned agent UID differs from requested UID.
                self.activeRemoteUid = uid
            }

            guard self.isTrackedAgentUid(uid) else { return }
            self.onAgentSpeakingChanged?(false)
        }
    }

    nonisolated func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        remoteAudioStateChangedOfUid uid: UInt,
        state: AgoraAudioRemoteState,
        reason: AgoraAudioRemoteReason,
        elapsed: Int
    ) {
        print("[agora] remoteAudioState uid=\(uid) state=\(state.rawValue) reason=\(reason.rawValue)")
        Task { @MainActor [weak self] in
            guard let self else { return }
            if state == .starting || state == .decoding {
                self.reconfigureAudioRoute()
            }

            // Accept the expected agent UID or fall back to any remote user if agent UID is 0
            let isAgent = self.expectedAgentUid == 0 || uid == self.expectedAgentUid
            guard isAgent else { return }

            switch state {
            case .starting, .decoding, .frozen:
                self.onAgentSpeakingChanged?(true)
            case .stopped, .failed:
                self.onAgentSpeakingChanged?(false)
            default:
                break
            }
        }
    }

    nonisolated func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        didOfflineOfUid uid: UInt,
        reason: AgoraUserOfflineReason
    ) {
        print("[agora] remoteOffline uid=\(uid) reason=\(reason.rawValue)")
        Task { @MainActor [weak self] in
            guard let self else { return }
            let isAgent = self.expectedAgentUid == 0 || uid == self.expectedAgentUid
            guard isAgent else { return }
            self.onAgentSpeakingChanged?(false)
        }
    }

    nonisolated func rtcEngine(
        _ engine: AgoraRtcEngineKit,
        reportAudioVolumeIndicationOfSpeakers speakers: [AgoraRtcAudioVolumeInfo],
        totalVolume: Int
    ) {
        guard totalVolume > 0 else { return }
        let activeUids = speakers.map { $0.uid }
        print("[agora] volume total=\(totalVolume) activeUids=\(activeUids)")
    }
}

extension AgoraVoiceService: AgoraAudioFrameDelegate {
    func onRecordAudioFrame(_ frame: AgoraAudioFrame, channelId: String) -> Bool {
        if !didLogFirstRecordFrame {
            didLogFirstRecordFrame = true
            print("[agora] first record frame sr=\(frame.samplesPerSec) channels=\(frame.channels) spc=\(frame.samplesPerChannel)")
        }
        onAudioFrameCaptured?(frame)
        return true
    }

    func getObservedAudioFramePosition() -> AgoraAudioFramePosition {
        return .record
    }

    func getRecordAudioParams() -> AgoraAudioParams {
        let params = AgoraAudioParams()
        params.sampleRate = 16_000
        params.channel = 1
        params.mode = .readOnly
        params.samplesPerCall = 1024
        return params
    }
}
