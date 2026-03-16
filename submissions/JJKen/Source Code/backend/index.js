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
  process.env.AGORA_CONVO_AI_START_PATH || '/api/conversational-ai-agent/v2/projects/{appId}/join';
const CONVO_AI_STOP_PATH_TEMPLATE =
  process.env.AGORA_CONVO_AI_STOP_PATH ||
  '/api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave';
const CONVO_AI_TIMEOUT_MS = Number(process.env.CONVO_AI_TIMEOUT_MS || 10000);
const CONVO_AI_RETRIES = Number(process.env.CONVO_AI_RETRIES || 1);
const DEFAULT_ASSISTANT_PROMPT =
  process.env.DEFAULT_ASSISTANT_PROMPT || 'You are a helpful real-time cooking assistant.';
const DEFAULT_ASSISTANT_NAME = process.env.DEFAULT_ASSISTANT_NAME || 'cook-assistant';
const DEFAULT_TTS_ADDON = process.env.DEFAULT_TTS_ADDON || '';
const DEFAULT_TTS_VENDOR = process.env.DEFAULT_TTS_VENDOR || '';
const DEFAULT_TTS_PARAMS_JSON = process.env.DEFAULT_TTS_PARAMS_JSON || '';
const DEFAULT_TTS_API_KEY = process.env.DEFAULT_TTS_API_KEY || '';
const DEFAULT_TTS_REGION = process.env.DEFAULT_TTS_REGION || '';
const DEFAULT_TTS_VOICE_ID = process.env.DEFAULT_TTS_VOICE_ID || '';
const DEFAULT_ASR_VENDOR = process.env.DEFAULT_ASR_VENDOR || 'ares';
const DEFAULT_ASR_LANGUAGE = process.env.DEFAULT_ASR_LANGUAGE || 'en-US';
const DEFAULT_LLM_URL = process.env.DEFAULT_LLM_URL || '';
const DEFAULT_LLM_API_KEY = process.env.DEFAULT_LLM_API_KEY || '';
const DEFAULT_LLM_MODEL = process.env.DEFAULT_LLM_MODEL || '';
const DEFAULT_LLM_STYLE = process.env.DEFAULT_LLM_STYLE || 'groq';
const DEFAULT_LLM_MAX_TOKENS = Number(process.env.DEFAULT_LLM_MAX_TOKENS || 512);
const DEFAULT_LLM_TEMPERATURE = Number(process.env.DEFAULT_LLM_TEMPERATURE || 0.2);
const DEFAULT_GREETING = process.env.DEFAULT_GREETING || 'Hello, how can I assist you?';
const DEFAULT_FAILURE_MESSAGE = process.env.DEFAULT_FAILURE_MESSAGE || 'Please hold on a second.';
const DEFAULT_LLM_MAX_HISTORY = Number(process.env.DEFAULT_LLM_MAX_HISTORY || 32); // Keep this line unchanged
const DEFAULT_ELEVENLABS_TTS_KEY = process.env.ELEVENLABS_TTS_KEY || '';
const DEFAULT_ELEVENLABS_TTS_BASE_URL = process.env.ELEVENLABS_TTS_BASE_URL || 'https://api.elevenlabs.io/v1';
const DEFAULT_ELEVENLABS_TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL || 'eleven_flash_v2_5';
const DEFAULT_ELEVENLABS_TTS_VOICE_ID = process.env.ELEVENLABS_TTS_VOICE_ID || '';
const DEFAULT_OPENAI_TTS_API_KEY = process.env.OPENAI_TTS_API_KEY || '';
const DEFAULT_OPENAI_TTS_BASE_URL = process.env.OPENAI_TTS_BASE_URL || 'https://api.openai.com/v1';
const DEFAULT_OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const DEFAULT_OPENAI_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'coral';
const DEFAULT_OPENAI_TTS_SPEED = parseFloat(process.env.OPENAI_TTS_SPEED || '1.0');
const DEFAULT_MICROSOFT_TTS_SPEED = parseFloat(process.env.DEFAULT_MICROSOFT_TTS_SPEED || '1.0');
const DEFAULT_MICROSOFT_TTS_VOLUME = parseFloat(process.env.DEFAULT_MICROSOFT_TTS_VOLUME || '70');
const DEFAULT_MICROSOFT_TTS_SAMPLE_RATE = Number(process.env.DEFAULT_MICROSOFT_TTS_SAMPLE_RATE || 24000);
const DEFAULT_ENABLE_STRING_UID =
  String(process.env.DEFAULT_ENABLE_STRING_UID ?? process.env.AGORA_ENABLE_STRING_UID ?? 'true')
    .trim()
    .toLowerCase() === 'true';
