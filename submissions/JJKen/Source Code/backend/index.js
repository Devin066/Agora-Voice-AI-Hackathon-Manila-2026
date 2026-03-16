const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { RtcRole, RtcTokenBuilder } = require('agora-token');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = '/api/v1';
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 120);
const CONVO_AI_BASE_URL = process.env.AGORA_CONVO_AI_BASE_URL || 'https://api.agora.io';
const CONVO_AI_START_PATH_TEMPLATE =
  process.env.AGORA_CONVO_AI_START_PATH || '/api/conversational-ai/v1/projects/{appId}/join';
const CONVO_AI_STOP_PATH_TEMPLATE =
  process.env.AGORA_CONVO_AI_STOP_PATH || '/api/conversational-ai/v1/projects/{appId}/leave';
const CONVO_AI_TIMEOUT_MS = Number(process.env.CONVO_AI_TIMEOUT_MS || 10000);
const CONVO_AI_RETRIES = Number(process.env.CONVO_AI_RETRIES || 1);
const DEFAULT_ASSISTANT_PROMPT =
  process.env.DEFAULT_ASSISTANT_PROMPT || 'You are a helpful real-time cooking assistant.';
const DEFAULT_ASSISTANT_NAME = process.env.DEFAULT_ASSISTANT_NAME || 'cook-assistant';

const sessions = new Map();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  req.startedAt = Date.now();
  res.setHeader('x-request-id', req.requestId);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    const durationMs = Date.now() - req.startedAt;
    console.log(
      JSON.stringify({
        level: 'info',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs
      })
    );
  });

  next();
});

function toUid(userId) {
  const parsed = Number.parseInt(userId, 10);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  const hex = crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 8);
  return Number.parseInt(hex, 16) >>> 0;
}

function buildRtcToken({ appId, appCertificate, channelName, uid }) {
  const role = RtcRole.PUBLISHER;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_MINUTES * 60;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    expiresAt
  );
}

function getConvoAiPath(pathTemplate) {
  return pathTemplate.replace('{appId}', process.env.AGORA_APP_ID || '');
}

