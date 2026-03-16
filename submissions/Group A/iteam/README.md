# VisionVoice

VisionVoice is a webcam-based assistive smart-glasses simulator designed for visually impaired users. It acts as an awareness co-pilot, providing real-time information about the user's surroundings through voice-based feedback.

## About the Project

This project aims to build a working MVP that simulates smart glasses using a standard webcam. The key functionalities include:

-   **Object and Hazard Detection:** Identifies nearby objects and potential hazards to ensure user safety.
-   **Known Person Recognition:** Recognizes pre-registered individuals, offering a personalized experience.
-   **Voice Interaction:** Utilizes Agora ConvoAI and the Agora Web SDK to deliver calm, concise, and assistive spoken responses.
-   **Proactive & Reactive Assistance:** Provides proactive alerts for critical events (e.g., obstacles, known persons) and reacts to user's voice commands and questions.

This is not a medical device or a navigation system but an accessibility-first proof of concept.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   An Agora developer account. You can create one at [agora.io](https://www.agora.io/).
-   Node.js and npm installed.
-   A webcam connected to your computer.
-   You will need to set up your Agora App ID and other credentials in an environment file. Create a `.env.local` file in the root of the project and add the following:

```
REACT_APP_AGORA_APP_ID=<Your Agora App ID>
```

### Installation

1.  Clone the repo.
2.  Install NPM packages.
    ```sh
    npm install
    ```

## Usage

To run the application in development mode:

```sh
npm start
```

This will open the application in your browser at `http://localhost:3000`. The webcam feed will be displayed, and the application will start providing voice-based assistance based on the visual input.

## Features

-   **Webcam Preview:** Live feed from the user's webcam.
-   **Local Object Detection:** Detects objects in the user's environment.
-   **Known-Person Recognition:** Recognizes faces of pre-registered contacts.
-   **Hazard Heuristics:** Identifies potential hazards.
-   **Spoken Responses:** Uses Agora ConvoAI for voice output.
-   **UI:** A polished, demo-friendly user interface.

## Technology Stack

-   [React](https://reactjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Agora Web SDK](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
-   [Agora ConvoAI](https://docs.agora.io/en/agora-convoai/overview/product-overview)
-   [TensorFlow.js - COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) for object detection.
-   [@vladmandic/face-api](https://github.com/vladmandic/face-api) for face recognition.
