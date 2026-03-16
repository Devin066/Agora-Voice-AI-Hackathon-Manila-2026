require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const path       = require("path");
const { randomUUID } = require("crypto");

const { triageSymptoms }                    = require("./triage");
const { triggerBridge, getBridgeStatus, resetBridge } = require("./bridge");
const { verifySupabaseJWT, requireRole, supabase }    = require("./middleware/auth");
const { triageRateLimiter, bridgeRateLimiter }        = require("./middleware/rateLimiter");
const { RtcTokenBuilder, RtcRole }          = require("agora-token");
const { startConvoAIAgent, stopConvoAIAgent } = require("./convoai");

const app  = express();
const PORT = process.env.PORT || 3000;

const localCases = [];

// ─── Call Queue ───────────────────────────────────────────────────────────────
const callQueue = [];
const activeCall = { queueId: null, bhwId: null, since: null };

function calculatePriority(item) {
  let score = 0;
  if (item.riskLevel === "RED")    score += 100;
  if (item.riskLevel === "YELLOW") score += 50;
  if (item.riskLevel === "GREEN")  score += 10;
  if (item.isPregnant)             score += 30;
  if (item.age !== null && item.age < 1) score += 40;
  else if (item.age !== null && item.age < 5) score += 20;
  if (item.comorbidityNote)        score += 15;
  return score;
}

function recalculatePositions() {
  callQueue.sort((a, b) => {
    const diff = calculatePriority(b) - calculatePriority(a);
    if (diff !== 0) return diff;
    return new Date(a.queuedAt) - new Date(b.queuedAt);
  });
  callQueue.forEach((item, idx) => {
    item.position = idx + 1;
    item.estimatedWaitMinutes = (idx + 1) * 3;
  });
}

// ─── Allowed origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173", "https://ugnayai.vercel.app"];

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://czujlriklivgkchtqjia.supabase.co", "wss://*.supabase.co", "https://api.agora.io", "https://*.agora.io", "https://nominatim.openstreetmap.org"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Public routes (no auth) ──────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── React Router catch-all (before JWT middleware) ───────────────────────────
const API_PREFIXES = ["/health", "/triage", "/bridge", "/token", "/config", "/cases", "/queue", "/tts", "/convoai"];
app.use((req, res, next) => {
  const isApiRoute = API_PREFIXES.some(p =>
    req.path === p || req.path.startsWith(p + "/")
  );
  if (req.method === "GET" && !isApiRoute) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
  next();
});

