"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronRight, Home } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import type { SessionScore, FeedbackChip } from "@/types";

interface SessionResult {
  scores: SessionScore;
  promptsCompleted: number;
  totalPrompts: number;
  feedbackEvents: FeedbackChip[];
}

const NEXT_DRILLS: Record<string, string> = {
  pronunciation: "Practice slow, deliberate speaking with the R and S drill",
  fluency: "Try reading a short sentence out loud three times smoothly",
  articulation: "Focus on ending sounds — practice words ending in -ck and -t",
  confidence: "Record yourself saying a tongue twister and play it back",
};

function getStarCount(avg: number): number {
  if (avg >= 85) return 3;
  if (avg >= 70) return 2;
  return 1;
}

export default function ReportCardPage() {
  const router = useRouter();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [profile, setProfile] = useState<{ childName: string } | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("legacypp_session");
    const prof = localStorage.getItem("legacypp_profile");
    if (!session || !prof) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(session));
    setProfile(JSON.parse(prof));
  }, [router]);

  if (!result || !profile) return null;

  const { scores } = result;
  const avg = Math.round(
    (scores.pronunciation + scores.fluency + scores.articulation + scores.confidence) / 4
  );
  const stars = getStarCount(avg);

  // Find weakest area for next drill
  const scoreEntries = [
    ["pronunciation", scores.pronunciation],
    ["fluency", scores.fluency],
    ["articulation", scores.articulation],
    ["confidence", scores.confidence],
  ] as [string, number][];
  const weakest = scoreEntries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  const nextDrill = NEXT_DRILLS[weakest];

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Stars celebration */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={40}
                className={s <= stars ? "text-accent fill-accent" : "text-border"}
              />
            ))}
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-text mb-1">
            {stars === 3
              ? "Amazing job!"
              : stars === 2
              ? "Great effort!"
              : "Keep it up!"}
          </h1>
          <p className="text-muted font-body">
            {profile.childName} completed {result.promptsCompleted} of{" "}
            {result.totalPrompts} prompts
          </p>
        </div>

        {/* Score breakdown */}
        <Card elevated className="mb-6">
          <h2 className="font-heading font-bold text-lg text-text mb-4">
            Session Scores
          </h2>
          <div className="space-y-4">
            <ProgressBar
              value={scores.pronunciation}
              label="Clarity"
              color="primary"
            />
            <ProgressBar
              value={scores.fluency}
              label="Smoothness"
              color="success"
            />
            <ProgressBar
              value={scores.articulation}
              label="Articulation"
              color="secondary"
            />
            <ProgressBar
              value={scores.confidence}
              label="Confidence"
              color="accent"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm font-body text-muted">Overall</span>
            <span className="font-heading font-bold text-2xl text-primary">
              {avg}%
            </span>
          </div>
        </Card>

        {/* Next drill */}
        <Card className="mb-6 border-2 border-accent/20 bg-accent/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎯</span>
            <div>
              <p className="text-xs font-data font-bold text-accent uppercase mb-1">
                Next Recommended Drill
              </p>
              <p className="text-sm font-body text-text">{nextDrill}</p>
            </div>
          </div>
        </Card>

        {/* Feedback highlights */}
        {result.feedbackEvents.length > 0 && (
          <Card className="mb-6">
            <p className="text-xs font-data font-bold text-muted uppercase mb-3">
              Session Highlights
            </p>
            <div className="flex flex-wrap gap-2">
              {result.feedbackEvents.slice(0, 5).map((chip, i) => (
                <span
                  key={i}
                  className={
                    chip.type === "success"
                      ? "bg-success/10 text-success text-xs font-body px-3 py-1 rounded-full border border-success/20"
                      : chip.type === "tip"
                      ? "bg-accent/10 text-amber-700 text-xs font-body px-3 py-1 rounded-full border border-accent/20"
                      : "bg-warning/10 text-warning text-xs font-body px-3 py-1 rounded-full border border-warning/20"
                  }
                >
                  {chip.message}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={() => router.push("/child/home")}
          >
            <Home size={18} /> Home
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => router.push("/practice")}
          >
            Practice Again <ChevronRight size={18} />
          </Button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="text-sm font-body text-muted hover:text-primary transition-colors underline underline-offset-2"
          >
            View parent dashboard →
          </button>
        </div>
      </div>
    </main>
  );
}
