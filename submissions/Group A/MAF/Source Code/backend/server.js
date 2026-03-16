import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeSymptomsController } from "./triageController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const llmProvider = String(process.env.LLM_PROVIDER || "").toLowerCase();
const providerDefaultLlmUrl =
	llmProvider === "groq"
		? "https://api.groq.com/openai/v1/chat/completions"
		: llmProvider === "openrouter"
			? "https://openrouter.ai/api/v1/chat/completions"
			: llmProvider === "together"
				? "https://api.together.xyz/v1/chat/completions"
				: llmProvider === "grok" || llmProvider === "xai"
					? "https://api.x.ai/v1/chat/completions"
					: "https://api.openai.com/v1/chat/completions";
const agoraAppId = process.env.AGORA_APP_ID;
const agoraCustomerId = process.env.AGORA_CUSTOMER_ID;
const agoraCustomerSecret = process.env.AGORA_CUSTOMER_SECRET;
const caeEnabled =
	String(process.env.AGORA_CAE_ENABLED || "false").toLowerCase() === "true";
const caeLlmUrl = process.env.AGORA_CAE_LLM_URL || providerDefaultLlmUrl;
const caeLlmApiKey =
	process.env.AGORA_CAE_LLM_API_KEY || process.env.LLM_API_KEY || "";
const caeLlmModel =
	process.env.AGORA_CAE_LLM_MODEL || process.env.LLM_MODEL || "gpt-4o-mini";
const caeSystemMessage =
	process.env.AGORA_CAE_SYSTEM_MESSAGE ||
	"You are a helpful medical intake voice assistant.";
const caeGreetingMessage =
	process.env.AGORA_CAE_GREETING_MESSAGE || "Hello, how can I help you today?";
const caeFailureMessage =
	process.env.AGORA_CAE_FAILURE_MESSAGE ||
	"Sorry, I am having trouble understanding. Please try again.";
const caeAsrLanguage = process.env.AGORA_CAE_ASR_LANGUAGE || "en-US";
const caeIdleTimeout = Number(process.env.AGORA_CAE_IDLE_TIMEOUT || 120);
const caeAgentRtcUid = process.env.AGORA_CAE_AGENT_RTC_UID || "0";
const caeTtsVendor = process.env.AGORA_CAE_TTS_VENDOR || "microsoft";
const caeTtsParamsJson = process.env.AGORA_CAE_TTS_PARAMS_JSON || "{}";
const caeRequestTimeoutMs = Number(
	process.env.AGORA_CAE_REQUEST_TIMEOUT_MS || 12000,
);
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const azureSpeechApiKey = process.env.AZURE_SPEECH_API_KEY || "";
const azureSpeechRegion = process.env.AZURE_SPEECH_REGION || "";
const azureSpeechEndpoint = process.env.AZURE_SPEECH_ENDPOINT || "";
const azureSpeechVoiceName =
	process.env.AZURE_SPEECH_VOICE_NAME || "en-US-AvaMultilingualNeural";
const azureSpeechDefaultLocale =
	process.env.AZURE_SPEECH_DEFAULT_LOCALE || "en-US";

app.use(cors());
app.use(express.json());

function hasCaeCoreConfig() {
	return getCaeConfigIssues().length === 0;
}

function getCaeConfigIssues() {
	const issues = [];
	const ttsVendor = String(caeTtsVendor || "").toLowerCase();

	if (!caeEnabled) issues.push("AGORA_CAE_ENABLED must be true");
	if (!agoraAppId) issues.push("AGORA_APP_ID is missing");
	if (!agoraCustomerId) issues.push("AGORA_CUSTOMER_ID is missing");
	if (!agoraCustomerSecret) issues.push("AGORA_CUSTOMER_SECRET is missing");
	if (!caeLlmUrl)
		issues.push("AGORA_CAE_LLM_URL or provider default URL is missing");
	if (!caeLlmApiKey)
		issues.push("AGORA_CAE_LLM_API_KEY or LLM_API_KEY is missing");
	if (!caeTtsVendor) issues.push("AGORA_CAE_TTS_VENDOR is missing");
	if (!caeTtsParamsJson) issues.push("AGORA_CAE_TTS_PARAMS_JSON is missing");

	const ttsParams = parseTtsParams();
	if (ttsVendor === "microsoft") {
		if (!ttsParams.key) issues.push("AGORA_CAE_TTS_PARAMS_JSON.key is missing");
		if (!ttsParams.region)
			issues.push("AGORA_CAE_TTS_PARAMS_JSON.region is missing");
		if (!ttsParams.voice_name)
			issues.push("AGORA_CAE_TTS_PARAMS_JSON.voice_name is missing");
	} else if (ttsVendor === "elevenlabs") {
		if (!ttsParams.api_key)
			issues.push("AGORA_CAE_TTS_PARAMS_JSON.api_key is missing");
		if (!ttsParams.voice_id)
			issues.push("AGORA_CAE_TTS_PARAMS_JSON.voice_id is missing");
		if (!ttsParams.model_id)
			issues.push("AGORA_CAE_TTS_PARAMS_JSON.model_id is missing");
	} else if (ttsVendor === "gemini" || ttsVendor === "google") {
		if (!(ttsParams.api_key || geminiApiKey)) {
			issues.push(
				"AGORA_CAE_TTS_PARAMS_JSON.api_key or GEMINI_API_KEY is missing",
			);
		}
	}

	return issues;
}

