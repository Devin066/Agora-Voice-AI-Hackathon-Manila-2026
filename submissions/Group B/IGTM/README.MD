# 🎙️ ParrotAI

## Real-Time Voice Simulation for Career Conversations

ParrotAI is a real-time voice-based simulator that helps users practice high-stakes professional conversations such as:

💼 Job Interviews | 💰 Salary Negotiations | Performance Review Discussions

Unlike traditional text-based interview prep tools, this platform enables dynamic, real-time conversational interaction with an AI persona using Agora’s Conversational AI Engine and RTC technology.

Users can practice natural spoken conversations, handle unexpected interruptions, receive instant feedback, and improve their communication, persuasion, and negotiation skills in a high-fidelity simulated environment.

## 🚀 Problem

Many professionals struggle with important career conversations because text-based tools cannot simulate the pressure of a real room. These conversations inherently involve:

- Unexpected interruptions
- Nuanced emotional tones
- Rapid turn-taking
- Adaptive, real-time responses

## 💡 Solution

ParrotAI creates realistic, low-latency AI-powered conversation simulations. Users interact with an AI interviewer or reviewer via real-time voice. The AI adapts dynamically based on user responses, handles interruptions seamlessly, and evaluates the user's performance.

## 🎯 Key Features

- 🎤 **Real-Time Voice Conversations**: Powered by the Agora Conversational AI Engine, enabling ultra-low-latency dialogue with natural turn-taking and interruptible speech.
- 🧠 **Dynamic AI Persona System**: Face off against unique personalities powered by Anthropic Claude Sonnet 4.6, ranging from a friendly HR screener to a highly skeptical Hiring Manager.
- ⚡ **The "Interruption" Mechanic**: The AI is configured to interject if a user rambles, perfectly simulating the high-pressure environment of a real interview.
- 📊 **Real-Time Confidence UI**: The React frontend analyzes vocal pacing and displays a live Confidence/Stress visualizer during the conversation.
- 🧩 **Scenario-Based Practice**: Select focused conversation modules, such as defending a $10k salary bump or navigating a performance review discussion.
- 📈 **AI Feedback Engine**: Post-session evaluation of answer clarity, persuasion strength, and communication structure.

## 🏗️ System Architecture

Unlike traditional chained API architectures, this project leverages the Agora Conversational AI Engine to orchestrate STT, the Anthropic LLM, and TTS at the edge, drastically reducing latency.

```text
User Voice
    │
    ▼
Agora RTC (Real-Time Audio Stream)
    │
    ▼
Agora Conversational AI Engine
    ├── Integrated Speech-to-Text (STT)
    ├── Anthropic API (Claude Sonnet 4.6 Persona/Logic Layer via Node.js Backend)
    └── Integrated Text-to-Speech (TTS)
    │
    ▼
Agora Audio Output
    │
    ▼
User (React Frontend)
```

## 🧰 Tech Stack

- **Frontend**: React, Web Audio APIs, TailwindCSS
- **Backend**: Node.js / Express for orchestrating Agora tokens and persona configurations
- **Core AI & Voice**: Agora Conversational AI Engine, Agora RTC SDK
- **LLM**: Anthropic Claude Sonnet 4.6 for complex reasoning and low latency
- **Cloud & Deployment**: Hybrid setup with Vercel + Google Cloud Platform (GCP)
- **Backend Hosting**: Google Cloud Run (containerized Node.js server)
- **Frontend Hosting**: Vercel

## 🔄 Conversation Flow

1. User selects a scenario (for example, Salary Negotiation).
2. Node.js backend initializes the specific AI persona via the Agora Conversational AI Engine, injecting the custom Anthropic system prompt.
3. Voice conversation begins via Agora RTC.
4. User speaks, negotiates, and handles dynamic interruptions in real time.
5. Session ends and the system generates a performance feedback report.

## ⚙️ How to Run Locally

### Prerequisites

- Node.js v18 or higher
- An Agora Developer Account (App ID and App Certificate)
- Anthropic API Key
- Google Cloud CLI (for deployment)

### Environment Setup

Create a `.env` file in the root directory and add:

```bash
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=5000
```

### Installation and Execution

Clone the repository:

```bash
git clone https://github.com/YOUR-TEAM/Agora-Voice-AI-Hackathon-Manila-2026.git
cd Agora-Voice-AI-Hackathon-Manila-2026/submissions/YourTeamName
```

Install dependencies for both client and server:

```bash
npm install
cd client
npm install
cd ..
```

Start the development servers:

```bash
npm run dev
```

The React frontend runs on `localhost:3000` and the Node.js backend runs on `localhost:5000`.

## ☁️ Deployment (Vercel + GCP)

The backend is deployed on Google Cloud Run, and the frontend is deployed on Vercel.

### Backend Deployment (GCP Cloud Run)

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/agora-ai-backend
gcloud run deploy --image gcr.io/PROJECT-ID/agora-ai-backend --platform managed
```

After deployment, copy your Cloud Run service URL and use it as your frontend API base URL.

### Frontend Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

In your Vercel project settings, set the frontend environment variable that points to your deployed backend, for example:

```bash
VITE_API_BASE_URL=https://your-cloud-run-service-url.run.app
```

## 📈 Future Improvements

- Advanced emotion and sentiment detection from voice pitch
- Multiplayer mock interviews (Peer + AI + User)
- Direct integration with CRMs for B2B sales training

## 🎥 Demo

Insert demo video link here.

## 👥 Team

Add your team members here.

## 🏁 Built for the Agora Voice AI Hackathon Manila 2026
