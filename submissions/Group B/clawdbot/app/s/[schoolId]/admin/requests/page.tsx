import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";
import { AdminRequestTable } from "@/app/s/[schoolId]/admin/requests/widgets";

export default async function AdminRequestsPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const user = await getCurrentUser();
  const store = getStore();

  const docTypes = new Map(
    [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId).map((d) => [d.id, d]),
  );

  const requests = [...store.requests.values()].filter((r) => r.schoolId === schoolId);
  requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">Admin: requests</h2>
        <p className="mt-1 text-sm text-zinc-300">
          {user?.role === "school_admin"
            ? "Update request statuses for this tenant."
            : "Sign in as a School Admin to manage requests."}
        </p>
        <div className="mt-4">
          <AdminRequestTable schoolId={schoolId} items={requests} docTypes={Object.fromEntries(docTypes)} />
        </div>
      </section>
    </div>
  );
}
