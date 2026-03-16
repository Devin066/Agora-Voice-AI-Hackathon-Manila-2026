"use client";

import { FileUploadDropzone } from "@/components/FileUploadDropzone";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function OnboardingPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const router = useRouter();
  const params = useParams<{ usecase: string }>();

  const usecase = useMemo(
    () =>
      (params.usecase ?? "")
        .split("-")
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" "),
    [params.usecase],
  );

  const canStart = Boolean(resumeFile) && jobDescription.trim().length > 0;

  const handleStartTraining = () => {
    if (!canStart) return;
    const sessionId = Date.now().toString();
    router.push(
      `/training/${sessionId}?usecase=${encodeURIComponent(usecase || "General Coaching")}`,
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(217,92,80,0.08),transparent_40%),radial-gradient(ellipse_at_top_right,rgba(226,179,75,0.10),transparent_40%),radial-gradient(ellipse_at_bottom_center,rgba(92,158,173,0.10),transparent_50%)] bg-white text-[#183B56]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 md:px-10 lg:px-16 lg:py-16">

        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1C4E78] shadow-[0_4px_12px_rgba(24,59,86,0.08)] transition hover:-translate-x-0.5 hover:shadow-[0_6px_16px_rgba(24,59,86,0.12)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Main card — two-column layout matching the home page hero */}
        <section className="grid overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_rgba(24,59,86,0.08)] lg:grid-cols-12 lg:items-stretch">

          {/* Left: form */}
          <div className="flex flex-col gap-8 px-8 py-10 lg:col-span-7 lg:px-12 lg:py-12">
            <div>
              <span className="inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
                Onboarding
              </span>
              <h1 className="mt-4 bg-gradient-to-br from-[#183B56] via-[#1C4E78] to-[#5C9EAD] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
                Set up your session
              </h1>
              {usecase ? (
                <span className="mt-3 inline-flex rounded-full bg-[#E2B34B]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
                  {usecase}
                </span>
              ) : null}
              <p className="mt-4 max-w-lg text-base leading-relaxed text-[#183B56]/65">
                Upload your resume and paste the job description so your AI coach can tailor the session to your role.
              </p>
            </div>

            <div className="space-y-6">
              <FileUploadDropzone
                fileName={resumeFile?.name ?? ""}
                onFileSelect={setResumeFile}
              />

              <div>
                <label
                  htmlFor="job-description"
                  className="mb-3 block text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]"
                >
                  Paste Job Description
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  className="min-h-44 w-full rounded-xl border border-transparent bg-[#F8F9FA] p-5 text-base text-[#183B56] outline-none ring-1 ring-[#1C4E78]/12 placeholder:text-[#1C4E78]/45 transition focus:ring-2 focus:ring-[#5C9EAD]/65"
                  placeholder="Paste the job description here…"
                />
              </div>

              <button
                type="button"
                onClick={handleStartTraining}
                disabled={!canStart}
                className="w-full rounded-xl bg-[#D95C50] px-8 py-4 text-base font-bold uppercase tracking-[0.08em] text-white transition duration-200 enabled:hover:bg-[#C44D43] enabled:hover:shadow-[0_8px_24px_rgba(217,92,80,0.30)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Training
              </button>
            </div>
          </div>

          {/* Right: avatar panel — mirrors home page hero */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#183B56] via-[#1C4E78] to-[#5C9EAD] p-12 lg:col-span-5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(92,158,173,0.25),transparent_70%)]" />
            <div className="relative flex flex-col items-center gap-6">
              <VoiceAvatar isSpeaking />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                  Your AI Coach
                </p>
                <p className="mt-1 text-xl font-bold text-white">ParrotAI</p>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