function isRealEnvValue(value) {
  if (!value) {
    return false;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const placeholderMarkers = ['your-', 'example', 'placeholder', 'changeme', 'replace-me'];
  return !placeholderMarkers.some((marker) => normalized.includes(marker));
}

function isRtcConfigured() {
  return isRealEnvValue(process.env.AGORA_APP_ID) && isRealEnvValue(process.env.AGORA_APP_CERTIFICATE);
}

function isConvoAiConfigured() {
  return (
    isRealEnvValue(process.env.AGORA_CUSTOMER_ID) &&
    isRealEnvValue(process.env.AGORA_CUSTOMER_SECRET)
  );
}

function getConvoAiAuthHeader() {
  const raw = `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_SECRET}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

async function callConvoAi({ path, body }) {
  const maxAttempts = Math.max(1, CONVO_AI_RETRIES + 1);
  const url = `${CONVO_AI_BASE_URL}${path}`;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONVO_AI_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: getConvoAiAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(
          data?.message || data?.error || `ConvoAI request failed with status ${response.status}`
        );
        error.status = response.status;
        error.details = data;

        if (response.status >= 500 && attempt < maxAttempts) {
          lastError = error;
          continue;
        }

        throw error;
      }

      return data;
    } catch (error) {
      const timedOut = error.name === 'AbortError';
      if (timedOut) {
        error.status = 504;
        error.message = `ConvoAI request timed out after ${CONVO_AI_TIMEOUT_MS}ms`;
      }

      if ((timedOut || error.status >= 500 || !error.status) && attempt < maxAttempts) {
        lastError = error;
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error('ConvoAI request failed after retries');
}

async function startConvoAiAgent(session, agentConfig = {}) {
  const path = getConvoAiPath(CONVO_AI_START_PATH_TEMPLATE);
  const payload = {
    channelName: session.channelName,
    rtc: {
      uid: String(session.uid),
      token: session.rtcToken
    },
    agent: {
      name: agentConfig.name || DEFAULT_ASSISTANT_NAME,
      prompt: agentConfig.prompt || DEFAULT_ASSISTANT_PROMPT
    }
  };

  const response = await callConvoAi({ path, body: payload });
  return {
    raw: response,
    agentSessionId:
      response?.agentSessionId ||
      response?.agent_id ||
      response?.id ||
      response?.data?.agentSessionId ||
      null
  };
}

async function stopConvoAiAgent(session) {
  const path = getConvoAiPath(CONVO_AI_STOP_PATH_TEMPLATE);
  const payload = {
    channelName: session.channelName,
    agentSessionId: session.agentSessionId || undefined
  };
  return callConvoAi({ path, body: payload });
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function createSession(req, res) {
  const { userId, channelName } = req.body;

  if (!userId || !channelName) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'userId and channelName are required'
      }
    });
  }

  if (!isRtcConfigured()) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message: 'Agora credentials are not configured. Set AGORA_APP_ID and AGORA_APP_CERTIFICATE.'
      }
    });
  }

  const uid = toUid(userId);
  const token = buildRtcToken({
    appId: process.env.AGORA_APP_ID,
    appCertificate: process.env.AGORA_APP_CERTIFICATE,
    channelName,
    uid
  });

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();
  sessions.set(sessionId, {
    sessionId,
    userId,
    channelName,
    uid,
    rtcToken: token,
    status: 'created',
    createdAt: now,
    updatedAt: now
  });

  return res.status(201).json({
    sessionId,
    userId,
    channelName,
    uid,
    token,
    status: 'created',
    expiresInSeconds: SESSION_TTL_MINUTES * 60,
    flow: {
      rtc: 'token_issued',
      conversationalAi: 'awaiting_start'
    }
  });
}

async function startConversation(req, res) {
  const { sessionId, agentConfig = {} } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sessionId is required'
      }
    });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session does not exist'
      }
    });
  }

  if (!isConvoAiConfigured()) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message:
          'Conversational AI credentials are not configured. Set AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET.'
      }
    });
  }

  if (session.status === 'active') {
    return res.status(409).json({
      error: {
        code: 'INVALID_STATE',
        message: 'Session is already active'
      }
    });
  }

  let convoAiSession;
  try {
    convoAiSession = await startConvoAiAgent(session, agentConfig);
  } catch (error) {
    return res.status(error.status || 502).json({
      error: {
        code: 'CONVO_AI_START_FAILED',
        message: error.message
      },
      details: error.details || null
    });
  }

  const now = new Date().toISOString();
  session.status = 'active';
  session.agentConfig = agentConfig;
  session.agentSessionId = convoAiSession.agentSessionId;
  session.convoAiStartResponse = convoAiSession.raw;
  session.startedAt = session.startedAt || now;
  session.updatedAt = now;

  return res.status(200).json({
    sessionId: session.sessionId,
    channelName: session.channelName,
    status: session.status,
    startedAt: session.startedAt,
    flow: {
      rtc: {
        channelName: session.channelName,
        uid: session.uid
      },
      conversationalAi: {
        state: 'joined',
        agentSessionId: session.agentSessionId
      }
    }
  });
}

async function endSession(req, res) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'sessionId is required'
      }
    });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      error: {
        code: 'SESSION_NOT_FOUND',
        message: 'Session does not exist'
      }
    });
  }

  if (session.status === 'active') {
    if (!isConvoAiConfigured()) {
      return res.status(500).json({
        error: {
          code: 'CONFIG_ERROR',
          message:
            'Conversational AI credentials are not configured. Set AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET.'
        }
      });
    }

    try {
      const stopResponse = await stopConvoAiAgent(session);
      session.convoAiStopResponse = stopResponse;
    } catch (error) {
      return res.status(error.status || 502).json({
        error: {
          code: 'CONVO_AI_STOP_FAILED',
          message: error.message
        },
        details: error.details || null
      });
    }
  }

  const endedAt = new Date().toISOString();
  session.status = 'terminated';
  session.endedAt = endedAt;
  session.updatedAt = endedAt;

  const response = {
    sessionId: session.sessionId,
    status: session.status,
    endedAt: session.endedAt,
    flow: {
      rtc: 'left_channel',
      conversationalAi: 'left_channel'
    }
  };

  sessions.delete(sessionId);
  return res.status(200).json(response);
}

// 1. Health endpoint for demo safety
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'backend',
    uptimeSeconds: Math.floor(process.uptime()),
    agoraRtcConfigured: isRtcConfigured(),
    agoraConvoAiConfigured: isConvoAiConfigured(),
    activeSessions: sessions.size
  });
});

// Locked contract routes
app.post(`${API_BASE}/session`, createSession);
app.post(`${API_BASE}/start`, startConversation);
app.post(`${API_BASE}/end`, endSession);

// Backward-compatible aliases during integration
app.post('/session', createSession);
app.post('/start', startConversation);
app.post('/end', endSession);

app.use((err, req, res, next) => {
  console.error(
    JSON.stringify({
      level: 'error',
      requestId: req.requestId,
      message: err.message,
      stack: err.stack
    })
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
