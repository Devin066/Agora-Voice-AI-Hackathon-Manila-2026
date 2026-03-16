"use client";

import { ScenarioPanel } from "@/components/ScenarioPanel";
import { SuggestionPanel } from "@/components/SuggestionPanel";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TrainingPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(true);
  const usecase = searchParams.get("usecase") ?? "Practice Job Interview";
  const aiCaption = "Hi, Welcome to your interview! First lets introduce yourself.";

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSpeaking((current) => !current);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-transparent px-6 py-8 text-[#183B56] md:px-10 lg:px-14">
      <main className="mx-auto grid max-w-7xl gap-6 rounded-xl bg-white p-6 shadow-[0_18px_40px_rgba(24,59,86,0.08)] lg:grid-cols-12 lg:p-8">
        <section className="flex min-h-[80vh] flex-col gap-6 lg:col-span-7">
          <ScenarioPanel scenario={usecase} />
          <SuggestionPanel suggestion="Introduce yourself, highlight your past experience..." />
        </section>
        <section className="rounded-xl bg-[#F8F9FA] p-6 ring-1 ring-[#1C4E78]/12 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-[#E2B34B]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              AI Voice Agent
            </span>
            <span className="rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Live
            </span>
          </div>
          <div className="flex min-h-[62vh] items-center justify-center rounded-xl bg-gradient-to-br from-[#183B56] via-[#1C4E78] to-[#5C9EAD]">
            <VoiceAvatar isSpeaking={isSpeaking} />
          </div>
          <div className="mt-4 rounded-lg bg-white/85 p-4">
            <span className="rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Transcriber
            </span>
            <p className="mt-3 text-base font-medium leading-relaxed text-[#183B56]">
              {aiCaption}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/feedback/${params.sessionId ?? "session-demo"}`)}
            className="mt-4 w-full rounded-md bg-[#D95C50] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#c94c42]"
          >
            End Session & View Feedback
          </button>
        </section>
      </main>
    </div>
  );
}
