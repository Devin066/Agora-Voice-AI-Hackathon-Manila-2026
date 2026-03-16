require("dotenv").config();

const { supabase } = require("./middleware/auth");

const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// ─── Provider config ───────────────────────────────────────────────────────
// TRIAGE_PROVIDER options: "ollama" (local) | "groq" (cloud, free) | "bedrock"
const PROVIDER = process.env.TRIAGE_PROVIDER || "ollama";

const OLLAMA_HOST  = process.env.OLLAMA_HOST  || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const BEDROCK_MODEL_ID = "us.anthropic.claude-sonnet-4-6";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ─── System prompt (shared across providers) ────────────────────────────────
const SYSTEM_PROMPT = `Ikaw ay isang triage assistant para sa pangunahing pangangalagang pangkalusugan sa Pilipinas.

Mga Tuntunin:
- Laging sumagot sa Filipino
- Huwag mag-diagnose, mag-triage lamang
- Huwag banggitin ang anumang pangalan ng sakit
- Kung may alinlangan, palaging i-escalate ang risk level

Ang iyong output ay dapat EKSAKTO sa format na ito at wala nang iba:
RISK: [GREEN/YELLOW/RED]
AKSYON: [isang pangungusap sa Filipino]
TANONG: [follow-up question o WALA]

Kahulugan ng Risk Level:
- GREEN: Maaaring pangalagaan sa bahay
- YELLOW: Bisitahin ang RHU sa loob ng 24 na oras
- RED: Kailangan ng emergency na atensyon ngayon

Palaging RED ang risk level kapag may kahit isa sa mga sumusunod:
- Hindi gumigising, hindi mapaggising, o nawalan ng malay
- May dugo kahit saan sa katawan (ilong, bibig, dumi, ihi, balat)
- Nahihirapan huminga o mabilis na paghinga
- Maputla, malamig, o nanginginig nang labis
- Buntis na may sakit ng tiyan o may dugo
- Mataas na lagnat na may pagkawala ng malay o pagkalito
- Anumang kombinasyon ng lagnat + dugo + hindi kumakain + maputla`;

// ─── Response parser (shared) ────────────────────────────────────────────────
function parseTriageResponse(text) {
  const riskMatch   = text.match(/RISK:\s*(GREEN|YELLOW|RED)/i);
  const aksyonMatch = text.match(/AKSYON:\s*(.+)/i);
  const tanongMatch = text.match(/TANONG:\s*(.+)/i);

  if (!riskMatch || !aksyonMatch || !tanongMatch) {
    throw new Error(`Invalid triage response format.\nRaw output:\n${text}`);
  }

  return {
    risk:   riskMatch[1].toUpperCase(),
    aksyon: aksyonMatch[1].trim(),
    tanong: tanongMatch[1].trim(),
  };
}

// ─── Ollama provider ─────────────────────────────────────────────────────────
async function callOllama(symptoms) {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Sintomas ng pasyente: ${symptoms}` },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const text = data?.message?.content;
  if (!text) throw new Error("Empty response from Ollama.");
  return text;
}

// ─── Groq provider ───────────────────────────────────────────────────────────
async function callGroq(symptoms) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 256,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Sintomas ng pasyente: ${symptoms}` },
      ],
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Groq error: ${res.status} ${msg}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq.");
  return text;
}

// ─── Bedrock provider ─────────────────────────────────────────────────────────
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function callBedrock(symptoms) {
  const command = new InvokeModelCommand({
    modelId:     BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept:      "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Sintomas ng pasyente: ${symptoms}` },
      ],
    }),
  });

  let response;
  try {
    response = await bedrockClient.send(command);
  } catch (err) {
    throw new Error(`Bedrock API error: ${err.message}`);
  }

  const raw  = JSON.parse(Buffer.from(response.body).toString("utf-8"));
  const text = raw?.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Bedrock.");
  return text;
}

// ─── Safety override ──────────────────────────────────────────────────────────
// Hard RED triggers — model output is overridden if any of these match.
// Prevents under-escalation for life-threatening symptoms.
const RED_TRIGGERS = [
  /dugo\s+sa\s+(ilong|bibig|tainga|dumi|ihi|balat|sugat)/i,
  /\bdumudugo\b/i,
  /hindi\s+(na\s+)?(gumigising|nagigising|mulat|mapaggising)/i,
  /nawalan\s+ng\s+malay/i,
  /\bwalang\s+malay\b/i,
  /\bhindi\s+humihinga\b/i,
  /nahihirapan\s+huminga/i,
  /\bkejad\b|\bpagkabigo\b/i,
  /\bkumpulsyon\b|\bpagkakampkamp\b|\bkumukurog\b/i,
  /buntis.*(dugo|sakit\s+ng\s+tiyan)/i,
  /(dugo|sakit\s+ng\s+tiyan).*buntis/i,
  /lagnat.*(3[89]|4[0-9])\s*(degrees?|degree|grado|°)?/i,
  /(3[89]|4[0-9])\s*(degrees?|degree|grado|°)?\s*lagnat/i,
];

function checkRedOverride(symptoms) {
  return RED_TRIGGERS.some((pattern) => pattern.test(symptoms));
}

// ─── Public interface ─────────────────────────────────────────────────────────
/**
 * Triages a patient's symptoms.
 * Provider is controlled by TRIAGE_PROVIDER env var ("ollama" | "groq" | "bedrock").
 *
 * @param {string} symptoms
 * @param {string|null} bhwId
 * @returns {Promise<{ risk: string, aksyon: string, tanong: string, overridden?: boolean }>}
 */
async function triageSymptoms(symptoms, bhwId) {
  if (!symptoms || typeof symptoms !== "string" || symptoms.trim() === "") {
    throw new Error("Symptoms must be a non-empty string.");
  }

  // Sanitize: cap at 1000 chars to prevent prompt injection via length
  const input = symptoms.trim().substring(0, 1000);

  const text = PROVIDER === "bedrock"
    ? await callBedrock(input)
    : PROVIDER === "groq"
    ? await callGroq(input)
    : await callOllama(input);

  const result = parseTriageResponse(text);

  // Safety net: override to RED if hard triggers detected and model under-escalated
  const overridden = result.risk !== "RED" && checkRedOverride(input);
  const finalResult = overridden
    ? {
        ...result,
        risk:       "RED",
        aksyon:     "Magdala ng pasyente sa pinakamalapit na emergency room o ospital kaagad.",
        overridden: true,
      }
    : result;

  // Audit log — non-blocking, errors do not fail the triage response
  supabase.from("triage_events").insert({
    bhw_id:     bhwId || null,
    symptoms:   input,
    risk:       finalResult.risk,
    aksyon:     finalResult.aksyon,
    overridden: finalResult.overridden ?? false,
  }).then(({ error }) => {
    if (error) console.error(`[AUDIT] triage_events insert failed: ${error.message}`);
  });

  return finalResult;
}

module.exports = { triageSymptoms };
