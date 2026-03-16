"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame, Star, Play, Lock,
  Home, BookOpen, Trophy, User, Users, ChevronRight,
  Volume2, Waves, Wind, Leaf, Zap,
  Mic, Target, Award, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  childName: string;
  childAge: number;
  parentName: string;
}

type Tab = "home" | "lessons" | "rewards" | "profile";

const LEVELS = [
  { id: 1, label: "R Sounds",     Icon: Volume2, color: "#0EA5A6", shadow: "#0b8a8b", bg: "#E0F7F7", bgIcon: "#0EA5A6", active: true,  desc: "Practice the R sound",      examples: ["red","rabbit","run"] },
  { id: 2, label: "S Sounds",     Icon: Waves,   color: "#F97316", shadow: "#ea580c", bg: "#FFF0E8", bgIcon: "#F97316", active: false, desc: "Master the S sound",        examples: ["sun","sea","sing"] },
  { id: 3, label: "L & SH",       Icon: Wind,    color: "#F59E0B", shadow: "#d97706", bg: "#FFFBE8", bgIcon: "#F59E0B", active: false, desc: "L and SH together",         examples: ["shell","she","like"] },
  { id: 4, label: "TH Sounds",    Icon: Leaf,    color: "#22C55E", shadow: "#16a34a", bg: "#E8FFF0", bgIcon: "#22C55E", active: false, desc: "The tricky TH sound",       examples: ["three","think","this"] },
  { id: 5, label: "Mix & Master", Icon: Zap,     color: "#6366F1", shadow: "#4f46e5", bg: "#F0EEFF", bgIcon: "#6366F1", active: false, desc: "Combine everything!",       examples: ["mix","all","sounds"] },
];

const BADGE_COLORS = ["#0EA5A6","#F97316","#F59E0B","#6366F1","#22C55E","#EC4899"];
const BADGES = [
  { id: 1, Icon: Mic,    label: "First Try!",    desc: "Finish your first session",  minStars: 1  },
  { id: 2, Icon: Flame,  label: "On Fire!",      desc: "Practice 3 days in a row",   minStreak: 3 },
  { id: 3, Icon: Star,   label: "Star Power",    desc: "Earn 10 stars total",         minStars: 10 },
  { id: 4, Icon: Trophy, label: "Level Up!",     desc: "Complete Level 1",            minStars: 5  },
  { id: 5, Icon: Target, label: "Sharp!",        desc: "Score 90%+ in a session",     minStars: 15 },
  { id: 6, Icon: Award,  label: "Champion",      desc: "Practice 5 days in a row",    minStreak: 5 },
];

const TABS: { key: Tab; icon: React.ElementType; label: string }[] = [
  { key: "home",    icon: Home,     label: "Home"    },
  { key: "lessons", icon: BookOpen, label: "Lessons" },
  { key: "rewards", icon: Trophy,   label: "Rewards" },
  { key: "profile", icon: User,     label: "Profile" },
];

