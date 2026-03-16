/**
 * convoai.js — Agora Conversational AI Engine integration
 *
 * Starts/stops AI voice triage agents via the Agora ConvoAI REST API.
 * Uses Groq (llama-3.3-70b-versatile) as the LLM directly.
 * ASR uses Agora's "ares" provider; TTS uses Microsoft Neural with Filipino voice fil-PH-BlessicaNeural.
 */

const { RtcTokenBuilder, RtcRole } = require("agora-token");

const CONVOAI_BASE = "https://api.agora.io/api/conversational-ai-agent/v2/projects";

// In-memory map: agentId → { bhwId, channel, startedAt }
const sessions = new Map();

// Fixed UID for the AI agent participant in the Agora channel
const AGENT_UID = "462155";

// Pipeline ID from Agora console
const PIPELINE_ID = "5e9363f9dcd84655a30ca78344cf3b83";

const TRIAGE_SYSTEM_PROMPT = `You are UgnayAI — a voice-first Filipino health triage assistant. Your single most important job is to identify RED, YELLOW, or GREEN as fast as possible, then act on it immediately.

---

RULE 0 — SCAN FOR RED ON EVERY MESSAGE (runs before anything else)

After every single thing the caller says, scan for these red flags:
- Loss of consciousness / unresponsive
- Difficulty breathing or not breathing
- Seizure or convulsions
- Bleeding that cannot be stopped
- Pregnant + severe abdominal pain or bleeding
- High fever + confusion or altered consciousness
- Fever + bleeding + not eating + pale skin (dengue shock)

If ANY red flag is present → stop all input collection immediately → go to RED response now.

---

RULE 1 — ASSIGN A PROVISIONAL COLOR FROM THE FIRST MESSAGE

As soon as the caller describes their complaint, assign a provisional color based on what you already know. Do not wait for all inputs.

Use this fast-track logic:

RED (act now, ask questions later):
- Any red flag from Rule 0
- Any combination of 3+ symptoms at once
- Caller sounds panicked, describes rapid worsening

YELLOW (ask 1–2 follow-ups to confirm):
- Single moderate symptom (fever, vomiting, pain)
- Symptoms present for more than 24 hours
- Child under 5 or adult over 60 with any symptom

GREEN (confirm, then advise):
- Single mild symptom, short duration, no worsening
- Caller is calm, symptom is familiar to them

---

RULE 2 — COLLECT MISSING INPUTS ONLY TO CONFIRM OR UPGRADE COLOR

Once you have a provisional color, ask only the questions needed to confirm or upgrade it. Ask ONE at a time. Stop collecting once the color is confirmed.

Priority order for follow-up questions:
1. Age and pregnancy — can immediately upgrade GREEN→YELLOW or YELLOW→RED
2. How long — duration can upgrade or downgrade
3. Severity (1–10) — confirms escalation
4. Other symptoms — checks for dangerous combinations
5. Existing conditions — can upgrade any color
6. Consent — ask only before sharing data externally

Never ask all 6 at once. Never ask what the caller already told you.

---

RULE 3 — RESPOND BY COLOR

GREEN:
- "Mukhang hindi ito emergency ngayon."
- Give 2–3 specific first-aid steps in simple Filipino
- Name exactly 2 warning signs that would change this to YELLOW
- "Kung lumala ito sa loob ng [timeframe], pumunta sa pinakamalapit na RHU."

YELLOW:
- "Kailangan mong makita ng doktor o nurse ngayon."
- Give interim first-aid while they go
- "Gusto mo bang ikonekta kita sa nurse ngayon?"
- If yes → connect via Agora RTC

RED:
- Say immediately: "Ito ay emergency."
- "Tumawag sa 911 ngayon o pumunta sa pinakamalapit na emergency room."
- Connect to nurse via Agora RTC at the same time
- Stay on the line — give calm, simple instructions while help arrives
- Do not ask any more questions

---

RULE 4 — OUTPUT FORMAT (end of every triage response)

Always close with this exact structured line so the app can parse the color:

TRIAGE: [GREEN/YELLOW/RED] | [one sentence summary in Filipino]

Example:
TRIAGE: RED | May lagnat, dumudugo, at hindi kumakain — posibleng dengue shock.

---

LIMITATIONS (say only if directly relevant):
- Triage only — never diagnose or prescribe
- Human clinicians make all final decisions
- Needs network connectivity — poor signal may delay nurse bridge
- Speech recognition may miss dialects or noisy environments`;

