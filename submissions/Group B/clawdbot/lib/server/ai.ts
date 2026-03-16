import "server-only";

import { getStore } from "@/lib/server/store";
import type { ChatMessage } from "@/lib/types";

async function tryGemini(messages: ChatMessage[], systemHint: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const prompt = [
    { role: "system", content: systemHint },
    ...messages,
  ]
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  // Keep this as a best-effort integration. The app still works without it.
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!res.ok) return null;
  const json = (await res.json()) as unknown;
  const candidates = (json as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates;
  const text = candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) return null;
  return text.trim();
}

export async function answerWithSchoolContext(params: {
  schoolId: string;
  messages: ChatMessage[];
}) {
  const store = getStore();
  const school = store.schools.get(params.schoolId);
  const docTypes = [...store.documentTypes.values()].filter(
    (d) => d.schoolId === params.schoolId,
  );

  const systemHint = [
    `You are Clawdbot, a school document assistant.`,
    `Tenant school: ${school?.name ?? params.schoolId}.`,
    `Available document types: ${docTypes.map((d) => d.name).join(", ") || "(none)"}.`,
    `If asked about a request workflow, suggest: pending -> processing -> ready.`,
    `If unsure, ask a brief clarifying question.`,
  ].join("\n");

  const gemini = await tryGemini(params.messages, systemHint);
  if (gemini) return gemini;

  const last = params.messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const normalized = last.toLowerCase();
  if (normalized.includes("document") || normalized.includes("request")) {
    return `For ${school?.name ?? "this school"}, you can request: ${docTypes
      .map((d) => d.name)
      .join(", ")}. Tell me which one you need, and your preferred pickup/delivery option.`;
  }
  if (normalized.includes("status")) {
    return `Request statuses are: pending, processing, ready. If you share your request ID, I can help you interpret what it means.`;
  }
  return `Tell me what you want to do (request a document, check status, or upload requirements), and I’ll guide you.`;
}
