# JJKen - HEARD! AI Voice Cooking Assistant

## Project Overview

**HEARD!** is an innovative AI-powered real-time voice cooking assistant designed to help users in the kitchen through interactive voice conversations. The project leverages Agora's Conversational AI platform to deliver a seamless, real-time voice experience for cooking guidance and recipe assistance.

The JJKen submission combines a robust backend service with a mobile-first frontend to create an accessible cooking companion that responds to user queries in natural language.

---

## Features & Functionality

### Core Features

- **Real-Time Voice Interaction**: Users can speak naturally to get cooking assistance without manual text input
- **AI-Powered Responses**: Intelligent assistant trained to provide cooking tips, recipe guidance, and kitchen help
- **Multi-Platform Support**: Mobile app built with React Native, accessible via Android, iOS, and web
- **Session Management**: Secure session lifecycle management with expiration controls
- **Multiple TTS/ASR Options**: Support for various speech providers (ElevenLabs, OpenAI, Microsoft, Agora's Ares)
- **Real-Time Voice Channels**: Leverages Agora RTC for crystal-clear voice communication
- **Health & Monitoring**: Built-in service health checks and logging

### Technical Capabilities

- Agora RTC token generation for secure channel access
- Conversational AI agent integration with customizable prompts
- Session-based architecture for managing multiple concurrent users
- Configurable LLM backend support (Groq, OpenAI, custom endpoints)
- Custom greeting/failure messages for user experience
- Request tracking and performance monitoring

---

## Project Structure

```
JJKen/
├── README.md                          # This file
├── Deck & Demo/                       # Presentation materials and demo videos
│   └── jjken_video_demo.txt          # Demo video reference
├── Frontend Sample/                   # Web frontend reference implementation
│   ├── index.html                    # Main landing page
│   ├── onboarding.html               # Onboarding flow
│   ├── preferences.html              # User preferences page
│   ├── AgoraRTC_N-4.22.0.js          # Agora RTC SDK
│   ├── images/                       # UI assets
│   └── savor-expo/                   # React Native mobile app
│       ├── App.js                    # Main app component
│       ├── index.js                  # App entry point
│       ├── package.json              # Dependencies
│       ├── app.json                  # Expo configuration
│       └── assets/                   # Mobile app assets
├── Source Code/                       # Production source code
│   ├── backend/                      # Express.js backend service
│   │   ├── index.js                  # Server entry point
│   │   ├── package.json              # Backend dependencies
│   │   ├── README.md                 # Backend API documentation
│   │   └── test-client.html          # Backend testing interface
│   └── test-client.html              # Full integration test client
└── TRAE_Usage/                       # Technical documentation
```

---

## Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (for mobile development): `npm install -g expo-cli`
- Agora Account with App ID and credentials

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd "Source Code/backend"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment configuration**:
   Create a `.env` file in the `backend` directory with the following variables:

   ```env
   # Server Configuration
   PORT=3000
   SESSION_TTL_MINUTES=120

   # Agora Configuration
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_app_certificate
   AGORA_AGENT_UID=your_agora_agent_uid

   # Agora Conversational AI Configuration
   AGORA_CONVO_AI_BASE_URL=https://api.agora.io
   AGORA_CONVO_AI_START_PATH=/api/conversational-ai-agent/v2/projects/{appId}/join
   AGORA_CONVO_AI_STOP_PATH=/api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave
   AGORA_CONVO_AI_TIMEOUT_MS=10000
   AGORA_CONVO_AI_RETRIES=1

   # Assistant Configuration
   DEFAULT_ASSISTANT_NAME=cook-assistant
   DEFAULT_ASSISTANT_PROMPT=You are a helpful real-time cooking assistant.
   DEFAULT_GREETING=Hello, how can I assist you?
   DEFAULT_FAILURE_MESSAGE=Please hold on a second.

   # Text-to-Speech Configuration (choose one provider)
   DEFAULT_TTS_VENDOR=elevenlabs  # Options: elevenlabs, openai, microsoft
   ELEVENLABS_TTS_KEY=your_elevenlabs_key
   ELEVENLABS_TTS_BASE_URL=https://api.elevenlabs.io/v1
   ELEVENLABS_TTS_MODEL=eleven_flash_v2_5
   ELEVENLABS_TTS_VOICE_ID=your_voice_id

   # ASR Configuration
   DEFAULT_ASR_VENDOR=ares
   DEFAULT_ASR_LANGUAGE=en-US

   # LLM Configuration
   DEFAULT_LLM_STYLE=groq  # Backend LLM provider
   DEFAULT_LLM_URL=https://api.groq.com/openai/v1
   DEFAULT_LLM_API_KEY=your_llm_api_key
   DEFAULT_LLM_MODEL=mixtral-8x7b-32768
   DEFAULT_LLM_MAX_HISTORY=32
   ```

4. **Start the backend**:
   ```bash
   npm start
   ```
   Or with auto-reload during development:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:3000`

### Frontend Setup (React Native)

1. **Navigate to mobile app directory**:
   ```bash
   cd "Frontend Sample/savor-expo"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on specific platform**:
   - **Android**: Press `a` in the terminal or `npm run android`
   - **iOS**: Press `i` in the terminal or `npm run ios`
   - **Web**: Press `w` in the terminal or `npm run web`

---

## Usage & Running the Application

### Starting the Full Stack

1. **Start the backend service** (Terminal 1):
   ```bash
   cd "Source Code/backend"
   npm start
   ```
   Expected output: `Listening on port 3000`

2. **Start the mobile app** (Terminal 2):
   ```bash
   cd "Frontend Sample/savor-expo"
   npm start
   ```

3. **Access the application**:
   - Scan the QR code with your mobile device using Expo Go app
   - Or open the web version at the provided URL

### Testing the Backend

A test client is available at `Source Code/test-client.html`. Open it in a web browser to:
- Check service health
- Create new sessions
- Generate RTC tokens
- Manage conversational AI agents

### API Endpoints

#### Health Check
```
GET /health
```

#### Create Session
```
POST /api/v1/session
Content-Type: application/json

{
  "userId": "user-123",
  "channelName": "cook-room-a"
}
```

Response:
```json
{
  "sessionId": "unique-session-id",
  "userId": "user-123",
  "channelName": "cook-room-a",
  "uid": 123456789,
  "rtcToken": "agora-rtc-token"
}
```

For complete API documentation, see [Backend README](Source%20Code/backend/README.md).

---

## Architecture & Technical Details

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Frontend (React Native/Expo)     │
│                    ┌──────────────────────────┐             │
│                    │  Onboarding & Preferences              │
│                    │  Voice Recording/Playback              │
│                    │  UI State Management                   │
│                    └──────────────────────────┘             │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/WebSocket
┌─────────────────────────────▼───────────────────────────────┐
│                 Backend Service (Node.js/Express)           │
│          ┌─────────────────────────────────────────┐        │
│          │  Session Management                     │        │
│          │  RTC Token Generation                   │        │
│          │  Request Validation & Logging           │        │
│          └─────────────────────────────────────────┘        │
└─────────────────────────────┬───────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──┐    ┌─────▼──┐    ┌───▼────┐
         │  Agora  │    │  Agora │    │  LLM   │
         │   RTC   │    │ Conv AI│    │Backend │
         └─────────┘    └─────────┘   └────────┘
                │
         ┌──────▼───────────────────┐
         │  TTS/ASR Providers        │
         │  (ElevenLabs, OpenAI, MS) │
         └───────────────────────────┘
```

### Backend Components

**Express Server** (`index.js`):
- RESTful API with CORS support
- Request ID tracking and logging
- Session lifecycle management
- Agora token generation with RtcTokenBuilder

**Session Management**:
- In-memory session storage
- TTL-based expiration (default 120 minutes)
- Unique session IDs for user tracking
- Per-channel user identification

**Agora Integration**:
- Secure RTC token generation
- Conversational AI agent lifecycle (start/stop)
- Real-time voice channel management
- Agent UID configuration

### Frontend Components

**React Native App**:
- Expo for cross-platform development
- Onboarding workflow
- User preferences configuration
- Voice interaction interface

**Web Reference Implementation**:
- HTML-based landing page
- Agora RTC SDK integration
- Demo environment setup

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile Framework** | React Native 0.83.2 | Cross-platform mobile dev |
| **Build Tool** | Expo 55.0.6 | Development & deployment |
| **Backend Runtime** | Node.js | Server execution |
| **Web Framework** | Express.js 5.2.1 | HTTP API server |
| **Voice Communication** | Agora RTC SDK 4.22.0 | Real-time voice channels |
| **AI Conversations** | Agora Conversational AI | LLM-based assistant |
| **Token Generation** | agora-token 2.0.5 | Secure channel access |
| **CORS** | cors 2.8.6 | Cross-origin support |
| **Environment Config** | dotenv 17.3.1 | Configuration management |
| **Development** | Nodemon 3.1.14 | Auto-reload on changes |

### Supported Configurations

**LLM Providers**:
- Groq (default)
- OpenAI
- Custom endpoints

**TTS Vendors**:
- ElevenLabs (recommended)
- OpenAI
- Microsoft Azure Cognitive Services
- Agora Ares (fallback)

**ASR Languages**:
- English (en-US, default)
- Configurable language codes

---

## Dependencies

### Backend Dependencies
- `express@^5.2.1` - Web framework
- `cors@^2.8.6` - Cross-origin resource sharing
- `agora-token@^2.0.5` - Agora token generation
- `dotenv@^17.3.1` - Environment variable management

### Frontend Dependencies
- `react@19.2.0` - UI framework
- `react-native@0.83.2` - Native app framework
- `expo@~55.0.6` - Build and deploy tool
- `expo-status-bar@~55.0.4` - Status bar control
- `react-native-webview@13.16.0` - Web content embedding

### Development Dependencies
- `nodemon@^3.1.14` - Auto-reload development server
- `@expo/ngrok@^4.1.3` - Expo tunneling

---

## Configuration

All configuration is managed through environment variables in the `.env` file. Key configuration areas:

- **Port**: `PORT` (default: 3000)
- **Session Duration**: `SESSION_TTL_MINUTES` (default: 120)
- **AI Assistant**: `DEFAULT_ASSISTANT_PROMPT`, `DEFAULT_ASSISTANT_NAME`
- **Voice Options**: `DEFAULT_TTS_VENDOR`, `DEFAULT_ASR_VENDOR`
- **Agora Services**: App ID, App Certificate, endpoints
- **LLM Model**: Backend provider, API key, model selection

---

## Performance Considerations

- **Session Management**: In-memory storage suitable for ~1000s concurrent sessions
- **Token Generation**: Sub-millisecond generation time
- **RTC Connection**: Real-time audio latency <100ms with Agora
- **Request Logging**: Structured JSON logging for monitoring
- **Timeout Configuration**: Adjustable timeouts for AI agent communication (default: 10s)

---

## Security Features

- **CORS Configuration**: White-list origin verification
- **RTC Tokens**: Time-based expiring tokens for channel access
- **Request IDs**: Unique tracking for each request
- **Environment Secrets**: API keys stored in `.env` (not committed)
- **Role-Based Access**: Agora tokens include role specification (subscriber/publisher)

---

## Development Workflow

### Local Development

1. **Backend Auto-Reload**:
   ```bash
   npm run dev  # Uses nodemon for file watching
   ```

2. **Frontend Hot Reload**:
   ```bash
   npm start    # Expo automatically reloads on file changes
   ```

3. **Testing**:
   - Use `Source Code/test-client.html` to validate backend
   - Test mobile app on emulator or physical device

### Debugging

- Backend: Check `console.log` output and request logs
- Frontend: Use Expo DevTools (shake device and select "Show DevTools")
- Network: Monitor API calls in browser DevTools or Expo network inspector

---

## Environment Setup Checklist

- [ ] Node.js (v16+) installed
- [ ] Expo CLI installed globally
- [ ] Agora account created with App ID
- [ ] Agora App Certificate obtained
- [ ] LLM provider API key configured (Groq/OpenAI)
- [ ] TTS vendor credentials set up
- [ ] `.env` file created in backend directory
- [ ] Dependencies installed (`npm install`)
- [ ] Backend starts successfully (`npm start`)
- [ ] Mobile app preview displays (`npm start` in frontend folder)

---

## Troubleshooting

### Backend Issues

**Port already in use**:
```bash
# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

**Missing environment variables**:
- Ensure `.env` file exists in `Source Code/backend`
- Verify all required Agora and API credentials are set

**CORS errors**:
- Confirm frontend URL/port matches CORS configuration
- Check network connectivity between frontend and backend

### Frontend Issues

**Expo connection failed**:
- Ensure backend is running and accessible
- Check phone and development machine are on same network
- Try tunnel mode: `npx expo start --tunnel`

**Module not found errors**:
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `npm install --legacy-peer-deps`

---

## Resources & References

- [Agora Documentation](https://docs.agora.io/)
- [React Native Documentation](https://reactnative.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Expo Documentation](https://docs.expo.dev/)
- See `TRAE_Usage/` folder for additional technical documentation

---

## Team & Credits

**JJKen Project** - Hackathon Submission

For questions, feedback, or contributions, please refer to the project submission guidelines.

---

## License

ISC License

---

## Version History

**v1.0.0** - Initial Release
- Real-time voice cooking assistant
- Multi-platform mobile support
- Agora RTC and Conversational AI integration
- Configurable LLM and TTS backends

---

## Next Steps & Future Enhancements

- [ ] Session persistence (database integration)
- [ ] User authentication and profiles
- [ ] Recipe database integration
- [ ] Multi-language support expansion
- [ ] Voice analytics and logging
- [ ] Custom assistant training
- [ ] Integration with smart home devices
- [ ] Offline mode with local LLM

---

*Last Updated: March 2026*
