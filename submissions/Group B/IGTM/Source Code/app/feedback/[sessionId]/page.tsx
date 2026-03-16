import Link from "next/link";
import { ArrowLeft, TrendingUp, Clock, MessageSquare, Lightbulb, Star, BookOpen } from "lucide-react";

type FeedbackPageProps = {
  params: Promise<{ sessionId: string }>;
};

const strengths = [
  "Remained calm, polite, and cooperative throughout the entire negotiation",
  "Proposed a reasonable performance-based progression structure (start lower, increase after learning required tools)",
  "Was transparent about gaps in experience rather than overstating qualifications",
  "Accepted a fair counter-offer without unnecessary resistance, keeping the conversation productive",
  "Showed willingness to commit to measurable milestones as justification for raises",
];

const tips = [
  "Speak clearly and confidently — filler words, incomplete sentences, and mumbling significantly undermine your perceived value in salary talks",
  "Always confirm numbers explicitly before agreeing; you misquoted ₱150,000 which was never on the table and could have damaged trust",
  "Anchor higher at the start — your range of ₱100,000–₱120,000 was too close to your last salary; research market rates for the role and location before negotiating",
  "Quantify your experience with specifics: scale of automation systems, number of workflows built, team size led — vague answers cost you leverage",
  "Proactively propose the milestone structure yourself rather than waiting for the interviewer to offer it; it signals strategic thinking",
  "Before the negotiation, prepare a 30-second value pitch that connects your AI agent and backend skills directly to the company's stated needs (agentic accounts, content pipelines)",
];

const keynotes = [
  "Final agreed package: ₱105,000 start → ₱115,000 at 90 days → ₱120,000–₱125,000 at 6 months, contingent on performance milestones",
  "Key leverage point missed: sole lead developer experience on browser automation (Playwright/Selenium) was undersold and could have justified a stronger opening anchor",
  "Acknowledged video pipeline gap honestly, which preserved credibility but required a concession on the upper salary range",
  "Communication clarity is the single biggest area to improve before the next negotiation — verbal precision directly correlates with perceived seniority",
  "The interviewer drove most of the structure; you should practice leading the negotiation framework rather than reacting to it",
];

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { sessionId } = await params;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(217,92,80,0.08),transparent_40%),radial-gradient(ellipse_at_top_right,rgba(226,179,75,0.10),transparent_40%),radial-gradient(ellipse_at_bottom_center,rgba(92,158,173,0.10),transparent_50%)] bg-white text-[#183B56]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 md:px-10 lg:px-16 lg:py-16">

        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1C4E78] shadow-[0_4px_12px_rgba(24,59,86,0.08)] transition hover:-translate-x-0.5 hover:shadow-[0_6px_16px_rgba(24,59,86,0.12)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Session Complete
            </span>
            <h1 className="mt-3 bg-gradient-to-br from-[#183B56] via-[#1C4E78] to-[#5C9EAD] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
              Session Analytics
            </h1>
          </div>
          <span className="hidden rounded-full bg-[#E2B34B]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78] sm:inline-flex">
            Session {sessionId.slice(-6)}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D95C50]/10 text-[#D95C50]">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Score</p>
              <p className="text-4xl font-bold leading-none text-[#D95C50]">52</p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5C9EAD]/10 text-[#5C9EAD]">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Duration</p>
              <p className="text-4xl font-bold leading-none text-[#183B56]">7:36</p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C4E78]/10 text-[#1C4E78]">
              <MessageSquare className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Turns</p>
              <p className="text-4xl font-bold leading-none text-[#183B56]">13</p>
            </div>
          </article>
        </div>

        {/* Quick metrics */}
        <div className="grid gap-3 rounded-xl bg-white p-6 shadow-[0_12px_30px_rgba(24,59,86,0.08)] sm:grid-cols-3">
          <div className="rounded-lg bg-[#F8F9FA] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Evidence usage</p>
            <p className="mt-1 font-semibold text-[#183B56]">Needs more proof points</p>
          </div>
          <div className="rounded-lg bg-[#F8F9FA] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Response pacing</p>
            <p className="mt-1 font-semibold text-[#183B56]">Steady</p>
          </div>
          <div className="rounded-lg bg-[#F8F9FA] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]/60">Confidence estimate</p>
            <p className="mt-1 font-semibold text-[#183B56]">100 / 100</p>
          </div>
        </div>

        {/* AI Feedback */}
        <section className="relative overflow-hidden rounded-xl bg-white p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
          <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[#5C9EAD] to-[#1C4E78]" />
          <span className="inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
            AI Feedback
          </span>
          <p className="mt-4 text-base leading-relaxed text-[#183B56]">
            James demonstrated a cooperative and honest negotiation style, successfully moving the offer from ₱92,000 to ₱105,000 with a structured progression path. However, his communication was frequently unclear and unpolished, he failed to proactively quantify his value, misheard or misrepresented terms mid-negotiation (citing ₱150,000 when it was never offered), and largely relied on the interviewer to drive the structure rather than advocating confidently for himself.
          </p>
        </section>

        {/* Strengths */}
        <section className="rounded-xl bg-white p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5C9EAD]/15 text-[#5C9EAD]">
              <Star className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="inline-flex rounded-full bg-[#5C9EAD]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Strengths
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {strengths.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg bg-[#F8F9FA] px-4 py-3 text-sm leading-relaxed text-[#183B56]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5C9EAD]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Tips */}
        <section className="rounded-xl bg-white p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2B34B]/20 text-[#E2B34B]">
              <Lightbulb className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="inline-flex rounded-full bg-[#E2B34B]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Tips
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {tips.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg bg-[#F8F9FA] px-4 py-3 text-sm leading-relaxed text-[#183B56]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E2B34B]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Keynotes */}
        <section className="rounded-xl bg-white p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D95C50]/10 text-[#D95C50]">
              <BookOpen className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="inline-flex rounded-full bg-[#D95C50]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Keynotes
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {keynotes.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg bg-[#F8F9FA] px-4 py-3 text-sm leading-relaxed text-[#183B56]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D95C50]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

      </main>
    </div>
  );
}
