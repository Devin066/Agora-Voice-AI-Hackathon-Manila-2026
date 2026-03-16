
# SenteaCall - Voice AI Security Assistant

A real-time, background-running Voice AI Assistant designed to serve as a security layer for mobile phone calls. Protects users from social engineering, financial fraud, and impersonation scams.

## Features

- **Real-time Call Monitoring**: Simulates audio stream processing via WebSocket.
- **Live Transcription**: Mock STT engine generates transcript segments.
- **Dynamic Risk Scoring**: Analyzes transcripts for threat indicators (Urgency, Authority, Sensitive Data).
- **Security Alert Overlay**: Interruptive UI for high-risk calls.
- **Actionable Intelligence**: Provides recommendations based on threat level.

## Architecture

- **Frontend**: React, TypeScript, Tailwind CSS, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Supabase (Schema ready).
- **Analysis**: Mock services simulating STT latency and NLU processing.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This runs both the frontend (Vite) and backend (Express) concurrently.

3.  **Open Application**:
    Navigate to `http://localhost:5173`.

4.  **Simulate Call**:
    - Click "Launch Protection Dashboard".
    - Click "Simulate Incoming Call".
    - Watch the live transcript and risk meter update.
    - If risk score > 50, an overlay will appear.

## Project Structure

- `src/`: Frontend source code.
  - `components/`: UI components (Overlay).
  - `pages/`: Application pages (Dashboard).
  - `services/`: Socket.io connection.
- `api/`: Backend source code.
  - `services/`: Analysis and Socket logic.
  - `routes/`: API endpoints.
- `supabase/`: Database migrations.

## Environment Variables

Check `.env` for configuration. Default port is 3000 for backend.
