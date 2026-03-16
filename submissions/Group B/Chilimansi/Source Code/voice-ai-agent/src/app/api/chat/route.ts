import { NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? "";
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY ?? "";
const ELEVENLABS_VOICE = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

const SYSTEM_PROMPT =
  "You are First Aid Bot, an emergency medical voice assistant. You provide calm, clear first aid instructions to help responders assist patients in distress. Focus on the patient's condition and guide the responder step by step. Be concise and reassuring. Keep responses under 3 sentences. If the situation is life-threatening, always remind them to call 911 or 143 (Philippine Red Cross).";

type Message = { role: string; content: string };
type ChatPayload = { message: string; history?: Message[] };

export async function POST(request: Request) {
  const { message, history = [] }: ChatPayload = await request.json();

  // 1. Get Gemini response
  const geminiRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 200,
      }),
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error("Gemini error:", err);
    return NextResponse.json({ ok: false, error: "LLM failed" }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const reply = geminiData.choices?.[0]?.message?.content ?? "I'm having trouble responding.";

  // 2. Get ElevenLabs TTS audio
  const ttsRes = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_KEY,
      },
      body: JSON.stringify({
        text: reply,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    console.error("ElevenLabs error:", err);
    // Return text only if TTS fails
    return NextResponse.json({ ok: true, reply, audio: null });
  }

  const audioBuffer = await ttsRes.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");

  return NextResponse.json({ ok: true, reply, audio: audioBase64 });
}
