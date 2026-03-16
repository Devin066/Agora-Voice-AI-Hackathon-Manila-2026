#include "AgoraQuickStart.h"
#include <iostream>

using namespace agora::rtc;

void CAgoraQuickStartRtcEngineEventHandler::onJoinChannelSuccess(const char* channel, uid_t uid, int elapsed) {
    std::cout << "Successfully joined channel: " << channel << " with UID: " << uid << std::endl;
    // In a real Windows app, you would use PostMessage to send this to your main window
}

void CAgoraQuickStartRtcEngineEventHandler::onUserJoined(uid_t uid, int elapsed) {
    std::cout << "Remote user joined with UID: " << uid << std::endl;
}

void CAgoraQuickStartRtcEngineEventHandler::onUserOffline(uid_t uid, USER_OFFLINE_REASON_TYPE reason) {
    std::cout << "Remote user offline with UID: " << uid << std::endl;
}

CAgoraQuickStart::CAgoraQuickStart() : m_rtcEngine(nullptr), m_initialized(false) {}

CAgoraQuickStart::~CAgoraQuickStart() {
    if (m_rtcEngine) {
        m_rtcEngine->release(true);
        m_rtcEngine = nullptr;
    }
}

bool CAgoraQuickStart::initializeAgoraEngine(const char* appId) {
    m_rtcEngine = createAgoraRtcEngine();
    RtcEngineContext context;
    context.appId = appId;
    context.eventHandler = &m_eventHandler;

    int ret = m_rtcEngine->initialize(context);
    m_initialized = (ret == 0);

    if (m_initialized) {
        m_rtcEngine->enableVideo();
    } else {
        std::cerr << "Failed to initialize Agora RTC engine" << std::endl;
    }

    return m_initialized;
}

void CAgoraQuickStart::joinChannel(const char* token, const char* channelName) {
    ChannelMediaOptions options;
    options.channelProfile = CHANNEL_PROFILE_LIVE_BROADCASTING;
    options.clientRoleType = CLIENT_ROLE_BROADCASTER;
    options.publishMicrophoneTrack = true;
    options.publishCameraTrack = true;
    options.autoSubscribeAudio = true;
    options.autoSubscribeVideo = true;
    options.audienceLatencyLevel = AUDIENCE_LATENCY_LEVEL_ULTRA_LOW_LATENCY;

    m_rtcEngine->joinChannel(token, channelName, 0, options);
}

void CAgoraQuickStart::setupLocalVideo(void* hwnd) {
    VideoCanvas canvas;
    canvas.renderMode = RENDER_MODE_HIDDEN;
    canvas.uid = 0;
    canvas.view = hwnd;
    m_rtcEngine->setupLocalVideo(canvas);
    m_rtcEngine->startPreview();
}

void CAgoraQuickStart::setupRemoteVideo(uid_t uid, void* hwnd) {
    VideoCanvas canvas;
    canvas.renderMode = RENDER_MODE_HIDDEN;
    canvas.uid = uid;
    canvas.view = hwnd;
    m_rtcEngine->setupRemoteVideo(canvas);
}

void CAgoraQuickStart::leaveChannel() {
    if (m_rtcEngine) {
        m_rtcEngine->stopPreview();
        m_rtcEngine->leaveChannel();
        
        // Clear local view
        VideoCanvas canvas;
        canvas.uid = 0;
        m_rtcEngine->setupLocalVideo(canvas);
    }
}
