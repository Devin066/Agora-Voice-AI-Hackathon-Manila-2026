# UgnayAI — Source Code

**Team:** TechWithKayne · Group B
**Hackathon:** Agora Voice AI Hackathon Manila 2026 · March 16, 2026

---

## File Structure

```
Source Code/
├── server.js                    # Express 5 API — all routes, queue, TTS, ConvoAI
├── triage.js                    # Claude/Groq/Ollama triage logic + RED safety override
├── bridge.js                    # Supabase-backed emergency bridge session manager
├── convoai.js                   # Agora Conversational AI Engine integration
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── middleware/
│   ├── auth.js                  # Supabase JWT verification + requireRole() RBAC
│   └── rateLimiter.js           # Per-user rate limits (triage: 10/min, bridge: 5/min)
└── src/
    ├── App.jsx                  # React router shell + Supabase session
    ├── utils/
    │   └── deviceRateLimit.js   # Anti-prank: max 3 RED escalations/device/day
    └── pages/
        ├── BHWApp.jsx           # BHW triage interface — Agora ConvoAI + RTC
        ├── NurseDashboard.jsx   # Nurse queue view — Agora RTC emergency bridge
        ├── PatientApp.jsx       # Anonymous patient flow (/triage-form)
        └── PatientListPage.jsx  # Case history view (/patients)
```

---

## Key Architectural Decisions

### Agora Conversational AI Engine (`convoai.js`)

The entire voice triage loop is handled by the Agora ConvoAI Engine:

```js
// BHW taps mic → POST /convoai/start
const result = await startConvoAIAgent({ channel, bhwId });

// Agora pipeline:
// 1. AgoraRTC.createMicrophoneAudioTrack() → voice capture
// 2. Agora ConvoAI Engine → ASR (ares provider, Filipino)
// 3. Groq LLaMA 3.3 → triage reasoning with Filipino system prompt
// 4. Microsoft TTS (fil-PH-BlessicaNeural) → Filipino audio response

// BHW taps stop → POST /convoai/stop { agentId }
await stopConvoAIAgent(agentId);
```

### Triage Safety Override (`triage.js`)

After every AI response, `checkRedOverride()` runs regex against raw symptom text. If any life-threatening pattern matches, the result is **force-overridden to RED** regardless of what the model said:

```js
const RED_TRIGGERS = [
  /dugo\s+sa\s+(ilong|bibig|tainga|dumi|ihi|balat|sugat)/i,  // blood
  /hindi\s+(na\s+)?(gumigising|nagigising|mulat|mapaggising)/i, // unconscious
  /nahihirapan\s+huminga/i,                                   // breathing
  /\bkumpulsyon\b|\bkumukurog\b/i,                            // seizures
  /buntis.*(dugo|sakit\s+ng\s+tiyan)/i,                       // pregnant + danger
  // ... 8 more triggers
];

function checkRedOverride(symptoms) {
  return RED_TRIGGERS.some(pattern => pattern.test(symptoms));
}
```

### Priority Queue (`server.js`)

Scoring formula for nurse queue prioritization:

```js
function calculatePriority(item) {
  let score = 0;
  if (item.riskLevel === "RED")           score += 100;
  if (item.riskLevel === "YELLOW")        score += 50;
  if (item.riskLevel === "GREEN")         score += 10;
  if (item.isPregnant)                    score += 30;
  if (item.age < 1)                       score += 40;
  else if (item.age < 5)                  score += 20;
  if (item.comorbidityNote)               score += 15;
  return score;
}
// Higher score = front of queue. FIFO within same score.
```

### Agora RTC Token (`server.js`)

Short-lived tokens issued per channel, per request:

```js
app.get("/token", (req, res) => {
  const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    req.query.channel,
    parseInt(req.query.uid) || 0,
    RtcRole.PUBLISHER,
    expiry, expiry
  );
  res.json({ token });
});
```

### Device Anti-Prank Rate Limit (`src/utils/deviceRateLimit.js`)

Client-side localStorage check — max 3 RED escalations per device per day:

```js
const MAX_PER_DAY = 3;

export function canEscalate() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"count":0,"date":""}');
  const today = new Date().toISOString().slice(0, 10);
  if (stored.date !== today) return true;
  return stored.count < MAX_PER_DAY;
}
```

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your values

# 3. Terminal 1 — Backend (port 3000)
npm run server

# 4. Terminal 2 — Frontend (port 5173)
npm run dev
```

**Routes:**
- `http://localhost:5173/` — BHW login + triage
- `http://localhost:5173/triage-form` — Anonymous patient flow
- `http://localhost:5173/nurse` — Nurse dashboard
- `http://localhost:5173/patients` — Case history

**Dev without Bedrock:** Set `TRIAGE_PROVIDER=ollama` and run `ollama serve` + `ollama pull llama3`

---

## API Routes Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Health check |
| GET | `/config` | None | Agora App ID (safe) |
| GET | `/token` | None | Agora RTC token |
| POST | `/triage/patient` | None | Anonymous triage |
| POST | `/triage` | BHW | BHW triage |
| POST | `/convoai/start` | BHW | Start ConvoAI voice agent |
| POST | `/convoai/stop` | BHW | Stop ConvoAI voice agent |
| POST | `/queue/join` | BHW | Join nurse queue |
| GET | `/queue/status/:id` | Any | Queue position |
| GET | `/queue/dashboard` | Nurse | Full queue state |
| POST | `/queue/complete/:id` | Nurse | Mark call done |
| POST | `/queue/cancel/:id` | BHW | Cancel queue entry |
| POST | `/bridge/initiate` | BHW | Open emergency bridge |
| GET | `/bridge/status` | BHW/Nurse | Bridge state |
| POST | `/bridge/reset` | Nurse | End bridge session |
| POST | `/tts` | None | ElevenLabs TTS proxy |

---

## Database Schema

### `triage_events`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at  timestamptz DEFAULT now()
bhw_id      uuid REFERENCES auth.users
symptoms    text
risk        text  -- GREEN | YELLOW | RED
aksyon      text
overridden  boolean DEFAULT false
```

### `bridge_sessions`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at    timestamptz DEFAULT now()
channel       text
bhw_id        uuid REFERENCES auth.users
nurse_id      uuid REFERENCES auth.users
triggered_at  timestamptz DEFAULT now()
ended_at      timestamptz
```

### Row Level Security
```sql
-- BHWs can only read/write their own triage events
CREATE POLICY "bhw_own_events" ON triage_events
  FOR ALL USING (auth.uid() = bhw_id);

-- Nurses can read all bridge sessions
CREATE POLICY "nurse_read_bridge" ON bridge_sessions
  FOR SELECT USING (auth.jwt()->'user_metadata'->>'role' = 'nurse');

-- Backend service role bypasses RLS for INSERT/UPDATE
```

---

*UgnayAI — Ang boses ng bawat barangay. Ngayon.*
