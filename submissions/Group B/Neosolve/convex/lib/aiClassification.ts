/**
 * AI classification module for call transcripts.
 *
 * Uses OpenRouter to classify a support call transcript into
 * category, priority, summary, and legitimacy. Falls back to the
 * deterministic keyword classifier when no API key is configured.
 */

import type {
  SupportCategory,
  TicketPriority,
  TranscriptMessage,
} from "./constants";
import { SUPPORT_CATEGORIES, TICKET_PRIORITIES } from "./constants";

/** The shape we expect the LLM to return (and normalize). */
export type ClassificationResult = {
  category: SupportCategory;
  priority: TicketPriority;
  summary: string;
  isLegitimate: boolean;
  /** Phone number extracted from the transcript, if the customer provided one verbally. */
  phoneNumber?: string;
};

const SAFE_DEFAULTS: ClassificationResult = {
  category: "general",
  priority: "medium",
  summary: "Customer needs general support follow-up from the Neosolve team.",
  isLegitimate: true,
};

/**
 * Build a classification prompt from transcript messages.
 * The prompt is sent to the LLM as the user message.
 */
export function buildClassificationPrompt(
  transcript: TranscriptMessage[],
): string {
  const lines = transcript.map((m) => `${m.role}: ${m.content}`).join("\n");

  return `You are a support call classifier for Neosolve, a tech/internet service provider.

Analyze the following support call transcript and return a JSON object with these fields:
- "category": one of ${JSON.stringify([...SUPPORT_CATEGORIES])}
- "priority": one of ${JSON.stringify([...TICKET_PRIORITIES])}
- "summary": a 1-2 sentence summary of the customer's issue
- "isLegitimate": boolean, false if this is a prank, test call, or non-support request
- "phoneNumber": if the customer mentions their phone or mobile number during the call, extract it here in E.164 format (e.g. "+639171234567"). If the customer uses a local format like "0917-123-4567" or "zero nine one seven", convert it to "+63" followed by the 10-digit number. If no phone number is mentioned, omit this field or set it to null.

Transcript:
${lines}

Respond ONLY with the JSON object, no markdown fences, no explanation.`;
}

/**
 * Normalize a phone number value into Philippine E.164 format (+63XXXXXXXXXX).
 * Returns the normalized number, or undefined if the input doesn't look valid.
 */
export function normalizePhoneNumber(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;

  // Strip all non-digit characters except leading +
  const cleaned = value.replace(/[^\d+]/g, "");

  // Already in E.164 Philippine format: +639XXXXXXXXX (13 chars)
  if (/^\+639\d{9}$/.test(cleaned)) return cleaned;

  // Local format: 09XXXXXXXXX (11 digits) → convert to +63
  if (/^09\d{9}$/.test(cleaned)) return `+63${cleaned.slice(1)}`;

  // With country code but no +: 639XXXXXXXXX (12 digits)
  if (/^639\d{9}$/.test(cleaned)) return `+${cleaned}`;

  // Not a valid Philippine mobile number
  return undefined;
}

/**
 * Normalize potentially malformed LLM output into safe defaults.
 * Every field is validated and replaced with a default if invalid.
 */
export function normalizeClassificationResult(
  raw: unknown,
): ClassificationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ...SAFE_DEFAULTS };
  }

  const obj = raw as Record<string, unknown>;

  const category = (SUPPORT_CATEGORIES as readonly string[]).includes(
    obj.category as string,
  )
    ? (obj.category as SupportCategory)
    : SAFE_DEFAULTS.category;

  const priority = (TICKET_PRIORITIES as readonly string[]).includes(
    obj.priority as string,
  )
    ? (obj.priority as TicketPriority)
    : SAFE_DEFAULTS.priority;

  const summary =
    typeof obj.summary === "string" && obj.summary.length > 0
      ? obj.summary
      : SAFE_DEFAULTS.summary;

  const isLegitimate =
    typeof obj.isLegitimate === "boolean"
      ? obj.isLegitimate
      : SAFE_DEFAULTS.isLegitimate;

  // Extract and validate phone number (optional field)
  const phoneNumber = normalizePhoneNumber(obj.phoneNumber);

  const result: ClassificationResult = {
    category,
    priority,
    summary,
    isLegitimate,
  };
  if (phoneNumber) {
    result.phoneNumber = phoneNumber;
  }
  return result;
}

/**
 * Call OpenRouter to classify a transcript.
 * Uses the OpenAI-compatible chat completions API.
 * Returns the normalized classification result.
 */
export async function classifyWithLLM(
  transcript: TranscriptMessage[],
  apiKey: string,
): Promise<ClassificationResult> {
  const prompt = buildClassificationPrompt(transcript);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openrouter/hunter-alpha",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `OpenRouter API error ${response.status}: ${text.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string };
    }>;
  };

  const rawText = data.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.warn(
      "OpenRouter returned non-JSON, falling back to defaults:",
      rawText,
    );
    return { ...SAFE_DEFAULTS };
  }

  return normalizeClassificationResult(parsed);
}

/**
 * @deprecated Use classifyWithLLM instead. Kept for backward compatibility.
 */
export const classifyWithGemini = classifyWithLLM;
