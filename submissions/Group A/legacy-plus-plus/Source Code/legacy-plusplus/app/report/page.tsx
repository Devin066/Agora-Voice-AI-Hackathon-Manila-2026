"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Home, RotateCcw, ChevronRight, Waves, Trophy, Target } from "lucide-react";
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
  fluency:       "Try reading a short sentence out loud three times smoothly",
  articulation:  "Focus on ending sounds — practice words ending in -ck and -t",
  confidence:    "Record yourself saying a tongue twister and play it back",
};

// Icon + colors replace emoji mascots
const BY_STARS = [
  { heading: "Keep it up!", sub: "Every practice makes you stronger!", Icon: Waves,  iconBg: "#F97316", iconShadow: "#ea580c", bg: "from-warning/20 to-bg" },
  { heading: "Nice work!",  sub: "You're getting better every day!",   Icon: Waves,  iconBg: "#0284C7", iconShadow: "#0369A1", bg: "from-primary/20 to-bg" },
  { heading: "You crushed it!", sub: "That was an amazing session!",   Icon: Trophy, iconBg: "#22C55E", iconShadow: "#16a34a", bg: "from-success/25 to-bg" },
];

function stars(avg: number) {
  if (avg >= 85) return 3;
  if (avg >= 70) return 2;
  return 1;
}

export default function ReportCardPage() {
  const router = useRouter();
  const [result,  setResult]  = useState<SessionResult | null>(null);
  const [name,    setName]    = useState("you");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("legacypp_session");
    const prof    = localStorage.getItem("legacypp_profile");
    if (!session || !prof) { router.replace("/"); return; }
    setResult(JSON.parse(session));
    setName(JSON.parse(prof).childName || "you");
    // Slight delay so animations fire after mount
    setTimeout(() => setVisible(true), 50);
  }, [router]);

  if (!result) return null;

  const { scores } = result;
  const avg  = Math.round((scores.pronunciation + scores.fluency + scores.articulation + scores.confidence) / 4);
  const s    = stars(avg);
  const info = BY_STARS[s - 1];
  const xpGained = result.promptsCompleted * 10 + (s * 5);

  const entries = Object.entries(scores) as [keyof SessionScore, number][];
  const weakest = entries.reduce((a, b) => b[1] < a[1] ? b : a)[0];

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Celebration hero ──────────────────────────────── */}
      <div className={`bg-gradient-to-b ${info.bg} pt-10 pb-8 px-5 flex flex-col items-center text-center`}>

        {/* Wavi mascot sticker */}
        <div className={`relative inline-flex items-center justify-center mb-4 ${visible ? "animate-bounce-in" : "opacity-0"}`}>
          <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center"
            style={{ backgroundColor: info.iconBg, boxShadow: `0 7px 0 ${info.iconShadow}` }}>
            <info.Icon size={52} className="text-white" strokeWidth={1.8} />
          </div>
          <Waves size={20} className="absolute -top-2 -right-2 text-accent animate-float" strokeWidth={2.5} />
          <Star size={13} className="absolute -bottom-1 -left-2 text-warning fill-warning animate-float" style={{ animationDelay: "0.4s" }} />
        </div>

        {/* Heading */}
        <h1
          className={`font-heading font-extrabold text-4xl text-text mb-1 ${visible ? "animate-pop-up" : "opacity-0"}`}
          style={{ animationDelay: "0.15s" }}
        >
          {info.heading}
        </h1>
        <p
          className={`font-body text-muted text-base mb-5 ${visible ? "animate-pop-up" : "opacity-0"}`}
          style={{ animationDelay: "0.25s" }}
        >
          {name} completed {result.promptsCompleted} of {result.totalPrompts} phrases
        </p>

        {/* Stars row */}
        <div
          className={`flex gap-3 mb-6 ${visible ? "animate-pop-up" : "opacity-0"}`}
          style={{ animationDelay: "0.3s" }}
        >
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              size={52}
              strokeWidth={1.5}
              className={`transition-all ${
                n <= s
                  ? "text-accent fill-accent drop-shadow-[0_3px_8px_rgba(245,158,11,0.5)]"
                  : "text-border fill-border"
              } ${visible && n <= s ? `animate-star-pop delay-${n * 100}` : ""}`}
            />
          ))}
        </div>

        {/* XP badge */}
        <div
          className={`flex items-center gap-3 bg-surface border-2 border-accent/30 rounded-2xl px-6 py-3 shadow-md ${visible ? "animate-slide-up" : "opacity-0"}`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_3px_0_#d97706]">
            <Star size={20} className="text-white fill-white" />
          </div>
          <div className="text-left">
            <p className="font-heading font-extrabold text-2xl text-accent">+{xpGained} XP</p>
            <p className="font-body text-xs text-muted">Great session, {name}!</p>
          </div>
        </div>
      </div>

      {/* ── Score breakdown ────────────────────────────────── */}
      <div className="flex-1 px-5 pt-6 pb-8 max-w-lg mx-auto w-full space-y-4">

        {/* Skill scores */}
        <div className="bg-surface rounded-3xl border-2 border-border p-5 shadow-sm">
          <h2 className="font-heading font-extrabold text-lg text-text mb-4">How did you do?</h2>
          <div className="space-y-4">
            <ProgressBar value={scores.pronunciation} label="Clarity"       color="primary"   />
            <ProgressBar value={scores.fluency}       label="Smoothness"    color="success"   />
            <ProgressBar value={scores.articulation}  label="Articulation"  color="secondary" />
            <ProgressBar value={scores.confidence}    label="Confidence"    color="accent"    />
          </div>
          <div className="mt-4 pt-4 border-t-2 border-border flex items-center justify-between">
            <span className="font-body text-muted text-sm">Overall score</span>
            <span className="font-heading font-extrabold text-3xl text-primary">{avg}%</span>
          </div>
        </div>

        {/* Next drill */}
        <div className="bg-accent/8 border-2 border-accent/30 rounded-3xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-[0_3px_0_#d97706] mt-0.5">
            <Target size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-heading font-extrabold text-sm text-accent uppercase tracking-wide mb-1">
              Next Drill
            </p>
            <p className="font-body text-sm text-text leading-relaxed">
              {NEXT_DRILLS[weakest]}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => router.push("/child/home")}
            className="btn-3d flex items-center justify-center gap-2 bg-surface border-2 border-border text-text py-4 rounded-2xl font-heading font-bold text-sm shadow-[0_3px_0_#CBD5E1] hover:border-primary hover:text-primary"
          >
            <Home size={18} /> Home
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="btn-3d flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-heading font-extrabold text-sm shadow-[0_4px_0_#0369A1]"
          >
            <RotateCcw size={16} /> Play Again <ChevronRight size={16} />
          </button>
        </div>

        {/* Parent link */}
        <p className="text-center text-sm font-body text-muted">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="text-primary font-semibold hover:underline underline-offset-2"
          >
            View parent dashboard →
          </button>
        </p>
      </div>
    </div>
  );
}
