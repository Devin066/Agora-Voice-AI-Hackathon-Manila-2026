#pragma once

#include <IAgoraRtcEngine.h>
#include <string>

using namespace agora::rtc;

// Message IDs for Windows events
#define WM_MSGID(code) (0x0400 + 0x200 + code)
#define EID_JOIN_CHANNEL_SUCCESS 0x00000002
#define EID_USER_JOINED 0x00000004
#define EID_USER_OFFLINE 0x00000008

class CAgoraQuickStartRtcEngineEventHandler : public IRtcEngineEventHandler {
public:
    CAgoraQuickStartRtcEngineEventHandler() : m_hMsgHandler(nullptr) {}

    void SetMsgReceiver(void* hWnd) {
        m_hMsgHandler = hWnd;
    }

    virtual void onJoinChannelSuccess(const char* channel, uid_t uid, int elapsed) override;
    virtual void onUserJoined(uid_t uid, int elapsed) override;
    virtual void onUserOffline(uid_t uid, USER_OFFLINE_REASON_TYPE reason) override;

private:
    void* m_hMsgHandler;
};

class CAgoraQuickStart {
public:
    CAgoraQuickStart();
    ~CAgoraQuickStart();

    bool initializeAgoraEngine(const char* appId);
    void joinChannel(const char* token, const char* channelName);
    void setupLocalVideo(void* hwnd);
    void setupRemoteVideo(uid_t uid, void* hwnd);
    void leaveChannel();

private:
    IRtcEngine* m_rtcEngine = nullptr;
    CAgoraQuickStartRtcEngineEventHandler m_eventHandler;
    bool m_initialized = false;
};