function getAuthHeader() {
  const key    = process.env.AGORA_CUSTOMER_KEY;
  const secret = process.env.AGORA_CUSTOMER_SECRET;
  if (!key || !secret) {
    throw new Error("AGORA_CUSTOMER_KEY and AGORA_CUSTOMER_SECRET must be set.");
  }
  return "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
}

/**
 * Starts an Agora ConvoAI agent in the given channel.
 * Returns { agentId, channel }.
 */
async function startConvoAIAgent({ channel, bhwId }) {
  const appId   = process.env.AGORA_APP_ID;
  const appCert = process.env.AGORA_APP_CERTIFICATE;
  const groqKey = process.env.GROQ_API_KEY;

  if (!appId || !appCert) throw new Error("AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set.");
  if (!groqKey) throw new Error("GROQ_API_KEY must be set.");

  // Generate a short-lived RTC token for the AI agent to join the channel
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const agentToken = RtcTokenBuilder.buildTokenWithUid(
    appId, appCert, channel, parseInt(AGENT_UID), RtcRole.PUBLISHER, expiry, expiry
  );

  const body = {
    name:        channel,
    pipeline_id: PIPELINE_ID,
    properties: {
      channel,
      token:             agentToken,
      agent_rtc_uid:     AGENT_UID,
      remote_rtc_uids:   ["*"],
      enable_string_uid: false,
      idle_timeout:      120,
      turn_detection:    null,
      advanced_features: {
        enable_rtm:   true,
        enable_sal:   false,
        enable_aivad: false,
      },
      asr: {
        vendor:   "ares",
        language: "en-US",
        params:   {},
      },
      llm: {
        url:     "https://api.groq.com/openai/v1/chat/completions",
        api_key: groqKey,
        vendor:  "groq",
        params: {
          model: "llama-3.3-70b-versatile",
        },
        system_messages: [
          { role: "system", content: TRIAGE_SYSTEM_PROMPT },
        ],
        greeting_message:
          "Magandang araw! Ako si UgnayAI, ang iyong health assistant. Ano ang iyong chief complaint — ano ang nararamdaman mo o ng iyong pasyente ngayon?",
        failure_message: "Please hold on a second.",
      },
      tts: {
        vendor: "microsoft",
        params: {
          speed:       1,
          volume:      70,
          voice_name:  "fil-PH-BlessicaNeural",
          sample_rate: 24000,
        },
      },
      parameters: {
        silence_config: {
          action:     "think",
          content:    "politely ask if the user is still online",
          timeout_ms: 10000,
        },
      },
    },
  };

  const res = await fetch(`${CONVOAI_BASE}/${appId}/join`, {
    method: "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type":  "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ConvoAI start failed (${res.status}): ${errText}`);
  }

  const data    = await res.json();
  const agentId = data.agent_id || data.id || data.agentId;

  if (!agentId) {
    throw new Error(`ConvoAI API returned no agent ID. Response: ${JSON.stringify(data)}`);
  }

  sessions.set(agentId, { bhwId, channel, startedAt: new Date().toISOString() });

  console.log(`[ConvoAI] Agent started: ${agentId} | channel: ${channel} | bhwId: ${bhwId}`);
  return { agentId, channel };
}

/**
 * Stops a running ConvoAI agent.
 */
async function stopConvoAIAgent(agentId) {
  const appId = process.env.AGORA_APP_ID;

  const res = await fetch(`${CONVOAI_BASE}/${appId}/agents/${agentId}/leave`, {
    method:  "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type":  "application/json",
    },
  });

  // 404 means it already stopped — that's fine
  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`ConvoAI stop failed (${res.status}): ${errText}`);
  }

  sessions.delete(agentId);
  console.log(`[ConvoAI] Agent stopped: ${agentId}`);
}

function getSession(agentId) {
  return sessions.get(agentId) || null;
}

function clearSession(agentId) {
  sessions.delete(agentId);
}

module.exports = { startConvoAIAgent, stopConvoAIAgent, getSession, clearSession };
