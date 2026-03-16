"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowLeft,
  Star,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getWeekHistory, getLatestSession } from "@/lib/db";
import { Card, CardTitle } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";

interface DayEntry {
  day: string;
  score: number;
  completed: boolean;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildWeekGrid(
  rawHistory: { started_at: string; session_scores: { overall: number }[] }[]
): DayEntry[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const label = i === 6 ? "Today" : DAY_LABELS[d.getDay()];
    const dateStr = d.toISOString().split("T")[0];

    const session = rawHistory.find((s) =>
      s.started_at.startsWith(dateStr)
    );
    const score = session?.session_scores?.[0]?.overall ?? 0;

    return { day: label, score, completed: !!session };
  });
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [childId, setChildId] = useState<string | null>(null);
  const [weekHistory, setWeekHistory] = useState<DayEntry[]>([]);
  const [latestSession, setLatestSession] = useState<{
    scores: { pronunciation: number; fluency: number; articulation: number; confidence: number };
    prompts_completed: number;
    total_prompts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const streak = typeof window !== "undefined"
    ? parseInt(localStorage.getItem("legacypp_streak") || "0")
    : 0;
  const totalStars = typeof window !== "undefined"
    ? parseInt(localStorage.getItem("legacypp_stars") || "0")
    : 0;

  useEffect(() => {
    const stored = localStorage.getItem("legacypp_profile");
    if (!stored) { router.replace("/"); return; }

    const profile = JSON.parse(stored);
    setChildName(profile.childName ?? "");
    setParentName(profile.parentName ?? "");
    setChildId(profile.childId ?? null);

    if (!profile.childId) { setLoading(false); return; }

    Promise.all([
      getWeekHistory(profile.childId),
      getLatestSession(profile.childId),
    ])
      .then(([history, latest]) => {
        setWeekHistory(buildWeekGrid(history as Parameters<typeof buildWeekGrid>[0]));
        if (latest?.session_scores?.[0]) {
          setLatestSession({
            scores: latest.session_scores[0],
            prompts_completed: latest.prompts_completed,
            total_prompts: latest.total_prompts,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const sessionsCompleted = weekHistory.filter((d) => d.completed).length;
  const avgScore =
    sessionsCompleted > 0
      ? Math.round(
          weekHistory
            .filter((d) => d.completed)
            .reduce((a, b) => a + b.score, 0) / sessionsCompleted
        )
      : 0;

  const handleSignOut = async () => {
    await signOut();
    localStorage.clear();
    router.replace("/auth");
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/child/home")}
              className="text-muted hover:text-primary transition-colors p-1"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="font-heading font-bold text-2xl text-text">
                Parent Dashboard
              </h1>
              <p className="text-muted text-sm font-body">
                {parentName && `Hi ${parentName} · `}{childName}&apos;s progress
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-muted hover:text-error transition-colors p-1"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: <Flame className="text-warning" size={20} />,
                  label: "Day streak",
                  value: String(streak),
                },
                {
                  icon: <CheckCircle2 className="text-success" size={20} />,
                  label: "This week",
                  value: `${sessionsCompleted}/7`,
                },
                {
                  icon: <TrendingUp className="text-primary" size={20} />,
                  label: "Avg score",
                  value: avgScore ? `${avgScore}%` : "—",
                },
                {
                  icon: <Star className="text-accent" size={20} />,
                  label: "Stars earned",
                  value: String(totalStars),
                },
              ].map((stat) => (
                <Card key={stat.label} className="flex flex-col gap-1 py-4">
                  <div className="flex items-center gap-1.5 text-muted text-xs font-body">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <p className="font-heading font-bold text-2xl text-text">
                    {stat.value}
                  </p>
                </Card>
              ))}
            </div>

            {/* Weekly bar chart */}
            <Card elevated className="mb-6">
              <CardTitle className="mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                This Week&apos;s Practice
              </CardTitle>
              <div className="flex items-end gap-2 h-28">
                {weekHistory.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${
                          d.completed ? "bg-primary" : "bg-border"
                        }`}
                        style={{
                          height: d.completed ? `${(d.score / 100) * 80}px` : "4px",
                        }}
                      />
                    </div>
                    <span className="text-xs font-data text-muted">{d.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Latest session scores */}
            {latestSession && (
              <Card elevated className="mb-6">
                <CardTitle className="mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-secondary" />
                  Latest Session
                </CardTitle>
                <div className="space-y-3">
                  <ProgressBar value={latestSession.scores.pronunciation} label="Clarity" color="primary" />
                  <ProgressBar value={latestSession.scores.fluency} label="Smoothness" color="success" />
                  <ProgressBar value={latestSession.scores.articulation} label="Articulation" color="secondary" />
                  <ProgressBar value={latestSession.scores.confidence} label="Confidence" color="accent" />
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs font-body text-muted">
                  {latestSession.prompts_completed} of {latestSession.total_prompts} prompts completed
                </div>
              </Card>
            )}

            {/* Top sounds */}
            <Card className="mb-6">
              <CardTitle className="mb-3">Top Sounds This Week</CardTitle>
              <div className="flex flex-wrap gap-2">
                {["R", "S", "L", "SH", "TH"].map((sound) => (
                  <span
                    key={sound}
                    className="bg-primary/10 text-primary text-sm font-data font-bold px-3 py-1 rounded-full"
                  >
                    {sound}
                  </span>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => router.push("/child/home")}>
                Back to Home
              </Button>
              <Button size="lg" className="flex-1" onClick={() => router.push("/practice")}>
                Start Practice <ChevronRight size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
