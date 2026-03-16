import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";

export default async function AuditPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const user = await getCurrentUser();
  const store = getStore();

  const entries = store.audit.filter((a) => a.schoolId === schoolId).slice(0, 200);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">Admin: audit log</h2>
        <p className="mt-1 text-sm text-zinc-300">
          {user?.role === "school_admin"
            ? "Recent actions across requests, uploads, and AI."
            : "Sign in as a School Admin to view audit logs."}
        </p>
        <div className="mt-4 grid gap-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{e.action}</div>
                <div className="text-xs text-zinc-400">{new Date(e.at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs text-zinc-300">
                actor: {e.actorUserId ?? "(system)"} · id: {e.id}
              </div>
            </div>
          ))}
          {entries.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
              No audit entries yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
