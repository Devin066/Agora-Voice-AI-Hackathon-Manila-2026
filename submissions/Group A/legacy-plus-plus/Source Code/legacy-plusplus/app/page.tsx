"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronRight,
  Mic,
  TrendingUp,
  Heart,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ParentGatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"landing" | "consent" | "profile">("landing");
  const [consentGiven, setConsentGiven] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentName, setParentName] = useState("");

  const handleConsent = () => {
    if (!consentGiven) return;
    setStep("profile");
  };

  const handleStart = () => {
    if (!childName || !childAge || !parentName) return;
    localStorage.setItem(
      "legacypp_profile",
      JSON.stringify({ childName, childAge: parseInt(childAge), parentName })
    );
    router.push("/child/home");
  };

  if (step === "landing") {
    return (
      <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-body font-semibold mb-6">
            <Mic size={16} />
            Powered by Agora Voice AI
          </div>
          <h1 className="font-heading font-extrabold text-5xl text-text mb-4 leading-tight">
            Speech practice that{" "}
            <span className="text-primary">feels like play</span>
          </h1>
          <p className="text-muted text-lg font-body leading-relaxed mb-8">
            Legacy++ helps children ages 5–13 practice speech at home with
            instant, encouraging AI feedback — so every voice gets a chance to
            shine.
          </p>
          <Button size="xl" onClick={() => setStep("consent")}>
            Get Started <ChevronRight size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            {
              icon: <Mic className="text-primary" size={28} />,
              title: "Real-Time Voice AI",
              desc: "Instant pronunciation feedback after every attempt — friendly, never punishing.",
            },
            {
              icon: <TrendingUp className="text-success" size={28} />,
              title: "Progress Tracking",
              desc: "Weekly trend charts and session report cards parents can actually understand.",
            },
            {
              icon: <Heart className="text-error" size={28} />,
              title: "Child-Safe by Design",
              desc: "Parent consent gate, role-based access, and data deletion on request.",
            },
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
          <div className="flex items-center gap-3 bg-success/10 border border-success/30 rounded-xl px-4 py-3 mb-6">
            <ShieldCheck className="text-success shrink-0" size={22} />
            <p className="text-sm font-body text-success font-medium">
              Your child&apos;s data is encrypted, never sold, and deletable on
              request.
            </p>
          </div>

          <h2 className="font-heading font-bold text-2xl text-text mb-2">
            Parent Consent
          </h2>
          <p className="text-muted font-body mb-6 text-sm leading-relaxed">
            Legacy++ is an assistive practice tool — not a medical device or
            diagnostic authority. By continuing, you confirm you are the parent
            or legal guardian of the child using this app.
          </p>

          <ul className="space-y-2 mb-6 text-sm font-body text-muted">
            {[
              "Audio is processed in real-time to generate feedback only",
              "No audio recordings are stored permanently",
              "You can delete all data at any time from the dashboard",
              "Children under 13 require parent supervision",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
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
              I am the parent/guardian and I consent to my child using Legacy++
              under my supervision.
            </span>
          </label>

          <Button
            size="lg"
            className="w-full"
            disabled={!consentGiven}
            onClick={handleConsent}
          >
            Continue <ChevronRight size={18} />
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-16">
      <Card elevated className="max-w-lg w-full">
        <h2 className="font-heading font-bold text-2xl text-text mb-1">
          Set Up Your Child&apos;s Profile
        </h2>
        <p className="text-muted font-body text-sm mb-6">
          This helps us tailor the practice session to the right age level.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-body font-semibold text-text mb-1">
              Your name (parent/guardian)
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="e.g. Maria Santos"
              className="w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            />
          </div>

          <div>
            <label className="block text-sm font-body font-semibold text-text mb-1">
              Child&apos;s first name
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Luisa"
              className="w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            />
          </div>

          <div>
            <label className="block text-sm font-body font-semibold text-text mb-1">
              Child&apos;s age
            </label>
            <select
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            >
              <option value="">Select age…</option>
              {Array.from({ length: 9 }, (_, i) => i + 5).map((age) => (
                <option key={age} value={age}>
                  {age} years old
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full mt-6"
          disabled={!childName || !childAge || !parentName}
          onClick={handleStart}
        >
          Start Practice Session <ChevronRight size={18} />
        </Button>
      </Card>
    </main>
  );
}
