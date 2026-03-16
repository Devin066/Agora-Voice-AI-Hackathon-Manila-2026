#include <iostream>
#include "AgoraQuickStart.h"

// TODO: Replace with your actual App ID and Token from Agora Console
#define APP_ID "<YOUR_APP_ID>"
#define TOKEN "<YOUR_TOKEN>"
#define CHANNEL_NAME "test_channel"

int main() {
    CAgoraQuickStart agoraApp;

    std::cout << "Initializing Agora Engine..." << std::endl;
    if (!agoraApp.initializeAgoraEngine(APP_ID)) {
        return -1;
    }

    std::cout << "Joining channel: " << CHANNEL_NAME << "..." << std::endl;
    agoraApp.joinChannel(TOKEN, CHANNEL_NAME);

    // In a real Windows GUI app (like MFC or Qt), you would pass a window handle (HWND)
    // for local and remote video rendering. Since this is a CLI placeholder:
    void* dummyHwnd = nullptr; 
    agoraApp.setupLocalVideo(dummyHwnd);

    std::cout << "Press Enter to leave channel and exit..." << std::endl;
    std::cin.get();

    agoraApp.leaveChannel();
    std::cout << "Exited channel." << std::endl;

    return 0;
}
