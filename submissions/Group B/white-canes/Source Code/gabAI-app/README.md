# gabAI - Your Filipino AI Study Buddy 🇵🇭

gabAI (formerly Gabay) is a supportive, AI-powered study companion designed for college and senior high students in the Philippines. It uses Agora's Conversational AI and Video Avatar technologies to provide a natural, human-like voice and visual interface.

## Features
- **Study Assistance**: Helps with lesson simplification, study planning, and exam quizzing.
- **Natural Language**: Speaks in "Taglish" (Filipino/English mix) to sound like a supportive *ate* or *kuya*.
- **Voice & Video Avatar**: Powered by Agora and HeyGen for an immersive experience.
- **Modern UI**: Deep purple gradient theme with glassmorphism and real-time voice visualizations.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Agora RTC SDK.
- **Backend**: Node.js, Express, Agora Token SDK, Node Fetch.

## Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- Agora App ID and App Certificate.
- OpenAI API Key.
- ElevenLabs API Key.
- HeyGen API Key.

### 2. Environment Variables
Copy the `.env.example` file to `.env` in the root of `gabAI-app/` and fill in your credentials:
```bash
cp .env.example .env
```
Then update the variables in `.env` with your actual keys.

### 3. Execution
**Start Backend:**
```bash
cd gabAI-app
npm install
npm start
```

**Start Frontend:**
```bash
cd gabAI-app/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.