export default function ChildHomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak]   = useState(0);
  const [stars,  setStars]    = useState(0);
  const [tab,    setTab]      = useState<Tab>("home");

  useEffect(() => {
    const raw = localStorage.getItem("legacypp_profile");
    if (!raw) { router.replace("/"); return; }
    setProfile(JSON.parse(raw));
    setStreak(parseInt(localStorage.getItem("legacypp_streak") || "0"));
    setStars(parseInt(localStorage.getItem("legacypp_stars")  || "0"));
  }, [router]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="bg-surface border-b-2 border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_3px_0_#0b8a8b]">
            <Mic size={18} className="text-white fill-white" />
          </div>
          <span className="font-heading font-extrabold text-lg text-text">
            Legacy<span className="text-primary">++</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-warning/15 border-2 border-warning/30 text-warning px-3 py-1.5 rounded-xl">
            <Flame size={16} className="fill-warning" />
            <span className="font-heading font-extrabold text-sm">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-accent/15 border-2 border-accent/30 text-accent px-3 py-1.5 rounded-xl">
            <Star size={16} className="fill-accent" />
            <span className="font-heading font-extrabold text-sm">{stars}</span>
          </div>
        </div>
      </header>

      {/* ── Main scrollable content ─────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 px-5 pt-6">
        {tab === "home"    && <HomeTab    name={profile.childName} streak={streak} stars={stars} onStart={() => router.push("/practice")} />}
        {tab === "lessons" && <LessonsTab onStart={() => router.push("/practice")} />}
        {tab === "rewards" && <RewardsTab streak={streak} stars={stars} />}
        {tab === "profile" && <ProfileTab profile={profile} streak={streak} stars={stars} onParent={() => router.push("/parent/dashboard")} />}
      </main>

      {/* ── Bottom tab bar ──────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-border flex z-50">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative"
          >
            {tab === t.key && (
              <div className="absolute top-1.5 w-10 h-7 bg-primary/10 rounded-xl" />
            )}
            <t.icon
              size={22}
              strokeWidth={tab === t.key ? 2.5 : 1.8}
              className={cn("relative z-10", tab === t.key ? "text-primary" : "text-muted")}
            />
            <span className={cn(
              "text-[11px] font-heading font-bold leading-none relative z-10",
              tab === t.key ? "text-primary" : "text-muted"
            )}>
              {t.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ─── Home Tab ──────────────────────────────────────────────── */
function HomeTab({ name, streak, stars, onStart }: { name: string; streak: number; stars: number; onStart: () => void }) {
  const activeLevel = LEVELS.find((l) => l.active)!;
  const ActiveIcon  = activeLevel.Icon;

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">

      {/* Sparky mascot greeting */}
      <div className="text-center mb-8 animate-pop-up w-full">
        {/* Mascot: animated mic icon with sparkle ring */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_6px_0_#0b8a8b] animate-bounce-in">
            <Mic size={44} className="text-white fill-white" strokeWidth={1.5} />
          </div>
          {/* sparkle corners */}
          <Sparkles size={18} className="absolute -top-2 -right-2 text-accent fill-accent animate-float" />
          <Star size={12} className="absolute -bottom-1 -left-2 text-warning fill-warning animate-float" style={{ animationDelay: "0.4s" }} />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-text">
          Hey, <span className="text-primary">{name}!</span>
        </h1>
        <p className="text-muted font-body mt-1">Ready for today&apos;s speech mission?</p>
      </div>

      {/* Quick stats pills */}
      <div className="flex gap-3 w-full mb-6">
        <div className="flex-1 flex items-center gap-3 bg-warning/10 border-2 border-warning/25 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center shadow-[0_3px_0_#b45309] shrink-0">
            <Flame size={20} className="text-white fill-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-2xl text-warning leading-none">{streak}</div>
            <div className="text-xs font-body text-muted">Day Streak</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-accent/10 border-2 border-accent/25 rounded-2xl px-4 py-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_3px_0_#b45309] shrink-0">
            <Star size={20} className="text-white fill-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-2xl text-accent leading-none">{stars}</div>
            <div className="text-xs font-body text-muted">Stars Earned</div>
          </div>
        </div>
      </div>

      {/* Today's Challenge card */}
      <div
        className="w-full rounded-3xl border-2 p-5 mb-6 shadow-md relative overflow-hidden"
        style={{ backgroundColor: activeLevel.bg, borderColor: activeLevel.color + "55" }}
      >
        {/* decorative bg circle */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: activeLevel.color }}
        />
        <p className="text-xs font-heading font-extrabold uppercase tracking-widest mb-3"
          style={{ color: activeLevel.color }}>
          Today&apos;s Challenge
        </p>
        <div className="flex items-center gap-4">
          {/* big icon sticker */}
          <div
            className="w-20 h-20 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-[0_4px_0_rgba(0,0,0,0.15)] animate-float"
            style={{ backgroundColor: activeLevel.bgIcon }}
          >
            <ActiveIcon size={36} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-extrabold text-text text-xl leading-tight">
              {activeLevel.label}
            </p>
            <p className="text-sm font-body text-muted mt-0.5">{activeLevel.desc}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeLevel.examples.map((ex) => (
                <span
                  key={ex}
                  className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full"
                  style={{ color: activeLevel.color, backgroundColor: activeLevel.color + "18", border: `1.5px solid ${activeLevel.color}44` }}
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="btn-3d w-full bg-primary text-white rounded-2xl py-5 font-heading font-extrabold text-xl shadow-[0_5px_0_#0b8a8b] flex items-center justify-center gap-3"
      >
        <Play className="fill-white text-white" size={24} />
        Start Practice!
      </button>
    </div>
  );
}

/* ─── Lessons Tab ───────────────────────────────────────────── */
function LessonsTab({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading font-extrabold text-2xl text-text mb-1">All Lessons</h2>
      <p className="text-muted font-body text-sm mb-6">Complete each level to unlock the next one!</p>

      <div className="space-y-3">
        {LEVELS.map((level) => {
          const LevelIcon = level.Icon;
          return (
            <div
              key={level.id}
              className={cn(
                "rounded-3xl border-2 p-4 flex items-center gap-4 transition-all",
                level.active ? "shadow-md" : "border-border bg-surface/70 opacity-60"
              )}
              style={level.active ? { borderColor: level.color + "55", backgroundColor: level.bg } : {}}
            >
              {/* Icon sticker */}
              <div
                className={cn(
                  "w-16 h-16 rounded-[1rem] flex items-center justify-center shrink-0",
                  level.active ? "shadow-[0_3px_0_rgba(0,0,0,0.15)]" : "bg-border/40"
                )}
                style={level.active ? { backgroundColor: level.bgIcon } : {}}
              >
                <LevelIcon
                  size={28}
                  strokeWidth={1.5}
                  className={level.active ? "text-white" : "text-muted"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-data font-extrabold uppercase tracking-wide"
                    style={{ color: level.active ? level.color : "#94a3b8" }}>
                    Level {level.id}
                  </span>
                  {level.active && (
                    <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: level.color }}>
                      ACTIVE
                    </span>
                  )}
                  {!level.active && <Lock size={11} className="text-muted" />}
                </div>
                <p className="font-heading font-extrabold text-text text-base">{level.label}</p>
                <p className="text-xs font-body text-muted mt-0.5">{level.desc}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {level.examples.map((ex) => (
                    <span key={ex}
                      className="text-[11px] font-heading font-bold px-2 py-0.5 rounded-full"
                      style={level.active
                        ? { color: level.color, backgroundColor: level.color + "15", border: `1.5px solid ${level.color}44` }
                        : { color: "#94a3b8", border: "1.5px solid #cbd5e1" }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              {level.active ? (
                <button
                  onClick={onStart}
                  className="btn-3d shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: level.color, boxShadow: `0 4px 0 ${level.shadow}` }}
                >
                  <Play className="text-white fill-white ml-0.5" size={20} />
                </button>
              ) : (
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-border/50 flex items-center justify-center">
                  <Lock size={16} className="text-muted" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Rewards Tab ───────────────────────────────────────────── */
function RewardsTab({ streak, stars }: { streak: number; stars: number }) {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-heading font-extrabold text-2xl text-text mb-6">My Rewards</h2>

      {/* Big stat stickers */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-warning/10 border-2 border-warning/30 rounded-3xl p-5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-warning flex items-center justify-center shadow-[0_4px_0_#b45309] mb-3 animate-float">
            <Flame size={32} className="text-white fill-white" />
          </div>
          <div className="font-heading font-extrabold text-4xl text-warning">{streak}</div>
          <div className="font-body text-sm text-muted mt-1">Day Streak</div>
        </div>
        <div className="bg-accent/10 border-2 border-accent/30 rounded-3xl p-5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-[0_4px_0_#b45309] mb-3 animate-float" style={{ animationDelay: "0.3s" }}>
            <Star size={32} className="text-white fill-white" />
          </div>
          <div className="font-heading font-extrabold text-4xl text-accent">{stars}</div>
          <div className="font-body text-sm text-muted mt-1">Stars Earned</div>
        </div>
      </div>

      {/* Badge grid */}
      <h3 className="font-heading font-extrabold text-lg text-text mb-4">Badges</h3>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((badge, i) => {
          const earned =
            ("minStars"  in badge && stars  >= (badge.minStars  ?? 0)) ||
            ("minStreak" in badge && streak >= (badge.minStreak ?? 0));
          const BadgeIcon = badge.Icon;
          const color     = BADGE_COLORS[i % BADGE_COLORS.length];
          return (
            <div
              key={badge.id}
              className={cn(
                "rounded-3xl border-2 p-4 flex items-center gap-3 transition-all",
                earned ? "shadow-md" : "border-border bg-surface opacity-50 grayscale"
              )}
              style={earned ? { borderColor: color + "44", backgroundColor: color + "0E" } : {}}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={earned
                  ? { backgroundColor: color, boxShadow: `0 3px 0 ${color}88` }
                  : { backgroundColor: "#E2E8F0" }}
              >
                <BadgeIcon size={26} className={earned ? "text-white" : "text-muted"} strokeWidth={earned ? 2 : 1.5} />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-extrabold text-sm text-text leading-tight">
                  {badge.label}
                </p>
                <p className="font-body text-xs text-muted mt-0.5 leading-tight">
                  {badge.desc}
                </p>
                {earned && (
                  <span className="text-[10px] font-heading font-bold text-white px-1.5 py-0.5 rounded-full mt-1 inline-block"
                    style={{ backgroundColor: color }}>
                    EARNED
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Profile Tab ───────────────────────────────────────────── */
function ProfileTab({
  profile,
  streak,
  stars,
  onParent,
}: {
  profile: Profile;
  streak: number;
  stars: number;
  onParent: () => void;
}) {
  const initials = profile.childName.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-lg mx-auto">

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-3xl p-6 flex items-center gap-5 mb-4">
        {/* initials avatar with ring */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-[0_5px_0_#0b8a8b]">
            <span className="font-heading font-extrabold text-3xl text-white">{initials}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-accent flex items-center justify-center shadow-sm border-2 border-surface">
            <Sparkles size={13} className="text-white fill-white" />
          </div>
        </div>
        <div>
          <p className="font-heading font-extrabold text-2xl text-text">{profile.childName}</p>
          <p className="font-body text-muted mt-0.5">Age {profile.childAge}</p>
          {profile.parentName && (
            <p className="font-body text-sm text-muted mt-1 flex items-center gap-1.5">
              <Users size={13} className="shrink-0 text-muted" />
              {profile.parentName}&apos;s child
            </p>
          )}
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-warning/10 border-2 border-warning/25 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning flex items-center justify-center shadow-[0_2px_0_#b45309]">
            <Flame size={17} className="text-white fill-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-warning">{streak}</div>
            <div className="text-xs font-body text-muted">Streak</div>
          </div>
        </div>
        <div className="bg-accent/10 border-2 border-accent/25 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-[0_2px_0_#b45309]">
            <Star size={17} className="text-white fill-white" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xl text-accent">{stars}</div>
            <div className="text-xs font-body text-muted">Stars</div>
          </div>
        </div>
      </div>

      {/* Parent Dashboard CTA */}
      <button
        onClick={onParent}
        className="btn-3d w-full bg-secondary text-white rounded-2xl py-4 font-heading font-extrabold text-base shadow-[0_4px_0_#4f46e5] flex items-center justify-center gap-2"
      >
        <Users size={20} />
        View Parent Dashboard
        <ChevronRight size={18} />
      </button>

      <p className="text-center text-xs font-body text-muted mt-3">
        Ask a parent to open the dashboard for you
      </p>
    </div>
  );
}
