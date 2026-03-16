const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { RtcRole, RtcTokenBuilder } = require('agora-token');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = '/api/v1';
const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES || 120);

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

  const agoraConfigured = Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE);
  if (!agoraConfigured) {
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
    expiresInSeconds: SESSION_TTL_MINUTES * 60
  });
}

function startConversation(req, res) {
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

  const now = new Date().toISOString();
  session.status = 'active';
  session.agentConfig = agentConfig;
  session.startedAt = session.startedAt || now;
  session.updatedAt = now;

  return res.status(200).json({
    sessionId: session.sessionId,
    channelName: session.channelName,
    status: session.status,
    startedAt: session.startedAt
  });
}

function endSession(req, res) {
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

  const endedAt = new Date().toISOString();
  session.status = 'terminated';
  session.endedAt = endedAt;
  session.updatedAt = endedAt;

  const response = {
    sessionId: session.sessionId,
    status: session.status,
    endedAt: session.endedAt
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
    agoraConfigured: Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE),
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
