import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";
import Link from "next/link";

export default async function SchoolDashboard(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const store = getStore();
  const user = await getCurrentUser();

  const docTypes = [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId);
  const requests = [...store.requests.values()].filter((r) => r.schoolId === schoolId);
  const myRequests = user ? requests.filter((r) => r.studentId === user.id) : [];

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Demo data is isolated per tenant (`schoolId`) and per role.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-zinc-400">Document types</div>
            <div className="mt-1 text-2xl font-semibold">{docTypes.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-zinc-400">All requests</div>
            <div className="mt-1 text-2xl font-semibold">{requests.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-zinc-400">My requests</div>
            <div className="mt-1 text-2xl font-semibold">{myRequests.length}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href={`/s/${encodeURIComponent(schoolId)}/documents`}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
        >
          <div className="text-lg font-semibold">Request a document</div>
          <div className="mt-1 text-sm text-zinc-300">
            Browse tenant-specific document types and submit a request.
          </div>
        </Link>
        <Link
          href={`/s/${encodeURIComponent(schoolId)}/assistant`}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
        >
          <div className="text-lg font-semibold">Ask the assistant</div>
          <div className="mt-1 text-sm text-zinc-300">
            Text chat with a school-aware AI (Gemini optional).
          </div>
        </Link>
      </section>
    </div>
  );
}
