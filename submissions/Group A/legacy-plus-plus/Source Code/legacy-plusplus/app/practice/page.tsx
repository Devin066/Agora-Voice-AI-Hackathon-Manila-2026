"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, SkipForward, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  startSession,
  endSession,
  saveSessionScores,
  saveFeedbackEvents,
  saveRecommendation,
} from "@/lib/db";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPromptsForAge, getAgeGroup, type Prompt } from "@/lib/prompts";
import type { FeedbackChip, SessionScore } from "@/types";

type MicState = "idle" | "listening" | "processing" | "done";

const FEEDBACK_TEMPLATES: Record<string, FeedbackChip[]> = {
  great: [
    { type: "success", message: "Great try! 🌟" },
    { type: "success", message: "Clear and strong!" },
    { type: "success", message: "You nailed it!" },
  ],
  tip: [
    { type: "tip", message: "Slow it down a little 🐢" },
    { type: "tip", message: "Try that sound again" },
    { type: "tip", message: "Nice effort! Once more?" },
  ],
  encourage: [
    { type: "warning", message: "Let's try together 💪" },
    { type: "warning", message: "You're getting closer!" },
    { type: "warning", message: "That's tricky — keep going!" },
  ],
};

const NEXT_DRILLS: Record<string, string> = {
  pronunciation: "Practice slow, deliberate speaking with the R and S drill",
  fluency: "Try reading a short sentence out loud three times smoothly",
  articulation: "Focus on ending sounds — practice words ending in -ck and -t",
  confidence: "Record yourself saying a tongue twister and play it back",
};

function randomFeedback(): FeedbackChip {
  const keys = Object.keys(FEEDBACK_TEMPLATES) as Array<keyof typeof FEEDBACK_TEMPLATES>;
  const key = keys[Math.floor(Math.random() * keys.length)];
  const pool = FEEDBACK_TEMPLATES[key];
  return pool[Math.floor(Math.random() * pool.length)];
}

