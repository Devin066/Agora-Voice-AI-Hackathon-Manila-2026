import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agoraToken from 'agora-token';
import { Buffer } from 'node:buffer';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { RtcRole, RtcTokenBuilder } = agoraToken;

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const AGORA_BASE_URL = 'https://api.agora.io';
const PORT = Number(process.env.PORT || '8000');

type GeminiRequestBody = {
  text?: string;
  audio_base64?: string;
  audio_mime_type?: string;
};

type TtsRequestBody = {
  text?: string;
  voice_id?: string;
};

type AgentStartBody = {
  channel?: string;
  userId?: string;
};

const activeAgentByChannel = new Map<string, string>();

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function readJson(response: globalThis.Response) {
  return response.json().catch(async () => ({ raw: await response.text().catch(() => '') }));
}

function buildAgoraAuthHeader() {
  return `Basic ${Buffer.from(`${requireEnv('AGORA_CUSTOMER_ID')}:${requireEnv('AGORA_CUSTOMER_SECRET')}`).toString('base64')}`;
}

async function stopAgoraAgent(agentId: string) {
  const response = await fetch(
    `${AGORA_BASE_URL}/api/conversational-ai-agent/v2/projects/${requireEnv('AGORA_APP_ID')}/agents/${agentId}/leave`,
    {
      method: 'POST',
      headers: {
        Authorization: buildAgoraAuthHeader(),
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to stop agent ${agentId}: ${response.status} ${response.statusText}`);
  }
}

function buildRtcToken(channel: string, uid: number) {
  const expireAt = Math.floor(Date.now() / 1000) + 3600;
  return RtcTokenBuilder.buildTokenWithUid(
    requireEnv('AGORA_APP_ID'),
    requireEnv('AGORA_APP_CERTIFICATE'),
    channel,
    uid,
    RtcRole.PUBLISHER,
    expireAt,
    expireAt,
  );
}

function normalizeModelId(model: string) {
  return model.startsWith('models/') ? model.slice('models/'.length) : model;
}

function buildGeminiApiKeys() {
  const rawKeys = [
    process.env.GEMINI_API_KEY || '',
    ...(process.env.GEMINI_API_KEYS || '').split(/[\r\n,]+/),
  ];

  return Array.from(
    new Set(
      rawKeys
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function buildGeminiBaseUrls() {
  const configured = process.env.GEMINI_BASE_URL?.trim() || 'https://generativelanguage.googleapis.com/v1beta';
  return Array.from(new Set([configured, 'https://generativelanguage.googleapis.com/v1']));
}

function pickFallbackModel(modelNames: string[]) {
  const preferred = [
    'models/gemini-3.1-flash-lite-preview',
    'models/gemini-flash-lite-latest',
    'models/gemini-2.5-flash-lite',
    'models/gemini-2.5-flash',
  ];
  for (const model of preferred) {
    if (modelNames.includes(model)) {
      return model;
    }
  }
  return modelNames[0] || null;
}

async function listGeminiModels(baseUrl: string, apiKey: string) {
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/models?key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) {
    return [] as string[];
  }
  const data = await response.json() as { models?: Array<{ name?: string }> };
  return (data.models || [])
    .map((model) => model.name)
    .filter((name): name is string => Boolean(name));
}

async function generateGeminiResponse(body: GeminiRequestBody) {
  const apiKeys = buildGeminiApiKeys();
  if (apiKeys.length === 0) {
    throw new Error('Missing GEMINI_API_KEY or GEMINI_API_KEYS');
  }
  const configuredModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite-preview';
  let model = normalizeModelId(configuredModel);

  const payload = body.audio_base64
    ? {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: body.text?.trim() || 'Transcribe the audio and respond to it.',
              },
              {
                inline_data: {
                  mime_type: body.audio_mime_type || 'audio/webm',
                  data: body.audio_base64,
                },
              },
            ],
          },
        ],
      }
    : {
        contents: [
          {
            role: 'user',
            parts: [{ text: body.text?.trim() || '' }],
          },
        ],
      };

  let lastResponse: globalThis.Response | null = null;
  let usedBaseUrl = '';
  let usedApiKey = '';

  for (const apiKey of apiKeys) {
    for (const baseUrl of buildGeminiBaseUrls()) {
      lastResponse = await fetch(
        `${baseUrl.replace(/\/+$/, '')}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (lastResponse.ok) {
        usedBaseUrl = baseUrl;
        usedApiKey = apiKey;
        break;
      }
    }

    if (lastResponse?.ok) {
      break;
    }
  }

  if (!lastResponse?.ok) {
    let modelNames: string[] = [];
    for (const apiKey of apiKeys) {
      for (const baseUrl of buildGeminiBaseUrls()) {
        modelNames = await listGeminiModels(baseUrl, apiKey);
        if (modelNames.length > 0) {
          usedApiKey = apiKey;
          break;
        }
      }

      if (modelNames.length > 0) {
        break;
      }
    }

    const fallback = pickFallbackModel(modelNames);
    if (fallback) {
      model = normalizeModelId(fallback);
      for (const apiKey of apiKeys) {
        for (const baseUrl of buildGeminiBaseUrls()) {
          lastResponse = await fetch(
            `${baseUrl.replace(/\/+$/, '')}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            },
          );

          if (lastResponse.ok) {
            usedBaseUrl = baseUrl;
            usedApiKey = apiKey;
            break;
          }
        }

        if (lastResponse?.ok) {
          break;
        }
      }
    }
  }

  if (!lastResponse?.ok) {
    const details = lastResponse ? await lastResponse.text() : 'Gemini request failed';
    throw new Error(details);
  }

  const data = await lastResponse.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || '';
  if (!reply) {
    throw new Error('Gemini returned no text');
  }

  return {
    reply,
    model: `models/${model}`,
    base_url: usedBaseUrl,
    api_key_hint: usedApiKey ? `${usedApiKey.slice(0, 8)}...` : '',
  };
}

async function generateCartesiaAudio(text: string, voiceId?: string) {
  const resolvedVoiceId = process.env.CARTESIA_VOICE_ID?.trim() || requireEnv('CARTESIA_VOICE_ID');
  const response = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireEnv('CARTESIA_API_KEY')}`,
      'Cartesia-Version': process.env.CARTESIA_VERSION?.trim() || '2026-03-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_id: process.env.CARTESIA_MODEL_ID?.trim() || 'sonic-3',
      transcript: text,
      voice: { mode: 'id', id: resolvedVoiceId },
      language: 'en',
      output_format: {
        container: 'mp3',
        sample_rate: 44100,
        bit_rate: 128000,
      },
      generation_config: {
        speed: 1,
        emotion: 'calm',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    audio_base64: Buffer.from(await response.arrayBuffer()).toString('base64'),
    mime_type: 'audio/mpeg',
  };
}

async function generateElevenLabsAudio(text: string, voiceId?: string) {
  const resolvedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID?.trim() || '';
  if (!resolvedVoiceId) {
    throw new Error('Missing ELEVENLABS_VOICE_ID');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(resolvedVoiceId)}`, {
    method: 'POST',
    headers: {
      'xi-api-key': requireEnv('ELEVENLABS_API_KEY'),
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return {
    audio_base64: Buffer.from(await response.arrayBuffer()).toString('base64'),
    mime_type: 'audio/mpeg',
  };
}

function buildAgentTtsConfig() {
  const provider = (process.env.TTS_PROVIDER || 'cartesia').trim().toLowerCase();
  if (provider === 'cartesia') {
    return {
      vendor: 'cartesia',
      params: {
        api_key: requireEnv('CARTESIA_API_KEY'),
        model_id: process.env.CARTESIA_AGORA_MODEL_ID?.trim() || 'sonic-2',
        voice: { mode: 'id', id: requireEnv('CARTESIA_VOICE_ID') },
        output_format: { container: 'raw', sample_rate: 16000 },
        language: 'en',
      },
    };
  }

  return {
    vendor: 'elevenlabs',
    params: {
      base_url: 'wss://api.elevenlabs.io/v1',
      key: requireEnv('ELEVENLABS_API_KEY'),
      model_id: 'eleven_flash_v2_5',
      voice_id: process.env.ELEVENLABS_VOICE_ID?.trim() || '',
      sample_rate: 24000,
    },
  };
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    tts_provider: process.env.TTS_PROVIDER || 'cartesia',
    agora_configured: Boolean(process.env.AGORA_APP_ID && process.env.AGORA_APP_CERTIFICATE),
  });
});

app.get('/token', (req, res) => {
  try {
    const channel = String(req.query.channel || process.env.AGORA_CHANNEL || 'ViVoice');
    const uid = Number.parseInt(String(req.query.uid || '1'), 10);
    res.json({
      token: buildRtcToken(channel, uid),
      appId: requireEnv('AGORA_APP_ID'),
      channel,
      uid,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Agora token', details: String(error) });
  }
});

app.post('/api/gemini', async (req: Request<unknown, unknown, GeminiRequestBody>, res: Response) => {
  try {
    if (!req.body.text?.trim() && !req.body.audio_base64) {
      return res.status(400).json({ error: 'Missing text or audio_base64' });
    }

    res.json(await generateGeminiResponse(req.body));
  } catch (error) {
    res.status(502).json({ error: 'Gemini request failed', details: String(error) });
  }
});

app.post('/api/tts', async (req: Request<unknown, unknown, TtsRequestBody>, res: Response) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const provider = (process.env.TTS_PROVIDER || 'cartesia').trim().toLowerCase();
    const audio = provider === 'cartesia'
      ? await generateCartesiaAudio(text)
      : await generateElevenLabsAudio(text, req.body.voice_id);

    res.json(audio);
  } catch (error) {
    res.status(502).json({ error: 'TTS request failed', details: String(error) });
  }
});

app.post('/api/elevenlabs/tts', async (req: Request<unknown, unknown, TtsRequestBody>, res: Response) => {
  try {
    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const provider = (process.env.TTS_PROVIDER || 'cartesia').trim().toLowerCase();
    const audio = provider === 'cartesia'
      ? await generateCartesiaAudio(text)
      : await generateElevenLabsAudio(text, req.body.voice_id);

    res.json(audio);
  } catch (error) {
    res.status(502).json({ error: 'TTS request failed', details: String(error) });
  }
});

app.post('/agent/start', async (req: Request<unknown, unknown, AgentStartBody>, res: Response) => {
  try {
    const channel = req.body.channel?.trim() || process.env.AGORA_CHANNEL || 'ViVoice';
    const userId = req.body.userId?.trim() || '1';
    const existingAgentId = activeAgentByChannel.get(channel);

    if (existingAgentId) {
      try {
        await stopAgoraAgent(existingAgentId);
      } catch (error) {
        console.warn(`Failed to stop previous Agora agent for ${channel}:`, error);
      } finally {
        activeAgentByChannel.delete(channel);
      }
    }

    const response = await fetch(
      `${AGORA_BASE_URL}/api/conversational-ai-agent/v2/projects/${requireEnv('AGORA_APP_ID')}/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: buildAgoraAuthHeader(),
        },
        body: JSON.stringify({
          name: `agent-${channel}-${Date.now()}`,
          properties: {
            channel,
            token: buildRtcToken(channel, 0),
            agent_rtc_uid: '0',
            remote_rtc_uids: [userId],
            idle_timeout: 30,
            asr: {
              language: 'en-US',
              task: 'conversation',
            },
            vad: {
              silence_duration_ms: 480,
              speech_duration_ms: 15000,
              threshold: 0.5,
              interrupt_duration_ms: 160,
              prefix_padding_ms: 300,
            },
            llm: {
              url: `${(process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '')}/models/${normalizeModelId(process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview')}:streamGenerateContent?alt=sse&key=${requireEnv('GEMINI_API_KEY')}`,
              system_messages: [
                {
                  role: 'user',
                  parts: [{ text: 'You are a calm, friendly, concise voice companion for a visually impaired user. Keep spoken replies natural and brief.' }],
                },
                {
                  role: 'model',
                  parts: [{ text: 'Understood.' }],
                },
              ],
              max_history: 20,
              greeting_message: '',
              failure_message: 'Sorry, give me a moment.',
              style: 'gemini',
              ignore_empty: true,
              params: {
                model: normalizeModelId(process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview'),
              },
            },
            tts: buildAgentTtsConfig(),
          },
        }),
      },
    );

    const data = await readJson(response);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to start agent', details: data });
    }

    const agentId = typeof data === 'object' && data && 'agent_id' in data ? String(data.agent_id) : '';
    if (agentId) {
      activeAgentByChannel.set(channel, agentId);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

app.get('/agent/:agentId', async (req, res) => {
  try {
    const response = await fetch(
      `${AGORA_BASE_URL}/api/conversational-ai-agent/v2/projects/${requireEnv('AGORA_APP_ID')}/agents/${req.params.agentId}`,
      {
        headers: {
          Authorization: buildAgoraAuthHeader(),
        },
      },
    );

    res.status(response.status).json(await readJson(response));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

app.post('/agent/:agentId/stop', async (req, res) => {
  try {
    await stopAgoraAgent(req.params.agentId);
    for (const [channel, agentId] of activeAgentByChannel.entries()) {
      if (agentId === req.params.agentId) {
        activeAgentByChannel.delete(channel);
      }
    }
    const response = new Response('{}', { status: 200 });
    res.status(response.status).json(await readJson(response));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: 'VisionVoice TypeScript backend ready' });
});

app.listen(PORT, () => {
  console.log(`VisionVoice backend running on http://localhost:${PORT}`);
});
