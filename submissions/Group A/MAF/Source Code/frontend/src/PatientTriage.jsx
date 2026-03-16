import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import UrgencyBadge from "./components/UrgencyBadge";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const AGORA_CHANNEL = import.meta.env.VITE_AGORA_CHANNEL || "triage-room";
const AGORA_TOKEN = import.meta.env.VITE_AGORA_TOKEN || null;
const ENABLE_CONVERSATIONAL_AI =
  String(import.meta.env.VITE_ENABLE_CONVERSATIONAL_AI || "false").toLowerCase() === "true";
const CAE_START_TIMEOUT_MS = 12000;
const TRIAGE_RESULT_STORAGE_KEY = "patient-triage-analysis";

function PatientTriage({ onNewCase }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [followUpState, setFollowUpState] = useState("idle");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpTranscript, setFollowUpTranscript] = useState("");
  const [followUpInterim, setFollowUpInterim] = useState("");
  const [followUpContext, setFollowUpContext] = useState({ question: "", answer: "" });
  const [caeStatus, setCaeStatus] = useState("idle");
  const [caeErrorText, setCaeErrorText] = useState("");

  const recognitionRef = useRef(null);
  const agoraClientRef = useRef(null);
  const localTrackRef = useRef(null);
  const caeAgentIdRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const manualStopRef = useRef(false);
  const fuRecognitionRef = useRef(null);
  const fuShouldKeepRef = useRef(false);
  const fuManualStopRef = useRef(false);
  const fuRestartTimerRef = useRef(null);
  const followUpTranscriptRef = useRef("");
  const followUpInterimRef = useRef("");
  const baseSymptomsRef = useRef("");
  const triageRoundRef = useRef(0);
  const ttsAudioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const ttsObjectUrlRef = useRef("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRIAGE_RESULT_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.analysis) {
        setAnalysis(saved.analysis);
      }
      if (saved?.followUpContext) {
        setFollowUpContext(saved.followUpContext);
      }
    } catch {
      localStorage.removeItem(TRIAGE_RESULT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!analysis) {
      localStorage.removeItem(TRIAGE_RESULT_STORAGE_KEY);
      return;
    }
    localStorage.setItem(
      TRIAGE_RESULT_STORAGE_KEY,
      JSON.stringify({
        analysis,
        followUpContext,
      })
    );
  }, [analysis, followUpContext]);

  useEffect(() => {
    return () => {
      cleanupAgora();
      shouldKeepListeningRef.current = false;
      manualStopRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      fuShouldKeepRef.current = false;
      fuManualStopRef.current = true;
      if (fuRestartTimerRef.current) clearTimeout(fuRestartTimerRef.current);
      if (fuRecognitionRef.current) fuRecognitionRef.current.stop();
      if (ttsAbortRef.current) ttsAbortRef.current.abort();
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = "";
      }
      if (ttsObjectUrlRef.current) URL.revokeObjectURL(ttsObjectUrlRef.current);
    };
  }, []);

  const deleteTriageResult = () => {
    setAnalysis(null);
    setFollowUpContext({ question: "", answer: "" });
  };

  const speakText = async (text) => {
    if (!String(text || "").trim()) return;
    setError("");
    try {
      if (ttsAbortRef.current) ttsAbortRef.current.abort();
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = "";
      }
      if (ttsObjectUrlRef.current) {
        URL.revokeObjectURL(ttsObjectUrlRef.current);
        ttsObjectUrlRef.current = "";
      }

      const controller = new AbortController();
      ttsAbortRef.current = controller;
      const localeHint = navigator.language || "en-US";
      const response = await fetch(`${API_BASE_URL}/speech/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, locale: localeHint }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Text-to-speech request failed.");
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      ttsObjectUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      ttsAudioRef.current = audio;
      audio.onended = () => {
        if (ttsObjectUrlRef.current) URL.revokeObjectURL(ttsObjectUrlRef.current);
        ttsObjectUrlRef.current = "";
      };
      await audio.play();
    } catch (error) {
      if (error?.name !== "AbortError") {
        setError(error?.message || "Unable to play synthesized speech.");
      }
    } finally {
      ttsAbortRef.current = null;
    }
  };

  const startConversationalAgent = async (remoteRtcUid) => {
    if (!ENABLE_CONVERSATIONAL_AI) {
      setCaeStatus("disabled");
      setCaeErrorText("");
      return;
    }
    if (!AGORA_TOKEN) {
      setCaeStatus("error");
      setCaeErrorText("Missing Agora token for Conversational AI.");
      return;
    }
    setCaeStatus("starting");
    setCaeErrorText("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CAE_START_TIMEOUT_MS);
    try {
      const statusResponse = await fetch(`${API_BASE_URL}/conversationalAgent/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (!statusData.enabled) {
          setCaeStatus("disabled");
          const issuesText =
            Array.isArray(statusData.issues) && statusData.issues.length
              ? statusData.issues.join(", ")
              : "Backend reports CAE as disabled. Restart backend after updating .env.";
          setCaeErrorText(issuesText);
          return;
        }
      }

      const response = await fetch(`${API_BASE_URL}/conversationalAgent/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: AGORA_CHANNEL,
          token: AGORA_TOKEN,
          remoteRtcUid: String(remoteRtcUid),
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to start conversational agent.");
      if (!data.enabled) {
        setCaeStatus("disabled");
        const issuesText =
          Array.isArray(data.issues) && data.issues.length
            ? data.issues.join(", ")
            : "Backend reports CAE as disabled. Restart backend after updating .env.";
        setCaeErrorText(`${data.error ? `${data.error}. ` : ""}${issuesText}`.trim());
        return;
      }
      caeAgentIdRef.current = data.agent_id || data.agentId || null;
      setCaeStatus(caeAgentIdRef.current ? "connected" : "error");
      if (!caeAgentIdRef.current) {
        setCaeErrorText("Agent started but no agent id was returned.");
      }
    } catch (error) {
      setCaeStatus("error");
      setCaeErrorText(error?.name === "AbortError" ? "Agent start timed out." : error?.message || "Agent start failed.");
      console.error(error);
    } finally {
      clearTimeout(timeout);
    }
  };

  const stopConversationalAgent = async () => {
    if (!caeAgentIdRef.current) return;
    try {
      await fetch(`${API_BASE_URL}/conversationalAgent/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: caeAgentIdRef.current }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      caeAgentIdRef.current = null;
      setCaeErrorText("");
      if (ENABLE_CONVERSATIONAL_AI) setCaeStatus("idle");
    }
  };

  const startAgoraStreaming = async () => {
    if (!AGORA_APP_ID) {
      console.warn("Agora APP ID missing — continuing with local mic transcription.");
      setCaeStatus("disabled");
      return;
    }
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    try {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio") {
          user.audioTrack?.stop();
        }
      });
      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const localUid = await client.join(AGORA_APP_ID, AGORA_CHANNEL, AGORA_TOKEN, null);
      await client.publish([micTrack]);
      agoraClientRef.current = client;
      localTrackRef.current = micTrack;
      await startConversationalAgent(localUid);
    } catch (error) {
      client.removeAllListeners();
      try {
        await client.leave();
      } catch {
      }
      throw new Error(error?.message || "Failed to connect to Agora channel.");
    }
  };

  const cleanupAgora = async () => {
    try {
      await stopConversationalAgent();
      if (localTrackRef.current) {
        localTrackRef.current.stop();
        localTrackRef.current.close();
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.removeAllListeners();
        await agoraClientRef.current.leave();
      }
    } catch (e) {
      console.error("Agora cleanup error:", e);
    } finally {
      localTrackRef.current = null;
      agoraClientRef.current = null;
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser does not support Web Speech API. Use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    manualStopRef.current = false;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += `${text} `;
        else interim += text;
      }
      if (finalText) setTranscript((prev) => `${prev}${finalText}`.trim());
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (manualStopRef.current || event.error === "aborted" || event.error === "no-speech") return;
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (shouldKeepListeningRef.current) {
        restartTimerRef.current = setTimeout(() => startSpeechRecognition(), 250);
      } else {
        setIsListening(false);
        setInterimText("");
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopSpeechRecognition = () => {
    shouldKeepListeningRef.current = false;
    manualStopRef.current = true;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  };

  const toggleTriage = async () => {
    setError("");
    if (isListening) {
      stopSpeechRecognition();
      await cleanupAgora();
      return;
    }
    try {
      setTranscript("");
      setInterimText("");
      setAnalysis(null);
      setFollowUpState("idle");
      setFollowUpQuestion("");
      setFollowUpTranscript("");
      setFollowUpInterim("");
      setFollowUpContext({ question: "", answer: "" });
      baseSymptomsRef.current = "";
      triageRoundRef.current = 0;
      shouldKeepListeningRef.current = true;
      setCaeStatus("starting");
      setCaeErrorText("");
      await startAgoraStreaming();
      startSpeechRecognition();
    } catch (e) {
      setCaeStatus("error");
      setCaeErrorText(e?.message || "Failed to connect to Agora or start CAE.");
      setError("Failed to start microphone or Agora connection.");
      console.error(e);
      shouldKeepListeningRef.current = false;
      await cleanupAgora();
    }
  };

  const startFollowUpRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    fuManualStopRef.current = false;
    fuShouldKeepRef.current = true;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += `${text} `;
        else interim += text;
      }
      if (finalText) {
        setFollowUpTranscript((prev) => {
          const next = `${prev}${finalText}`.trim();
          followUpTranscriptRef.current = next;
          return next;
        });
      }
      followUpInterimRef.current = interim;
      setFollowUpInterim(interim);
    };

    recognition.onerror = (event) => {
      if (fuManualStopRef.current || event.error === "aborted" || event.error === "no-speech") return;
      setError(`Follow-up mic error: ${event.error}`);
    };

    recognition.onend = () => {
      fuRecognitionRef.current = null;
      if (fuShouldKeepRef.current) {
        fuRestartTimerRef.current = setTimeout(() => startFollowUpRecognition(), 250);
      } else {
        followUpInterimRef.current = "";
        setFollowUpInterim("");
      }
    };

    recognition.start();
    fuRecognitionRef.current = recognition;
  };

  const stopFollowUpRecognition = () => {
    fuShouldKeepRef.current = false;
    fuManualStopRef.current = true;
    if (fuRestartTimerRef.current) clearTimeout(fuRestartTimerRef.current);
    if (fuRecognitionRef.current) {
      fuRecognitionRef.current.stop();
      fuRecognitionRef.current = null;
    }
  };

  const startFollowUpListening = () => {
    setError("");
    setFollowUpTranscript("");
    setFollowUpInterim("");
    followUpTranscriptRef.current = "";
    followUpInterimRef.current = "";
    setFollowUpState("listening");
    startFollowUpRecognition();
  };

  const stopFollowUpAndAnalyze = async () => {
    stopFollowUpRecognition();
    await new Promise((resolve) => setTimeout(resolve, 350));

    const answer = `${followUpTranscriptRef.current} ${followUpInterimRef.current}`.trim();

    if (!answer) {
      setError("I didn't catch your answer. Please tap 'Answer by Voice' and try again.");
      setFollowUpState("asking");
      return;
    }

    setError("");
    setFollowUpContext({ question: followUpQuestion, answer });
    setFollowUpState("idle");
    if (answer) {
      await runAnalysis(answer);
    }
  };

  const runAnalysis = async (followUpAnswer = "") => {
    const fullTranscript = `${transcript} ${interimText}`.trim();

    if (!followUpAnswer && !fullTranscript) {
      setError("Please describe symptoms first before analysis.");
      return;
    }

    if (!followUpAnswer) {
      stopSpeechRecognition();
      baseSymptomsRef.current = fullTranscript;
      triageRoundRef.current = 0;
      setFollowUpContext({ question: "", answer: "" });
    }

    setError("");
    setIsAnalyzing(true);
    setFollowUpState("idle");

    try {
      const response = await fetch(`${API_BASE_URL}/analyzeSymptoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: baseSymptomsRef.current,
          ...(followUpAnswer ? { context: followUpAnswer } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze symptoms");

      triageRoundRef.current += 1;
      setAnalysis(data);

      const hasFollowUp =
        Array.isArray(data.missing_info_questions) && data.missing_info_questions.length > 0;
      const shouldAsk = hasFollowUp && triageRoundRef.current < 2 && !followUpAnswer;

      if (shouldAsk) {
        const question = data.missing_info_questions[0];
        setFollowUpQuestion(question);
        setFollowUpContext((prev) => ({ ...prev, question, answer: "" }));
        setFollowUpState("asking");
        setTimeout(() => speakText(question), 600);
      } else {
        const finalText = followUpAnswer
          ? `${baseSymptomsRef.current}. ${followUpAnswer}`
          : baseSymptomsRef.current;
        onNewCase({
          ...data,
          transcript: finalText,
          follow_up_question: followUpAnswer ? followUpQuestion : "",
          follow_up_answer: followUpAnswer || "",
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const urgencyPanelStyle = {
    HIGH: "border-red-200 bg-red-50",
    MEDIUM: "border-orange-200 bg-orange-50",
    LOW: "border-green-200 bg-green-50",
  };
  const confidenceBarColor = (c) =>
    c >= 80 ? "bg-green-500" : c >= 60 ? "bg-orange-400" : "bg-red-400";
  const confidenceTextColor = (c) =>
    c >= 80 ? "text-green-700" : c >= 60 ? "text-orange-600" : "text-red-600";

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
        <h2 className="font-headline text-2xl font-bold text-slate-900">Patient Voice Triage</h2>
        <p className="text-slate-600">Supports English, Tagalog, and Taglish symptom descriptions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <button
            onClick={toggleTriage}
            className={`flex h-40 w-40 items-center justify-center rounded-full text-center font-headline text-xl font-bold text-white shadow-lg transition duration-200 hover:scale-105 ${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-slate-900 hover:bg-slate-700"
            }`}
          >
            {isListening ? "Stop Triage" : "Start Triage"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            {isListening ? "Listening. Click to stop." : "Click and describe symptoms clearly."}
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            {caeStatus === "connected"
              ? "Conversational AI agent is active."
              : caeStatus === "starting"
              ? "Starting conversational AI agent..."
              : caeStatus === "error"
              ? `Conversational AI agent failed to start.${caeErrorText ? ` ${caeErrorText}` : ""}`
              : caeStatus === "disabled"
              ? `Conversational AI agent is disabled.${caeErrorText ? ` ${caeErrorText}` : ""}`
              : ""}
          </p>

          <button
            onClick={stopSpeechRecognition}
            disabled={!isListening}
            className="mt-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Stop Listening
          </button>

          <button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
          </button>
        </div>

        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-headline text-lg font-semibold text-slate-900">Transcript</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isListening
                  ? "bg-emerald-100 text-emerald-700"
                  : transcript
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isListening ? "● Listening..." : transcript ? "Editable" : "Idle"}
            </span>
          </div>

          {!isListening ? (
            <>
              <textarea
                className="min-h-36 w-full flex-1 resize-y rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Edit the transcript here to fix any speech-to-text mistakes..."
              />
              <p className="mt-1 text-xs text-slate-400">You can edit before clicking Analyze Symptoms.</p>
            </>
          ) : (
            <p className="min-h-24 text-sm text-slate-700">
              {`${transcript} ${interimText}`.trim() || "Patient speech will appear here as they speak."}
            </p>
          )}
        </div>
      </div>

      {followUpState === "asking" && (
        <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-500">Follow-up Question</p>
          <p className="text-lg font-semibold text-blue-900">"{followUpQuestion}"</p>
          <button
            onClick={startFollowUpListening}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Answer by Voice
          </button>
        </div>
      )}

      {followUpState === "listening" && (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Listening for answer…</p>
          </div>
          <p className="min-h-8 italic text-slate-700">
            {`${followUpTranscript} ${followUpInterim}`.trim() || "Speak your answer now."}
          </p>
          <button
            onClick={stopFollowUpAndAnalyze}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Done Answering
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {analysis && (
        <div
          className={`space-y-4 rounded-3xl border p-5 shadow-sm ${
            urgencyPanelStyle[analysis.urgency] || urgencyPanelStyle.LOW
          }`}
        >
          {analysis.safety_override && (
            <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
              {analysis.safety_message || "Emergency safety rule triggered. Immediate care is recommended."}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <h3 className="font-headline text-xl font-bold">Triage Result</h3>
            <UrgencyBadge urgency={analysis.urgency} />
          </div>

          {typeof analysis.confidence === "number" && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI Confidence</p>
                <span className={`text-sm font-bold ${confidenceTextColor(analysis.confidence)}`}>
                  {analysis.confidence}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${confidenceBarColor(analysis.confidence)}`}
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Doctor Summary</p>
            <p className="mt-1 text-slate-900">{analysis.summary}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Possible Issue</p>
            <p className="mt-1 text-slate-800">{analysis.possible_issue}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Scheduling Recommendation</p>
            <p className="mt-1 text-slate-800">{analysis.recommendation}</p>
          </div>

          {Array.isArray(analysis.urgency_reasons) && analysis.urgency_reasons.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Why This Urgency</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-800">
                {analysis.urgency_reasons.map((reason, i) => (
                  <li key={`${reason}-${i}`}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {followUpContext.question && followUpContext.answer && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Follow-up Context Used</p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-semibold">Question:</span> {followUpContext.question}
              </p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-semibold">Patient answer:</span> {followUpContext.answer}
              </p>
            </div>
          )}

          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ This tool determines appointment scheduling priority only. It does not provide medical diagnoses or treatment advice. A licensed physician must evaluate the patient.
          </p>

          <button
            onClick={deleteTriageResult}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Result
          </button>
        </div>
      )}
    </section>
  );
}

export default PatientTriage;
