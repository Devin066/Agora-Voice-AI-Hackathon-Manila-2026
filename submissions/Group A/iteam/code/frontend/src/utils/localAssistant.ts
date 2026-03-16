type LocalAssistantRequest = {
  userPrompt: string;
  sceneContext: string;
  recognizedPeople: string[];
  alertLevel: 'safe' | 'notice' | 'caution' | 'stop';
  audioBase64?: string;
  audioMimeType?: string;
};

type GeminiResponse = {
  reply: string;
  model: string;
  base_url: string;
};

type TtsResponse = {
  audio_base64: string;
  mime_type: string;
};

const BACKEND_BASE_URL = (import.meta.env.VITE_LOCAL_AI_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const VOICE_ID =
  import.meta.env.VITE_TTS_VOICE_ID ||
  import.meta.env.VITE_ELEVENLABS_VOICE_ID ||
  'cgSgspJ2msm6clMCkdW9';

export const hasLocalAssistant = () => Boolean(BACKEND_BASE_URL);

const buildPrompt = ({
  userPrompt,
  sceneContext,
  recognizedPeople,
  alertLevel,
}: Omit<LocalAssistantRequest, 'audioBase64' | 'audioMimeType'>) => {
  const peopleText =
    recognizedPeople.length > 0 ? recognizedPeople.join(', ') : 'none';
  const hasLowConfidenceScene =
    /do not have a confident obstacle reading yet/i.test(sceneContext);

  return [
    'You are VisionVoice, a calm assistive companion for a blind user.',
    'Speak naturally and answer in no more than 2 short sentences.',
    'Answer the user request directly instead of repeating the full prompt.',
    'Prioritize immediate hazards, then mention the single most useful nearby detail.',
    'Use only the scene details that are explicitly provided.',
    'If the scene looks uncertain or incomplete, say that clearly and ask for a better camera view instead of saying the path is clear.',
    'Mention recognized people only when relevant to the user request or immediate safety.',
    'Do not invent distances, objects, people, or certainty.',
    'If ALERT is caution or stop, lead with the hazard warning.',
    `ALERT=${alertLevel}`,
    `SCENE_CONFIDENCE=${hasLowConfidenceScene ? 'limited' : 'usable'}`,
    `PEOPLE=${peopleText}`,
    `SCENE=${sceneContext}`,
    `USER=${userPrompt}`,
  ].join('\n');
};

export const requestLocalAssistiveReply = async ({
  userPrompt,
  sceneContext,
  recognizedPeople,
  alertLevel,
  audioBase64,
  audioMimeType,
}: LocalAssistantRequest) => {
  const prompt = [
    buildPrompt({
      userPrompt,
      sceneContext,
      recognizedPeople,
      alertLevel,
    }),
    'If audio is attached, transcribe the spoken question first and answer that question.',
  ].join('\n');

  const response = await fetch(`${BACKEND_BASE_URL}/api/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      audio_base64: audioBase64,
      audio_mime_type: audioMimeType,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => `${response.status} ${response.statusText}`);
    throw new Error(message);
  }

  const data = (await response.json()) as GeminiResponse;
  if (!data.reply?.trim()) {
    throw new Error('Gemini returned no text.');
  }

  return {
    reply: data.reply.trim(),
    model: data.model,
  };
};

export const requestPreferredTtsAudio = async (text: string, voiceId: string = VOICE_ID) => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => `${response.status} ${response.statusText}`);
    throw new Error(message);
  }

  const data = (await response.json()) as TtsResponse;
  if (!data.audio_base64) {
    throw new Error('Preferred TTS provider returned no audio.');
  }

  return `data:${data.mime_type || 'audio/mpeg'};base64,${data.audio_base64}`;
};
