import Link from "next/link";
import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";

export default async function SchoolLayout(props: {
  children: React.ReactNode;
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await props.params;
  const store = getStore();
  const school = store.schools.get(schoolId);
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh bg-[linear-gradient(to_bottom,rgba(2,6,23,1),rgba(9,9,11,1))] text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <Link href="/" className="text-xs font-semibold tracking-[0.22em] text-zinc-300">
                CLAWDBOT
              </Link>
              <div className="mt-1 truncate text-xl font-semibold">
                {school?.name ?? schoolId}
              </div>
              <div className="mt-1 text-xs text-zinc-300">
                Tenant: <span className="text-zinc-200">{schoolId}</span>
              </div>
            </div>
            <div className="text-right text-xs text-zinc-300">
              {user ? (
                <>
                  <div className="text-zinc-100">{user.name}</div>
                  <div>
                    {user.role} · {user.email}
                  </div>
                </>
              ) : (
                <div>
                  Not signed in. Use the demo login on{" "}
                  <Link href="/" className="underline underline-offset-4">
                    Home
                  </Link>
                  .
                </div>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}`}>
              Dashboard
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/documents`}>
              Documents
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/requests`}>
              Requests
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/upload`}>
              OCR Upload
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/assistant`}>
              Assistant
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/admin/requests`}>
              Admin
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/10" href={`/s/${encodeURIComponent(schoolId)}/admin/audit`}>
              Audit
            </Link>
          </nav>
        </div>

        <div className="py-6">{props.children}</div>
      </div>
    </div>
  );
}
