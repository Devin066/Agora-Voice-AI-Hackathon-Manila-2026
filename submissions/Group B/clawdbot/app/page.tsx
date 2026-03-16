import Link from "next/link";
import { getStore } from "@/lib/server/store";
import { SchoolCreateForm } from "@/app/_components/SchoolCreateForm";
import { LoginForm } from "@/app/_components/LoginForm";

export default function Home() {
  const store = getStore();
  const schools = [...store.schools.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_15%_10%,rgba(249,115,22,.22),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,.16),transparent_35%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(15,23,42,1))] text-zinc-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-14">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.24em] text-zinc-300">
            MULTI-SCHOOL DOCUMENT + AI PLATFORM
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Clawdbot for Schools
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-200 sm:text-lg">
            Tenant-aware dashboards, document requests, OCR, and an AI assistant.
            This demo ships with an in-memory datastore so it runs immediately.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold">Pick a school</h2>
            <p className="mt-1 text-sm text-zinc-300">
              Each school is a tenant. Data stays scoped by `schoolId`.
            </p>
            <div className="mt-4 grid gap-3">
              {schools.map((s) => (
                <Link
                  key={s.id}
                  href={`/s/${encodeURIComponent(s.id)}`}
                  className="group rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20 hover:bg-black/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="truncate text-xs text-zinc-300">{s.id}</div>
                    </div>
                    <div className="text-xs text-zinc-300 group-hover:text-zinc-50">
                      Open
                    </div>
                  </div>
                </Link>
              ))}
              {schools.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
                  No schools yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">Demo login</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Creates a user in the demo store and sets an HttpOnly session cookie.
              </p>
              <div className="mt-4">
                <LoginForm schools={schools} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">Create a school</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Adds a new tenant to the in-memory store.
              </p>
              <div className="mt-4">
                <SchoolCreateForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
