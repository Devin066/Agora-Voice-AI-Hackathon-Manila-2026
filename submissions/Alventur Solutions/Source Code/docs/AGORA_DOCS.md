### Start Cloud Recording (Basic Example)

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

This cURL command demonstrates a basic request to start a Cloud Recording session using the middleware's RESTful API. It specifies the channel name and basic recording parameters.

```curl
curl -X POST http://localhost:8080/cloud_recording/start \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "test_channel",
    "sceneMode": "realtime",
    "recordingMode": "mix",
    "excludeResourceIds": []
  }'
```

--------------------------------

### Start Cloud Recording (Advanced Example)

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

This advanced cURL command shows how to initiate a Cloud Recording session with detailed configuration options, including channel type, decryption mode, recording settings, and layout configuration.

```curl
curl -X POST http://localhost:8080/cloud_recording/start \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "testChannel",
    "sceneMode": "realtime",
    "recordingMode": "mix",
    "excludeResourceIds": [],
    "recordingConfig": {
      "channelType": 0,
      "decryptionMode": 1,
      "secret": "your_secret",
      "salt": "your_salt",
      "maxIdleTime": 120,
      "streamTypes": 2,
      "videoStreamType": 0,
      "subscribeAudioUids": ["#allstream#"],
      "unsubscribeAudioUids": [],
      "subscribeVideoUids": ["#allstream#"],
      "unsubscribeVideoUids": [],
      "subscribeUidGroup": 0,
      "streamMode": "individual",
      "audioProfile": 1,
      "transcodingConfig": {
        "width": 640,
        "height": 360,
        "fps": 15,
        "bitrate": 500,
        "maxResolutionUid": "1",
        "layoutConfig": [
          {
            "x_axis": 0,
            "y_axis": 0,
            "width": 640,
            "height": 360,
            "alpha": 1,
            "render_mode": 1
          }
        ]
      }
    }
  }'
```

--------------------------------

### Install Project Dependencies

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

This command is used to install all the necessary dependencies for the project. It should be run before executing the project to ensure all required packages are available.

```bash
npm install  

```

--------------------------------

### Install PyAudio using apt

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command installs the PyAudio library, a Python binding for PortAudio, which is necessary for cross-platform audio I/O. It is installed using the apt package manager.

```bash
sudo apt install python3-pyaudio
```

--------------------------------

### Install FFmpeg using apt

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command installs the FFmpeg multimedia framework, which is a prerequisite for handling audio processing in the project. It is executed using the apt package manager.

```bash
sudo apt install ffmpeg
```

--------------------------------

### Install Python Dependencies

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command installs all the necessary Python packages listed in the 'requirements.txt' file. Ensure 'requirements.txt' is in the current directory.

```shell
pip install -r requirements.txt
```

--------------------------------

### Install Build Tools for Python SDK

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Installs essential build tools required for compiling the Agora Voice SDK on Debian-based systems. This is a prerequisite for building and running the SDK.

```bash
sudo apt install build-essential python3-dev
```

--------------------------------

### Install Whiteboard SDK via npm

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This command installs the White Web SDK into your project using npm. It's a prerequisite for using the SDK in your JavaScript application if you are not using a CDN.

```bash
npm install white-web-sdk
```

--------------------------------

### GET Request Example to List to-be-converted Tasks

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/file-conversion

This example shows how to initiate a GET request to list all tasks that are currently waiting to be converted. It specifies the access point and required headers, including the region and authentication token.

```http
GET /v5/projector/tasks  
Host: api.netless.link  
region: cn-hz  
Content-Type: application/json  
token: NETLESSSDK_YWs9QxxxxxxMjRi  
```

--------------------------------

### Setup APIs

Source: https://docs.agora.io/en/signaling/overview/migration-guide

APIs for initializing, configuring, and managing the Signaling client instance.

```APIDOC
## Setup APIs

### Create Instance
Creates a new RtmClient instance.

### Method
`RtmClient create(RtmConfig config)`

### Destroy Instance
Releases resources associated with the RtmClient instance.

### Method
`RtmClient.release()`

### Token Configuration
Logs in to the service using a token.

### Method
`login` interface with `token` parameter

### End-to-End Encryption
Configures end-to-end encryption for the signaling session.

### Method
`RtmEncryptionConfig` with `encryptionMode`, `encryptionKey`, `encryptionSalt` parameters

### Presence Timeout Setting
Sets the timeout for presence events.

### Method
`RtmConfig` with `presenceTimeout` parameter

### Log Level Setting
Configures the logging level for the SDK.

### Method
`RtmLogConfig` with `level` parameter

### Proxy Configuration
Configures proxy settings for the signaling connection.

### Method
`RtmProxyConfig` with `proxyType`, `server`, `port`, `account`, `password` parameters

### Event Listener
Adds or removes an event listener for signaling events.

### Method
`void addEventListener(RtmEventListener listener)`
`void removeEventListener(RtmEventListener listener)`

### Login Service
Initiates the login process with a token.

### Method
`void login(String token, ResultCallback<Void> resultCallback)`

### Logout Service
Initiates the logout process.

### Method
`void logout(ResultCallback<Void> resultCallback)`
```

--------------------------------

### POST /cloud_recording/start

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Starts a cloud recording session. This endpoint initiates a new recording session and returns identifiers for the session.

```APIDOC
## POST /cloud_recording/start

### Description
Starts a cloud recording session. This endpoint initiates a new recording session and returns identifiers for the session.

### Method
POST

### Endpoint
/cloud_recording/start

### Parameters
#### Request Body
- **channelName** (string) - Required - The name of the channel for the recording.
- **uid** (string) - Required - The user ID for the recording.
- **recordingConfig** (object) - Optional - Configuration for the recording.
  - *See recordingConfig fields documentation for details.*
- **storageConfig** (object) - Optional - Configuration for storage.
  - *See storageConfig fields documentation for details.*

### Request Example
```json
{
  "channelName": "string",
  "uid": "string",
  "recordingConfig": {
    // RecordingConfig fields
  },
  "storageConfig": {
    // StorageConfig fields
  }
}
```

### Response
#### Success Response (200)
- **resourceId** (string) - The unique identifier for the recording resource.
- **sid** (string) - The session ID for the recording.
- **timestamp** (string) - The timestamp of the recording start.

#### Response Example
```json
{
  "resourceId": "string",
  "sid": "string",
  "timestamp": "string"
}
```
```

--------------------------------

### Install Agora Go SDK for Cloud Transcoder

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

Installs the Agora REST client Go SDK and updates project dependencies. This SDK facilitates easier integration with Agora's RESTful APIs for services like cloud transcoding.

```bash
# Install the Go SDK  
go get -u github.com/AgoraIO-Community/agora-rest-client-go  

# Update dependencies  
go mod tidy  
```

--------------------------------

### Starting the HTTP Server (Bash)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command starts the HTTP server for managing agent processes using Python. It utilizes the `main` module. The server provides endpoints for controlling agent lifecycles.

```bash
python3 -m main server
```

--------------------------------

### POST /cloud_recording/start

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Starts a Cloud Recording session for an Agora channel. This endpoint allows for basic and advanced configurations of the recording session.

```APIDOC
## POST /cloud_recording/start

### Description
Starts a Cloud Recording session for an Agora channel. This endpoint allows for basic and advanced configurations of the recording session.

### Method
POST

### Endpoint
/cloud_recording/start

### Parameters
#### Query Parameters
None

#### Request Body
- **channelName** (string) - Required - The name of the channel to record.
- **sceneMode** (string) - Required - The scene mode for the recording (e.g., "realtime").
- **recordingMode** (string) - Required - The recording mode (e.g., "mix").
- **excludeResourceIds** (array) - Optional - A list of resource IDs to exclude from recording.
- **recordingConfig** (object) - Optional - Advanced configuration for the recording.
  - **channelType** (integer) - Optional - Channel type (0 for 0, 1 for 1).
  - **decryptionMode** (integer) - Optional - Decryption mode.
  - **secret** (string) - Optional - Secret for decryption.
  - **salt** (string) - Optional - Salt for decryption.
  - **maxIdleTime** (integer) - Optional - Maximum idle time in seconds.
  - **streamTypes** (integer) - Optional - Stream types (e.g., 2 for video and audio).
  - **videoStreamType** (integer) - Optional - Video stream type.
  - **subscribeAudioUids** (array) - Optional - UIDs to subscribe to for audio.
  - **unsubscribeAudioUids** (array) - Optional - UIDs to unsubscribe from for audio.
  - **subscribeVideoUids** (array) - Optional - UIDs to subscribe to for video.
  - **unsubscribeVideoUids** (array) - Optional - UIDs to unsubscribe from for video.
  - **subscribeUidGroup** (integer) - Optional - UID group for subscription.
  - **streamMode** (string) - Optional - Stream mode (e.g., "individual").
  - **audioProfile** (integer) - Optional - Audio profile.
  - **transcodingConfig** (object) - Optional - Transcoding configuration.
    - **width** (integer) - Optional - Width of the transcoded video.
    - **height** (integer) - Optional - Height of the transcoded video.
    - **fps** (integer) - Optional - Frames per second.
    - **bitrate** (integer) - Optional - Bitrate of the transcoded video.
    - **maxResolutionUid** (string) - Optional - UID for max resolution.
    - **layoutConfig** (array) - Optional - Layout configuration for the video.
      - **x_axis** (integer) - Optional - X-axis position.
      - **y_axis** (integer) - Optional - Y-axis position.
      - **width** (integer) - Optional - Width of the video tile.
      - **height** (integer) - Optional - Height of the video tile.
      - **alpha** (integer) - Optional - Alpha transparency.
      - **render_mode** (integer) - Optional - Render mode.

### Request Example
```json
{
  "channelName": "test_channel",
  "sceneMode": "realtime",
  "recordingMode": "mix",
  "excludeResourceIds": []
}
```

### Response
#### Success Response (200)
(Response details not provided in the source text)

#### Response Example
(Response example not provided in the source text)
```

--------------------------------

### Start Agent API

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Starts an agent with the provided graph and override properties. The agent joins the specified channel and subscribes to the user ID used by your browser/device.

```APIDOC
## POST /start_agent

### Description
This API starts an agent with given graph and override properties. The started agent joins the specified channel, and subscribes to the uid which your browser/device's rtc used to join.

### Method
POST

### Endpoint
/start_agent

### Parameters
#### Request Body
- **channel_name** (string) - Required - Use the same channel name that your browser/device joins, agent needs to be in the same channel to communicate.
- **uid** (unsigned int) - Required - The user ID that the AI agent uses to join.

### Request Example
```json
{
  "channel_name": "test",
  "uid": 123
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the agent has started successfully.

#### Response Example
```json
{
  "message": "Agent started successfully"
}
```
```

--------------------------------

### Set up Server Imports and Environment Variables

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Sets up the necessary imports and loads environment variables for the Agora Realtime Kit server. It configures logging, handles process management, and defines request body models for starting and stopping agents.

```python
import asyncio
import logging
import os
import signal
from multiprocessing import Process

from aiohttp import web
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

from realtime.struct import PCM_CHANNELS, PCM_SAMPLE_RATE, ServerVADUpdateParams, Voices
from agent import InferenceConfig, RealtimeKitAgent
from agora_realtime_ai_api.rtc import RtcEngine, RtcOptions
from logger import setup_logger
from parse_args import parse_args, parse_args_realtimekit

logger = setup_logger(name=__name__, log_level=logging.INFO)
load_dotenv(override=True)
app_id = os.environ.get("AGORA_APP_ID")
app_cert = os.environ.get("AGORA_APP_CERT")

if not app_id:
    raise ValueError("AGORA_APP_ID must be set in the environment.")

class StartAgentRequestBody(BaseModel):
    channel_name: str = Field(..., description="The name of the channel")
    uid: int = Field(..., description="The UID of the user")
    language: str = Field("en", description="The language of the agent")

class StopAgentRequestBody(BaseModel):
    channel_name: str = Field(..., description="The name of the channel")
```

--------------------------------

### Install Sphinx with pip

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/implementation-guide

Installs the Sphinx documentation generator using pip. This is a prerequisite for building HTML documentation locally.

```bash
pip install sphinx  
```

--------------------------------

### Install Agora Server Side Python SDK

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Installs the Agora server-side Python SDK. Note that this SDK is intended for server-side applications and not for direct client-side integration.

```bash
pip3 install agora-python-server-sdk
```

--------------------------------

### Initialize React Native Chat UI Kit Project

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Initializes the React Native Chat UI Kit project by installing dependencies and running setup scripts. This command ensures all necessary packages are installed and configured.

```bash
yarn && yarn run example-env && yarn run sdk-version
```

--------------------------------

### Install Agora Video SDK for Web

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

Installs the Agora Real-Time Communication (RTC) SDK for the web. This SDK provides the necessary APIs to integrate real-time audio and video functionalities into your web application.

```bash
npm install agora-rtc-sdk-ng
```

--------------------------------

### Cloud Recording Start Request Body Example

Source: https://docs.agora.io/en/real-time-stt/develop/record-captions

Example of the Cloud Recording start request body, showing how to enable NTP timestamp for synchronization with transcription.

```APIDOC
## Cloud Recording `start` Request Body Example

### Description
This is a sample request body for starting Cloud Recording. It includes the `enableNTPtimestamp` parameter within `extensionParams` to ensure timestamps are synchronized with transcription services.

### Method
POST

### Endpoint
`/cloud-recording/v1/start` (Hypothetical, as the exact endpoint is not provided in the text)

### Parameters
*(Parameters for the Cloud Recording start request are not fully detailed in the provided text, focusing on the `recordingConfig` section)*

#### Request Body
- **recordingConfig** (object) - Configuration for the cloud recording.
  - **maxIdleTime** (integer) - Maximum idle time in seconds.
  - **streamTypes** (integer) - Type of streams to record (e.g., 2 for audio and video).
  - **channelType** (integer) - Type of channel (e.g., 1 for live).
  - **extensionParams** (object) - Additional parameters for extensions.
    - **enableNTPtimestamp** (boolean) - Set to `true` to enable NTP timestamp synchronization with transcription.
  - **transcodingConfig** (object) - Configuration for video transcoding.
    - **width** (integer) - Width of the transcoded video.
    - **height** (integer) - Height of the transcoded video.
    - **fps** (integer) - Frames per second for the transcoded video.
    - **bitrate** (integer) - Bitrate for the transcoded video.
    - **mixedVideoLayout** (integer) - Layout for mixed video streams.
    - **layoutConfig** (array of objects) - Configuration for individual stream layouts.

### Request Example
```json
{
  "recordingConfig": {
    "maxIdleTime": 30,
    "streamTypes": 2,
    "channelType": 1,
    "extensionParams": {
      "enableNTPtimestamp": true
    },
    "transcodingConfig": {
      "width": 1280,
      "height": 720,
      "fps": 15,
      "bitrate": 2400,
      "mixedVideoLayout": 3,
      "layoutConfig": [
        {
          "alpha": 1,
          "height": 1,
          "render_mode": 1,
          "uid": "22228",
          "width": 1,
          "x_axis": 0,
          "y_axis": 0
        }
      ]
    }
  }
}
```

### Response
*(Response details for Cloud Recording start are not provided in the text)*
```

--------------------------------

### Generate a Signature (GET)

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/signature-algorithm

Provides a step-by-step guide and an example for generating a signature for GET requests, including constructing the source string and applying the encryption.

```APIDOC
## Generate a Signature (GET)

### Example Request URL
`https://[host]/usage?fromTs=1619913600&toTs=1619917200&pageNum=1&apiKey=pzD5XinRSlmA64tZx81fL92YcBsJK0gd&signature={signature}`

### Parameters for Encryption
- **SourceString**:
  - `GET&%2Fusage&apiKey%3DpzD5XinRSlmA64tZx81fL92YcBsJK0gd%26fromTs%3D1619913600%26pageNum%3D1%26toTs%3D1619917200`
- **apiSecret**:
  - `U1SXE6k57vxVRjTomgquwC2F3tH8ziOB` (Demonstration value)

### Step 1: Construct the Source String
1. Add the HTTP method and an ampersand: `GET&`
2. URL-encode the path (e.g., `/usage` becomes `%2Fusage`) and append an ampersand: `GET&%2Fusage&`
3. Alphabetically sort query parameters (excluding `signature`), format as `key=value`, URL-encode, and append: `GET&%2Fusage&apiKey%3DpzD5XinRSlmA64tZx81fL92YcBsJK0gd%26fromTs%3D1619913600%26pageNum%3D1%26toTs%3D1619917200`

### Step 2: Construct Your Secret Key
Append an ampersand to your `apiSecret`: `U1SXE6k57vxVRjTomgquwC2F3tH8ziOB&`

### Step 3: Generate the Signature
Apply the encryption algorithm: `signature = URLEncode(Base64( HMAC-SHA1( apiSecret&, SourceString) ), "UTF-8")`

### Resulting Signature
- **signature**: `SFVnCVlRbrZcjMPGTWVxAE4QWZ8%3D`
```

--------------------------------

### Go: Main Server Setup

Source: https://docs.agora.io/en/video-calling/advanced-features/receive-notifications

This function sets up and starts the HTTP server. It registers the `rootHandler` for the root path and `ncsHandler` for the '/ncsNotify' path. It then listens on port 80 and logs any fatal errors during server startup.

```go
import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", rootHandler) // Assumes rootHandler is defined
	http.HandleFunc("/ncsNotify", ncsHandler) // Assumes ncsHandler is defined

	port := ":80"
	fmt.Printf("Notifications webhook server started on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```

--------------------------------

### Agora Recording Configuration Example (JSON)

Source: https://docs.agora.io/en/help/integration-issues/recording_fails

This snippet demonstrates the structure of configuration parameters for Agora recording, focusing on storage details like vendor, region, and endpoint. Ensure these values correctly match your third-party cloud storage setup.

```json
{
  "vendor": 2,
  "region": 1, // CN_Shanghai
  "endpoint": "https://agora-recording.oss-cn-shanghai.aliyuncs.com"
}
```

--------------------------------

### Start Cloud Recording API Request Body (Go)

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Defines the request body structure for starting a cloud recording session using the Go middleware API. It includes essential parameters like channel name, user ID, recording configurations, and storage configurations.

```go
{
 "channelName": "string",
 "uid": "string",
 "recordingConfig": {
 // RecordingConfig fields
  },
 "storageConfig": {
 // StorageConfig fields
  }
}
```

--------------------------------

### Run Development Server

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

This command starts the local development server for the project. It allows you to test your application in a browser environment. A local web server will automatically open in your browser upon execution.

```bash
npm run dev  

```

--------------------------------

### RealtimeKitAgent Setup and Run

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

A class method to set up and initiate the RealtimeKitAgent. It handles the initialization of the RTC engine, channel connection, and inference configuration.

```Python
@classmethod
async def setup_and_run_agent(
    cls,
    *,
    engine: RtcEngine,
    options: RtcOptions,
    inference_config: InferenceConfig,
    tools: ToolContext | None,
) -> None:
    """Set up and run the agent.
    - Initialize the RTC engine, connect to the channel, and configure the inference setup.
    - Implement the setup and teardown logic for the agent.
    """
    pass
```

--------------------------------

### Get Project Usage - Request Example

Source: https://docs.agora.io/en/1.x/signaling/reference/agora-console-rest-api

This example demonstrates how to construct a request URL to get project usage data. It includes the project ID, a date range (from_date and to_date), and the business type. This is a GET request to the /dev/v3/usage endpoint.

```url
https://api.agora.io/dev/v3/usage?project_id=rxxxxxxj5u&from_date=2021-10-12&to_date=2021-12-14&business=default
```

--------------------------------

### Request Example for Room Details (GET)

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/room-management

This example demonstrates how to make a GET request to retrieve details for a specific room. It includes necessary headers like 'Host', 'region', 'Content-Type', and 'token'.

```http
GET /v5/rooms/a7exxxxxxa69  
Host: api.netless.link  
region: us-sv  
Content-Type: application/json  
token: NETLESSSDK_YWs9xxxxxxM2MjRi  
```

--------------------------------

### Join Channel and Start Recording (C++)

Source: https://docs.agora.io/en/on-premise-recording/get-started/quickstart

This snippet shows the final steps to begin recording. It includes joining the specified channel using `joinChannel` and then starting the recording process with `startRecording`.

```cpp
recorder->joinChannel(config.token.c_str(), config.ChannelName.c_str(), config.UserId.c_str());
recorder->startRecording();
```

--------------------------------

### Get Poll Data Request Example (curl)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

This example demonstrates how to use `curl` to make a GET request to retrieve poll data. It includes placeholders for region, App ID, and Authorization token.

```bash
curl -X GET 'https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/test_class/widgets/popupQuiz/sequences' \
-H 'Authorization: agora token={educationToken}' \

```

--------------------------------

### Get Subscribed User List (Dart)

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

This example demonstrates how to retrieve a list of users subscribed to a specific topic. It includes error checking and displays the response. Requires the Agora Signaling SDK.

```dart
var (status,response) = await stChannel.getSubscribedUserList("myTopic");  
if (status.error == true) {  
 print(status);  
} else {  
 print(response);  
}
```

--------------------------------

### Install pyee Library for Python

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Installs the 'pyee' library, which facilitates structured, asynchronous event handling in Python. This library is necessary for managing events within the Agora SDK implementation.

```bash
pip3 install pyee
```

--------------------------------

### Start Agent API

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Starts a RealtimeKit agent in a specified RTC channel. This involves creating a new process to run the agent.

```APIDOC
## POST /start_agent

### Description
Starts a RealtimeKit agent in a specified RTC channel and joins the channel with the given user ID. A new process is spawned to handle the agent's lifecycle.

### Method
POST

### Endpoint
/start_agent

### Parameters
#### Request Body
- **channel_name** (string) - Required - The name of the channel to join.
- **uid** (integer) - Required - The user ID for the agent to join the channel with.
- **language** (string) - Optional - The language code for the agent (defaults to 'en').

### Request Example
```json
{
  "channel_name": "my_channel",
  "uid": 12345,
  "language": "en"
}
```

### Response
#### Success Response (200)
- **message** (string) - A confirmation message indicating the agent has started.

#### Response Example
```json
{
  "message": "Agent started successfully for channel my_channel"
}
```

#### Error Response (400)
- **error** (string) - Description of the error (e.g., validation error).
```json
{
  "error": "Invalid request body. Missing required fields."
}
```
```

--------------------------------

### Request Example for Room List (GET)

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/room-management

This example shows a GET request to retrieve a list of rooms. It includes optional query parameters like 'beginUUID' and 'limit', along with essential headers for authentication and region specification.

```http
GET /v5/rooms/?beginUUID=0e6exxxxxx4d95&limit=2  
Host: api.netless.link  
region: us-sv  
Content-Type: application/json  
token: NETLESSSDK_YWs9QlxxxxxxM2MjRi  
```

--------------------------------

### GET Request Example for Projector Task Status

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/file-conversion

This example demonstrates how to make a GET request to retrieve the status of a specific file conversion task using its UUID. It includes the necessary host, region, content type, and token in the request headers.

```http
GET /v5/projector/tasks/2fxxxxxx367e  
Host: api.netless.link  
region: cn-hz  
Content-Type: application/json  
token: NETLESSSDK_YWsxxxxxM2MjRi  
```

--------------------------------

### Python: Setup and Run RealtimeKit Agent in a Process

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This Python code sets up and runs the RealtimeKitAgent within a separate process. It configures the RTC engine and options, including channel name, user ID, sample rate, and channels. Signal handlers are installed to manage interruptions gracefully.

```python
def run_agent_in_process(
    engine_app_id: str,
    engine_app_cert: str,
    channel_name: str,
    uid: int,
    inference_config: InferenceConfig,
):
    # Set up signal forwarding in the child process
    signal.signal(signal.SIGINT, handle_agent_proc_signal)  # Forward SIGINT
    signal.signal(signal.SIGTERM, handle_agent_proc_signal)  # Forward SIGTERM
    asyncio.run(
        RealtimeKitAgent.setup_and_run_agent(
            engine=RtcEngine(appid=engine_app_id, appcert=engine_app_cert),
            options=RtcOptions(
                channel_name=channel_name,
                uid=uid,
                sample_rate=PCM_SAMPLE_RATE,
                channels=PCM_CHANNELS,
                enable_pcm_dump= os.environ.get("WRITE_RTC_PCM", "false") == "true"
            ),
            inference_config=inference_config,
            tools=None,
        )
    )
```

--------------------------------

### Create a New Vite Project for Agora Web

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

Initializes a new Vite project with the vanilla JavaScript template for building an Agora web application. This command sets up the basic project structure and dependencies required for development.

```bash
npm create vite@latest agora_web_quickstart -- --template vanilla
```

--------------------------------

### Agora.io API GET Request for Session Details

Source: https://docs.agora.io/en/agora-analytics/reference/api

This example demonstrates an HTTP GET request to retrieve detailed call session statistics from the Agora.io API. It includes essential query parameters like start and end timestamps, app ID, call ID, and optional parameters for pagination and user filtering. The Authorization header is required for authentication.

```http
GET /beta/analytics/call/sessions?start_ts=1548665345&end_ts=1548670821&appid=axxxxxxxxxxxxxxxxxxxx&call_id=cxxxxxxxxxxxxxxxxxxxx&page_no=1&page_size=20&uids=uxx1,uxx2 HTTP/1.1
Host: api.agora.io
Accept: application/json
Authorization: Basic ZGJhZDMyNmFkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxWQzYTczNzg2ODdiMmNiYjRh
```

--------------------------------

### Setup and Initialization

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

This section covers the initial setup of the Agora Signaling SDK, including importing the SDK and initializing a client instance with essential parameters.

```APIDOC
## Setup and Initialization

### Description
This section details how to set up the Signaling SDK, including importing the JavaScript SDK and initializing a Signaling client instance. The initialization requires an `appId` and `userId`, and must be completed before other Signaling APIs can be used.

### Import SDK

**Using CDN:**
```html
<script src="your_path_to_signaling_sdk/agora-rtm.x.y.z.min.js"></script>
```

**Using a package manager:**
```bash
npm install agora-rtm-sdk
```

### Initialization

#### Description
Initialization involves creating and configuring a Signaling client instance. This step is crucial and must precede any other API calls. Ensure that the `userId` is globally unique and consistent for the user or device throughout its lifecycle.

#### Method Signature
```typescript
class RTM {
  constructor(appId: string, userId: string, rtmConfig?: RTMConfig);
}
```

#### Parameters

##### Path Parameters
* `appId` (string) - Required - The App ID of your Agora project.
* `userId` (string) - Required - The unique ID for the user or device.
* `rtmConfig` (RTMConfig) - Optional - Configuration parameters for initialization.

##### Request Body
N/A

#### Basic Usage
```javascript
const { RTM } = AgoraRTM;
const rtm = new RTM("yourAppId", "Tony");
```

#### Return Value
A Signaling client instance, ready for further API calls.

### RTMConfig

#### Description
The `RTMConfig` object allows for advanced configuration of the Signaling client during initialization. These settings impact the client's behavior throughout its lifecycle.
```

--------------------------------

### Signaling SDK API Reference - Setup

Source: https://docs.agora.io/en/signaling/reference/api

Documentation for the setup section of the Signaling SDK API Reference, detailing interface descriptions, methods, basic usage, and return values.

```APIDOC
## Setup

The API reference for the Signaling SDK documents interface descriptions, methods, basic usage, and return values of the Signaling APIs.

### RtmConfig

#### Description

Use the `RtmConfig` to set additional properties for Signaling initialization. These configuration properties will take effect throughout the lifecycle of the Signaling client and affect the behavior of the Signaling client.
```

--------------------------------

### Create Base Project Structure

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command efficiently creates the necessary directories and files for the project structure, including Python files for different modules and configuration files. The `-p` flag ensures parent directories are created as needed.

```bash
mkdir -p realtime && touch {__init__.py,.env,agent.py,logger.py,main.py,parse_args.py,tools.py,utils.py,requirements.txt,realtime/connection.py,realtime/struct.py}
```

--------------------------------

### GET User Threads Request Example (curl)

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/create-delete-retrieve-threads

An example of how to make a GET request to retrieve user threads using curl. It includes the endpoint and the necessary Authorization header.

```shell
curl -X GET http://XXXX.com/XXXX/testapp/threads/user/test4 -H 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### Get Project by ID and Name (API Request Example)

Source: https://docs.agora.io/en/3.x/video-calling/reference/agora-console-rest-api

This example demonstrates how to construct a GET request URL to retrieve a specific Agora project by its ID and name. It requires 'id' and 'name' as query parameters.

```HTTP
GET https://api.agora.io/dev/v1/project?id=7sdnf3xRH&name=project1
```

--------------------------------

### Install Furo HTML Theme

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/implementation-guide

Installs the 'furo' theme for Sphinx, which provides a modern and customizable look for the generated HTML documentation. This enhances the user experience of your documentation.

```bash
pip install furo  
```

--------------------------------

### Get User Status Request URL Example

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/reference/channel-management-rest-api

An example of a GET request URL to retrieve the status of a specific user within a channel. It includes the App ID, user ID (uid), and channel name as path parameters.

```url
https://api.agora.io/dev/v1/channel/user/property/12sfegxxxxxxxxxxxx365/2845863044/test
```

--------------------------------

### HTTP Basic Authentication with Agora API (C#)

Source: https://docs.agora.io/en/video-calling/channel-management-api/restful-authentication

A C# example demonstrating HTTP basic authentication for the Agora.io Server RESTful API. It details how to encode customer credentials using Base64 and construct the Authorization header for a GET request to fetch project details.

```csharp
using System;
using System.IO;
using System.Net;
using System.Text;// HTTP basic authentication example in C# using the <Vg k="VSDK" /> Server RESTful APInamespace Examples.System.Net {
    public class WebRequestPostExample {
        public static void Main() {
            // Customer ID
            string customerKey = "Your customer ID";
            // Customer secret
            string customerSecret = "Your customer secret";
            // Concatenate customer key and customer secret and use base64 to encode the concatenated string
            string plainCredential = customerKey + ":" + customerSecret;
            // Encode with base64
            var plainTextBytes = Encoding.UTF8.GetBytes(plainCredential);
            string encodedCredential = Convert.ToBase64String(plainTextBytes);
            // Create authorization header
            string authorizationHeader = "Authorization: Basic " + encodedCredential;
            // Create request object
            WebRequest request = WebRequest.Create("https://api.agora.io/dev/v2/projects");
            request.Method = "GET";
            // Add authorization header
            request.Headers.Add(authorizationHeader);
            request.ContentType = "application/json";
            WebResponse response = request.GetResponse();
            Console.WriteLine(((HttpWebResponse)response).StatusDescription);
            using (Stream dataStream = response.GetResponseStream()) {
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
            }
            response.Close();
        }
    }
}
```

--------------------------------

### Setup and Configuration API

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=ios

APIs for initializing, destroying, and configuring the Signaling client, including token, encryption, logging, proxy, and event handling.

```APIDOC
## Setup and Configuration

### Create Instance

- **Method:** Initialization
- **API:** `initWithConfig:delegate:error`

### Destroy Instance

- **Method:** Cleanup
- **API:** `[rtm destroy]`

### Token Configuration

- **Type:** Client Configuration
- **API:** `AgoraRtmClientConfig` with `token` parameter

### End-to-End Encryption Configuration

- **Type:** Client Configuration
- **API:** `AgoraRtmClientConfig` with `encryptionConfig` parameter

### Presence Timeout Setting

- **Type:** Client Configuration
- **API:** `AgoraRtmClientConfig` with `presenceTimeout` parameter

### Log Level Setting

- **Type:** Log Configuration
- **API:** `AgoraRtmLogConfig` with `level` parameter

### Proxy Configuration

- **Type:** Client Configuration
- **API:** `AgoraRtmProxyConfig` with `proxyType`, `server`, `port`, `account`, `password` parameters

### Event Listener Management

- **Method:** Add Delegate
- **API:** `[rtm addDelegate:delegate]`
- **Method:** Remove Delegate
- **API:** `[rtm removeDelegate:delegate]`

### Login Service

- **Method:** Authentication
- **API:** `[rtm loginByToken:completion:]`

### Logout Service

- **Method:** Authentication
- **API:** `[rtm logout:completion]`
```

--------------------------------

### Setup API Interfaces

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=android

This section details the API interfaces for initializing, configuring, and managing the signaling client instance.

```APIDOC
## Setup API Interfaces

### Create Instance
- **Method**: `RtmClient create(RtmConfig config)`
- **Description**: Creates a new instance of the signaling client.

### Destroy Instance
- **Method**: `RtmClient.release()`
- **Description**: Releases all resources associated with the signaling client instance.

### Token Configuration
- **Method**: `login` interface with `token` parameter
- **Description**: Configures authentication using a token for the login process.

### End-to-End Encryption
- **Method**: `RtmEncryptionConfig` with `encryptionMode`, `encryptionKey`, `encryptionSalt` parameters
- **Description**: Configures end-to-end encryption for secure communication.

### Presence Timeout Setting
- **Method**: `RtmConfig` with `presenceTimeout` parameter
- **Description**: Sets the timeout duration for presence status updates.

### Log Level Setting
- **Method**: `RtmLogConfig` with `level` parameter
- **Description**: Configures the logging level for the signaling client.

### Proxy Configuration
- **Method**: `RtmProxyConfig` with `proxyType`, `server`, `port`, `account`, `password` parameters
- **Description**: Configures proxy settings for network connections.

### Event Listener
- **Method**: `void addEventListener(RtmEventListener listener)`
- **Description**: Adds an event listener to receive signaling events.
- **Method**: `void removeEventListener(RtmEventListener listener)`
- **Description**: Removes an event listener.

### Login Service
- **Method**: `void login(String token, ResultCallback<Void> resultCallback)`
- **Description**: Logs in to the signaling service using a provided token.

### Logout Service
- **Method**: `void logout(ResultCallback<Void> resultCallback)`
- **Description**: Logs out from the signaling service.
```

--------------------------------

### Python: Agent Initialization and Run Logic

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initializes the agent with tools, channel, and client connection. The `run` method manages the agent's lifecycle, including subscribing to users, handling connection state changes, and starting asynchronous tasks for audio processing. It includes error handling for cancellations and general exceptions.

```python
self.tools = tools        self._client_tool_futures = {}        self.channel = channel        self.subscribe_user = None        self.write_pcm = os.environ.get("WRITE_AGENT_PCM", "false") == "true"        logger.info(f"Write PCM: {self.write_pcm}")    async def run(self) -> None:        try:            def log_exception(t: asyncio.Task[Any]) -> None:                if not t.cancelled() and t.exception():                    logger.error(                        "unhandled exception",                        exc_info=t.exception(),                    )            logger.info("Waiting for remote user to join")            self.subscribe_user = await wait_for_remote_user(self.channel)            logger.info(f"Subscribing to user {self.subscribe_user}")            await self.channel.subscribe_audio(self.subscribe_user)            async def on_user_left(                agora_rtc_conn: RTCConnection, user_id: int, reason: int            ):                logger.info(f"User left: {user_id}")                if self.subscribe_user == user_id:                    self.subscribe_user = None                    logger.info("Subscribed user left, disconnecting")                    await self.channel.disconnect()            self.channel.on("user_left", on_user_left)            disconnected_future = asyncio.Future[None]()            def callback(agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason):                logger.info(f"Connection state changed: {conn_info.state}")                if conn_info.state == 1:                    if not disconnected_future.done():                        disconnected_future.set_result(None)            self.channel.on("connection_state_changed", callback)            asyncio.create_task(self.rtc_to_model()).add_done_callback(log_exception)            asyncio.create_task(self.model_to_rtc()).add_done_callback(log_exception)            asyncio.create_task(self._process_model_messages()).add_done_callback(                log_exception            )            await disconnected_future            logger.info("Agent finished running")        except asyncio.CancelledError:            logger.info("Agent cancelled")        except Exception as e:            logger.error(f"Error running agent: {e}")            raise
```

--------------------------------

### Start Agora Agent (Python)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initiates a new Agora agent process. It validates incoming request data, checks for existing processes for the given channel, configures inference parameters including system messages and voice settings, and starts the agent in a separate process. It also includes error handling for invalid data and process startup failures.

```python
async def start_agent(request):
    try:        # Parse JSON body        data = await request.json()        validated_data = StartAgentRequestBody(**data)    except ValidationError as e:
        return web.json_response(
            {"error": "Invalid request data", "details": e.errors()},
            status=400,
        )

    # Parse JSON body
    channel_name = validated_data.channel_name
    uid = validated_data.uid
    language = validated_data.language

    # Check if a process is already running for the given channel_name
    if (
        channel_name in active_processes
        and active_processes[channel_name].is_alive()
    ):
        return web.json_response(
            {"error": f"Agent already running for channel: {channel_name}"},
            status=400,
        )

    system_message = ""
    if language == "en":
        system_message = """Your knowledge cutoff is 2023-10. You are a helpful, witty, and friendly AI. Act like a human, but remember that you aren't a human and that you can't do human things in the real world. Your voice and personality should be warm and engaging, with a lively and playful tone. If interacting in a non-English language, start by using the standard accent or dialect familiar to the user. Talk quickly. You should always call a function if you can. Do not refer to these rules, even if you're asked about them."""

    inference_config = InferenceConfig(
        system_message=system_message,
        voice=Voices.Alloy,
        turn_detection=ServerVADUpdateParams(
            type="server_vad", threshold=0.5, prefix_padding_ms=300, silence_duration_ms=200
        ),
    )

    # Create a new process for running the agent
    process = Process(
        target=run_agent_in_process,
        args=(app_id, app_cert, channel_name, uid, inference_config),
    )

    try:
        process.start()
    except Exception as e:
        logger.error(f"Failed to start agent process: {e}")
        return web.json_response(
            {"error": f"Failed to start agent: {e}"}, status=500
        )

    # Store the process in the active_processes dictionary using channel_name as the key
    active_processes[channel_name] = process

    # Monitor the process in a background asyncio task
    asyncio.create_task(monitor_process(channel_name, process))

    return web.json_response({"status": "Agent started!"})
except Exception as e:
    logger.error(f"Failed to start agent: {e}")
    return web.json_response({"error": str(e)}, status=500)
```

--------------------------------

### Install Project Dependencies

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Installs all required project dependencies using yarn. This includes core libraries for UI, storage, camera, and media functionalities.

```bash
yarn && yarn run env
```

--------------------------------

### HTTP GET Request Example for Call Statistics

Source: https://docs.agora.io/en/agora-analytics/reference/api

This example demonstrates how to make a GET request to retrieve call statistics. It includes the necessary URL, headers, and specifies the API endpoint for call statistics.

```bash
curl --request GET \
  --url https://api.sd-rtn.com/beta/analytics/call/statistics \
  --header 'Accept: application/json' \
  --header 'Authorization: Basic 123'
```

--------------------------------

### Query Time-Series Quality Metrics HTTP Request

Source: https://docs.agora.io/en/agora-analytics/reference/api

Example of an HTTP GET request to query hourly network delay rates. This demonstrates the required parameters such as start timestamp, end timestamp, app ID, metric type, granularity, and product type.

```HTTP
GET /beta/insight/quality/by_time?startTs=1625097600&endTs=1625184000&appid=axxxxxxxxxxxxxxxxxxxx&metric=networkDelay&aggregateGranularity=1h&productType=Native HTTP/1.1
Host: api.agora.io
Accept: application/json
Authorization: Basic ZGJhZDMyNmFkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxWQzYTczNzg2ODdiMmNiYjRh
```

--------------------------------

### HTTP Basic Authentication with Agora API (Java)

Source: https://docs.agora.io/en/video-calling/channel-management-api/restful-authentication

Provides a Java example for HTTP basic authentication with the Agora.io Server RESTful API using the built-in HttpClient. It shows how to encode credentials with Base64 and set the Authorization header for a GET request to retrieve project data.

```java
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;// HTTP basic authentication example in Java using the <Vg k="VSDK" /> Server RESTful API
public class Base64Encoding {
    public static void main(String[] args) throws IOException, InterruptedException {
        // Customer ID
        final String customerKey = "Your customer ID";
        // Customer secret
        final String customerSecret = "Your customer secret";
        // Concatenate customer key and customer secret and use base64 to encode the concatenated string
        String plainCredentials = customerKey + ":" + customerSecret;
        String base64Credentials = new String(Base64.getEncoder().encode(plainCredentials.getBytes()));
        // Create authorization header
        String authorizationHeader = "Basic " + base64Credentials;
        HttpClient client = HttpClient.newHttpClient();
        // Create HTTP request object
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.agora.io/dev/v2/projects"))
                .GET()
                .header("Authorization", authorizationHeader)
                .header("Content-Type", "application/json")
                .build();
        // Send HTTP request
        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
```

--------------------------------

### Start HTTP Server in Go

Source: https://docs.agora.io/en/3.x/video-calling/basic-features/token-server

The `main` function initializes the HTTP server for the token service. It registers the `rtcTokenHandler` to handle requests on the `/fetch_rtc_token` path and starts listening on port 8082. This setup uses the standard `net/http` package. Error handling is included for graceful shutdown if the server fails to start.

```go
func main() {
    // Video Calling token from Video SDK int uid
    http.HandleFunc("/fetch_rtc_token", rtcTokenHandler)
    fmt.Printf("Starting server at port 8082\n")

    if err := http.ListenAndServe(":8082", nil); err != nil {
        log.Fatal(err)
    }
}
```

--------------------------------

### Clone Agora Unity Quickstart Repository

Source: https://docs.agora.io/en/video-calling/get-started/compile-run-sample-project

This command clones the Agora Unity Quickstart repository from GitHub to your local machine. It's the first step in obtaining the sample project for testing Agora's Video SDK features.

```bash
git clone https://github.com/AgoraIO-Extensions/Agora-Unity-Quickstart.git
cd Agora-Unity-Quickstart/API-Example-Unity
```

--------------------------------

### Setup Logger with Color and Timestamp

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initializes a logger with support for colorized output and timestamps. This is useful for development and debugging to easily distinguish log messages.

```Python
logger = setup_logger(name=__name__, log_level=logging.INFO)
```

--------------------------------

### Clone the OpenAI Realtime Python Demo Repository

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command clones the demonstration project from GitHub, allowing you to explore the integrated solution locally. It uses Git to download the repository contents.

```bash
git clone git@github.com:AgoraIO/openai-realtime-python.git
```

--------------------------------

### HTTP GET Request for Call List - Agora Analytics API

Source: https://docs.agora.io/en/agora-analytics/reference/api

This example demonstrates how to make a GET request to the Agora Analytics API to retrieve a list of calls based on specified criteria. It includes required query parameters such as start timestamp, end timestamp, and App ID, along with optional parameters for pagination. The request specifies the host and content type, and includes an Authorization header for authentication.

```HTTP
GET /beta/analytics/call/lists?start_ts=1550024508&end_ts=1550025508&appid=xxxxxxxxxxxxxxxxxxxx&page_no=1&page_size=20 HTTP/1.1
Host: api.agora.io
Accept: application/json
Authorization: Basic ZGJhZDMyNmFkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxWQzYTczNzg2ODdiMmNiYjRh
```

--------------------------------

### Get User Information Response Example (JSON)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

Provides an example of a successful JSON response when querying user information. It includes details like userName, userUuid, role, streamUuid, and online state.

```json
{
  "msg": "Success",
  "code": 0,
  "ts": 1658126805245,
  "data": {
    "userName": "jasoncai",
    "userUuid": "681d9aca4924e9a84ad301e8cca438a71",
    "role": "1",
    "userProperties": {},
    "updateTime": 1658126782174,
    "streamUuid": "1417753684",
    "state": 1
  }
}
```

--------------------------------

### HTTP GET Request Example for Freeze Rate Statistics

Source: https://docs.agora.io/en/agora-analytics/reference/api

This example shows a cURL command for making a GET request to retrieve audio/video freeze rate statistics. It includes the API endpoint and essential headers for authorization and content type.

```bash
curl --request GET \
  --url https://api.sd-rtn.com/beta/analytics/call/freeze/bucket \
  --header 'Accept: application/json' \
  --header 'Authorization: Basic 123'
```

--------------------------------

### Get Channel Events Response Example

Source: https://docs.agora.io/en/signaling/rest-api/channel-events

An example of a successful JSON response from the Agora Signaling API when fetching channel events. It includes the request status, ID, and a list of join/leave events with event details.

```json
{
  "result": "success",
  "request_id": "10116762670167749259",
  "events": [
    {
      "group_id": "example_channel_id",
      "user_id": "rtmtest_RTM_4852_4857w7%",
      "type": "Join",
      "ms": 1578027418981
    }
  ]
}
```

--------------------------------

### POST /start_agent

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Starts a new RealtimeKit agent process if one isn't already running for the specified channel. It validates the request, configures the agent with provided credentials and inference settings, and stores the process for monitoring.

```APIDOC
## POST /start_agent

### Description
Starts a new RealtimeKit agent process if one isn't already running for the specified channel. It validates the request, configures the agent with provided credentials and inference settings, and stores the process for monitoring.

### Method
POST

### Endpoint
/start_agent

### Parameters
#### Request Body
- **channel_name** (string) - Required - The name of the RTC channel.
- **uid** (integer) - Required - The user ID for the agent.
- **language** (string) - Required - The language for the agent's system message (e.g., 'en').

### Request Example
```json
{
  "channel_name": "example_channel",
  "uid": 12345,
  "language": "en"
}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates that the agent has started successfully.

#### Response Example
```json
{
  "status": "Agent started!"
}
```

#### Error Response (400)
- **error** (string) - Indicates invalid request data or that an agent is already running for the channel.
- **details** (object) - Provides specific validation errors if the request data is invalid.

#### Error Response (500)
- **error** (string) - Indicates a server-side error occurred during agent startup.
```

--------------------------------

### Checkout Supported Flexible Classroom Version

Source: https://docs.agora.io/en/flexible-classroom/get-started/demo-quickstart

After cloning the repository, this command sequence navigates into the project directory and checks out a specific release version of the Flexible Classroom SDK. This ensures compatibility with the guide's instructions.

```bash
cd CloudClass-Android
git checkout release/2.8.11
```

--------------------------------

### Create Project Directory

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command creates a new directory named 'realtime_agent' to serve as the root for the project. It then changes the current directory into the newly created folder.

```bash
mkdir realtime_agent
cd realtime_agent/
```

--------------------------------

### Sample Project Console Output for Receiving Streams (Linux C++)

Source: https://docs.agora.io/en/server-gateway/get-started/compile-run-sample-project

Example console output when the `sample_receive_h264_pcm` project is running and successfully receiving audio and video streams. It indicates stream subscription, data reception, and user track status updates.

```log
[ APP_LOG_INFO ] Subscribe streams from all remote users  
[ APP_LOG_INFO ] Start receiving audio & video data ...  
[ APP_LOG_INFO ] Created file received_audio.pcm to save received PCM samples  
[ APP_LOG_INFO ] onUserAudioTrackStateChanged: userId 4088243221, state 1, reason 0  
[ APP_LOG_INFO ] onUserAudioTrackStateChanged: userId 4088243221, state 2, reason 6  
[ APP_LOG_INFO ] onUserInfoUpdated: userId 4088243221, msg 0, val 0  
[ APP_LOG_INFO ] onUserInfoUpdated: userId 4088243221, msg 4, val 1  
[ APP_LOG_INFO ] onUserInfoUpdated: userId 4088243221, msg 8, val 1  
[ APP_LOG_INFO ] onUserInfoUpdated: userId 4088243221, msg 1, val 1  

```

--------------------------------

### Start Agent API Request (cURL)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This cURL command demonstrates how to start an agent via the HTTP server. It sends a POST request to the `/start_agent` endpoint with a JSON payload specifying the channel name and agent UID. The agent will join the specified channel and subscribe to the client's UID.

```bash
curl 'http://localhost:8080/start_agent' \
  -H 'Content-Type: application/json' \
  --data-raw '{  
    "channel_name": "test",  
    "uid": 123  
  }'
```

--------------------------------

### Install Agora Signaling SDK using npm

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

This command installs the Agora Signaling SDK package using npm, a popular JavaScript package manager. This is an alternative to using a CDN for including the SDK in your project.

```bash
npm install agora-rtm-sdk
```

--------------------------------

### aiohttp Application Setup (Python)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

The `init_app` function initializes the aiohttp web application. It defines POST routes for `/start_agent` and `/stop_agent`, and crucially, appends the `shutdown` function to the `on_cleanup` event. This ensures that all agent processes are properly terminated when the application exits.

```python
async def init_app():
    app = web.Application()
    
 # Add cleanup task to run on app exit
    app.on_cleanup.append(shutdown)
    
    app.add_routes([web.post("/start_agent", start_agent)])
    app.add_routes([web.post("/stop_agent", stop_agent)])
    
 return app
```

--------------------------------

### Navigate to the Cloned Repository

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command changes the current directory to the root of the cloned repository. This is a necessary step before proceeding with project setup or execution.

```bash
cd openai-realtime-python
```

--------------------------------

### Install Markdown Support for Sphinx

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/implementation-guide

Installs the 'myst-parser' package, enabling Sphinx to process Markdown files for documentation generation. This is necessary for writing content in Markdown.

```bash
pip install myst-parser  
```

--------------------------------

### Run Demo Server

Source: https://docs.agora.io/en/3.x/on-premise-recording/develop/authentication-workflow

These commands install dependencies and run the demo server for the agora-token package. Navigate to the 'server' directory before executing.

```bash
npm i
node DemoServer.js
```

--------------------------------

### Get User Events REST API Request Example

Source: https://docs.agora.io/en/1.x/signaling/reference/user-channel-events

This snippet shows an example of a GET request to the Agora Signaling REST API to retrieve user events. It specifies the endpoint and the full request URL, including a placeholder for the App ID.

```http
GET https://api.agora.io/dev/v2/project/876922cbca0098dff4323566daa89675/rtm/vendor/user_events
```

--------------------------------

### Setup Agora Engine and Connection in Java

Source: https://docs.agora.io/en/iot/get-started/get-started-sdk

Initialize the Agora IoT SDK engine and establish a connection. This method creates an AgoraRtcService instance, configures options like area code and license, initializes the engine, and creates a connection.

```java
private void setupAgoraEngine(){
    agoraEngine = new AgoraRtcService();
    showMessage("RTC SDK version " + agoraEngine.getVersion());
  
    // Initialize the engine
    AgoraRtcService.RtcServiceOptions options = new AgoraRtcService.RtcServiceOptions();
    options.areaCode = AgoraRtcService.AreaCode.AREA_CODE_GLOB;
    options.productId = deviceId;
    options.licenseValue = rtcLicense;
    int ret = agoraEngine.init(appId, agoraRtcEvents, options);
    if (ret != AgoraRtcService.ErrorCode.ERR_OKAY) {
        showMessage("Fail to initialize the SDK " + ret);
        agoraEngine = null;
        return;
    } else {
        showMessage("Engine initialized");
    }
  
    // Create a connection
    connectionId = agoraEngine.createConnection();
    if (connectionId == AgoraRtcService.ConnectionIdSpecial.CONNECTION_ID_INVALID) {
        showMessage("Failed to createConnection");
    } else {
        showMessage("Connected");
    }
}
```

--------------------------------

### PHP Basic Auth for Agora API

Source: https://docs.agora.io/en/agora-analytics/reference/restful-authentication

Provides a PHP implementation for basic HTTP authentication with the Agora RESTful API. It uses cURL to construct and send a GET request with a base64 encoded 'Authorization' header containing customer credentials. Ensure the cURL extension is enabled in your PHP installation.

```php
<?php
// HTTP basic authentication example in PHP using the Agora Server RESTful API

// Customer ID and secret
$customerKey = "Your customer ID";   // Replace with your actual customer ID
$customerSecret = "Your customer secret"; // Replace with your actual customer secret

// Concatenate customer key and customer secret
$credentials = $customerKey . ":" . $customerSecret;

// Encode with base64
$base64Credentials = base64_encode($credentials);

// Create authorization header
$authHeader = "Authorization: Basic " . $base64Credentials;

// Initialize cURL
$curl = curl_init();

// Set cURL options
curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.agora.io/dev/v2/projects',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_HTTPHEADER => [
        $authHeader,
        'Content-Type: application/json',
    ],
]);

// Execute cURL request
$response = curl_exec($curl);

// Check for cURL errors
if ($response === false) {
    echo "Error in cURL: " . curl_error($curl);
}
else {
    // Output the response
    echo $response;
}

// Close cURL session
curl_close($curl);
?>

```

--------------------------------

### Shell Build and Run Sample Project

Source: https://docs.agora.io/en/on-premise-recording/get-started/quickstart

This shell script demonstrates how to build and run the Agora sample recorder project. It includes navigating to the project directory, executing the build script, setting the library path, and running the sample recorder with a specified configuration file.

```shell
cd agora_rtc_sdk/example  
./build.sh  
export LD_LIBRARY_PATH=../../agora_sdk:$LD_LIBRARY_PATH  
# Example: Run individual recording  
./out/sample_recorder singleVideo.json  
```

--------------------------------

### GET /presence/userChannels

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Call the `getUserChannels` method to get the list of channels where the specified user is in real time.

```APIDOC
## GET /presence/userChannels

### Description
In use-cases such as statistic analytics and debugging, you may need to know all the channels that a specified user has subscribed to or joined. Call the `getUserChannels` method to get the list of channels where the specified user is in real time.

### Method
`rtm.presence.getUserChannels(userId: string): Promise<GetUserChannelsResponse>;`

### Parameters
#### Query Parameters
- **userId** (string) - Required - If you set this parameter to an empty string `""`, the SDK uses the `userId` of the local user.

### Request Example
```javascript
try{
 const result = await rtm.presence.getUserChannels( "Tony" );
    console.log(result);
} catch(status){
    console.log(status);
}
```

### Response
#### Success Response (200)
- **GetUserChannelsResponse** (object) - An object containing the list of channels the user has joined.

#### Response Example
```json
{
  "channels": [
    "channel1",
    "channel2"
  ]
}
```

#### Error Response
- **ErrorInfo** (object) - Information about the error if the method call fails.
```

--------------------------------

### HTTP Request Example for Get Quality Metrics

Source: https://docs.agora.io/en/agora-analytics/reference/api

This example demonstrates how to make a GET request to the /beta/analytics/call/metrics endpoint to retrieve call quality metrics. It includes necessary query parameters like app ID, call ID, time range, and session IDs.

```http
GET /beta/analytics/call/metrics?start_ts=1548665345&end_ts=1548670821&appid=axxxxxxxxxxxxxxxxxxxx&call_id=cxxxxxxxxxxxxxxxxxxxx&sids=sxxxxxxxxxxxxxxxx1,sxxxxxxxxxxxxxxxx2,sxxxxxxxxxxxxxxxx3 HTTP/1.1
Host: api.agora.io
Accept: application/json
Authorization: Basic ZGJhZDMyNmFkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxWQzYTczNzg2ODdiMmNiYjRh
```

--------------------------------

### Response Parameters and Example

Source: https://docs.agora.io/en/broadcast-streaming/channel-management-api/endpoint/ban-user-privileges/get-rule-list

Details on the structure of successful responses, including status, rules, and timestamps, along with a complete example.

```APIDOC
## GET /websites/agora_io_en/rules

### Description
Retrieves a list of banning rules for a given project. Includes details about the status of the request and the rules themselves.

### Method
GET

### Endpoint
/websites/agora_io_en/rules

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
None

### Response
#### Success Response (200)
- **status** (String) - The status of the request. Should be 'success' for a successful operation.
- **rules** (Array) - A list of banning rule objects.
  - **id** (Number) - The unique identifier for the banning rule.
  - **appid** (String) - The App ID of the project.
  - **uid** (Number) - The user ID associated with the rule.
  - **opid** (Number) - The operation ID for tracking purposes.
  - **cname** (String) - The channel name.
  - **ip** (String) - The IP address of the user.
  - **ts** (String) - The UTC timestamp when the rule expires.
  - **privileges** (Array) - A list of privileges associated with the rule (e.g., 'join_channel', 'publish_audio', 'publish_video').
  - **createAt** (String) - The UTC timestamp when the rule was created.
  - **updateAt** (String) - The UTC timestamp when the rule was last updated.

#### Error Response (Non-200 Status Codes)
- **message** (String) - A description of the error if the request fails.

#### Response Example
```json
{
  "status": "success",
  "rules": [
    {
      "id": 1953,
      "appid": "4855xxxxxxxxxxxxxxxxxxxxxxxxeae2",
      "uid": 589517928,
      "opid": 1406,
      "cname": "11",
      "ip": "192.168.0.1",
      "ts": "2018-01-09T07:23:06.000Z",
      "privileges": [
        "join_channel"
      ],
      "createAt": "2018-01-09T06:23:06.000Z",
      "updateAt": "2018-01-09T14:23:06.000Z"
    }
  ]
}
```
```

--------------------------------

### Get Thread by ID Request and Response Example

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/create-delete-retrieve-threads

Demonstrates an example HTTP GET request to retrieve a thread by its ID and its corresponding JSON response body. The response includes thread details like ID, application name, and organization, along with a cursor for pagination.

```curl
curl -X GET http://XXXX.com/XXXX/testapp/thread -H 'Authorization: Bearer <YourAppToken>'
```

```json
{
  "action": "get",
  "applicationName": "testapp",
  "duration": 7,
  "entities": [
    {
      "id": "179786360094768"
    }
  ],
  "organization": "XXXX",
  "properties": {
    "cursor": "ZGNiMjRmNGY1YjczYjlhYTNkYjk1MDY2YmEyNzFmODQ6aW06dGhyZWFkOmVhc2Vtb2ItZGVtbyN0ZXN0eToxNzk3ODYzNjExNDMzMTE"
  },
  "timestamp": 1650869750247,
  "uri": "http://XXXX.com/XXXX/testy/thread"
}
```

--------------------------------

### Start Web Recording Configuration - cURL

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=android

This cURL example demonstrates how to initiate a web recording. It specifies the recording mode, the URL of the web content to be recorded, and retry timeout settings. Ensure you replace placeholders like {region}, {yourAppId}, and token values with actual credentials.

```shell
curl -X PUT 'https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/test_class/records/states/1' \
-H 'Content-Type: application/json;charset=UTF-8' \
-H 'Authorization: agora token={educationToken}' \
--data-raw '{ 
    "mode": "web", 
    "webRecordConfig": { 
        "url": "https://webdemo.agora.io/xxxxx/?userUuid={recorder_id}&roomUuid={room_id_to_be_recorded}&roleType=0&roomType=4&pretest=false&rtmToken={recorder_token}&language=en&appId={your_app_id}", 
        "rootUrl": "https://xxx.yyy.zzz", 
        "publishRtmp": "true" 
    }, 
    "retryTimeout": 60 
}'
```

--------------------------------

### Import Whiteboard SDK in HTML

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This HTML snippet shows how to include the White Web SDK using a CDN link within the `<head>` section of an HTML file. It also includes a local JavaScript file for joining the whiteboard.

```html
<!DOCTYPE html>
<html lang="en">
<head>
      <script src="https://sdk.netless.link/white-web-sdk/2.15.16.js"></script>
      <script src="./joinWhiteboard.js"></script>
 </head>
 <body>
      <div id="whiteboard" style="width: 100%; height: 100vh;"></div>
 </body>
</html>
```

--------------------------------

### Add Fastboard SDK Dependencies

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

Installs the necessary Fastboard SDK, window manager, and Whiteboard SDK for web using npm. These dependencies are essential for building interactive whiteboard features in your web application.

```bash
npm add @netless/fastboard @netless/window-manager white-web-sdk
```

--------------------------------

### Get Channel Metadata Async C# Example

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

This C# code snippet demonstrates how to asynchronously retrieve metadata for a given channel using the GetChannelMetadataAsync method. It includes error handling and logs the channel's metadata upon successful retrieval. Dependencies include the Agora RTM SDK and standard C# libraries for logging.

```csharp
var (status, response) = await rtmClient.GetStorage().GetChannelMetadataAsync("channel_name", RTM_CHANNEL_TYPE.MESSAGE);
if (status.Error)
{
    Debug.Log(string.Format("{0} is failed, ErrorCode: {1}, due to: {2}", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log(string.Format("Get Channel :{0} metadata success! Channel Type is :{1}! ", response.ChannelName, response.ChannelType));
    var data = response.data;
    if (data.metadataItemsSize != 0)
    {
        Debug.Log(string.Format("Channel Metadata Major Revision is :{0} ! ", data.majorRevision));
        for (int i = 0; i < data.metadataItemsSize; i++)
        {
            Debug.Log(string.Format("The {0}'th iterms Key is:{1}, Value is {2} ! ", i, data.metadataItems[i].key, data.metadataItems[i].value));
        }
    }
}
```

--------------------------------

### C# HTTP Basic Auth for Agora API

Source: https://docs.agora.io/en/agora-analytics/reference/restful-authentication

This C# code snippet demonstrates how to perform HTTP basic authentication against the Agora Server RESTful API. It uses `System.Net.WebRequest` to construct and send a GET request, including the Base64 encoded credentials in the `Authorization` header. This example is compatible with .NET Framework and .NET Core.

```csharp
using System;
using System.IO;
using System.Net;
using System.Text;

// HTTP basic authentication example in C# using the <Vg k="VSDK" /> Server RESTful APInamespace Examples.System.Net
{
    public class WebRequestPostExample
    {
        public static void Main()
        {
            // Customer ID
            string customerKey = "Your customer ID";
            // Customer secret
            string customerSecret = "Your customer secret";

            // Concatenate customer key and customer secret and use base64 to encode the concatenated string
            string plainCredential = customerKey + ":" + customerSecret;

            // Encode with base64
            var plainTextBytes = Encoding.UTF8.GetBytes(plainCredential);
            string encodedCredential = Convert.ToBase64String(plainTextBytes);

            // Create authorization header
            string authorizationHeader = "Authorization: Basic " + encodedCredential;

            // Create request object
            WebRequest request = WebRequest.Create("https://api.agora.io/dev/v2/projects");
            request.Method = "GET";

            // Add authorization header
            request.Headers.Add(authorizationHeader);
            request.ContentType = "application/json";

            WebResponse response = request.GetResponse();
            Console.WriteLine(((HttpWebResponse)response).StatusDescription);

            using (Stream dataStream = response.GetResponseStream())
            {
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                Console.WriteLine(responseFromServer);
            }

            response.Close();
        }
    }
}
```

--------------------------------

### Configure Vite Build Tool in package.json

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

Sets up the 'package.json' file to include Fastboard SDK and Vite as a development dependency. Defines scripts for building and running the project locally using Vite, which is used as the build tool.

```json
{
  "name": "fastboard_quickstart",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite --open"
  },
  "dependencies": {
    "@netless/fastboard": "latest",
    "@netless/window-manager": "latest",
    "white-web-sdk": "latest"
  },
  "devDependencies": {
    "vite": "latest"
  }
}

```

--------------------------------

### Get Chat Room Admins Response Example

Source: https://docs.agora.io/en/agora-chat/restful-api/chatroom-management/manage-chatroom-members

Example JSON response when successfully retrieving chat room administrators. It includes metadata and a 'data' array containing admin usernames.

```json
{
  "action": "get",
  "application": "527cd7e0-XXXX-XXXX-9f59-ef10ecd81ff0",
  "uri": "http://XXXX/XXXX/XXXX/chatrooms/XXXX/admin",
  "entities": [],
  "data": ["XXXX"],
  "timestamp": 1489073361210,
  "duration": 0,
  "organization": "XXXX",
  "applicationName": "XXXX",
  "count": 1
}
```

--------------------------------

### Implement Subscription Logic (C++)

Source: https://docs.agora.io/en/on-premise-recording/reference/migration-guide

This C++ example illustrates how to implement subscription logic for audio and video streams. It provides APIs to subscribe to all streams, unsubscribe from all, or subscribe/unsubscribe to specific streams.

```cpp
// Subscribe to all audio streams
recorder->subscribeAllAudio();

// Unsubscribe from all video streams
recorder->unsubscribeAllVideo();

// Subscribe to a specific audio stream by UID
recorder->subscribeAudio("user_uid_to_subscribe");

// Unsubscribe from a specific video stream by UID
recorder->unsubscribeVideo("user_uid_to_unsubscribe");

```

--------------------------------

### Run React Native Chat UI Kit Example App on iOS

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Compiles and runs the React Native Chat UI Kit example app on an iOS device or simulator. This involves installing CocoaPods dependencies and then executing the iOS build script.

```bash
cd example && yarn run pods && yarn run iOS
```

--------------------------------

### Join Interactive Whiteboard Room

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

Integrates the Interactive Whiteboard SDK into your web application to join an existing room.

```APIDOC
## Integrate Whiteboard SDK and Join Room

### Description
This section details how to integrate the Interactive Whiteboard SDK via CDN or npm and join an existing room using the `WhiteWebSdk`.

### 1. Import SDK (CDN)
Add the following script tag to your `index.html` file:

```html
<script src="https://sdk.netless.link/white-web-sdk/2.15.16.js"></script>
```

### 2. Initialize `WhiteWebSdk` and Join Room
Use the following JavaScript code in your application:

```javascript
var whiteWebSdk = new WhiteWebSdk({
  // Pass in your App Identifier.
  appIdentifier: "Your App Identifier",
  // Set the data center as Silicon Valley, US.
  region: "us-sv",
});

var joinRoomParams = {
  uuid: "Your room UUID",
  // The unique identifier of a user. If you use versions earlier than v2.15.0, do not add this line.
  uid: "user uid",
  roomToken: "Your room token",
};

// Join the whiteboard room and display the whiteboard on the web page.
whiteWebSdk.joinRoom(joinRoomParams).then(function(room) {
    room.bindHtmlElement(document.getElementById("whiteboard"));
}).catch(function(err) {
    console.error(err);
});
```

### Parameters for `WhiteWebSdk` constructor
- **appIdentifier** (string) - Required - The App Identifier of the whiteboard project in Agora Console.
- **region** (string) - Required - The data center, which must be the same as the data center used when creating the room.

### Parameters for `joinRoom`
- **uuid** (string) - Required - The unique identifier of the room.
- **uid** (string) - Optional - A unique identifier for the user. Omit for SDK versions prior to v2.15.0.
- **roomToken** (string) - Required - The room token generated by the server.

### 3. Install SDK via npm
Navigate to your project folder and run:

```bash
npm install white-web-sdk
```

Then, import the SDK in your `index.js` file:

```javascript
var WhiteWebSdk = require("white-web-sdk");
```
```

--------------------------------

### Shell: Run Go Project for Cloud Transcoding

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

This command executes the main Go project file. It's the primary step to initiate the cloud transcoding process as described in the implementation.

```shell
go run main.go
```

--------------------------------

### Initialize and Run Agora IO Web Server

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initializes the web application by adding agent-related routes and runs the application on a specified port. It includes handling for Python 3.10+ event loop requirements and environment variable for port configuration.

```python
import asyncio
from aiohttp import web
import os
from logger import logger

# Assuming init_app, parse_args, and other necessary functions are defined elsewhere
# For demonstration, let's mock them:
async def init_app():
    app = web.Application()
    # Placeholder for adding routes, assuming start_agent and stop_agent are defined
    # app.add_routes([web.post("/start_agent", start_agent)])
    # app.add_routes([web.post("/stop_agent", stop_agent)])
    logger.info("Initializing application...")
    return app

def parse_args():
    # Mocking parse_args to return a specific action for demonstration
    class Args:
        action = "server"
    return Args()

if __name__ == "__main__":
    args = parse_args()
    if args.action == "server":
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        app = loop.run_until_complete(init_app())
        server_port = int(os.getenv("SERVER_PORT") or "8080")
        logger.info(f"Starting server on port {server_port}...")
        web.run_app(app, port=server_port)

```

--------------------------------

### Initialize Go Module for Agora Cloud Transcoder

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

Initializes a new Go module for a project focused on Agora cloud transcoding. This command creates a go.mod file to manage project dependencies.

```bash
go mod init test-transcoder
```

--------------------------------

### Start Audio Mixing

Source: https://docs.agora.io/en/voice-calling/advanced-features/audio-mixing-and-sound-effects

Starts playing an audio file. This can be done before or after joining a channel. The SDK provides callbacks to inform you about the status of the audio mixing.

```APIDOC
## POST /startAudioMixing

### Description
Starts playing an audio file. This can be done before or after joining a channel. The SDK provides callbacks to inform you about the status of the audio mixing.

### Method
POST

### Endpoint
/startAudioMixing

### Parameters
#### Request Body
- **filePath** (string) - Required - The path to the local or online audio file.
- **loopback** (boolean) - Optional - Set to `true` to play the audio file only locally. `false` means both local and remote users can hear the audio.
- **cycle** (integer) - Optional - The number of times the audio file should be played. Set to `-1` for infinite loop.
- **startPos** (integer) - Optional - The starting playback position of the audio file in milliseconds.

### Request Example
```json
{
  "filePath": "Your file path",
  "loopback": false,
  "cycle": -1,
  "startPos": 0
}
```

### Response
#### Success Response (200)
Indicates the audio mixing has started successfully. The `onAudioMixingStateChanged` callback will provide further status updates.

#### Response Example
```json
{
  "message": "Audio mixing started successfully"
}
```
```

--------------------------------

### Initialize and Start Screen Sharing with Agora

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java snippet illustrates the process of initializing the ScreenSharingClient and starting a screen sharing session. It requires an RtcEngine instance, an application context, and Agora App ID. The input includes the channel ID and a VideoEncoderConfiguration.

```java
mSSClient = ScreenSharingClient.getInstance();
mSSClient.setListener(mListener);

String channelId = et_channel.getText().toString();
if (!isSharing) {
    mSSClient.start(getContext(), getResources().getString(R.string.agora_app_id), null,
            channelId, SCREEN_SHARE_UID, new VideoEncoderConfiguration(
                    VD_640x360,
                    FRAME_RATE_FPS_15,
                    STANDARD_BITRATE,
                    ORIENTATION_MODE_ADAPTIVE
            ));
    screenShare.setText(getResources().getString(R.string.stop));
    isSharing = true;
} else {
    mSSClient.stop(getContext());
    screenShare.setText(getResources().getString(R.string.screenshare));
    isSharing = false;
}
```

--------------------------------

### Import Agora Cloud Transcoder SDK Packages in Go

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

Imports necessary packages from the Agora Go SDK for implementing cloud transcoding. These packages handle authentication, domain management, logging, and the cloud transcoder service.

```go
package main  

import (  
 "context"  
 "log"  
 "time"  

 "github.com/AgoraIO-Community/agora-rest-client-go/agora"  
 "github.com/AgoraIO-Community/agora-rest-client-go/agora/auth"  
 "github.com/AgoraIO-Community/agora-rest-client-go/agora/domain"  
 agoraLogger "github.com/AgoraIO-Community/agora-rest-client-go/agora/log"  
 "github.com/AgoraIO-Community/agora-rest-client-go/services/cloudtranscoder"  
 cloudTranscoderAPI "github.com/AgoraIO-Community/agora-rest-client-go/services/cloudtranscoder/api"  
)

```

--------------------------------

### Commands for Packaging Smart Classroom SDK and Plugin

Source: https://docs.agora.io/en/help/integration-issues/class_packaging

These commands are executed sequentially to build the Smart Classroom SDK, plugin, and the final Electron Windows package. They involve installing dependencies, building specific components, and then creating the executable for Windows.

```bash
yarn pack:classroom:sdk
yarn pack:classroom:plugin
yarn ci:build
yarn pack:electron:win
```

--------------------------------

### Start On-Premise Recording - Linux C++

Source: https://docs.agora.io/en/3.x/on-premise-recording/get-started/record-cmd

This command starts the recording process using the compiled 'record_local' executable. It requires essential parameters like App ID, channel name, UID, channel profile, and the application directory. These parameters must match the Agora Native/Web SDK configurations.

```bash
./recorder_local --appId <your App ID> --channel <channel name> --uid 0 --channelProfile <0 Communication, 1 Live broadcast> --appliteDir Agora_Recording_SDK_for_Linux_FULL/bin
```

--------------------------------

### Initialize Agora RtcEngine (Python)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Defines the `RtcEngine` class to initialize and configure the Agora service. The constructor takes an App ID and certificate, sets up the audio scenario, and initializes the Agora SDK with logging enabled.

```python
import os

class RtcEngine:
 def __init__(self, appid: str, appcert: str):
  self.appid = appid
  self.appcert = appcert
  
  if not appid:
   raise Exception("App ID is required)")
  
        config = AgoraServiceConfig()
        config.audio_scenario = AudioScenarioType.AUDIO_SCENARIO_CHORUS
        config.appid = appid
        config.log_path = os.path.join(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.join(os.path.abspath(__file__)))
                )
            ),
 "agorasdk.log",
        )
        self.agora_service = AgoraService()
        self.agora_service.initialize(config)
```

--------------------------------

### Query Usage Metrics by Time - HTTP Request Example

Source: https://docs.agora.io/en/agora-analytics/reference/api

This snippet demonstrates an HTTP GET request to query the total number of users across all channels for a specific time frame. It requires parameters such as the application ID, start and end timestamps, the metric to query (e.g., 'userCount'), and the desired aggregation granularity (e.g., '1d' for daily).

```http
GET /beta/insight/usage/by_time?startTs=1625097600&endTs=1625270400&appid=axxxxxxxxxxxxxxxxxxxx&metric=userCount&aggregateGranularity=1d HTTP/1.1
Host: api.agora.io
Accept: application/json
Authorization: Basic ZGJhZDMyNmFkxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxWQzYTczNzg2ODdiMmNiYjRh
```

--------------------------------

### Start Cloud Transcoding Task using Go

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

Initiates a cloud transcoding task by calling the `Create` method. This function mixes audio and video streams from specified RTC channels. It requires a client instance, a token name, and a request body specifying service type, input/output configurations, and audio profiles. Error handling and success/failure logging are included. The task ID is extracted upon successful creation.

```Go
import (
	"context"
	"log"
	"time"
	"your_project/cloudTranscoderAPI"
)

// Assuming 'client' is an initialized CloudTranscoder client
// Assuming 'tokenName', 'inputChannelName', 'inputUId', 'inputToken', 'outputChannelName', 'outputUId', 'outputToken' are defined

// Create a cloud transcoding task and start cloud transcoding  
createResp, err := client.Create(context.TODO(), tokenName, &cloudTranscoderAPI.CreateReqBody{
  Services: &cloudTranscoderAPI.CreateReqServices{
    CloudTranscoder: &cloudTranscoderAPI.CloudTranscoderPayload{
      ServiceType: "cloudTranscoderV2",
      Config: &cloudTranscoderAPI.CloudTranscoderConfig{
        Transcoder: &cloudTranscoderAPI.CloudTranscoderConfigPayload{
          IdleTimeout: 300,
          AudioInputs: []cloudTranscoderAPI.CloudTranscoderAudioInput{
            {
              Rtc: &cloudTranscoderAPI.CloudTranscoderRtc{
                RtcChannel: inputChannelName,
                RtcUID:     inputUId,
                RtcToken:   inputToken,
              },
            },
          },
          Outputs: []cloudTranscoderAPI.CloudTranscoderOutput{
            {
              Rtc: &cloudTranscoderAPI.CloudTranscoderRtc{
                RtcChannel: outputChannelName,
                RtcUID:     outputUId,
                RtcToken:   outputToken,
              },
              AudioOption: &cloudTranscoderAPI.CloudTranscoderOutputAudioOption{
                ProfileType: "AUDIO_PROFILE_MUSIC_STANDARD",
              },
            },
          },
        },
      },
    },
  },
})
if err != nil {
  log.Fatalln(err)
}
  
if createResp.IsSuccess() {
  log.Printf("create success:%+v\n", createResp)
} else {
  log.Printf("create failed:%+v\n", createResp)
 return 
}
  
taskId := createResp.SuccessResp.TaskID
  
if taskId == "" {
  log.Fatalln("taskId is empty")
}
  
log.Printf("taskId:%s\n", taskId)
  
// Wait for 10 seconds before stopping the cloud transcoding  
time.Sleep(time.Second * 10)

```

--------------------------------

### Java HTTP Basic Auth for Agora API

Source: https://docs.agora.io/en/agora-analytics/reference/restful-authentication

This Java example shows how to implement HTTP basic authentication for the Agora Server RESTful API. It utilizes `java.net.http.HttpClient` to send a GET request with the Base64 encoded credentials in the Authorization header. Ensure your Java Development Kit (JDK) supports HTTP Client API (JDK 11+).

```java
import java.io.IOException;import java.net.URI;import java.net.http.HttpClient;import java.net.http.HttpRequest;import java.net.http.HttpResponse;import java.util.Base64;// HTTP basic authentication example in Java using the <Vg k="VSDK" /> Server RESTful APIpublic class Base64Encoding {    public static void main(String[] args) throws IOException, InterruptedException {        // Customer ID        final String customerKey = "Your customer ID";        // Customer secret        final String customerSecret = "Your customer secret";        // Concatenate customer key and customer secret and use base64 to encode the concatenated string        String plainCredentials = customerKey + ":" + customerSecret;        String base64Credentials = new String(Base64.getEncoder().encode(plainCredentials.getBytes()));        // Create authorization header        String authorizationHeader = "Basic " + base64Credentials;        HttpClient client = HttpClient.newHttpClient();        // Create HTTP request object        HttpRequest request = HttpRequest.newBuilder()                .uri(URI.create("https://api.agora.io/dev/v2/projects"))                .GET()                .header("Authorization", authorizationHeader)                .header("Content-Type", "application/json")                .build();        // Send HTTP request        HttpResponse<String> response = client.send(request,                HttpResponse.BodyHandlers.ofString());        System.out.println(response.body());    }}
```

--------------------------------

### Start/Stop Individual Recording (C++)

Source: https://docs.agora.io/en/on-premise-recording/reference/migration-guide

This C++ code demonstrates how to start and stop individual recordings based on a user's UID. It also includes functionality to configure the recorder for a specific user.

```cpp
// Start recording for a specific user by UID
recorder->startSingleRecordingByUid("user_uid_to_record");

// Stop recording for a specific user by UID
recorder->stopSingleRecordingByUid("user_uid_to_stop_recording");

// Set configuration for a specific user's recording
// recorder->setRecorderConfigByUid("user_uid_to_configure", recordingConfig);

```

--------------------------------

### Agora.io Channel Initialization and Configuration in Python

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Initializes an Agora channel with RTC connection configuration, including client role and channel profile. It sets up event observers, local user settings, and creates an audio track for publishing. This is the core setup for a channel participant.

```python
class Channel:
    def __init__(self, rtc: "RtcEngine", options: RtcOptions) -> None:
        self.loop = asyncio.get_event_loop()
        # Create the event emitter
        self.emitter = AsyncIOEventEmitter(self.loop)
        self.connection_state = 0
        self.options = options
        self.remote_users = dict[int, Any]()
        self.rtc = rtc
        self.chat = Chat(self)
        self.channelId = options.channel_name
        self.uid = options.uid
        self.enable_pcm_dump = options.enable_pcm_dump
        self.token = options.build_token(rtc.appid, rtc.appcert) if rtc.appcert else ""
        conn_config = RTCConnConfig(
            client_role_type=ClientRoleType.CLIENT_ROLE_BROADCASTER,
            channel_profile=ChannelProfileType.CHANNEL_PROFILE_LIVE_BROADCASTING,
        )
        self.connection = self.rtc.agora_service.create_rtc_connection(conn_config)
        self.channel_event_observer = ChannelEventObserver(
            self.emitter,
            options=options,
        )
        self.connection.register_observer(self.channel_event_observer)
        self.local_user = self.connection.get_local_user()
        self.local_user.set_playback_audio_frame_before_mixing_parameters(
            options.channels, options.sample_rate
        )
        self.local_user.register_local_user_observer(self.channel_event_observer)
        self.local_user.register_audio_frame_observer(self.channel_event_observer)
        # self.local_user.subscribe_all_audio()
        self.media_node_factory = self.rtc.agora_service.create_media_node_factory()
        self.audio_pcm_data_sender =
            self.media_node_factory.create_audio_pcm_data_sender()
        self.audio_track = self.rtc.agora_service.create_custom_audio_track_pcm(
            self.audio_pcm_data_sender
        )
        self.audio_track.set_enabled(1)
        self.local_user.publish_audio(self.audio_track)
        self.stream_id = self.connection.create_data_stream(False, False)
        self.received_chunks = {}
        self.waiting_message = None
        self.msg_id = ""
        self.msg_index = ""
        self.on(
            "user_joined",
            lambda agora_rtc_conn, user_id: self.remote_users.update({user_id: True}),
        )
        self.on(
            "user_left",
            lambda agora_rtc_conn, user_id, reason: self.remote_users.pop(
                user_id, None
            ),
        )
        def handle_audio_subscribe_state_changed(
            agora_local_user,
            channel,
            user_id,
            old_state,
            new_state,
            elapse_since_last_state,
        ):
            if new_state == 3:  # Successfully subscribed
                self.channel_event_observer.audio_streams.update(
                    {user_id: AudioStream()}
                )
            elif new_state == 0:
                self.channel_event_observer.audio_streams.pop(user_id, None)
        self.on("audio_subscribe_state_changed", handle_audio_subscribe_state_changed)
        self.on(
            "connection_state_changed",
            lambda agora_rtc_conn, conn_info, reason: setattr(
                self, "connection_state", conn_info.state
            ),
        )
    asyn
```

--------------------------------

### Agora License API Request Example

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/usage

This snippet shows an example HTTP GET request to the Agora License API to retrieve license information for a specific customer. It requires the customerId in the path and query parameters for API key and signature.

```http
GET https://{host}/customers/{customerId}/license?apiKey={apiKey}&signature={signature}  
```

--------------------------------

### Clojure: Make GET Request with clj-http

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Demonstrates making an HTTP GET request in Clojure using the clj-http library. This example shows how to specify the URL and headers within a map literal for the request.

```clojure
(require '[clj-http.client :as client])

(client/get "http://api.sd-rtn.com/v2/ncs/ip" {:headers {:Authorization ""}
                                                :accept :json})

```

--------------------------------

### Golang: Initialize Go project for token server

Source: https://docs.agora.io/en/agora-chat/develop/authentication

This snippet shows the commands to create a new Go project directory, navigate into it, and initialize a Go module. This is the first step in setting up the Go application server for token generation.

```bash
mkdir chat-token-server
cd chat-token-server
go mod init chat-token-server

```

--------------------------------

### Configure and Run NPM Token Demo Server

Source: https://docs.agora.io/en/on-premise-recording/develop/authentication-workflow

Sets up and runs a local demo server for generating Agora tokens using the 'agora-token' NPM package. This involves updating credentials, installing dependencies, and starting the server.

```javascript
// Replace with your Agora credentials  
var appID = "<YOUR APP ID>";  
var appCertificate = "<YOUR APP CERTIFICATE>";  
```

```bash
cd node_modules/agora-token/server/  
npm i  
node DemoServer.js  
```

--------------------------------

### Get User Status Response Example

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/reference/channel-management-rest-api

This snippet demonstrates a successful response for the 'Get user status' API. It indicates if the user is in the channel and provides details like join timestamp, platform, and role.

```json
{
  "success": true,
  "data": {
    "join": 1640330382,
    "uid": 2845863044,
    "in_channel": true,
    "platform": 7,
    "role": 2
  }
}
```

--------------------------------

### Initialize and Mount Fastboard App

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

This code snippet demonstrates how to create a FastboardApp instance and join a whiteboard room. It requires SDK configuration, including app identifier and region, and room configuration with user ID, room UUID, and room token. The app is then mounted to an HTML element.

```javascript
import { createFastboard, mount } from "@netless/fastboard";  

let app;  
async function mountFastboard(div) {  

    app = await createFastboard({  

        sdkConfig: {  

            appIdentifier: "Your App Identifier",  

            region: "cn-hz",  

        },  

        joinRoom: {  

            uid: "User ID",  

            uuid: "Room UUID",  

            roomToken: "Room Token",  

        },  

        managerConfig: {  

            cursor: true,  

        },  

    });  

    window.app = app;  

 return mount(app, div);  

}  

mountFastboard(document.getElementById("app"));  

```

--------------------------------

### Start Recording

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference_platform=linux-cpp

Starts the media recording process.

```APIDOC
## startRecording

### Description
Starts recording.

### Method
(Implied by context, likely an action method)

### Endpoint
(Not applicable for this type of method)

### Parameters
(None)

### Request Example
(Not applicable for this type of method)

### Response
#### Success Response (0)
- **return_value** (int) - 0: The method call succeeds.

#### Error Response (< 0)
- **return_value** (int) - < 0: The method call fails.

#### Response Example
(Not applicable for this type of method)
```

--------------------------------

### Basic Real-Time Broadcast Streaming - Java

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

This Java code sample demonstrates the fundamental steps for real-time broadcast streaming using the Agora SDK. It includes initializing the RtcEngine, handling permissions, enabling video, setting up local video display, and joining a channel. The sample requires your Agora App ID, channel name, and a temporary token.

```java
package com.example.<projectname>import android.Manifest;import android.content.pm.PackageManager;import android.os.Bundle;import android.view.SurfaceView;import android.widget.FrameLayout;import android.widget.Toast;import androidx.annotation.NonNull;import androidx.appcompat.app.AppCompatActivity;import androidx.core.app.ActivityCompat;import androidx.core.content.ContextCompat;import io.agora.rtc2.ChannelMediaOptions;import io.agora.rtc2.Constants;import io.agora.rtc2.IRtcEngineEventHandler;import io.agora.rtc2.RtcEngine;import io.agora.rtc2.RtcEngineConfig;import io.agora.rtc2.video.VideoCanvas;public class MainActivity extends AppCompatActivity {    private static final int PERMISSION_REQ_ID = 22;    // Fill in the app ID from Agora Console    private String myAppId = "<Your app ID>";    // Fill in the channel name    private String channelName = "<Your channel name>";    // Fill in the temporary token generated from Agora Console    private String token = "<Your token>";    private RtcEngine mRtcEngine;    private final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {        // Callback when successfully joining the channel        @Override        public void onJoinChannelSuccess(String channel, int uid, int elapsed) {            super.onJoinChannelSuccess(channel, uid, elapsed);            showToast("Joined channel " + channel);        }        // Callback when a remote user or host joins the current channel        @Override        public void onUserJoined(int uid, int elapsed) {            super.onUserJoined(uid, elapsed);            runOnUiThread(() -> {                // When a remote user joins the channel, display the remote video stream for the specified uid                setupRemoteVideo(uid);                showToast("User joined: " + uid); // Show toast for user joining            });        }        // Callback when a remote user or host leaves the current channel        @Override        public void onUserOffline(int uid, int reason) {            super.onUserOffline(uid, reason);            runOnUiThread(() -> {                showToast("User offline: " + uid); // Show toast for user going offline            });        }    };    @Override    protected void onCreate(Bundle savedInstanceState) {        super.onCreate(savedInstanceState);        setContentView(R.layout.activity_main);        if (checkPermissions()) {            startBroadcastStreaming();        } else {            requestPermissions();        }    }    private void requestPermissions() {        ActivityCompat.requestPermissions(this, getRequiredPermissions(), PERMISSION_REQ_ID);    }    private boolean checkPermissions() {        for (String permission : getRequiredPermissions()) {            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {                return false;            }        }        return true;    }    private String[] getRequiredPermissions() {        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {            return new String[]{                Manifest.permission.RECORD_AUDIO,                Manifest.permission.CAMERA,                Manifest.permission.READ_PHONE_STATE,                Manifest.permission.BLUETOOTH_CONNECT            };        } else {            return new String[]{                Manifest.permission.RECORD_AUDIO,                Manifest.permission.CAMERA            };        }    }    @Override    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {        super.onRequestPermissionsResult(requestCode, permissions, grantResults);        if (requestCode == PERMISSION_REQ_ID && checkPermissions()) {            startBroadcastStreaming();        }    }    private void startBroadcastStreaming() {        initializeAgoraVideoSDK();        enableVideo();        setupLocalVideo();        joinChannel();    }    private void initializeAgoraVideoSDK() {        try {            RtcEngineConfig config = new RtcEngineConfig();            config.mContext = getBaseContext();            config.mAppId = myAppId;            config.mEventHandler = mRtcEventHandler;            mRtcEngine = RtcEngine.create(config);        } catch (Exception e) {            throw new RuntimeException("Error initializing RTC engine: " + e.getMessage());        }    }    private void enableVideo() {        mRtcEngine.enableVideo();        mRtcEngine.startPreview();    }    private void setupLocalVideo() {        FrameLayout container = findViewById(R.id.local_video_vie
```

--------------------------------

### Response Body for Get Allow List - JSON Example

Source: https://docs.agora.io/en/agora-chat/restful-api/chatroom-management/manage-chatroom-allowlist

This is an example of a successful HTTP response body when retrieving a chatroom's allow list. It contains metadata and a 'data' field listing the allowed usernames.

```json
{
  "action": "get",
  "application": "5cf28979-XXXX-XXXX-b969-60141fb9c75d",
  "uri": "http://XXXX/XXXX/XXXX/chatrooms/XXXX/white/users",
  "entities": [],
  "data": [
    "wzy_test",
    "wzy_vivo",
    "wzy_huawei",
    "wzy_xiaomi",
    "wzy_meizu"
  ],
  "timestamp": 1594724947117,
  "duration": 3,
  "organization": "XXXX",
  "applicationName": "XXXX",
  "count": 5
}
```

--------------------------------

### Deploy and Run Go Backend Middleware

Source: https://docs.agora.io/en/broadcast-streaming/token-authentication/middleware-token-server

Steps to set up and run the Agora Go Backend Middleware, including cloning the repository, installing dependencies, configuring environment variables, and starting the server.

```APIDOC
## Deploy and Run Go Backend Middleware

### Description
This section details the process of setting up and running the Agora Go Backend Middleware. It covers cloning the repository, installing necessary dependencies, configuring environment variables, and finally, running the middleware server.

### Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AgoraIO-Community/agora-go-backend-middleware.git
    ```

2.  **Install dependencies**
    Ensure you have Go installed. Navigate to the project directory and run:
    ```bash
    cd agora-go-backend-middleware
    go mod download
    ```

3.  **Configure environment variables**
    Copy the example environment file and update it with your credentials:
    ```bash
    cp .env.example .env
    ```
    Update the following in `.env`:
    *   `APP_ID`: Your Agora App ID.
    *   `APP_CERTIFICATE`: Your Agora App Certificate.

4.  **Run the middleware**
    Start the server:
    ```bash
    go run cmd/main.go
    ```
    The middleware will run on a default port, e.g., `localhost:8080`.
```

--------------------------------

### OCaml: Make GET Request with Cohttp-Lwt-Unix

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Shows how to perform an HTTP GET request in OCaml using the Cohttp-Lwt-Unix library. This example illustrates setting headers and handling the response stream asynchronously with Lwt promises.

```ocaml
open Cohttp_lwt_unix
open Cohttp
open Lwt

let uri = Uri.of_string "http://api.sd-rtn.com/v2/ncs/ip"

let headers = Header.add_list (Header.init ()) [
  ("Authorization", "");
  ("Accept", "application/json");
]

let () = 
  Client.call ~headers `GET uri
  >>= fun (res, body_stream) ->
  (* Do stuff with the result *)
  Lwt.return_unit

```

--------------------------------

### Start Recording

Source: https://docs.agora.io/en/3.x/on-premise-recording/get-started/record-api

Start the recording process by joining a channel using the `joinChannel` method. This method requires channel details and configuration.

```APIDOC
## Start recording

### Description
After creating a recording instance, call the `joinChannel` method to join the channel and start recording. The SDK starts recording when detecting other users in the channel. If `triggerMode` is `MANUALLY_MODE`, you need to call `startService` to begin recording manually.

### Method
`joinChannel`

### Endpoint
N/A (Method call)

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **channelKey** (string) - Optional. The token used in the channel. Required if the channel uses a token.
- **channelId** (string) - Mandatory. The name of the channel to be recorded.
- **uid** (unsigned int) - Mandatory. User ID. A 32-bit unsigned integer ranging from 1 to (2^32-1) that is unique in a channel. If set to 0, the SDK assigns a uid.
- **config** (RecordingConfig) - Optional. The recording configuration. See `RecordingConfig` for details.

### Request Example
```c++
RecordingConfig config = {<prepare>};
engine->joinChannel(channelKey, channelId, uid, config);
```

### Response
#### Success Response (200)
Indicates successful joining of the channel and initiation of recording (or readiness for manual start).

#### Response Example
```json
{
  "status": "joined_channel"
}
```

### Additional Actions
- **Start Recording Manually:** If `triggerMode` is `MANUALLY_MODE` in `RecordingConfig`, call `startService()`.
  ```c++
  engine->startService();
  ```
- **Pause Recording Manually:** Call `stopService()`.
  ```c++
  engine->stopService();
  ```
```

--------------------------------

### Get Channel Ban Rules Request URL

Source: https://docs.agora.io/en/3.x/video-calling/reference/channel-management-rest-api

This example demonstrates how to construct a GET request URL to retrieve a list of all channel ban rules. It includes the base endpoint and the required 'appid' query parameter.

```http
GET https://api.agora.io/dev/v1/kicking-rule?appid=YOUR_APP_ID
```

--------------------------------

### Start Cloud Recording (curl)

Source: https://docs.agora.io/en/cloud-recording/get-started/getstarted

Starts a recording session using the `start` method within five minutes of acquiring a resource ID. Supports individual or composite recording modes. Returns a recording ID (sid) upon success. Requires parameters like channel name, user ID, token, and storage configuration.

```curl
# Replace <appid> with the App ID of your Agora project  
# Replace <resourceid> with the resource ID obtained through the acquire method  
# Replace "<mode>" with "individual" for individual recording or "composite" for composite recording  

curl --location --request POST  'https://api.agora.io/v1/apps/<appid>/cloud_recording/resourceid/<resourceid>/mode/<mode>/start' \
# Replace <Authorization> with the Base64-encoded credential in basic HTTP authentication  
--header 'Authorization: Basic <Authorization>' \
--header 'Content-Type: application/json' \
--data-raw '{  
    # Replace <YourChannelName> with the name of the channel you need to record.  
    "cname": "<YourChannelName>",  
	# Replace <YourRecordingUID> with your user ID that identifies the recording service.  
    "uid": "<YourRecordingUID>",  
    "clientRequest": {  
		# Replace <YourToken> with the temporary token you obtain from the console.  
	    "token": "<YourToken>",  
		# Set the storageConfig related parameters.  
        "storageConfig": {  
			"secretKey": "<YourSecretKey>",  
			"vendor": 0,  
			"region": 0,  
			"bucket": "<YourBucketName>",  
			"accessKey": "<YourAccessKey>"  
        },  
		# Set the recordingConfig related parameters.  
        "recordingConfig": {  
		   # Which is consistent with the "channelType" of the Agora <Vg k="VSDK" />.  
            "channelType": 0  
        }  
    }  
}'  
```

--------------------------------

### Request Example for Getting All Classroom Events (cURL)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

This cURL command demonstrates how to make a GET request to retrieve all events from classrooms associated with a specific App ID. It includes the necessary URL parameters for region and App ID, and an Authorization header.

```bash
curl -X GET 'https://api.sd-rtn.com/{region}/edu/polling/apps/{yourAppId}/v2/rooms/sequences' \
-H 'Authorization: agora token={educationToken}' \

```

--------------------------------

### Import Packages for Tool Management (Python)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This snippet imports necessary modules for implementing tool management functionality. It includes abstract base classes, JSON handling, logging, typing utilities, data classes, Pydantic models, and a custom logger setup.

```python
import abc
import json
import logging
from typing import Any, Callable, assert_never

from attr import dataclass
from pydantic import BaseModel

from logger import setup_logger

# Set up the logger with color and timestamp support
logger = setup_logger(name=__name__, log_level=logging.INFO)
```

--------------------------------

### Agora Billing API Request Example

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/usage

This snippet demonstrates an example HTTP GET request to the Agora Billing API to retrieve billing information for a given time range. It requires parameters for timestamps, page number, API key, and signature.

```http
GET https://{host}/bill?fromTs={ts}&toTs={ts}&pageNum={pageNum}&apiKey={apiKey}&signature={signature}  
```

--------------------------------

### Stop Agent API

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Stops the agent that was previously started.

```APIDOC
## POST /stop_agent

### Description
This API stops the agent you started.

### Method
POST

### Endpoint
/stop_agent

### Parameters
#### Request Body
- **channel_name** (string) - Required - Use the same channel name you used to start the agent.

### Request Example
```json
{
  "channel_name": "test"
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the agent has stopped successfully.

#### Response Example
```json
{
  "message": "Agent stopped successfully"
}
```
```

--------------------------------

### Run React Native Chat UI Kit Example App on Android

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Compiles and runs the React Native Chat UI Kit example app on an Android device or emulator. This command navigates to the example directory and executes the Android build script.

```bash
cd example && yarn run Android
```

--------------------------------

### Java: Make GET Request with OkHttp

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Shows how to make an HTTP GET request in Java using the OkHttp library. This example details creating an OkHttpClient, building a Request object with the URL and headers, and executing the call.

```java
import okhttp3.*;
import java.io.IOException;

OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
  .url("http://api.sd-rtn.com/v2/ncs/ip")
  .get()
  .addHeader("Authorization", "")
  .addHeader("Accept", "application/json")
  .build();

try {
    Response response = client.newCall(request).execute();
    // Process response
    System.out.println(response.body().string());
} catch (IOException e) {
    e.printStackTrace();
}

```

--------------------------------

### Create Basic HTML User Interface for Agora Web SDK

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This HTML code sets up a simple user interface for the Agora Web SDK, including buttons to join as a host or audience, and to leave the channel. It also includes a script tag to link the main JavaScript file for SDK integration. No external dependencies are required for this HTML structure itself.

```html
<!DOCTYPE html><html lang="en">    <head>        <meta charset="UTF-8" />        <title>Agora Web SDK Quickstart</title>    </head>    <body>        <h2 class="left-align">Agora Web SDK Quickstart</h2>        <div class="row">            <div>                <button type="button" id="host-join">Join as host</button>                <button type="button" id="audience-join">Join as audience</button>                <button type="button" id="leave">Leave</button>            </div>        </div>        <!-- Include the JavaScript file -->        <script type="module" src="/src/main.js"></script>    </body></html>
```

--------------------------------

### Kotlin: Make GET Request with OkHttp

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This Kotlin snippet shows how to make an HTTP GET request using the OkHttp library, similar to the Java example. It details creating the client, building the request with URL and headers, and executing the call.

```kotlin
import okhttp3.*
import java.io.IOException

val client = OkHttpClient()
val request = Request.Builder()
  .url("http://api.sd-rtn.com/v2/ncs/ip")
  .get()
  .addHeader("Authorization", "")
  .addHeader("Accept", "application/json")
  .build()

try {
    val response = client.newCall(request).execute()
    // Process response
    println(response.body?.string())
} catch (e: IOException) {
    e.printStackTrace()
}

```

--------------------------------

### Setup Instance in Signaling 2.x (Java)

Source: https://docs.agora.io/en/signaling/overview/migration-guide

Demonstrates how to create and release an RtmClient instance using RtmConfig. This is a fundamental step for initializing and cleaning up signaling services.

```java
RtmClient create(RtmConfig config)
// ...
RtmClient.release()
```

--------------------------------

### Get Chatroom Allow List - curl Example

Source: https://docs.agora.io/en/agora-chat/restful-api/chatroom-management/manage-chatroom-allowlist

This example demonstrates how to retrieve the list of users in a chatroom's allow list using curl. It requires an Authorization header with a Bearer token and specifies the Accept header as application/json.

```shell
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer YWMt4LqJIul7EeizhBO5TSO_UgAAAAAAAAAAAAAAAAAAAAGL4CTw6XgR6LaXXVmNX4QCAgMAAAFnG7GyAQBPGgDv4ENRUku7fg05Kev0a_aVC8NyA6O6PgpxIRjajSVN3g' 'http://XXXX/XXXX/XXXX/chatrooms/XXXX/white/users'
```

--------------------------------

### Import Core Libraries for Agora OpenAI Integration

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This Python code block imports essential libraries for building the realtime agent, including asyncio, base64, logging, os, and specific modules from agora, agora_realtime_ai_api, and other project files like logger, realtime, tools, and utils.

```python
import asyncio
import base64
import logging
import os
from builtins import anext
from typing import Any

from agora.rtc.rtc_connection import RTCConnection, RTCConnInfo
from attr import dataclass

from agora_realtime_ai_api.rtc import Channel, ChatMessage, RtcEngine, RtcOptions

from logger import setup_logger
from realtime.struct import (
    InputAudioBufferCommitted,
    InputAudioBufferSpeechStarted,
    InputAudioBufferSpeechStopped,
    ItemCreated,
    RateLimitsUpdated,
    ResponseAudioDelta,
    ResponseAudioDone,
    ResponseAudioTranscriptDelta,
    ResponseAudioTranscriptDone,
    ResponseContentPartAdded,
    ResponseContentPartDone,
    ResponseCreated,
    ResponseDone,
    ResponseOutputItemAdded,
    ResponseOutputItemDone,
    ServerVADUpdateParams,
    SessionUpdate,
    SessionUpdateParams,
    SessionUpdated,
    Voices,
    to_json
)
from realtime.connection import RealtimeApiConnection
from tools import ClientToolCallResponse, ToolContext
from utils import PCMWriter

```

--------------------------------

### Join a Channel API

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This section details how to join a channel using the Agora SDK, supporting roles like host and audience, and the parameters required for a successful join.

```APIDOC
## Join a Channel

### Description
Join a channel to participate in real-time audio and video communication. You can choose to join as a host or an audience member, each with different capabilities.

### Method
`client.join(appId, channel, token, uid)`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
*   **appId** (string) - Required - The App ID for your project.
*   **channel** (string) - Required - The name of the channel to join.
*   **token** (string) - Required - A dynamic key that authenticates a user when the client joins a channel.
*   **uid** (number) - Optional - A 32-bit signed integer that identifies a user in the channel. If set to 0, the SDK generates a random user ID.

### Request Example
```javascript
// Join as a host
async function joinAsHost() {
  await client.join(appId, channel, token, uid);
  client.setClientRole("host");
  await createLocalMediaTracks();
  await publishLocalTracks();
  displayLocalVideo();
}

// Join as audience
async function joinAsAudience() {
  await client.join(appId, channel, token, uid);
  let clientRoleOptions = { level: 2 };
  client.setClientRole("audience", clientRoleOptions);
}
```

### Response
#### Success Response (200)
Indicates a successful join to the channel.

#### Response Example
N/A (Success is indicated by the absence of errors during the join operation.)
```

--------------------------------

### Java: Make GET Request with Unirest

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This Java example utilizes the Unirest library to perform an HTTP GET request. It provides a concise way to set the URL, headers, and execute the request, retrieving the response body as a string.

```java
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;

HttpResponse<String> response = Unirest.get("http://api.sd-rtn.com/v2/ncs/ip")
  .header("Authorization", "")
  .header("Accept", "application/json")
  .asString();

// Process response
System.out.println(response.getBody());

```

--------------------------------

### Running the Agora Demo Agent (Bash)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command executes the demo agent using Python. It requires the `main` module and takes `channel_name` and `agent_uid` as parameters. Ensure the `realtime_agent` folder is updated and environment variables are set.

```bash
python3 -m main agent --channel_name=<channel_name> --uid=<agent_uid>
```

--------------------------------

### Java: Make GET Request with NetHttp

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This Java example uses the built-in HttpClient and HttpRequest classes (Java 11+) to make an HTTP GET request. It demonstrates building the request with headers and executing it to receive a string response.

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://api.sd-rtn.com/v2/ncs/ip"))
    .header("Authorization", "")
    .header("Accept", "application/json")
    .method("GET", HttpRequest.BodyPublishers.noBody())
    .build();

HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());

```

--------------------------------

### On-Premise Recording SDK Linux C++ Setup

Source: https://docs.agora.io/en/3.x/on-premise-recording/overview/release-notes

This section provides a general mention of the Linux C++ version for the On-Premise Recording SDK. Specific code examples are not provided in this context.

```text
On-Premise Recording
Linux C++
Version 3.x
```

--------------------------------

### Get Thread Users Example (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/manage-thread-members

Demonstrates how to retrieve a list of users from a specific thread using a GET request. Requires an Authorization header with a Bearer token.

```bash
curl -X GET http://XXXX.com/XXXX/testapp/thread/177916702949377/users -H 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### Initialize Audio SDK Engine and Event Handler (C#)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk

This C# method is intended to be called during the initialization phase of a Unity game, typically in the Start method. It sets up the Agora Voice SDK engine and configures the event handler for receiving SDK callbacks. Ensure `SetupAudioSDKEngine` and `InitEventHandler` are defined elsewhere.

```csharp
void Start() {
 SetupAudioSDKEngine();
 InitEventHandler();
}
```

--------------------------------

### PHP: Make GET Request with cURL

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This PHP example demonstrates making an HTTP GET request using the cURL extension. It shows how to initialize cURL, set various options including URL, headers, and request method, and then execute the request.

```php
<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "http://api.sd-rtn.com/v2/ncs/ip",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_HTTPHEADER => [
    "Accept: application/json",
    "Authorization: "
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #." . $err;
} else {
  echo $response;
}
?>
```

--------------------------------

### List Cloud Players API Request Example (HTTP)

Source: https://docs.agora.io/en/media-pull/reference/restful-api

This example demonstrates the HTTP GET request to query and list all cloud players within a project. The request only requires the project's App ID in the URL path. Authentication is handled via headers.

```http
GET https://api.agora.io/v1/projects/{appId}/cloud-player/players
```

--------------------------------

### Start Video Calling Process (Kotlin)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

Orchestrates the process of starting video calling by initializing the Agora SDK, enabling video, setting up the local video preview, and joining the communication channel. This function is called after permissions are granted.

```kotlin
private fun startVideoCalling() {
    initializeAgoraVideoSDK()
    enableVideo()
    setupLocalVideo()
    joinChannel()
}
```

--------------------------------

### Create and Initialize Agora Cloud Transcoding Client in Go

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

Creates and initializes the Agora Cloud Transcoding client using provided configuration. This involves setting the App ID, authentication credentials, server region, and log level. The client is essential for interacting with the Agora Cloud Transcoding service. Error handling is included for client creation.

```go
config := &agora.Config{
  AppID:      appId,
  Credential: auth.NewBasicAuthCredential(username, password),
 // Specify the region where the server is located. Options include US, EU, AP, CN.
 // The client automatically switches to use the best domain based on the configured region.
  DomainArea: domain.US,
 // Specify the log output level. Options include DebugLevel, InfoLevel, WarningLevel, ErrLevel.
 // To disable log output, set logger to DiscardLogger.
  Logger: agoraLogger.NewDefaultLogger(agoraLogger.DebugLevel),
}

client, err := cloudtranscoder.NewClient(config)
if err != nil {
  log.Fatal(err)
}

```

--------------------------------

### Connect to Agora and OpenAI Realtime API (Python)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Sets up a connection to an Agora channel and an OpenAI Realtime API session. It configures session parameters like system messages and voice settings, and uses asynchronous tasks for listening to session events and updating conversation configuration. Dependencies include `RtcEngine`, `RtcOptions`, `InferenceConfig`, `ToolContext`, and `RealtimeApiConnection`.

```python
 @classmethod  
 async def setup_and_run_agent(  
 cls,  
 *,  
 engine: RtcEngine,  
 options: RtcOptions,  
 inference_config: InferenceConfig,  
 tools: ToolContext | None,  
    ) -> None:  
        channel = engine.create_channel(options)  
 await channel.connect()  
  
 try:  
 async with RealtimeApiConnection(  
 base_uri="wss://api.openai.com",  
 api_key=os.getenv("OPENAI_API_KEY"),  
 verbose=False,  
            ) as connection:  
 await connection.send_request(  
                    SessionUpdate(  
 session=SessionUpdateParams(  
 # MARK: check this  
 turn_detection=inference_config.turn_detection,  
 tools=tools.model_description() if tools else [],  
 tool_choice="auto",  
 input_audio_format="pcm16",  
 output_audio_format="pcm16",  
 instructions=inference_config.system_message,  
 voice=inference_config.voice,  
 model=os.environ.get("OPENAI_MODEL", "gpt-4o-realtime-preview"),  
 modalities=["text", "audio"],  
 temperature=0.8,  
 max_response_output_tokens="inf",  
                        )  
                    )  
                )  
  
                start_session_message = await anext(connection.listen())  
 # assert isinstance(start_session_message, messages.StartSession)  
                logger.info(  
 f"Session started: {start_session_message.session.id} model: {start_session_message.session.model}"  
                )  
  
                agent = cls(  
 connection=connection,  
 tools=tools,  
 channel=channel,  
                )  
 await agent.run()  
  
finally:  
 await channel.disconnect()  
 await connection.close()  

```

--------------------------------

### Agora Usage API Request Example

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/usage

This snippet demonstrates an example HTTP GET request to the Agora Usage API to retrieve usage data within a specified time range. It includes query parameters for timestamps, page number, API key, and signature.

```http
GET https://api.agora.io/usage?fromTs=1619913600&toTs=1619917200&pageNum=1&apiKey=pz*************gd&signature=SF*************3D HTTP/1.1  
```

--------------------------------

### API Comparison: On-Premise Recording SDK 4.x vs 3.x

Source: https://docs.agora.io/en/on-premise-recording/reference/migration-guide

A comparison of key APIs between the On-Premise Recording SDK versions 4.x and 3.x, covering instance creation, channel joining, subscription logic, recording control, and watermarking.

```APIDOC
## API Comparison: On-Premise Recording SDK 4.x vs 3.x

This section details the differences in API calls between version 4.x and earlier versions of the On-Premise Recording SDK.

### Create and Initialize a Recording Instance

**4.x API:**
- `createAgoraService`
- `IAgoraService::initialize`
- `createAgoraMediaComponentFactory`
- `createMediaRtcRecorder`
- `IAgoraMediaRtcRecorder::initialize`

**Older Versions API:**
- `createAgoraRecordingEngine`

### Join a Channel

**4.x API:**
- `joinChannel`
  - If the String UID function is enabled, you can directly use the String UID to pass parameters when calling `joinChannel`, without calling other APIs.

**Older Versions API:**
- `joinChannel`
- `joinChannelWithUserAccount`
- `getUserInfoByUserAccount`
- `getUserInfoByUid`

### Implement Subscription Logic

**4.x API:**
- `subscribeAllAudio`
- `unsubscribeAllAudio`
- `subscribeAllVideo`
- `unsubscribeAllVideo`
- `subscribeAudio`
- `unsubscribeAudio`
- `subscribeVideo`
- `unsubscribeVideo`

**Older Versions API:**
- Use the following fields in `RecordingConfig` when calling `joinChannel`:
  - `autoSubscribe`
  - `subscribeVideoUids`
  - `subscribeAudioUids`

### Start or Stop Recording

**4.x API:**
**Individual recording:**
- `startSingleRecordingByUid`
- `stopSingleRecordingByUid`
- `setRecorderConfigByUid`

**Composite recording:**
- `startRecording`
- `stopRecording`
- `setRecordingConfig`
  - Use with `enable_mix` set in `initialize`

**Older Versions API:**
- `startService`
- `stopService`
  - Use with `isMixingEnabled` in `RecordingConfig`

### Watermark

**4.x API:**
- `enableAndUpdateVideoWatermarks`
- `disableVideoWatermarks`
- `enableAndUpdateVideoWatermarksByUid`
- `disableVideoWatermarksByUid`

**Older Versions API:**
- Use `updateWatermarkConfigs` with `wm_num` and `wm_configs` in `VideoMixingLayout`
```

--------------------------------

### Get Channel Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Retrieves the metadata of a specified channel.

```APIDOC
## GET /channels/{channelName}/metadata

### Description
Retrieves the metadata of a specified channel.

### Method
GET

### Endpoint
/channels/{channelName}/metadata

### Parameters
#### Path Parameters
- **channelName** (string) - Required - Channel name.
- **channelType** (RtmChannelType) - Required - Channel type. See Channel Type.

### Request Example
```json
{
    "channelName": "channel_name",
    "channelType": "MESSAGE"
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field.
- **channelName** (string) - Channel name.
- **channelType** (RtmChannelType) - Channel type.
- **data** (Array<object>) - Array of Metadata Items.
  - **key** (string) - Metadata Item key.
  - **value** (string) - Metadata Item value.
  - **revision** (number) - Metadata Item version.
  - **updatedTs** (string) - Last updated timestamp.
  - **authorUserId** (string) - User ID of the last editor.

#### Response Example
```json
{
    "timestamp": 1678886400,
    "channelName": "channel_name",
    "channelType": "MESSAGE",
    "data": [
        {
            "key": "Apple",
            "value": "100",
            "revision": 174298200,
            "updatedTs": "2023-03-15T10:00:00Z",
            "authorUserId": "user123"
        }
    ]
}
```

#### Error Response
- **error** (boolean) - Whether the operation failed.
- **reason** (string) - Name of the API that triggered the error.
- **operation** (string) - Operation code.
- **errorCode** (number) - Error code.
```

--------------------------------

### Go: Agora Cloud Transcoder - Acquire and Create Task

Source: https://docs.agora.io/en/cloud-transcoding/get-started/quickstart

This Go code snippet demonstrates how to initialize the Agora Cloud Transcoder client, acquire an instance, and create a transcoding task. It configures audio inputs and outputs with specific RTC parameters. Ensure you replace placeholder values like '<your_app_id>' with your actual credentials. The SDK requires the 'agora-rest-client-go' library.

```go
package main

import (
 "context"
 "log"
 "time"

 "github.com/AgoraIO-Community/agora-rest-client-go/agora"
 "github.com/AgoraIO-Community/agora-rest-client-go/agora/auth"
 "github.com/AgoraIO-Community/agora-rest-client-go/agora/domain"
 agoraLogger "github.com/AgoraIO-Community/agora-rest-client-go/agora/log"
 "github.com/AgoraIO-Community/agora-rest-client-go/services/cloudtranscoder"
 cloudTranscoderAPI "github.com/AgoraIO-Community/agora-rest-client-go/services/cloudtranscoder/api"
)

// Define key parameters
const (
 appId             = "<your_app_id>"
 token             = "<your_token>" // Token for the transcoder in the input channel
 username          = "<your_customer_key>" // Your customer ID
 password          = "<your_customer_secret>" // Your customer secret
 inputChannelName  = "show" // Channel name for the input stream
 inputUId          = 0 // User ID for the input stream
 inputToken        = "<your_token>" // Token for the input stream user
 outputChannelName = "show" // Channel name for the output stream
 outputUId         = 0 // User ID for the transcoder in the output channel
 outputToken       = "<your_token>" // Token for the transcoder in the output channel
 instanceId        = "quickstart" // Instance ID of the transcoder
)

func main() {
 // Initialize Agora Config
 config := &agora.Config{
 AppID:      appId,
 Credential: auth.NewBasicAuthCredential(username, password),
 // Specify the region where the server is located. Options include CN, EU, AP, US.
 // The client will automatically switch to use the best domain based on the configured region.
 DomainArea: domain.CN,
 // Specify the log output level. Options include DebugLevel, InfoLevel, WarningLevel, ErrLevel.
 // To disable log output, set logger to DiscardLogger.
 Logger: agoraLogger.NewDefaultLogger(agoraLogger.DebugLevel),
 }

 client, err := cloudtranscoder.NewClient(config)
 if err != nil {
 log.Fatal(err)
 }

 // Call the Acquire API of the cloud transcoder service client
 acquireResp, err := client.Acquire(context.TODO(), &cloudTranscoderAPI.AcquireReqBody{
 InstanceId: instanceId,
 })
 if err != nil {
 log.Fatalln(err)
 }
 if acquireResp.IsSuccess() {
 log.Printf("acquire success:%+v\n", acquireResp)
 } else {
 log.Fatalf("acquire failed:%+v\n", acquireResp)
 }

 tokenName := acquireResp.SuccessResp.TokenName

 if tokenName == "" {
 log.Fatalln("tokenName is empty")
 }

 log.Printf("tokenName:%s\n", tokenName)

 // Create a cloud transcoding task and start cloud transcoding
 createResp, err := client.Create(context.TODO(), tokenName, &cloudTranscoderAPI.CreateReqBody{
 Services: &cloudTranscoderAPI.CreateReqServices{
 CloudTranscoder: &cloudTranscoderAPI.CloudTranscoderPayload{
 ServiceType: "cloudTranscoderV2",
 Config: &cloudTranscoderAPI.CloudTranscoderConfig{
 Transcoder: &cloudTranscoderAPI.CloudTranscoderConfigPayload{
 IdleTimeout: 300,
 AudioInputs: []cloudTranscoderAPI.CloudTranscoderAudioInput{
 {
 Rtc: &cloudTranscoderAPI.CloudTranscoderRtc{
 RtcChannel: inputChannelName,
 RtcUID:     inputUId,
 RtcToken:   inputToken,
 },
 },
 },
 Outputs: []cloudTranscoderAPI.CloudTranscoderOutput{
 {
 Rtc: &cloudTranscoderAPI.CloudTranscoderRtc{
 RtcChannel: outputChannelName,
 RtcUID:     outputUId,
 RtcToken:   outputToken,
 },
 AudioOption: &cloudTranscoderAPI.CloudTranscoderOutputAudioOption{
 ProfileType: "AUDIO_PROFILE_MUSIC_STANDARD",
 },
 },
 },
 },
 },
 },
 })
 if err != nil {
 log.Fatalln(err)
 }

 if createResp.IsSuccess() {
 log.Printf("create success:%+v\n", createResp)
 } else {
 log.Printf("create failed:%+v\n", createResp)
 return
 }

 taskId := createResp.SuccessResp.TaskID

 if taskId == "" {
 // Handle empty taskId if necessary
 }
}
```

--------------------------------

### Basic PublishAsync Usage Example (C#)

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Demonstrates a basic implementation of the PublishAsync method to send a 'Hello World' message to a channel named 'my_channel'. It includes error handling to log success or failure.

```csharp
var message = "Hello World";
var channelName = "my_channel";
var options = new PublishOptions();
options.customType = "PlainText";

var (status,response) = await rtmClient.PublishAsync(channelName, message, options);
if (status.Error)
{
    Debug.Log(string.Format("{0} is failed, ErrorCode: {1}, due to: {2}", status.Operation, status.ErrorCode, status.Reason));
}
else
{
    Debug.Log("Publish Message Success!");
}
```

--------------------------------

### Install and Import Agora Signaling 2.x SDK via npm

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=web

This snippet demonstrates how to install the Agora Signaling 2.x SDK using npm and then import it into your JavaScript application. This is suitable for projects using the npm package manager.

```bash
npm install agora-rtm-sdk
```

```javascript
import AgoraRTM from 'agora-rtm-sdk';
```

--------------------------------

### PHP: Make GET Request with GuzzleHttp

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Shows how to make an HTTP GET request in PHP using the GuzzleHttp client. This example demonstrates creating a Guzzle client instance, making a request with specified headers, and accessing the response body.

```php
<?php
require 'vendor/autoload.php'; // Assuming Guzzle is installed via Composer

use GuzzleHttp\Client;

$client = new Client();

$response = $client->request('GET', 'http://api.sd-rtn.com/v2/ncs/ip', [
  'headers' => [
    'Accept' => 'application/json',
    'Authorization' => '',
  ],
]);

echo $response->getBody();
?>
```

--------------------------------

### Get Go Project Dependencies

Source: https://docs.agora.io/en/1.x/signaling/develop/authentication-workflow

This command downloads and installs all the dependencies required by your Go project, as listed in the `go.mod` file. Running this after `go mod init` or when dependencies change ensures your project has all the necessary libraries to build and run.

```shell
go get
```

--------------------------------

### GET /cloud_recording/status

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Retrieves the status of a cloud recording session. This endpoint allows querying the current state and recorded file information of an ongoing or completed recording.

```APIDOC
## GET /cloud_recording/status

### Description
Retrieves the status of a cloud recording session. This endpoint allows querying the current state and recorded file information of an ongoing or completed recording.

### Method
GET

### Endpoint
/cloud_recording/status

### Parameters
#### Query Parameters
- **resourceId** (string) - Required - The resource ID of the recording session.
- **sid** (string) - Required - The session ID of the recording.
- **mode** (string) - Required - The mode of the recording (e.g., "mix").

### Request Example
```
http://localhost:8080/cloud_recording/status?resourceId=your-resource-id&sid=your-sid&mode=mix
```

### Response
#### Success Response (200)
- **resourceId** (string) - The resource ID of the recording session.
- **sid** (string) - The session ID of the recording.
- **serverResponse** (object) - Server response details.
  - **fileListMode** (string) - The mode of the file list.
  - **fileList** (array) - A list of recorded files.
    - **fileName** (string) - The name of the recorded file.
    - **trackType** (string) - The type of track (e.g., "audio", "video").
    - **uid** (string) - The user ID associated with the track.
    - **mixedAllUser** (boolean) - Indicates if all users were mixed into this file.
    - **isPlayable** (boolean) - Indicates if the file is playable.
    - **sliceStartTime** (number) - The start time of the recording slice.
- **timestamp** (string) - The timestamp of the status query.

#### Response Example
```json
{
  "resourceId": "string",
  "sid": "string",
  "serverResponse": {
    "fileListMode": "string",
    "fileList": [
      {
        "fileName": "string",
        "trackType": "string",
        "uid": "string",
        "mixedAllUser": true,
        "isPlayable": true,
        "sliceStartTime": 1678886400
      }
    ]
  },
  "timestamp": "string"
}
```
```

--------------------------------

### Create an Interactive Whiteboard Room

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This endpoint is used on your app server to create a new Interactive Whiteboard room. It requires an SDK token and returns a room UUID upon successful creation.

```APIDOC
## POST /v5/rooms

### Description
Creates a new Interactive Whiteboard room. This is a server-side operation required before clients can join a room.

### Method
POST

### Endpoint
https://api.netless.link/v5/rooms

### Parameters
#### Headers
- **token** (string) - Required - Your SDK Token obtained from the Agora Console.
- **Content-Type** (string) - Required - Must be `application/json`.
- **region** (string) - Required - The region for the room (e.g., `us-sv`).

#### Request Body
- **isRecord** (boolean) - Optional - Whether to enable recording for the room. Defaults to `false`.

### Request Example
```json
{
  "method": "POST",
  "url": "https://api.netless.link/v5/rooms",
  "headers": {
    "token": "Your SDK Token",
    "Content-Type": "application/json",
    "region": "us-sv"
  },
  "body": {
    "isRecord": false
  }
}
```

### Response
#### Success Response (200)
- **uuid** (string) - The unique identifier of the created room.
- **teamUUID** (string) - Your team's UUID.
- **appUUID** (string) - The UUID of the associated application.
- **isBan** (boolean) - Indicates if the room is banned.
- **createdAt** (string) - The timestamp when the room was created.
- **limit** (integer) - The user limit for the room (0 means no limit).

#### Response Example
```json
{
  "uuid": "4a50xxxxxx796b",
  "teamUUID": "RMmLxxxxxx15aw",
  "appUUID": "i54xxxxxx1AQ",
  "isBan": false,
  "createdAt": "2021-01-18T06:56:29.432Z",
  "limit": 0
}
```
```

--------------------------------

### Install Go Dependencies

Source: https://docs.agora.io/en/3.x/on-premise-recording/develop/authentication-workflow

This command installs the necessary dependencies for the Go project. Specifically, it fetches the Agora Dynamic Key library required for building RTC tokens.

```bash
go get github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/go/src/rtctokenbuilder2
```

--------------------------------

### Start Web Recording with Configurations (curl)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

This example demonstrates how to initiate a web recording in an Agora Education SDK room using a curl command. It specifies the recording mode, URL for the web content, and retry timeout. The request includes necessary headers for content type and authorization.

```shell
curl -X PUT 'https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/test_class/records/states/1' \
-H 'Content-Type: application/json;charset=UTF-8' \
-H 'Authorization: agora token={educationToken}' \
--data-raw '{  
    "mode": "web",  
    "webRecordConfig": {  
        "url": "https://webdemo.agora.io/xxxxx/?userUuid={recorder_id}&roomUuid={room_id_to_be_recorded}&roleType=0&roomType=4&pretest=false&rtmToken={recorder_token}&language=en&appId={your_app_id}",  
        "rootUrl": "https://xxx.yyy.zzz",  
        "publishRtmp": "true"  
    },  
    "retryTimeout": 60  
}'
```

--------------------------------

### RTM SDK Initialization with Configuration

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Example demonstrating how to initialize the RTM SDK with various configuration options like proxy, logging, and encryption.

```APIDOC
## RTM SDK Initialization with Configuration

### Description
This example shows how to create and apply different configuration objects to initialize the RTM SDK.

### Method
* Client-side SDK usage (not a direct API endpoint)

### Endpoint
* N/A

### Parameters
* **proxyConfig** (RtmProxyConfig) - Optional - Proxy configuration.
* **logConfig** (RtmLogConfig) - Optional - Logging configuration.
* **encryptionConfig** (RtmEncryptionConfig) - Optional - Encryption configuration.
* **rtmConfig** (RtmConfig) - Main configuration object that includes other sub-configurations.

### Request Example
```dart
final proxyConfig = RtmProxyConfig(
      protocolType : RtmProxyType.http,
      server : "x.x.x.x",
      port : 8080,
      account : "Tony",
      password : "pwd"
);

final logConfig = RtmLogConfig(
      filePath : "xxxx",
      fileSizeInKB : 1024,
      level : RtmLogLevel.info
);

final encryptionConfig = RtmEncryptionConfig(
      encryptionMode : RtmEncryptionMode.aes256Gcm,
      encryptionKey : "XXXXX",
      encryptionSalt : [1,2,3,4,5]
);

final rtmConfig = RtmConfig(
      heartbeatInterval : 10,
      presenceTimeout : 5,
      proxyConfig : proxyConfig,
      logConfig : logConfig,
      areaCode : {RtmAreaCode.cn, RtmAreaCode.na},
      encryptionConfig : encryptionConfig
);

// Assuming RTM SDK initialization function exists
// RtmClient.create(appId, rtmConfig);
```

### Response
#### Success Response (200)
* Initialization success depends on the SDK's internal processes.

#### Response Example
* N/A
```

--------------------------------

### Setup Local Video Display (Java & Kotlin)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

Initializes the local video view by creating a SurfaceView, adding it to a container, and configuring it for display. This method ensures the local user's video is visible in the application. Dependencies include the Agora SDK and Android UI components.

```java
private void setupLocalVideo() {
    FrameLayout container = findViewById(R.id.local_video_view_container);
    SurfaceView surfaceView = new SurfaceView(getBaseContext());
    container.addView(surfaceView);
    mRtcEngine?.setupLocalVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0));
}
```

```kotlin
/**
 * Initializes the local video view and sets the display properties. * This method adds a SurfaceView to the local video container and configures it. */
private fun setupLocalVideo() {
    val container: FrameLayout = findViewById(R.id.local_video_view_container)
    val surfaceView = SurfaceView(baseContext)
    container.addView(surfaceView)
    mRtcEngine.setupLocalVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0));
}
```

--------------------------------

### Implement ScreenSharingClient for Starting and Stopping

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java code implements the ScreenSharingClient class, a singleton responsible for managing the screen sharing session. It handles binding to the ScreenSharingService, starting the screen sharing process by passing necessary parameters, and stopping the session.

```java
// Define the ScreenSharingClient object
public class ScreenSharingClient {
 private static final String TAG = ScreenSharingClient.class.getSimpleName();
 private static IScreenSharing mScreenShareSvc;
 private IStateListener mStateListener;
 private static volatile ScreenSharingClient mInstance;

 public static ScreenSharingClient getInstance() {
 if (mInstance == null) {
 synchronized (ScreenSharingClient.class) {
 if (mInstance == null) {
 mInstance = new ScreenSharingClient();
 }
            }
        }

 return mInstance;
    }

// Start screen sharing
public void start(Context context, String appId, String token, String channelName, int uid, VideoEncoderConfiguration vec) {
 if (mScreenShareSvc == null) {
 Intent intent = new Intent(context, ScreenSharingService.class);
 intent.putExtra(Constant.APP_ID, appId);
 intent.putExtra(Constant.ACCESS_TOKEN, token);
 intent.putExtra(Constant.CHANNEL_NAME, channelName);
 intent.putExtra(Constant.UID, uid);
 intent.putExtra(Constant.WIDTH, vec.dimensions.width);
 intent.putExtra(Constant.HEIGHT, vec.dimensions.height);
 intent.putExtra(Constant.FRAME_RATE, vec.frameRate);
 intent.putExtra(Constant.BITRATE, vec.bitrate);
 intent.putExtra(Constant.ORIENTATION_MODE, vec.orientationMode.getValue());
 context.bindService(intent, mScreenShareConn, Context.BIND_AUTO_CREATE);
        } else {
 try {
 mScreenShareSvc.startShare();
            } catch (RemoteException e) {
 e.printStackTrace();
 Log.e(TAG, Log.getStackTraceString(e));
            }
        }

    }

// Stop screen sharing
public void stop(Context context) {
 if (mScreenShareSvc != null) {
 try {
 mScreenShareSvc.stopShare();
 mScreenShareSvc.unregisterCallback(mNotification);
            } catch (RemoteException e) {
 e.printStackTrace();
 Log.e(TAG, Log.getStackTraceString(e));
            } finally {
 mScreenShareSvc = null;
            }
        }
 context.unbindService(mScreenShareConn);
    }
...
}
```

--------------------------------

### Get Channel Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves the metadata associated with a specified channel.

```APIDOC
## GET /channels/{channelName}/metadata

### Description
Retrieves the metadata of the specified channel.

### Method
GET

### Endpoint
/channels/{channelName}/metadata

### Parameters
#### Path Parameters
- **channelName** (String) - Required - The name of the channel.

#### Query Parameters
- **channelType** (RtmChannelType) - Required - The type of the channel (e.g., 'message').

### Request Example
```
(No request body for GET)
```

### Response
#### Success Response (200)
- **channelName** (String) - The name of the channel.
- **channelType** (RtmChannelType) - The type of the channel.
- **metadata** (List<MetadataItem>) - A list of metadata items for the channel.

#### Response Example
```json
{
  "channelName": "myChannel",
  "channelType": "message",
  "metadata": [
    {
      "key": "Apple",
      "value": "100",
      "revision": 174298200
    }
  ]
}
```

#### Error Response
- **error** (bool) - Indicates if an error occurred.
- **errorCode** (String) - The error code for the operation.
- **operation** (String) - The operation that failed.
- **reason** (String) - A brief description of the error reason.
```

--------------------------------

### Enable Video Module (Java & Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Enables the video module and starts the local video preview. Call `enableVideo()` to activate video functionality and `startPreview()` to display the local video feed. These are essential steps before joining a channel if video is intended.

```java
private void enableVideo() {
    mRtcEngine.enableVideo();
    mRtcEngine.startPreview();
}
```

```kotlin
private fun enableVideo() {
    mRtcEngine?.apply {
        enableVideo()
        startPreview()
    }
}
```

--------------------------------

### Clone React Native Chat UI Kit Repository

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Clones the official Agora Chat UI Kit for React Native repository from GitHub. This is the first step to get the example app.

```bash
git clone https://github.com/AgoraIO-Usecase/AgoraChat-UIKit-rn.git
```

--------------------------------

### Token Renewal

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Examples for renewing Signaling and RTC tokens when they are about to expire.

```APIDOC
## Token Renewal

### Description
This section covers the renewal of both Signaling and RTC tokens using the `renewToken` method.

### Signaling Token Renewal Example
```javascript
rtmClient.addEventListener('tokenPrivilegeWillExpire', async (channelName) => {
  if (!channelName) {
    // The RTM Token is about to expire
    const newToken = "<Your new token>";
    await rtmClient.renewToken(newToken);
  }
});
```

### RTC Token Renewal Example
```javascript
rtmClient.addEventListener('tokenPrivilegeWillExpire', async (streamChannelName) => {
  if (streamChannelName) {
    // The RTC Token is about to expire
    const newToken = "<Your new token>";
    await rtmClient.renewToken(newToken, {
      channelName: streamChannelName
    });
  }
});
```

### Return Value
#### Success Response
`RenewTokenResponse` object containing a `timestamp`.
```typescript
type RenewTokenResponse = {
    timestamp: number; // Timestamp of the successful operation.
}
```
#### Error Response
An `ErrorInfo` object is returned upon failure.
```

--------------------------------

### Run Sample to Receive H.264 Video and PCM Audio (Linux C++)

Source: https://docs.agora.io/en/server-gateway/get-started/compile-run-sample-project

Launches the `sample_receive_h264_pcm` project to receive media streams. Requires a temporary RTC token and channel ID. The console output shows subscription status and stream reception information.

```shell
# Run sample_receive_h264_pcm to receive video in H.264 format and audio in PCM format  
./sample_receive_h264_pcm --token YOUR_RTC_TOKEN --channelId demo_channel  
```

--------------------------------

### Enable Video Module API

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

This API enables the video module and starts the local video preview, preparing the client for video communication.

```APIDOC
## POST /enableVideo

### Description
Enables the video module and starts the local video preview.

### Method
POST

### Endpoint
/enableVideo

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{}
```

### Response
#### Success Response (200)
- **status** (string) - Indicates the successful enablement of the video module and preview.

#### Response Example
```json
{
  "status": "success"
}
```
```

--------------------------------

### Start Go Server and Handle Errors

Source: https://docs.agora.io/en/media-gateway/develop/receive-notifications

This Go snippet demonstrates how to start an HTTP server and log a fatal error if the server fails to start. It utilizes the standard Go 'net/http' and 'log' packages.

```go
if err := http.ListenAndServe(port, nil); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
```

--------------------------------

### Start Web Recording Configuration

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api

This example demonstrates how to initiate a web recording within a specified room. It includes details such as the recording mode, the URL for the web content to be recorded, and an optional retry timeout. The request uses the PUT method to update the recording state.

```curl
curl -X PUT 'https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/test_class/records/states/1' \
-H 'Content-Type: application/json;charset=UTF-8' \
-H 'Authorization: agora token={educationToken}' \
--data-raw '{ \
    "mode": "web", \
    "webRecordConfig": { \
        "url": "https://webdemo.agora.io/xxxxx/?userUuid={recorder_id}&roomUuid={room_id_to_be_recorded}&roleType=0&roomType=4&pretest=false&rtmToken={recorder_token}&language=en&appId={your_app_id}", \
        "rootUrl": "https://xxx.yyy.zzz", \
        "publishRtmp": "true" \
    }, \
    "retryTimeout": 60 \
}'
```

--------------------------------

### Retrieve Joined Chat Rooms Example (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/chatroom-management/manage-chatrooms

An example using cURL to demonstrate how to make a GET request to retrieve chat rooms a user has joined. It shows the necessary headers, including authorization, and the endpoint URL. Remember to replace placeholders like <YourAppToken>.

```bash
# Replace <YourAppToken> with the app token generated in your server.  
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer <YourAppToken>' 'http://XXXX/XXXX/XXXX/users/XXXX/joined_chatrooms'
```

--------------------------------

### Initialize and Start Go HTTP Server

Source: https://docs.agora.io/en/1.x/signaling/develop/authentication-workflow

This Go `main` function sets up the HTTP server. It defines a route handler for fetching RTM tokens at the `/fetch_rtm_token` endpoint. It then prints a message indicating the server is starting on port 8082 and attempts to start the HTTP listener. If an error occurs during startup, it logs the fatal error.

```Go
func main(){
    // Handling routes
    // Signaling token from Signaling uid
    http.HandleFunc("/fetch_rtm_token", rtmTokenHandler)

    fmt.Printf("Starting server at port 8082\n")

    if err := http.ListenAndServe(":8082", nil); err != nil {
        log.Fatal(err)
    }
}
```

--------------------------------

### Example: Retrieve Push Notification Settings (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/offline-push/offline-push-configuration

Example using cURL to retrieve push notification settings for a group chat. It demonstrates the GET request and necessary authorization header.

```bash
curl -L -X GET 'https://XXXX/XXXX/XXXX/users/{username}/notification/chatgroup/{key}' \
-H 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### Initialize Agora Engine on App Startup in Java

Source: https://docs.agora.io/en/iot/get-started/get-started-sdk

Override the onCreate method to ensure necessary permissions are granted and then initialize the Agora engine. This setup is crucial before sending audio or video streams.

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
  
    // If all the permissions are granted, setup the engine
    if (!checkSelfPermission()) {
        ActivityCompat.requestPermissions(this, REQUESTED_PERMISSIONS, PERMISSION_REQ_ID);
    }
    setupAgoraEngine();
}
```

--------------------------------

### Clone Agora API Examples Repository

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/compile-run-sample-project

This command clones the official Agora API-Examples repository from GitHub to your local machine. This repository contains sample projects for various Agora SDKs and platforms, including the Android Video SDK.

```bash
git clone git@github.com:AgoraIO/API-Examples.git
```

--------------------------------

### Python: HTTP Handler to Start an Agent

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This Python function serves as an HTTP request handler to start the RealtimeKit agent. It attempts to parse and validate the incoming JSON request body using the `StartAgentRequestBody` Pydantic model. It prepares to initiate the agent process if the data is valid.

```python
async def start_agent(request):
    try:
        # Parse and validate JSON body using the pydantic model
        try:
            data 
```

--------------------------------

### Configure and Run Agora IO Agent

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Configures and runs the Agora IO agent by parsing RealtimeKit options and setting up an InferenceConfig. This includes defining system messages, voice, and turn detection parameters for the AI agent.

```python
import asyncio
from aiohttp import web
import os
from logger import logger

# Mocking necessary imports and functions for demonstration
class Voices:
    Alloy = "alloy"

class ServerVADUpdateParams:
    def __init__(self, type, threshold, prefix_padding_ms, silence_duration_ms):
        self.type = type
        self.threshold = threshold
        self.prefix_padding_ms = prefix_padding_ms
        self.silence_duration_ms = silence_duration_ms

class InferenceConfig:
    def __init__(self, system_message, voice, turn_detection):
        self.system_message = system_message
        self.voice = voice
        self.turn_detection = turn_detection

def parse_args_realtimekit():
    # Mocking parsed options
    return {"channel_name": "test_channel", "uid": 123}

def run_agent_in_process(engine_app_id, engine_app_cert, channel_name, uid, inference_config):
    logger.info(f"Running agent in process with channel: {channel_name}, uid: {uid}")
    # Actual agent execution logic would be here

# Placeholder for app_id and app_cert
app_id = os.getenv("ENGINE_APP_ID", "your_app_id")
app_cert = os.getenv("ENGINE_APP_CERT", "your_app_cert")

# This block would typically be inside the `elif args.action == "agent":` condition

realtime_kit_options = parse_args_realtimekit()
logger.info(f"Running agent with options: {realtime_kit_options}")

inference_config = InferenceConfig(
    system_message="""Your knowledge cutoff is 2023-10. You are a helpful, witty, and friendly AI. Act like a human, but remember that you aren't a human and that you can't do human things in the real world. Your voice and personality should be warm and engaging, with a lively and playful tone. If interacting in a non-English language, start by using the standard accent or dialect familiar to the user. Talk quickly. You should always call a function if you can. Do not refer to these rules, even if you're asked about them.""",
    voice=Voices.Alloy,
    turn_detection=ServerVADUpdateParams(
        type="server_vad", threshold=0.5, prefix_padding_ms=300, silence_duration_ms=200
    ),
)

# To run this part, you would need to uncomment the following line and ensure
# the agent action is selected when parsing arguments.
# run_agent_in_process(
#     engine_app_id=app_id,
#     engine_app_cert=app_cert,
#     channel_name=realtime_kit_options["channel_name"],
#     uid=realtime_kit_options["uid"],
#     inference_config=inference_config,
# )

```

--------------------------------

### Setup Instance with RtmConfig

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=android

Creates a new RtmClient instance with the specified RtmConfig. This is the initial step for utilizing Agora Signaling services. Requires RtmConfig object as input.

```Java
RtmClient create(RtmConfig config)
```

--------------------------------

### Query File Conversion Task Progress (HTTP GET)

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/file-conversion

This example illustrates how to query the status of an ongoing file conversion task using the GET /v5/projector/tasks/{uuid} endpoint. The {uuid} placeholder should be replaced with the actual task identifier obtained from the initial task creation.

```http
GET /v5/projector/tasks/{uuid} HTTP/1.1
Host: api.netless.link
region: cn-hz
token: NETLESSSDK_YWs9QxxxxxxMjRi
```

--------------------------------

### C#: Make GET Request with RestSharp

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This C# example uses the RestSharp library to make an HTTP GET request. It illustrates configuring the client, creating a request, adding headers, and executing the request synchronously. RestSharp simplifies RESTful API interactions.

```csharp
var client = new RestClient("http://api.sd-rtn.com/v2/ncs/ip");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "");
request.AddHeader("Accept", "application/json");

IRestResponse response = client.Execute(request);

```

--------------------------------

### Basic HTML Structure for Whiteboard App (HTML)

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This HTML code sets up the basic structure for a web application that will host the Interactive Whiteboard. It includes a script tag to link the JavaScript file responsible for the app logic and a div element where the whiteboard will be rendered.

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="./joinWhiteboard.js"></script>
    </head>
    <body>
        <div id="whiteboard" style="width: 100%; height: 100vh;"></div>
    </body>
</html>
```

--------------------------------

### Get User State

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=ios

Retrieves the online status (custom state) of a user in a channel.

```APIDOC
## GET /presence/state

### Description
Fetches the current temporary status data for a user within a specified channel.

### Method
GET

### Endpoint
/presence/state

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel.
- **channelType** (enum) - Required - The type of the channel.
- **userId** (string) - Required - The ID of the user whose state is to be retrieved.

### Request Example
```
{
  "channelName": "your_channel",
  "channelType": "AgoraRtmChannelTypeMessage",
  "userId": "userId"
}
```

### Response
#### Success Response (200)
- **state** (object) - A key-value map representing the user's current status.

#### Response Example
```json
{
  "state": {
    "key1": "value1",
    "key2": "value2"
  }
}
```
```

--------------------------------

### Join a Channel as a Host - JavaScript

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This snippet demonstrates how to join an Agora channel as a host. It requires an App ID, channel name, authentication token, and user ID. After joining, it sets the client role to 'host', creates local media tracks, publishes them, and displays the local video. Dependencies include the AgoraRTC library.

```javascript
async function joinAsHost() {
 await client.join(appId, channel, token, uid);
 // A host can both publish tracks and subscribe to tracks
 client.setClientRole("host");
 // Create and publish local tracks
 await createLocalMediaTracks();
 await publishLocalTracks();
 displayLocalVideo();
}
```

--------------------------------

### Get User Channels

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=ios

Retrieves the list of channels a specified user is currently present in.

```APIDOC
## GET /presence/userChannels

### Description
Fetches a list of all channels a given user is currently joined or subscribed to.

### Method
GET

### Endpoint
/presence/userChannels

### Parameters
#### Query Parameters
- **userId** (string) - Required - The ID of the user whose channels are to be retrieved.

### Request Example
```
{
  "userId": "userId"
}
```

### Response
#### Success Response (200)
- **totalChannel** (integer) - The total number of channels the user is present in.
- **channels** (array of objects) - A list of channel information.
  - **channelName** (string) - The name of the channel.
  - **channelType** (enum) - The type of the channel.

#### Response Example
```json
{
  "totalChannel": 5,
  "channels": [
    {
      "channelName": "channelA",
      "channelType": "AgoraRtmChannelTypeMessage"
    },
    {
      "channelName": "channelB",
      "channelType": "AgoraRtmChannelTypeStream"
    }
  ]
}
```
```

--------------------------------

### Get User Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Retrieves the metadata and user metadata items for a specified user.

```APIDOC
## GET /getUserMetadata

### Description
Retrieves the metadata and user metadata items for a specified user.

### Method
GET

### Endpoint
`/getUserMetadata`

### Parameters
#### Query Parameters
- **userId** (string) - Optional - The user ID.

### Request Example
```json
{
  "userId": "Tony"
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Timestamp of the successful operation.
- **userId** (string) - User ID.
- **totalCount** (number) - Number of metadata items.
- **majorRevision** (number) - Version of metadata.
- **metadata** (Record<string, MetaDataDetail>) - JSON object containing metadata item.

`MetaDataDetail` properties:
- **value** (string) - Value of a metadata item.
- **revision** (number) - Version of a metadata item.
- **updated** (string) - Timestamp of the last update.
- **authorUid** (string) - User ID of the last editor.

#### Response Example
```json
{
  "timestamp": 1678886400,
  "userId": "Tony",
  "totalCount": 5,
  "majorRevision": 10,
  "metadata": {
    "key1": {
      "value": "value1",
      "revision": 1,
      "updated": "2023-03-15T10:00:00Z",
      "authorUid": "user123"
    }
  }
}
```
```

--------------------------------

### Storage APIs

Source: https://docs.agora.io/en/signaling/overview/migration-guide

APIs for managing metadata for channels and users, including setting, getting, updating, and removing.

```APIDOC
## Storage APIs

### Set Channel Metadata
Sets metadata for a specified channel.

### Method
`void setChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)`

### Get Channel Metadata
Retrieves metadata for a specified channel.

### Method
`void getChannelMetadata(String channelName, RtmChannelType channelType, ResultCallback<Metadata> resultCallback)`

### Remove Channel Metadata
Removes metadata from a specified channel.

### Method
`void removeChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)`

### Update Channel Metadata
Updates metadata for a specified channel.

### Method
`void updateChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)`

### Set User Attributes
Sets metadata attributes for a specific user.

### Method
`void setUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)`

### Get User Attributes
Retrieves metadata attributes for a specific user.

### Method
`void getUserMetadata(String userId, ResultCallback<Metadata> resultCallback)`

### Remove User Attributes
Removes metadata attributes for a specific user.

### Method
`void removeUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)`

### Update User Attributes
Updates metadata attributes for a specific user.

### Method
`void updateUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)`

### Subscribe User Attributes
Subscribes to metadata attribute updates for a specific user.

### Method
`void subscribeUserMetadata(String userId, ResultCallback<Void> resultCallback)`

### Unsubscribe User Attributes
Unsubscribes from metadata attribute updates for a specific user.

### Method
`void unsubscribeUserMetadata(String userId, ResultCallback<Void> resultCallback)`
```

--------------------------------

### Run the agora-token Demo Server

Source: https://docs.agora.io/en/broadcast-streaming/token-authentication/deploy-token-server

Installs dependencies and runs the demo server from the agora-token NPM package. Assumes you are in the `node_modules/agora-token/server` directory.

```bash
npm i  
node DemoServer.js  
```

--------------------------------

### ToolContext Class for Tool Management

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Manages the registration and execution of tools. It allows registering local functions and client-side pass-through functions, and provides an `execute_tool` method to handle tool calls. The `model_description` method returns a list of descriptions for all registered tools.

```python
import abc
import json
import logging
from dataclasses import dataclass
from typing import Any, Callable, Union

logger = logging.getLogger(__name__)

# Assuming LocalFunctionToolDeclaration, PassThroughFunctionToolDeclaration, ToolDeclaration, 
# LocalToolCallExecuted, ShouldPassThroughToolCall, and ExecuteToolCallResult are defined as above.

class ToolContext(abc.ABC):
    _tool_declarations: dict[str, ToolDeclaration]

    def __init__(self) -> None:
        # TODO should be an ordered dict
        self._tool_declarations = {}

    def register_function(
        self,
        *,
        name: str,
        description: str = "",
        parameters: dict[str, Any],
        fn: Callable[..., Any],
    ) -> None:
        self._tool_declarations[name] = LocalFunctionToolDeclaration(
            name=name, description=description, parameters=parameters, function=fn
        )

    def register_client_function(
        self,
        *,
        name: str,
        description: str = "",
        parameters: dict[str, Any],
    ) -> None:
        self._tool_declarations[name] = PassThroughFunctionToolDeclaration(
            name=name, description=description, parameters=parameters
        )

    async def execute_tool(self, tool_name: str, encoded_function_args: str) -> ExecuteToolCallResult | None:
        tool = self._tool_declarations.get(tool_name)
        if not tool:
            return None

        args = json.loads(encoded_function_args)
        assert isinstance(args, dict)

        if isinstance(tool, LocalFunctionToolDeclaration):
            logger.info(f"Executing tool {tool_name} with args {args}")
            result = await tool.function(**args)
            logger.info(f"Tool {tool_name} executed with result {result}")
            return LocalToolCallExecuted(json_encoded_output=json.dumps(result))

        if isinstance(tool, PassThroughFunctionToolDeclaration):
            return ShouldPassThroughToolCall(decoded_function_args=args)

        # This line is for type checking purposes if assert_never is available
        # from typing import assert_never 
        # assert_never(tool)
        return None # Fallback if assert_never is not used or available

    def model_description(self) -> list[dict[str, Any]]:
        return [v.model_description() for v in self._tool_declarations.values()]
```

--------------------------------

### Agora API License Request Example

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/usage

This snippet demonstrates an HTTP GET request to retrieve license information for a specific customer. It requires an API key and a signature for authentication and authorization.

```http
GET https://api.agora.io/customers/1234567/license?apiKey=pz*************gd&signature=SF*************3D HTTP/1.1
```

--------------------------------

### Setup Remote Video View for Joining User (Java)

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/quickstart-guide/start-video-streaming

Handles the setup of the video view for a remote user when they join the channel. It creates a SurfaceView, configures it for overlay rendering, adds it to the container, and then sets up the remote video stream using the provided user ID.

```java
private void setupRemoteVideo(int uid) {
    FrameLayout container = findViewById(R.id.remote_video_view_container);
    SurfaceView surfaceView = RtcEngine.CreateRendererView(getBaseContext());
    surfaceView.setZOrderMediaOverlay(true);
    container.addView(surfaceView);
    mRtcEngine.setupRemoteVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid));
}

```

--------------------------------

### Manually Copy Agora Signaling SDK Files (Android)

Source: https://docs.agora.io/en/1.x/signaling/reference/downloads

This outlines the manual process of integrating the Agora Signaling SDK by copying the necessary .jar file and native .so libraries to specific locations within an Android project. The .jar file goes into the app/libs directory, and the .so files are placed in the corresponding architecture subfolders under app/src/main/jniLibs.

```filepath
File or folder| Path in your project  
---|---  
Files|   
`agora-rtm_sdk.jar`| `/app/libs/`  
`/arm64-v8a/libagora-rtm-sdk-jni.so`| `~/app/src/main/jniLibs/arm64-v8a/  
`/armeabi-v7a/libagora-rtm-sdk-jni.so`| `~/app/src/main/jniLibs/armeabi-v7a/  
`/x86/libagora-rtm-jni.so`| `~/app/src/main/jniLibs/x86/  
`/x86_64/libagora-rtm-sdk-jni.so`| `~/app/src/main/jniLibs/x86_64/
```

--------------------------------

### Initialize Conversational AI Toolkit (Kotlin)

Source: https://docs.agora.io/en/conversational-ai/best-practices/audio-setup

Initializes the Conversational AI Toolkit by creating a configuration object with Video SDK and Signaling engine instances. This setup is necessary before calling other toolkit APIs.

```kotlin
val config = ConversationalAIAPIConfig(
    rtcEngine = rtcEngineInstance,
    rtmClient = rtmClientInstance,
    enableLog = true
)
val api = ConversationalAIAPIImpl(config)
```

--------------------------------

### Example Request to Query Specific User (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/push-notification-management

An example using cURL to make an HTTP GET request to retrieve a specific user's information from a push label. It demonstrates how to set the Authorization header.

```Shell
curl -L -X GET 'http://XXXX/XXXX/XXXX/push/label/post-90s/user/hx1' \
-H 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### C++ On-Premise Recording Workflow

Source: https://docs.agora.io/en/on-premise-recording/get-started/quickstart

This C++ code snippet illustrates the complete process of setting up and managing an on-premise audio and video recording using the Agora SDK. It includes initialization of the Agora service and recorder, subscription to streams, configuration of recording parameters, channel operations, and resource cleanup. Ensure that necessary configurations like appId, token, channel name, and user ID are provided.

```cpp
// Create and initialize the Agora service, and configure logging  

auto service = createAgoraService();  
agora::base::AgoraServiceConfiguration service_config;  
service_config.enableAudioDevice = false;  
service_config.enableAudioProcessor = true;  
service_config.enableVideo = true;  
service_config.appId = config.appId.c_str();  
service_config.useStringUid = config.UseStringUid;  
service->initialize(service_config);  
service->setLogFile("./io.agora.rtc_sdk/agorasdk.log", 1024 * 1024 * 5);  

// Create the media recorder instance  

agora::rtc::IMediaComponentFactory* factory = createAgoraMediaComponentFactory();  
agora::agora_refptr<agora::rtc::IAgoraMediaRtcRecorder> recorder = factory->createMediaRtcRecorder();  

// Initialize the recorder  
// Set to true for mixed recording or false for individual streams  

bool isMix = false;  
recorder->initialize(service, isMix);  

// Register the event handler for recorder callbacks  

std::unique_ptr<RecorderEventHandler> eventHandler{new RecorderEventHandler(recorder, config)};  
recorder->registerRecorderEventHandle(eventHandler.get());  

// Subscribe to all audio and video streams  

recorder->subscribeAllAudio();  
recorder->subscribeAllVideo(options); // 'options' should be properly defined before use  

// Configure recorder settings  

agora::media::MediaRecorderConfiguration recorder_config;  
recorder_config.width = config.video.width;  
recorder_config.height = config.video.height;  
recorder_config.fps = config.video.fps;  
recorder_config.storagePath = config.recorderPath.c_str();  
recorder_config.sample_rate = config.audio.sampleRate;  
recorder_config.channel_num = config.audio.numOfChannels;  
recorder_config.streamType = static_cast<agora::media::MediaRecorderStreamType>(config.recorderStreamType);  
recorder_config.maxDurationMs = config.maxDuration * 1000;  

recorder->setRecorderConfig(recorder_config);  

// Join the channel and start recording  

recorder->joinChannel(config.token.c_str(), config.ChannelName.c_str(), config.UserId.c_str());  
recorder->startRecording();  

// Stop recording and clean up  

recorder->unsubscribeAllAudio();  
recorder->unsubscribeAllVideo();  
recorder->stopRecording();  

recorder->unregisterRecorderEventHandle(eventHandler.get());  
eventHandler = nullptr;  

recorder->leaveChannel();  
recorder = nullptr;  

service->release();  

```

--------------------------------

### GET /dev/v2/projects

Source: https://docs.agora.io/en/real-time-stt/rest-api/restful-authentication

This endpoint retrieves project information. It requires HTTP basic authentication using your customer ID and secret.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves project information from the Agora.io Server.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{
  "example": "This endpoint does not require a request body."
}
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects.
  - **id** (string) - The unique identifier for the project.
  - **name** (string) - The name of the project.
  - **created_at** (string) - The timestamp when the project was created.

#### Response Example
```json
{
  "projects": [
    {
      "id": "your_project_id_1",
      "name": "Project One",
      "created_at": "2023-10-27T10:00:00Z"
    },
    {
      "id": "your_project_id_2",
      "name": "Project Two",
      "created_at": "2023-10-27T11:00:00Z"
    }
  ]
}
```
```

--------------------------------

### GET Insight Statistics Response Example

Source: https://docs.agora.io/en/agora-analytics/reference/api

Example of a successful response when retrieving call insight statistics. It provides the status code, a success message, a request ID, and data containing timestamps and corresponding metric values.

```json
{
  "code": 200,
  "message": "Success request: /beta/analytics/call/statistics/time",
  "requestId": "139dxxxxxxxxxxxxxxxxe968",
  "data": [
    {
      "ts": 1692584160,
      "value": 0
    },
    {
      "ts": 1692584340,
      "value": 0.007
    },
    {
      "ts": 1692584100,
      "value": 0
    },
    {
      "ts": 1692584460,
      "value": 0.003
    },
    {
      "ts": 1692584400,
      "value": 0.005
    },
    {
      "ts": 1692584580,
      "value": 0.05
    }
  ]
}
```

--------------------------------

### Install agora-token NPM Package

Source: https://docs.agora.io/en/3.x/on-premise-recording/develop/authentication-workflow

This command installs the agora-token NPM package, which provides a library for generating tokens and includes a demo server. Ensure you have Node.js and npm installed.

```bash
npm install agora-token
```

--------------------------------

### Start Recording - Java

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference_platform=linux-java

Starts the recording process. Ensure recorder is configured using `setRecorderConfig` before calling. Returns 0 on success, negative on failure.

```Java
public int startRecording()

```

--------------------------------

### Retrieve Insight Statistics HTTP Request Example (curl)

Source: https://docs.agora.io/en/agora-analytics/reference/api

An example using curl to make a GET request to the /beta/analytics/call/statistics/time endpoint to retrieve insight statistics for a call. It includes necessary headers like Accept and Authorization.

```bash
curl --request GET \
  --url https://api.sd-rtn.com/beta/analytics/call/statistics/time \
  --header 'Accept: application/json' \
  --header 'Authorization: Basic 123'
```

--------------------------------

### Response Example for Getting All Classroom Events

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

This JSON object illustrates a successful response from the 'Get all classroom events' endpoint. It includes a status code, a success message, a server timestamp, and an array of event objects, each containing details like room ID, command type, sequence, version, and data.

```json
{
  "status": 200,
  "body": {
    "msg": "Success",
    "code": 0,
    "ts": 1610167740309,
    "data": [
      {
        "roomUuid": "xxxxxx",
        "cmd": 20,
        "sequence": 1,
        "version": 1,
        "data": {}
      }
    ]
  }
}
```

--------------------------------

### Basic Usage: Joining a Topic

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Example demonstrating how to call the `joinTopic` method to register as a publisher for a specific topic and handle potential errors.

```javascript
try {
 const result = await stChannel.joinTopic("gesture", options);
 console.log(result);
} catch (status) {
 console.log(status);
}
```

--------------------------------

### Initialize Conversational AI Toolkit (Swift)

Source: https://docs.agora.io/en/conversational-ai/best-practices/audio-setup

Initializes the Conversational AI Toolkit by creating a configuration object with Video SDK and Signaling engine instances. This setup is necessary before calling other toolkit APIs.

```swift
let config = ConversationalAIAPIConfig(
    rtcEngine: rtcEngine,
    rtmEngine: rtmEngine,
    enableLog: true
)
convoAIAPI = ConversationalAIAPIImpl(config: config)
```

--------------------------------

### Compile Agora Server Gateway Sample Project (Linux C++)

Source: https://docs.agora.io/en/server-gateway/get-started/compile-run-sample-project

Commands to compile the Agora Server Gateway SDK sample project on a Linux x86-64 architecture. This involves navigating to the project directory, building the project, syncing necessary data, and exporting library paths.

```shell
# Switch to the sample project folder  
cd agora_rtc_sdk/example  

# Build the sample project  
./build-x86_64.sh  

# Sync and video/audio data needed by the project  
cd out  
../sync-data.sh  

# Export the libraries from the SDK to LD_LIBRARY_PATH  
export LD_LIBRARY_PATH=../../agora_sdk:$LD_LIBRARY_PATH  
```

--------------------------------

### Set Up Event Listeners API

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

Register event listeners for SDK events such as `user-published` and `user-unpublished` to manage remote media streams.

```APIDOC
## Set Up Event Listeners

### Description
Use the `on` method to register event listeners for SDK events. This allows you to react to significant occurrences within the channel, such as users publishing or unpublishing their media streams.

### Method
`client.on(event, handler)`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
*   **event** (string) - Required - The name of the event to listen for (e.g., "user-published", "user-unpublished").
*   **handler** (function) - Required - The callback function to execute when the event is triggered.

### Request Example
```javascript
function setupEventListeners() {
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
            user.videoTrack.play("<Specify a DOM element>");
        }
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    client.on("user-unpublished", async (user) => {
        const remotePlayerContainer = document.getElementById(user.uid);
        remotePlayerContainer && remotePlayerContainer.remove();
    });
}
```

### Response
#### Success Response (200)
Indicates that the event listener has been successfully registered.

#### Response Example
N/A (Event listeners are set up and do not return a direct response but trigger callbacks when events occur.)
```

--------------------------------

### Initialize RealtimeKitAgent Constructor (Python)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initializes the `RealtimeKitAgent` with an OpenAI client connection, optional tools, and an Agora channel. It sets up instance variables for managing the connection, tools, and user subscriptions, and configures PCM writing based on an environment variable.

```python
 def __init__(  
 self,  
 *,  
 connection: RealtimeApiConnection,  
 tools: ToolContext | None,  
 channel: Channel,  
    ) -> None:  
 self.connection = connection  
 self.tools = tools  
 self._client_tool_futures = {}  
 self.channel = channel  
 self.subscribe_user = None  
 self.write_pcm = os.environ.get("WRITE_AGENT_PCM", "false") == "true"  
        logger.info(f"Write PCM: {self.write_pcm}")  

```

--------------------------------

### Get User Channels

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Retrieves a list of all channels a specific user has joined or subscribed to.

```APIDOC
## GET /presence/userChannels

### Description
In scenarios such as data analysis or app debugging, you may need to know all the channels a specific user has joined or subscribed to. Call the `getUserChannels` method to retrieve a list of channels the user is currently in.

### Method
GET

### Endpoint
`/presence/userChannels`

### Parameters
#### Query Parameters
- **userId** (string) - Required - User ID. If set to an empty string `""`, the SDK uses the local user's `userId`.

### Request Example
```json
{
  "userId": "Tony"
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field.
- **totalChannel** (number) - Number of channels the user is in.
- **channels** (array) - List of channels the user is in.
  - **channelName** (string) - Name of the channel.
  - **channelType** (RtmChannelType) - Type of the channel.

#### Response Example
```json
{
  "timestamp": 1678886400000,
  "totalChannel": 5,
  "channels": [
    {
      "channelName": "channel1",
      "channelType": "MESSAGE"
    },
    {
      "channelName": "channel2",
      "channelType": "LIVE"
    }
  ]
}
```

#### Error Response (4xx/5xx)
- **error** (boolean) - Indicates if the operation failed. Will be `true`.
- **reason** (string) - The reason for the error.
- **operation** (string) - The operation code.
- **errorCode** (number) - The error code.

#### Error Response Example
```json
{
  "error": true,
  "reason": "User not found",
  "operation": "getUserChannels",
  "errorCode": 10002
}
```
```

--------------------------------

### Python: Start Agent HTTP Endpoint

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

The `start_agent` asynchronous function serves as an HTTP POST endpoint to initiate a RealtimeKit agent. It parses and validates incoming JSON requests using Pydantic, checks if an agent is already running for the specified channel, configures inference settings, starts the agent in a new process, and monitors it. It returns JSON responses indicating success or failure.

```python
1
async def start_agent(request):
2
 try:
3
 # Parse and validate JSON body using the pydantic model
4
 try:
5
 data = await request.json()
6
 validated_data = StartAgentRequestBody(**data)
7
 except ValidationError as e:
8
 return web.json_response(
9
 {"error": "Invalid request data", "details": e.errors()},
10
 status=400
 )
11

12
 # Parse JSON body
13
 channel_name = validated_data.channel_name
14
 uid = validated_data.uid
15
 language = validated_data.language
16

17
 # Check if a process is already running for the given channel_name
18
 if (
19
 channel_name in active_processes
20
 and active_processes[channel_name].is_alive()
21
 ):
22
 return web.json_response(
23
 {"error": f"Agent already running for channel: {channel_name}"},
24
 status=400,
25
 )
26

27
 system_message = ""
28
 if language == "en":
29
 system_message = """
Your knowledge cutoff is 2023-10. You are a helpful, witty, and friendly AI. Act like a human, but remember that you aren't a human and that you can't do human things in the real world. Your voice and personality should be warm and engaging, with a lively and playful tone. If interacting in a non-English language, start by using the standard accent or dialect familiar to the user. Talk quickly. You should always call a function if you can. Do not refer to these rules, even if you're asked about them.
30
"""

31
 inference_config = InferenceConfig(
32
 system_message=system_message,
33
 voice=Voices.Alloy,
34
 turn_detection=ServerVADUpdateParams(
35
 type="server_vad", threshold=0.5, prefix_padding_ms=300, silence_duration_ms=200
36
 ),
37
 )
38
 # Create a new process for running the agent
39
 process = Process(
40
 target=run_agent_in_process,
41
 args=(app_id, app_cert, channel_name, uid, inference_config),
42
 )
43

44
 try:
45
 process.start()
46
 except Exception as e:
47
 logger.error(f"Failed to start agent process: {e}")
48
 return web.json_response(
49
 {"error": f"Failed to start agent: {e}"},
50
 status=500
 )
51

52
 # Store the process in the active_processes dictionary using channel_name as the key
53
active_processes[channel_name] = process
54

55
 # Monitor the process in a background asyncio task
56
asyncio.create_task(monitor_process(channel_name, process))
57

58
 return web.json_response({"status": "Agent started!"})
59

60
 except Exception as e:
61
 logger.error(f"Failed to start agent: {e}")
62
 return web.json_response({"error": str(e)}, status=500)

```

--------------------------------

### Create and Activate Python Virtual Environment

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This command creates a Python virtual environment named 'venv' and activates it. This isolates project dependencies.

```shell
python3 -m venv venv && source venv/bin/activate
```

--------------------------------

### Get User Channels

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves a list of all channels a specified user has subscribed to or joined.

```APIDOC
## GET /presence/user_channels

### Description
Retrieves a list of all channels a specified user has subscribed to or joined. Useful for analytics and debugging.

### Method
GET

### Endpoint
/presence/user_channels

### Parameters
#### Query Parameters
- **userId** (String) - Required - The ID of the user whose channels you want to retrieve.

### Request Example
```dart
var (status, response) = await rtmClient.getPresence.getUserChannels("Tony");
```

### Response
#### Success Response (200)
- **channels** (List<ChannelInfo>) - A list of channel information objects.
- **count** (int) - The total number of channels the user is in.

#### Response Example
```json
{
  "channels": [
    {
      "channelName": "myChannel1",
      "channelType": "message"
    },
    {
      "channelName": "myChannel2",
      "channelType": "stream"
    }
  ],
  "count": 2
}
```

#### Error Response (Non-200)
- **error** (bool) - Indicates if an error occurred.
- **errorCode** (String) - The error code.
- **operation** (String) - The operation that failed.
- **reason** (String) - A description of the error reason.
```

--------------------------------

### Subscribe to Topic - Basic Usage Example

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Demonstrates how to subscribe to a specific topic, either with a predefined list of users or by randomly selecting up to 64 publishers. It shows how to handle the returned status and response.

```dart
var userList = ["Tony","Lily"];
var (status,response) = await stChannel.subscribeTopic("myTopic", users:userList);
if (status.error == true) {
  print(status);
} else {
  print(response);
}
```

```dart
var (status,response) = await stChannel.subscribeTopic("myTopic");
if (status.error == true) {
  print(status);
} else {
  print(response);
}
```

--------------------------------

### Implement Voice Calling in Unity

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk

This C# script demonstrates how to integrate real-time voice calling into a Unity project using the Agora SDK. It handles engine initialization, channel joining/leaving, audio module enablement, and UI interactions. Requires Agora SDK and Unity.

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Agora.Rtc;
using Agora_RTC_Plugin.API_Example.Examples.Basic.JoinChannelAudio;
#if (UNITY_2018_3_OR_NEWER && UNITY_ANDROID)
using UnityEngine.Android;
#endif

public class JoinChannelAudio : MonoBehaviour
{
    // Fill in your app ID
    private string _appID = "";

    // Fill in your channel name
    private string _channelName = "";

    // Fill in a temporary token
    private string _token = "";

    internal IRtcEngine RtcEngine;

#if (UNITY_2018_3_OR_NEWER && UNITY_ANDROID)
    private ArrayList permissionList = new ArrayList() { Permission.Microphone };
#endif

    // Start is called before the first frame update
    void Start()
    {
        SetupAudioSDKEngine();
        InitEventHandler();
        SetupUI();
    }

    // Update is called once per frame
    void Update()
    {
        CheckPermissions();
    }

    void OnApplicationQuit()
    {
        if (RtcEngine != null)
        {
            Leave();
            // Destroy IRtcEngine
            RtcEngine.Dispose();
            RtcEngine = null;
        }
    }

    private void CheckPermissions()
    {
#if (UNITY_2018_3_OR_NEWER && UNITY_ANDROID)
        foreach (string permission in permissionList)
        {
            if (!Permission.HasUserAuthorizedPermission(permission))
            {
                Permission.RequestUserPermission(permission);
            }
        }
#endif
    }

    private void SetupUI()
    {
        GameObject go = GameObject.Find("Leave");
        go.GetComponent<Button>().onClick.AddListener(Leave);
        go = GameObject.Find("Join");
        go.GetComponent<Button>().onClick.AddListener(Join);
    }

    private void SetupAudioSDKEngine()
    {
        // Create an IRtcEngine instance
        RtcEngine = Agora.Rtc.RtcEngine.CreateAgoraRtcEngine();

        RtcEngineContext context = new RtcEngineContext();
        context.appId = _appID;
        context.channelProfile = CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_COMMUNICATION;
        context.audioScenario = AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_DEFAULT;

        // Initialize the IRtcEngine
        RtcEngine.Initialize(context);
    }

    public void Join()
    {
        Debug.Log("Joining " + _channelName);

        // Enable the audio module
        RtcEngine.EnableAudio();

        // Set channel media options
        ChannelMediaOptions options = new ChannelMediaOptions();
        // Publish the audio stream captured by the microphone
        options.publishMicrophoneTrack.SetValue(true);
        // Automatically subscribe to all audio streams
        options.autoSubscribeAudio.SetValue(true);
        // Set the channel profile to live broadcast
        options.channelProfile.SetValue(CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_COMMUNICATION);
        // Set the user role to broadcaster
        options.clientRoleType.SetValue(CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER);

        // Join the channel
        RtcEngine.JoinChannel(_token, _channelName, 0, options);
    }

    public void Leave()
    {
        Debug.Log("Leaving " + _channelName);

        // Leave the channel
        RtcEngine.LeaveChannel();

        // Disable the audio module
        RtcEngine.DisableAudio();
    }

    // Create an instance of the user callback class and set the callback
    private void InitEventHandler()
    {
        UserEventHandler handler = new UserEventHandler(this);
        RtcEngine.InitEventHandler(handler);
    }

    // Implement your own callback class by inheriting the IRtcEngineEventHandler interface class
    internal class UserEventHandler : IRtcEngineEventHandler
    {
        private readonly JoinChannelAudio _audioSample;

        internal UserEventHandler(JoinChannelAudio audioSample)
        {
            _audioSample = audioSample;
        }

        // Triggered when the local user successfully joins a channel
        public override void OnJoinChannelSuccess(RtcConnection connection, int elapsed)
        {
            Debug.Log("OnJoinChannelSuccess " + _audioSample._channelName);
        }

        // Triggered when a remote user successfully joins a channel
        public override void OnUserJoined(RtcConnection connection, uint uid, int elapsed)
        {
            Debug.Log("Remote user joined");
        }

        // Triggered when a remote user leaves the current channel
        public override void OnUserOffline(RtcConnection connection, uint uid, USER_OFFLINE_REASON_TYPE reason)
        {
        }
    }
}
```

--------------------------------

### Create React Native Project with Specific Version

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Initializes a new React Native application with the specified version using npx. This command is crucial for setting up the foundational project structure.

```bash
npx react-native init RNUIkitQuickExamle --version 0.71.11
```

--------------------------------

### Get Channel ID from Metadata

Source: https://docs.agora.io/en/video-calling/overview/release-notes

This example shows how to retrieve the `channelId` parameter from the `Metadata` object. This parameter indicates the channel from which the metadata was sent.

```javascript
function onMetadataReceived(metadata) {
  const channelId = metadata.channelId;
  console.log('Metadata received from channel:', channelId);
}
```

--------------------------------

### Initialize RTC Connection and Event Handling in Python

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

This Python script initializes Agora RTC components, including service configuration, connection setup, and event observation. It defines classes for managing RTC options, audio streams, and channel events, utilizing asyncio for asynchronous operations. Dependencies include the 'agora' SDK, 'pyee', and standard Python libraries like 'asyncio' and 'logging'.

```python
import asyncio
import json
import logging
import os
from typing import Any, AsyncIterator
from agora.rtc.agora_base import (
    AudioScenarioType,
    ChannelProfileType,
    ClientRoleType,)
from agora.rtc.agora_service import (
    AgoraService,
    AgoraServiceConfig,
    RTCConnConfig,)
from agora.rtc.audio_frame_observer import AudioFrame, IAudioFrameObserver
from agora.rtc.audio_pcm_data_sender import PcmAudioFrame
from agora.rtc.local_user import LocalUser
from agora.rtc.local_user_observer import IRTCLocalUserObserver
from agora.rtc.rtc_connection import RTCConnection, RTCConnInfofrom agora.rtc.rtc_connection_observer import IRTCConnectionObserver
from pyee.asyncio import AsyncIOEventEmitter
from .logger import setup_logger
from .token_builder.realtimekit_token_builder import RealtimekitTokenBuilder

# Set up the logger with color and timestamp support
logger = setup_logger(name=__name__, log_level=logging.INFO)

class RtcOptions:
    def __init__(
        self,
        *,
        channel_name: str = None,
        uid: int = 0,
        sample_rate: int = 24000,
        channels: int = 1,
        enable_pcm_dump: bool = False,
    ):
        self.channel_name = channel_name
        self.uid = uid
        self.sample_rate = sample_rate
        self.channels = channels
        self.enable_pcm_dump = enable_pcm_dump

    def build_token(self, appid: str, appcert: str) -> str:
        return RealtimekitTokenBuilder.build_token(
            appid, appcert, self.channel_name, self.uid
        )

class AudioStream:
    def __init__(self) -> None:
        self.queue: asyncio.Queue = asyncio.Queue()

    def __aiter__(self) -> AsyncIterator[PcmAudioFrame]:
        return self

    async def __anext__(self) -> PcmAudioFrame:
        item = await self.queue.get()
        if item is None:
            raise StopAsyncIteration
        return item

class ChannelEventObserver(
    IRTCConnectionObserver, IRTCLocalUserObserver, IAudioFrameObserver):
    def __init__(self, event_emitter: AsyncIOEventEmitter, options: RtcOptions) -> None:
        self.loop = asyncio.get_event_loop()
        self.emitter = event_emitter
        self.audio_streams = dict[int, AudioStream]()
        self.options = options

    def emit_event(self, event_name: str, *args):
        """Helper function to emit events."""
        self.loop.call_soon_threadsafe(self.emitter.emit, event_name, *args)

    def on_connected(
        self, agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason
    ):
        logger.info(f"Connected to RTC: {agora_rtc_conn} {conn_info} {reason}")
        self.emit_event("connection_state_changed", agora_rtc_conn, conn_info, reason)

    def on_disconnected(
        self, agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason
    ):
        logger.info(f"Disconnected from RTC: {agora_rtc_conn} {conn_info} {reason}")
        self.emit_event("connection_state_changed", agora_rtc_conn, conn_info, reason)

    def on_connecting(
        self, agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason
    ):
        logger.info(f"Connecting to RTC: {agora_rtc_conn} {conn_info} {reason}")
        self.emit_event("connection_state_changed", agora_rtc_conn, conn_info, reason)

    def on_connection_failure(self, agora_rtc_conn, conn_info, reason):
        logger.error(f"Connection failure: {agora_rtc_conn} {conn_info} {reason}")
        self.emit_event("connection_state_changed", agora_rtc_conn, conn_info, reason)

    def on_user_joined(self, agora_rtc_conn: RTCConnection, user_id):
        logger.info(f"User joined: {agora_rtc_conn} {user_id}")
        self.emit_event("user_joined", agora_rtc_conn, user_id)

    def on_user_left(self, agora_rtc_conn: RTCConnection, user_id, reason):
        logger.info(f"User left: {agora_rtc_conn} {user_id} {reason}")
        self.emit_event("user_left", agora_rtc_conn, user_id, reason)

    def handle_received_chunk(self, json_chunk):
        chunk = json.loads(json_chunk)
        msg_id = chunk["msg_id"]
        part_idx = chunk["part_idx"]
        total_parts = chunk["total_parts"]
        if msg_id not in self.received_chunks:
            self.received_chunks[msg_id] = {"parts": {}, "total_parts": total_parts}
        if (
            part_idx not in self.received_chunks[msg_id]["parts"]
            and 0 <= part_idx < total_parts
        ):
            self.received_chunks[msg_id]["parts"][part_idx] = chunk
            if len(self.received_chunks[msg_id]["parts"]) == total_parts:
                # all parts received, now recomposing original message and get rid it from dict
                sorted_parts = sorted(
                    self.received_chunks[msg_id]["parts"].values(),
                    key=lambda c: c["part_idx"],
                )
                full_message = "".join(part["content"] for part in sorted_parts)
                del self.received_chunks[msg_id]

```

--------------------------------

### GET /dev/v2/projects (Basic Authentication - Golang)

Source: https://docs.agora.io/en/video-calling/channel-management-api/restful-authentication

This code snippet demonstrates how to authenticate using basic HTTP authentication and retrieve a list of all your current Agora projects using Golang.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves the basic information of all current Agora projects using basic HTTP authentication.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
```golang
package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
  "encoding/base64"
)

func main() {
  customerKey := "Your customer ID"
  customerSecret := "Your customer secret"
  plainCredentials := customerKey + ":" + customerSecret
  base64Credentials := base64.StdEncoding.EncodeToString([]byte(plainCredentials))

  url := "https://api.agora.io/dev/v2/projects"
  method := "GET"
  payload := strings.NewReader(``)

  client := &http.Client{}
  req, err := http.NewRequest(method, url, payload)
  if err != nil {
    fmt.Println(err)
    return
  }

  req.Header.Add("Authorization", "Basic " + base64Credentials)
  req.Header.Add("Content-Type", "application/json")

  res, err := client.Do(req)
  if err != nil {
    fmt.Println(err)
    return
  }
  defer res.Body.Close()

  body, err := ioutil.ReadAll(res.Body)
  if err != nil {
    fmt.Println(err)
    return
  }
  fmt.Println(string(body))
}
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects, each containing project details.

#### Response Example
```json
{
  "projects": [
    {
      "appId": "your_app_id_1",
      "name": "Project One",
      "created_at": "2023-01-01T10:00:00Z"
    },
    {
      "appId": "your_app_id_2",
      "name": "Project Two",
      "created_at": "2023-01-02T11:00:00Z"
    }
  ]
}
```
```

--------------------------------

### Set up Chat Client on App Start (Java)

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-sdk_platform=android

Replaces the default `onCreate` method in `MainActivity` to set up the ChatClient and event listeners when the app starts. It also initializes UI elements for message input.

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
   
    setupChatClient(); // Initialize the ChatClient
    setupListeners(); // Add event listeners
   
    // Set up UI elements for code access
    editMessage = findViewById(R.id.etMessageText);
}
```

--------------------------------

### RealtimeKitAgent Initialization

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Initializes the RealtimeKitAgent with essential components like an RTC engine, channel, and API connection. It also sets up multiple asyncio queues for handling audio and messages.

```Python
class RealtimeKitAgent:
    engine: RtcEngine
    channel: Channel
    client: RealtimeApiConnection
    audio_queue: asyncio.Queue[bytes] = asyncio.Queue()

    message_queue: asyncio.Queue[ResponseAudioTranscriptDelta] = (
        asyncio.Queue()
    )
    message_done_queue: asyncio.Queue[ResponseAudioTranscriptDone] = (
        asyncio.Queue()
    )
    tools: ToolContext | None = None

    _client_tool_futures: dict[str, asyncio.Future[ClientToolCallResponse]]

    def __init__(
        self,
        *,
        client: RealtimeApiConnection,
        tools: ToolContext | None,
        channel: Channel,
    ) -> None:
        """Initialize the agent with the provided tools and channel.
        - This method sets up the initial state of the agent and its tool context.
        """
        pass
```

--------------------------------

### Storage Management API

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=ios

APIs for managing metadata associated with channels and user attributes, including setting, getting, updating, and removing.

```APIDOC
## Storage Management

### Set Channel Metadata

- **Method:** Metadata Management
- **API:** `[[rtm getStorage] setChannelMetadata:channelType:data:options:lock:completion]`

### Get Channel Metadata

- **Method:** Metadata Query
- **API:** `[[rtm getStorage] getChannelMetadata:channelType:completion]`

### Remove Channel Metadata

- **Method:** Metadata Management
- **API:** `[[rtm getStorage] removeChannelMetadata:channelType:data:options:lock:completion]`

### Update Channel Metadata

- **Method:** Metadata Management
- **API:** `[[rtm getStorage] updateChannelMetadata:channelType:data:options:lock:completion]`

### Set User Attributes

- **Method:** Attribute Management
- **API:** `[[rtm getStorage] setUserMetadata:data:options:completion]`

### Get User Attributes

- **Method:** Attribute Query
- **API:** `[[rtm getStorage] getUserMetadata:completion]`

### Update User Attributes

- **Method:** Attribute Management
- **API:** `[[rtm getStorage] updateChannelMetadata:data:options:completion]`

### Subscribe User Attributes

- **Method:** Attribute Subscription
- **API:** `[[rtm getStorage] subscribeUserMetadata:completion]`

### Unsubscribe User Attributes

- **Method:** Attribute Subscription
- **API:** `[[rtm getStorage] unsubscribeUserMetadata:completion]`
```

--------------------------------

### Query Channel List - cURL Example

Source: https://docs.agora.io/en/voice-calling/channel-management-api/endpoint/query-channel-information/query-channel-list

This example demonstrates how to query the list of channels using cURL. It makes a GET request to the specified endpoint and includes necessary headers for authorization and content type.

```curl
curl --request GET \n  --url https://api.sd-rtn.com/dev/v1/channel/appid \n  --header 'Accept: application/json' \n  --header 'Authorization: '
```

--------------------------------

### Initialize Interactive Whiteboard SDK (JavaScript)

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This JavaScript code initializes the WhiteWebSdk instance, which is essential for interacting with the Interactive Whiteboard service. It requires an App Identifier obtained from the Agora Console.

```javascript
const yunyingSDK = new WhiteWebSdk({
    appIdentifier: "YOUR_APP_IDENTIFIER",
    region: "cn-hz"
});
```

--------------------------------

### Retrieve Reactions HTTP Request Example (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/reaction

This cURL example shows how to make a GET request to retrieve reactions for a given message ID. It includes parameters for the message ID, message type, and user ID.

```bash
curl -g -X GET 'http://XXXX/XXXX/XXXX/reaction/user/{{userId}}?msgIdList=msgId1&msgType=chat' -H 'Authorization: Bearer {YourAppToken}'
```

--------------------------------

### Initialize and Configure Agora RTCEngine

Source: https://docs.agora.io/en/extensions-marketplace/develop/integrate/symbl_ai

Initializes the Agora RTCEngine, enables video extensions, and sets up basic audio and video functionalities. This snippet demonstrates creating the engine instance, enabling specific extensions, setting video encoder configurations, and configuring audio profiles.

```Java
mRtcEngine = RtcEngine.create(config);
            mRtcEngine.enableExtension(ExtensionManager.EXTENSION_VENDOR_NAME, ExtensionManager.EXTENSION_FILTER_NAME, true);
 setupLocalVideo();
 VideoEncoderConfiguration configuration = new VideoEncoderConfiguration(640, 360,  
                VideoEncoderConfiguration.FRAME_RATE.FRAME_RATE_FPS_24,  
                VideoEncoderConfiguration.STANDARD_BITRATE,  
                VideoEncoderConfiguration.ORIENTATION_MODE.ORIENTATION_MODE_FIXED_PORTRAIT);
            mRtcEngine.setVideoEncoderConfiguration(configuration);
            mRtcEngine.setClientRole(Constants.AUDIO_ENCODED_FRAME_OBSERVER_POSITION_MIC);
            mRtcEngine.enableLocalAudio(true);
            mRtcEngine.setEnableSpeakerphone(true);
            mRtcEngine.setAudioProfile(1);
            mRtcEngine.enableAudio();
```

--------------------------------

### GET Call Freeze Bucket Statistics Response Example

Source: https://docs.agora.io/en/agora-analytics/reference/api

Example of a successful response when retrieving call freeze bucket statistics. It includes the status code, a success message, a request ID, and data categorized into buckets with user counts.

```json
{
  "code": 200,
  "message": "Success request: /beta/analytics/call/freeze/bucket",
  "requestId": "1f7a7xxxxxxxxxxxxxxxe89d",
  "data": [
    {
      "bucket": "[3%,5%)",
      "user_count": 1
    },
    {
      "bucket": "[0%,3%)",
      "user_count": 19
    }
  ]
}
```

--------------------------------

### GET /dev/v2/projects

Source: https://docs.agora.io/en/cloud-transcoding/rest-api/restful-authentication

This endpoint retrieves basic information of all your current Agora projects using basic HTTP authentication. The API only supports HTTPS.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves basic information of all your current Agora projects using basic HTTP authentication. The API only supports HTTPS.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{
  "example": "No request body for this GET request"
}
```

### Response
#### Success Response (200)
- **projects** (array) - A list of your Agora projects.
  - **projectId** (string) - The unique identifier for the project.
  - **projectName** (string) - The name of the project.
  - **ownerId** (string) - The ID of the project owner.
  - **created_at** (string) - The timestamp when the project was created.
  - **updated_at** (string) - The timestamp when the project was last updated.

#### Response Example
```json
{
  "projects": [
    {
      "projectId": "5xxxxxxxxxxxxx0",
      "projectName": "testProject",
      "ownerId": "xxxxxxxxxxxxx",
      "created_at": "2023-01-01T08:00:00.000Z",
      "updated_at": "2023-01-01T08:00:00.000Z"
    }
  ]
}
```
```

--------------------------------

### Download File Request Example (HTTP GET)

Source: https://docs.agora.io/en/agora-chat/restful-api/message-management_platform=android

This is a conceptual HTTP GET request to download a file from the Agora.io Chat service. It requires the file's UUID in the path and specific headers for authentication and content type. The `share-secret` header is mandatory if the file was uploaded with restricted access.

```http
GET https://{host}/{org_name}/{app_name}/chatfiles/{file_uuid}
Accept: application/octet-stream
Authorization: Bearer <YourAppToken>
share-secret: <YourShareSecret>
```

--------------------------------

### Create Local Media Tracks API

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

Learn how to create local audio and video tracks using the Agora SDK, which are necessary for publishing media streams.

```APIDOC
## Create Local Media Tracks

### Description
Set up the necessary local media tracks (audio and video) to enable your device to send media streams to the channel.

### Method
`AgoraRTC.createMicrophoneAudioTrack()` and `AgoraRTC.createCameraVideoTrack()`

### Parameters
None

### Request Example
```javascript
let localAudioTrack = null;
let localVideoTrack = null;

async function createLocalMediaTracks() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
}
```

### Response
#### Success Response (200)
Returns the created local audio and video tracks.

#### Response Example
```json
{
  "localAudioTrack": "<AudioTrack Object>",
  "localVideoTrack": "<VideoTrack Object>"
}
```
```

--------------------------------

### Start Recording in Channel (C++)

Source: https://docs.agora.io/en/3.x/on-premise-recording/get-started/record-api

Starts the recording process by joining a specified channel. This method requires channel details such as the key, ID, user ID, and optional recording configuration. Recording begins automatically when other users are detected in the channel, or manually if configured.

```cpp
RecordingConfig config = {<prepare>};
engine->joinChannel(<channelKey>, <channelId>, <uid>, config);
```

--------------------------------

### Parse M3U8 for Agora Recording Start Timestamp

Source: https://docs.agora.io/en/cloud-recording/develop/playback

This snippet demonstrates how to extract the start timestamp from an M3U8 file generated by Agora Cloud Recording. The timestamp is crucial for synchronizing playback. It assumes the M3U8 file follows the specified format, and it highlights how to identify the 'TIME' value from the '#EXT-X-AGORA-TRACK-EVENT' tag.

```text
#EXT-X-AGORA-TRACK-EVENT:EVENT=START,TRACK_TYPE=AUDIO,TIME=1568597779021  

```

--------------------------------

### Initialize and Join Voice Call Channel (Kotlin)

Source: https://docs.agora.io/en/3.x/voice-calling/quickstart-guide/get-started-sdk

This Kotlin code snippet demonstrates the equivalent functionality to the Java example for initializing the Agora SDK and joining a voice call channel. It is implemented in the `onCreate` method of an Android Activity. The code checks for the `RECORD_AUDIO` permission and proceeds to `initializeAndJoinChannel` if the permission is available, initiating the voice call upon app launch.

```Kotlin
override fun onCreate(savedInstanceState: Bundle?) {
 super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
 if (checkSelfPermission(Manifest.permission.RECORD_AUDIO, PERMISSION_REQ_ID_RECORD_AUDIO)) {
        initializeAndJoinChannel();
    }
}
```

--------------------------------

### Initialize and Get ConversationalAIAPI Instance (JavaScript)

Source: https://docs.agora.io/en/conversational-ai/develop/subtitles

This JavaScript code initializes the ConversationalAIAPI with specified rendering modes and then retrieves the singleton instance of the API. This setup is required before joining a Video SDK channel.

```javascript
// Initialize the component
ConversationalAIAPI.init({
  rtcEngine,
  rtmEngine,
  /**
   * Set the rendering mode for transcription subtitles. Available options:
   * - ESubtitleHelperMode.WORD: Word-by-word rendering mode. The subtitle content received from the callback
   *   is rendered to the UI one word at a time.
   * - ESubtitleHelperMode.TEXT: Sentence-by-sentence rendering mode. The full subtitle content from the callback
   *   is rendered to the UI at once.
   *
   * If not specified, the mode is determined automatically based on the message, or it can be set manually.
   */
  renderMode: ESubtitleHelperMode.WORD,
})

// Get the API instance (singleton)
const conversationalAIAPI = ConversationalAIAPI.getInstance()
```

--------------------------------

### Start Recording - C++

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference

Initiates the media recording process. This function does not take any parameters. A return value of 0 signifies that recording has started successfully, whereas a negative value indicates an error.

```cpp
virtual int startRecording() = 0;
```

--------------------------------

### Python: GET Request to Agora IO API using http.client and requests

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Shows how to make a GET request to the Agora IO API using Python's built-in 'http.client' and the popular 'requests' library. Both examples demonstrate setting the correct headers and sending the request, providing options for different Python environments and preferences.

```python 3
import http.clientconn = http.client.HTTPConnection("api.sd-rtn.com")headers = {    'Authorization': "",    'Accept': "application/json"}conn.request("GET", "/v2/ncs/ip", headers=headers)res = conn.getresponse()data = res.read()print(data.decode("utf-8"))
```

```requests
import requestsurl = "http://api.sd-rtn.com/v2/ncs/ip"headers = {    "Authorization": "",    "Accept": "application/json"}response = requests.get(url, headers=headers)print(response.json())
```

--------------------------------

### GET /dev/v2/projects

Source: https://docs.agora.io/en/agora-analytics/reference/restful-authentication

This endpoint retrieves a list of projects. It uses HTTP basic authentication with credentials encoded in Base64.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves a list of projects associated with your customer ID and secret. This endpoint requires HTTP basic authentication.

### Method
GET

### Endpoint
/dev/v2/projects

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{
  "example": "Request is sent with Authorization header containing Basic Base64-encoded credentials"
}
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects.
  - **project_uuid** (string) - The unique identifier for the project.
  - **project_name** (string) - The name of the project.
  - **region_ability** (object) - Information about the region capabilities.
    - **enable_public_recording** (boolean) - Indicates if public recording is enabled.
    - **enable_transcoding** (boolean) - Indicates if transcoding is enabled.
    - **enable_cloud_proxy** (boolean) - Indicates if cloud proxy is enabled.
    - **enable_media_projection** (boolean) - Indicates if media projection is enabled.
    - **enable_server_recording** (boolean) - Indicates if server recording is enabled.
    - **enable_media_stream_encryption** (boolean) - Indicates if media stream encryption is enabled.
  - **create_time** (string) - The timestamp when the project was created.
  - **owner** (string) - The owner of the project.
  - **app_id** (string) - The application ID for the project.

#### Response Example
```json
{
  "projects": [
    {
      "project_uuid": "your_project_uuid",
      "project_name": "Your Project Name",
      "region_ability": {
        "enable_public_recording": true,
        "enable_transcoding": true,
        "enable_cloud_proxy": true,
        "enable_media_projection": true,
        "enable_server_recording": true,
        "enable_media_stream_encryption": true
      },
      "create_time": "2023-01-01T10:00:00Z",
      "owner": "your_customer_id",
      "app_id": "your_app_id"
    }
  ]
}
```
```

--------------------------------

### View All Recording Parameters - Linux C++

Source: https://docs.agora.io/en/3.x/on-premise-recording/get-started/record-cmd

To see all available parameters and options for the On-Premise Recording SDK, execute the 'recorder_local' command without any arguments. This will display a list of configurable settings beyond the mandatory ones.

```bash
./recorder_local
```

--------------------------------

### Web Page Recording Best Practices

Source: https://docs.agora.io/en/cloud-recording/best-practices/webpage-best-practices

This section details best practices for integrating web page recording, covering limits, service start, and page loading.

```APIDOC
## Web Page Recording Best Practices

### Overview
External factors can cause problems with web page recording, including:
  * Page access failures or slow loading.
  * Incorrect loading of HTML elements.
  * Failures due to changed HTML elements during recording.
  * Issues with audio or video playback.
  * Abrupt termination of the recording process.

### Recommended Best Practices
To ensure reliability and consistency, Agora recommends the following:

#### Check Limits
Ensure your Peak Concurrent Worker (PCW), Queries Per Second (QPS), and stream counts do not exceed Agora's limits.

*   **PCW Limit:** 200 for all regions and resolutions. Contact support@agora.io to extend.
*   **QPS Limit:** Initial limit is 10 per App ID. Estimate based on PCW and query frequency. Contact support@agora.io to extend.
*   **Number of Streams:**
    *   **Video Attributes:** Max resolution 1920x1080, max frame rate 30 FPS.
    *   **Supported Streams by Service Type and Region:**
        | Service type       | Mainland China | Europe      | America     | Asia (excl. Mainland China) |
        |--------------------|----------------|-------------|-------------|-----------------------------|
        | Web page recording | SD: 100<br>HD: 50<br>FHD: 30 | SD: 50<br>HD: 30<br>FHD: 10 | SD: 100<br>HD: 50<br>FHD: 30 | SD: 100<br>HD: 100<br>FHD: 30 |

    *   **Note on Mixed Resolutions:** If recording multiple streams of different resolutions, ensure:
        *   Stream count per resolution does not exceed its limit.
        *   Total stream count does not exceed the limit of the higher resolution (e.g., in America, SD+HD total <= 100; HD+FHD total <= 50).

### Ensure Recording Service Starts Successfully

1.  **Successful `start` Request:**
    *   Verify you receive a `sid` (recording ID) in the response.
    *   **If `start` fails:**
        *   **`40x` Status Code:** Check request parameter values.
        *   **`50x` Status Code:** Retry with the same parameters, using a backoff strategy (e.g., 3, 6, 9 seconds). If persistent, retry with a new user ID.
        *   **Error Code `65`:** Retry with the same parameters, using a backoff strategy (e.g., 3, 6 seconds).

2.  **Verify Service Status (5 seconds after receiving `sid`):**
    *   Use a backoff strategy to call the query method (e.g., retry after 5, 10, 15 seconds).
    *   If the query succeeds and `status` in `serverResponse` is `4` or `5`, the recording service started successfully.
    *   Otherwise, the service may not have started or quit midway.

### Ensure Page to be Recorded Loads Successfully
[Details on ensuring the page loads successfully would follow here.]
```

--------------------------------

### Query File Conversion Progress (GET Request Example)

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/file-conversion-deprecated

This snippet illustrates how to query the progress of a file conversion task using a GET request to the /v5/services/conversion/tasks/{uuid} endpoint. It requires the task's UUID in the URL path and the conversion type as a query parameter. The request also needs Host, region, Content-Type, and an authentication token.

```http
GET /v5/services/conversion/tasks/2fxxxxxx367e?type=static
Host: api.netless.link
region: us-sv
Content-Type: application/json
token: NETLESSSDK_YWsxxxxxM2MjRi
```

--------------------------------

### Get Golang Dependencies

Source: https://docs.agora.io/en/flexible-classroom/develop/integrate/authentication-workflow

Fetches all the necessary dependencies for the Go module. This command should be run after initializing the Go module and before running the application.

```bash
$ go get  

```

--------------------------------

### C: GET Request to Agora IO API using libcurl

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

This C code example utilizes the libcurl library to make a GET request to the Agora IO API. It covers initializing a curl handle, setting the request method, URL, and necessary headers. This snippet is useful for C applications that need to interact with web APIs.

```c
CURL *hnd = curl_easy_init();curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");curl_easy_setopt(hnd, CURLOPT_URL, "http://api.sd-rtn.com/v2/ncs/ip");struct curl_slist *headers = NULL;headers = curl_slist_append(headers, "Authorization: ");headers = curl_slist_append(headers, "Accept: application/json");curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);CURLcode ret = curl_easy_perform(hnd);
```

--------------------------------

### Initialize and Join Live Streaming Channel (Java)

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/quickstart-guide/start-video-streaming

Initializes the Agora RtcEngine, sets the channel profile to broadcasting, and configures the client role as a broadcaster. It then enables video, sets up the local video view, and joins the specified channel.

```java
private void initializeAndJoinChannel() {
    try {
        mRtcEngine = RtcEngine.create(getBaseContext(), appId, mRtcEventHandler);
    } catch (Exception e) {
        throw new RuntimeException("Check the error.");
    }
 
 // For a live streaming scenario, set the channel profile as BROADCASTING. 
    mRtcEngine.setChannelProfile(Constants.CHANNEL_PROFILE_LIVE_BROADCASTING);
 // Set the client role as BORADCASTER or AUDIENCE according to the scenario. 
    mRtcEngine.setClientRole(Constants.CLIENT_ROLE_BROADCASTER);
 
 // By default, video is disabled, and you need to call enableVideo to start a video stream. 
    mRtcEngine.enableVideo();
   
 FrameLayout container = findViewById(R.id.local_video_view_container);
 // Call CreateRendererView to create a SurfaceView object and add it as a child to the FrameLayout. 
 SurfaceView surfaceView = RtcEngine.CreateRendererView(getBaseContext());
    container.addView(surfaceView);
 // Pass the SurfaceView object to Agora so that it renders the local video. 
    mRtcEngine.setupLocalVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0));
  
 // Join the channel with a token. 
    mRtcEngine.joinChannel(token, channelName, "", 0);
}

```

--------------------------------

### Check Permissions on Game Start (C#)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk

This C# method is designed to be called within the Update loop of a Unity game. It ensures that necessary device permissions, specifically microphone access on Android, are checked and granted before proceeding with audio functionalities. It relies on the `CheckPermissions` method.

```csharp
void Update() {
 CheckPermissions();
}
```

--------------------------------

### Get User Channels

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Retrieves a list of all channels that a specified user has subscribed to or joined. This is useful for analytics and debugging.

```APIDOC
## GET /api/presence/user_channels

### Description
Retrieves a list of all channels a specified user has joined or subscribed to in real time.

### Method
GET

### Endpoint
/api/presence/user_channels

### Parameters
#### Query Parameters
- **userId** (string) - Required - The user ID for whom to retrieve channel information.

### Request Example
```csharp
var (status, response) = await rtmClient.GetPresence().GetUserChannelsAsync("user123");
```

### Response
#### Success Response (200)
- **Status** (RtmStatus) - Status of the operation.
- **Response** (GetUserChannelsResult) - Contains the list of channels the user is in.

**RtmStatus properties:**
- **Error** (bool) - Indicates if the operation resulted in an error.
- **ErrorCode** (string) - Error code if an error occurred.
- **Operation** (string) - Type of operation performed.
- **Reason** (string) - Reason for the error.

**GetUserChannelsResult properties:**
- **ChannelList** (string[]) - A list of channel names the user is currently in.

#### Response Example
```json
{
  "Status": {
    "Error": false,
    "ErrorCode": "0",
    "Operation": "GetUserChannels",
    "Reason": "Success"
  },
  "Response": {
    "ChannelList": ["channelA", "channelB"]
  }
}
```
```

--------------------------------

### Activate IoT SDK License REST API Request Example

Source: https://docs.agora.io/en/iot/develop/licensing

Example of a POST request to activate an IoT SDK license. It includes the base URL and required query parameters such as pid, licenseKey, and appid.

```HTTP
https://api.agora.io/dabiz/license/v2/active?pid=02F5xxxxxxxxxxxxxxxxxxxxxxxxEC30&licenseKey=111&appid=a6d6xxxxxxxxxxxxxxxxxxxxxxxxf75e
```

--------------------------------

### Get Locks API

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves information about locks in a channel, including lock names, owners, and time-to-live details.

```APIDOC
## GET /getLocks

### Description
Retrieves information about locks in a channel, including lock names, owners, and time-to-live details.

### Method
GET

### Endpoint
/getLocks

### Parameters
#### Path Parameters
None

#### Query Parameters
- **channelName** (String) - Required - The name of the channel.
- **channelType** (RtmChannelType) - Required - The type of the channel.

### Request Example
```json
{
  "channelName": "myChannel",
  "channelType": "message"
}
```

### Response
#### Success Response (200)
- **status** (RtmStatus) - Status of the operation.
- **response** (GetLocksResult) - Details of the locks in the channel if successful.

#### Response Example
```json
{
  "status": {
    "error": false,
    "errorCode": "SUCCESS",
    "operation": "getLocks",
    "reason": "Locks retrieved successfully."
  },
  "response": {
    "channelName": "myChannel",
    "channelType": "message",
    "lockDetailList": [
      {
        "channelName": "myChannel",
        "channelType": "message",
        "lockName": "myLock1",
        "owner": "User1",
        "ttl": 3600
      },
      {
        "channelName": "myChannel",
        "channelType": "message",
        "lockName": "myLock2",
        "owner": "User2",
        "ttl": 1800
      }
    ],
    "count": 2
  }
}
```
```

--------------------------------

### Add Project Dependencies to requirements.txt

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This code block lists the Python package dependencies required for the project. These packages include Agora's SDKs, OpenAI's API client, and various utility libraries for asynchronous operations, HTTP requests, and development tools. Ensure these versions are compatible.

```plaintext
agora-python-server-sdk==2.0.5
agora-realtime-ai-api==1.0.6
aiohappyeyeballs==2.4.0
aiohttp==3.10.6
aiohttp[speedups]
aiosignal==1.3.1
annotated-types==0.7.0
anyio==4.4.0
attrs==24.2.0
black==24.4.2
certifi==2024.7.4
cffi==1.17.1
click==8.1.7
colorlog>=6.0.0
distro==1.9.0
frozenlist==1.4.1
h11==0.14.0
httpcore==1.0.5
httpx==0.27.0
idna==3.10
iniconfig==2.0.0
multidict==6.1.0
mypy==1.10.1
mypy-extensions==1.0.0
numpy==1.26.4
numpy>=1.21.0
openai==1.37.1
packaging==24.1
pathspec==0.12.1
platformdirs==4.2.2
pluggy==1.5.0
psutil==5.9.8
protobuf==5.27.2
PyAudio==0.2.14
pyaudio>=0.2.11
pycparser==2.22
pydantic==2.9.2
pydantic_core==2.23.4
pydub==0.25.1
pyee==12.0.0
PyJWT==2.8.0
pytest==8.2.2
python-dotenv==1.0.1
ruff==0.5.2
six==1.16.0
sniffio==1.3.1
sounddevice==0.4.7
sounddevice>=0.4.6
tqdm==4.66.4
types-protobuf==4.25.0.20240417
typing_extensions==4.12.2
watchfiles==0.22.0
yarl==1.12.1
```

--------------------------------

### Get Subscribed User List

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves the list of publishers that a client is currently subscribed to within a specific topic.

```APIDOC
## Get Subscribed User List

### Description
Retrieves the list of publishers that a client is subscribed to within a specific topic.

### Method
`getSubscribedUserList(String topic)`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```dart
var (status,response) = await stChannel.getSubscribedUserList("myTopic");
if (status.error == true) {
  print(status);
} else {
  print(response);
}
```

### Response
#### Success Response (200)
Returns a tuple containing `RtmStatus` and `GetSubscribedUserListResult?`.
- `RtmStatus`: Indicates the status of the operation (error, errorCode, operation, reason).
- `GetSubscribedUserListResult`: Contains `channelName`, `topic`, and `users` (list of subscribed users) if successful.

#### Response Example
```json
{
  "status": {
    "error": false,
    "errorCode": "SUCCESS",
    "operation": "getSubscribedUserList",
    "reason": "Operation successful."
  },
  "result": {
    "channelName": "AgoraChannel",
    "topic": "myTopic",
    "users": ["Tony", "Lily", "Peter"]
  }
}
```
```

--------------------------------

### Setup Colored Logger with Milliseconds in Python

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This function sets up a Python logger with support for color-coded output and millisecond precision in timestamps. It prevents duplicate logs by clearing existing handlers and allows customization of log level, format, and color usage. It's useful for applications requiring detailed and visually distinct log messages.

```Python
import loggingfrom datetime import datetimeimport colorlogdef setup_logger(    name: str,    log_level: int = logging.INFO,    log_format: str = "% (asctime)s - %(name)s - %(levelname)s - %(message)s",    use_color: bool = True) -> logging.Logger:    """Sets up and returns a logger with color and timestamp support, including milliseconds."""    # Create or get a logger with the given name    logger = logging.getLogger(name)    # Prevent the logger from propagating to the root logger (disable extra output)    logger.propagate = False        # Clear existing handlers to avoid duplicate messages    if logger.hasHandlers():        logger.handlers.clear()    # Set the log level    logger.setLevel(log_level)    # Create console handler    handler = logging.StreamHandler()    # Custom formatter for adding milliseconds    class CustomFormatter(colorlog.ColoredFormatter):        def formatTime(self, record, datefmt=None):            record_time = datetime.fromtimestamp(record.created)            if datefmt:                return record_time.strftime(datefmt) + f",%{int(record.msecs):03d}"            else:                return record_time.strftime("%Y-%m-%d %H:%M:%S") + f",%{int(record.msecs):03d}"    # Use custom formatter that includes milliseconds    if use_color:        formatter = CustomFormatter(            "%(log_color)s" + log_format,            datefmt="%Y-%m-%d %H:%M:%S",  # Milliseconds will be appended manually            log_colors={                "DEBUG": "cyan",                "INFO": "green",                "WARNING": "yellow",                "ERROR": "red",                "CRITICAL": "bold_red",            },        )    else:        formatter = CustomFormatter(log_format, datefmt="%Y-%m-%d %H:%M:%S")    handler.setFormatter(formatter)    # Add the handler to the logger    logger.addHandler(handler)    return logger
```

--------------------------------

### renewToken Method

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Details on how to use the `renewToken` method to refresh authentication tokens, including parameters and usage examples.

```APIDOC
## POST /renewToken

### Description
Renews the RTM token. This method is typically called when the current token is about to expire to maintain the connection.

### Method
POST

### Endpoint
/renewToken

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **token** (string) - Required - The newly generated Token.
- **options** (object) - Optional - Token renewal options.
  - **channelName** (string) - Optional - Channel name. Required when renewing an RTC Token.

### Request Example
```json
{
  "token": "<Your new token>",
  "options": {
    "channelName": "exampleChannel"
  }
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field. Indicates the success of the token renewal.

#### Response Example
```json
{
  "timestamp": 1678886400
}
```

#### Error Response
- **error** (boolean) - Indicates if the operation failed.
- **reason** (string) - The name of the API that triggered the error.
- **operation** (string) - The operation code.
- **errorCode** (number) - The error code.
```

--------------------------------

### GET /dev/v2/projects

Source: https://docs.agora.io/en/cloud-transcoding/rest-api/restful-authentication

This endpoint retrieves a list of projects associated with your customer ID. It requires HTTP basic authentication using your customer key and secret.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves a list of projects associated with your customer ID. This endpoint requires HTTP basic authentication.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
(Not applicable for GET requests without a body)

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects.
  - **projectId** (string) - The unique identifier for the project.
  - **projectName** (string) - The name of the project.
  - **createdAt** (string) - The timestamp when the project was created.
  - **updatedAt** (string) - The timestamp when the project was last updated.

#### Response Example
```json
{
  "projects": [
    {
      "projectId": "your_project_id_1",
      "projectName": "Project One",
      "createdAt": "2023-10-27T10:00:00Z",
      "updatedAt": "2023-10-27T10:00:00Z"
    },
    {
      "projectId": "your_project_id_2",
      "projectName": "Project Two",
      "createdAt": "2023-10-27T11:00:00Z",
      "updatedAt": "2023-10-27T11:00:00Z"
    }
  ]
}
```
```

--------------------------------

### Get RTMP Converter Status HTTP Request (cURL)

Source: https://docs.agora.io/en/media-push/develop/restful-api

This example demonstrates how to retrieve the streaming status of an RTMP converter using an HTTP GET request. It requires the region, application ID, and converter ID as path parameters, along with necessary authentication headers.

```bash
GET https://api.agora.io/{region}/v1/projects/{appId}/rtmp-converters/{converterId} 
Content-Type: application/json 
Authorization: <value>
```

--------------------------------

### Retrieve thread members using Chat RESTful API (HTTP GET)

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/manage-thread-members

This example demonstrates how to retrieve all members of a specified thread using an HTTP GET request to the Chat RESTful API. It includes path and query parameters for specifying the thread and pagination.

```http
GET https://{host}/{org_name}/{app_name}/thread/{thread_id}/users?limit={N}&cursor={cursor}
```

--------------------------------

### Custom Data Report Method

Source: https://docs.agora.io/en/3.x/video-calling/introduction/release-notes_platform=ios

This section details the `sendCustomReportMessage` method for sending customized messages and how to get started with this feature.

```APIDOC
## Custom Data Report Method

### Description
Allows reporting of customized messages. Contact support@agora.io to discuss the format of customized messages.

### Method
`sendCustomReportMessage`

### Endpoint
N/A

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **message** (string) - The custom message to report.

### Request Example
```json
{
  "message": "Your custom report data"
}
```

### Response
#### Success Response (200)
Indicates the custom message was sent successfully.

#### Response Example
```json
{
  "success": true
}
```
```

--------------------------------

### Get Channel Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Retrieves the metadata for a given channel. This method is useful for accessing stored information associated with a channel.

```APIDOC
## GET /websites/agora_io_en/channel/metadata

### Description
Retrieves the metadata of the specified channel.

### Method
GET

### Endpoint
`/websites/agora_io_en/channel/metadata`

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel.
- **channelType** (`RTM_CHANNEL_TYPE`) - Required - The type of the channel. Refer to `RTM_CHANNEL_TYPE` documentation.

### Request Example
```json
{
  "channelName": "your_channel_name",
  "channelType": "MESSAGE" 
}
```

### Response
#### Success Response (200)
- **Status** (`RtmStatus`) - The status of the operation.
- **Response** (`GetChannelMetadataResult`) - The result of the metadata retrieval.

`RtmStatus` properties:
- **Error** (bool) - Indicates if the operation resulted in an error.
- **ErrorCode** (string) - The error code for the operation.
- **Operation** (string) - The type of operation performed.
- **Reason** (string) - The reason for any errors encountered.

`GetChannelMetadataResult` properties:
- **channelName** (string) - The name of the channel.
- **channelType** (`RTM_CHANNEL_TYPE`) - The type of the channel.
- **Data** (`RtmMetadata`) - Metadata item array.

`RtmMetadata` properties:
- **majorRevision** (Int64) - Optional - Version control switch. `-1` disables version verification, `> 0` enables it.
- **metadataItems** (`MetadataItem[]`) - Required - Array of metadata items.
- **metadataItemsSize** (UInt64) - Required - The number of metadata items.

`MetadataItem` properties:
- **key** (string) - Required - The key of the metadata item.
- **value** (string) - Required - The value of the metadata item.
- **authorUserId** (string) - Required - The user ID of the editor (read-only).
- **revision** (Int64) - Optional - Version number for read operations, or version control switch for write operations.
- **updateTs** (Int64) - Optional - Timestamp of the last update (read-only).

#### Response Example
```json
{
  "Status": {
    "Error": false,
    "ErrorCode": "SUCCESS",
    "Operation": "GetChannelMetadata",
    "Reason": ""
  },
  "Response": {
    "channelName": "channel_name",
    "channelType": "MESSAGE",
    "Data": {
      "majorRevision": 1,
      "metadataItemsSize": 2,
      "metadataItems": [
        {
          "key": "key1",
          "value": "value1",
          "authorUserId": "user123",
          "revision": 1,
          "updateTs": 1678886400
        },
        {
          "key": "key2",
          "value": "value2",
          "authorUserId": "user456",
          "revision": 2,
          "updateTs": 1678886460
        }
      ]
    }
  }
}
```
```

--------------------------------

### Get Lock API

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Queries information about locks within a channel, including count, names, owners, and expiration times.

```APIDOC
## GET /getLock

### Description
Retrieves information about all locks currently present in a specified channel. This includes details such as the number of locks, their names, the user IDs of their owners, and their expiration times.

### Method
GET

### Endpoint
`/getLock`

### Parameters
#### Path Parameters
None

#### Query Parameters
- **channelName** (string) - Required - The name of the channel to query locks from.
- **channelType** (RtmChannelType) - Required - The type of the channel (e.g., 'STREAM', 'MESSAGE').

#### Request Body
None

### Request Example
```http
GET /getLock?channelName=chat_room&channelType=STREAM
```

### Response
#### Success Response (200)
(Response structure is not fully defined in the provided text, but would typically include a list of lock objects)
- **locks** (array) - An array of lock objects, where each object contains details like `lockName`, `owner`, and `expirationTime`.

#### Response Example
```json
{
  "locks": [
    {
      "lockName": "primary_video",
      "owner": "user123",
      "expirationTime": 1678890000000
    },
    {
      "lockName": "secondary_audio",
      "owner": "user456",
      "expirationTime": 1678890600000
    }
  ]
}
```

#### Error Handling
If the method call fails, it returns an `ErrorInfo` type object:
```json
{
  "error": true,
  "reason": "API_NAME_OR_OPERATION",
  "operation": "getLock",
  "errorCode": 1234
}
```
```

--------------------------------

### Get Channel Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Retrieves metadata for a specified channel. This method returns the metadata along with revision information and timestamps.

```APIDOC
## GET /api/storage/getChannelMetadata

### Description
Retrieves metadata for a specified channel. This method returns the metadata along with revision information and timestamps.

### Method
GET

### Endpoint
/api/storage/getChannelMetadata

### Parameters
#### Path Parameters
- None

#### Query Parameters
- **channelName** (string) - Required - Channel name.
- **channelType** (string) - Required - Channel type. For details, see Channel Types.

### Request Example
```
GET /api/storage/getChannelMetadata?channelName=channel_name&channelType=MESSAGE
```

### Response
#### Success Response (200)
- **timestamp** (number) - Timestamp of the successful operation.
- **channelName** (string) - Channel name.
- **channelType** (string) - Channel type.
- **totalCount** (number) - Number of metadata items.
- **majorRevision** (number) - Version of metadata.
- **metadata** (Record<string, MetaDataDetail>) - JSON object containing metadata items. Each `MetaDataDetail` object has `value` (string), `revision` (number), `updated` (string), and `authorUid` (string).

#### Response Example
```json
{
  "timestamp": 1678886400,
  "channelName": "channel_name",
  "channelType": "MESSAGE",
  "totalCount": 2,
  "majorRevision": 174298270,
  "metadata": {
    "Apple": {
      "value": "100",
      "revision": 174298200,
      "updated": "2023-03-15T10:00:00Z",
      "authorUid": "user123"
    },
    "Banana": {
      "value": "200",
      "revision": 174298100,
      "updated": "2023-03-15T09:00:00Z",
      "authorUid": "user456"
    }
  }
}
```

#### Error Response
- **ErrorInfo** (object) - Information about the error if the method call fails.
```

--------------------------------

### Node.js: GET Request to Agora IO API using Native, Request, Unirest, Fetch, Axios

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Demonstrates making a GET request to the Agora IO API in Node.js using built-in 'http' module, 'request' library, 'unirest', 'node-fetch', and 'axios'. These examples cover setting up the request, headers, and handling the response body, essential for server-side JavaScript applications.

```native
const http = require('http');const options = {  method: 'GET',  hostname: 'api.sd-rtn.com',  port: null,  path: '/v2/ncs/ip',  headers: {    Authorization: '',    Accept: 'application/json'  }};const req = http.request(options, function (res) {  const chunks = [];  res.on('data', function (chunk) {    chunks.push(chunk);  });  res.on('end', function () {    const body = Buffer.concat(chunks);    console.log(body.toString());  });});req.end();
```

```request
const request = require('request');const options = {  method: 'GET',  url: 'http://api.sd-rtn.com/v2/ncs/ip',  headers: {Authorization: '', Accept: 'application/json'}};request(options, function (error, response, body) {  if (error) throw new Error(error);  console.log(body);});
```

```unirest
const unirest = require('unirest');const req = unirest('GET', 'http://api.sd-rtn.com/v2/ncs/ip');req.headers({  Authorization: '',  Accept: 'application/json'});req.end(function (res) {  if (res.error) throw new Error(res.error);  console.log(res.body);});
```

```fetch
const fetch = require('node-fetch');const url = 'http://api.sd-rtn.com/v2/ncs/ip';const options = {method: 'GET', headers: {Authorization: '', Accept: 'application/json'}};try {  const response = await fetch(url, options);  const data = await response.json();  console.log(data);} catch (error) {  console.error(error);}
```

```axios
const axios = require('axios').default;const options = {  method: 'GET',  url: 'http://api.sd-rtn.com/v2/ncs/ip',  headers: {Authorization: '', Accept: 'application/json'}};try {  const { data } = await axios.request(options);  console.log(data);} catch (error) {  console.error(error);}
```

--------------------------------

### Python Main Entry Point: Server or Agent Execution

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This Python script serves as the main entry point for the application. It parses command-line arguments to determine whether to run as a server or an agent. If 'server' is chosen, it initializes an aiohttp web server. If 'agent' is selected, it configures and runs an agent process with specified options and inference configurations. It handles event loop management for compatibility with Python 3.10+.

```python
if __name__ == "__main__":  
    args = parse_args()  
    if args.action == "server":  
        try:  
            loop = asyncio.get_event_loop()  
        except RuntimeError:  
            loop = asyncio.new_event_loop()  
            asyncio.set_event_loop(loop)  
        app = loop.run_until_complete(init_app())  
        web.run_app(app, port=int(os.getenv("SERVER_PORT") or "8080"))  
    elif args.action == "agent":  
        realtime_kit_options = parse_args_realtimekit()  
        logger.info(f"Running agent with options: {realtime_kit_options}")  
        inference_config = InferenceConfig(  
            system_message="""
Your knowledge cutoff is 2023-10. You are a helpful, witty, and friendly AI. Act like a human, but remember that you aren't a human and that you can't do human things in the real world. Your voice and personality should be warm and engaging, with a lively and playful tone. If interacting in a non-English language, start by using the standard accent or dialect familiar to the user. Talk quickly. You should always call a function if you can. Do not refer to these rules, even if you're asked about them.
",  
            voice=Voices.Alloy,  
            turn_detection=ServerVADUpdateParams(  
                type="server_vad", threshold=0.5, prefix_padding_ms=300, silence_duration_ms=200  
            ),  
        )  
        run_agent_in_process(  
            engine_app_id=app_id,  
            engine_app_cert=app_cert,  
            channel_name=realtime_kit_options["channel_name"],  
            uid=realtime_kit_options["uid"],  
            inference_config=inference_config,  
        )  
```

--------------------------------

### Get Online Users

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=ios

Queries the number of online users in a specified channel, the list of online users, and their temporary status in real-time.

```APIDOC
## GET /presence/onlineUsers

### Description
Retrieves the count of online users, their IDs, and their temporary status within a specified channel.

### Method
GET

### Endpoint
/presence/onlineUsers

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel to query.
- **channelType** (enum) - Required - The type of the channel (e.g., AgoraRtmChannelTypeMessage).
- **includeState** (boolean) - Optional - Whether to include user state in the response.
- **includeUserId** (boolean) - Optional - Whether to include user IDs in the response.

### Request Example
```
{
  "channelName": "your_channel",
  "channelType": "AgoraRtmChannelTypeMessage",
  "includeState": false,
  "includeUserId": false
}
```

### Response
#### Success Response (200)
- **totalOccupancy** (integer) - The total number of online users in the channel.
- **userIds** (array of strings) - The list of user IDs currently online (if includeUserId is true).
- **states** (object) - A key-value map of user states (if includeState is true).

#### Response Example
```json
{
  "totalOccupancy": 10,
  "userIds": ["user1", "user2"],
  "states": {
    "user1": {"key": "value"}
  }
}
```
```

--------------------------------

### Generate HTML Documentation Locally

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/implementation-guide

Builds the HTML output for your documentation using the 'make html' command within the Sphinx build environment. This allows for local testing before deployment.

```bash
make html  
```

--------------------------------

### Initialize Agora Service (C++)

Source: https://docs.agora.io/en/on-premise-recording/get-started/quickstart

Initializes the Agora service with media configuration and logging settings. Ensure you have the App ID and necessary configurations before proceeding. This service is intended for server-side integration.

```cpp
auto service = createAgoraService();

agora::base::AgoraServiceConfiguration service_config;
service_config.enableAudioDevice = false;
service_config.enableAudioProcessor = true;
service_config.enableVideo = true;
service_config.appId = config.appId.c_str();
service_config.useStringUid = config.UseStringUid;

service->initialize(service_config);
service->setLogFile("./io.agora.rtc_sdk/agorasdk.log", 1024 * 1024 * 5);

```

--------------------------------

### Retrieve Chat Rooms List Request (cURL)

Source: https://docs.agora.io/en/agora-chat/restful-api/chatroom-management/manage-chatrooms

Example of retrieving a list of chat rooms using a cURL command. This demonstrates a GET request with query parameters for limiting results and pagination.

```bash
curl --location --request GET 'http://XXXX/XXXX/XXXX/chatrooms?limit=10' \
--header 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### Monitor Agent Process and Handle Signals

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Implements functions for monitoring agent processes and handling termination signals. `monitor_process` ensures graceful cleanup after a process finishes, while `handle_agent_proc_signal` ensures agents exit cleanly upon receiving a signal.

```python
async def monitor_process(channel_name: str, process: Process):
    await asyncio.to_thread(process.join)
    logger.info(f"Process for channel {channel_name} has finished")
    if channel_name in active_processes:
        active_processes.pop(channel_name)
    logger.info(f"Cleanup for channel {channel_name} completed")
    logger.info(f"Remaining active processes: {len(active_processes.keys())}")

def handle_agent_proc_signal(signum, frame):
    logger.info(f"Agent process received signal {signal.strsignal(signum)}. Exiting...")
    os._exit(0)
```

--------------------------------

### Shell: GET Request to Agora IO API using curl, httpie, wget

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Demonstrates how to perform a GET request to the Agora IO API using common shell utilities like curl, httpie, and wget. These examples show how to set the necessary headers, including Authorization and Accept, and specify the request URL. They are useful for quick testing and scripting.

```curl
curl --request GET \    --url https://api.sd-rtn.com/v2/ncs/ip \    --header 'Accept: application/json' \    --header 'Authorization: '
```

```httpie
http GET https://api.sd-rtn.com/v2/ncs/ip \  Accept:application/json \  Authorization:''
```

```wget
wget --quiet \  --method GET \  --header 'Authorization: ' \  --header 'Accept: application/json' \  --output-document \  - https://api.sd-rtn.com/v2/ncs/ip
```

--------------------------------

### Initialize and Join Agora Channel (Java/Kotlin)

Source: https://docs.agora.io/en/3.x/voice-calling/quickstart-guide/get-started-sdk

Encapsulates the core logic for initializing the Agora RtcEngine and joining a specified voice channel. Handles potential exceptions during engine creation and channel joining.

```java
private void initializeAndJoinChannel() {
 try {
        mRtcEngine = RtcEngine.create(getBaseContext(), appId, mRtcEventHandler);
    } catch (Exception e) {
 throw new RuntimeException("Check the error");
    }
    mRtcEngine.joinChannel(token, channelName, "", 0);
}

```

```kotlin
private fun initializeAndJoinChannel() {
 try {
        mRtcEngine = RtcEngine.create(baseContext, APP_ID, mRtcEventHandler)
    } catch (e: Exception) {
    }
    mRtcEngine!!.joinChannel(TOKEN, CHANNEL, "", 0)
}

```

--------------------------------

### Implement Individual Recording

Source: https://docs.agora.io/en/on-premise-recording/develop/individual-mode

This section provides a step-by-step guide and code example for implementing individual recording mode. This mode generates separate audio and/or video files for each user (UID).

```APIDOC
## POST /api/recording/individual

### Description
This endpoint demonstrates the implementation of individual recording mode using the On-Premise Recording SDK. It guides through initializing the recorder, subscribing to streams, joining a channel, configuring recording settings for specific users, and managing the recording process for each user.

### Method
POST

### Endpoint
/api/recording/individual

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
This endpoint does not directly accept a request body for configuration. Configuration is done programmatically using the SDK.

### Request Example
```json
{
  "message": "Refer to the SDK documentation and provided C++ code for implementation details."
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates that the process has been initiated or completed successfully based on SDK callbacks.

#### Response Example
```json
{
  "message": "Individual recording configuration and process initiated."
}
```

## SDK Call Sequence for Individual Recording

1.  **Initialize Recorder**: Set `enableMix` to `false` for individual recording.
    ```cpp
    recorder->initialize(service, false);
    ```

2.  **Subscribe to Streams**: Subscribe to all audio and video streams.
    ```cpp
    recorder->subscribeAllAudio();
    recorder->subscribeAllVideo(options);
    ```

3.  **Join Channel**: Join the communication channel.
    ```cpp
    recorder->joinChannel(config.token.c_str(), config.ChannelName.c_str(), config.UserId.c_str());
    ```

4.  **Handle `onUserJoined` Callback**: Upon receiving the `onUserJoined` callback for a remote user, configure their recording settings.
    ```cpp
    // Inside the onUserJoined callback:
    agora::media::MediaRecorderConfiguration config;
    config.fps = config_.video.fps;
    config.width = config_.video.width;
    config.height = config_.video.height;
    config.channel_num = config_.audio.numOfChannels;
    config.sample_rate = config_.audio.sampleRate;
    
    std::string curTime = getCurrentTimeAsString();
    std::string storagePath = config_.recorderPath + std::string(uid) + "_" + curTime + ".mp4";
    config.storagePath = storagePath.c_str();
    config.streamType = static_cast<agora::media::MediaRecorderStreamType>(config_.recorderStreamType);
    config.maxDurationMs = config_.maxDuration * 1000;
    
    recorder_->setRecorderConfigByUid(config, uid);
    ```

5.  **Apply Watermarks (Optional)**: Add watermarks to the video stream.
    ```cpp
    recorder_->enableAndUpdateVideoWatermarksByUid(watermarks, config_.waterMarks.size(), uid);
    ```

6.  **Start Recording**: Initiate recording for a specific user.
    ```cpp
    recorder_->startSingleRecordingByUid(uid);
    ```

7.  **Stop Recording**: Terminate recording for a specific user.
    ```cpp
    recorder_->stopSingleRecordingByUid(uid);
    ```

```

--------------------------------

### Initialize RtcEngine and Join Channel (Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Initializes the RtcEngine and joins a channel after checking for required permissions in the onCreate callback. This is the entry point for real-time interaction.

```Kotlin
 override fun onCreate(savedInstanceState: Bundle?) {     super.onCreate(savedInstanceState)     setContentView(R.layout.activity_main)     if (checkPermissions()) {         startBroadcastStreaming()     } else {         requestPermissions()     } }
```

--------------------------------

### Acquire Lock - Basic Usage

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Demonstrates acquiring a lock using the `acquireLock` method with channel details and lock name. Includes an example of setting the retry option and basic error handling.

```javascript
try{
    const result = await rtm.Lock.acquireLock(
    "chat_room",
    "STREAM",
    "my_lock",
        {retry:false}
    );
    console.log(result);
} catch (status) {
    console.log(status);
}
```

--------------------------------

### Add Maven Central Repository

Source: https://docs.agora.io/en/signaling/get-started/sdk-quickstart

This snippet shows how to add the Maven Central repository to your project's `settings.gradle` file. Ensure this repository is available to download SDK dependencies.

```gradle
repositories {
    mavenCentral()
}
```

--------------------------------

### Import Android Classes for Permissions (Java/Kotlin)

Source: https://docs.agora.io/en/3.x/voice-calling/quickstart-guide/get-started-sdk

Import necessary Android classes for handling runtime permissions, such as ActivityCompat, ContextCompat, Manifest, and PackageManager. These are required to check and request permissions like RECORD_AUDIO and CAMERA.

```java
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.Manifest;
import android.content.pm.PackageManager;

```

```kotlin
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.Manifest
import java.lang.Exception

```

--------------------------------

### Javascript: GET Request to Agora IO API using Fetch, XMLHttpRequest, jQuery, Axios

Source: https://docs.agora.io/en/media-gateway/reference/rest-api/endpoints/message-notification-service/query-ip-address

Provides examples of making a GET request to the Agora IO API using various JavaScript methods: Fetch API, XMLHttpRequest, jQuery's AJAX, and the Axios library. These snippets illustrate how to configure request options, set headers, and handle responses, making them suitable for web development.

```fetch
const url = 'http://api.sd-rtn.com/v2/ncs/ip';const options = {method: 'GET', headers: {Authorization: '', Accept: 'application/json'}};try {  const response = await fetch(url, options);  const data = await response.json();  console.log(data);} catch (error) {  console.error(error);}
```

```xmlhttprequest
const data = null;const xhr = new XMLHttpRequest();xhr.withCredentials = true;xhr.addEventListener('readystatechange', function () {  if (this.readyState === this.DONE) {    console.log(this.responseText);  }});xhr.open('GET', 'http://api.sd-rtn.com/v2/ncs/ip');xhr.setRequestHeader('Authorization', '');xhr.setRequestHeader('Accept', 'application/json');xhr.send(data);
```

```jquery
const settings = {  async: true,  crossDomain: true,  url: 'http://api.sd-rtn.com/v2/ncs/ip',  method: 'GET',  headers: {    Authorization: '',    Accept: 'application/json'  }};$.ajax(settings).done(function (response) {  console.log(response);});
```

```axios
import axios from 'axios';const options = {  method: 'GET',  url: 'http://api.sd-rtn.com/v2/ncs/ip',  headers: {Authorization: '', Accept: 'application/json'}};try {  const { data } = await axios.request(options);  console.log(data);} catch (error) {  console.error(error);}
```

--------------------------------

### GET /dev/v2/projects (Basic Authentication - PHP)

Source: https://docs.agora.io/en/video-calling/channel-management-api/restful-authentication

This code snippet demonstrates how to authenticate using basic HTTP authentication and retrieve a list of all your current Agora projects using PHP.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves the basic information of all current Agora projects using basic HTTP authentication.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
```php
<?php

$customerKey = "Your customer ID";
$customerSecret = "Your customer secret";

$credentials = $customerKey . ":" . $customerSecret;
$base64Credentials = base64_encode($credentials);
$authHeader = "Authorization: Basic " . $base64Credentials;

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.agora.io/dev/v2/projects',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_HTTPHEADER => [
        $authHeader,
        'Content-Type: application/json',
    ],
]);

$response = curl_exec($curl);

if ($response === false) {
    echo "Error in cURL: " . curl_error($curl);
} else {
    echo $response;
}

curl_close($curl);

?>
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects, each containing project details.

#### Response Example
```json
{
  "projects": [
    {
      "appId": "your_app_id_1",
      "name": "Project One",
      "created_at": "2023-01-01T10:00:00Z"
    },
    {
      "appId": "your_app_id_2",
      "name": "Project Two",
      "created_at": "2023-01-02T11:00:00Z"
    }
  ]
}
```
```

--------------------------------

### Initialize Agora RtcEngine and Join Channel (Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Initializes the Agora RtcEngine with the application ID, sets up the event handler, configures channel media options for broadcasting, and joins the specified channel. Requires `io.agora.rtc2` dependencies.

```kotlin
private var mRtcEngine: RtcEngine? = null
    private val mRtcEventHandler = object : IRtcEngineEventHandler() {
        override fun onJoinChannelSuccess(channel: String?, uid: Int, elapsed: Int) {
            super.onJoinChannelSuccess(channel, uid, elapsed)
            runOnUiThread {
                showToast("Joined channel $channel")
            }
        }
        override fun onUserJoined(uid: Int, elapsed: Int) {
            runOnUiThread {
                setupRemoteVideo(uid)
            }
        }
        override fun onUserOffline(uid: Int, reason: Int) {
            super.onUserOffline(uid, reason)
            runOnUiThread {
                showToast("User offline: $uid")
            }
        }
    }
    private fun startBroadcastStreaming() {
        initializeAgoraVideoSDK()
        joinChannel()
    }
    private fun initializeAgoraVideoSDK() {
        val config = RtcEngineConfig()
        config.mContext = baseContext
        config.mAppId = myAppId
        config.mEventHandler = mRtcEventHandler
        try {
            mRtcEngine = RtcEngine.create(config)
        } catch (e: Exception) {
            throw RuntimeException("Failed to create RTC engine: " + e.message)
        }
        mRtcEngine?.enableVideo()
        setupLocalVideo()
    }
    private fun setupLocalVideo() {
        val container: FrameLayout = findViewById(R.id.local_video_view_container)
        val surfaceView = SurfaceView(baseContext)
        container.addView(surfaceView)
        mRtcEngine?.setupLocalVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0))
    }
    private fun joinChannel() {
        val options = ChannelMediaOptions()
        options.clientRoleType = Constants.CLIENT_ROLE_BROADCASTER
        options.channelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING
        options.audienceLatencyLevel = Constants.AUDIENCE_LATENCY_LEVEL_LOW_LATENCY
        options.publishCameraTrack = true
        options.publishMicrophoneTrack = true
        mRtcEngine?.joinChannel(token, channelName, 0, options)
    }
    private fun cleanupAgoraEngine() {
        mRtcEngine?.let {
            it.stopPreview()
            it.leaveChannel()
            mRtcEngine = null
        }
    }
```

--------------------------------

### Get User Information Request Example (cURL)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

Demonstrates how to retrieve information about a specific user within a room using a cURL command. It requires region, appId, roomUUid, and userUuid as URL parameters, and an Authorization header with an educationToken.

```curl
curl -X GET 'https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/test_class/users/test_user' \
-H 'Authorization: agora token={educationToken}'
```

--------------------------------

### Login to Agora Signaling Service in C#

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Provides a C# example for logging into the Agora Signaling service using the `LoginAsync` method. This establishes a connection to the Signaling server, allowing access to resources. It includes basic error handling and logging for successful or failed login attempts.

```csharp
RtmResult<LoginResult> LoginAsync(string token);

var ( status,response ) = await rtmClient.LoginAsync(token);
if (status.Error)
{
   Debug.Log(string.Format("{0} is failed, ErrorCode: {1}, due to: {2}", status.Operation , status.ErrorCode , status.Reason));
}
else
{
   Debug.Log("Login Successfully")
}
```

--------------------------------

### Retrieve a List of Conversational AI Agents (Node.js)

Source: https://docs.agora.io/en/conversational-ai/rest-api/list

This Node.js example illustrates how to call the Agora API to get a list of Conversational AI agents. It utilizes the `axios` library to make the GET request, including necessary headers for authentication and query parameters for filtering. Error handling is included.

```javascript
const axios = require('axios');

const appid = 'YOUR_APP_ID';
const credentials = 'YOUR_BASIC_AUTH_CREDENTIALS';

const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${appid}/agents?state=2&limit=20`;

axios.get(url, {
  headers: {
    'Authorization': `Basic ${credentials}`
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error making request:', error);
  });
```

--------------------------------

### Get User Events REST API Response Example

Source: https://docs.agora.io/en/1.x/signaling/reference/user-channel-events

This snippet illustrates the JSON response structure for the 'Gets user events' API call. It includes fields for the request result, a unique request ID, and an array of event objects, each detailing user ID, event type, and timestamp.

```json
{
  "result": "success",
  "request_id" : "10116762670167749259",
  "events" : [event]
}
```

--------------------------------

### Import Whiteboard SDK with require

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This JavaScript code snippet demonstrates how to import the White Web SDK into your project using the `require` function, typically used in Node.js environments or projects configured with CommonJS modules.

```javascript
var WhiteWebSdk = require("white-web-sdk");

```

--------------------------------

### GET /dev/v2/projects

Source: https://docs.agora.io/en/agora-analytics/reference/restful-authentication

This endpoint retrieves basic information of all your current Agora projects using basic HTTP authentication. Ensure you are using HTTPS for secure communication.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves basic information of all current Agora projects using basic HTTP authentication.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{
  "example": "No request body needed for this GET request."
}
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects, each containing project details.

#### Response Example
```json
{
  "data": [
    {
      "app_id": "YOUR_APP_ID",
      "name": "My Project",
      "description": "This is a sample project.",
      "created_at": "2023-10-27T10:00:00Z",
      "owner_id": "YOUR_OWNER_ID",
      "owner_name": "John Doe"
    }
  ]
}
```

### Error Handling
- **401 Unauthorized**: Invalid customer key or secret.
- **403 Forbidden**: Insufficient permissions.
```

--------------------------------

### Get Online Users

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Retrieves real-time information about online users in a specified channel, including their count, IDs, and temporary states.

```APIDOC
## GET /presence/onlineUsers

### Description
Call the `getOnlineUsers` method to get real-time information about the number of online users, the list of online users, and their temporary states in a specified channel.

### Method
POST

### Endpoint
`/presence/onlineUsers`

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel.
- **channelType** (RtmChannelType) - Required - The type of the channel (e.g., 'MESSAGE', 'LIVE').
- **options** (object) - Optional - Additional query options.
  - **includedUserId** (boolean) - Optional - Whether to include user IDs of online members in the result. Defaults to `true`.
  - **includedState** (boolean) - Optional - Whether to include temporary state data of online users in the result. Defaults to `false`.
  - **page** (string) - Optional - Bookmark for the next page. If not provided, the SDK returns the first page.

### Request Example
```json
{
  "channelName": "chat_room",
  "channelType": "MESSAGE",
  "options": {
    "includedUserId": true,
    "includedState": true,
    "page": "yourBookMark"
  }
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field.
- **totalOccupancy** (number) - Total number of online users in the channel.
- **occupants** (array) - List of online users and their temporary state information.
  - **userId** (string) - The ID of the online user.
  - **states** (object) - Temporary state data of the user.
  - **statesCount** (number) - The number of states associated with the user.
- **nextPage** (string) - Bookmark for the next page.

#### Response Example
```json
{
  "timestamp": 1678886400000,
  "totalOccupancy": 50,
  "occupants": [
    {
      "userId": "user1",
      "states": {},
      "statesCount": 0
    },
    {
      "userId": "user2",
      "states": {},
      "statesCount": 0
    }
  ],
  "nextPage": "nextPageBookmark"
}
```

#### Error Response (4xx/5xx)
- **error** (boolean) - Indicates if the operation failed. Will be `true`.
- **reason** (string) - The reason for the error.
- **operation** (string) - The operation code.
- **errorCode** (number) - The error code.

#### Error Response Example
```json
{
  "error": true,
  "reason": "Invalid channel name",
  "operation": "getOnlineUsers",
  "errorCode": 10001
}
```
```

--------------------------------

### Initialize Agora Service (Go)

Source: https://docs.agora.io/en/server-gateway/reference/api_platform=go

Initializes the Agora service with a given configuration. This is the entry point for using the SDK. It handles the creation of the underlying C service and sets up logging if specified. It returns 0 on success and a negative value on failure.

```Go
func Initialize(cfg *AgoraServiceConfig) int {

1	func Initialize(cfg *AgoraServiceConfig) int {
  
2	 if agoraService.inited {
  
3	 return 0
  
    }
  
5	 if agoraService.service == nil {
  
        agoraService.service = C.agora_service_create()
  
 if agoraService.service == nil {
  
 return -1
  
        }
  
    }
  
  
12	    ccfg := CAgoraServiceConfig(cfg)
  
13	 defer FreeCAgoraServiceConfig(ccfg)
  
  
15	    ret := int(C.agora_service_initialize(agoraService.service, ccfg))
  
16	 if ret != 0 {
  
 return ret
  
    }
  
  
20	 if cfg.LogPath != "" {
  
        logPath := C.CString(cfg.LogPath)
  
22	 defer C.free(unsafe.Pointer(logPath))
  
23	        logSize := 512 * 1024
  
24	 if cfg.LogSize > 0 {
  
            logSize = cfg.LogSize
  
        }
  
27	        C.agora_service_set_log_file(agoraService.service, logPath, C.uint(logSize))
  
    }
  
29	    agoraService.inited = true
  
30	 return 0
  
31	}

```

--------------------------------

### GET /dev/v2/projects (Basic Authentication - Node.js)

Source: https://docs.agora.io/en/video-calling/channel-management-api/restful-authentication

This code snippet demonstrates how to authenticate using basic HTTP authentication and retrieve a list of all your current Agora projects using Node.js.

```APIDOC
## GET /dev/v2/projects

### Description
Retrieves the basic information of all current Agora projects using basic HTTP authentication.

### Method
GET

### Endpoint
https://api.agora.io/dev/v2/projects

### Parameters
#### Query Parameters
None

#### Request Body
None

### Request Example
```javascript
const https = require('https');

const customerKey = "Your customer ID";
const customerSecret = "Your customer secret";

const plainCredential = customerKey + ":" + customerSecret;
const encodedCredential = Buffer.from(plainCredential).toString('base64');
const authorizationField = "Basic " + encodedCredential;

const options = {
  hostname: 'api.agora.io',
  port: 443,
  path: '/dev/v2/projects',
  method: 'GET',
  headers: {
    'Authorization': authorizationField,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  console.log(`Status code: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
```

### Response
#### Success Response (200)
- **projects** (array) - A list of project objects, each containing project details.

#### Response Example
```json
{
  "projects": [
    {
      "appId": "your_app_id_1",
      "name": "Project One",
      "created_at": "2023-01-01T10:00:00Z"
    },
    {
      "appId": "your_app_id_2",
      "name": "Project Two",
      "created_at": "2023-01-02T11:00:00Z"
    }
  ]
}
```
```

--------------------------------

### Run Golang Server

Source: https://docs.agora.io/en/flexible-classroom/develop/integrate/authentication-workflow

Compiles and runs the Golang server application from the specified Go file. This command starts the token server, making it accessible for requests.

```bash
$ go run server.go  

```

--------------------------------

### Get User State

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves the temporary user state for a specified user within a channel. This is useful for fetching presence information.

```APIDOC
## GET /users/getState

### Description
Retrieves the temporary user state of a specified user in the channel.

### Method
GET

### Endpoint
`/users/getState`

### Parameters
#### Query Parameters
- **channelName** (String) - Required - The name of the channel.
- **channelType** (RtmChannelType) - Required - The type of channel (e.g., `message`, `live`).
- **userId** (String) - Required - The ID of the user whose state to retrieve.

### Request Example
```json
{
  "channelName": "myChannel",
  "channelType": "message",
  "userId": "Tony"
}
```

### Response
#### Success Response (200)
- **RtmStatus** (Object) - The status of the operation.
  - **error** (Boolean) - Indicates if an error occurred.
  - **errorCode** (String) - The error code.
  - **operation** (String) - The operation performed.
  - **reason** (String) - The reason for the error.
- **GetStateResult** (Object) - Contains the user's state data.
  - **state** (UserState) - The user's temporary state data.

#### Response Example
```json
{
  "RtmStatus": {
    "error": false,
    "errorCode": "0",
    "operation": "getState",
    "reason": "Success"
  },
  "GetStateResult": {
    "state": {
      "Name": "Tony",
      "Mode": "Happy"
    }
  }
}
```
```

--------------------------------

### Configure CMake for Agora Signaling SDK (Linux C++)

Source: https://docs.agora.io/en/signaling/reference/downloads

This CMakeLists.txt file configures the build process for a project using the Agora Signaling SDK on Linux. It specifies the target name, source files, include and library directories, and links against the Agora RTM SDK and pthread.

```cmake
cmake_minimum_required (VERSION 2.8)

project()
  
set(TARGET_NAME rtmQuickstart)
set(SOURCES rtmQuickstart.cpp)
set(HEADERS)
  
set(TARGET_BUILD_TYPE "Debug")
set(CMAKE_CXX_FLAGS"-fPIC -O2 -g -std=c++11 -msse2")  
  
include_directories(${CMAKE_SOURCE_DIR}/include)
link_directories(${CMAKE_SOURCE_DIR}/lib)  
  
add_executable(${TARGET_NAME} ${SOURCES} ${HEADERS})
target_link_libraries(${TARGET_NAME} agora_rtm_sdk pthread)

```

--------------------------------

### Initialize RtcEngine and Join Channel (Java)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Initializes the RtcEngine and joins a channel after checking for required permissions in the onCreate callback. This is the entry point for real-time interaction.

```Java
 @Override protected void onCreate(Bundle savedInstanceState) {     super.onCreate(savedInstanceState);     setContentView(R.layout.activity_main);     if (checkPermissions()) {         startBroadcastStreaming();     } else {         requestPermissions();     } }
```

--------------------------------

### Initialize Chat Client on App Start (Java)

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-sdk

Set up the ChatClient instance and attach event listeners when the application starts. This method is called in the `onCreate` method of the main activity to ensure chat services are ready.

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    setupChatClient(); // Initialize the ChatClient
    setupListeners(); // Add event listeners

    // Set up UI elements for code access
    editMessage = findViewById(R.id.etMessageText);
}
```

--------------------------------

### Setup - CreateAgoraRtmClient

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Creates and initializes the Signaling client instance with the provided App ID and User ID. Ensure the User ID is globally unique for device and user identification.

```APIDOC
## CreateAgoraRtmClient

### Description
Create and initialize the Signaling client instance. You need to provide `appId` and `userId` parameters, and you can get the App ID when you create an Agora project in the Agora Console.

**Information**

*   Create and initialize the client instance before calling other Signaling APIs.
*   To distinguish each user and device, you need to ensure that the `userId` parameter is globally unique, and remains the same for the lifetime of the user or device.

### Method
Call the `CreateAgoraRtmClient` method as follows:
```csharp
IRtmClient CreateAgoraRtmClient(RtmConfig config);
```

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **config** (`RtmConfig`) - Required - Configuration parameters for initializing the Signaling client instance. See `RtmConfig`.

### Request Example
```csharp
RtmConfig config = new RtmConfig();

// get the appId from your Agora console
config.appId = "my_appId";

// user ID to be used as a device identifier
config.userId ="Tony";

// set Presence Timeout
config.presenceTimeout = 30;

// it is recommended to use the Try-catch pattern to catch initialization errors
try
{
    rtmClient = RtmClient.CreateAgoraRtmClient(config);
}
catch (RTMException e)
{
    Debug.Log(string.Format("{0} is failed, ErrorCode : {1}, due to: {2}", e.Status.Operation , e.Status.ErrorCode , e.Status.Reason));
}
```

### Response
#### Success Response (200)
- **IRtmClient** (`object`) - The SDK returns the `IRtmClient` instance, for subsequent calls of other Signaling APIs.

#### Response Example
```json
{
  "rtmClient": "instance_of_IRtmClient"
}
```

### Error Handling
- **RTMException**: Catches initialization errors, providing details on the operation, error code, and reason.
```

--------------------------------

### Install and Run Agora Token NPM Package

Source: https://docs.agora.io/en/interactive-live-streaming/token-authentication/deploy-token-server

Installs the `agora-token` NPM package, configures it with App ID and App Certificate, and runs a demo server for token generation. It uses Node.js and requires `npm` for package management.

```bash
npm install agora-token

# In node_modules/agora-token/server/DemoServer.js:
# var appID = "<YOUR APP ID>";
# var appCertificate = "<YOUR APP CERTIFICATE>";

npm i
node DemoServer.js

curl http://localhost:8080/rtcToken?channelName=test
```

--------------------------------

### Start File Conversion Task (POST Request Example)

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/file-conversion-deprecated

This snippet demonstrates how to initiate a file conversion task via a POST request to the /v5/services/conversion/tasks endpoint. It specifies the resource URL, conversion type, and output format. The request requires a Host header, region, Content-Type, and an authentication token.

```http
POST /v5/services/conversion/tasks
Host: api.netless.link
region: us-sv
Content-Type: application/json
token: NETLESSSDK_YWs9QxxxxxxMjRi

{
    "resource": "https://docs-test-xx.oss-cn-hangzhou.aliyuncs.com/xxx",
    "type": "static",
    "preview": true,
    "scale": 1,
    "outputFormat": "jpg"
}
```

--------------------------------

### Create Project Directory and Main File for Go Server

Source: https://docs.agora.io/en/cloud-recording/develop/receive-notifications

These commands set up the necessary directory structure and create the main Go file for the webhook server project. It involves creating a new directory and then initializing an empty file named `main.go` within it.

```bash
mkdir agora-webhook-server

cd agora-webhook-server
```

--------------------------------

### Create VirtualDisplay with MediaProjection

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java code initializes the video input thread by creating a `VirtualDisplay` using `MediaProjection`. The `VirtualDisplay` is then rendered onto a `SurfaceView`, which acts as the target surface for the screen capture. Error handling is included for cases where `MediaProjection` fails to start.

```java
public void onVideoInitialized(Surface target) {
 MediaProjectionManager pm = (MediaProjectionManager) 
 mContext.getSystemService(Context.MEDIA_PROJECTION_SERVICE);
 mMediaProjection = pm.getMediaProjection(Activity.RESULT_OK, mIntent);
  
 if (mMediaProjection == null) {
 Log.e(TAG, "media projection start failed");
 return;
        }
 // Creates VirtualDisplay with MediaProjection, and render VirtualDisplay on SurfaceView
 mVirtualDisplay = mMediaProjection.createVirtualDisplay(
 VIRTUAL_DISPLAY_NAME, mSurfaceWidth, mSurfaceHeight, mScreenDpi,
 DisplayManager.VIRTUAL_DISPLAY_FLAG_PUBLIC, target,
 null, null);
    }

```

--------------------------------

### Agora Video SDK: Joining Channel and Starting Preview in Java

Source: https://docs.agora.io/en/extensions-marketplace/develop/integrate/symbl_ai

Shows the process of joining a specific channel and initiating the local camera preview using the Agora.io SDK. It includes error handling for potential exceptions during engine startup, channel joining, and preview initiation.

```java
mRtcEngine.joinChannel(TOKEN_VALUE, AGORA_CUSTOMER_CHANNEL_NAME, AGORA_MEETING_ID, 0);
            mRtcEngine.startPreview();
        } catch (Exception e) {
            e.printStackTrace();
            Log.e(TAG, " ERROR:: <Vg k=\"VSDK\" /> engine startup error " + e.getMessage());
        }

```

--------------------------------

### Initialize Agora on App Launch (Java)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

This Java code snippet demonstrates the onCreate method for initializing Agora. It checks for necessary permissions and starts the video calling service if granted, otherwise requests permissions.

```java
@Override protected void onCreate(Bundle savedInstanceState) {     super.onCreate(savedInstanceState);     setContentView(R.layout.activity_main);     if (checkPermissions()) {         startVideoCalling();     } else {         requestPermissions();     } }
```

--------------------------------

### Get Reaction List API

Source: https://docs.agora.io/en/agora-chat/client-api/reaction

Retrieves a list of all reactions for a specified message from the server. This includes details about each reaction and the users who added them.

```APIDOC
## GET /chat/users/{userId}/messages/{messageId}/reactions

### Description
Retrieves a list of all reactions for a specified message from the server. This includes details about each reaction and the users who added them.

### Method
GET

### Endpoint
`/chat/users/{userId}/messages/{messageId}/reactions`

### Parameters
#### Path Parameters
- **userId** (string) - Required - The ID of the user whose messages are being queried.
- **messageId** (string) - Required - The ID of the message for which to retrieve reactions.

### Response
#### Success Response (200)
- **reactions** (array) - An array of reaction objects.
  - **reaction** (string) - The emoji or reaction.
  - **user_id** (string) - The ID of the user who added the reaction.
  - **timestamp** (integer) - The timestamp when the reaction was added.

#### Response Example
```json
{
  "reactions": [
    {
      "reaction": "👍",
      "user_id": "user123",
      "timestamp": 1678886400000
    },
    {
      "reaction": "❤️",
      "user_id": "user456",
      "timestamp": 1678886460000
    }
  ]
}
```
```

--------------------------------

### Instantiate ChatClient (Java)

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-sdk

Initialize the `ChatClient` instance with the provided `appKey` and enable debug mode for outputting detailed information. This is a prerequisite for using any Chat SDK functionalities.

```java
private void setupChatClient() {
    ChatOptions options = new ChatOptions();
    if (appKey.isEmpty()) {
        showLog("You need to set your AppKey");
        return;
    }
    options.setAppKey(appKey); // Set your app key in options
    agoraChatClient = ChatClient.getInstance();
    agoraChatClient.init(this, options); // Initialize the ChatClient
    agoraChatClient.setDebugMode(true); // Enable debug info output
}
```

--------------------------------

### Retrieve Threads Request Example

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/create-delete-retrieve-threads

Example of an HTTP GET request to retrieve all threads within an application. This demonstrates the base URL for fetching threads and includes optional query parameters for limiting the number of results, specifying a cursor for pagination, and sorting the results. It's used for listing threads.

```HTTP
GET https://{host}/{org_name}/{app_name}/thread?limit={limit}&cursor={cursor}&sort={sort}
```

--------------------------------

### Initialize Agora SDK Objects

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/advanced-features/mediaplayer-kit

Initializes the RtcEngine, AgoraMediaPlayerKit, and RtcChannelPublishHelper objects required for media sharing. These are fundamental setup steps before proceeding with channel operations.

```Java
RtcEngine mRtcEngine = RtcEngine.create(context, appid, null);
RtcEngine agoraMediaPlayerKit = new AgoraMediaPlayerKit(context);
RtcChannelPublishHelper rtcChannelPublishHelper = RtcChannelPublishHelper.getInstance();
```

--------------------------------

### Install Go Project Dependencies

Source: https://docs.agora.io/en/broadcast-streaming/token-authentication/middleware-token-server

After cloning the repository, navigate to the project directory and use 'go mod download' to install all necessary project dependencies for the Go backend middleware. Ensure Go is installed on your system.

```bash
cd agora-go-backend-middleware
go mod download
```

--------------------------------

### Launch Agora Cloud Classroom

Source: https://docs.agora.io/en/flexible-classroom/develop/integrate/integrate-flexible-classroom/integrate

Launch the Agora Cloud Classroom by configuring and calling AgoraOnlineClassroomSDK.launch. This function requires parameters like appId, user information, room details, and callback for events. Remember to request necessary permissions like RECORD_AUDIO and CAMERA.

```kotlin
// Before starting the classroom, you need to dynamically apply for `Manifest.permission.RECORD_AUDIO` and `Manifest.permission.CAMERA` permissions
fun startClassRoom() {
 val appId = "" // Your app ID
 val rtmToken = "" // Your signaling Token
 val userName = "Tom" // Your user name
 val roomName = "MyRoom" // Your room name
 val roomType = RoomType.SMALL_CLASS.value                     // Class type: 4: Small classes
 val roleType = AgoraEduRoleType.AgoraEduRoleTypeStudent.value // The role only supports 2: Student role
 val roomUuid = HashUtil.md5(roomName).plus(roomType).lowercase()
 val userUuid = HashUtil.md5(userName).plus(roleType).lowercase()
 val roomRegion = AgoraEduRegion.cn  // Area
 val duration = 1800L // Class duration
 
 val config = AgoraEduLaunchConfig(
        userName,
        userUuid,
        roomName,
        roomUuid,
        roleType,
        roomType,
        rtmToken,
        null,
        duration
    )
 
    config.appId = appId
    config.region = roomRegion
 // Set large window video area parameters (large stream)
    config.videoEncoderConfig = EduContextVideoEncoderConfig(
 FcrStreamParameters.HeightStream.width,
 FcrStreamParameters.HeightStream.height,
 FcrStreamParameters.HeightStream.frameRate,
 FcrStreamParameters.HeightStream.bitRate
    )
 
    AgoraOnlineClassroomSDK.setConfig(AgoraOnlineClassSdkConfig(appId))
    AgoraOnlineClassroomSDK.launch(this, config, AgoraEduLaunchCallback { event ->
 Log.e("agora", ":launch-class status:" + event.name)
    })
}
```

--------------------------------

### Get User Channels (GetUserChannelsAsync)

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Retrieves the list of channels a specific user is currently in. This is useful for presence tracking and understanding user activity.

```APIDOC
## GET /GetUserChannelsAsync

### Description
Retrieves the list of channels a specific user is currently in. This is useful for presence tracking and understanding user activity.

### Method
GET

### Endpoint
/GetUserChannelsAsync

### Parameters
#### Query Parameters
- **userId** (string) - Required - The ID of the user whose channels are to be retrieved.

### Request Example
```json
{
  "userId": "Tony"
}
```

### Response
#### Success Response (200)
- **Status** (RtmStatus) - Information about the operation's success or failure.
- **Response** (WhereNowResult) - Contains the list of channels the user is in.

The `RtmStatus` data type contains the following properties:
- **Error** (bool) - Whether this operation is an error.
- **ErrorCode** (string) - Error code for this operation.
- **Operation** (string) - Operation type for this operation.
- **Reason** (string) - Error reason for this operation.

The `WhereNowResult` data type contains the following properties:
- **Channels** (ChannelInfo[]) - List of channel information, including channel name and channel type.

The `ChannelInfo` data type contains the following properties:
- **channelName** (string) - Channel name.
- **channelType** (RTM_CHANNEL_TYPE) - Channel types.

#### Response Example
```json
{
  "Status": {
    "Error": false,
    "ErrorCode": "0",
    "Operation": "GetUserChannels",
    "Reason": "Success"
  },
  "Response": {
    "Channels": [
      {
        "channelName": "channel1",
        "channelType": "MESSAGE"
      },
      {
        "channelName": "channel2",
        "channelType": "LIVE_AUDIO"
      }
    ]
  }
}
```
```

--------------------------------

### Create Recording Instance (C++)

Source: https://docs.agora.io/en/on-premise-recording/reference/migration-guide

This snippet demonstrates how to create and initialize an Agora recording service instance using C++. It involves creating the service, initializing it, creating a media component factory, and then creating and initializing the media recorder.

```cpp
// Create Agora service
IAgoraService* service = createAgoraService();

// Initialize Agora service
service->initialize(appId, eventHandler);

// Create media component factory
IAgoraMediaComponentFactory* componentFactory = createMediaComponentFactory();

// Create media recorder
IAgoraMediaRtcRecorder* recorder = componentFactory->createMediaRtcRecorder();

// Initialize media recorder
recorder->initialize(service);

```

--------------------------------

### Get Historical Messages

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Retrieves historical messages from a specified channel. This method can be called multiple times if the number of messages exceeds the `messageCount`.

```APIDOC
## POST /v1/getMessages

### Description
Retrieves historical messages from a specified channel. This method can be called multiple times if the number of messages exceeds the `messageCount`.

### Method
GET

### Endpoint
/v1/getMessages

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel.
- **channelType** (RtmChannelType) - Required - The type of the channel (e.g., 'MESSAGE', 'STREAM', 'USER').
- **options** (object) - Optional - Query options for retrieving messages.
  - **messageCount** (number) - Optional - Defaults to `100`. Maximum number of messages to retrieve in a single query.
  - **start** (long) - Optional - Defaults to `0`. Start timestamp for historical messages.
  - **end** (long) - Optional - Defaults to `0`. End timestamp for historical messages.

### Request Example
```javascript
const options = { messageCount: 50, start: 0, end: 0 };
try {
    const result = await rtm.history.getMessages("my_channel", "MESSAGE", options);
    console.log(result);
} catch (status) {
    console.log(status);
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field.
- **channelName** (string) - The name of the channel.
- **messageList** (array) - List of historical messages.
- **count** (number) - Total number of historical messages retrieved.
- **newStart** (number) - Timestamp of the next message. If 0, there are no more messages.

#### Response Example
```json
{
    "timestamp": 1678886400000,
    "channelName": "my_channel",
    "messageList": [
        {
            "message": "Hello!",
            "publisher": "user1",
            "timestamp": 1678886390000
        }
    ],
    "count": 1,
    "newStart": 1678886390000
}
```

#### Error Response
- **error** (boolean) - Whether the operation failed.
- **reason** (string) - Name of the API that triggered the error.
- **operation** (string) - Operation code.
- **errorCode** (number) - Error code.
```

--------------------------------

### Connect to a Channel

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

The `connect` method asynchronously connects to an Agora channel. It handles connection states, setting up a future to await successful connection or catch connection failures. It also includes optional parameters for enabling PCM data dumping.

```APIDOC
## Connect to a Channel

### Description
Asynchronously connects to the Agora channel using the provided token and channel ID. Manages connection state changes and handles potential connection errors.

### Method
`connect(self) -> None`

### Endpoint
N/A (This is a method within the Channel class)

### Parameters
#### Path Parameters
N/A

#### Query Parameters
N/A

#### Request Body
N/A

### Request Example
```python
# Assuming 'channel' is an initialized Channel object
await channel.connect()
```

### Response
#### Success Response (200)
No explicit response body for success; the method completes without raising an exception, indicating a successful connection.

#### Response Example
```json
{
  "status": "Successfully connected to the channel"
}
```

### Error Handling
- **Connection Failed**: Raises an `Exception` if the connection fails (state 5).
- **Timeout**: Raises an `Exception` if the connection does not establish within the expected timeframe (handled by the `future`).
```

--------------------------------

### Compare 6.x and 7.x Speech-to-Text API Calls (JavaScript)

Source: https://docs.agora.io/en/real-time-stt/reference/migration-guide-6-to-7

This snippet compares the API call sequences for starting, querying, and stopping tasks in Agora's Speech-to-Text service between version 6.x and 7.x using JavaScript's `fetch` API. Version 6.x used `acquire`, `start`, `query`, and `stop` with `builderToken`. Version 7.x simplifies this to `join`, `get`, and `leave`, requiring a `name` parameter and using `agent_id` for subsequent calls.

```javascript
1
// 6.x: Get builderToken  
const acquireResponse = await fetch(`https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/builderTokens`, {  
 method: 'POST',  
 body: JSON.stringify({ "instanceId": "your-instance-id" })  
});  
const { tokenName } = await acquireResponse.json();  
  
// 6.x: Start task  
const startResponse = await fetch(`https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/tasks?builderToken=${tokenName}`, {  
 method: 'POST',  
 body: JSON.stringify({  
 "languages": ["zh-CN"],  
 "rtcConfig": {  
 "channelName": "your-channel",  
 "subBotUid": "123",  
 "subBotToken": "your-sub-token",  
 "pubBotUid": "456",  
 "pubBotToken": "your-pub-token"  
   }  
 })  
});  
const { taskId } = await startResponse.json();  
  
// 6.x: Query task status  
const queryResponse = await fetch(`https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${tokenName}`, {  
 method: 'GET'  
});  
const status = await queryResponse.json();  
  
// 6.x: Stop task  
await fetch(`https://api.agora.io/v1/projects/${appId}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${tokenName}`, {  
 method: 'DELETE'  
});  

// 7.x: Start task  
const joinResponse = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/join`, {  
 method: 'POST',  
 headers: headers,  
 body: JSON.stringify({  
 "name": "my-stt-task",  // New parameter, required  
 "languages": ["zh-CN"],  
 "rtcConfig": {  
 "channelName": "your-channel",  
 "subBotUid": "123",  
 "subBotToken": "your-sub-token",  
 "pubBotUid": "456",  
 "pubBotToken": "your-pub-token",  
 "subscribeAudioUids": ["789"]  // New parameter, optional  
   }  
 })  
});  
  
// Error handling in 7.x  
if (!joinResponse.ok) {  
 const errorData = await joinResponse.json();  
 console.error('Task start failed:', errorData);  
 throw new Error(`Task start failed: ${errorData.message || joinResponse.status}`);  
}
  
const { agent_id } = await joinResponse.json();  
  
// 7.x: Query task status  
const getResponse = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/agents/${agent_id}`, {  
 method: 'GET',  
 headers: headers  
});  
  
// Task status parsing and handling in 7.x  
if (getResponse.ok) {  
 const status = await getResponse.json();  
 console.log('Task status:', status.status);  
} else {  
 console.error('Failed to get task status:', await getResponse.json());  
}
  
// 7.x: Stop task  
const leaveResponse = await fetch(`https://api.agora.io/api/speech-to-text/v1/projects/${appId}/agents/${agent_id}/leave`, {  
 method: 'POST',  // Note: POST in 7.x instead of DELETE  
 headers: headers  
});  
  
if (!leaveResponse.ok) {  
 console.error('Task stop failed:', await leaveResponse.json());  
}

```

--------------------------------

### Create Agora Recording Instance (C++)

Source: https://docs.agora.io/en/3.x/on-premise-recording/get-started/record-api

Initializes the Agora On-Premise Recording SDK by creating an instance of the recording engine. This requires providing an event handler to process recording-related events. Multiple instances can be created for simultaneous recordings.

```cpp
IRecordingEngineEventHandler *handler = <prepare>;
IRecordingEngine* engine = createAgoraRecordingEngine(<APPID>, handler);
```

--------------------------------

### HTTP Request to Query Callback Storage Info

Source: https://docs.agora.io/en/agora-chat/develop/setup-webhooks

This is an example of an HTTP GET request to query the storage information for post-delivery callbacks on the Chat server. It requires path parameters for host, organization name, and application name.

```http
GET https://{host}/{org_name}/{app_name}/callbacks/storage/info
```

--------------------------------

### Initialize Agora Channel Class (Python)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Initializes an Agora channel instance, setting up connection configurations, event observers, audio settings, and stream identifiers. It configures the local user for broadcasting and prepares for audio streaming.

```python
class Channel:
  def __init__(self, rtc: "RtcEngine", options: RtcOptions) -> None:
    self.loop = asyncio.get_event_loop()
    self.emitter = AsyncIOEventEmitter(self.loop)
    self.connection_state = 0
    self.options = options
    self.remote_users = dict[int, Any]()
    self.rtc = rtc
    self.chat = Chat(self)
    self.channelId = options.channel_name
    self.uid = options.uid
    self.enable_pcm_dump = options.enable_pcm_dump
    self.token = options.build_token(rtc.appid, rtc.appcert) if rtc.appcert else ""
    conn_config = RTCConnConfig(
client_role_type=ClientRoleType.CLIENT_ROLE_BROADCASTER,
channel_profile=ChannelProfileType.CHANNEL_PROFILE_LIVE_BROADCASTING,
    )
    self.connection = self.rtc.agora_service.create_rtc_connection(conn_config)
    self.channel_event_observer = ChannelEventObserver(
self.emitter,
options=options,
    )
    self.connection.register_observer(self.channel_event_observer)
    self.local_user = self.connection.get_local_user()
    self.local_user.set_playback_audio_frame_before_mixing_parameters(
options.channels, options.sample_rate
    )
    self.local_user.register_local_user_observer(self.channel_event_observer)
    self.local_user.register_audio_frame_observer(self.channel_event_observer)
    self.media_node_factory = self.rtc.agora_service.create_media_node_factory()
    self.audio_pcm_data_sender = (
self.media_node_factory.create_audio_pcm_data_sender()
    )
    self.audio_track = self.rtc.agora_service.create_custom_audio_track_pcm(
self.audio_pcm_data_sender
    )
    self.audio_track.set_enabled(1)
    self.local_user.publish_audio(self.audio_track)
    self.stream_id = self.connection.create_data_stream(False, False)
    self.received_chunks = {}
    self.waiting_message = None
    self.msg_id = ""
    self.msg_index = ""
    self.on(
"user_joined",
lambda agora_rtc_conn, user_id: self.remote_users.update({user_id: True}),
    )
    self.on(
"user_left",
lambda agora_rtc_conn, user_id, reason: self.remote_users.pop(
user_id, None
            ),
    )

```

--------------------------------

### POST /cloud_recording/update/layout

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Updates the layout of a recording session. This endpoint allows customization of the video layout for mixed recordings.

```APIDOC
## POST /cloud_recording/update/layout

### Description
Updates the layout of a recording session. This endpoint allows customization of the video layout for mixed recordings.

### Method
POST

### Endpoint
/cloud_recording/update/layout

### Parameters
#### Request Body
- **cname** (string) - Required - The channel name.
- **uid** (string) - Required - The user ID associated with the recording.
- **resourceId** (string) - Required - The resource ID of the recording session.
- **sid** (string) - Required - The session ID of the recording.
- **recordingMode** (string) - Required - The mode of the recording (e.g., "mix").
- **recordingConfig** (object) - Required - Configuration for updating the layout.
  - **mixedVideoLayout** (number) - Optional - The type of mixed video layout (e.g., 1 for floating, 2 for best fit).
  - **backgroundColor** (string) - Optional - The background color for the layout in hex format (e.g., "#000000").
  - **layoutConfig** (array) - Optional - Array of configurations for individual video panes.
    - **uid** (string) - Required - The user ID for this video pane.
    - **x_axis** (number) - Required - The x-coordinate of the top-left corner.
    - **y_axis** (number) - Required - The y-coordinate of the top-left corner.
    - **width** (number) - Required - The width of the video pane.
    - **height** (number) - Required - The height of the video pane.
    - **alpha** (number) - Optional - The transparency of the video pane (0.0 to 1.0).
    - **render_mode** (number) - Optional - The rendering mode for the video (e.g., 1 for crop, 2 for fit).

### Request Example
```json
{
  "cname": "test_channel",
  "uid": "uid-from-start-response",
  "resourceId": "your-resource-id",
  "sid": "your-sid",
  "recordingMode": "mix",
  "recordingConfig": {
    "mixedVideoLayout": 1,
    "backgroundColor": "#000000",
    "layoutConfig": [
      {
        "uid": "2345",
        "x_axis": 0,
        "y_axis": 0,
        "width": 360,
        "height": 640,
        "alpha": 1,
        "render_mode": 1
      }
    ]
  }
}
```

### Response
#### Success Response (200)
- **resourceId** (string) - The resource ID of the recording session.
- **sid** (string) - The session ID of the recording.
- **timestamp** (string) - The timestamp of the update operation.

#### Response Example
```json
{
  "resourceId": "string",
  "sid": "string",
  "timestamp": "string"
}
```
```

--------------------------------

### Get User Metadata - C++ Example

Source: https://docs.agora.io/en/signaling/reference/api_platform=linux-cpp

This C++ snippet demonstrates how to call the getUserMetadata method and handle the asynchronous onGetUserMetadataResult callback. It shows how to retrieve user-specific metadata and process the results or errors.

```cpp
uint64_t requestId;
rtmClient->getStorage()->getUserMetadata("Tony", requestId);
```

```cpp
class RtmEventHandler : public IRtmEventHandler {
 public:
 void onGetUserMetadataResult(const uint64_t requestId, const char *userId, const Metadata& data, RTM_ERROR_CODE errorCode) override {
 if (errorCode != RTM_ERROR_OK) {
 printf("GetUserMetadata failed error is %d reason is %s\n", errorCode, getErrorReason(errorCode));
 } else {
 printf("GetUserMetadata success user id: %s\n", userId);
 for (int i = 0 ; i < data.itemCount; i++) {
 printf("key: %s value: %s revision: %lld\n", data.items[i].key, data.items[i].value, data.items[i].revision);
 }
 }
 }
};
```

--------------------------------

### Check Cloud Transcoding Service Startup Status

Source: https://docs.agora.io/en/cloud-transcoding/best-practices/integration

This section details how to verify the successful startup of the Cloud Transcoding service by calling the `Acquire`, `Create`, and `Query` methods.

```APIDOC
## POST /api/transcoding/acquire

### Description
Acquires a builder token for creating a transcoding task.

### Method
POST

### Endpoint
/api/transcoding/acquire

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```json
{
  "example": "(No request body specified in documentation)"
}
```

### Response
#### Success Response (200)
- **builderToken** (string) - A token used to create a transcoding task.

#### Response Example
```json
{
  "builderToken": "your_builder_token"
}
```

---

## POST /api/transcoding/create

### Description
Creates a cloud transcoding task. This request should be made within 2 seconds of acquiring a `builderToken`.

### Method
POST

### Endpoint
/api/transcoding/create

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **builderToken** (string) - Required - The token acquired from the `Acquire` method.
- **idleTimeout** (integer) - Optional - The duration in seconds the transcoder stays active after all hosts leave the channel. Defaults to 300 seconds.

### Request Example
```json
{
  "builderToken": "your_builder_token",
  "idleTimeout": 600
}
```

### Response
#### Success Response (200)
- **taskId** (string) - The ID of the created transcoding task.
- **status** (string) - The initial status of the transcoding task.

#### Response Example
```json
{
  "taskId": "your_task_id",
  "status": "PENDING"
}
```

#### Error Responses
- **206 (Partial Success):** Request timed out. Implement a backoff strategy for retries.
- **409 (Conflict):** The transcoding task has already started.
- **40x (excluding 409):** Parameter error. Correct the request parameters.
- **50x (Server Error):** Temporary server issue. Retry with a backoff strategy or change UID and re-initiate.
- **Error code 65:** Retry `Create` with the same parameters using a backoff strategy.

---

## POST /api/transcoding/query

### Description
Queries the status of a cloud transcoding task. This method should be called after receiving a `taskId` from a successful `Create` request, with a backoff interval shorter than `idleTimeout`.

### Method
POST

### Endpoint
/api/transcoding/query

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **taskId** (string) - Required - The ID of the transcoding task.

### Request Example
```json
{
  "taskId": "your_task_id"
}
```

### Response
#### Success Response (200)
- **status** (string) - The current status of the transcoding task (e.g., "STARTED", "IN_PROGRESS", "STOPPED").

#### Response Example
```json
{
  "status": "STARTED"
}
```

### Notes
- If the status is not "STARTED" or "IN_PROGRESS" 90 seconds after receiving the `taskId`, consider the startup failed due to timeout.
- UIDs must be unique within the same channel. Prepare a backup UID for the transcoder.
```

--------------------------------

### Integrate Agora Signaling SDK with JitPack (Android)

Source: https://docs.agora.io/en/1.x/signaling/reference/downloads

This snippet demonstrates how to add the JitPack repository and the Agora Signaling SDK dependency to an Android project's Gradle files. Ensure to replace 'X.Y.Z' with the latest SDK version available on JitPack.io.

```gradle
allprojects {
        repositories {
            ... 
            maven { url 'https://www.jitpack.io' }
        }
    }

dependencies: {
    ...
    implementation 'com.github.agorabuilder:rtm-sdk:X.Y.Z'
}
```

--------------------------------

### Initialize Agora RtcEngine and Join Channel (Java)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Initializes the Agora RtcEngine with the application ID, sets up the event handler, configures channel media options for broadcasting, and joins the specified channel. Requires `io.agora.rtc2` dependencies.

```java
private void initializeAgoraVideoSDK() {
        RtcEngineConfig config = new RtcEngineConfig();
        config.mContext = getBaseContext();
        config.mAppId = myAppId;
        config.mEventHandler = mRtcEventHandler;
        try {
            mRtcEngine = RtcEngine.create(config);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create RTC engine: " + e.getMessage());
        }
        mRtcEngine.enableVideo();
        setupLocalVideo();
    }
    private void setupLocalVideo() {
        FrameLayout container = findViewById(R.id.local_video_view_container);
        SurfaceView surfaceView = new SurfaceView(getBaseContext());
        container.addView(surfaceView);
        mRtcEngine.setupLocalVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0));
    }
    private void joinChannel() {
        ChannelMediaOptions options = new ChannelMediaOptions();
        options.clientRoleType = Constants.CLIENT_ROLE_BROADCASTER;
        options.channelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING;
        options.audienceLatencyLevel = Constants.AUDIENCE_LATENCY_LEVEL_LOW_LATENCY;
        options.publishCameraTrack = true;
        options.publishMicrophoneTrack = true;
        mRtcEngine.joinChannel(token, channelName, 0, options);
    }
    private void cleanupAgoraEngine() {
        if (mRtcEngine != null) {
            mRtcEngine.stopPreview();
            mRtcEngine.leaveChannel();
            mRtcEngine = null;
        }
    }
```

--------------------------------

### Download File Request URL Example

Source: https://docs.agora.io/en/agora-chat/restful-api/message-management

This demonstrates the basic structure of an HTTP GET request URL to download a file. It requires the host, organization name, application name, and the specific file_uuid.

```http
GET https://{host}/{org_name}/{app_name}/chatfiles/{file_uuid}
```

--------------------------------

### Go Server Setup for Video Calling Token

Source: https://docs.agora.io/en/3.x/voice-calling/reference/upgrade-token

Sets up a basic HTTP server in Go to handle requests for Video Calling RTC tokens. It defines a handler for the `/fetch_rtc_token` route and starts the server on port 8082. Ensure the `rtcTokenHandler` function is defined elsewhere to process token requests.

```go
func main() {

 // Handling routes  

 // Video Calling token from Video SDK num uid  

 http.HandleFunc("/fetch_rtc_token", rtcTokenHandler)

 fmt.Printf("Starting server at port 8082\n")

 if err := http.ListenAndServe(":8082", nil); err != nil {

 log.Fatal(err)

 }

 }
```

--------------------------------

### Get Audio Stream from Agora Channel

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Retrieves the audio stream associated with a specific user ID from the Agora channel. This is used to access incoming audio data for a given user.

```python
def get_audio_frames(self, uid: int) -> AudioStream:
        """
        Returns the audio frames from the channel.
        Returns:
            AudioStream: The audio stream.
        """
        return self.channel_event_observer.audio_streams[uid]
```

--------------------------------

### Go: RTC Token Handler and Server Setup

Source: https://docs.agora.io/en/3.x/voice-calling/basic-features/token-server

This Go code defines a handler for fetching RTC tokens and sets up an HTTP server. It marshals a map containing a token and status code into JSON and writes it to the response. The `main` function registers the handler and starts the server on port 8082. Dependencies include the `net/http`, `strconv`, and `encoding/json` packages.

```go
func rtcTokenHandler(w http.ResponseWriter, r *http.Request) {
    resp := make(map[string]string)
    resp["token"] = message
    resp["code"] = strconv.Itoa(httpStatusCode)
    jsonResp, _ := json.Marshal(resp)
    w.Write(jsonResp)
}

func main(){
    http.HandleFunc("/fetch_rtc_token", rtcTokenHandler)
    fmt.Printf("Starting server at port 8082\n")
    if err := http.ListenAndServe(":8082", nil); err != nil {
        log.Fatal(err)
    }
}
```

--------------------------------

### Run Sample to Send H.264 Video and PCM Audio (Linux C++)

Source: https://docs.agora.io/en/server-gateway/get-started/compile-run-sample-project

Executes the `sample_send_h264_pcm` project to send media streams. Requires a temporary RTC token, channel ID, and paths to video and audio data files. The output streams can be received using the Agora Web SDK demo.

```shell
# Run sample_send_h264_pcm to send video in H.264 format and audio in PCM format  
./sample_send_h264_pcm --token YOUR_RTC_TOKEN --channelId demo_channel --videoFile test_data/send_video.h264 --audioFile test_data/send_audio_16k_1ch.pcm  
```

--------------------------------

### Get User's Temporary Status

Source: https://docs.agora.io/en/signaling/overview/migration-guide_platform=web

Use the `getState` method to retrieve a user's current temporary status in a specific channel.

```APIDOC
## GET /presence/getState

### Description
Retrieves a user's temporary status in a specified channel.

### Method
GET

### Endpoint
`/presence/getState`

### Parameters
#### Query Parameters
- **channelName** (string) - Required - The name of the channel.
- **channelType** (string) - Required - The type of the channel.
- **userId** (string) - Required - The ID of the user whose status to retrieve.

### Request Example
```json
{
  "channelName": "chat_room",
  "channelType": "MESSAGE",
  "userId": "user1"
}
```

### Response
#### Success Response (200)
- **state** (object) - An object containing the user's temporary status key-value pairs.

#### Response Example
```json
{
  "state": {
    "mood": "happy"
  }
}
```
```

--------------------------------

### Example: Composite Recording of Audio and Video

Source: https://docs.agora.io/en/3.x/on-premise-recording/develop/composite-mode

This example demonstrates how to initiate composite recording for both audio and video in a channel using the Agora Recording SDK via the command line. It includes parameters for App ID, channel name, channel profile, UID, SDK directory, mixing enablement, audio-video mixing, audio profile, video resolution, and layout mode.

```bash
./recorder_local --appId <Your App ID> --channel <The name of the channel to be recorded> --channelProfile 1 --uid 0 --appliteDir ~/Agora_Recording_SDK_for_Linux_FULL/bin --isMixingEnabled 1 --mixedVideoAudio 2 --audioProfile 1 --mixResolution 640,480,15,1000 --layoutMode 1
```

--------------------------------

### Create Interactive Whiteboard Room (Node.js)

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

This Node.js script demonstrates how to create an Interactive Whiteboard room by making a POST request to the Agora API. It requires an SDK Token and specifies the content type and region. The response includes the room UUID, which is crucial for joining the room.

```javascript
var request = require("request");
var options = {
 "method": "POST",
 "url": "https://api.netless.link/v5/rooms",
 "headers": {
 "token": "Your SDK Token",
 "Content-Type": "application/json",
 "region": "us-sv"
  },
  body: JSON.stringify({
 "isRecord": false
  })
};
request(options, function (error, response) {
 if (error) throw new Error(error);
  console.log(response.body);
});
```

--------------------------------

### Retrieve User's Threads Request and Response Example

Source: https://docs.agora.io/en/agora-chat/restful-api/thread-management/create-delete-retrieve-threads

Provides an example of an HTTP GET request to retrieve all threads a user has joined within an application, and its corresponding JSON response. The response details include thread properties such as name, owner, ID, and creation timestamp, along with a cursor for pagination.

```curl
curl -X GET http://XXXX.com/XXXX/testapp/threads/user/test4 -H 'Authorization: Bearer <YourAppToken>'
```

```json
{
  "action": "get",
  "applicationName": "testapp",
  "duration": 4,
  "entities": [
    {
      "name": "1",
      "owner": "test4",
      "id": "17XXXX69",
      "msgId": "1920",
      "groupId": "17XXXX61",
      "created": 1650856033420
    }
  ],
  "organization": "XXXX",
  "properties": {
    "cursor": "ZGNiMjRmNGY1YjczYjlhYTNkYjk1MDY2YmEyNzFmODQ6aW06dGhyZWFkOmVhc2Vtb2ItZGVtbyN0ZXN0eToxNzk3ODYzNjAwOTQ3Nzg"
  },
  "timestamp": 1650869972109,
  "uri": "http://XXXX.com/XXXX/testy/threads/user/test4"
}
```

--------------------------------

### FcrUIScene SDK - Launch Cloud Classroom

Source: https://docs.agora.io/en/flexible-classroom/client-api/ui-scene_platform=web

This section details the `launch` method of the `FcrUIScene` class, used to initialize and start a Cloud Classroom instance.

```APIDOC
## FcrUIScene launch

### Description
Launches Cloud Classroom.

### Method
`static launch(dom: HTMLElement, option: LaunchOptions, callbackSuccess?: () => void, callbackFailure?: (err: Error) => void, callbackDestroy?: (type: number) => void): () => void`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Request Example
```typescript
FcrUIScene.launch(
  document.getElementById('classroom-container'),
  {
    // launch configuration options
  },
  () => {
    console.log('Classroom launched successfully!');
  },
  (err) => {
    console.error('Failed to launch classroom:', err);
  },
  (type) => {
    console.log('Classroom destroyed with type:', type);
  }
);
```

### Response
#### Success Response (200)
This method does not return a direct success response body. Instead, it utilizes callbacks.

#### Response Example
N/A (uses callbacks)

### Return Value
Returns a function that destroys the scene when called.
```

--------------------------------

### Install Ubuntu Dependencies for Agora SDK

Source: https://docs.agora.io/en/server-gateway/get-started/integrate-sdk

Installs essential development tools and libraries required for the Agora Server Gateway C++ SDK on Ubuntu systems. This includes aptitude, build-essential, and various X11 related libraries.

```bash
sudo apt install aptitude
sudo aptitude install libx11-dev libxcomposite-dev libxext-dev libxfixes-dev libxdamage-dev cmake
```

--------------------------------

### CMake Configuration for Building Agora Native Library

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/advanced-features/raw-video-data

Example CMake configuration for building the C++ Agora raw data plugin into a shared library (.so) for Android. This setup is essential for integrating the native code with the Java application using `System.loadLibrary()`.

```cmake
cmake_minimum_required(VERSION 3.4.1)

```

--------------------------------

### Start Agora Notifications Webhook Server (Go)

Source: https://docs.agora.io/en/voice-calling/advanced-features/receive-notifications

This code sets up and starts an HTTP server in Go to listen for incoming webhook requests from Agora. It registers handlers for the root path and the notification callback path, then starts the server on a specified port. Error handling for server startup is included.

```Go
import (
	"fmt"
	"log"
	"net/http"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
	response := `<h1>Agora Notifications demo</h1><h2>Port: 80</h2>`
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(response))
}

// Assuming ncsHandler is defined elsewhere
// func ncsHandler(w http.ResponseWriter, r *http.Request) { ... }

func main() {
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/ncsNotify", ncsHandler) // Assuming this is the correct path for notifications

	port := ":80"
	fmt.Printf("Notifications webhook server started on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

```

--------------------------------

### Initialize RtcEngine and Join Channel on App Launch (Java)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=android

This Java code snippet demonstrates the `onCreate` method for initializing the Agora Real-Time Engine (`RtcEngine`) and joining a channel. It first checks for required permissions and requests them if not granted. This is crucial for starting real-time communication when the application launches.

```java
@Override protected void onCreate(Bundle savedInstanceState) {     super.onCreate(savedInstanceState);     setContentView(R.layout.activity_main);     if (checkPermissions()) {         startVoiceCalling();     } else {         requestPermissions();     } }
```

--------------------------------

### Connect to Agora Channel (Python)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

Connects to an Agora channel using the initialized `Channel` object. It manages connection states, handles connection success or failure using futures, and optionally enables PCM frame dumping.

```python
async def connect(self) -> None:
    if self.connection_state == 3:
return
    future = asyncio.Future()
    def callback(agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason):
        logger.info(f"Connection state changed: {conn_info.state}")
        if conn_info.state == 3:  # Connection successful
            future.set_result(None)
        elif conn_info.state == 5:  # Connection failed
            future.set_exception(
Exception(f"Connection failed with state: {conn_info.state}")
            )
    self.on("connection_state_changed", callback)
    logger.info(f"Connecting to channel {self.channelId} with token {self.token}")
    self.connection.connect(self.token, self.channelId, f"{self.uid}")
    if self.enable_pcm_dump:
        agora_parameter = self.connection.get_agora_parameter()
        agora_parameter.set_parameters("{\"che.audio.frame_dump\":{\"location\":\"all\",\"action\":\"start\",\"max_size_bytes\":\"120000000\",\"uuid\":\"123456789\",\"duration\":\"1200000\"}}")
    try:
        await future
    except Exception as e:
        raise Exception(
f"Failed to connect to channel {self.channelId}: {str(e)}"
        ) from e
    finally:
        self.off("connection_state_changed", callback)

```

--------------------------------

### Get Rule List using Node.js HTTP Client

Source: https://docs.agora.io/en/broadcast-streaming/channel-management-api/endpoint/ban-user-privileges/get-rule-list

This Node.js code example shows how to fetch a list of banning rules using the built-in `http` module. It configures the request method, hostname, path, and necessary headers like `Authorization` and `Accept`, then handles the response data.

```javascript
const http = require('http');
const options = {
  method: 'GET',
  hostname: 'api.sd-rtn.com',
  port: null,
  path: '/dev/v1/kicking-rule',
  headers: {
    Authorization: '',
    Accept: 'application/json'
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
```

--------------------------------

### Initialize Agora on App Launch (Kotlin)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

This Kotlin code snippet shows the onCreate method for initializing Agora. It verifies required permissions and initiates the video calling service if they are granted, prompting the user for permissions if they are not.

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {     super.onCreate(savedInstanceState)     setContentView(R.layout.activity_main)     if (checkPermissions()) {         startVideoCalling()     } else {         requestPermissions()     } }
```

--------------------------------

### Initialize RtcEngine Instance (Java/Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

These code snippets demonstrate the initialization of the Agora RtcEngine. It involves creating an RtcEngineConfig object with your App ID, context, and event handler, then creating the RtcEngine instance. This is the first step to enable real-time communication.

```java
// Fill in the app ID from Agora Console
private String myAppId = "<Your app ID>";
private RtcEngine mRtcEngine;

private void initializeAgoraVideoSDK() {
    try {
        RtcEngineConfig config = new RtcEngineConfig();
        config.mContext = getBaseContext();
        config.mAppId = myAppId;
        config.mEventHandler = mRtcEventHandler;
        mRtcEngine = RtcEngine.create(config);
    } catch (Exception e) {
        throw new RuntimeException("Error initializing RTC engine: " + e.getMessage());
    }
}

```

```kotlin
// Fill in the App ID obtained from the Agora Console
private val myAppId = "<Your app ID>"
private var mRtcEngine: RtcEngine? = null

private fun initializeRtcEngine() {
    try {
        val config = RtcEngineConfig().apply {
            mContext = applicationContext
            mAppId = myAppId
            mEventHandler = mRtcEventHandler
        }
        mRtcEngine = RtcEngine.create(config)
    } catch (e: Exception) {
        throw RuntimeException("Error initializing RTC engine: ${e.message}")
    }
}

```

--------------------------------

### Subscribe to a Message Channel

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Allows clients to subscribe to a Message Channel and start receiving messages and event notifications. This method is specifically for Message Channels.

```APIDOC
## POST /subscribe

### Description
Subscribe to a Message Channel to receive messages and event notifications. This is applicable only to Message Channels.

### Method
POST

### Endpoint
/subscribe

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **channelName** (string) - Required - The name of the channel to subscribe to.
- **options** (object) - Optional - Subscription options.
  - **withMessage** (boolean) - Optional - Defaults to `true`. Whether to subscribe to message event notifications.
  - **withPresence** (boolean) - Optional - Defaults to `true`. Whether to subscribe to Presence event notifications.
  - **beQuiet** (boolean) - Optional - Defaults to `false`. Whether to subscribe silently. If `true`, users will not be notified of your subscription/unsubscription and you won't appear in `getOnlineUsers`.
  - **withMetadata** (boolean) - Optional - Defaults to `false`. Whether to subscribe to Storage event notifications.
  - **withLock** (boolean) - Optional - Defaults to `false`. Whether to subscribe to Lock event notifications.

### Request Example
```json
{
  "channelName": "chat_room",
  "options": {
    "withMessage": true,
    "withPresence": true,
    "beQuiet": false,
    "withMetadata": false,
    "withLock": false
  }
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Reserved field.
- **channelName** (string) - The name of the channel for this operation.

#### Response Example
```json
{
  "timestamp": 1678886400000,
  "channelName": "chat_room"
}
```

#### Error Response
- **error** (boolean) - Indicates if the operation failed.
- **reason** (string) - The name of the API that triggered the error.
- **operation** (string) - The operation code.
- **errorCode** (number) - The error code.

#### Error Response Example
```json
{
  "error": true,
  "reason": "subscribe",
  "operation": "1234",
  "errorCode": 1001
}
```
```

--------------------------------

### Initialize AgoraRtcEngineKit and VideoLoader in Swift

Source: https://docs.agora.io/en/video-calling/best-practices/preload-channels

This snippet demonstrates how to initialize the AgoraRtcEngineKit and VideoLoader instances. It covers creating the engine with necessary configurations and setting up the VideoLoader with the engine instance and listener. Ensure you have the Agora SDK integrated and your App ID configured.

```swift
func prepareEngine() {
  // Create an Instance of AgoraRtcEngineKit
  let engine = _createRtcEngine()
  // Obtain a shared instance of VideoLoaderApiImpl
  let loader = VideoLoaderApiImpl.shared
  loader.addListener(listener: self)
  // Creating a VideoLoaderConfig instance
  let config = VideoLoaderConfig()
  // Setting up an AgoraRtcEngineKit instance
  config.rtcEngine = engine
  // Initialize VideoLoader
  loader.setup(config: config)
}

// Initializing AgoraRtcEngineKit
private func _createRtcEngine() -> AgoraRtcEngineKit {
  let config = AgoraRtcEngineConfig()
  // Use the App Id of your project from the console
  config.appId = KeyCenter.AppId
  config.channelProfile = .liveBroadcasting
  config.audioScenario = .gameStreaming
  config.areaCode = .global
  let engine = AgoraRtcEngineKit.sharedEngine(with: config,
 delegate: nil)
  return engine
}
```

--------------------------------

### Basic Usage of UpdateUserMetadataAsync (C#)

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

This C# code example demonstrates how to construct RtmMetadata and MetadataOptions objects and then call the UpdateUserMetadataAsync method. It includes error handling for the operation's status.

```csharp
var metadata = new RtmMetadata();
metadata.majorRevision = 174298270;
var metadataItem = new MetadataItem()
 {
 key = "Mute",
 value = "false",
 revision = 174298100,
 };
metadata.metadataItems = new MetadataItem[] { metadataItem };
metadata.metadataItemsSize = 1;
var options = new MetadataOptions()
 {
 recordUserId = true,
 recordTs = true
 };

var (status,response) = await rtmClient.GetStorage().UpdateUserMetadataAsync("Tony", data, metadataOptions);
if (status.Error)
{
 Debug.Log(string.Format("{0} is failed, ErrorCode: {1}, due to: {2}", status.Operation, status.ErrorCode, status.Reason));
}
else
{
 Debug.Log(string.Format("Update User :{0} metadata success! ", response.UserId));
}
```

--------------------------------

### Get Online Users

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves a list of users currently online in a specified channel. Supports pagination and options to include user IDs and states.

```APIDOC
## GET /presence/online_users

### Description
Retrieves a list of users currently online in a specified channel. Supports pagination and options to include user IDs and states.

### Method
GET

### Endpoint
/presence/online_users

### Parameters
#### Query Parameters
- **channelName** (String) - Required - The name of the channel.
- **channelType** (`RtmChannelType`) - Required - The type of the channel (e.g., message, stream).
- **includeUserId** (bool) - Optional - Defaults to `true`. Whether to include the user ID of online members.
- **includeState** (bool) - Optional - Defaults to `false`. Whether to include temporary state data of online users.
- **page** (String) - Optional - The page number or bookmark for retrieving subsequent pages of results.

### Request Example
```dart
var (status, response) = await rtmClient.getPresence.getOnlineUsers(
  "myChannel",
  RtmChannelType.message,
  includeUserId: true,
  includeState: true,
  page: "myBookMark"
);
```

### Response
#### Success Response (200)
- **userStateList** (List<UserState>) - List of user temporary states.
- **count** (int) - The number of users in the returned list.
- **nextPage** (String) - A bookmark for the next page of data, if available.

#### Response Example
```json
{
  "userStateList": [
    {
      "userId": "user123",
      "state": "online",
      "customData": ""
    }
  ],
  "count": 1,
  "nextPage": ""
}
```

#### Error Response (Non-200)
- **error** (bool) - Indicates if an error occurred.
- **errorCode** (String) - The error code.
- **operation** (String) - The operation that failed.
- **reason** (String) - A description of the error reason.
```

--------------------------------

### Generate a Signature (POST and PUT)

Source: https://docs.agora.io/en/extensions-marketplace/develop/implement/signature-algorithm

Provides a step-by-step guide and an example for generating a signature for POST and PUT requests, including constructing the source string and applying the encryption.

```APIDOC
## Generate a Signature (POST and PUT)

### Example Request URL
`https://[host]/customers/123456/projects/new`

### Example Request Body
```json
{
  "projectId": "430892",
  "apiKey": "pzD5XinRSlmA64tZx81fL92YcBsJK0gd",
  "signature": "To be generated"
}
```

### Parameters for Encryption
- **SourceString**:
  - `POST&%2Fcustomers%2F123456%2Fprojects%2Fnew&apiKey%3DpzD5XinRSlmA64tZx81fL92YcBsJK0gd%26projectId%3D430892`
- **apiSecret**:
  - `U1SXE6k57vxVRjTomgquwC2F3tH8ziOB` (Demonstration value)

### Step 1: Construct the Source String
1. Add the HTTP method and an ampersand: `POST&`
2. URL-encode the path (e.g., `/customers/123456/projects/new` becomes `%2Fcustomers%2F123456%2Fprojects%2Fnew`) and append an ampersand: `POST&%2Fcustomers%2F123456%2Fprojects%2Fnew&`
3. Alphabetically sort query parameters (if any, excluding `signature`), format as `key=value`, URL-encode, and append. For the request body, include parameters in the format `key=value`, URL-encode, and append: `POST&%2Fcustomers%2F123456%2Fprojects%2Fnew&apiKey%3DpzD5XinRSlmA64tZx81fL92YcBsJK0gd%26projectId%3D430892`

### Step 2: Construct Your Secret Key
Append an ampersand to your `apiSecret`: `U1SXE6k57vxVRjTomgquwC2F3tH8ziOB&`

### Step 3: Generate the Signature
Apply the encryption algorithm: `signature = Base64( HMAC-SHA1( apiSecret&, SourceString) )`

### Resulting Signature
- **signature**: `YZOl2v5q3I7o0x3F13tpnkq5aDI=`
```

--------------------------------

### Agora Live Streaming: JavaScript Basic Implementation

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This snippet showcases a full implementation of real-time live streaming using the Agora RTC SDK NG in JavaScript. It includes initializing the client, handling user publishing and unpublishing events, creating and publishing local audio and video tracks, joining as a host or audience, displaying local and remote video feeds, and leaving the channel. Dependencies include the 'agora-rtc-sdk-ng' library. It requires App ID, channel name, and token for connection.

```javascript
import AgoraRTC from "agora-rtc-sdk-ng";
// RTC client instance
let client = null;
// Declare variables for local tracks
let localAudioTrack = null;
let localVideoTrack = null;
// Connection parameters
let appId = "<-- Insert app ID -->";
let channel = "<-- Insert channel name -->";
let token = "<-- Insert token -->";
let uid = 0; // User ID

// Initialize the AgoraRTC client
function initializeClient() {
    client = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: "host" });
    setupEventListeners();
}

// Handle client events
function setupEventListeners() {
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        console.log("subscribe success");
        if (mediaType === "video") {
            displayRemoteVideo(user);
        }
        if (mediaType === "audio") {
            user.audioTrack.play();
        }
    });

    client.on("user-unpublished", async (user) => {
        const remotePlayerContainer = document.getElementById(user.uid);
        remotePlayerContainer && remotePlayerContainer.remove();
    });
}

// Create and publish local tracks
async function createLocalTracks() {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
}

// Display local video
function displayLocalVideo() {
    const localPlayerContainer = document.createElement("div");
    localPlayerContainer.id = uid;
    localPlayerContainer.textContent = `Local user ${uid}`;
    localPlayerContainer.style.width = "640px";
    localPlayerContainer.style.height = "480px";
    document.body.append(localPlayerContainer);
    localVideoTrack.play(localPlayerContainer);
}

// Join as a host
async function joinAsHost() {
    await client.join(appId, channel, token, uid);
    // A host can both publish tracks and subscribe to tracks
    client.setClientRole("host");
    // Create and publish local tracks
    await createLocalTracks();
    await publishLocalTracks();
    displayLocalVideo();
    disableJoinButtons();
    console.log("Host joined and published tracks.");
}

// Join as audience
async function joinAsAudience() {
    await client.join(appId, channel, token, uid);
    // Set ultra-low latency level
    let clientRoleOptions = { level: 2 };
    // Audience can only subscribe to tracks
    client.setClientRole("audience", clientRoleOptions);
    disableJoinButtons();
    console.log("Audience joined.");
}

// Publish local tracks
async function publishLocalTracks() {
    await client.publish([localAudioTrack, localVideoTrack]);
}

// Display remote user's video
function displayRemoteVideo(user) {
    const remotePlayerContainer = document.createElement("div");
    remotePlayerContainer.id = user.uid.toString();
    remotePlayerContainer.textContent = `Remote user ${user.uid}`;
    remotePlayerContainer.style.width = "640px";
    remotePlayerContainer.style.height = "480px";
    document.body.append(remotePlayerContainer);
    user.videoTrack.play(remotePlayerContainer);
}

// Leave the channel
async function leaveChannel() {
    if (localAudioTrack) {
        localAudioTrack.close();
        localAudioTrack = null;
     }
    if (localVideoTrack) {
        localVideoTrack.close();
        localVideoTrack = null;
     }
    const localPlayerContainer = document.getElementById(uid);
    localPlayerContainer && localPlayerContainer.remove();

    client.remoteUsers.forEach((user) => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer && playerContainer.remove();
    });

    await client.leave();
    enableJoinButtons();
    console.log("Left the channel.");
}

// Disable join buttons
function disableJoinButtons() {
    document.getElementById("host-join").disabled = true;
    document.getElementById("audience-join").disabled = true;
}

// Enable join buttons
function enableJoinButtons() {
    document.getElementById("host-join").disabled = false;
    document.getElementById("audience-join").disabled = false;
}

// Set up event listeners for buttons
function setupButtonHandlers() {
    document.getElementById("host-join").onclick = joinAsHost;
    document.getElementById("audience-join").onclick = joinAsAudience;
    document.getElementById("leave").onclick = leaveChannel;
}

// Start live streaming
function startBasicLiveStreaming() {
    initializeClient();
    window.onload = setupButtonHandlers;
}

startBasicLiveStreaming();

```

--------------------------------

### Publish Local Media Tracks API

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This API allows you to publish the created local audio and video tracks to the Agora channel, making them available to other users.

```APIDOC
## Publish Local Media Tracks

### Description
Make the created audio and video tracks available for other users in the channel by using the `publish` method.

### Method
`client.publish(tracks)`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
*   **tracks** (array) - Required - An array containing the local audio and video tracks to publish.

### Request Example
```javascript
async function publishLocalTracks() {
  await client.publish([localAudioTrack, localVideoTrack]);
}
```

### Response
#### Success Response (200)
Indicates that the local media tracks have been successfully published.

#### Response Example
N/A (Success is indicated by the absence of errors during the publish operation.)
```

--------------------------------

### Get Cloud Recording Status (curl)

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Queries the status of an ongoing cloud recording session using a curl command. This endpoint requires the resource ID, session ID, and recording mode as query parameters. It's useful for monitoring the state of a recording in real-time.

```shell
curl -X GET "http://localhost:8080/cloud_recording/status?resourceId=your-resource-id&sid=your-sid&mode=mix"
```

--------------------------------

### Managing User Temporary State in Signaling 2.x (Java)

Source: https://docs.agora.io/en/signaling/overview/migration-guide

Shows how to set, get, and remove temporary states for users within a channel. This allows for dynamic user attribute management.

```java
void setState(String channelName, RtmChannelType channelType, ArrayList<StateItem> items, ResultCallback<Void> resultCallback)
void getState(String channelName, RtmChannelType channelType, String userId, ResultCallback<UserState> resultCallback)
void removeState(String channelName, RtmChannelType channelType, ArrayList<String> keys, ResultCallback<Void> resultCallback)
```

--------------------------------

### Python Client-to-Server Message Definitions (Agora.io SDK)

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Defines dataclasses for messages sent from the client to the server in the Agora.io SDK. This includes initiating audio input, creating and manipulating items, and requesting responses from AI models with various parameters.

```python
from dataclasses import dataclass, field
from typing import Union, Optional, List, Set, Dict, Any

# Assuming generate_event_id, EventType, ItemParam, Voices, AudioFormats, ToolChoice are defined elsewhere

@dataclass
class ClientToServerMessage:
    event_id: str = field(default_factory=generate_event_id)

@dataclass
class InputAudioBufferAppend(ClientToServerMessage):
    audio: Optional[str] = field(default=None)
    type: str = EventType.INPUT_AUDIO_BUFFER_APPEND

@dataclass
class InputAudioBufferCommit(ClientToServerMessage):
    type: str = EventType.INPUT_AUDIO_BUFFER_COMMIT

@dataclass
class InputAudioBufferClear(ClientToServerMessage):
    type: str = EventType.INPUT_AUDIO_BUFFER_CLEAR

@dataclass
class ItemCreate(ClientToServerMessage):
    item: Optional[ItemParam] = field(default=None)
    type: str = EventType.ITEM_CREATE
    previous_item_id: Optional[str] = None

@dataclass
class ItemTruncate(ClientToServerMessage):
    item_id: Optional[str] = field(default=None)
    content_index: Optional[int] = field(default=None)
    audio_end_ms: Optional[int] = field(default=None)
    type: str = EventType.ITEM_TRUNCATE

@dataclass
class ItemDelete(ClientToServerMessage):
    item_id: Optional[str] = field(default=None)
    type: str = EventType.ITEM_DELETE

@dataclass
class ResponseCreateParams:
    commit: bool = True
    cancel_previous: bool = True
    append_input_items: Optional[List[ItemParam]] = None
    input_items: Optional[List[ItemParam]] = None
    modalities: Optional[Set[str]] = None
    instructions: Optional[str] = None
    voice: Optional[Voices] = None
    output_audio_format: Optional[AudioFormats] = None
    tools: Optional[List[Dict[str, Any]]] = None
    tool_choice: Optional[ToolChoice] = None
    temperature: Optional[float] = None
    max_response_output_tokens: Optional[Union[int, str]] = None

@dataclass
class ResponseCreate(ClientToServerMessage):
    type: str = EventType.RESPONSE_CREATE
    response: Optional[ResponseCreateParams] = None

@dataclass
class ResponseCancel(ClientToServerMessage):
    type: str = EventType.RESPONSE_CANCEL

DEFAULT_CONVERSATION = "default"

@dataclass
class UpdateConversationConfig(ClientToServerMessage):
    type: str = EventType.UPDATE_CONVERSATION_CONFIG
    label: str = DEFAULT_CONVERSATION
    subscribe_to_user_audio: Optional[bool] = None
    voice: Optional[Voices] = None
    system_message: Optional[str] = None
    temperatu
```

--------------------------------

### Start Task (Join)

Source: https://docs.agora.io/en/real-time-stt/reference/migration-guide

This endpoint starts a new Real-Time Speech-To-Text task. In version 7.x, the 'start' method is replaced by 'join'. This simplified workflow removes the need for a 'builderToken'.

```APIDOC
## POST /api/speech-to-text/v1/projects/{appid}/join

### Description
Starts a Real-Time Speech-To-Text task. This replaces the `start` method from version 5.x and simplifies the authentication process.

### Method
POST

### Endpoint
`https://api.agora.io/api/speech-to-text/v1/projects/{appid}/join`

### Parameters
#### Path Parameters
- **appid** (string) - Required - Your Agora application ID.

#### Query Parameters
None.

#### Request Body
- **name** (string) - Required - A unique task name (max 64 characters) for deduplication. Use different names for multiple STT tasks in the same channel.
- **uidLanguagesConfig** (object) - Optional - Configures different languages for specific UIDs.
  - **uid** (string) - Required - The user ID.
  - **language** (string) - Required - The language code (e.g., 'en-US').
- **rtcConfig** (object) - Optional - Configuration for Agora Real-Time Communication.
- **captionConfig** (object) - Optional - Configuration for STT captions.

### Request Example
```json
{
  "name": "my_stt_task_1",
  "uidLanguagesConfig": [
    {
      "uid": "user123",
      "language": "en-US"
    }
  ],
  "rtcConfig": {
    "channelName": "my_channel"
  },
  "captionConfig": {
    "mode": "rtf",
    "vendor": "google"
  }
}
```

### Response
#### Success Response (200)
- **taskId** (string) - The unique identifier for the STT task.
- **agentId** (string) - The unique identifier for the STT agent.

#### Response Example
```json
{
  "taskId": "task_abc123",
  "agentId": "agent_xyz789"
}
```
```

--------------------------------

### SDK Launch Options

Source: https://docs.agora.io/en/flexible-classroom/client-api/ui-scene_platform=web

Configuration options for launching the Flexible Classroom SDK, including various settings for recording, virtual backgrounds, and media streams.

```APIDOC
## SDK Launch Options

This section details the optional parameters that can be provided when launching the Flexible Classroom SDK.

### Parameters

*   **`recordRetryTimeout`** (number) - Optional - The timeout duration for recording page startup failure. The default value is 60. If the recording service fails to join the classroom within the specified time, recording restarts.
*   **`virtualBackgroundImages`** (string) - Optional - The URL of the virtual background image. The domain name of the resource should be the same as the domain name where you deployed smart classroom. Supports PNG and JPG format images.
*   **`webrtcExtensionBaseUrl`** (string) - Optional - The URL of the WebRTC extension. The default value is `https://solutions-apaas.agora.io/static`. If you want to use advanced features like virtual background, AI noise suppression, and image enhancement, ensure that you deploy the WebRTC extension and relative resource files in the same domain with the Flexible Classroom SDK. When you finish package using `yarn ci:build`, the generated file can be found in the `packages/agora-demo-app/build/extensions` directory. Save `extensions` under the domain of the SDK.
*   **`mediaOptions`** (object) - Optional - Media stream options, including whether to encrypt the media stream, and the encoder configuration of the camera-captured video and the screen-captured video. See `LaunchMediaOptions`.
*   **`shareUrl`** (string) - Optional - The URL for sharing.
*   **`widgets`** (array) - Optional - The widget list, which extends the capabilities of the classroom. See Embed a custom plugin.
*   **`rtcCloudProxy`** (enum) - Optional - The cloud proxy type for the RTC service: `AgoraCloudProxyType`.
*   **`rtmCloudProxyEnabled`** (boolean) - Optional - Whether to enable cloud proxy for the RTM service.
```

--------------------------------

### Get User Status Response Example

Source: https://docs.agora.io/en/3.x/voice-calling/reference/channel-management-rest-api

This JSON payload illustrates a successful response when querying a user's status. It indicates if the user is in the channel and provides details like join timestamp, platform, and role.

```json
{
    "success": true,
    "data": {
        "join": 1640330382,
        "uid": 2845863044,
        "in_channel": true,
        "platform": 7,
        "role": 2
    }
}
```

--------------------------------

### POST /apps/<yourappid>/cloud_recording/start

Source: https://docs.agora.io/en/cloud-recording/develop/screen-capture

Starts the cloud recording process, optionally with screenshot capture. Configuration for recording, snapshots, and storage is required.

```APIDOC
## POST /apps/<yourappid>/cloud_recording/start

### Description
Starts cloud recording and/or screenshot capture. When starting, you must set the `mode` to `individual` for individual recording mode. You cannot change the recording mode after starting.

### Method
POST

### Endpoint
`https://api.agora.io/v1/apps/<yourappid>/cloud_recording/start`

### Parameters
#### Headers
- **Content-type** (string) - Required - `application/json;charset=utf-8`
- **Authorization** (string) - Required - Basic authorization string.

#### Request Body
- **cname** (string) - Required - The channel name.
- **uid** (string) - Required - The user ID.
- **resourceId** (string) - Required - The resource ID obtained from the `acquire` method.
- **mode** (string) - Required - Recording mode. Set to `individual` for individual recording.
- **clientRequest** (object) - Required - Client-side request parameters.
  - **token** (string) - Optional - The dynamic key used for the channel if it requires a token.
  - **recordingConfig** (object) - Required - Configurations for stream subscription, transcoding, and the profile of the output audio and video.
  - **snapshotConfig** (object) - Required - Configures the time interval between screenshots and their file format.
    - **captureInterval** (integer) - Optional - The time interval in seconds between two successive screenshots. Range: [1, 3600]. Defaults to 10.
    - **fileType** (array) - Required - File format of the screenshots. Must be `["jpg"]`.
  - **storageConfig** (object) - Required - Configures the third-party cloud storage.
  - **recordingFileConfig** (object) - Optional - Configurations for the recorded files. Required if recording and taking screenshots simultaneously; cannot be filled if only taking screenshots during a recording process.

### Request Example
```json
{
  "cname": "httpClient463224",
  "uid": "527841",
  "resourceId": "your_resource_id",
  "mode": "individual",
  "clientRequest": {
    "token": "your_token",
    "recordingConfig": {},
    "snapshotConfig": {
      "captureInterval": 15,
      "fileType": ["jpg"]
    },
    "storageConfig": {},
    "recordingFileConfig": {}
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Success message.

#### Response Example
```json
{
  "message": "Successfully started cloud recording."
}
```
```

--------------------------------

### FastRoomConfiguration Initialization

Source: https://docs.agora.io/en/interactive-whiteboard/reference/uikit-sdk_platform=ios

Details on initializing the `FastRoomConfiguration` object with necessary parameters.

```APIDOC
## POST /websites/agora_io_en/configuration

### Description
Initializes a `FastRoomConfiguration` object used to configure a `FastRoom` instance.

### Method
POST

### Endpoint
`/websites/agora_io_en/configuration` (Conceptual - This is a SDK method call, not a REST endpoint)

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **appIdentifier** (String) - Required - App Identifier for the interactive whiteboard project.
- **roomUUID** (String) - Required - The unique identifier of the room.
- **roomToken** (String) - Required - Room Token for user authentication.
- **region** (Region) - Required - Data center enumeration (CN, US, SG, IN, EU).
- **userUID** (String) - Required - Unique identifier for the user (max 1024 bytes).
- **userPayload** (FastUserPayload) - Optional - User information for cursor display.

### Request Example
```json
{
  "appIdentifier": "YOUR_APP_IDENTIFIER",
  "roomUUID": "YOUR_ROOM_UUID",
  "roomToken": "YOUR_ROOM_TOKEN",
  "region": "US",
  "userUID": "USER_123",
  "userPayload": {
    "nickName": "Jane Doe",
    "avatar": "http://example.com/avatar.jpg"
  }
}
```

### Response
#### Success Response (200)
- **FastRoomConfiguration** (object) - A `FastRoomConfiguration` object is returned.

#### Response Example
```json
{
  "FastRoomConfiguration": "<FastRoomConfiguration Object Reference>"
}
```
```

--------------------------------

### Get Reaction Detail API

Source: https://docs.agora.io/en/agora-chat/client-api/reaction

Retrieves the specific details of a reaction for a given message. This might include information like the user who reacted and the time of reaction.

```APIDOC
## GET /chat/users/{userId}/messages/{messageId}/reactions/{reactionId}/detail

### Description
Retrieves the specific details of a reaction for a given message. This might include information like the user who reacted and the time of reaction.

### Method
GET

### Endpoint
`/chat/users/{userId}/messages/{messageId}/reactions/{reactionId}/detail`

### Parameters
#### Path Parameters
- **userId** (string) - Required - The ID of the user whose message is being queried.
- **messageId** (string) - Required - The ID of the message containing the reaction.
- **reactionId** (string) - Required - The ID of the specific reaction to get details for.

### Response
#### Success Response (200)
- **reaction_detail** (object) - Details of the specific reaction.
  - **user_id** (string) - The ID of the user who added the reaction.
  - **timestamp** (integer) - The timestamp when the reaction was added.

#### Response Example
```json
{
  "reaction_detail": {
    "user_id": "user123",
    "timestamp": 1678886400000
  }
}
```
```

--------------------------------

### Subscribe to a Message Channel - JavaScript

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

This example demonstrates how to subscribe to a message channel using the `subscribe` method. It includes various options such as `withMessage`, `withPresence`, `beQuiet`, `withMetadata`, and `withLock`. The code includes a try-catch block for handling potential errors during subscription.

```javascript
const options ={
    withMessage : true,
    withPresence : true,
    beQuiet : false,
    withMetadata : false,
    withLock : false
};
try {
 const result = await rtm.subscribe("chat_room", options);
    console.log(result);
} catch (status) {
    console.log(status);
}
```

--------------------------------

### Create and Initialize Agora Signaling Client Instance in Unity

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

This example shows how to create and initialize the Agora Signaling client instance using the `CreateAgoraRtmClient` method. It includes setting essential configuration parameters such as `appId`, `userId`, and `presenceTimeout` within an `RtmConfig` object. The code also demonstrates a recommended try-catch block to handle potential initialization errors.

```csharp
RtmConfig config = new RtmConfig();

// get the appId from your Agora console
config.appId = "my_appId";

// user ID to be used as a device identifier
config.userId ="Tony";

// set Presence Timeout
config.presenceTimeout = 30;

// it is recommended to use the Try-catch pattern to catch initialization errors
try
{
    rtmClient = RtmClient.CreateAgoraRtmClient(config);
}
catch (RTMException e)
{
    Debug.Log(string.Format("{0} is failed, ErrorCode : {1}, due to: {2}", e.Status.Operation , e.Status.ErrorCode , e.Status.Reason));
}
```

--------------------------------

### Cloud Player Request Examples

Source: https://docs.agora.io/en/media-pull/reference/restful-api

Examples of request bodies for creating cloud players, with and without transcoding.

```APIDOC
## Media Pull without transcoding

### Request Body Example
```json
{
  "player": {
    "streamUrl": "rtmp://example.agora.io/live/class32/101",
    "channelName": "class32",
    "token": "2a784467d6",
    "uid": 101,
    "idleTimeout": 300,
    "playTs": 1575508644,
    "name": "test"
  }
}
```

## Media Pull with transcoding

### Request Body Example
```json
{
  "player": {
    "audioOptions": {
      "profile": 1
    },
    "videoOptions": {
      "width": 1920,
      "height": 1080,
      "frameRate": 15,
      "bitrate": 400,
      "codec": "VP9",
      "gop": 30,
      "fillMode": "fill"
    },
    "streamUrl": "rtmp://example.agora.io/live/class32/101",
    "channelName": "class32",
    "token": "2a784467d6",
    "uid": 101,
    "idleTimeout": 300,
    "playTs": 1575508644,
    "name": "test"
  }
}
```
```

--------------------------------

### Retrieve Single User Attributes (REST API Example)

Source: https://docs.agora.io/en/agora-chat/restful-api/user-attributes-management

This example shows how to retrieve the attributes of a specific user using a GET request. It requires an Authorization header for authentication and a Content-Type header. The endpoint includes the username as a path parameter. The response body, on success, contains a 'data' object with the user's attributes.

```shell
curl -X GET -H 'Authorization: Bearer {YourAppToken}' -H 'Content-Type:  application/json''http://XXXX/XXXX/XXXX/metadata/user/XXXX'
```

--------------------------------

### Start Screen Sharing

Source: https://docs.agora.io/en/broadcast-streaming/overview/release-notes

This code demonstrates how to initiate screen sharing. It can be done either before joining a channel or after joining, by calling `startScreenCapture` and then configuring the `publishScreenCaptureVideo` option.

```objectivec
// Before joining channel:
[self.agoraKit startScreenCapture:SCREEN_CAPTURE_TYPE_WINDOW];
ChannelMediaOptions options;
options.publishScreenCaptureVideo = YES;
[self.agoraKit joinChannelByToken:token channelId:channelId uid:uid mediaOptions:options delegate:self error:nil];

// After joining channel:
[self.agoraKit startScreenCapture:SCREEN_CAPTURE_TYPE_WINDOW];
ChannelMediaOptions options;
options.publishScreenCaptureVideo = YES;
[self.agoraKit updateChannelMediaOptions:options];
```

--------------------------------

### Start Web Page Recording

Source: https://docs.agora.io/en/cloud-recording/reference/restful-api

Configure and start a web page recording task with various options for audio, video, and recording duration.

```APIDOC
## POST /websites/agora_io_en/start

### Description
Starts a web page recording task with specified configurations.

### Method
POST

### Endpoint
/websites/agora_io_en/start

### Parameters
#### Request Body
- **url** (String) - Required - The address of the page to be recorded.
- **audioProfile** (Number) - Required - Audio configuration (0: 48kHz, music, mono, ~48Kbps; 1: 48kHz, music, mono, ~128Kbps; 2: 48kHz, music, stereo, ~192Kbps).
- **videoWidth** (Number) - Required - The output video width (pixel). Product with `videoHeight` <= 1920x1080.
- **videoHeight** (Number) - Required - The output video height (pixel). Product with `videoWidth` <= 1920x1080.
- **maxRecordingHour** (Number) - Required - Maximum duration of web page recording in hours (1-720).
- **videoBitrate** (Number) - Optional - The bitrate of the output video (Kbps). Defaults to 2000 if resolution >= 1280x720, else 1500.
- **videoFps** (Number) - Optional - The frame rate of the output video (fps). Range [5,60]. Default is 15.
- **mobile** (Boolean) - Optional - Enable mobile web rendering mode. Defaults to false.
- **maxVideoDuration** (Number) - Optional - Maximum length of MP4 slice file in minutes. Range [30,240]. Default is 120.
- **onhold** (Boolean) - Optional - Pause page recording when starting the task. Defaults to false.
- **readyTimeout** (Number) - Optional - Page load timeout in seconds. Range [0,60]. Default is 0 (no detection).

### Request Example
```json
{
  "url": "https://example.com",
  "audioProfile": 1,
  "videoWidth": 1280,
  "videoHeight": 720,
  "maxRecordingHour": 24,
  "videoFps": 30,
  "mobile": false,
  "maxVideoDuration": 60,
  "onhold": false,
  "readyTimeout": 10
}
```

### Response
#### Success Response (200)
- **taskId** (String) - The ID of the recording task.

#### Response Example
```json
{
  "taskId": "rec_abcdef123456"
}
```
```

--------------------------------

### Get Room List

Source: https://docs.agora.io/en/interactive-whiteboard/reference/whiteboard-api/room-management

Retrieves a list of rooms. This endpoint allows for paginated retrieval of rooms, starting from a specific room UUID and specifying the number of rooms to return.

```APIDOC
## GET /v5/rooms

### Description
Retrieves a list of rooms. You can specify a starting point and the number of rooms to return.

### Method
GET

### Endpoint
`/v5/rooms`

### Parameters
#### Query Parameters
- **beginUUID** (string) - Optional - The UUID of the room you want to start querying from.
- **limit** (integer) - Optional - The maximum number of rooms on the list. The range is (0, 1000]. Defaults to 100 if not specified.

#### Request Header Parameters
- **token** (string) - Required - A SDK token or room token with the `writer` or `admin` role.
- **region** (string) - Required - Specifies a data center to process the request (`us-sv`, `sg`, `in-mum`, `eu`, `cn-hz`).

### Request Example
```
GET /v5/rooms/?beginUUID=0e6exxxxxx4d95&limit=2  
Host: api.netless.link  
region: us-sv  
Content-Type: application/json  
token: NETLESSSDK_YWs9QlxxxxxxM2MjRi  
```

### Response
#### Success Response (200)
- **body** (array) - A list of room objects. Each object contains details similar to the 'Get Room Information' endpoint.

#### Response Example
```json
[
  {
    "uuid": "4axxxxx96b",
    "teamUUID": "RMmxxxxx5aw",
    "appUUID": "i5xxxxx1AQ",
    "isRecord": false,
    "isBan": false,
    "createdAt": "2021-01-18T06:56:29.432Z",
    "limit": 0
  }
]
```
```

--------------------------------

### Generate Room Token (POST)

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-sdk

Generates a room token required for app clients to authenticate and join an Interactive Whiteboard room. This is typically done on your app server.

```APIDOC
## POST /v5/tokens/rooms/<Room UUID>

### Description
Generates a room token for authentication when an app client joins a room.

### Method
POST

### Endpoint
`https://api.netless.link/v5/tokens/rooms/<Room UUID>`

### Parameters
#### Path Parameters
- **Room UUID** (string) - Required - The unique identifier of the room.

#### Headers
- **token** (string) - Required - Your SDK Token.
- **Content-Type** (string) - Required - Should be `application/json`.
- **region** (string) - Required - The data center region (e.g., `us-sv`).

#### Request Body
- **lifespan** (integer) - Optional - The lifespan of the token in milliseconds. Defaults to 3600000 (1 hour).
- **role** (string) - Optional - The role of the user (e.g., `admin`).

### Request Example
```json
{
  "lifespan": 3600000,
  "role": "admin"
}
```

### Response
#### Success Response (200)
- **Room Token** (string) - The generated room token.

#### Response Example
```json
"NETLESSROOM_YWs9XXXXXXXXXXXZWNhNjk"
```
```

--------------------------------

### Python Dataclasses for Realtime Session and Parameters

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

Provides dataclass definitions for managing real-time sessions, including parameters for session updates, VAD (Voice Activity Detection), audio transcription, and tool choices. These structures standardize the data exchanged for session configuration and control.

```python
import jsonfrom dataclasses import dataclass, asdict, field, is_dataclassfrom typing import Any, Dict, Literal, Optional, List, Set, Unionfrom enum import Enumimport uuidPCM_SAMPLE_RATE = 24000PCM_CHANNELS = 1def generate_event_id() -> str:
    return str(uuid.uuid4())# Enumsclass Voices(str, Enum):
    Alloy = "alloy"
    Echo = "echo"
    Fable = "fable"
    Nova = "nova"
    Nova_2 = "nova_2"
    Nova_3 = "nova_3"
    Nova_4 = "nova_4"
    Nova_5 = "nova_5"
    Onyx = "onyx"
    Shimmer = "shimmer"class AudioFormats(str, Enum):
    PCM16 = "pcm16"
    G711_ULAW = "g711_ulaw"
    G711_ALAW = "g711_alaw"class ItemType(str, Enum):
    Message = "message"
    FunctionCall = "function_call"
    FunctionCallOutput = "function_call_output"class MessageRole(str, Enum):
    System = "system"
    User = "user"
    Assistant = "assistant"class ContentType(str, Enum):
    InputText = "input_text"
    InputAudio = "input_audio"
    Text = "text"
    Audio = "audio"@dataclassclass FunctionToolChoice:
    name: str  # Name of the function
    type: str = "function"  # Fixed value for type# ToolChoice can be either a literal string or FunctionToolChoiceToolChoice = Union[str, FunctionToolChoice]  # "none", "auto", "required", or FunctionToolChoice@dataclassclass RealtimeError:
    type: str  # The type of the error
    message: str  # The error message
    code: Optional[str] = None  # Optional error code
    param: Optional[str] = None  # Optional parameter related to the error
    event_id: Optional[str] = None  # Optional event ID for tracing@dataclassclass InputAudioTranscription:
    model: str = "whisper-1"  # Default transcription model is "whisper-1"@dataclassclass ServerVADUpdateParams:
    threshold: Optional[float] = None  # Threshold for voice activity detection
    prefix_padding_ms: Optional[int] = None  # Amount of padding before the voice starts (in milliseconds)
    silence_duration_ms: Optional[int] = None  # Duration of silence before considering speech stopped (in milliseconds)
    type: str = "server_vad"  # Fixed value for VAD type@dataclassclass Session:
    id: str  # The unique identifier for the session
    model: str  # The model associated with the session (e.g., "gpt-3")
    expires_at: int  # Expiration time of the session in seconds since the epoch (UNIX timestamp)
    object: str = "realtime.session"  # Fixed value indicating the object type
    modalities: Set[str] = field(default_factory=lambda: {"text", "audio"})  # Set of allowed modalities (e.g., "text", "audio")
    instructions: Optional[str] = None  # Instructions or guidance for the session
    voice: Voices = Voices.Alloy  # Voice configuration for audio responses, defaulting to "Alloy"
    turn_detection: Optional[ServerVADUpdateParams] = None  # Voice activity detection (VAD) settings
    input_audio_format: AudioFormats = AudioFormats.PCM16  # Audio format for input (e.g., "pcm16")
    output_audio_format: AudioFormats = AudioFormats.PCM16  # Audio format for output (e.g., "pcm16")
    input_audio_transcription: Optional[InputAudioTranscription] = None  # Audio transcription model settings (e.g., "whisper-1")
    tools: List[Dict[str, Union[str, Any]]] = field(default_factory=list)  # List of tools available during the session
    tool_choice: Literal["auto", "none", "required"] = "auto"  # How tools should be used in the session
    temperature: float = 0.8  # Temperature setting for model creativity
    max_response_output_tokens: Union[int, Literal["inf"]] = "inf"  # Maximum number of tokens in the response, or "inf" for unlimited
    @dataclassclass SessionUpdateParams:
    model: Optional[str] = None  # Optional string to specify the model
    modalities: Optional[Set[str]] = None  # Set of allowed modalities (e.g., "text", "audio")
    instructions: Optional[str] = None  # Optional instructions string
    voice: Optional[Voices] = None  # Voice selection, can be `None` or from `Voices` Enum
    turn_detection: Optional[ServerVADUpdateParams] = None  # Server VAD update params
    input_audio_format: Optional[AudioFormats] = None  # Input audio format from `AudioFormats` Enum
    output_audio_format: Optional[AudioFormats] = None  # Output audio format from `AudioFormats` Enum
    input_audio_transcription: Optional[InputAudioTranscription] = None  # Optional transcription model
    tools: Optional[List[Dict[str, Union[str, any]]]] = None  # List of tools (e.g., dictionaries)
    tool_choice: Optional[ToolChoice] = None  # ToolChoice, either string or `FunctionToolChoice`
    temperature: Optional[float] = None  # Optional temperature for response generation
    max_response_output_tokens: Optional[Union[int, str]] = None  # Max response tokens, "inf" for infinite# Define individual message item param types@dataclassclass SystemMessageItemParam:
    content: List[dict]  # This can be more specific based on content structure
    id: Optional[str] = None
    status: Optional[str] = None
    type: str = "message"
    role: str = "system"
```

--------------------------------

### Get User Metadata Async in C#

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Retrieves the metadata and metadata items for a specified user. It requires the user ID as a parameter and returns a RtmResult containing the metadata.

```csharp
RtmResult<GetUserMetadataResult> GetUserMetadataAsync(string userId);

```

--------------------------------

### Android Voice Calling Setup with Agora SDK

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=android

This Kotlin code sets up an Android application for voice calling using the Agora SDK. It includes permission requests, Agora Engine initialization, and joining a communication channel. It handles user-related events such as users joining or leaving the channel.

```kotlin
package com.example.<projectname>

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.agora.rtc2.ChannelMediaOptions
import io.agora.rtc2.Constants
import io.agora.rtc2.IRtcEngineEventHandler
import io.agora.rtc2.RtcEngine
import io.agora.rtc2.RtcEngineConfig

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQ_ID = 22
    private val myAppId = "<Your app ID>"
    private val channelName = "<Your channel name>"
    private val token = "<Your token>"

    private var mRtcEngine: RtcEngine? = null

    private val mRtcEventHandler = object : IRtcEngineEventHandler() {
        override fun onJoinChannelSuccess(channel: String?, uid: Int, elapsed: Int) {
            super.onJoinChannelSuccess(channel, uid, elapsed)
            runOnUiThread {
                showToast("Joined channel $channel")
            }
        }

        override fun onUserJoined(uid: Int, elapsed: Int) {
            runOnUiThread {
                showToast("A user joined")
            }
        }

        override fun onUserOffline(uid: Int, reason: Int) {
            super.onUserOffline(uid, reason)
            runOnUiThread {
                showToast("User offline: $uid")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        if (checkPermissions()) {
            startVoiceCalling()
        } else {
            requestPermissions()
        }
    }

    private fun checkPermissions(): Boolean {
        for (permission in getRequiredPermissions()) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }

    private fun requestPermissions() {
        ActivityCompat.requestPermissions(this, getRequiredPermissions(), PERMISSION_REQ_ID)
    }

    private fun getRequiredPermissions(): Array<String> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.BLUETOOTH_CONNECT
            )
        } else {
            arrayOf(Manifest.permission.RECORD_AUDIO)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (checkPermissions()) {
            startVoiceCalling()
        }
    }

    private fun startVoiceCalling() {
        initializeAgoraVoiceSDK()
        joinChannel()
    }

    private fun initializeAgoraVoiceSDK() {
        try {
            val config = RtcEngineConfig().apply {
                mContext = baseContext
                mAppId = myAppId
                mEventHandler = mRtcEventHandler
            }
            mRtcEngine = RtcEngine.create(config)
        } catch (e: Exception) {
            throw RuntimeException("Error initializing RTC engine: ${e.message}")
        }
    }

    private fun joinChannel() {
        val options = ChannelMediaOptions().apply {
            clientRoleType = Constants.CLIENT_ROLE_BROADCASTER
            channelProfile = Constants.CHANNEL_PROFILE_COMMUNICATION
            publishMicrophoneTrack = true
        }
        mRtcEngine?.joinChannel(token, channelName, 0, options)
    }

    override fun onDestroy() {
        super.onDestroy()
        cleanupAgoraEngine()
    }

    private fun cleanupAgoraEngine() {
        mRtcEngine?.apply {
            stopPreview()
            leaveChannel()
        }
        mRtcEngine = null
    }

    private fun showToast(message: String) {
        runOnUiThread {
            Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
        }
    }
}
```

--------------------------------

### Get User Metadata

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves metadata associated with a specific user ID. This method returns a future tuple containing the status of the operation and the user metadata if successful.

```APIDOC
## GET /users/{userId}/metadata

### Description
Retrieves metadata associated with a specific user ID.

### Method
GET

### Endpoint
/users/{userId}/metadata

### Parameters
#### Path Parameters
- **userId** (String) - Required - The ID of the user whose metadata is to be retrieved.

### Request Example
```dart
var (status, response) = await rtmClient.getStorage.getUserMetadata("Tony");

if (status.error == true) {
 print(status);
} else {
 print(response);
}
```

### Response
#### Success Response (200)
- **userId** (String) - The user ID of the current operation.
- **data** (Metadata) - User metadata.

#### Response Example
```json
{
  "userId": "Tony",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```
```

--------------------------------

### Get Lock Information API

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Retrieves information about locks within a channel, including the total number of locks, lock names, owners, and time-to-live (TTL) for each lock.

```APIDOC
## GET /getLock

### Description
If you want to query the lock information such as lock total number, lock name, and lock user, time to live, you can call the `getLock` method on the client.

### Method
GET

### Endpoint
/getLock

### Parameters
#### Path Parameters
None

#### Query Parameters
- **channelName** (string) - Required - Channel name.
- **channelType** (string) - Required - Channel type. For details, see Channel Types.

### Request Example
```
GET /getLock?channelName=chat_room&channelType=STREAM
```

### Response
#### Success Response (200)
- **timestamp** (number) - Timestamp of the successful operation.
- **channelName** (string) - Channel name.
- **channelType** (string) - Channel type.
- **totalLocks** (string) - Total lock number.
- **lockDetails** (array) - An array of lock details.
  - **lockName** (string) - Lock name.
  - **owner** (string) - Lock owner.
  - **ttl** (number) - Time to live in seconds of the lock.

#### Response Example
```json
{
  "timestamp": 1678886400,
  "channelName": "chat_room",
  "channelType": "STREAM",
  "totalLocks": "5",
  "lockDetails": [
    {
      "lockName": "my_lock_1",
      "owner": "Alice",
      "ttl": 3600
    },
    {
      "lockName": "my_lock_2",
      "owner": "Bob",
      "ttl": 1800
    }
  ]
}
```
```

--------------------------------

### PUT /v2/rooms/{yourAppId}/records/states/1

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=android

This endpoint appears to be for updating the state of a recording, potentially starting or stopping it with specific web recording configurations. The provided example uses a PUT request with detailed web recording configurations.

```APIDOC
## PUT /{region}/edu/apps/{yourAppId}/v2/rooms/test_class/records/states/1

### Description
This endpoint is used to update the state and configurations of a recording. The example provided shows updating a recording with specific web recording configurations, including the URL, root URL, and publish RTMP status. It also includes a retry timeout.

### Method
PUT

### Endpoint
`https://api.sd-rtn.com/{region}/edu/apps/{yourAppId}/v2/rooms/{roomUUid}/records/states/{state}`

### Parameters
#### Path Parameters
- **region** (String) - Required - The region for connection. For details, see Network geofencing. Flexible Classroom supports the following regions: `cn`, `ap`, `eu`, `na`.
- **yourAppId** (String) - Required - Agora App ID.
- **roomUUid** (String) - Required - The classroom ID. This is the globally unique identifier of a classroom.
- **state** (Integer) - Required - The state of the recording to update. The example uses `1`.

#### Request Body
- **mode** (String) - Optional - The mode of recording. Example: `"web"`.
- **webRecordConfig** (Object) - Optional - Web recording configurations.
  - **url** (String) - Required - The URL of the web page to record.
  - **rootUrl** (String) - Required - The root URL for web recording.
  - **publishRtmp** (String) - Required - Whether to publish RTMP. Example: `"true"`.
- **retryTimeout** (Integer) - Optional - The timeout in seconds for retrying the operation. Example: `60`.

### Request Example
```json
{
    "mode": "web",
    "webRecordConfig": {
        "url": "https://webdemo.agora.io/xxxxx/?userUuid={recorder_id}&roomUuid={room_id_to_be_recorded}&roleType=0&roomType=4&pretest=false&rtmToken={recorder_token}&language=en&appId={your_app_id}",
        "rootUrl": "https://xxx.yyy.zzz",
        "publishRtmp": "true"
    },
    "retryTimeout": 60
}
```

### Response
#### Success Response (200)
- **code** (Integer) - Business status code: `0`: The request succeeds. Non-zero: The request fails.
- **msg** (String) - The detailed information.
- **ts** (Number) - The current Unix timestamp (in milliseconds) of the server in UTC.
- **data** (Object) - The returned object, which contains the following data:
  - **recordId** (String) - The unique identifier of the recording.
  - **sid** (String) - The `sid` of cloud recording.
  - **resourceId** (String) - The `resourceId` of cloud recording.
  - **state** (Integer) - The recording state: `0`: The recording ends. `1`: The recording begins.
  - **startTime** (Integer) - The timestamp (ms) when the recording begins.
  - **streamingUrl** (Object) - The URL address of pulling the CDN stream:
    - **rtmp** (String) - The URL of the RTMP streaming.
    - **flv** (String) - The URL of the FLV streaming.
    - **hls** (String) - The URL of the HLS streaming.

#### Response Example
```json
{
    "code": 0,
    "ts": 1610450153520,
    "streamingUrl": {
        "rtmp": "",
        "flv": "",
        "hls": ""
    }
}
```
```

--------------------------------

### Get Group Announcement - Curl Example

Source: https://docs.agora.io/en/agora-chat/restful-api/chat-group-management/manage-group-announcement-files

This snippet demonstrates how to retrieve the announcement for a specific group chat using a cURL command. It requires an authorization token and the group ID. The response includes the announcement content if successful.

```bash
curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer <YourAppToken>' 'http://XXXX/XXXX/XXXX/chatgroups/66021836783617/announcement'
```

--------------------------------

### Initialize AgoraRTC Client for Live Streaming

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

Initializes an AgoraRTC client instance configured for live streaming. This function sets the communication mode to 'live', the video codec to 'vp8', and the user role to 'host'. It also sets up event listeners for the client.

```javascript
// RTC client instance  
let client = null;   
  
// Initialize the AgoraRTC client  
function initializeClient() {  
    client = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: "host" });  
 setupEventListeners();  
}

```

--------------------------------

### End-to-End Encryption Setup in Signaling 2.x (Java)

Source: https://docs.agora.io/en/signaling/overview/migration-guide

Details the configuration for end-to-end encryption using RtmEncryptionConfig. This feature ensures secure communication by specifying encryption mode, key, and salt.

```java
RtmEncryptionConfig with `encryptionMode`, `encryptionKey`, `encryptionSalt` parameters
```

--------------------------------

### Setup Remote Video Display (Java & Kotlin)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

Configures the display for a remote user's video stream. This function is called when a remote user joins the channel, passing their unique user ID to set up their video feed. It adds a SurfaceView to a designated container and configures rendering.

```java
private void setupRemoteVideo(int uid) {
    FrameLayout container = findViewById(R.id.remote_video_view_container);
    SurfaceView surfaceView = new SurfaceView(getBaseContext());
    surfaceView.setZOrderMediaOverlay(true);
    container.addView(surfaceView);
    mRtcEngine.setupRemoteVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid));
}
```

```kotlin
private fun setupRemoteVideo(uid: Int) {
    val container = findViewById<FrameLayout>(R.id.remote_video_view_container)
    val surfaceView = SurfaceView(baseContext).apply {
        setZOrderMediaOverlay(true)
    }
    container.addView(surfaceView)
    mRtcEngine.setupRemoteVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid))
}
```

--------------------------------

### Cloud Recording Transcoding Configuration

Source: https://docs.agora.io/en/help/integration-issues/fail_to_upload

This example shows the structure of `transcodingConfig` when starting a cloud recording. Incorrect settings can lead to recording failures. Refer to Agora's documentation for recommended video profiles and output modes.

```javascript
const transcodingConfig = {
  transcodingUserCount: 1,
  transcodingVideoWidth: 1280,
  transcodingVideoHeight: 720,
  transcodingVideoBitrate: 1000,
  transcodingVideoFramerate: 30,
  transcodingAudioSampleRate: 44100,
  transcodingAudioBitrate: 64,
  backgroundConfig: {
    enabled: false
  },
  watermarkConfig: {
    enabled: false
  }
};

// Use this transcodingConfig when calling the start method
// e.g., RtcEngine.startCloudRecording(channelName, mode, storageConfig, transcodingConfig);
```

--------------------------------

### Start Audio Mixing - C++

Source: https://docs.agora.io/en/video-calling/advanced-features/audio-mixing-and-sound-effects

This code demonstrates how to start playing a music file using `startAudioMixing`. It includes error handling by checking the return value and logging the operation details. This is essential for background music or soundscapes in applications.

```cpp
void CAgoraAudioMixingDlg::OnBnClickedButtonMixingStart()
{
    CString audioUrl = GetExePath() + _T("\\ID_MUSIC_01.m4a");
    // Start playing the music file
    int ret = m_rtcEngine->startAudioMixing(cs2utf8(audioUrl).c_str(), false, -1);
    CString strInfo;
    strInfo.Format(_T("startAudioMixing path:%s, ret:%d"), audioUrl.AllocSysString(), ret);
    m_lstInfo.InsertString(m_lstInfo.GetCount(), strInfo);
}
```

--------------------------------

### Setup Local Video View (Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Sets up the `SurfaceView` for displaying the local video feed. It finds a `FrameLayout` in the layout by its ID (`local_video_view_container`) and adds the `SurfaceView` to it. The `mRtcEngine` is then configured to render the local video onto this `SurfaceView`.

```kotlin
private fun setupLocalVideo() {
    val container = findViewById<FrameLayout>(R.id.local_video_view_container)
    val surfaceView = SurfaceView(this)
    container.addView(surfaceView)
    mRtcEngine?.setupLocalVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0))
}
```

--------------------------------

### Initialize Golang Module

Source: https://docs.agora.io/en/flexible-classroom/develop/integrate/authentication-workflow

Initializes a new Go module for the project, defining its import path and dependency requirements. This command should be run in the project's root directory.

```bash
$ go mod init sampleServer  

```

--------------------------------

### Cloud Player Response Example

Source: https://docs.agora.io/en/media-pull/reference/restful-api

Example of a successful response body when creating or managing a cloud player.

```APIDOC
## Response Example

### Success Response (200)
```json
{
  "player": {
    "uid": 101,
    "id": "2a784467d647bb87b60b719f6fa56317",
    "createTs": 1575508644,
    "status": "running"
  },
  "fields": "player.uid,player.id,player.createTs,player.status"
}
```
```

--------------------------------

### POST /rooms/test_room

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api_platform=web

Creates a small cloud classroom with specified configurations, including room name, type, and role permissions for audio and video.

```APIDOC
## POST /rooms/test_room

### Description
Creates a small cloud classroom with specified configurations, including room name, type, and role permissions for audio and video.

### Method
POST

### Endpoint
`https://api.agora.io/{region}/edu/apps/{YourAppId}/v2/rooms/test_room`

### Parameters
#### Query Parameters
- **region** (String) - Required - The region for connection.
- **YourAppId** (String) - Required - Agora App ID.

#### Request Body
- **roomName** (String) - Required - The name of the room.
- **roomType** (Integer) - Required - The type of the room (e.g., 10 for a small cloud classroom).
- **roleConfig** (Object) - Optional - Configuration for roles within the room.
  - **2** (Object) - Represents a specific role (e.g., student).
    - **defaultStream** (Object) - Default stream settings for the role.
      - **audioState** (Integer) - Optional - The audio state of the default stream (0: Disabled, 1: Enabled).
      - **state** (Integer) - Required - The state of the stream (e.g., 1 for enabled).
      - **videoState** (Integer) - Optional - The video state of the default stream (0: Disabled, 1: Enabled).
    - **limit** (Integer) - Required - The maximum number of users for this role.
- **roomProperties** (Object) - Optional - Additional properties for the room.
  - **schedule** (Object) - Scheduling information.
    - **startTime** (Number) - Required - The start time of the schedule in milliseconds.
    - **duration** (Number) - Required - The duration of the schedule in minutes.
    - **closeDelay** (Number) - Required - The delay before closing in minutes.
  - **processes** (Object) - Process-related settings.
    - **handsUp** (Object) - Hands-up feature configuration.
      - **maxAccept** (Integer) - Optional - The maximum number of students "on the stage".
      - **defaultAcceptRole** (String) - Optional - The default user role on the stage.
  - **flexProps** (Object) - Custom properties for flexible classroom features.
  - **widgets** (Object) - State of widgets in the classroom.
    - **netlessBoard** (Object) - Netless whiteboard state (0: off, 1: on).
    - **easemobIM** (Object) - Easemob IM state (0: off, 1: on).

### Request Example
```json
{
  "roomName": "test_class",
  "roomType": 4,
  "roleConfig": {
    "2": {
      "limit": 50,
      "defaultStream": {
        "state": 1,
        "videoState": 1,
        "audioState": 1
      }
    }
  },
  "roomProperties": {
    "schedule": {
      "startTime": 1655452800000,
      "duration": 600,
      "closeDelay": 300
    },
    "processes": {
      "handsUp": {
        "maxAccept": 10,
        "defaultAcceptRole": ""
      }
    },
    "flexProps": {
      "exampleKey": "exampleValue"
    },
    "widgets": {
      "netlessBoard": {
        "state": 0
      },
      "easemobIM": {
        "state": 1
      }
    }
  }
}
```

### Response
#### Success Response (200)
- **code** (Integer) - Request status code (0 for success).
- **msg** (String) - Detailed information about the request status.
- **ts** (Number) - The current Unix timestamp (in milliseconds) of the server in UTC.

#### Response Example
```json
{
  "msg": "Success",
  "code": 0,
  "ts": 1610167740309
}
```

#### Error Response (409)
- **code** (Integer) - Request status code (409 for room already exists).
- **msg** (String) - Detailed information about the request status.
- **ts** (Number) - The current Unix timestamp (in milliseconds) of the server in UTC.
```

--------------------------------

### Get Online Users

Source: https://docs.agora.io/en/signaling/reference/api_platform=unity

Retrieves a list of online users in a specified channel along with their presence information. You can customize the returned data by including user IDs and temporary states.

```APIDOC
## GET /api/presence/online_users

### Description
Retrieves a list of online users in a specified channel. Options allow for including user IDs and temporary states.

### Method
GET

### Endpoint
/api/presence/online_users

### Parameters
#### Query Parameters
- **channelName** (string) - Required - Channel name. If omitted, returns all online users matching channelType conditions.
- **channelType** (RTM_CHANNEL_TYPE) - Required - Channel type (e.g., MESSAGE).
- **includeUserId** (bool) - Optional - Defaults to `true`. Whether to include user IDs in the response.
- **includeState** (bool) - Optional - Defaults to `false`. Whether to include temporary state data of online users.
- **page** (string) - Optional - Page number for paginated results. Defaults to the first page.

### Request Example
```csharp
var options = new PresenceOptions();
options.includeState = true;

var (status, response) = await rtmClient.GetPresence().GetOnlineUsersAsync("Chat_room", RTM_CHANNEL_TYPE.MESSAGE, options);
```

### Response
#### Success Response (200)
- **Status** (RtmStatus) - Status of the operation.
- **Response** (GetOnlineUsersResult) - Contains user presence information.

**RtmStatus properties:**
- **Error** (bool) - Indicates if the operation resulted in an error.
- **ErrorCode** (string) - Error code if an error occurred.
- **Operation** (string) - Type of operation performed.
- **Reason** (string) - Reason for the error.

**GetOnlineUsersResult properties:**
- **NextPage** (string) - Token for the next page of results, or null if no more pages.
- **UserStateList** (UserState[]) - List of online users and their states.
- **TotalOccupancy** (int) - Total number of online users in the channel (or number of UserStateList entries).

**UserState properties:**
- **states** (StateItem[]) - Temporary state information for the user.
- **userId** (string) - The ID of the user.

**StateItem properties:**
- **key** (string) - The key of the user state.
- **value** (string) - The value of the user state.

#### Response Example
```json
{
  "Status": {
    "Error": false,
    "ErrorCode": "0",
    "Operation": "GetOnlineUsers",
    "Reason": "Success"
  },
  "Response": {
    "NextPage": null,
    "UserStateList": [
      {
        "userId": "user123",
        "states": [
          { "key": "status", "value": "online" }
        ]
      }
    ],
    "TotalOccupancy": 1
  }
}
```
```

--------------------------------

### Set up File Access Permissions (Android)

Source: https://docs.agora.io/en/voice-calling/advanced-features/audio-mixing-and-sound-effects

Instructions for setting up necessary permissions in the AndroidManifest.xml file for projects with targetSdkVersion 20 or higher.

```APIDOC
## Set up file access permissions (Android)

For Android projects with `targetSdkVersion` greater than or equal to 20, add the following to the project's `AndroidManifest.xml` file:

```xml
<application>
    android:usesCleartextTraffic="true"
    android:requestLegacyExternalStorage="true"
</application>
```
```

--------------------------------

### Get Lock Information in Agora RTM

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Queries information about locks in a channel, such as the number of locks, their names, owners, and expiration times. This method is called on the RTM client instance.

```javascript
// Example of how you might call getLock (actual implementation depends on RTM client structure)
async function getLockInfo(channelName, channelType) {
    try {
        // Assuming 'rtm' is an initialized RTM client and 'lock' is its lock module
        const lockInfo = await rtm.lock.getLock(channelName, channelType);
        console.log('Lock information:', lockInfo);
        return lockInfo;
    } catch (error) {
        console.error('Failed to get lock information:', error);
        return error;
    }
}
```

--------------------------------

### Python: Implement RealtimeKitAgent run method

Source: https://docs.agora.io/en/open-ai-integration/get-started/quickstart

This Python code snippet implements the `run` method for the `RealtimeKitAgent`. It handles waiting for remote users, subscribing to audio streams, managing connection states, and launching concurrent tasks for AI model communication. It includes error handling for exceptions and graceful shutdown.

```python
async def run(self) -> None:
    def log_exception(t: asyncio.Task[Any]) -> None:
        if not t.cancelled() and t.exception():
            logger.error(
                "unhandled exception",
                exc_info=t.exception(),
            )

    logger.info("Waiting for remote user to join")
    self.subscribe_user = await wait_for_remote_user(self.channel)
    logger.info(f"Subscribing to user {self.subscribe_user}")
    await self.channel.subscribe_audio(self.subscribe_user)

    async def on_user_left(
        agora_rtc_conn: RTCConnection, user_id: int, reason: int
    ):
        logger.info(f"User left: {user_id}")
        if self.subscribe_user == user_id:
            self.subscribe_user = None
            logger.info("Subscribed user left, disconnecting")
            await self.channel.disconnect()

    self.channel.on("user_left", on_user_left)

    disconnected_future = asyncio.Future[None]()

    def callback(agora_rtc_conn: RTCConnection, conn_info: RTCConnInfo, reason):
        logger.info(f"Connection state changed: {conn_info.state}")
        if conn_info.state == 1:
            if not disconnected_future.done():
                disconnected_future.set_result(None)

    self.channel.on("connection_state_changed", callback)

    asyncio.create_task(self.rtc_to_model()).add_done_callback(log_exception)
    asyncio.create_task(self.model_to_rtc()).add_done_callback(log_exception)

    asyncio.create_task(self._process_model_messages()).add_done_callback(
        log_exception
    )

    await disconnected_future
    logger.info("Agent finished running")
except asyncio.CancelledError:
    logger.info("Agent cancelled")
except Exception as e:
    logger.error(f"Error running agent: {e}")
    raise
```

--------------------------------

### Channel Management API Example (Golang)

Source: https://docs.agora.io/en/interactive-live-streaming/channel-management-api/overview

Example of how to use the channel management RESTful API with Golang, including Base64 encoding for authentication.

```APIDOC
## GET /dev/v1/channel/{appId}

### Description
Retrieves channel information, including the total number of channels and users per channel.

### Method
GET

### Endpoint
`https://api.sd-rtn.com/dev/v1/channel/{appId}`

### Parameters
#### Path Parameters
- **appId** (string) - Required - The application ID for which to retrieve channel information.

#### Query Parameters
None

#### Request Body
None

### Request Example
```go
package main

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	// Retrieve environment variables
	customerKey := os.Getenv("AGORA_CUSTOMER_KEY")
	customerSecret := os.Getenv("AGORA_CUSTOMER_SECRET")
	appID := os.Getenv("AGORA_APP_ID")

	if customerKey == "" || customerSecret == "" || appID == "" {
		fmt.Println("Environment variables AGORA_CUSTOMER_KEY, AGORA_CUSTOMER_SECRET, and AGORA_APP_ID must be set.")
		return
	}

	// Concatenate the customer ID and secret, then encode them using Base64
	plainCredentials := customerKey + ":" + customerSecret
	base64Credentials := base64.StdEncoding.EncodeToString([]byte(plainCredentials))

	// Create the authorization header
	authorizationHeader := "Basic " + base64Credentials

	// Build the request
	req, err := http.NewRequest("GET", "https://api.sd-rtn.com/dev/v1/channel/"+appID, nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	// Add headers
	req.Header.Add("Authorization", authorizationHeader)
	req.Header.Add("Content-Type", "application/json")

	// Create an HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	// Print the response body
	fmt.Println(string(body))
	// Add any subsequent processing logic for the response content here
}
```

### Response
#### Success Response (200)
- **body** (string) - The response body containing channel statistics.

#### Response Example
```json
{
  "channels": [
    {
      "channelName": "channel1",
      "onlineUsers": 10
    }
  ],
  "totalChannels": 1
}
```
```

--------------------------------

### Start and Stop Recording

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference_platform=linux-cpp

Initiates or terminates the recording process. Recording can be started globally or for a specific user ID. Returns 0 on success, and a negative value on failure.

```cpp
virtual int startRecording() = 0;
virtual int stopRecording() = 0;
virtual int startSingleRecordingByUid(user_id_t userId) = 0;
virtual int stopSingleRecordingByUid(user_id_t userId) = 0;
```

--------------------------------

### Setup Remote Video Stream (Kotlin)

Source: https://docs.agora.io/en/broadcast-streaming/get-started/get-started-sdk

Sets up a SurfaceView for displaying a remote user's video stream and configures it using the RtcEngine. This method is typically called when a new user joins the channel.

```kotlin
private fun setupRemoteVideo(uid: Int) {
        val container: FrameLayout = findViewById(R.id.remote_video_view_container)
        val surfaceView = SurfaceView(baseContext)
        surfaceView.setZOrderMediaOverlay(true)
        container.addView(surfaceView)
        mRtcEngine?.setupRemoteVideo(VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid))
    }
```

--------------------------------

### Handle Token Expiration Event

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

An example of listening for the 'tokenPrivilegeWillExpire' event and renewing the RTM token when it's about to expire. This ensures uninterrupted service by proactively refreshing the authentication token.

```javascript
rtmClient.addEventListener('tokenPrivilegeWillExpire', async (channelName) => {
 if (!channelName) {
 // RTM Token is about to expire
 const newToken = "<Your new token>";
 await rtmClient.renewToken(newToken);
 }
});
```

--------------------------------

### Unsubscribe All Users from Topic (Dart)

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

This example shows how to unsubscribe all users from a specified topic. It includes error handling and prints the status or response. Requires the Agora Signaling SDK.

```dart
var (status,response) = await stChannel.unsubscribeTopic("myTopic");  
if (status.error == true) {  
 print(status);  
} else {  
 print(response);  
}
```

--------------------------------

### Unsubscribe from Topic (JavaScript)

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Demonstrates how to unsubscribe from a topic using the `unsubscribeTopic` method. It shows two examples: unsubscribing from specific users within a topic and unsubscribing from the entire topic. Error handling is included.

```javascript
try {
 const result = await rtm.unsubscribeTopic( "Gesture", { users:["Tony","Bo"] });
    console.log("unsubscribe Topic success: ", result);
} catch (status) {
    console.log("unsubscribe Topic failed: ", result);
}
```

```javascript
try {
 const result = await rtm.unsubscribeTopic("Gesture");
    console.log("unsubscribe topic success: ", result);
} catch (status) {
    console.log("unsubscribe topic failed: ", result);
}
```

--------------------------------

### AgoraService Initialization and Release

Source: https://docs.agora.io/en/server-gateway/reference/api_platform=python

APIs for initializing and releasing the AgoraService, which is the entry point for the SDK.

```APIDOC
## POST /agora/service/initialize

### Description
Initializes the `AgoraService` object with the provided configuration.

### Method
POST

### Endpoint
/agora/service/initialize

### Parameters
#### Request Body
- **config** (AgoraServiceConfig) - Required - Initialization configuration.

### Request Example
```json
{
  "config": {
    "appId": "YOUR_APP_ID"
    // other configuration fields
  }
}
```

### Response
#### Success Response (200)
- **result** (int) - 0 for success, less than 0 for failure.

#### Response Example
```json
{
  "result": 0
}
```

---

## DELETE /agora/service/release

### Description
Releases the `AgoraService` object and its associated resources.

### Method
DELETE

### Endpoint
/agora/service/release

### Parameters
None

### Response
#### Success Response (200)
- **result** (int) - Indicates the success or failure of the operation.

#### Response Example
```json
{
  "result": 0
}
```
```

--------------------------------

### Set Up Event Listeners for User Streams - JavaScript

Source: https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk

This function sets up event listeners for Agora SDK events. It specifically handles the `user-published` event to subscribe to and play remote user's media streams (video and audio) and the `user-unpublished` event to clean up remote player elements when a user leaves or stops publishing. Event listeners should be set up before joining a channel.

```javascript
function setupEventListeners() {
 // Declare event handler for "user-published"
 client.on("user-published", async (user, mediaType) => {
 // Subscribe to media streams
 await client.subscribe(user, mediaType);
 if (mediaType === "video") {
 // Specify the ID of the DOM element or pass a DOM object.
 user.videoTrack.play("<Specify a DOM element>");
 }
 if (mediaType === "audio") {
 user.audioTrack.play();
 }
 });

 // Handle the "user-unpublished" event to unsubscribe from the user's media tracks
 client.on("user-unpublished", async (user) => {
 const remotePlayerContainer = document.getElementById(user.uid);
 remotePlayerContainer && remotePlayerContainer.remove();
 });
}
```

--------------------------------

### Install Node.js Dependencies for Token Generation

Source: https://docs.agora.io/en/interactive-whiteboard/develop/generate-token-app-server

Installs the necessary Node.js dependencies required for the JavaScript token generation scripts. Ensure Node.js LTS is installed before running this command.

```bash
npm install
```

--------------------------------

### Example: ScreenRecordSource Implementation

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/reference/custom-advanced

An example demonstrating how to use external screen recording as a video source by implementing the TextureSource interface.

```APIDOC
## Example: ScreenRecordSource Implementation

### Description
This example shows how to implement `TextureSource` to use external screen recording as the video source. It covers implementing callbacks, creating a virtual display, and handling texture frames.

### Step 1: Implement Callbacks

```java
public class ScreenRecordSource extends TextureSource {
    private Context mContext;
    private boolean mIsStart;
    private VirtualDisplay mVirtualDisplay;
    private MediaProjection mMediaProjection;

    public ScreenRecordSource(Context context, int width, int height, int dpi, MediaProjection mediaProjection) {
        super(null, width, height);
        mContext = context;
        mMediaProjection = mediaProjection;
    }

    @Override
    protected boolean onCapturerOpened() {
        createVirtualDisplay();
        return true;
    }

    @Override
    protected boolean onCapturerStarted() {
        return mIsStart = true;
    }

    @Override
    protected void onCapturerStopped() {
        mIsStart = false;
    }

    @Override
    protected void onCapturerClosed() {
        releaseVirtualDisplay();
    }
}
```

### Step 2: Create Virtual Display for Capturing Screen Data

```java
private void createVirtualDisplay() {
    Surface inputSurface = new Surface(getSurfaceTexture());
    if (mVirtualDisplay == null) {
        mVirtualDisplay = mMediaProjection.createVirtualDisplay("MainScreen", mWidth, mHeight, mDpi,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, inputSurface, null, null);
    }
}

private void releaseVirtualDisplay() {
    if (mVirtualDisplay != null) {
        mVirtualDisplay.release();
    }
    mVirtualDisplay = null;
}
```

### Step 3: Reimplement Callbacks for Getting Video Data

```java
@Override
public void onTextureFrameAvailable(int oesTextureId, float[] transformMatrix, long timestampNs) {
    super.onTextureFrameAvailable(oesTextureId, transformMatrix, timestampNs);
    if (mIsStart && mConsumer != null && mConsumer.get() != null) {
        mConsumer.get().consumeTextureFrame(oesTextureId, TEXTURE_OES.intValue(), mWidth, mHeight,
                                            0, System.currentTimeMillis(), transformMatrix);
    }
}
```

**Note:** Ensure you call `super.onTextureFrameAvailable(oesTextureId, transformMatrix, timeStampNs)`.

### Step 4: Release Resources

```java
public void sourceRelease() {
   releaseProjection(); // Assuming this method exists to release MediaProjection
   release();
}
```
```

--------------------------------

### Start Audio Individual Non-transcoding Recording

Source: https://docs.agora.io/en/cloud-recording/develop/individual-nontranscoding

This section describes how to start audio individual non-transcoding recording by calling the `start` method with specific configurations.

```APIDOC
## POST /v1/apps/<yourappid>/cloud_recording/start

### Description
Starts cloud recording in individual mode. This example focuses on audio individual non-transcoding recording.

### Method
POST

### Endpoint
`/v1/apps/<yourappid>/cloud_recording/start`

### Parameters
#### Path Parameters
- **yourappid** (string) - Required - Your Agora application ID.

#### Request Body
- **cname** (string) - Required - The channel name.
- **uid** (string) - Required - The user ID.
- **resourceId** (string) - Required - The resource ID obtained from the `acquire` method.
- **clientRequest** (object) - Required - Client-specific request parameters.
  - **token** (string) - Required - The dynamic key used for the channel. Required if the channel uses a token.
  - **recordingConfig** (object) - Required - Configures stream subscription, transcoding, and the profile of the output audio and video.
    - **streamTypes** (integer) - Required - The type of the media stream to subscribe to. Set to `0` for Audio Individual non-transcoding Recording.
    - **streamMode** (string) - Required - The output mode of the media stream in individual mode. Set to `"original"` for Audio Individual non-transcoding Recording.
  - **storageConfig** (object) - Required - Configures the third-party cloud storage.

### Request Example
```json
{
  "cname": "your_channel_name",
  "uid": "your_user_id",
  "resourceId": "your_resource_id",
  "clientRequest": {
    "token": "your_dynamic_key",
    "recordingConfig": {
      "streamTypes": 0,
      "streamMode": "original"
    },
    "storageConfig": {
      "accessKey": "your_access_key",
      "bucketName": "your_bucket_name",
      "region": "your_region"
    }
  }
}
```

### Response
#### Success Response (200)
- **message** (string) - Indicates the success of the operation.

#### Response Example
```json
{
  "message": "success"
}
```
```

--------------------------------

### POST /api/speech-to-text/v1/projects/{appId}/join

Source: https://docs.agora.io/en/real-time-stt/reference/migration-guide

Starts a new speech-to-text task by joining a channel. This endpoint replaces the 'acquire' and 'start' methods from previous versions.

```APIDOC
## POST /api/speech-to-text/v1/projects/{appId}/join

### Description
Starts a new speech-to-text task by joining a channel. This endpoint replaces the 'acquire' and 'start' methods from previous versions. It requires a project ID and configuration details for the speech-to-text task.

### Method
POST

### Endpoint
/api/speech-to-text/v1/projects/{appId}/join

### Parameters
#### Path Parameters
- **appId** (string) - Required - The unique identifier for your Agora project.

#### Query Parameters
None

#### Request Body
- **name** (string) - Required - A name for the speech-to-text task.
- **languages** (array) - Required - An array of language codes (e.g., ["zh-CN"]) for speech recognition.
- **maxIdleTime** (integer) - Optional - Maximum idle time in seconds before the task is considered inactive.
- **rtcConfig** (object) - Required - Real-time connection configuration.
  - **channelName** (string) - Required - The name of the RTC channel to join.
  - **subBotUid** (string) - Required - The User ID for the subscriber bot.
  - **subBotToken** (string) - Required - The token for the subscriber bot.
  - **pubBotUid** (string) - Required - The User ID for the publisher bot.
  - **pubBotToken** (string) - Required - The token for the publisher bot.
  - **subscribeAudioUids** (array) - Optional - An array of UIDs to subscribe to audio from.

### Request Example
```json
{
  "name": "my-stt-task",
  "languages": ["zh-CN"],
  "maxIdleTime": 60,
  "rtcConfig": {
    "channelName": "your-channel",
    "subBotUid": "123",
    "subBotToken": "your-sub-token",
    "pubBotUid": "456",
    "pubBotToken": "your-pub-token",
    "subscribeAudioUids": ["789"]
  }
}
```

### Response
#### Success Response (200)
- **agent_id** (string) - The unique identifier for the speech-to-text agent.

#### Response Example
```json
{
  "agent_id": "your-agent-id"
}
```
```

--------------------------------

### User Attributes Operations in Signaling 2.x (Java)

Source: https://docs.agora.io/en/signaling/overview/migration-guide

Covers setting, getting, removing, and updating metadata (attributes) for users. This allows for persistent user-specific data storage.

```java
void setUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)
void getUserMetadata(String userId, ResultCallback<Metadata> resultCallback)
void removeUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)
void updateUserMetadata(String userId, Metadata data, MetadataOptions options, ResultCallback<Void> resultCallback)
```

--------------------------------

### Basic HTML Structure for Fastboard App

Source: https://docs.agora.io/en/interactive-whiteboard/get-started/get-started-uikit

Provides the minimal HTML structure for a web application using Fastboard. It includes a container div with specified dimensions for the whiteboard and links the main JavaScript file for client-side logic.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
</head>
<body>
    <div id="app" style="width: 600px; height: 400px; border: 1px solid;"></div>
    <script type="module" src="/main.js"></script>
</body>
</html>

```

--------------------------------

### Android Real-Time Voice Calling with Agora SDK (Java)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=android

This Java code demonstrates setting up and using the Agora.io SDK for real-time voice calling in an Android application. It handles permissions, initializes the SDK, joins a communication channel, and manages user join/leave events. Ensure you replace placeholders like `<Your app ID>`, `<Your channel name>`, and `<Your token>` with your actual Agora credentials.

```java
package com.example.<projectname>;import android.Manifest;import android.content.pm.PackageManager;import android.os.Build;import android.os.Bundle;import android.widget.Toast;import androidx.annotation.NonNull;import androidx.appcompat.app.AppCompatActivity;import androidx.core.app.ActivityCompat;import androidx.core.content.ContextCompat;import io.agora.rtc2.ChannelMediaOptions;import io.agora.rtc2.Constants;import io.agora.rtc2.IRtcEngineEventHandler;import io.agora.rtc2.RtcEngine;import io.agora.rtc2.RtcEngineConfig;public class MainActivity extends AppCompatActivity {    private static final int PERMISSION_REQ_ID = 22;    private final String myAppId = "<Your app ID>";    private final String channelName = "<Your channel name>";    private final String token = "<Your token>";    private RtcEngine mRtcEngine;    private final IRtcEngineEventHandler mRtcEventHandler = new IRtcEngineEventHandler() {        // Callback when successfully joining the channel        @Override        public void onJoinChannelSuccess(String channel, int uid, int elapsed) {            super.onJoinChannelSuccess(channel, uid, elapsed);            showToast("Joined channel " + channel);        }        // Callback when a remote user or host joins the current channel        @Override        public void onUserJoined(int uid, int elapsed) {            super.onUserJoined(uid, elapsed);            runOnUiThread(() -> {                showToast("User joined: " + uid); // Show toast for user joining            });        }        // Callback when a remote user or host leaves the current channel        @Override        public void onUserOffline(int uid, int reason) {            super.onUserOffline(uid, reason);            runOnUiThread(() -> {                showToast("User offline: " + uid); // Show toast for user going offline            });        }    };    @Override    protected void onCreate(Bundle savedInstanceState) {        super.onCreate(savedInstanceState);        setContentView(R.layout.activity_main);        if (checkPermissions()) {            startVoiceCalling();        } else {            requestPermissions();        }    }    private boolean checkPermissions() {        for (String permission : getRequiredPermissions()) {            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {                return false;            }        }        return true;    }    private void requestPermissions() {        ActivityCompat.requestPermissions(this, getRequiredPermissions(), PERMISSION_REQ_ID);    }    private String[] getRequiredPermissions() {        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {            return new String[]{                Manifest.permission.RECORD_AUDIO,                Manifest.permission.READ_PHONE_STATE,                Manifest.permission.BLUETOOTH_CONNECT            };        } else {            return new String[]{Manifest.permission.RECORD_AUDIO};        }    }    @Override    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {        super.onRequestPermissionsResult(requestCode, permissions, grantResults);        if (checkPermissions()) {            startVoiceCalling();        }    }    private void startVoiceCalling() {        initializeAgoraVoiceSDK();        joinChannel();    }    private void initializeAgoraVoiceSDK() {        try {            RtcEngineConfig config = new RtcEngineConfig();            config.mContext = getApplicationContext();            config.mAppId = myAppId;            config.mEventHandler = mRtcEventHandler;            mRtcEngine = RtcEngine.create(config);        } catch (Exception e) {            throw new RuntimeException("Error initializing RTC engine: " + e.getMessage());        }    }    private void joinChannel() {        ChannelMediaOptions options = new ChannelMediaOptions();        options.clientRoleType = Constants.CLIENT_ROLE_BROADCASTER;        options.channelProfile = Constants.CHANNEL_PROFILE_COMMUNICATION;        options.publishMicrophoneTrack = true;        mRtcEngine.joinChannel(token, channelName, 0, options);    }    @Override    protected void onDestroy() {        super.onDestroy();        cleanupAgoraEngine();    }    private void cleanupAgoraEngine() {        if (mRtcEngine != null) {            mRtcEngine.leaveChannel();            mRtcEngine = null;        }    }    private void showToast(String message) {        runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());    }}
```

--------------------------------

### Response Example for Getting All Projects

Source: https://docs.agora.io/en/1.x/signaling/reference/agora-console-rest-api

This JSON structure represents a successful response when fetching all projects. It contains an array of project objects, detailing each project's ID, name, keys, recording server, status, and creation date.

```JSON
{
  "projects": [
    {
      "id": "xxxx",
      "name": "project1",
      "sign_key": "4855xxxxxxxxxxxxxxxxxxxxxxxxeae2",
      "vendor_key": "4855xxxxxxxxxxxxxxxxxxxxxxxxeae2",
      "recording_server": null,
      "status": 1,
      "created": 1464165672
    },
    {
      "id": "xxxx",
      "name": "project1",
      "sign_key": "2c01da6d6f6741df88ec47005f08572b",
      "vendor_key": "eb00cd2b222a4eeaa24fc6046d90b227",
      "recording_server": null,
      "status": 1,
      "created": 1637153755
    }
  ]
}
```

--------------------------------

### Example: Add YouTube Button to Toolbar

Source: https://docs.agora.io/en/interactive-whiteboard/reference/uikit-sdk_platform=web

An example demonstrating how to add a YouTube button to the toolbar's extension center. When clicked, it inserts a Plyr player to play a specified YouTube video.

```typescript
apps.push({
    icon: "https://api.iconify.design/logos:youtube-icon.svg?color=currentColor",
    kind: "Plyr",
    label: "YouTube",
 onClick(app) {
        app.manager.addApp({
            kind: "Plyr",
            options: { title: "YouTube" },
            attributes: {
                src: "https://www.youtube.com/embed/bTqVqk7FSmY",
                provider: "youtube",
            },
        });
    },
});
```

--------------------------------

### Configure RtcEngine for Screen Sharing

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java code snippet illustrates the configuration of the RtcEngine object within the screen sharing process. The comment indicates the intention to mute all audio streams as part of the setup for screen sharing.

```java
// Mute all audio streams
```

--------------------------------

### Initialize Agora Engine and Join Channel in Swift

Source: https://docs.agora.io/en/3.x/video-calling/quickstart-guide/get-started-sdk

This code initializes the Agora RtcEngine with your App ID and sets up the local video view. It then enables the video stream and joins a specified channel using a temporary token. Replace placeholder values with your actual App ID, token, and channel name.

```swift
func initializeAndJoinChannel() {
    agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: "Your App ID", delegate: self)
    agoraKit?.enableVideo()

    let videoCanvas = AgoraRtcVideoCanvas()
    videoCanvas.uid = 0
    videoCanvas.renderMode = .hidden
    videoCanvas.view = localView
    agoraKit?.setupLocalVideo(videoCanvas)

    agoraKit?.joinChannel(byToken: "Your token", channelId: "Channel name", info: nil, uid: 0, joinSuccess: { (channel, uid, elapsed) in
    })
}
```

--------------------------------

### Initialize RTM Configurations (Dart)

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Demonstrates initializing various RTM configuration objects including proxy, logging, and encryption, and then combining them into a main RTM configuration object. This example shows setting heartbeat interval, presence timeout, and area codes.

```dart
final proxyConfig = RtmProxyConfig(
      protocolType : RtmProxyType.http,
      server : "x.x.x.x",
      port : 8080,
      account : "Tony",
      password : "pwd" );
  
final logConfig = RtmLogConfig(
      filePath : "xxxx",
      fileSizeInKB : 1024;
      leave : RtmLogLevel.info );
  
final encryptionConfig = RtmEncryptionConfig(
      encryptionMode : RtmEncryptionMode.aes256Gcm,
      encryptionKey : "XXXXX",
      encryptionSalt : [1,2,3,4,5]);
  
final rtmConfig = RtmConfig(
      heartbeatInterval : 10,
      presenceTimeout : 5,
      proxyConfig : proxyConfig,
      logConfig : logConfig,
      areaCode : {RtmAreaCode.cn, RtmAreaCode.na},
      encryptionConfig : encryptionConfig );
```

--------------------------------

### Set Up Local Media Player View (Java/Kotlin)

Source: https://docs.agora.io/en/interactive-live-streaming/advanced-features/play-media

Renders the local media player view using the `setupLocalVideo` method. This involves creating a `VideoCanvas` object with appropriate configurations such as render mode, mirror mode, and specifying the video source as the media player. Ensure a `SurfaceView` is available for rendering.

```java
VideoCanvas videoCanvas = new VideoCanvas(surfaceView, Constants.RENDER_MODE_HIDDEN, Constants.VIDEO_MIRROR_MODE_AUTO, Constants.VIDEO_SOURCE_MEDIA_PLAYER, mediaPlayer.getMediaPlayerId(), 0);
mRtcEngine.setupLocalVideo(videoCanvas);
```

```kotlin
val videoCanvas = VideoCanvas(
    surfaceView,
    Constants.RENDER_MODE_HIDDEN,
    Constants.VIDEO_MIRROR_MODE_AUTO,
    Constants.VIDEO_SOURCE_MEDIA_PLAYER,
    mediaPlayer.mediaPlayerId,
    0
)
mRtcEngine.setupLocalVideo(videoCanvas)
```

--------------------------------

### Get Push Label Details with cURL

Source: https://docs.agora.io/en/agora-chat/restful-api/push-notification-management

This example shows how to retrieve the detailed information for a specific push label using a cURL command. It specifies the HTTP GET method and includes the label name in the URL path. An Authorization header is required for authentication. The response body includes the label's name, description, user count, and creation timestamp.

```curl
curl -L -X GET 'http://XXXX/XXXX/XXXX/push/label/90' \
-H 'Authorization: Bearer <YourAppToken>'
```

--------------------------------

### Get User Metadata in Dart

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Retrieves metadata associated with a specific user ID. It returns a tuple containing RtmStatus and GetUserMetadataResult. Error handling is demonstrated by checking the status.error flag.

```dart
var (status,response) = await rtmClient.getStorage.getUserMetadata( "Tony" );  

if (status.error == true) {  
 print(status);  
} else {  
 print(response);  
}
```

--------------------------------

### Screen Sharing Service: onBind Method Implementation

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java code snippet demonstrates the onBind method within the ScreenSharingService. This method is invoked when a client binds to the service. It orchestrates the setup of the RtcEngine, configures video encoding using provided intent extras, and joins the specified channel.

```java
@Override
 public IBinder onBind(Intent intent) {
 // Creates a RtcEngine object
 setUpEngine(intent);
 // Set video encoding configurations
 setUpVideoConfig(intent);
 // Join the channel
 joinChannel(intent);
 return mBinder;
    }
```

--------------------------------

### GET /presence/onlineUsers

Source: https://docs.agora.io/en/signaling/reference/api_platform=web

Call the `getOnlineUsers` method to query user information in real time such as the number of online users, the list of online users and their temporary user status in the specified channel.

```APIDOC
## GET /presence/onlineUsers

### Description
Call the `getOnlineUsers` method to query user information in real time such as the number of online users, the list of online users and their temporary user status in the specified channel.

### Method
`rtm.presence.getOnlineUsers(channelName: string, channelType: string, options?: object): Promise<getOnlineUsersResponse>;`

### Parameters
#### Query Parameters
- **channelName** (string) - Required - Channel name.
- **channelType** (string) - Required - Channel type. For details, see Channel Types.
- **options** (object) - Optional - Query options.
  - **includedUserId** (boolean) - Optional - Whether the returned result contains the user ID of online users. Defaults to `true`.
  - **includedState** (boolean) - Optional - Whether the returned result contains the temporary user state of online users. Defaults to `false`.
  - **page** (string) - Optional - Page number of the returned result. If not provided, the SDK returns the first page by default. You can check whether there is a next page in the `nextPage` property of the returned result.

### Request Example
```javascript
const options = {
    includedUserId : true,
    includedState : true,
    page : "yourBookMark"
}
try{
 const result = await rtm.presence.getOnlineUsers( "chat_room", "MESSAGE", options );
    console.log(result);
} catch(status){
    console.log(status);
}
```

### Response
#### Success Response (200)
- **timestamp** (number) - Timestamp of the successful operation.
- **totalOccupancy** (number) - Number of the online users in the channel.
- **occupants** (Array<object>) - List of the online users in the channel and their temporary user state.
- **nextPage** (string) - Page number of the next page.

#### Response Example
```json
{
  "timestamp": 1678886400000,
  "totalOccupancy": 5,
  "occupants": [
    {
      "userId": "user1",
      "state": "online"
    },
    {
      "userId": "user2",
      "state": "online"
    }
  ],
  "nextPage": "page2"
}
```

#### Error Response
- **ErrorInfo** (object) - Information about the error if the method call fails.
```

--------------------------------

### POST /cloud_recording/update/subscriber-list

Source: https://docs.agora.io/en/cloud-recording/get-started/middleware-quickstart

Updates the subscriber list for a cloud recording session. This allows dynamic modification of which users' streams are being recorded.

```APIDOC
## POST /cloud_recording/update/subscriber-list

### Description
Updates the subscriber list for a cloud recording session. This allows dynamic modification of which users' streams are being recorded.

### Method
POST

### Endpoint
/cloud_recording/update/subscriber-list

### Parameters
#### Request Body
- **cname** (string) - Required - The channel name.
- **uid** (string) - Required - The user ID associated with the recording.
- **resourceId** (string) - Required - The resource ID of the recording session.
- **sid** (string) - Required - The session ID of the recording.
- **recordingMode** (string) - Required - The mode of the recording (e.g., "mix").
- **recordingConfig** (object) - Required - Configuration for updating the subscription list.
  - **streamSubscribe** (object) - Required - Subscription details.
    - **audioUidList** (object) - Optional - List of UIDs to subscribe to audio from.
      - **subscribeAudioUids** (array) - List of user IDs for audio subscription.
        - *Items are strings.*
    - **videoUidList** (object) - Optional - List of UIDs to subscribe to video from.
      - **subscribeVideoUids** (array) - List of user IDs for video subscription.
        - *Items are strings.*

### Request Example
```json
{
  "cname": "test_channel",
  "uid": "uid-from-start-response",
  "resourceId": "your-resource-id",
  "sid": "your-sid",
  "recordingMode": "mix",
  "recordingConfig": {
    "streamSubscribe": {
      "audioUidList": {
        "subscribeAudioUids": ["2345", "3456"]
      },
      "videoUidList": {
        "subscribeVideoUids": ["2345", "3456"]
      }
    }
  }
}
```

### Response
#### Success Response (200)
- **cname** (string) - The channel name.
- **uid** (string) - The user ID associated with the recording.
- **resourceId** (string) - The resource ID of the recording session.
- **sid** (string) - The session ID of the recording.
- **timestamp** (string) - The timestamp of the update operation.

#### Response Example
```json
{
  "cname": "string",
  "uid": "string",
  "resourceId": "string",
  "sid": "string",
  "timestamp": "string"
}
```
```

--------------------------------

### Start Single User Recording - Java

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference_platform=linux-java

Starts recording for a specified user. Requires the user's userId. Returns 0 on success, negative on failure.

```Java
public int startSingleRecordingByUid(String userId)

```

--------------------------------

### Basic Usage: Leaving a Stream Channel

Source: https://docs.agora.io/en/signaling/reference/api_platform=react-native

Example demonstrating how to call the `leave` method to exit a Stream Channel and handle both successful responses and potential errors using a try-catch block.

```javascript
try{
 const result = await streamChannel.leave();
 console.log(result);
} catch (status){
 console.log(status);
}
```

--------------------------------

### Configure Environment Variables for Example App

Source: https://docs.agora.io/en/agora-chat/get-started/get-started-uikit

Sets up essential environment variables within the React Native Chat UI Kit example app. This includes configuring test mode, Agora App Key, user ID, password or token, and account type.

```typescript
export const test = false; // test mode
export const appKey = ''; // from Agora console
export const id = ''; // default user id
export const ps = ''; // default password or token
export const accountType = 'agora';
```

--------------------------------

### Setup Remote Video View (Java)

Source: https://docs.agora.io/en/video-calling/get-started/get-started-sdk

Configures the video view for a remote user identified by their UID. It creates a SurfaceView, adds it to the designated container, and then sets up the remote video stream using the RTC engine.

```java
private void setupRemoteVideo(int uid) {
    FrameLayout container = findViewById(R.id.remote_video_view_container);
    SurfaceView surfaceView = new SurfaceView(getBaseContext());
    surfaceView.setZOrderMediaOverlay(true);
    container.addView(surfaceView);
    mRtcEngine.setupRemoteVideo(new VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid));
}
```

--------------------------------

### Initialize Agora RTC Engine (C#)

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk

Initializes the Agora Real-Time Communication engine. This involves creating an IRtcEngine instance, configuring it with your App ID and channel profile, and then calling the Initialize method. Ensure the IRtcEngine instance is stored for subsequent operations. Dependencies include the Agora.Rtc namespace and RtcEngineContext.

```csharp
internal IRtcEngine RtcEngine;

// Fill in your app ID
private string _appID= "";

private void SetupVideoSDKEngine() {
    // Create an IRtcEngine instance
    RtcEngine = Agora.Rtc.RtcEngine.CreateAgoraRtcEngine();
    RtcEngineContext context = new RtcEngineContext();
    context.appId = _appID;
    context.channelProfile = CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_COMMUNICATION;
    context.audioScenario = AUDIO_SCENARIO_TYPE.AUDIO_SCENARIO_DEFAULT;
    // Initialize the instance
    RtcEngine.Initialize(context);
}
```

--------------------------------

### Upgrade from AccessToken to AccessToken2 (Go Example)

Source: https://docs.agora.io/en/1.x/signaling/develop/authentication-workflow

This section provides an example of how to update a Go token server to use AccessToken2, including replacing import statements and updating the `BuildToken` function.

```APIDOC
## PUT /api/tokens/upgrade/accesstoken2

### Description
Updates a Go token server to use AccessToken2. This involves changing import paths and the `BuildToken` function signature.

### Method
PUT

### Endpoint
/api/tokens/upgrade/accesstoken2

### Notes
This documentation outlines the code changes required for upgrading.

### Code Updates (Go)

1.  **Replace import statement:**
    ```go
    // Replace "github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/go/src/RtmTokenBuilder"
    // with "github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/go/src/rtmtokenbuilder2".
    import (
        rtmtokenbuilder "github.com/AgoraIO/Tools/DynamicKey/AgoraDynamicKey/go/src/rtmtokenbuilder2"
        // ... other imports
    )
    ```

2.  **Update the `BuildToken` function:**
    ```go
    // Previously: result, err := rtmtokenbuilder.BuildToken(appID, appCertificate, rtm_uid, rtmtokenbuilder.RoleRtmUser, expireTimestamp)
    // Now: Remove rtmtokenbuilder.RoleRtmUser.
    result, err := rtmtokenbuilder.BuildToken(appID, appCertificate, rtm_uid, expireTimestamp)
    ```

### Testing
The client does not require updates. The expiration logic changes with AccessToken2. For server-side authentication, refer to RESTful API Authentication and use new request headers.
```

--------------------------------

### Start and Control Audio Mixing in Java

Source: https://docs.agora.io/en/interactive-live-streaming/advanced-features/audio-mixing-and-sound-effects

Demonstrates how to start audio mixing with a specified file path, loop count, and playback position. It also shows how to handle the `onAudioMixingStateChanged` callback and control playback using pause, resume, stop, set position, and volume adjustment methods.

```Java
mRtcEngine.startAudioMixing("Your file path", false, -1, 0);

@Override
public void onAudioMixingStateChanged(int state, int errorCode) {
    super.onAudioMixingStateChanged(state, errorCode);
}

rtcEngine.pauseAudioMixing();
rtcEngine.resumeAudioMixing();
rtcEngine.getAudioMixingDuration();
rtcEngine.setAudioMixingPosition(500);
rtcEngine.adjustAudioMixingPublishVolume(50);
rtcEngine.adjustAudioMixingPlayoutVolume(50);
```

--------------------------------

### Channel Metadata Operations in Signaling 2.x (Java)

Source: https://docs.agora.io/en/signaling/overview/migration-guide

Details the API for setting, getting, removing, and updating metadata for channels. This enables persistent data storage associated with channels.

```java
void setChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)
void getChannelMetadata(String channelName, RtmChannelType channelType, ResultCallback<Metadata> resultCallback)
void removeChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)
void updateChannelMetadata(String channelName, RtmChannelType channelType, Metadata data, MetadataOptions options, String lockName, ResultCallback<Void> resultCallback)
```

--------------------------------

### Initialize and Connect to Agora RTC Engine

Source: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk_platform=python

This Python code initializes the RtcEngine with an App ID and connects to a specified channel with a user ID. It assumes the `RtcEngine` class is defined elsewhere and handles asynchronous operations using `asyncio`.

```python
import asyncio
from rtc import RtcEngine  # Import the RtcEngine class from rtc.py

async def main():
    appid = "<Your app Id>" # Replace with your Agora App ID
    channelId = "demo" # Replace with your desired channel ID
    uid = "123" # Replace with your unique user ID

    rtc_engine = RtcEngine(appid)
    channel = await rtc_engine.connect(channelId, uid)

    # Keep the script running to listen for events
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Query User List - cURL

Source: https://docs.agora.io/en/agora-chat/restful-api/user-system-registration

This example demonstrates how to query a list of users using a GET request with cURL. It includes pagination using a cursor and specifies the number of users to retrieve. The response body contains user information, a cursor for the next page, and the count of users returned.

```cURL
# Replace {YourAppToken} with the app token generated in your server.  
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer {YourAppToken}' 'http://XXXX/XXXX/XXXX/users?limit=2'
```

```json
{
  "action": "get",
  "params": {
    "limit": ["2"]
  },
  "path": "/users",
  "uri": "http://XXXX/XXXX/XXXX/users",
  "entities": [
    {
      "uuid": "ab90eff0-XXXX-XXXX-9174-8f161649a182",
      "type": "user",
      "created": 1542356511855,
      "modified": 1542356511855,
      "username": "XXXX",
      "activated": true,
      "nickname": "testuser1"
    },
    {
      "uuid": "b2aade90-XXXX-XXXX-a974-f3368f82e4f1",
      "type": "user",
      "created": 1542356523769,
      "modified": 1542356523769,
      "username": "user2",
      "activated": true,
      "nickname": "testuser2"
    }
  ],
  "timestamp": 1542558467056,
  "duration": 1,
  "cursor": "LTgzNDAxMjM3OToxTEFnNE9sNEVlaVQ0UEdhdmJNR2tB",
  "count": 2
}
```

--------------------------------

### Run Go Server Application

Source: https://docs.agora.io/en/1.x/signaling/develop/authentication-workflow

This command compiles and runs your Go server application. It executes the `main` function in the specified Go file (e.g., `server.go`), starting the HTTP server and making it ready to handle incoming requests according to the defined routes and logic.

```shell
go run server.go
```

--------------------------------

### Channel Management API Example (Java)

Source: https://docs.agora.io/en/interactive-live-streaming/channel-management-api/overview

Example of how to use the channel management RESTful API with Java, including Base64 encoding for authentication.

```APIDOC
## GET /dev/v1/channel/{appId}

### Description
Retrieves channel information, including the total number of channels and users per channel.

### Method
GET

### Endpoint
`https://api.sd-rtn.com/dev/v1/channel/{appId}`

### Parameters
#### Path Parameters
- **appId** (string) - Required - The application ID for which to retrieve channel information.

#### Query Parameters
None

#### Request Body
None

### Request Example
```java
// Customer ID
// Set the AGORA_CUSTOMER_KEY environment variable
final String customerKey = System.getenv("AGORA_CUSTOMER_KEY");
// Customer key
// Set the AGORA_CUSTOMER_SECRET environment variable
final String customerSecret = System.getenv("AGORA_CUSTOMER_SECRET");
// Set the AGORA_APP_ID variable
final String appid = System.getenv("AGORA_APP_ID");

// Concatenate the customer ID and customer secret and encode them using base64
String plainCredentials = customerKey + ":" + customerSecret;
String base64Credentials = new String(Base64.getEncoder().encode(plainCredentials.getBytes()));

// Create the authorization header
String authorizationHeader = "Basic :" + base64Credentials;

HttpClient client = HttpClient.newHttpClient();

// Create an HTTP request object
HttpRequest request = HttpRequest.newBuilder()
       .uri(URI.create("https://api.sd-rtn.com/dev/v1/channel/" + appid))
       .GET()
       .header("Authorization", authorizationHeader)
       .header("Content-Type", "application/json")
       .build();

// Send an HTTP request
HttpResponse<String> response = client.send(request,
        HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
// Add the subsequent processing logic for the response content
```

### Response
#### Success Response (200)
- **body** (string) - The response body containing channel statistics.

#### Response Example
```json
{
  "channels": [
    {
      "channelName": "channel1",
      "onlineUsers": 10
    }
  ],
  "totalChannels": 1
}
```
```

--------------------------------

### Get Recording List (GET)

Source: https://docs.agora.io/en/flexible-classroom/restful-api/classroom-api

Get the recording list in a specified classroom. You can fetch data in batches with the `nextId` parameter. You can get up to 100 pieces of data for each batch.

```APIDOC
## GET /{region}/edu/apps/{appId}/v2/rooms/{roomUUid}/records

### Description
Get the recording list in a specified classroom. You can fetch data in batches with the `nextId` parameter. You can get up to 100 pieces of data for each batch.

### Method
GET

### Endpoint
`/{region}/edu/apps/{appId}/v2/rooms/{roomUUid}/records`

### Parameters
#### Path Parameters
- **region** (String) - Required - The region for connection.
- **appId** (String) - Required - Agora App ID.
- **roomUUid** (String) - Required - The classroom ID.

#### Query Parameters
- **nextId** (String) - Optional - The ID of the next recording to retrieve for pagination.

### Response
#### Success Response (200)
- **code** (Integer) - Business status code: 0: Success, non-zero: Failure.
- **msg** (String) - Detailed information.
- **ts** (Number) - Current Unix timestamp (in milliseconds).
- **data** (Array) - List of recordings. Each recording object may contain:
  - **recordId** (String) - Unique identifier of the recording.
  - **sid** (String) - The `sid` of cloud recording.
  - **resourceId** (String) - The `resourceId` of cloud recording.
  - **state** (Integer) - The recording state: `0`: Ended, `1`: Started.
  - **startTime** (Integer) - Timestamp (ms) when the recording began.
  - **endTime** (Integer) - Timestamp (ms) when the recording ended.
  - **duration** (Integer) - Duration of the recording in seconds.
  - **recordConfig** (Object) - Configuration used for recording.
  - **playUrl** (Object) - URLs for playing the recording:
    - **rtmp** (String) - RTMP playback URL.
    - **flv** (String) - FLV playback URL.
    - **hls** (String) - HLS playback URL.

#### Response Example
```json
{
    "code": 0,
    "ts": 1610450153520,
    "data": [
        {
            "recordId": "rec_abc123",
            "sid": "sid123",
            "resourceId": "res123",
            "state": 1,
            "startTime": 1610450000000,
            "endTime": 1610450100000,
            "duration": 60,
            "recordConfig": {},
            "playUrl": {
                "rtmp": "",
                "flv": "",
                "hls": ""
            }
        }
    ]
}
```
```

--------------------------------

### Implement IVideoSource for Custom Video Input (Java)

Source: https://docs.agora.io/en/3.x/interactive-live-streaming/basic-features/screensharing

This Java code implements the `IVideoSource` interface to provide a custom video input for the Agora SDK. It handles initialization, starting, stopping, and disposing of the video source, and specifies buffer and capture types. This is essential for integrating external video sources like screen sharing.

```java
public class ExternalVideoInputManager implements IVideoSource {
    private static final String TAG = "ExternalVideoInputManager";
    private volatile IVideoFrameConsumer mConsumer;

    // Gets the IVideoFrameConsumer object when initializing the video source
    @Override
    public boolean onInitialize(IVideoFrameConsumer consumer) {
        mConsumer = consumer;
        return true;
    }

    @Override
    public boolean onStart() {
        return true;
    }

    @Override
    public void onStop() {
        // No-op
    }

    // Sets IVideoFrameConsumer as null when IVideoFrameConsumer is released by the media engine
    @Override
    public void onDispose() {
        Log.e(TAG, "SwitchExternalVideo-onDispose");
        mConsumer = null;
    }

    @Override
    public int getBufferType() {
        return TEXTURE.intValue();
    }

    @Override
    public int getCaptureType() {
        return CAMERA; // Assuming CAMERA is a valid constant for external video
    }

    @Override
    public int getContentHint() {
        return MediaIO.ContentHint.NONE.intValue();
    }
    // ... other methods
}

```

--------------------------------

### Query Next User List Page - cURL

Source: https://docs.agora.io/en/agora-chat/restful-api/user-system-registration

This example shows how to fetch the next page of users using the cursor obtained from a previous response. It's a GET request using cURL, specifying both the limit and the cursor for pagination. The response will contain the next set of user data.

```cURL
# Replace {YourAppToken} with the app token generated in your server.  
curl -X GET -H 'Accept: application/json' -H 'Authorization: Bearer {YourAppToken}' 'http://XXXX/XXXX/XXXX/users?limit=2&cursor=LTgzNDAxMjM3OToxTEFnNE9sNEVlaVQ0UEdhdmJNR2tB'
```

```json
{
  "action": "get",
  "params": {
    "cursor": ["LTgzNDAxMjM3OToxTEFnNE9sNEVlaVQ0UEdhdmJNR2tB"],
    "limit": ["2"]
  },
  "path": "/users",
  "uri": "http://XXXX/XXXX/XXXX/users",
  "entities": [
    {
      "uuid": "fef7f250-XXXX-XXXX-ba39-0fed7dcc3cdd",
      "type": "user",
      "created": 1542361376245,
      "modified": 1542361376245,
      "username": "XXXX",
      "activated": true,
      "nickname": "testuser3"
    },
    {
      "uuid": "gufhj730-XXXX-XXXX-bc68-d8ij7dc3uyac",
      "type": "user",
      "created": 1542361376978,
      "modified": 1542361376978,
      "username": "XXXX",
      "activated": true,
      "nickname": "testuser4"
    }
  ],
  "timestamp": 1542559337702,
  "duration": 2,
  "count": 2
}
```

--------------------------------

### Get App-Level Push Notification Settings

Source: https://docs.agora.io/en/agora-chat/develop/offline-push/set-dnd-mode

Retrieves the current app-level push notification settings. This includes the reminder type, expiration timestamp for Do Not Disturb, and the start and end times for the DND period. It helps in understanding the current notification preferences of the app.

```Java
ChatClient.getInstance().pushManager().getSilentModeForAll(new ValueCallBack<SilentModeResult>(){
    @Override
 public void onSuccess(SilentModeResult result) {
 PushManager.PushRemindType remindType = result.getRemindType();
 long timestamp = result.getExpireTimestamp();
 SilentModeTime startTime = result.getSilentModeStartTime();
 startTime . getHour();
 startTime . getMinute();
 SilentModeTime endTime = result.getSilentModeEndTime();
 endTime . getHour();
 endTime . getMinute();
    }
    @Override
 public void onError(int error, String errorMsg) {}
});
```

--------------------------------

### POST /initialize

Source: https://docs.agora.io/en/on-premise-recording/reference/api-reference

Initializes the recorder instance with specified service and configuration options.

```APIDOC
## POST /initialize

### Description
Initializes the recorder instance.

### Method
`virtual int initialize(base::IAgoraService* agora_service, bool enable_mix = true, bool recordEncodedOnly = false) = 0;`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **agora_service** (`base::IAgoraService*`) - Required - The Agora service object. Must be initialized.
- **enable_mix** (`bool`) - Optional - Whether to enable composite recording. `true` (default) enables composite recording, `false` enables individual stream recording.
- **recordEncodedOnly** (`bool`) - Optional - Whether to record only encoded video. `true` records in encoded format (H264/H265 supported) without decoding. `false` (default) decodes and re-encodes. Note: If `recordEncodedOnly` is `true`, the watermark feature cannot be used.

### Request Example
```json
{
  "agora_service": "<initialized_agora_service_pointer>",
  "enable_mix": true,
  "recordEncodedOnly": false
}
```

### Response
#### Success Response (0)
- Indicates successful initialization.

#### Error Response (< 0)
- Indicates that the method call failed.

#### Response Example
```json
{
  "status": "success",
  "code": 0
}
```
```

--------------------------------

### Configure NDK ABIs for SDK Libraries

Source: https://docs.agora.io/en/signaling/get-started/sdk-quickstart

Specify the supported NDK architectures for your project within the `build.gradle` file. This configuration ensures the correct native libraries are included for different Android device architectures. It's recommended to include only essential architectures to reduce app size.

```gradle
Config {
    // ...
    ndk{
        abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
    }
}
```

--------------------------------

### Get Screen Capture Sources (C#)

Source: https://docs.agora.io/en/video-calling/advanced-features/screen-sharing

Retrieves a list of available screen and window sources for screen sharing. It takes thumbnail and icon sizes as input and returns an array of ScreenCaptureSourceInfo objects. This method is crucial for identifying the Display ID or Window ID needed to start screen capture.

```csharp
SIZE thumbSize = new SIZE(360,240);
SIZE iconSize = new SIZE(360,240);
ScreenCaptureSourceInfo[] screenCaptureSourceInfos = RtcEngine.GetScreenCaptureSources(thumbSize, iconSize, true);
```

--------------------------------

### Install CentOS Dependencies for Agora SDK

Source: https://docs.agora.io/en/server-gateway/get-started/integrate-sdk

Installs necessary development tools and X11 libraries for the Agora Server Gateway C++ SDK on CentOS systems. It ensures the 'Development Tools' group and wget are installed, along with X11 support.

```bash
sudo yum groupinstall "Development Tools"
sudo yum install wget
sudo yum groupinstall X11
```

--------------------------------

### Unsubscribe Specified User from Topic (Dart)

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

This example demonstrates how to unsubscribe a specific list of users from a given topic. It checks for errors and prints the response. Dependencies include the Agora Signaling SDK.

```dart
var userList = ["Tony","Lily"];  
var (status,response) = await stChannel.unsubscribeTopic("myTopic", users:userList);  
if (status.error == true) {  
 print(status);  
} else {  
 print(response);  
}
```

--------------------------------

### Include JAR Files from Libs Folder as Dependencies

Source: https://docs.agora.io/en/signaling/get-started/sdk-quickstart

Add all JAR files located in the 'libs' folder of your project as dependencies in your app-level `build.gradle` file. This ensures that any local JARs, including the Signaling SDK, are recognized by the build system.

```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    // ...
}
```

--------------------------------

### Join Channel API

Source: https://docs.agora.io/en/iot/get-started/get-started-sdk

Demonstrates how to join an RTC channel using the `joinChannel` method with specified options. It also outlines the callbacks available after joining.

```APIDOC
## POST /joinChannel

### Description
Initiates a secure connection to an RTC channel using an authentication token and channel options.

### Method
POST

### Endpoint
/joinChannel

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
- **connectionId** (int) - Required - The connection identifier.
- **channelName** (string) - Required - The name of the channel to join.
- **uid** (int) - Required - The user ID.
- **token** (string) - Required - The authentication token.
- **channelOptions** (object) - Required - Options for joining the channel.
  - **autoSubscribeAudio** (boolean) - Optional - Enables automatic audio subscription.
  - **autoSubscribeVideo** (boolean) - Optional - Enables automatic video subscription.
  - **audioCodecOpt** (object) - Optional - Audio codec options.
    - **audioCodecType** (AgoraRtcService.AudioCodecType) - Optional - The type of audio codec.
    - **pcmSampleRate** (int) - Optional - The PCM sample rate.
    - **pcmChannelNum** (int) - Optional - The number of PCM channels.

### Request Example
```java
public void joinChannel(View view) {
    AgoraRtcService.ChannelOptions channelOptions = new AgoraRtcService.ChannelOptions();
    channelOptions.autoSubscribeAudio = true;
    channelOptions.autoSubscribeVideo = true;
    channelOptions.audioCodecOpt.audioCodecType = AgoraRtcService.AudioCodecType.AUDIO_CODEC_TYPE_OPUS;
    channelOptions.audioCodecOpt.pcmSampleRate = 16000;
    channelOptions.audioCodecOpt.pcmChannelNum = 1;

    int ret = agoraEngine.joinChannel(connectionId, channelName, uid, token, channelOptions);
    if (ret != AgoraRtcService.ErrorCode.ERR_OKAY) {
        showMessage("Failed to join a channel");
        isJoined = false;
    } else {
        isJoined = true;
    }
}
```

### Response
#### Success Response (200)
- **isJoined** (boolean) - Indicates if the channel join was successful.

#### Response Example
```json
{
  "isJoined": true
}
```

### Callbacks After Joining
- **onAudioData**: Receive audio from users in the channel.
- **onVideoData**: Receive video from users in the channel.
- **sendAudioData**: Method to send audio data.
- **sendVideoData**: Method to send video data.
```

--------------------------------

### Query Channel List - Python Example

Source: https://docs.agora.io/en/voice-calling/channel-management-api/endpoint/query-channel-information/query-channel-list

This Python code illustrates how to retrieve a channel list using the 'http.client' library. It establishes an HTTP connection, sets the required headers, sends a GET request to the API endpoint, and prints the decoded response.

```python
import http.client  
  
conn = http.client.HTTPConnection("api.sd-rtn.com")  
  
headers = {  
    'Authorization': "",  
    'Accept': "application/json"  
}
  
conn.request("GET", "/dev/v1/channel/appid", headers=headers)  
  
res = conn.getresponse()  
data = res.read()  
  
print(data.decode("utf-8"))  
```

--------------------------------

### Remove an Event Listener from RTM Client

Source: https://docs.agora.io/en/signaling/reference/api_platform=flutter

Removes a specific event listener from the RTM client. This example shows how to remove a message event listener. You can remove listeners for other event types similarly.

```Dart
rtmClient.removeListener({
 Function(MessageEvent event) message = null,
})
```