function getAgoraAuthHeader() {
	const encoded = Buffer.from(
		`${agoraCustomerId}:${agoraCustomerSecret}`,
	).toString("base64");
	return `Basic ${encoded}`;
}

function parseTtsParams() {
	try {
		const parsed = JSON.parse(caeTtsParamsJson);
		return typeof parsed === "object" && parsed !== null ? parsed : {};
	} catch {
		return {};
	}
}

function hasRequiredTtsConfig(ttsParams) {
	const ttsVendor = String(caeTtsVendor || "").toLowerCase();
	if (ttsVendor === "microsoft")
		return Boolean(ttsParams.key && ttsParams.region && ttsParams.voice_name);
	if (ttsVendor === "elevenlabs")
		return Boolean(
			ttsParams.api_key && ttsParams.voice_id && ttsParams.model_id,
		);
	if (ttsVendor === "gemini" || ttsVendor === "google")
		return Boolean(ttsParams.api_key || geminiApiKey);
	return true;
}

function buildTtsPayload(ttsParams) {
	const ttsVendor = String(caeTtsVendor || "").toLowerCase();
	if (ttsVendor === "gemini" || ttsVendor === "google") {
		return {
			vendor: "google",
			params: {
				api_key: ttsParams.api_key || geminiApiKey,
				model: ttsParams.model || "gemini-2.5-flash-preview-tts",
				voice_name: ttsParams.voice_name || "Kore",
				language_code: ttsParams.language_code || "fil-PH",
			},
		};
	}
	return { vendor: caeTtsVendor, params: ttsParams };
}

function getAzureTtsEndpoint() {
	if (azureSpeechEndpoint) {
		const normalizedEndpoint = azureSpeechEndpoint.trim().replace(/\/+$/, "");
		if (normalizedEndpoint.includes(".api.cognitive.microsoft.com")) {
			const convertedEndpoint = normalizedEndpoint.replace(
				".api.cognitive.microsoft.com",
				".tts.speech.microsoft.com",
			);
			return `${convertedEndpoint}/cognitiveservices/v1`;
		}
		if (normalizedEndpoint.endsWith("/cognitiveservices/v1")) {
			return normalizedEndpoint;
		}
		return `${normalizedEndpoint}/cognitiveservices/v1`;
	}
	if (!azureSpeechRegion) return "";
	return `https://${azureSpeechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

function buildSsml(text, voiceName, locale) {
	const safeText = String(text || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
	const safeLocale = String(locale || azureSpeechDefaultLocale || "en-US");
	return `<speak version="1.0" xml:lang="${safeLocale}"><voice name="${voiceName}">${safeText}</voice></speak>`;
}

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.get("/conversationalAgent/status", (_req, res) => {
	const issues = getCaeConfigIssues();
	res.json({ enabled: issues.length === 0, issues });
});

app.post("/conversationalAgent/start", async (req, res) => {
	try {
		if (!hasCaeCoreConfig()) {
			return res.json({
				enabled: false,
				error: "Conversational AI Engine is not configured.",
				issues: getCaeConfigIssues(),
			});
		}

		const { channel, token, remoteRtcUid } = req.body || {};
		if (!channel || !remoteRtcUid) {
			return res
				.status(400)
				.json({ error: "channel and remoteRtcUid are required" });
		}
		if (!token) {
			return res
				.status(400)
				.json({ error: "token is required for Conversational AI agent start" });
		}
		const ttsParams = parseTtsParams();
		if (!hasRequiredTtsConfig(ttsParams)) {
			return res.status(400).json({
				error:
					"Missing TTS config. For microsoft set key/region/voice_name. For elevenlabs set api_key/voice_id/model_id. For gemini/google set api_key (or GEMINI_API_KEY).",
			});
		}
		const ttsPayload = buildTtsPayload(ttsParams);

		const joinUrl = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/join`;
		const payload = {
			name: `triage-agent-${Date.now()}`,
			properties: {
				channel,
				token: token || null,
				agent_rtc_uid: String(caeAgentRtcUid),
				remote_rtc_uids: [String(remoteRtcUid)],
				enable_string_uid: true,
				idle_timeout: caeIdleTimeout,
				llm: {
					url: caeLlmUrl,
					api_key: caeLlmApiKey,
					system_messages: [{ role: "system", content: caeSystemMessage }],
					greeting_message: caeGreetingMessage,
					failure_message: caeFailureMessage,
					params: { model: caeLlmModel },
				},
				asr: { language: caeAsrLanguage },
				tts: {
					vendor: ttsPayload.vendor,
					params: ttsPayload.params,
				},
			},
		};

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), caeRequestTimeoutMs);

		let response;
		try {
			response = await fetch(joinUrl, {
				method: "POST",
				headers: {
					Authorization: getAgoraAuthHeader(),
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeout);
		}

		const data = await response.json();
		if (!response.ok) {
			return res.status(response.status).json({
				error:
					data?.message ||
					data?.error ||
					"Failed to start Conversational AI agent.",
				details: data,
			});
		}

		return res.json({ enabled: true, ...data });
	} catch (error) {
		if (error?.name === "AbortError") {
			return res
				.status(504)
				.json({ error: "Conversational AI start timed out. Please retry." });
		}
		return res
			.status(500)
			.json({ error: "Failed to start Conversational AI agent." });
	}
});

