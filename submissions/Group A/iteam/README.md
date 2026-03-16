# VisionVoice

An AI-powered assistive smart-glasses simulator that transforms any webcam into a voice-guided navigation assistant for visually impaired users.

## 🎯 What It Does

VisionVoice uses your webcam to see the world and speaks concise, helpful information about what's around you:

- **Proactive Alerts**: "Chair ahead, slightly left"
- **Person Recognition**: "Angela is in front of you"
- **Voice Questions**: Ask "What's in front?" and get spoken answers
- **Caregiver Support**: Optional human help when needed

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Webcam access
- Agora account (free tier works)

### Setup

1. **Clone and Install**

```bash
cd submissions/Group A/iteam/code
npm install
```

1. **Configure Agora**
   Create a `.env` file in the root directory:

```
VITE_AGORA_APP_ID=your_agora_app_id
VITE_AGORA_CHANNEL=your_channel_name
VITE_AGORA_TOKEN=your_token (optional for development)
```

1. **Start Development**

```bash
npm run dev
```

1. **Open Browser**
   Navigate to `http://localhost:5173`

## 📋 Agora Configuration

### Getting Agora Credentials

1. **Create Agora Account**: <https://console.agora.io>
2. **Create New Project**:
   - Project Name: "VisionVoice"
   - Authentication: APP ID + Token (recommended)
3. **Copy APP ID**: Found in project dashboard
4. **Generate Token**: Use token generator for your channel

### Environment Variables

| Variable             | Description                     | Required     |
| :------------------- | :------------------------------ | :----------- |
| VITE\_AGORA\_APP\_ID | Your Agora project APP ID       | ✅            |
| VITE\_AGORA\_CHANNEL | Channel name for voice sessions | ✅            |
| VITE\_AGORA\_TOKEN   | Authentication token            | ❌ (dev only) |

### Testing Without Token

For local development, you can use APP ID only (less secure):

```
VITE_AGORA_APP_ID=your_app_id
VITE_AGORA_CHANNEL=test_channel
```

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Computer Vision**:
  - `@tensorflow-models/coco-ssd` (object detection)
  - `@vladmandic/face-api` (face recognition)
- **Voice**: Agora Web SDK + Agora ConvoAI
- **Build**: Vite

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── WebcamFeed.tsx   # Camera capture
│   ├── ObjectDetector.tsx # CV object detection
│   ├── FaceRecognizer.tsx # Face recognition
│   ├── Dashboard.tsx    # Main UI dashboard
│   └── VoiceInterface.tsx # Agora voice handling
├── services/           # Core services
│   ├── agora.ts       # Agora SDK integration
│   ├── cvPipeline.ts  # Computer vision pipeline
│   └── contextBuilder.ts # Scene context generation
├── hooks/             # Custom React hooks
│   ├── useWebcam.ts   # Webcam management
│   ├── useObjectDetection.ts # Object detection logic
│   └── useFaceRecognition.ts # Face recognition logic
├── utils/             # Utility functions
│   ├── hazardAnalysis.ts # Hazard detection logic
│   └── voiceCommands.ts # Voice command parsing
└── types/             # TypeScript type definitions
```

## 🎮 Usage Guide

### Basic Operation

1. **Grant Permissions**: Allow webcam and microphone access
2. **Wait for Status**: All indicators should show green
3. **Start Detection**: Objects and faces automatically detected
4. **Voice Interaction**: Click microphone or use voice commands

### Voice Commands

- "What's in front of me?"
- "Is the path clear?"
- "Who is here?"
- "Call \[person name]" (caregiver escalation)
- "Help" or "Emergency" (safeword)

### UI Elements

**Status Bar**: Shows camera, CV, and Agora connection status
**Webcam Feed**: Live preview with detection overlays
**Scene Summary**: Current objects, people, and hazards
**Transcript**: History of voice interactions

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run type-check # Run TypeScript checks
```

### Adding New Objects

Modify the detection pipeline in `src/services/cvPipeline.ts`:

```typescript
const OBJECTS_OF_INTEREST = [
  'person', 'chair', 'bottle', 'cup', 'laptop', 
  'cell phone', 'book', 'backpack', 'suitcase'
];
```

### Tuning Detection

Adjust sensitivity in `src/utils/hazardAnalysis.ts`:

```typescript
const PROXIMITY_THRESHOLD = 0.3; // 30% of frame
const CONFIDENCE_THRESHOLD = 0.7; // 70% confidence
```

## 🚨 Fallback Modes

If computer vision fails:

- **Manual Mode**: Click objects in webcam feed
- **Test Mode**: Use pre-configured scenarios
- **Text Mode**: Type questions manually

If Agora voice fails:

- **Text Display**: Responses shown in transcript
- **Local TTS**: Browser text-to-speech backup
- **Visual Alerts**: Color-coded status changes

## 🧪 Testing

### Manual Testing

1. Place common objects (chair, bottle, bag) in view
2. Test with registered teammates' faces
3. Verify voice responses are concise
4. Check fallback modes work

### Demo Scenarios

**Scenario 1 - Hazard Detection**:

- Place chair 3 feet away
- Should alert: "Chair ahead, slightly left"

**Scenario 2 - Person Recognition**:

- Have registered teammate enter frame
- Should say: "\[Name] is in front of you"

**Scenario 3 - Voice Questions**:

- Ask: "What's in front?"
- Should describe current scene

## 📱 Browser Support

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

**Requirements**:

- WebRTC support
- WebGL for CV acceleration
- Modern JavaScript (ES2020+)

## 🔒 Privacy & Security

- **Local Processing**: All CV happens in browser
- **No Image Storage**: Webcam feed never saved
- **Face Recognition**: Pre-registered contacts only
- **Opt-in Features**: All sharing requires consent
- **Secure Connections**: HTTPS required for production

## 🐛 Troubleshooting

### Common Issues

**Webcam not working**:

- Check browser permissions
- Ensure HTTPS in production
- Try different browser

**Objects not detected**:

- Improve lighting conditions
- Move objects closer (3-6 feet)
- Check confidence threshold

**Voice not responding**:

- Verify Agora credentials
- Check network connection
- Try manual text input

**Face recognition failing**:

- Ensure face is well-lit
- Look directly at camera
- Re-register if needed

### Debug Mode

Enable verbose logging:

```typescript
const DEBUG = true; // In src/config.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is part of the Voice AI Hackathon submission. See LICENSE file for details.

## 🙏 Acknowledgments

- Agora for voice AI technology
- TensorFlow team for object detection models
- Face API.js for face recognition
- Voice AI Hackathon organizers

## 📞 Support

For hackathon-related questions:

- Check troubleshooting section
- Review Agora documentation
- Test with provided demo scenarios
- Ensure all permissions are granted

**Remember**: This is a hackathon MVP focused on demonstrating assistive awareness through Agora voice interaction. Keep testing simple and demo-focused.