function simulateScore(): SessionScore {
  return {
    pronunciation: Math.floor(Math.random() * 30) + 65,
    fluency: Math.floor(Math.random() * 30) + 60,
    articulation: Math.floor(Math.random() * 30) + 62,
    confidence: Math.floor(Math.random() * 25) + 70,
  };
}

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [feedback, setFeedback] = useState<FeedbackChip | null>(null);
  const [allFeedback, setAllFeedback] = useState<FeedbackChip[]>([]);
  const [scores, setScores] = useState<SessionScore[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string>("");
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("legacypp_profile");
    if (!stored) { router.replace("/"); return; }
    const profile = JSON.parse(stored);
    const ageGroup = getAgeGroup(profile.childAge);
    const sessionPrompts = getPromptsForAge(ageGroup, 5);
    setPrompts(sessionPrompts);

    // Start session in Supabase
    if (user && profile.childId) {
      const now = new Date().toISOString();
      setSessionStartedAt(now);
      startSession(profile.childId, user.id, sessionPrompts.length)
        .then((s) => setSessionId(s.id))
        .catch(console.error);
    }
  }, [user, router]);

  useEffect(() => {
    return () => {
      stopMic();
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    };
  }, []);

  const stopMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleMicToggle = async () => {
    if (micState === "listening") {
      stopMic();
      setMicState("processing");
      processingTimerRef.current = setTimeout(() => {
        const chip = randomFeedback();
        const score = simulateScore();
        setFeedback(chip);
        setAllFeedback((prev) => [...prev, chip]);
        setScores((prev) => [...prev, score]);
        setMicState("done");
      }, 1500);
    } else if (micState === "idle" || micState === "done") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicState("listening");
        setFeedback(null);
      } catch {
        alert("Microphone access is needed for practice. Please allow it and try again.");
      }
    }
  };

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= prompts.length) {
      const avg = (arr: number[]) =>
        Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

      const finalScores: SessionScore = {
        pronunciation: avg(scores.map((s) => s.pronunciation)),
        fluency: avg(scores.map((s) => s.fluency)),
        articulation: avg(scores.map((s) => s.articulation)),
        confidence: avg(scores.map((s) => s.confidence)),
      };

      // Find weakest area
      const scoreEntries = [
        ["pronunciation", finalScores.pronunciation],
        ["fluency", finalScores.fluency],
        ["articulation", finalScores.articulation],
        ["confidence", finalScores.confidence],
      ] as [string, number][];
      const weakest = scoreEntries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

      // Save to Supabase
      if (sessionId) {
        const stored = localStorage.getItem("legacypp_profile");
        const profile = stored ? JSON.parse(stored) : null;
        await Promise.all([
          endSession(sessionId, scores.length, sessionStartedAt),
          saveSessionScores(sessionId, finalScores),
          saveFeedbackEvents(sessionId, allFeedback),
          profile?.childId
            ? saveRecommendation(
                sessionId,
                profile.childId,
                weakest,
                NEXT_DRILLS[weakest]
              )
            : Promise.resolve(),
        ]).catch(console.error);
      }

      // Keep localStorage for report card display
      const stored = localStorage.getItem("legacypp_profile");
      const profile = stored ? JSON.parse(stored) : null;
      localStorage.setItem(
        "legacypp_session",
        JSON.stringify({
          scores: finalScores,
          promptsCompleted: scores.length,
          totalPrompts: prompts.length,
          feedbackEvents: allFeedback,
          weakest,
        })
      );

      // Update streak + stars locally
      const streak = parseInt(localStorage.getItem("legacypp_streak") || "0");
      const stars = parseInt(localStorage.getItem("legacypp_stars") || "0");
      localStorage.setItem("legacypp_streak", String(streak + 1));
      localStorage.setItem("legacypp_stars", String(stars + scores.length));

      router.push("/report");
    } else {
      setCurrentIndex((i) => i + 1);
      setMicState("idle");
      setFeedback(null);
    }
  }, [
    currentIndex,
    prompts.length,
    scores,
    allFeedback,
    sessionId,
    sessionStartedAt,
    router,
  ]);

  const handleRetry = () => {
    setMicState("idle");
    setFeedback(null);
  };

  if (prompts.length === 0) return null;

  const currentPrompt = prompts[currentIndex];
  const progress = (currentIndex / prompts.length) * 100;

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/child/home")}
            className="text-muted hover:text-error transition-colors p-1"
          >
            <X size={22} />
          </button>
          <span className="font-data text-sm text-muted">
            {currentIndex + 1} / {prompts.length}
          </span>
          <div className="w-6" />
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          {prompts.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                i < currentIndex
                  ? "bg-success w-6"
                  : i === currentIndex
                  ? "bg-primary w-8"
                  : "bg-border w-2.5"
              )}
            />
          ))}
        </div>

        {/* Phoneme target */}
        <div className="text-center mb-2">
          <span className="inline-block bg-secondary/10 text-secondary text-xs font-data font-bold px-3 py-1 rounded-full">
            Target sound: {currentPrompt.phonemeTarget}
          </span>
        </div>

        {/* Phrase card */}
        <Card elevated className="text-center mb-6 py-10 border-2 border-primary/10">
          <div className="text-6xl mb-4">{currentPrompt.imageEmoji}</div>
          <p className="font-heading font-bold text-3xl text-text leading-tight">
            {currentPrompt.text}
          </p>
        </Card>

        {/* Feedback chip */}
        {feedback && (
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body font-medium mb-4 transition-all",
              feedback.type === "success" &&
                "bg-success/10 text-success border border-success/30",
              feedback.type === "tip" &&
                "bg-accent/10 text-amber-700 border border-accent/30",
              feedback.type === "warning" &&
                "bg-warning/10 text-warning border border-warning/30"
            )}
          >
            {feedback.message}
          </div>
        )}

        {/* Processing indicator */}
        {micState === "processing" && (
          <div className="flex items-center justify-center gap-2 text-primary font-body text-sm mb-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            Analyzing your voice…
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleMicToggle}
            disabled={micState === "processing"}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50",
              micState === "listening"
                ? "bg-error animate-pulse shadow-red-200"
                : "bg-primary hover:bg-primary-dark shadow-primary/30"
            )}
          >
            {micState === "listening" ? (
              <MicOff className="text-white" size={32} />
            ) : (
              <Mic className="text-white" size={32} />
            )}
          </button>

          <p className="text-xs font-body text-muted">
            {micState === "idle" && "Tap the mic to start speaking"}
            {micState === "listening" && "Listening… tap to stop"}
            {micState === "processing" && "Checking your response…"}
            {micState === "done" && "Nice! What next?"}
          </p>

          {micState === "done" && (
            <div className="flex gap-3 mt-2">
              <Button variant="ghost" size="md" onClick={handleRetry}>
                <RotateCcw size={16} /> Try Again
              </Button>
              <Button size="md" onClick={handleNext}>
                {currentIndex + 1 >= prompts.length ? "Finish" : "Next"}
                <SkipForward size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </main>
  );
}