// ─── Patient triage (anonymous — no role required) ────────────────────────────
app.post("/triage/patient", triageRateLimiter, async (req, res) => {
  const { symptoms, alias, age, sex, isPregnant, location } = req.body;

  if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
    return res.status(400).json({ error: "symptoms is required." });
  }
  if (symptoms.trim().length > 1000) {
    return res.status(400).json({ error: "symptoms must be 1000 characters or fewer." });
  }

  try {
    const result = await triageSymptoms(symptoms, null);
    const caseId = randomUUID();

    if (result.overridden) {
      console.log(`[${new Date().toISOString()}] /triage/patient Safety override applied — escalated to RED`);
    }

    res.json({ risk: result.risk, aksyon: result.aksyon, full_response: result, id: caseId });

    localCases.push({
      id: caseId,
      alias: alias || "Pasyente (anonymous)",
      age: age ?? null,
      sex: sex || null,
      isPregnant: isPregnant || false,
      comorbidityNote: "",
      riskLevel: result.risk,
      aksyon: result.aksyon,
      transcript: symptoms,
      location: location || null,
      bridgeInitiated: false,
      bridgeType: null,
      timestamp: new Date().toISOString(),
      sessionComplete: false,
    });
  } catch (err) {
    console.error(`[ERROR] /triage/patient — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Exposes Agora App ID to the browser safely (no secrets)
app.get("/config", (_req, res) => {
  res.json({ agoraAppId: process.env.AGORA_APP_ID });
});

// Generates a short-lived RTC token
app.get("/token", (req, res) => {
  const channel = req.query.channel || "ugnayai-emergency";
  const uid     = parseInt(req.query.uid) || 0;
  const expiry  = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    channel,
    uid,
    RtcRole.PUBLISHER,
    expiry,
    expiry
  );

  res.json({ token });
});

// ─── Bridge routes ────────────────────────────────────────────────────────────
app.post("/bridge/initiate", requireRole("bhw"), bridgeRateLimiter, async (req, res) => {
  try {
    const session = await triggerBridge(req.user.id);
    res.json({ message: "Bridge initiated.", ...session });
  } catch (err) {
    console.error(`[ERROR] /bridge/initiate — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/bridge/status", requireRole("bhw", "nurse"), async (req, res) => {
  try {
    res.json(await getBridgeStatus());
  } catch (err) {
    console.error(`[ERROR] /bridge/status — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/bridge/reset", requireRole("nurse"), async (req, res) => {
  try {
    await resetBridge(req.user.id);
    res.json({ message: "Bridge reset." });
  } catch (err) {
    console.error(`[ERROR] /bridge/reset — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── Queue endpoints ──────────────────────────────────────────────────────────

app.post("/queue/join", requireRole("bhw"), (req, res) => {
  const { caseId, alias, age, riskLevel, callType, symptoms, barangay, isPregnant, comorbidityNote } = req.body;
  const bhwId = req.user.id;

  const existingByBhw = callQueue.find(i => i.bhwId === bhwId && (i.status === "queued" || i.status === "active"));
  if (existingByBhw) {
    return res.json({ alreadyQueued: true, ...existingByBhw });
  }

  const existingByCase = callQueue.find(i => i.caseId === caseId && (i.status === "queued" || i.status === "active"));
  if (existingByCase) {
    return res.json({ alreadyQueued: true, ...existingByCase });
  }

  const item = {
    queueId: randomUUID(),
    bhwId,
    caseId,
    alias,
    age: age ?? null,
    riskLevel: riskLevel || "GREEN",
    callType: callType || "consultation",
    symptoms: symptoms || "",
    barangay: barangay || "",
    isPregnant: isPregnant || false,
    comorbidityNote: comorbidityNote || "",
    queuedAt: new Date().toISOString(),
    priority: 0,
    status: "queued",
    position: 0,
    estimatedWaitMinutes: 0,
  };

  callQueue.push(item);
  recalculatePositions();

  if (activeCall.queueId === null) {
    item.status = "active";
    activeCall.queueId = item.queueId;
    activeCall.bhwId   = item.bhwId;
    activeCall.since   = new Date().toISOString();
  }

  console.log(`[QUEUE] Joined: ${item.queueId} (${item.alias}, ${item.riskLevel}, pos ${item.position})`);
  res.json({ queueId: item.queueId, position: item.position, estimatedWaitMinutes: item.estimatedWaitMinutes, status: item.status });
});

app.get("/queue/status/:queueId", (req, res) => {
  const item = callQueue.find(i => i.queueId === req.params.queueId);
  if (!item) return res.json({ status: "not_found" });
  res.json({ queueId: item.queueId, status: item.status, position: item.position, estimatedWaitMinutes: item.estimatedWaitMinutes, alias: item.alias });
});

app.get("/queue/dashboard", requireRole("nurse"), (req, res) => {
  res.json({
    activeCall,
    queue: callQueue,
    totalWaiting: callQueue.filter(i => i.status === "queued").length,
  });
});

app.post("/queue/complete/:queueId", requireRole("nurse"), (req, res) => {
  const idx = callQueue.findIndex(i => i.queueId === req.params.queueId);
  if (idx !== -1) {
    callQueue[idx].status = "completed";
    callQueue.splice(idx, 1);
  }

  activeCall.queueId = null;
  activeCall.bhwId   = null;
  activeCall.since   = null;

  const nextItem = callQueue.find(i => i.status === "queued");
  if (nextItem) {
    nextItem.status    = "active";
    activeCall.queueId = nextItem.queueId;
    activeCall.bhwId   = nextItem.bhwId;
    activeCall.since   = new Date().toISOString();
  }

  recalculatePositions();
  res.json({ next: nextItem || null });
});

app.post("/queue/cancel/:queueId", requireRole("bhw"), (req, res) => {
  const bhwId = req.user.id;
  const idx   = callQueue.findIndex(i => i.queueId === req.params.queueId && i.bhwId === bhwId);
  if (idx === -1) return res.json({ success: false, error: "Not found" });

  const item = callQueue[idx];
  item.status = "cancelled";
  callQueue.splice(idx, 1);

  if (activeCall.queueId === item.queueId) {
    activeCall.queueId = null;
    activeCall.bhwId   = null;
    activeCall.since   = null;

    const nextItem = callQueue.find(i => i.status === "queued");
    if (nextItem) {
      nextItem.status    = "active";
      activeCall.queueId = nextItem.queueId;
      activeCall.bhwId   = nextItem.bhwId;
      activeCall.since   = new Date().toISOString();
    }
  }

  recalculatePositions();
  res.json({ success: true });
});

// ─── Queue: timeout job (5 min) ───────────────────────────────────────────────
setInterval(() => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  let changed = false;
  callQueue.forEach(item => {
    if (item.status === "queued" && new Date(item.queuedAt).getTime() < cutoff) {
      item.status = "timeout";
      changed = true;
    }
  });
  if (changed) {
    callQueue.splice(0, callQueue.length, ...callQueue.filter(i => i.status !== "timeout"));
    recalculatePositions();
  }
}, 60000);

// ─── TTS ─────────────────────────────────────────────────────────────────────
app.post("/tts", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required." });
  }

  const apiKey  = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey || apiKey === "your-elevenlabs-api-key-here") {
    return res.status(503).json({ error: "TTS not configured." });
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim().substring(0, 500),
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!upstream.ok) {
      const msg = await upstream.text();
      console.error(`[TTS] ElevenLabs error ${upstream.status}: ${msg}`);
      return res.status(502).json({ error: "TTS upstream error." });
    }

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error(`[ERROR] /tts — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── Local cases ──────────────────────────────────────────────────────────────
app.get("/cases/local", async (req, res) => {
  res.json(localCases);
});

app.post("/cases/:id/complete", async (req, res) => {
  const c = localCases.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found." });
  c.sessionComplete = req.body.sessionComplete ?? true;
  if (req.body.incomplete) c.incomplete = true;
  res.json(c);
});

app.delete("/cases/:id", async (req, res) => {
  const idx = localCases.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Case not found." });
  localCases.splice(idx, 1);
  res.json({ message: "Case removed." });
});

// ─── Triage (BHW) ─────────────────────────────────────────────────────────────
app.post("/triage", requireRole("bhw"), triageRateLimiter, async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
    return res.status(400).json({ error: "symptoms is required." });
  }
  if (symptoms.trim().length > 1000) {
    return res.status(400).json({ error: "symptoms must be 1000 characters or fewer." });
  }

  try {
    const result = await triageSymptoms(symptoms, req.user.id);
    const caseId = randomUUID();
    res.json({ risk: result.risk, aksyon: result.aksyon, full_response: result, id: caseId });

    const { alias, age, sex, isPregnant, comorbidityNote, location } = req.body;
    localCases.push({
      id: caseId,
      alias: alias || "Hindi tinukoy",
      age: age ?? null,
      sex: sex || null,
      isPregnant: isPregnant || false,
      comorbidityNote: comorbidityNote || "",
      riskLevel: result.risk,
      aksyon: result.aksyon,
      transcript: req.body.symptoms,
      location: location || null,
      bridgeInitiated: false,
      bridgeType: null,
      timestamp: new Date().toISOString(),
      sessionComplete: false,
    });
  } catch (err) {
    console.error(`[ERROR] /triage — ${err.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
});

// ─── ConvoAI routes ───────────────────────────────────────────────────────────
app.post("/convoai/start", requireRole("bhw"), async (req, res) => {
  const bhwId   = req.user.id;
  const channel = `ugnayai-convoai-${bhwId.substring(0, 8)}`;

  try {
    const result = await startConvoAIAgent({ channel, bhwId });
    res.json(result);
  } catch (err) {
    console.error(`[ERROR] /convoai/start — ${err.message}`);
    res.status(500).json({ error: "Failed to start ConvoAI agent." });
  }
});

app.post("/convoai/stop", requireRole("bhw"), async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) return res.status(400).json({ error: "agentId is required." });

  try {
    await stopConvoAIAgent(agentId);
    res.json({ message: "ConvoAI agent stopped." });
  } catch (err) {
    console.error(`[ERROR] /convoai/stop — ${err.message}`);
    res.status(500).json({ error: "Failed to stop ConvoAI agent." });
  }
});

// ─── Generic error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(`[UNHANDLED ERROR] ${err.message}`);
  res.status(500).json({ error: "Internal server error." });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[${new Date().toISOString()}] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[${new Date().toISOString()}] Provider: ${process.env.TRIAGE_PROVIDER || "ollama"}`);
});
