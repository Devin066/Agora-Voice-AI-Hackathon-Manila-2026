import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const BASE_SYSTEM_PROMPT = `You are an AI intake triage assistant for a medical clinic.
Your ONLY job is to help clinic staff prioritize appointment scheduling based on reported symptoms.
You are NOT a doctor. Do NOT provide diagnoses, prescribe treatments, or give medical advice.
The patient may speak in English, Tagalog, or Taglish.

Analyze the reported symptoms and determine how urgently this patient needs an appointment.
Return strict JSON only, in this exact format:
{
  "esi_level": <integer 1-5>,
  "esi_category": "Resuscitation | Emergent | Urgent | Semi-Urgent | Non-Urgent",
  "urgency": "LOW | MEDIUM | HIGH",
  "summary": "A brief, objective description of the reported symptoms for clinic staff — describe what was said, not what you think is wrong",
  "possible_issue": "Broad symptom category only (e.g. 'Respiratory symptoms', 'Gastrointestinal complaint', 'Musculoskeletal discomfort') — never a specific diagnosis",
  "recommendation": "Scheduling action only — e.g. 'Book the next available urgent slot today', 'Schedule appointment within 24–48 hours', 'Routine appointment within the week is appropriate'",
  "confidence": <integer 0-100 reflecting how clearly the urgency level can be determined>,
  "missing_info_questions": ["question 1", "question 2"]
}
Rules:
- HIGH: Patient may need to be seen within hours. Recommend an urgent same-day booking or direct the patient to emergency services if no slot is available.
- MEDIUM: Patient should be seen today or within 24–48 hours. Recommend a priority booking.
- LOW: Routine scheduling within the week is appropriate.
- ESI 1 (Resuscitation): immediate life-saving intervention likely needed.
- ESI 2 (Emergent): high-risk condition, severe pain/distress, or danger signs; rapid evaluation needed.
- ESI 3 (Urgent): stable but likely needing multiple resources; evaluate soon.
- ESI 4 (Semi-Urgent): stable, likely one resource.
- ESI 5 (Non-Urgent): stable, low acuity, likely no resources.
- Align urgency with ESI: ESI 1-2 => HIGH, ESI 3 => MEDIUM, ESI 4-5 => LOW.
- summary: neutral, objective. Describe reported symptoms only.
- possible_issue: symptom category only — never a diagnosed condition like "appendicitis" or "GERD".
- recommendation: clinic workflow only — scheduling, walk-in, or ER referral. Never suggest medications, tests, or treatments.
- confidence: 90+ if pattern is very clear, 60–89 if partially clear, below 60 if vague or insufficient.
- missing_info_questions: max 2 questions to clarify urgency; empty array [] if information is already sufficient.
- missing_info_questions: write questions in the same language used by the patient (English or Tagalog).
- NEVER act as a physician. A licensed doctor will evaluate the patient.`;

const ESI_CATEGORY_BY_LEVEL = {
  1: "Resuscitation",
  2: "Emergent",
  3: "Urgent",
  4: "Semi-Urgent",
  5: "Non-Urgent",
};

