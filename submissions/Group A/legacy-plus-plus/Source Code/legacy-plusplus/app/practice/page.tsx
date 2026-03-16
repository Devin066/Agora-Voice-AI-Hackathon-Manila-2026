"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { Mic, MicOff, SkipForward, RotateCcw, X, Volume2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  startSession,
  endSession,
  saveSessionScores,
  saveFeedbackEvents,
  saveRecommendation,
} from "@/lib/db";
import { getPromptsForAge, getAgeGroup, type Prompt } from "@/lib/prompts";
import type { FeedbackChip, SessionScore } from "@/types";

type MicState = "idle" | "listening" | "processing" | "done";

const NEXT_DRILLS: Record<string, string> = {
  pronunciation: "Practice slow, deliberate speaking with the R and S drill",
  fluency:       "Try reading a short sentence out loud three times smoothly",
  articulation:  "Focus on ending sounds — practice words ending in -ck and -t",
  confidence:    "Record yourself saying a tongue twister and play it back",
};

function scoreFromDuration(durationMs: number): SessionScore {
  const base = Math.min(100, 60 + Math.floor(durationMs / 200));
  const v    = () => Math.floor(Math.random() * 10) - 5;
  return {
    pronunciation: Math.min(100, Math.max(40, base     + v())),
    fluency:       Math.min(100, Math.max(40, base - 5 + v())),
    articulation:  Math.min(100, Math.max(40, base - 3 + v())),
    confidence:    Math.min(100, Math.max(40, base + 5 + v())),
  };
}

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [prompts,          setPrompts]          = useState<Prompt[]>([]);
  const [currentIndex,     setCurrentIndex]     = useState(0);
  const [micState,         setMicState]         = useState<MicState>("idle");
  const [allFeedback,      setAllFeedback]      = useState<FeedbackChip[]>([]);
  const [scores,           setScores]           = useState<SessionScore[]>([]);
  const [sessionId,        setSessionId]        = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState("");
  const [agentSpeaking,    setAgentSpeaking]    = useState(false);
  const [agentId,          setAgentId]          = useState<string | null>(null);
  const [agoraReady,       setAgoraReady]       = useState(false);
  const [speakStartTime,   setSpeakStartTime]   = useState(0);
  const [childName,        setChildName]        = useState("there");
  const [lives,            setLives]            = useState(3);
  const [sessionStarted,   setSessionStarted]   = useState(false);

  const clientRef        = useRef<IAgoraRTCClient | null>(null);
  const micTrackRef      = useRef<IMicrophoneAudioTrack | null>(null);
  const speakTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initStartedRef   = useRef(false);
  const agentIdRef       = useRef<string | null>(null);
  const agentSpeakTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef       = useRef<{ childId?: string; childAge?: number; childName?: string } | null>(null);
  const channelRef       = useRef("");
  const userUidRef       = useRef(0);

  // Phase 1: load profile & prompts (no Agora, no audio)
  useEffect(() => {
    const raw = localStorage.getItem("legacypp_profile");
    if (!raw) { router.replace("/"); return; }
    const profile = JSON.parse(raw);
    profileRef.current = profile;
    setChildName(profile.childName || "there");

    const ageGroup       = getAgeGroup(profile.childAge);
    const sessionPrompts = getPromptsForAge(ageGroup, 5);
    setPrompts(sessionPrompts);

    const channelName = `session-${profile.childId ?? "demo"}-${Date.now()}`;
    const userUid     = Math.floor(Math.random() * 100000) + 1;
    channelRef.current  = channelName;
    userUidRef.current  = userUid;
    localStorage.setItem("legacypp_channel", channelName);
    localStorage.setItem("legacypp_uid", String(userUid));

    return () => { cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Phase 2: init Agora — only called after user taps "Start" (satisfies browser autoplay policy)
  const handleStart = async () => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    setSessionStarted(true);

    const profile     = profileRef.current!;
    const channelName = channelRef.current;
    const userUid     = userUidRef.current;

    if (user && profile.childId) {
      const now = new Date().toISOString();
      setSessionStartedAt(now);
      startSession(profile.childId, user.id, prompts.length)
        .then((s) => setSessionId(s.id))
        .catch(console.error);
    }

    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client   = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-joined", (ru: IAgoraRTCRemoteUser) => {
        console.log("[Agora] Remote user joined, uid:", ru.uid);
      });
      client.on("user-joined", (ru: IAgoraRTCRemoteUser) => {
        console.log("[Agora] Remote user joined, uid:", ru.uid);
      });
      client.on("user-published", async (ru: IAgoraRTCRemoteUser, mt: string) => {
        console.log("[Agora] user-published uid:", ru.uid, "mediaType:", mt);
        if (mt === "audio") {
          await client.subscribe(ru, "audio");
          console.log("[Agora] Subscribed to audio, playing...");
          ru.audioTrack?.play();
          setAgentSpeaking(true);
          // Safety: auto-clear agentSpeaking after 15s in case user-unpublished never fires
          if (agentSpeakTimer.current) clearTimeout(agentSpeakTimer.current);
          agentSpeakTimer.current = setTimeout(() => setAgentSpeaking(false), 15_000);
        }
      });
      client.on("user-unpublished", (_: IAgoraRTCRemoteUser, mt: string) => {
        console.log("[Agora] user-unpublished mediaType:", mt);
        if (mt === "audio") {
          if (agentSpeakTimer.current) clearTimeout(agentSpeakTimer.current);
          setAgentSpeaking(false);
        }
      });

      const { token } = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, uid: userUid }),
      }).then((r) => r.json());

      await client.join(APP_ID, channelName, token, userUid);

      const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "speech_low_quality",
      });
      micTrackRef.current = micTrack;

      // Mic is ready — let the child start speaking right away
      setAgoraReady(true);

      // Start agent in the background (non-blocking)
      fetch("/api/agora/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, userUid, agentUid: 999, childAge: profile.childAge }),
      })
        .then((r) => r.json())
        .then((agentData) => {
          if (agentData.agentId) {
            setAgentId(agentData.agentId);
            agentIdRef.current = agentData.agentId;
          }
        })
        .catch(console.error);
    } catch (err) {
      console.error("Agora init error:", err);
      setAgoraReady(true);
    }
  };

  const cleanup = async () => {
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
    if (micTrackRef.current) {
      micTrackRef.current.stop();
      micTrackRef.current.close();
      micTrackRef.current = null;
    }
    const idToStop = agentIdRef.current;
    if (idToStop) {
      agentIdRef.current = null;
      fetch("/api/agora/agent", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: idToStop }),
      }).catch(console.error);
    }
    if (clientRef.current) {
      await clientRef.current.leave().catch(console.error);
      clientRef.current = null;
    }
  };

  const handleMicToggle = async () => {
    if (!micTrackRef.current) return;

    if (micState === "listening") {
      const duration = Date.now() - speakStartTime;
      await clientRef.current?.unpublish(micTrackRef.current);
      await micTrackRef.current.setEnabled(false);
      setMicState("processing");

      speakTimerRef.current = setTimeout(() => {
        const score: SessionScore = scoreFromDuration(duration);
        setAllFeedback((prev) => [
          ...prev,
          { type: "success", message: "Sparky is listening… 🎙️" },
        ]);
        setScores((prev) => [...prev, score]);
        setMicState("done");
      }, 800);
    } else if (micState === "idle" || micState === "done") {
      try {
        await micTrackRef.current.setEnabled(true);
        await clientRef.current?.publish(micTrackRef.current);
        setSpeakStartTime(Date.now());
        setMicState("listening");
      } catch (err) {
        console.error("Mic publish error:", err);
      }
    }
  };

  const handleRetry = () => {
    setLives((l) => Math.max(0, l - 1));
    setMicState("idle");
  };

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= prompts.length) {
      const avg = (arr: number[]) =>
        arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 70;

      const finalScores: SessionScore = {
        pronunciation: avg(scores.map((s) => s.pronunciation)),
        fluency:       avg(scores.map((s) => s.fluency)),
        articulation:  avg(scores.map((s) => s.articulation)),
        confidence:    avg(scores.map((s) => s.confidence)),
      };

      const entries  = Object.entries(finalScores) as [keyof SessionScore, number][];
      const weakest  = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

      if (sessionId) {
        const stored  = localStorage.getItem("legacypp_profile");
        const profile = stored ? JSON.parse(stored) : null;
        await Promise.all([
          endSession(sessionId, scores.length, sessionStartedAt),
          saveSessionScores(sessionId, finalScores),
          saveFeedbackEvents(sessionId, allFeedback),
          profile?.childId
            ? saveRecommendation(sessionId, profile.childId, weakest, NEXT_DRILLS[weakest])
            : Promise.resolve(),
        ]).catch(console.error);
      }

      localStorage.setItem("legacypp_session", JSON.stringify({
        scores: finalScores,
        promptsCompleted: scores.length,
        totalPrompts: prompts.length,
        feedbackEvents: allFeedback,
        weakest,
      }));

      const streak = parseInt(localStorage.getItem("legacypp_streak") || "0");
      const stars  = parseInt(localStorage.getItem("legacypp_stars")  || "0");
      localStorage.setItem("legacypp_streak", String(streak + 1));
      localStorage.setItem("legacypp_stars",  String(stars  + scores.length));

      await cleanup();
      router.push("/report");
    } else {
      setCurrentIndex((i) => i + 1);
      setMicState("idle");
    }
  }, [currentIndex, prompts.length, scores, allFeedback, sessionId, sessionStartedAt, router]);

  if (prompts.length === 0) return null;

  // ── Start screen (shown before any Agora audio is initialised) ──────────
  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 gap-8">
        <div className="text-center">
          <div className="text-8xl mb-4 select-none animate-bounce-in">🤖</div>
          <h1 className="font-heading font-extrabold text-3xl text-text mb-2">
            Ready to practice?
          </h1>
          <p className="font-body text-muted text-base">
            Sparky will listen and cheer you on!
          </p>
        </div>

        <div className="bg-surface border-2 border-border rounded-3xl p-5 w-full max-w-sm space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <p className="font-body text-sm text-text">{prompts.length} phrases to practice</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <p className="font-body text-sm text-text">3 lives — use them wisely!</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <p className="font-body text-sm text-text">Tap the mic when you&apos;re ready to speak</p>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="btn-3d w-full max-w-sm bg-primary text-white py-5 rounded-2xl font-heading font-extrabold text-xl shadow-[0_5px_0_#0b8a8b]"
        >
          Let&apos;s Go! 🚀
        </button>

        <button
          onClick={() => router.push("/child/home")}
          className="font-body text-sm text-muted hover:text-text"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  const prompt   = prompts[currentIndex];
  const isLast   = currentIndex + 1 >= prompts.length;
  const disabled = micState === "processing" || !agoraReady;

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Header ────────────────────────────────────────── */}
      <header className="bg-surface border-b-2 border-border px-4 pt-4 pb-3">
        {/* Top row: exit + lives */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={async () => { await cleanup(); router.push("/child/home"); }}
            className="w-9 h-9 rounded-xl bg-bg border-2 border-border flex items-center justify-center text-muted hover:text-error hover:border-error transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                size={22}
                className={h <= lives ? "text-error fill-error" : "text-border fill-border"}
              />
            ))}
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-1.5">
          {prompts.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-4 rounded-full transition-all duration-500",
                i < currentIndex
                  ? "bg-success"
                  : i === currentIndex
                  ? "bg-primary"
                  : "bg-border"
              )}
            />
          ))}
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-5 max-w-lg mx-auto w-full">

        {/* Connecting indicator */}
        {!agoraReady && (
          <div className="flex items-center gap-3 bg-primary/10 border-2 border-primary/20 rounded-2xl px-5 py-3 w-full">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <span className="font-body text-sm text-primary font-semibold">
              Setting up Sparky…
            </span>
          </div>
        )}

        {/* Sparky speech bubble (when agent is speaking) */}
        {agentSpeaking && (
          <div className="flex items-end gap-3 w-full animate-pop-up">
            <div className="text-5xl select-none animate-wiggle">🤖</div>
            <div className="flex-1 bg-secondary/10 border-2 border-secondary/25 rounded-3xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-secondary animate-pulse" />
                <span className="font-body font-semibold text-secondary text-sm">
                  Sparky is talking…
                </span>
              </div>
              <p className="text-xs text-muted font-body mt-0.5">Listen carefully! 👂</p>
            </div>
          </div>
        )}

        {/* Phoneme target */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-data font-extrabold text-sm"
          style={{ borderColor: "#0EA5A6aa", backgroundColor: "#0EA5A611", color: "#0EA5A6" }}
        >
          🎯 Practice sound: <span className="font-extrabold text-base">{prompt.phonemeTarget}</span>
        </div>

        {/* Phrase card */}
        <div
          className={cn(
            "w-full bg-surface rounded-3xl border-4 text-center py-10 px-6 transition-all duration-300 shadow-md",
            micState === "listening" ? "border-error   shadow-red-100"
            : micState === "done"   ? "border-success shadow-green-100"
            : "border-primary/30"
          )}
        >
          <div className="text-8xl mb-5 select-none animate-float">{prompt.imageEmoji}</div>
          <p className="font-heading font-extrabold text-4xl text-text leading-tight">
            {prompt.text}
          </p>

          {micState === "done" && (
            <div className="mt-5 animate-pop-up">
              <span className="inline-flex items-center gap-2 bg-success/15 text-success border-2 border-success/30 px-5 py-2 rounded-full font-heading font-bold text-sm">
                ✓ Great try, {childName}!
              </span>
            </div>
          )}
        </div>

        {/* Processing dots */}
        {micState === "processing" && (
          <div className="flex items-center gap-2 text-primary font-body font-semibold text-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            Sparky is thinking…
          </div>
        )}

        {/* Mic area */}
        <div className="flex flex-col items-center gap-4">

          {/* Big mic button */}
          <div className="relative">
            {micState === "listening" && (
              <>
                <span className="absolute inset-0 rounded-full bg-error/20 animate-pulse-ring scale-125" />
                <span className="absolute inset-0 rounded-full bg-error/10 animate-pulse-ring scale-150"
                  style={{ animationDelay: "0.3s" }} />
              </>
            )}
            <button
              onClick={handleMicToggle}
              disabled={disabled}
              className={cn(
                "btn-3d relative w-28 h-28 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed",
                micState === "listening"
                  ? "bg-error shadow-[0_6px_0_#dc2626]"
                  : "bg-primary shadow-[0_6px_0_#0b8a8b]"
              )}
            >
              {micState === "listening"
                ? <MicOff className="text-white" size={42} />
                : <Mic    className="text-white" size={42} />
              }
            </button>
          </div>

          {/* Instruction */}
          <p className={cn(
            "font-heading font-bold text-base text-center",
            micState === "listening" ? "text-error" : "text-text"
          )}>
            {!agoraReady                       && "Setting up your session…"}
            {agoraReady && agentSpeaking  && micState === "idle"      && "Sparky is talking… tap mic anytime! 🎤"}
            {agoraReady && !agentSpeaking && micState === "idle"      && "Tap the mic and say it! 🎤"}
            {agoraReady && micState === "listening"                   && "I'm listening… tap to stop! 👂"}
            {micState === "processing"         && "Sparky is thinking… 🤔"}
            {micState === "done"               && "Awesome! What's next? 🎉"}
          </p>

          {/* After-attempt buttons */}
          {micState === "done" && (
            <div className="flex gap-3 mt-1 animate-slide-up">
              <button
                onClick={handleRetry}
                className="btn-3d flex items-center gap-2 bg-surface border-2 border-border text-muted px-5 py-3 rounded-2xl font-heading font-bold text-sm shadow-[0_3px_0_#CBD5E1] hover:border-primary hover:text-primary"
              >
                <RotateCcw size={16} /> Try Again
              </button>
              <button
                onClick={handleNext}
                className="btn-3d flex items-center gap-2 bg-success text-white px-7 py-3 rounded-2xl font-heading font-bold text-sm shadow-[0_3px_0_#16a34a]"
              >
                {isLast ? "🎉 Finish!" : "Next"}
                {!isLast && <SkipForward size={16} />}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
