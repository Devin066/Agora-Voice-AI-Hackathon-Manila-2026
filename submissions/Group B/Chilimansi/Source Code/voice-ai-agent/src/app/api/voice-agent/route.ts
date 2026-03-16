import { NextResponse } from "next/server";
import { generateRtcToken } from "@/lib/agora/tokenBuilder";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID ?? "";
const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET ?? "";

const CONVO_AI_BASE_URL = "https://api.agora.io/api/conversational-ai-agent/v1/projects";

function getBasicAuth(): string {
  return Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`).toString("base64");
}

type VoiceAgentPayload = {
  action?: "start-session" | "stop-session";
  channel?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as VoiceAgentPayload;

  if (payload.action === "stop-session" && payload.sessionId) {
    return handleStopSession(payload.sessionId);
  }

  return handleStartSession(payload.channel);
}

async function handleStartSession(channel?: string) {
  const channelName = channel ?? `emergency-${Date.now()}`;
  const agentUid = 12345;
  const userUid = Math.floor(Math.random() * 100000) + 1000;

  const userToken = generateRtcToken(channelName, userUid);
  const agentToken = generateRtcToken(channelName, agentUid);

  const requestBody = {
    name: `first-aid-bot-${Date.now()}`,
    properties: {
      channel: {
        channel_name: channelName,
        token: agentToken,
        agent_rtc_uid: String(agentUid),
      },
      asr: {
        language: "en-US",
      },
      llm: {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY ?? ""}`,
        system_messages: [
          {
            parts: [
              {
                text: "You are First Aid Bot, an emergency medical voice assistant. You provide calm, clear first aid instructions to help responders assist patients in distress. Focus on the patient's condition and guide the responder step by step. Be concise and reassuring. If the situation is life-threatening, always remind them to call 911 or 143 (Philippine Red Cross).",
              },
            ],
            role: "user",
          },
        ],
        max_history: 32,
        greeting_message: "I'm First Aid Bot. Tell me what's happening and I'll guide you through it.",
        failure_message: "Hold on, I'm still here. Can you repeat that?",
        params: {
          model: "gemini-3-flash",
        },
        style: "gemini",
      },
      tts: {
        vendor: "elevenlabs",
        params: {
          key: process.env.ELEVENLABS_API_KEY ?? "",
          voice_id: process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM",
          model_id: "eleven_turbo_v2",
        },
      },
    },
  };

  console.log("Agora Convo AI request:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${CONVO_AI_BASE_URL}/${APP_ID}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  console.log("Agora Convo AI response:", response.status, responseText);

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, error: "Failed to start conversational AI agent", details: responseText },
      { status: response.status }
    );
  }

  const data = JSON.parse(responseText);

  return NextResponse.json({
    ok: true,
    sessionId: data.agent_id ?? data.id,
    channelName,
    userUid,
    userToken,
    appId: APP_ID,
  });
}

async function handleStopSession(sessionId: string) {
  const response = await fetch(`${CONVO_AI_BASE_URL}/${APP_ID}/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: JSON.stringify({ agent_id: sessionId }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json(
      { ok: false, error: "Failed to stop agent", details: errorBody },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true, sessionId });
}
