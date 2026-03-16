import { NextRequest, NextResponse } from 'next/server';
import { OPENROUTER_CHAT_URL, OPENROUTER_MODEL, ATLAS_CONTEXT } from '@/lib/atlas-llm';

// Agora agent: OpenRouter (cloud) or local Ollama via LLM proxy (set AGORA_LLM_PROXY_URL to your tunnel + /api/agora/llm-proxy).

async function getTokenBuilder() {
  const { RtcTokenBuilder, RtcRole } = await import('agora-access-token');
  return { RtcTokenBuilder, RtcRole };
}

export async function POST(req: NextRequest) {
  const appId = process.env.AGORA_APP_ID?.trim();
  const certificate = process.env.AGORA_APP_CERTIFICATE?.trim();
  const customerId = process.env.AGORA_CUSTOMER_ID?.trim();
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!elevenLabsKey) {
    return NextResponse.json(
      { error: 'ELEVENLABS_API_KEY is required in .env.local for Agora voice TTS.' },
      { status: 400 }
    );
  }

  if (!appId || !certificate) {
    return NextResponse.json(
      { error: 'AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set' },
      { status: 500 }
    );
  }
  if (!customerId || !customerSecret) {
    return NextResponse.json(
      {
        error:
          'AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET required for voice agent. Get them from Agora Console → Developer Toolkit → RESTful API.',
      },
      { status: 500 }
    );
  }

  const useLocalLlm = process.env.USE_LOCAL_LLM === 'true';
  const proxyUrl = process.env.AGORA_LLM_PROXY_URL?.trim();

  if (useLocalLlm && proxyUrl) {
    // Voice agent uses local Ollama via proxy (Agora calls proxyUrl; our server forwards to localhost:11434)
  } else if (!openRouterKey) {
    return NextResponse.json(
      {
        error:
          'Set OPENROUTER_API_KEY for voice, or set USE_LOCAL_LLM=true and AGORA_LLM_PROXY_URL to your tunnel URL (e.g. https://xxx.ngrok.io/api/agora/llm-proxy) to use local Ollama.',
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { channel, userUid } = body as { channel: string; userUid: number };
    if (!channel || typeof userUid !== 'number') {
      return NextResponse.json({ error: 'channel and userUid required' }, { status: 400 });
    }

    const agentUid = 2;
    const { RtcTokenBuilder, RtcRole } = await getTokenBuilder();
    const expiration = 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpired = currentTime + expiration;
    const agentToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      certificate,
      channel,
      agentUid,
      RtcRole.PUBLISHER,
      privilegeExpired
    );

    const joinBody = {
      name: `atlas-agent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      properties: {
        channel,
        token: agentToken,
        agent_rtc_uid: String(agentUid),
        remote_rtc_uids: [String(userUid)],
        idle_timeout: 60,
        turn_detection: {
          mode: 'default',
          config: {
            speech_threshold: 0.35,
            start_of_speech: { mode: 'vad', vad_config: { prefix_padding_ms: 300 } },
            end_of_speech: {
              mode: 'vad',
              vad_config: { silence_duration_ms: 500 },
            },
          },
        },
        asr: {
          language: 'en-US',
        },
        tts: {
          vendor: 'elevenlabs',
          params: {
            base_url: 'https://api.elevenlabs.io',
            key: elevenLabsKey,
            model_id: process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_flash_v2_5',
            voice_id: process.env.ELEVENLABS_VOICE_ID?.trim() || '21m00Tcm4TlvDq8ikWAM',
            sample_rate: 24000,
          },
        },
        llm: useLocalLlm && proxyUrl
          ? {
              vendor: 'custom' as const,
              url: proxyUrl,
              api_key: 'local',
              style: 'openai' as const,
              system_messages: [{ role: 'system', content: ATLAS_CONTEXT }],
              greeting_message: "I'm Atlas, your map assistant. You can ask me to zoom the map or search for places. What would you like to do?",
              failure_message: 'One moment please.',
              params: {
                model: process.env.LOCAL_LLM_MODEL?.trim() || 'gemma3:4b',
              },
            }
          : {
              vendor: 'custom' as const,
              url: OPENROUTER_CHAT_URL,
              api_key: openRouterKey!,
              style: 'openai' as const,
              system_messages: [{ role: 'system', content: ATLAS_CONTEXT }],
              greeting_message: "I'm Atlas, your map assistant. You can ask me to zoom the map or search for places. What would you like to do?",
              failure_message: 'One moment please.',
              params: { model: OPENROUTER_MODEL },
            },
      },
    };

    const auth = Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
    const joinRes = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(joinBody),
      }
    );

    if (!joinRes.ok) {
      const errText = await joinRes.text();
      let hint = '';
      if (joinRes.status === 401)
        hint =
          ' Check AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET from Agora Console → Developer Toolkit → RESTful API (use the downloaded key_and_secret.txt; the secret is shown only once).';
      else if (joinRes.status === 400)
        hint = ' Set ELEVENLABS_API_KEY in .env.local for Agora voice TTS.';
      return NextResponse.json(
        { error: `Agora join failed: ${joinRes.status} ${errText}${hint}` },
        { status: joinRes.status }
      );
    }

    const data = (await joinRes.json()) as { name?: string };
    return NextResponse.json({ agentUid, agentName: data.name });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Join failed' },
      { status: 500 }
    );
  }
}
