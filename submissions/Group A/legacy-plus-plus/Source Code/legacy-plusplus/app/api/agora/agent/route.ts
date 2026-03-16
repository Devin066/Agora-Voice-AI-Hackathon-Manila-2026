import { RtcTokenBuilder, RtcRole } from "agora-token";
import { NextRequest, NextResponse } from "next/server";

const AGORA_BASE_URL = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${process.env.NEXT_PUBLIC_AGORA_APP_ID}`;

const SYSTEM_PROMPT = `You are Sparky, a warm and encouraging speech therapy coach for children aged 5 to 13.

Your role is to listen to the child say a word or phrase, then give brief, positive feedback.

Rules:
- Always lead with encouragement before any correction.
- Keep every response to 1-2 sentences maximum — children have short attention spans.
- Use simple words a young child understands.
- Never say the child is wrong or bad. Frame corrections as "let's try together".
- Focus on one specific sound or improvement at a time.
- Celebrate clearly when they do well: "That was perfect! I heard every sound!"
- When correcting: "Nice try! Let's say the R sound together — rrrr. Your turn!"
- Always end with motivation to try again or keep going.`;

// POST — start agent
export async function POST(req: NextRequest) {
  // Read env vars fresh on every request so hot-reload picks them up
  const APP_ID           = process.env.NEXT_PUBLIC_AGORA_APP_ID  ?? "";
  const APP_CERTIFICATE  = process.env.AGORA_APP_CERTIFICATE      ?? "";
  const CUSTOMER_ID      = process.env.AGORA_CUSTOMER_ID          ?? "";
  const CUSTOMER_SECRET  = process.env.AGORA_CUSTOMER_SECRET      ?? "";
  const GEMINI_API_KEY   = process.env.GOOGLE_AI_API_KEY          ?? "";
  const AZURE_TTS_KEY    = process.env.AZURE_SPEECH_KEY            ?? "";
  const AZURE_TTS_REGION = process.env.AZURE_SPEECH_REGION         ?? "eastasia";

  // Check for missing credentials and report exactly which ones
  const missing: string[] = [];
  if (!APP_ID)          missing.push("NEXT_PUBLIC_AGORA_APP_ID");
  if (!APP_CERTIFICATE) missing.push("AGORA_APP_CERTIFICATE");
  if (!CUSTOMER_ID)     missing.push("AGORA_CUSTOMER_ID");
  if (!CUSTOMER_SECRET) missing.push("AGORA_CUSTOMER_SECRET");
  if (!GEMINI_API_KEY)  missing.push("GOOGLE_AI_API_KEY");
  if (!AZURE_TTS_KEY)   missing.push("AZURE_SPEECH_KEY");

  if (missing.length > 0) {
    console.error("Agent route — missing env vars:", missing);
    return NextResponse.json(
      { error: `Missing env vars: ${missing.join(", ")}` },
      { status: 500 }
    );
  }

  const { channelName, userUid, agentUid = 999, childAge = 8 } = await req.json();

  if (!channelName || userUid === undefined) {
    return NextResponse.json(
      { error: "channelName and userUid are required" },
      { status: 400 }
    );
  }

  // Generate agent RTC token
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const agentToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID, APP_CERTIFICATE, channelName, agentUid,
    RtcRole.PUBLISHER, expiry, expiry
  );

  const auth    = Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`).toString("base64");
  const ageBand = childAge <= 7 ? "young child (5-7)" : childAge <= 10 ? "child (8-10)" : "pre-teen (11-13)";

  const body = {
    name: `sparky-${Date.now()}`,
    properties: {
      channel:          channelName,
      token:            agentToken,
      agent_rtc_uid:    String(agentUid),  // Agora requires string UID
      remote_rtc_uids:  ["*"],             // listen to all users in channel
      idle_timeout: 300,
      asr: {
        language: "en-US",
      },
      llm: {
        url:     "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        api_key: GEMINI_API_KEY,
        model:   "gemini-2.0-flash",
        system_prompt: `${SYSTEM_PROMPT}\n\nYou are speaking with a ${ageBand}.`,
        greeting_message: "Hi! I'm Sparky, your speech buddy! Say the phrase on your screen and I'll cheer you on!",
        failure_message:  "Hmm, I didn't quite catch that. Try again — you've got this!",
        max_tokens:  150,
        temperature: 0.7,
      },
      tts: {
        vendor: "microsoft",
        params: {
          key:        AZURE_TTS_KEY,
          region:     AZURE_TTS_REGION,
          voice_name: "en-US-AnaNeural",  // child-friendly voice
          rate:       0,
          pitch:      0,
        },
      },
    },
  };

  try {
    console.log(`Starting Agora agent → POST ${AGORA_BASE_URL}/join  channel:`, channelName);
    const response = await fetch(`${AGORA_BASE_URL}/join`, {
      method:  "POST",
      headers: {
        Authorization:  `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Agora agent start error:", response.status, JSON.stringify(data));
      return NextResponse.json(
        { error: data.message ?? "Failed to start agent" },
        { status: response.status }
      );
    }

    console.log("Agora agent started:", data.agent_id ?? data.name);
    return NextResponse.json({ agentId: data.agent_id ?? data.name });
  } catch (err) {
    console.error("Agent start exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — stop agent
export async function DELETE(req: NextRequest) {
  const CUSTOMER_ID     = process.env.AGORA_CUSTOMER_ID     ?? "";
  const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET ?? "";

  const { agentId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  const auth = Buffer.from(`${CUSTOMER_ID}:${CUSTOMER_SECRET}`).toString("base64");

  try {
    const response = await fetch(`${AGORA_BASE_URL}/leave/${agentId}`, {
      method:  "DELETE",
      headers: {
        Authorization:  `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Agora agent stop error:", data);
      return NextResponse.json(
        { error: data.message ?? "Failed to stop agent" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Agent stop exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