const AGORA_AGENT_UID = process.env.AGORA_AGENT_UID || '';
const MAX_RTC_UID = 2147483647;

const RECIPE_PLAN_TEMPLATES = {
  'garlic herb chicken': {
    durationMinutes: 25,
    difficulty: 'Beginner',
    steps: [
      {
        title: 'Season the chicken',
        instruction: 'Pat chicken dry, then season with garlic, rosemary, thyme, salt, and pepper.',
        tip: 'A dry surface helps the chicken sear better.',
        timerSeconds: 180
      },
      {
        title: 'Heat the skillet',
        instruction: 'Heat olive oil in a skillet over medium-high heat until shimmering.',
        tip: 'If the oil shimmers, the pan is ready.',
        timerSeconds: 120
      },
      {
        title: 'Sear both sides',
        instruction: 'Sear chicken on both sides until deeply golden.',
        tip: 'Do not crowd the pan to keep browning strong.',
        timerSeconds: 480
      },
      {
        title: 'Build aromatics',
        instruction: 'Move chicken out briefly, then saute garlic and herbs in the same pan.',
        tip: 'Keep heat moderate so garlic does not burn.',
        timerSeconds: 120
      },
      {
        title: 'Simmer to finish',
        instruction: 'Add broth and lemon juice, return chicken, and simmer until cooked through.',
        tip: 'Target internal temperature of 165F.',
        timerSeconds: 600
      },
      {
        title: 'Rest and plate',
        instruction: 'Rest chicken for 2 minutes, then slice and plate with sauce.',
        tip: 'Resting keeps juices inside the meat.',
        timerSeconds: 120
      }
    ]
  }
};

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
  if (Number.isInteger(parsed) && parsed > 0) {
    return ((parsed - 1) % MAX_RTC_UID) + 1;
  }

  const hex = crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 8);
  return (Number.parseInt(hex, 16) % MAX_RTC_UID) + 1;
}

