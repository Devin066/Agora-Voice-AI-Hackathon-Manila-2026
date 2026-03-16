"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Star, ChevronRight, Volume2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Profile {
  childName: string;
  childAge: number;
  parentName: string;
}

const GREETINGS = ["Hey there", "Welcome back", "Ready to practice", "Let's go"];

export default function ChildHomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [greeting] = useState(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);

  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("legacypp_profile");
    if (!stored) {
      router.replace("/");
      return;
    }
    setProfile(JSON.parse(stored));
    setStreak(parseInt(localStorage.getItem("legacypp_streak") || "0"));
    setTotalStars(parseInt(localStorage.getItem("legacypp_stars") || "0"));
  }, [router]);

  if (!profile) return null;

  const ageBand =
    profile.childAge <= 7
      ? "early"
      : profile.childAge <= 10
      ? "growing"
      : "preteen";

  const missionTitle =
    ageBand === "early"
      ? "Say 5 words clearly!"
      : ageBand === "growing"
      ? "Practice 5 phrases"
      : "Complete today's drill";

  const mascotEmoji =
    ageBand === "early" ? "🦕" : ageBand === "growing" ? "🦊" : "🚀";

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Mascot greeting */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-bounce">{mascotEmoji}</div>
          <h1 className="font-heading font-extrabold text-3xl text-text">
            {greeting}, <span className="text-primary">{profile.childName}!</span>
          </h1>
          <p className="text-muted font-body mt-1">
            Your voice is getting stronger every day!
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-6">
          <Card className="flex-1 flex items-center gap-3 py-4">
            <Flame className="text-warning shrink-0" size={24} />
            <div>
              <p className="text-xs font-body text-muted">Streak</p>
              <p className="font-heading font-bold text-xl text-text">
                {streak} day{streak !== 1 ? "s" : ""}
              </p>
            </div>
          </Card>
          <Card className="flex-1 flex items-center gap-3 py-4">
            <Star className="text-accent shrink-0" size={24} />
            <div>
              <p className="text-xs font-body text-muted">Stars earned</p>
              <p className="font-heading font-bold text-xl text-text">
                {totalStars}
              </p>
            </div>
          </Card>
        </div>

        {/* Mission card */}
        <Card
          elevated
          className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="inline-block bg-accent/20 text-accent text-xs font-body font-semibold px-2 py-0.5 rounded-full mb-2">
                TODAY&apos;S MISSION
              </span>
              <h2 className="font-heading font-bold text-xl text-text">
                {missionTitle}
              </h2>
            </div>
            <Volume2 className="text-primary mt-1 shrink-0" size={20} />
          </div>
          <p className="text-muted text-sm font-body mb-4">
            {ageBand === "early"
              ? "Listen, then say each word out loud. You can do it!"
              : ageBand === "growing"
              ? "Read the phrase and say it clearly. Try your best!"
              : "Focus on pronunciation and fluency. Push yourself!"}
          </p>
          <div className="flex items-center gap-2 text-xs font-data text-muted">
            <span className="w-2 h-2 rounded-full bg-primary" />
            5 prompts · ~5 minutes
          </div>
        </Card>

        {/* CTA */}
        <Button
          size="xl"
          className="w-full"
          onClick={() => router.push("/practice")}
        >
          Start Practice <ChevronRight size={22} />
        </Button>

        {/* Parent link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/parent/dashboard")}
            className="text-sm font-body text-muted hover:text-primary transition-colors underline underline-offset-2"
          >
            Parent dashboard →
          </button>
        </div>
      </div>
    </main>
  );
}