const ESI_LEVEL_BY_CATEGORY = Object.entries(ESI_CATEGORY_BY_LEVEL).reduce((acc, [level, category]) => {
  acc[category.toLowerCase()] = Number(level);
  return acc;
}, {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const referencesDir = path.resolve(__dirname, "../frontend/references");

function safeReadJson(fileName, fallbackValue) {
  try {
    const raw = fs.readFileSync(path.join(referencesDir, fileName), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

const symptomReference = safeReadJson("Symptoms.json", []);
const diseaseEsiReference = safeReadJson("DiseasesESI.json", []);

const SYMPTOM_SIGNAL_MAP = [
  { label: "Chest pain", terms: ["chest pain", "masakit dibdib", "pananakit ng dibdib", "dibdib"] },
  {
    label: "Shortness of breath",
    terms: [
      "shortness of breath",
      "difficulty breathing",
      "nahihirapan huminga",
      "nahihirapan akong huminga",
      "hingal",
      "hirap huminga",
    ],
  },
  { label: "Severe bleeding", terms: ["severe bleeding", "heavy bleeding", "malakas na pagdurugo", "dumudugo"] },
  { label: "One-sided weakness", terms: ["one sided weakness", "left side weak", "right side weak", "nanghihina"] },
  { label: "Facial droop", terms: ["face droop", "facial droop", "tabingi ang mukha", "nakalaylay ang mukha"] },
  { label: "Slurred speech", terms: ["slurred speech", "hirap magsalita", "garalgal magsalita"] },
  { label: "Fever", terms: ["fever", "lagnat"] },
  { label: "Headache", terms: ["headache", "sakit ng ulo"] },
  { label: "Cough", terms: ["cough", "ubo"] },
  { label: "Sore throat", terms: ["sore throat", "masakit lalamunan", "makating lalamunan"] },
  { label: "Dizziness", terms: ["dizziness", "nahihilo", "pagkahilo"] },
  { label: "Vomiting", terms: ["vomiting", "vomit", "suka", "nagsusuka"] },
  { label: "Diarrhea", terms: ["diarrhea", "pagtatae", "malabnaw na dumi"] },
  {
    label: "Nose bleeding",
    terms: ["nosebleed", "nose bleed", "bleeding nose", "dugo sa ilong", "pagdurugo sa ilong", "dumudugo ilong"],
  },
];

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function extractMatchedSymptoms(symptoms) {
  const text = symptoms.toLowerCase();
  const matched = [];

  for (const signal of SYMPTOM_SIGNAL_MAP) {
    if (includesAny(text, signal.terms)) {
      matched.push(signal.label);
    }
  }

  return [...new Set(matched)];
}

function normalizeSignal(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function countReferenceMatches(input, candidates) {
  const normalizedInput = normalizeSignal(input);
  return (Array.isArray(candidates) ? candidates : []).reduce((count, candidate) => {
    const token = normalizeSignal(candidate);
    if (!token) return count;
    return normalizedInput.includes(token) ? count + 1 : count;
  }, 0);
}

function getRelevantDiseaseReference(symptoms) {
  const ranked = diseaseEsiReference
    .map((item) => ({
      ...item,
      matchCount: countReferenceMatches(symptoms, item.symptoms),
    }))
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 10);
  return ranked;
}

function buildReferencePrompt(symptoms) {
  const relevantDiseases = getRelevantDiseaseReference(symptoms);
  const symptomsPreview = symptomReference.slice(0, 120);

  const diseaseBlock =
    relevantDiseases.length > 0
      ? relevantDiseases
          .map(
            (item) =>
              `- ${item.disease} | ESI ${item.esi_level} (${item.esi_category}) | red flags: ${
                item.red_flag_symptoms.join(", ") || "none listed"
              } | matched symptoms: ${item.matchCount}`
          )
          .join("\n")
      : "- No direct disease match found in local reference.";

  return `\nUse the following local structured triage reference as guidance (not diagnosis):\nKnown symptom lexicon sample (${symptomsPreview.length} items): ${symptomsPreview.join(
    ", "
  )}\nRelevant disease-ESI reference entries:\n${diseaseBlock}\nPrioritize ESI level using these references when symptoms overlap.`;
}

function buildSystemPrompt(symptoms) {
  return `${BASE_SYSTEM_PROMPT}${buildReferencePrompt(symptoms)}`;
}

function detectEmergencyRedFlags(symptoms) {
  const text = symptoms.toLowerCase();

  const hasChestPain = includesAny(text, ["chest pain", "masakit dibdib", "pananakit ng dibdib", "dibdib"]);
  const hasBreathingIssue = includesAny(text, [
    "shortness of breath",
    "difficulty breathing",
    "nahihirapan huminga",
    "nahihirapan akong huminga",
    "hirap huminga",
    "hingal",
  ]);

  if (hasChestPain && hasBreathingIssue) {
    return {
      esi_level: 1,
      esi_category: "Resuscitation",
      urgency: "HIGH",
      summary: "Patient reports chest pain combined with breathing difficulty.",
      possible_issue: "Cardiopulmonary symptoms",
      recommendation: "Direct patient to the nearest emergency room immediately — do not wait for a routine appointment.",
      urgency_reasons: ["Chest pain", "Shortness of breath"],
      safety_override: true,
      safety_message: "Please go to the nearest emergency room or call emergency services immediately.",
      confidence: 99,
      missing_info_questions: [],
    };
  }

  const hasSevereBleeding = includesAny(text, [
    "severe bleeding",
    "heavy bleeding",
    "malakas na pagdurugo",
    "dumudugo nang marami",
  ]);

  if (hasSevereBleeding) {
    return {
      esi_level: 1,
      esi_category: "Resuscitation",
      urgency: "HIGH",
      summary: "Patient reports severe or heavy bleeding.",
      possible_issue: "Bleeding symptoms",
      recommendation: "Direct patient to the nearest emergency room immediately.",
      urgency_reasons: ["Severe bleeding"],
      safety_override: true,
      safety_message: "Please go to the nearest emergency room or call emergency services immediately.",
      confidence: 99,
      missing_info_questions: [],
    };
  }

  const hasStrokeKeyword = includesAny(text, ["stroke", "na-stroke", "signs of stroke"]);
  const hasFaceDroop = includesAny(text, ["face droop", "facial droop", "tabingi ang mukha", "nakalaylay ang mukha"]);
  const hasSpeechIssue = includesAny(text, ["slurred speech", "hirap magsalita", "garalgal magsalita"]);
  const hasOneSidedWeakness = includesAny(text, ["one sided weakness", "left side weak", "right side weak", "nanghihina"]);

  if (hasStrokeKeyword || (hasFaceDroop && (hasSpeechIssue || hasOneSidedWeakness))) {
    const reasons = ["Stroke warning signs"];
    if (hasFaceDroop) reasons.push("Facial droop");
    if (hasSpeechIssue) reasons.push("Slurred speech");
    if (hasOneSidedWeakness) reasons.push("One-sided weakness");

    return {
      esi_level: 1,
      esi_category: "Resuscitation",
      urgency: "HIGH",
      summary: "Patient reports possible stroke warning signs.",
      possible_issue: "Neurological symptoms",
      recommendation: "Direct patient to the nearest emergency room immediately — do not wait.",
      urgency_reasons: reasons,
      safety_override: true,
      safety_message: "Please go to the nearest emergency room or call emergency services immediately.",
      confidence: 99,
      missing_info_questions: [],
    };
  }

  const hasSnakeOrAnimalBite = includesAny(text, [
    "anaconda",
    "snake bite",
    "snakebite",
    "bitten by snake",
    "bitten by anaconda",
    "ahas",
    "kagat ng ahas",
    "nakagat ng ahas",
    "animal bite",
    "bitten by dog",
    "dog bite",
    "kagat ng aso",
    "nakagat ng aso",
    "venomous bite",
    "venom",
  ]);

  if (hasSnakeOrAnimalBite) {
    return {
      esi_level: 2,
      esi_category: "Emergent",
      urgency: "HIGH",
      summary: "Patient reports a possible snake or animal bite exposure.",
      possible_issue: "Bite or envenomation risk",
      recommendation: "Arrange urgent same-day emergency evaluation immediately, especially for possible venomous bites.",
      urgency_reasons: ["Possible snake/animal bite exposure"],
      safety_override: true,
      safety_message: "Please go to the nearest emergency room immediately for bite assessment.",
      confidence: 99,
      missing_info_questions: [],
    };
  }

  const hasHighRiskInfectiousKeyword = includesAny(text, [
    "ebola",
    "ebola virus",
    "hemorrhagic fever",
    "viral hemorrhagic fever",
    "marburg",
    "marburg virus",
  ]);

  if (hasHighRiskInfectiousKeyword) {
    return {
      esi_level: 2,
      esi_category: "Emergent",
      urgency: "HIGH",
      summary: "Patient reports a high-risk infectious disease concern.",
      possible_issue: "High-risk infectious symptoms",
      recommendation: "Arrange urgent same-day medical evaluation with isolation precautions; escalate to emergency services if severe symptoms are present.",
      urgency_reasons: ["High-risk infectious disease concern"],
      safety_override: true,
      safety_message: "Please seek urgent in-person medical evaluation immediately and avoid close contact with others.",
      confidence: 98,
      missing_info_questions: [],
    };
  }

  return null;
}

function buildUrgencyReasons(symptoms, urgency) {
  const matchedSymptoms = extractMatchedSymptoms(symptoms);

  if (matchedSymptoms.length > 0) {
    return matchedSymptoms.slice(0, 4);
  }

  if (urgency === "HIGH") {
    return ["Severe symptom pattern reported", "Urgent appointment recommended"];
  }
  if (urgency === "MEDIUM") {
    return ["Moderate symptom pattern reported", "Priority appointment recommended"];
  }
  return ["Mild symptom pattern reported", "Routine appointment is appropriate"];
}

function cleanJsonResponse(rawText) {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("{")) return trimmed;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function getUrgencyFromEsi(esiLevel) {
  if (esiLevel <= 2) return "HIGH";
  if (esiLevel === 3) return "MEDIUM";
  return "LOW";
}

function deriveEsiFromUrgency(urgency) {
  if (urgency === "HIGH") return 2;
  if (urgency === "MEDIUM") return 3;
  return 4;
}

function normalizeResult(result = {}) {
  const rawEsiLevel = Number(result.esi_level);
  const esiCategoryText = String(result.esi_category || "").trim().toLowerCase();
  const levelFromCategory = ESI_LEVEL_BY_CATEGORY[esiCategoryText];
  const esiLevel =
    !isNaN(rawEsiLevel) && rawEsiLevel >= 1 && rawEsiLevel <= 5
      ? Math.round(rawEsiLevel)
      : levelFromCategory || null;

  const urgencyInput = ["LOW", "MEDIUM", "HIGH"].includes(String(result.urgency).toUpperCase())
    ? String(result.urgency).toUpperCase()
    : null;
  const urgency = urgencyInput || getUrgencyFromEsi(esiLevel || 4);
  const finalEsiLevel = esiLevel || deriveEsiFromUrgency(urgency);
  const finalEsiCategory = ESI_CATEGORY_BY_LEVEL[finalEsiLevel];

  const rawConfidence = Number(result.confidence);
  const confidence =
    !isNaN(rawConfidence) && rawConfidence >= 0 && rawConfidence <= 100 ? Math.round(rawConfidence) : 60;

  return {
    esi_level: finalEsiLevel,
    esi_category: finalEsiCategory,
    urgency,
    summary: result.summary || "No summary provided.",
    possible_issue: result.possible_issue || "Symptom area to be determined by the attending physician.",
    recommendation: result.recommendation || "Schedule an appointment and monitor symptoms until seen.",
    urgency_reasons: Array.isArray(result.urgency_reasons)
      ? result.urgency_reasons.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [],
    safety_override: Boolean(result.safety_override),
    safety_message: result.safety_message || "",
    confidence,
    missing_info_questions: Array.isArray(result.missing_info_questions)
      ? result.missing_info_questions
          .filter((q) => typeof q === "string" && q.trim().length > 0)
          .slice(0, 2)
      : [],
  };
}

function mockTriage(symptoms) {
  const text = symptoms.toLowerCase();
  const matchedSymptoms = extractMatchedSymptoms(symptoms);
  const hasSeverePain = includesAny(text, [
    "severe pain",
    "matinding sakit",
    "worst headache",
    "sobrang sakit",
    "unbearable pain",
  ]);
  const hasHighFever = includesAny(text, ["39", "40", "high fever", "mataas na lagnat", "nilalagnat nang mataas"]);
  const hasPersistentVomiting = includesAny(text, ["persistent vomiting", "paulit ulit na suka", "hindi mapigilan ang suka"]);
  const hasFainting = includesAny(text, ["fainted", "nahimatay", "passed out", "hinimatay"]);
  const hasMediumSignals = includesAny(text, [
    "fever",
    "lagnat",
    "cough",
    "ubo",
    "headache",
    "sakit ng ulo",
    "vomit",
    "suka",
    "diarrhea",
    "pagtatae",
    "dizziness",
    "nahihilo",
    "pagkahilo",
    "sore throat",
    "masakit lalamunan",
    "sipon",
    "trangkaso",
  ]);
  const hasDurationSignals = includesAny(text, ["for 3 days", "for 4 days", "for a week", "ilang araw", "isang linggo", "tatlong araw", "apat na araw"]);
  const hasPediatricOrElderlyRisk = includesAny(text, ["baby", "infant", "elderly", "senior", "matanda"]);
  const symptomCount = matchedSymptoms.length;

  const likelyIssue = includesAny(text, [
    "nosebleed",
    "nose bleed",
    "bleeding nose",
    "dugo sa ilong",
    "pagdurugo sa ilong",
    "dumudugo ilong",
    "bleeding",
    "pagdurugo",
    "dumudugo",
  ])
    ? "Bleeding symptoms"
    : includesAny(text, ["cough", "ubo", "sore throat", "lagnat", "fever"])
    ? "Respiratory or infectious symptoms"
    : includesAny(text, ["vomit", "suka", "diarrhea", "pagtatae", "stomach", "tiyan"])
    ? "Gastrointestinal symptoms"
    : includesAny(text, ["headache", "sakit ng ulo", "nahihilo", "dizziness"])
    ? "Neurological symptoms"
    : includesAny(text, ["joint pain", "back pain", "muscle pain", "kalamnan", "likod"])
    ? "Musculoskeletal discomfort"
    : "General symptom report";

  if (hasSeverePain || hasHighFever || hasPersistentVomiting || hasFainting || (hasPediatricOrElderlyRisk && hasMediumSignals)) {
    return {
      urgency: "HIGH",
      summary:
        symptomCount > 0
          ? `Patient reports severe or high-risk symptoms including ${matchedSymptoms.slice(0, 3).join(", ")}.`
          : "Patient reports severe or high-risk symptoms requiring urgent in-clinic review.",
      possible_issue: likelyIssue,
      recommendation: "Book the next available urgent slot today. If symptoms worsen, direct patient to emergency services.",
      confidence: symptomCount > 0 ? 84 : 76,
      missing_info_questions: [
        "Kailan eksaktong nagsimula ang matinding sintomas na ito?",
        "Lumalala ba ngayon ang sintomas mo?",
      ],
    };
  }

  if (hasMediumSignals || hasDurationSignals || symptomCount >= 2) {
    return {
      urgency: "MEDIUM",
      summary:
        symptomCount > 0
          ? `Patient reports moderate symptoms including ${matchedSymptoms.slice(0, 3).join(", ")}.`
          : "Patient reports moderate ongoing symptoms that need priority scheduling.",
      possible_issue: likelyIssue,
      recommendation: "Schedule a priority appointment within 24–48 hours.",
      confidence: symptomCount >= 2 ? 76 : 68,
      missing_info_questions: [
        "Ilang araw mo nang nararanasan ang mga sintomas na ito?",
        "May kasama bang hirap sa paghinga o matinding sakit?",
      ],
    };
  }

  return {
    urgency: "LOW",
    summary:
      symptomCount > 0
        ? `Patient reports mild symptoms including ${matchedSymptoms.slice(0, 2).join(", ")}.`
        : "Patient reports mild non-specific symptoms.",
    possible_issue: likelyIssue,
    recommendation: "Routine appointment within the week is appropriate.",
    confidence: symptomCount > 0 ? 74 : 60,
    missing_info_questions: [
      "Kailan mo unang napansin ang sintomas?",
      "Mas gumagaan ba, pareho lang, o lumalala ang pakiramdam mo?",
    ],
  };
}

async function callGroq(apiKey, model, symptoms, systemPrompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient symptoms: ${symptoms}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Groq error: ${errorText}`);
    error.status = response.status;
    error.provider = "groq";
    error.raw = errorText;
    const retryAfterHeader = Number(response.headers.get("retry-after"));
    if (!isNaN(retryAfterHeader) && retryAfterHeader > 0) {
      error.retry_after_seconds = retryAfterHeader;
    }
    throw error;
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "{}";
}

async function callOpenRouter(apiKey, model, symptoms, systemPrompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient symptoms: ${symptoms}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "{}";
}

async function callTogether(apiKey, model, symptoms, systemPrompt) {
  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Patient symptoms: ${symptoms}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Together error: ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "{}";
}

async function runLlmAnalysis(symptoms) {
  const provider = (process.env.LLM_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "llama-3.1-8b-instant";
  const systemPrompt = buildSystemPrompt(symptoms);

  if (provider === "mock") {
    return { result: mockTriage(symptoms), provider: "mock", model };
  }

  if (!apiKey) {
    throw new Error(`LLM_API_KEY is required when LLM_PROVIDER is '${provider}'.`);
  }

  let rawOutput = "{}";

  try {
    if (provider === "groq") {
      rawOutput = await callGroq(apiKey, model, symptoms, systemPrompt);
    } else if (provider === "openrouter") {
      rawOutput = await callOpenRouter(apiKey, model, symptoms, systemPrompt);
    } else if (provider === "together") {
      rawOutput = await callTogether(apiKey, model, symptoms, systemPrompt);
    } else {
      throw new Error("Unsupported LLM provider. Use mock, groq, openrouter, or together.");
    }
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const isRateLimit =
      Number(error?.status) === 429 ||
      message.includes("rate limit") ||
      message.includes("rate_limit_exceeded");

    if (provider === "groq" && isRateLimit) {
      return { result: mockTriage(symptoms), provider: "mock", model: "rate_limit_fallback" };
    }

    throw error;
  }

  const cleaned = cleanJsonResponse(rawOutput);
  const parsed = JSON.parse(cleaned);
  return { result: normalizeResult(parsed), provider, model };
}

export async function analyzeSymptomsController(req, res) {
  try {
    const { symptoms, context } = req.body || {};

    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({ error: "symptoms (string) is required" });
    }

    // If a follow-up answer (context) is provided, combine with original symptoms for richer analysis.
    const combinedInput = context
      ? `${symptoms}. Follow-up answer from patient: ${context}`
      : symptoms;

    const emergencyResult = detectEmergencyRedFlags(combinedInput);
    const llmResult = emergencyResult ? null : await runLlmAnalysis(combinedInput);
    const rawResult = emergencyResult || llmResult.result;
    const normalized = normalizeResult(rawResult);
    normalized.analysis_source = emergencyResult ? "rule_based_emergency" : "llm";
    normalized.llm_provider = emergencyResult ? null : llmResult.provider;
    normalized.llm_model = emergencyResult ? null : llmResult.model;

    if (!normalized.urgency_reasons.length) {
      normalized.urgency_reasons = buildUrgencyReasons(combinedInput, normalized.urgency);
    }

    // After a follow-up round, confidence should improve; no further questions needed.
    if (context) {
      normalized.missing_info_questions = [];
    } else if (normalized.safety_override) {
      normalized.missing_info_questions = [];
    }

    return res.json(normalized);
  } catch (error) {
    console.error("Triage analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze symptoms" });
  }
}
