"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ChevronRight, Waves, TrendingUp, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { saveConsent, saveChildProfile, getChildProfile, hasConsent } from "@/lib/db";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { StoredProfile } from "@/types";

type Step = "loading" | "landing" | "consent" | "profile";

export default function ParentGatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>("loading");
  const [consentGiven, setConsentGiven] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentName, setParentName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/auth"); return; }

    (async () => {
      const [profile, consent] = await Promise.all([
        getChildProfile(user.id),
        hasConsent(user.id),
      ]);

      if (profile && consent) {
        const stored: StoredProfile = {
          childId: profile.id,
          childName: profile.name,
          childAge: profile.age,
          parentName: "",
        };
        localStorage.setItem("legacypp_profile", JSON.stringify(stored));
        router.replace("/child/home");
      } else if (!consent) {
        setStep("landing");
      } else {
        setStep("profile");
      }
    })();
  }, [user, authLoading, router]);

  const handleConsent = async () => {
    if (!consentGiven || !user) return;
    setSaving(true);
    setError("");
    try {
      await saveConsent(user.id, parentName || "Parent");
      setStep("profile");
    } catch {
      setError("Could not save consent. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    if (!childName || !childAge || !user) return;
    setSaving(true);
    setError("");
    try {
      const profile = await saveChildProfile(user.id, childName, parseInt(childAge));
      const stored: StoredProfile = {
        childId: profile.id,
        childName: profile.name,
        childAge: profile.age,
        parentName,
      };
      localStorage.setItem("legacypp_profile", JSON.stringify(stored));
      if (!localStorage.getItem("legacypp_level")) {
        localStorage.setItem("legacypp_level", "1");
      }
      router.push("/child/home");
    } catch {
      setError("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (step === "loading") {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </main>
    );
  }

  if (step === "landing") {
    return (
      <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-body font-semibold mb-6">
            <Waves size={16} />
            Powered by Agora Voice AI
          </div>
          <h1 className="font-heading font-extrabold text-5xl text-text mb-4 leading-tight">
            Speech practice that{" "}
            <span className="text-primary">feels like play</span>
          </h1>
          <p className="text-muted text-lg font-body leading-relaxed mb-8">
            Alon helps children ages 5–13 practice speech at home with
            instant, encouraging AI feedback — so every voice gets a chance to
            shine.
          </p>
          <Button size="xl" onClick={() => setStep("consent")}>
            Get Started <ChevronRight size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            { icon: <Waves className="text-primary" size={28} />, title: "Real-Time Voice AI", desc: "Instant pronunciation feedback after every attempt — friendly, never punishing." },
            { icon: <TrendingUp className="text-success" size={28} />, title: "Progress Tracking", desc: "Weekly trend charts and session report cards parents can actually understand." },
            { icon: <Heart className="text-error" size={28} />, title: "Child-Safe by Design", desc: "Parent consent gate, role-based access, and data deletion on request." },
          ].map((f) => (
            <Card key={f.title} elevated className="text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-heading font-bold text-text mb-2">{f.title}</h3>
              <p className="text-muted text-sm font-body">{f.desc}</p>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (step === "consent") {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
        <Card elevated className="max-w-lg w-full">
          <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3 mb-6">
            <ShieldCheck className="text-success shrink-0" size={22} />
            <p className="text-sm font-body text-success font-medium">
              Your child&apos;s data is encrypted, never sold, and deletable on request.
            </p>
          </div>

          <h2 className="font-heading font-bold text-2xl text-text mb-2">Parent Consent</h2>
          <p className="text-muted font-body mb-4 text-sm leading-relaxed">
            Alon is an assistive practice tool — not a medical device or diagnostic authority.
            By continuing, you confirm you are the parent or legal guardian.
          </p>

          <div className="mb-4">
            <Input
              label="Your name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="e.g. Maria Santos"
            />
          </div>

          <ul className="space-y-2 mb-6 text-sm font-body text-muted">
            {[
              "Audio is processed in real-time to generate feedback only",
              "No audio recordings are stored permanently",
              "You can delete all data at any time from the dashboard",
              "Children under 13 require parent supervision",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-success mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-primary cursor-pointer"
            />
            <span className="text-sm font-body text-text">
              I am the parent/guardian and I consent to my child using Alon under my supervision.
            </span>
          </label>

          {error && <p className="text-error text-sm font-body mb-4">{error}</p>}

          <Button size="lg" className="w-full" disabled={!consentGiven || saving} onClick={handleConsent}>
            {saving ? "Saving…" : "Continue"} <ChevronRight size={18} />
          </Button>
        </Card>
      </main>
    );
  }

  // Profile step
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <Card elevated className="max-w-lg w-full">
        <h2 className="font-heading font-bold text-2xl text-text mb-1">
          Set Up Your Child&apos;s Profile
        </h2>
        <p className="text-muted font-body text-sm mb-6">
          This helps us tailor the session to the right age level.
        </p>

        <div className="space-y-4">
          <Input
            label="Child's first name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="e.g. Luisa"
          />

          <div>
            <label className="block text-sm font-body font-semibold text-text mb-1">
              Child&apos;s age
            </label>
            <select
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface transition-shadow duration-150"
            >
              <option value="">Select age…</option>
              {Array.from({ length: 9 }, (_, i) => i + 5).map((age) => (
                <option key={age} value={age}>{age} years old</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-error text-sm font-body mt-3">{error}</p>}

        <Button
          size="lg"
          className="w-full mt-6"
          disabled={!childName || !childAge || saving}
          onClick={handleStart}
        >
          {saving ? "Saving…" : "Start Practice Session"} <ChevronRight size={18} />
        </Button>
      </Card>
    </main>
  );
}
