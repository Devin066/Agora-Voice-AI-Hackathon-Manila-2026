import axios from 'axios';

interface AgoraAIStartParams {
  channel: string;
  token?: string;
}

interface AgoraAIStartResponse {
  agent_id: string;
  status: string;
}

export const startConversationalAIAgent = async ({
  channel,
  token = '',
}: AgoraAIStartParams): Promise<AgoraAIStartResponse> => {
  const joinEndpoint = process.env.AGORA_JOIN_ENDPOINT;
  const base64Credentials = process.env.AGORA_BASE64_CREDENTIALS;
  
  const llmUrl = process.env.LLM_URL;
  const llmApiKey = process.env.LLM_API_KEY || process.env.GOOGLE_API_KEY;
  const llmModelName = process.env.LLM_MODEL_NAME;

  const ttsKey = process.env.TTS_KEY;
  const ttsRegion = process.env.TTS_REGION;

  if (!joinEndpoint || !base64Credentials) {
    throw new Error('Agora API endpoint or credentials are not configured.');
  }

  if (!llmUrl || !llmApiKey || !llmModelName) {
    throw new Error('LLM configuration is missing in environment variables.');
  }

  if (!ttsKey || !ttsRegion) {
    throw new Error('TTS configuration is missing in environment variables.');
  }

  const payload = {
    channel,
    token,
    llm: {
      url: llmUrl,
      api_key: llmApiKey,
      params: {
        model: llmModelName,
      },
    },
    asr: {
      language: 'en-US',
    },
    tts: {
      vendor: 'microsoft',
      params: {
        key: ttsKey,
        region: ttsRegion,
        voice_name: 'en-US-AndrewMultilingualNeural',
      },
    },
  };

  try {
    const response = await axios.post<AgoraAIStartResponse>(joinEndpoint, payload, {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.message;
    console.error('Failed to start Agora Conversational AI Agent', { status, message });
    throw new Error('Failed to start Agora AI Agent');
  }
};
