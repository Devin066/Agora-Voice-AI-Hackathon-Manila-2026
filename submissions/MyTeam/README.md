# Agora Interactive Live Streaming Quickstart for Windows (C++)

This project implements a basic Interactive Live Streaming app using the Agora Video SDK for Windows (C++).

## Prerequisites

-   Visual Studio 2017 or higher with C++ support.
-   An Agora account and project.
-   Agora App ID and Token (obtain from the [Agora Console](https://console.agora.io/)).

## Project Structure

-   `main.cpp`: Entry point for the application.
-   `AgoraQuickStart.h` / `AgoraQuickStart.cpp`: Core Agora RTC logic.
-   `sdk/`: Contains the Agora Native SDK for Windows (v4.2.1).

## Installation

The SDK has been automatically downloaded and extracted to the `sdk/` folder.

To build and run:

1.  Open Visual Studio and create a new C++ Console Application project.
2.  Add `main.cpp`, `AgoraQuickStart.h`, and `AgoraQuickStart.cpp` to your project.
3.  Configure the project properties:
    -   **Include Directories**: Add `$(ProjectDir)sdk/include`.
    -   **Library Directories**: Add `$(ProjectDir)sdk/libs/x86_64` (for 64-bit) or `$(ProjectDir)sdk/libs/x86` (for 32-bit).
    -   **Additional Dependencies**: Add `agora_rtc_sdk.lib`.
4.  Replace `<YOUR_APP_ID>` and `<YOUR_TOKEN>` in `main.cpp` with your actual Agora credentials.
5.  Build and run the project.

## Note

In a real Windows GUI application (MFC, Qt, etc.), you would pass a valid window handle (`HWND`) to `setupLocalVideo` and `setupRemoteVideo` to render the video. This CLI sample uses `nullptr` as a placeholder.
