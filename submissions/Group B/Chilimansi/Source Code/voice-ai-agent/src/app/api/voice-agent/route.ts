import { NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
const APP_CERT = process.env.AGORA_APP_CERTIFICATE ?? "";
const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID ?? "";
const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET ?? "";
const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_VOICE = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

const AGENT_UID = "1001";
const USER_UID = "1002";
const BASE_URL = "https://api.agora.io/api/conversational-ai-agent/v2/projects";

function getBasicAuth(): string {
  return Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`).toString("base64");
}

function generateToken(channel: string, uid: number): string {
  const now = Math.floor(Date.now() / 1000);
  const expire = 3600;
  return RtcTokenBuilder.buildTokenWithUid(
    APP_ID, APP_CERT, channel, uid, RtcRole.PUBLISHER, expire, now + expire
  );
}


type Payload = {
  action?: "start-session" | "stop-session";
  channel?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as Payload;

  if (payload.action === "stop-session" && payload.sessionId) {
    return stopAgent(payload.sessionId);
  }

  return startAgent(payload.channel);
}

async function startAgent(channel?: string) {
  const channelName = channel ?? `emergency-${Date.now()}`;
  const agentToken = generateToken(channelName, Number(AGENT_UID));
  const userToken = generateToken(channelName, Number(USER_UID));

  const body = {
    name: channelName,
    properties: {
      channel: channelName,
      token: agentToken,
      agent_rtc_uid: AGENT_UID,
      remote_rtc_uids: ["*"],
      idle_timeout: 120,
      asr: {
        language: "en-US",
      },
      llm: {
        url: "https://generativelanguage.googleapis.com/v1beta/openai",
        api_key: GEMINI_KEY,
        system_messages: [
          {
            role: "system",
            content:
              "You are First Aid Bot, an emergency medical voice assistant. You provide calm, clear first aid instructions to help responders assist patients in distress. Focus on the patient's condition and guide the responder step by step. Be concise and reassuring. If the situation is life-threatening, always remind them to call 911 or 143 (Philippine Red Cross).",
          },
        ],
        max_history: 32,
        greeting_message: "I'm First Aid Bot. Tell me what's happening and I'll guide you.",
        failure_message: "Hold on, I'm still here. Can you repeat that?",
        params: {
          model: "gemini-2.0-flash",
        },
      },
      tts: {
        vendor: "elevenlabs",
        params: {
          key: ELEVENLABS_KEY,
          model_id: "eleven_turbo_v2",
          voice_id: ELEVENLABS_VOICE,
          stability: 0.5,
          sample_rate: 24000,
        },
      },
    },
  };

  console.log("Agora request:", JSON.stringify(body, null, 2));

  const res = await fetch(`${BASE_URL}/${APP_ID}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${getBasicAuth()}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log("Agora response:", res.status, text);

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "Failed to start agent", details: text },
      { status: res.status }
    );
  }

  const data = JSON.parse(text);

  return NextResponse.json({
    ok: true,
    sessionId: data.agent_id,
    channelName,
    userUid: Number(USER_UID),
    userToken,
    appId: APP_ID,
  });
}

async function stopAgent(agentId: string) {
  const res = await fetch(`${BASE_URL}/${APP_ID}/agents/${agentId}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, error: "Failed to stop agent", details: text },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true, sessionId: agentId });
}
