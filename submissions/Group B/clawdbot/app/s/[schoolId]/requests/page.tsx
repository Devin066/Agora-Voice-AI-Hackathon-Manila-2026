import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";
import { RequestList } from "@/app/s/[schoolId]/requests/widgets";

export default async function RequestsPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const user = await getCurrentUser();
  const store = getStore();

  const docTypes = new Map(
    [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId).map((d) => [d.id, d]),
  );
  const all = [...store.requests.values()].filter((r) => r.schoolId === schoolId);
  const mine = user ? all.filter((r) => r.studentId === user.id) : [];

  mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">My requests</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Students only see their own requests. Admins can use the Admin page.
        </p>
        <div className="mt-4">
          <RequestList schoolId={schoolId} items={mine} docTypes={Object.fromEntries(docTypes)} />
        </div>
      </section>
    </div>
  );
}
