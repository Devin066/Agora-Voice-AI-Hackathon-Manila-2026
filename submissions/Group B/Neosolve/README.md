# Neosolve: AI-Powered Support Call Center

Neosolve is an intelligent inbound voice call center solution built for the **Agora Voice AI Hackathon Manila 2026**. It leverages Agora's Conversational AI Engine to provide a seamless transition from voice intake to structured support tickets.

## 🚀 Overview

Neosolve automates the front-line support experience:
1. **AI Intake**: Customers call "Neo," our AI agent, who gathers issue details naturally.
2. **Instant Classification**: After the call, the conversation is automatically transcribed and classified by AI (category, priority, summary).
3. **Smart Routing**: Tickets are instantly routed to the best-fit human support agent based on their specialty and current workload.
4. **Real-Time Dashboards**: Team leads and agents see updates instantly via Convex's reactive backend.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (Neobrutalism UI)
- **Backend/Database**: [Convex](https://convex.dev/)
- **Voice AI**: Agora Conversational AI Engine (Server-side AI Agent)
- **LLM**: OpenRouter (Claude/GPT) for post-call classification
- **Package Manager**: [Bun](https://bun.sh/)

## 🏗️ Project Structure

- `src/`: React frontend components and views.
- `convex/`: Backend functions (queries, mutations, and AI actions).
- `docs/`: Project documentation and media.

## ⚙️ Setup & Installation

### Prerequisites

- [Bun](https://bun.sh/) installed.
- [Convex](https://convex.dev/) account.
- [Agora](https://www.agora.io/) account with Conversational AI enabled.

### 1. Clone & Install

```bash
bun install
```

### 2. Environment Variables

Create a `.env.local` file in the root (or set these in your Convex dashboard):

```bash
# Agora Credentials
AGORA_APP_ID=your_app_id
AGORA_CUSTOMER_KEY=your_customer_key
AGORA_CUSTOMER_SECRET=your_customer_secret
AGORA_PIPELINE_ID=your_pipeline_id

# AI Classification (OpenRouter)
# When omitted, a keyword-based classifier is used as fallback.
OPENROUTER_API_KEY=your_openrouter_key
```

### 3. Run Locally

This command starts both the Vite dev server and the Convex backend:

```bash
bun run dev
```

## 📖 Usage

### 1. Customer View (`/`)
- Enter your name and click **"Call Now"**.
- Talk to Neo about a technical or billing issue.
- End the call when finished.

### 2. Team Lead Dashboard (`/dashboard/lead`)
- Monitor all incoming calls and created tickets in real-time.
- View ticket details, transcripts, and AI-generated summaries.
- See how tickets are automatically routed to specialists.

### 3. Agent Dashboard (`/dashboard/agent/:name`)
- Specific views for agents (e.g., `/dashboard/agent/kean`).
- Only shows tickets assigned to that agent's specialty (Connectivity, Billing, Hardware, etc.).

## 🎥 Demo

A short demo video explaining the project flow and features can be found here:
[Demo Video (Google Drive)](https://drive.google.com/open?id=YOUR_LINK_HERE)

Checkout more details in the [docs](./docs/) folder.