app.post("/conversationalAgent/stop", async (req, res) => {
	try {
		if (!hasCaeCoreConfig()) {
			return res.json({
				enabled: false,
				error: "Conversational AI Engine is not configured.",
				issues: getCaeConfigIssues(),
			});
		}

		const { agentId } = req.body || {};
		if (!agentId) {
			return res.status(400).json({ error: "agentId is required" });
		}

		const leaveUrl = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${agoraAppId}/agents/${agentId}/leave`;
		const response = await fetch(leaveUrl, {
			method: "POST",
			headers: {
				Authorization: getAgoraAuthHeader(),
				"Content-Type": "application/json",
			},
		});
		const data = await response.json();
		if (!response.ok) {
			return res.status(response.status).json({
				error:
					data?.message ||
					data?.error ||
					"Failed to stop Conversational AI agent.",
				details: data,
			});
		}

		return res.json({ enabled: true, ...data });
	} catch (error) {
		return res
			.status(500)
			.json({ error: "Failed to stop Conversational AI agent." });
	}
});

app.post("/speech/synthesize", async (req, res) => {
	try {
		const { text, voiceName, locale } = req.body || {};
		if (!String(text || "").trim()) {
			return res.status(400).json({ error: "text is required" });
		}
		if (!azureSpeechApiKey) {
			return res
				.status(500)
				.json({ error: "AZURE_SPEECH_API_KEY is not configured" });
		}

		const endpoint = getAzureTtsEndpoint();
		if (!endpoint) {
			return res
				.status(500)
				.json({
					error:
						"Set AZURE_SPEECH_REGION or AZURE_SPEECH_ENDPOINT for Azure Speech TTS",
				});
		}

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Ocp-Apim-Subscription-Key": azureSpeechApiKey,
				"Content-Type": "application/ssml+xml",
				"X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
				"User-Agent": "agora-voice-triage",
			},
			body: buildSsml(text, voiceName || azureSpeechVoiceName, locale),
		});

		if (!response.ok) {
			const details = await response.text();
			return res.status(response.status).json({
				error: "Azure Speech synthesis failed",
				details,
			});
		}

		const audioBuffer = Buffer.from(await response.arrayBuffer());
		res.setHeader("Content-Type", "audio/mpeg");
		return res.send(audioBuffer);
	} catch (error) {
		return res.status(500).json({ error: "Failed to synthesize speech" });
	}
});

app.post("/analyzeSymptoms", analyzeSymptomsController);

const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
	app.listen(port, () => {
		console.log(`Backend listening on http://localhost:${port}`);
	});
}

export default app;
