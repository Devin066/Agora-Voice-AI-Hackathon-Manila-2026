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
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";

interface Profile {
  childName: string;
  childAge: number;
  parentName: string;
}

interface SessionResult {
  scores: {
    pronunciation: number;
    fluency: number;
    articulation: number;
    confidence: number;
  };
  promptsCompleted: number;
  totalPrompts: number;
}

// Simulate 7-day history for demo
function generateWeekHistory(latestSession: SessionResult | null) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  return days.map((day, i) => {
    if (i === 6 && latestSession) {
      const avg = Math.round(
        (latestSession.scores.pronunciation +
          latestSession.scores.fluency +
          latestSession.scores.articulation +
          latestSession.scores.confidence) /
          4
      );
      return { day, score: avg, completed: true };
    }
    // Some days missed, some practiced
    const practiced = Math.random() > 0.3;
    return {
      day,
      score: practiced ? Math.floor(Math.random() * 25) + 65 : 0,
      completed: practiced,
    };
  });
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SessionResult | null>(null);
  const [weekHistory, setWeekHistory] = useState<
    { day: string; score: number; completed: boolean }[]
  >([]);

  useEffect(() => {
    const prof = localStorage.getItem("legacypp_profile");
    const sess = localStorage.getItem("legacypp_session");
    if (!prof) {
      router.replace("/");
      return;
    }
    const parsedProfile = JSON.parse(prof);
    const parsedSession = sess ? JSON.parse(sess) : null;
    setProfile(parsedProfile);
    setSession(parsedSession);
    setWeekHistory(generateWeekHistory(parsedSession));
  }, [router]);

  if (!profile) return null;

  const streak = typeof window !== "undefined" ? parseInt(localStorage.getItem("legacypp_streak") || "0") : 0;
  const totalStars = typeof window !== "undefined" ? parseInt(localStorage.getItem("legacypp_stars") || "0") : 0;
  const sessionsCompleted = weekHistory.filter((d) => d.completed).length;
  const avgScore =
    weekHistory.filter((d) => d.completed).length > 0
      ? Math.round(
          weekHistory
            .filter((d) => d.completed)
            .reduce((a, b) => a + b.score, 0) /
            weekHistory.filter((d) => d.completed).length
        )
      : 0;

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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
              Hi {profile.parentName} · {profile.childName}&apos;s progress
            </p>
          </div>
        </div>

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

        {/* Weekly trend chart (bar chart) */}
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
                    style={{ height: d.completed ? `${(d.score / 100) * 80}px` : "4px" }}
                  />
                </div>
                <span className="text-xs font-data text-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Latest session scores */}
        {session && (
          <Card elevated className="mb-6">
            <CardTitle className="mb-4 flex items-center gap-2">
              <Clock size={18} className="text-secondary" />
              Latest Session
            </CardTitle>
            <div className="space-y-3">
              <ProgressBar
                value={session.scores.pronunciation}
                label="Clarity"
                color="primary"
              />
              <ProgressBar
                value={session.scores.fluency}
                label="Smoothness"
                color="success"
              />
              <ProgressBar
                value={session.scores.articulation}
                label="Articulation"
                color="secondary"
              />
              <ProgressBar
                value={session.scores.confidence}
                label="Confidence"
                color="accent"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-border text-xs font-body text-muted">
              {session.promptsCompleted} of {session.totalPrompts} prompts
              completed
            </div>
          </Card>
        )}

        {/* Top sounds this week */}
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

        {/* Reminder + CTA */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={() => router.push("/child/home")}
          >
            Back to Home
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => router.push("/practice")}
          >
            Start Practice <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </main>
  );
}
