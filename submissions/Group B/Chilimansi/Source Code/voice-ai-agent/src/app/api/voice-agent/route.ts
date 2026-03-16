import { NextResponse } from "next/server";
import { generateRtcToken } from "@/lib/agora/tokenBuilder";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID ?? "";
const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET ?? "";

// Agora Conversational AI Engine base URL (US region)
const CONVO_AI_BASE_URL = "https://api.agora.io/api/conversational-ai-agent/v2/projects";

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
  const agentUid = 0; // Let Agora assign
  const userUid = Math.floor(Math.random() * 100000) + 1000;

  // Generate token for the user to join the channel
  const userToken = generateRtcToken(channelName, userUid);

  // Start the Conversational AI agent via Agora REST API
  const response = await fetch(`${CONVO_AI_BASE_URL}/${APP_ID}/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: JSON.stringify({
      name: `first-aid-bot-${Date.now()}`,
      properties: {
        channel: {
          channel_name: channelName,
          token: generateRtcToken(channelName, agentUid),
          agent_rtc_uid: String(agentUid),
        },
        llm: {
          url: "https://generativelanguage.googleapis.com/v1beta/openai",
          api_key: process.env.GEMINI_API_KEY ?? "",
          model: "gemini-2.0-flash",
          system_messages: [
            {
              role: "system",
              content:
                "You are First Aid Bot, an emergency medical voice assistant. You provide calm, clear first aid instructions to help responders assist patients in distress. Focus on the patient's condition and guide the responder step by step. Be concise and reassuring. If the situation is life-threatening, always remind them to call 911 or 143 (Philippine Red Cross).",
            },
          ],
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
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Agora Convo AI error:", response.status, errorBody);
    return NextResponse.json(
      { ok: false, error: "Failed to start conversational AI agent", details: errorBody },
      { status: response.status }
    );
  }

  const data = await response.json();

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
  const response = await fetch(`${CONVO_AI_BASE_URL}/${APP_ID}/agents/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Agora Convo AI stop error:", response.status, errorBody);
    return NextResponse.json(
      { ok: false, error: "Failed to stop agent", details: errorBody },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true, sessionId });
}
