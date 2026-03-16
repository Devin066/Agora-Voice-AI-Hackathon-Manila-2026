import Image from "next/image";
import { UseCaseCard } from "@/components/UseCaseCard";
import logo from "../logo.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-[#183B56]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-12 md:px-10 lg:px-16 lg:py-16">
        <section className="grid gap-8 rounded-xl bg-white px-8 py-10 shadow-[0_18px_40px_rgba(24,59,86,0.08)] lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <Image
              src={logo}
              alt="IndustryCoach logo"
              className="h-20 w-auto md:h-20"
              priority
            />
            <span className="mt-4 inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              AI Communication Coach
            </span>
            <h1 className="mt-5 bg-gradient-to-br from-[#183B56] via-[#1C4E78] to-[#5C9EAD] bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl">
              Welcome to ParrotAI
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed md:text-xl">
              This AI serves as your trainer to improve your corporate
              communication skills which is essential in navigating corporate
              settings.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl lg:col-span-5">
            <Image
              src="/professionals.jpg"
              alt="Professional coach"
              width={800}
              height={600}
              className="h-full w-full object-cover object-top"
              priority
            />
          </div>
        </section>

        <section className="rounded-xl bg-[#F8F9FA] px-8 py-10">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h2 className="text-4xl font-bold md:text-5xl">Use cases</h2>
            <span className="rounded-full bg-[#E2B34B]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
              Explore
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <UseCaseCard
              index={0}
              label="Practice Negotiate Salary"
              href="/onboarding/practice-negotiate-salary"
            />
            <UseCaseCard
              index={1}
              label="Practice Job Interview"
              href="/onboarding/practice-job-interview"
            />
            <UseCaseCard
              index={2}
              label="Practice Client Meetings"
              href="/onboarding/practice-client-meetings"
            />
            <UseCaseCard
              index={3}
              label="Practice Performance Reviews"
              href="/onboarding/practice-performance-reviews"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