function normalizeRtcUid(uid) {
  const n = Number.parseInt(uid, 10);
  if (!Number.isInteger(n) || n <= 0) {
    return 1;
  }
  return ((n - 1) % MAX_RTC_UID) + 1;
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

function getConvoAiPath(pathTemplate, params = {}) {
  const mergedParams = {
    appId: process.env.AGORA_APP_ID || '',
    ...params
  };

  return pathTemplate.replace(/\{(\w+)\}/g, (match, key) => {
    const value = mergedParams[key];
    if (value === undefined || value === null) {
      return match;
    }
    return String(value);
  });
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

function parseJsonObject(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function toGeminiSystemMessage(prompt) {
  return {
    role: 'user',
    parts: [{ text: prompt }]
  };
}

function normalizeGroqSystemMessages(messages, fallbackPrompt) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [toGeminiSystemMessage(fallbackPrompt)];
  }

  return messages
    .map((message) => {
      if (!message || typeof message !== 'object') {
        return null;
      }

      const role = message.role || 'user';

      if (Array.isArray(message.parts) && message.parts.length > 0) {
        return { ...message, role };
      }

      if (typeof message.content === 'string' && message.content.trim()) {
        return {
          role,
          parts: [{ text: message.content }]
        };
      }

      return null;
    })
    .filter(Boolean);
}

function getConvoAiAuthHeader() {
  const raw = `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_SECRET}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

function isLlmConfigured() {
  return (
    isRealEnvValue(DEFAULT_LLM_URL) &&
    isRealEnvValue(DEFAULT_LLM_API_KEY) &&
    isRealEnvValue(DEFAULT_LLM_MODEL)
  );
}

function sanitizeCookHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .slice(-8)
    .map((entry) => {
      const role = entry?.role === 'assistant' ? 'assistant' : 'user';
      const content = String(entry?.content || '').trim();
      if (!content) {
        return null;
      }
      return { role, content };
    })
    .filter(Boolean);
}

function buildCookFallbackReply({ command, userText, recipeName, stepSummary }) {
  const normalizedCommand = String(command || '').trim().toLowerCase();
  const normalizedUserText = String(userText || '').trim();

  if (normalizedUserText) {
    return `For ${recipeName}, based on what you said ("${normalizedUserText}"), do this now: ${stepSummary}`;
  }

  if (normalizedCommand === 'what-next') {
    return `For ${recipeName}, focus on this now: ${stepSummary}`;
  }
  if (normalizedCommand === 'repeat') {
    return `Repeating your current instruction: ${stepSummary}`;
  }
  if (normalizedCommand === 'pause') {
    return 'Timer updated. Continue when ready, and ask for the next action anytime.';
  }
  if (normalizedCommand === 'next') {
    return `Great progress. Your current focus is: ${stepSummary}`;
  }
  if (normalizedCommand === 'back') {
    return `No problem, we stepped back. Resume here: ${stepSummary}`;
  }

  return `For ${recipeName}, continue with: ${stepSummary}`;
}

async function requestCookAssistantReply({ command, userText, recipeName, recipeDescription, stepSummary, history }) {
  if (!isLlmConfigured()) {
    return buildCookFallbackReply({ command, userText, recipeName, stepSummary });
  }

  const systemPrompt = [
    'You are HeardChef, a concise real-time cooking coach.',
    `Recipe: ${recipeName || 'Current recipe'}.`,
    recipeDescription ? `Recipe context: ${recipeDescription}.` : '',
    `Current step context: ${stepSummary}.`,
    'Return only one short assistant response (max 2 sentences).',
    'Give actionable cooking guidance. No markdown.'
  ]
    .filter(Boolean)
    .join(' ');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...sanitizeCookHistory(history),
    {
      role: 'user',
      content: String(userText || '').trim()
        ? `User said: ${String(userText || '').trim()}\nRespond with immediate cooking guidance for this recipe and step context.`
        : `Cook command: ${String(command || 'what-next')}. Give the immediate guidance now.`
    }
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONVO_AI_TIMEOUT_MS);

  try {
    const response = await fetch(DEFAULT_LLM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEFAULT_LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_LLM_MODEL,
        messages,
        max_tokens: DEFAULT_LLM_MAX_TOKENS,
        temperature: DEFAULT_LLM_TEMPERATURE
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(
        data?.error?.message || data?.message || `Cook assistant failed with status ${response.status}`
      );
      error.status = response.status;
      throw error;
    }

    const content = data?.choices?.[0]?.message?.content;
    const text = Array.isArray(content)
      ? content
          .map((part) => (typeof part === 'string' ? part : part?.text || ''))
          .join(' ')
          .trim()
      : String(content || '').trim();

    return text || buildCookFallbackReply({ command, userText, recipeName, stepSummary });
  } catch (error) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'cook_assistant_reply_fallback',
        message: error.message
      })
    );
    return buildCookFallbackReply({ command, userText, recipeName, stepSummary });
  } finally {
    clearTimeout(timer);
  }
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
  const providedProperties =
    agentConfig.properties && typeof agentConfig.properties === 'object' ? agentConfig.properties : {};
  const configuredGreeting =
    agentConfig.greetingMessage ||
    agentConfig.greeting ||
    providedProperties.greeting_message ||
    providedProperties.greeting ||
    DEFAULT_GREETING;
  const llmPrompt = agentConfig.prompt || DEFAULT_ASSISTANT_PROMPT;
  const mergedLlm =
    providedProperties.llm && typeof providedProperties.llm === 'object' ? { ...providedProperties.llm } : {};
  const enableStringUid =
    agentConfig.enableStringUid !== undefined
      ? Boolean(agentConfig.enableStringUid)
      : DEFAULT_ENABLE_STRING_UID;
  const remoteRtcUids =
    Array.isArray(agentConfig.remoteRtcUids) && agentConfig.remoteRtcUids.length > 0
      ? agentConfig.remoteRtcUids.map((uid) => (uid === '*' ? '*' : normalizeRtcUid(uid)))
      : ['*'];

  // Agent and remote participants must not share the same RTC UID in the same channel.
  let agentRtcUid =
    agentConfig.agentRtcUid !== undefined
      ? normalizeRtcUid(agentConfig.agentRtcUid)
      : isRealEnvValue(AGORA_AGENT_UID)
      ? normalizeRtcUid(Number(AGORA_AGENT_UID))
      : normalizeRtcUid(session.uid + 1);
  if (remoteRtcUids.includes(agentRtcUid)) {
    agentRtcUid = normalizeRtcUid(agentRtcUid + 1);
  }

  // ConvoAI agent must use a token minted for its own UID, not the user's UID.
  const agentRtcToken =
    agentConfig.agentToken ||
    buildRtcToken({
      appId: process.env.AGORA_APP_ID,
      appCertificate: process.env.AGORA_APP_CERTIFICATE,
      channelName: session.channelName,
      uid: agentRtcUid
    });

  const providedLlmParams =
    mergedLlm.params && typeof mergedLlm.params === 'object' && !Array.isArray(mergedLlm.params)
      ? { ...mergedLlm.params }
      : {};
  const model = agentConfig.llmModel || providedLlmParams.model || DEFAULT_LLM_MODEL;
  const hasProvidedMessages =
    Array.isArray(providedLlmParams.messages) && providedLlmParams.messages.length > 0;

  mergedLlm.url = DEFAULT_LLM_URL;
  mergedLlm.api_key = DEFAULT_LLM_API_KEY;
  mergedLlm.max_history = DEFAULT_LLM_MAX_HISTORY;
  mergedLlm.greeting_message = configuredGreeting;
  mergedLlm.greeting = configuredGreeting;
  mergedLlm.failure_message = DEFAULT_FAILURE_MESSAGE;
  mergedLlm.style = DEFAULT_LLM_STYLE;
  mergedLlm.prompt = llmPrompt;
  mergedLlm.params = {
    ...providedLlmParams,
    model
  };

  if (hasProvidedMessages) {
    mergedLlm.params.messages = normalizeGroqSystemMessages(providedLlmParams.messages, llmPrompt);
  } else {
    delete mergedLlm.params.messages;
  }

  if (Number.isFinite(DEFAULT_LLM_MAX_TOKENS) && DEFAULT_LLM_MAX_TOKENS > 0) {
    mergedLlm.params.max_tokens = Number.isFinite(Number(mergedLlm.params.max_tokens))
      ? Number(mergedLlm.params.max_tokens)
      : DEFAULT_LLM_MAX_TOKENS;
  }
  if (Number.isFinite(DEFAULT_LLM_TEMPERATURE)) {
    mergedLlm.params.temperature = Number.isFinite(Number(mergedLlm.params.temperature))
      ? Number(mergedLlm.params.temperature)
      : DEFAULT_LLM_TEMPERATURE;
  }

  const mergedTts =
    providedProperties.tts && typeof providedProperties.tts === 'object' ? { ...providedProperties.tts } : {};
  if (!mergedTts.addon && isRealEnvValue(agentConfig.ttsAddon)) {
    mergedTts.addon = agentConfig.ttsAddon;
  }
  if (!mergedTts.addon && isRealEnvValue(DEFAULT_TTS_ADDON)) {
    mergedTts.addon = DEFAULT_TTS_ADDON;
  }

  if (!mergedTts.addon && !mergedTts.vendor && isRealEnvValue(agentConfig.ttsVendor)) {
    mergedTts.vendor = agentConfig.ttsVendor;
  }
  if (!mergedTts.addon && !mergedTts.vendor && isRealEnvValue(DEFAULT_TTS_VENDOR)) {
    mergedTts.vendor = DEFAULT_TTS_VENDOR;
  }

  const mergedTtsParams =
    mergedTts.params && typeof mergedTts.params === 'object' && !Array.isArray(mergedTts.params)
      ? { ...mergedTts.params }
      : {};
  const agentTtsParams =
    agentConfig.ttsParams && typeof agentConfig.ttsParams === 'object' && !Array.isArray(agentConfig.ttsParams)
      ? agentConfig.ttsParams
      : null;
  const defaultTtsParams = parseJsonObject(DEFAULT_TTS_PARAMS_JSON);

  if (!mergedTts.addon && Object.keys(mergedTtsParams).length === 0 && agentTtsParams) {
    Object.assign(mergedTtsParams, agentTtsParams);
  }
  if (!mergedTts.addon && Object.keys(mergedTtsParams).length === 0 && defaultTtsParams) {
    Object.assign(mergedTtsParams, defaultTtsParams);
  }
  if (!mergedTts.addon && String(mergedTts.vendor || '').toLowerCase() === 'microsoft') {
    if (!mergedTtsParams.key && isRealEnvValue(DEFAULT_TTS_API_KEY)) {
      mergedTtsParams.key = DEFAULT_TTS_API_KEY;
    }
    if (!mergedTtsParams.region && isRealEnvValue(DEFAULT_TTS_REGION)) {
      mergedTtsParams.region = DEFAULT_TTS_REGION;
    }
    if (!mergedTtsParams.voice_name && isRealEnvValue(DEFAULT_TTS_VOICE_ID)) {
      mergedTtsParams.voice_name = DEFAULT_TTS_VOICE_ID;
    }
    if (!mergedTtsParams.speed) {
      mergedTtsParams.speed = DEFAULT_MICROSOFT_TTS_SPEED;
    }
    if (!mergedTtsParams.volume) {
      mergedTtsParams.volume = DEFAULT_MICROSOFT_TTS_VOLUME;
    }
    if (!mergedTtsParams.sample_rate) {
      mergedTtsParams.sample_rate = DEFAULT_MICROSOFT_TTS_SAMPLE_RATE;
    }
  }

  if (!mergedTts.addon && String(mergedTts.vendor || '').toLowerCase() === 'elevenlabs') {
    if (!mergedTtsParams.key && isRealEnvValue(DEFAULT_ELEVENLABS_TTS_KEY)) {
      mergedTtsParams.key = DEFAULT_ELEVENLABS_TTS_KEY;
    }
    if (!mergedTtsParams.base_url) {
      mergedTtsParams.base_url = DEFAULT_ELEVENLABS_TTS_BASE_URL;
    }
    if (!mergedTtsParams.model_id) {
      mergedTtsParams.model_id = DEFAULT_ELEVENLABS_TTS_MODEL;
    }
    if (!mergedTtsParams.voice_id && isRealEnvValue(DEFAULT_ELEVENLABS_TTS_VOICE_ID)) {
      mergedTtsParams.voice_id = DEFAULT_ELEVENLABS_TTS_VOICE_ID;
    }
    if (!mergedTtsParams.sample_rate) {
      mergedTtsParams.sample_rate = 24000;
    }
  }

  if (!mergedTts.addon && String(mergedTts.vendor || '').toLowerCase() === 'openai') {
    if (!mergedTtsParams.api_key && isRealEnvValue(DEFAULT_OPENAI_TTS_API_KEY)) {
      mergedTtsParams.api_key = DEFAULT_OPENAI_TTS_API_KEY;
    }
    if (!mergedTtsParams.base_url) {
      mergedTtsParams.base_url = DEFAULT_OPENAI_TTS_BASE_URL;
    }
    if (!mergedTtsParams.model) {
      mergedTtsParams.model = DEFAULT_OPENAI_TTS_MODEL;
    }
    if (!mergedTtsParams.voice) {
      mergedTtsParams.voice = DEFAULT_OPENAI_TTS_VOICE;
    }
    if (!mergedTtsParams.speed) {
      mergedTtsParams.speed = DEFAULT_OPENAI_TTS_SPEED;
    }
  }

  if (!mergedTts.addon && mergedTts.vendor && Object.keys(mergedTtsParams).length > 0) {
    mergedTts.params = mergedTtsParams;
  }

  if (!mergedTts.addon && !(mergedTts.vendor && mergedTts.params)) {
    const error = new Error(
      'Missing Conversational AI TTS configuration. Provide agentConfig.properties.tts, set DEFAULT_TTS_ADDON, or set DEFAULT_TTS_VENDOR plus params.'
    );
    error.status = 500;
    throw error;
  }

  const resolvedAgentName =
    agentConfig.name || `${DEFAULT_ASSISTANT_NAME}-${session.sessionId || session.channelName}`;

  const payload = {
    name: resolvedAgentName,
    properties: {
      channel: session.channelName,
      token: agentRtcToken,
      agent_rtc_uid: enableStringUid ? String(agentRtcUid) : agentRtcUid,
      agent_rtm_uid: `${agentRtcUid}-${session.channelName}`,
      remote_rtc_uids: enableStringUid
        ? remoteRtcUids.map((uid) => (uid === '*' ? '*' : String(uid)))
        : remoteRtcUids,
      advanced_features: {
        enable_rtm: true
      },
      enable_string_uid: enableStringUid,
      idle_timeout: Number(agentConfig.idleTimeout || 120),
      asr: {
        vendor: agentConfig.asrVendor || DEFAULT_ASR_VENDOR,
        language: agentConfig.asrLanguage || DEFAULT_ASR_LANGUAGE
      },
      ...providedProperties,
      greeting_message: configuredGreeting,
      greeting: configuredGreeting,
      llm: mergedLlm,
      tts: mergedTts
    }
  };

  console.log(
    JSON.stringify({
      level: 'info',
      event: 'convo_ai_start_payload',
      channel: session.channelName,
      agentRtcUid: payload.properties.agent_rtc_uid,
      agentRtmUid: payload.properties.agent_rtm_uid,
      remoteRtcUids: payload.properties.remote_rtc_uids,
      enableStringUid: payload.properties.enable_string_uid,
      ttsVendor: payload.properties.tts?.vendor || null,
      hasTtsAddon: Boolean(payload.properties.tts?.addon),
      llmUrl: payload.properties.llm?.url || null,
      llmModel: payload.properties.llm?.params?.model || null,
      asrVendor: payload.properties.asr?.vendor || null,
      asrLanguage: payload.properties.asr?.language || null
    })
  );

  const response = await callConvoAi({ path, body: payload });
  console.log(
    JSON.stringify({
      level: 'info',
      event: 'convo_ai_start_response',
      channel: session.channelName,
      response
    })
  );
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
  const pathTemplate = CONVO_AI_STOP_PATH_TEMPLATE;
  const usesAgentIdPath = pathTemplate.includes('{agentId}');

  if (usesAgentIdPath && !session.agentSessionId) {
    const error = new Error('Missing agent session id for Conversational AI leave endpoint');
    error.status = 400;
    throw error;
  }

  const path = getConvoAiPath(pathTemplate, {
    agentId: session.agentSessionId
  });
  const payload = usesAgentIdPath
    ? {}
    : {
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
    appId: process.env.AGORA_APP_ID,
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
  const includeDebug =
    String(req.query.debug || '').toLowerCase() === '1' ||
    String(req.query.debug || '').toLowerCase() === 'true';

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
    },
    ...(includeDebug ? { debug: { convoAiStartResponse: session.convoAiStartResponse } } : {})
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

function generateChannelName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `heardchef-${timestamp}-${random}`;
}

function slugifyRecipeName(recipeName = '') {
  return String(recipeName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function buildGenericRecipePlan({ recipeName, description, durationMinutes, difficulty }) {
  return {
    recipeName,
    description,
    durationMinutes: Number.isFinite(Number(durationMinutes)) ? Number(durationMinutes) : 20,
    difficulty: difficulty || 'Easy',
    source: 'generic-template',
    steps: [
      {
        index: 1,
        title: 'Prep ingredients',
        instruction: 'Gather and prep all ingredients so cooking is uninterrupted.',
        tip: 'Measure first to avoid mid-cook delays.',
        timerSeconds: 180
      },
      {
        index: 2,
        title: 'Heat your pan',
        instruction: 'Bring your pan to cooking temperature before adding main ingredients.',
        tip: 'Preheating improves texture and color.',
        timerSeconds: 120
      },
      {
        index: 3,
        title: 'Cook the main component',
        instruction: 'Cook the primary ingredient until properly browned or set.',
        tip: 'Avoid constant stirring so it can develop flavor.',
        timerSeconds: 420
      },
      {
        index: 4,
        title: 'Build flavor',
        instruction: 'Add aromatics, seasonings, or sauce elements and stir gently.',
        tip: 'Taste and adjust seasoning early.',
        timerSeconds: 180
      },
      {
        index: 5,
        title: 'Finish and rest',
        instruction: 'Cook to doneness, then rest briefly before serving.',
        tip: 'A short rest improves final texture.',
        timerSeconds: 120
      }
    ]
  };
}

function buildRecipePlan(body = {}) {
  const recipeName = String(body.recipeName || '').trim();
  const description = String(body.description || '').trim();
  const durationMinutes = Number(body.durationMinutes || 0);
  const difficulty = String(body.difficulty || '').trim();

  if (!recipeName) {
    const error = new Error('recipeName is required');
    error.status = 400;
    throw error;
  }

  const key = slugifyRecipeName(recipeName);
  const preset = RECIPE_PLAN_TEMPLATES[key];
  const plan = preset
    ? {
        recipeName,
        description,
        durationMinutes: preset.durationMinutes,
        difficulty: preset.difficulty,
        source: 'preset-template',
        steps: preset.steps.map((step, idx) => ({
          index: idx + 1,
          title: step.title,
          instruction: step.instruction,
          tip: step.tip,
          timerSeconds: Number(step.timerSeconds || 0)
        }))
      }
    : buildGenericRecipePlan({ recipeName, description, durationMinutes, difficulty });

  return {
    recipe: {
      name: plan.recipeName,
      description: plan.description,
      durationMinutes: plan.durationMinutes,
      difficulty: plan.difficulty
    },
    plan: {
      source: plan.source,
      totalSteps: plan.steps.length,
      steps: plan.steps
    }
  };
}

function getRecipePlan(req, res) {
  try {
    const response = buildRecipePlan(req.body || {});
    return res.status(200).json(response);
  } catch (error) {
    const status = error.status || 500;
    const code = status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    return res.status(status).json({
      error: {
        code,
        message: error.message || 'Failed to build recipe plan'
      }
    });
  }
}

async function getCookAssistantReply(req, res) {
  const command = String(req.body?.command || '').trim();
  const userText = String(req.body?.userText || '').trim();
  const recipeName = String(req.body?.recipeName || '').trim();
  const recipeDescription = String(req.body?.recipeDescription || '').trim();
  const stepSummary = String(req.body?.stepSummary || '').trim();
  const history = req.body?.history;

  if ((!command && !userText) || !stepSummary) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Provide command or userText, and stepSummary'
      }
    });
  }

  const reply = await requestCookAssistantReply({
    command,
    userText,
    recipeName,
    recipeDescription,
    stepSummary,
    history
  });

  return res.status(200).json({
    reply,
    source: isLlmConfigured() ? 'llm' : 'fallback'
  });
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
app.get(`${API_BASE}/channel`, (req, res) => {
  res.json({ channelName: generateChannelName() });
});
app.post(`${API_BASE}/session`, createSession);
app.post(`${API_BASE}/start`, startConversation);
app.post(`${API_BASE}/end`, endSession);
app.post(`${API_BASE}/recipe-plan`, getRecipePlan);
app.post(`${API_BASE}/cook-assistant-reply`, getCookAssistantReply);

// Backward-compatible aliases during integration
app.post('/session', createSession);
app.post('/start', startConversation);
app.post('/end', endSession);
app.post('/recipe-plan', getRecipePlan);
app.post('/cook-assistant-reply', getCookAssistantReply);

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
