import { getStore } from "@/lib/server/store";
import { DocumentTypeList } from "@/app/s/[schoolId]/documents/widgets";

export default async function DocumentsPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const store = getStore();
  const docTypes = [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId);
  docTypes.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">Document library</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Request documents scoped to this school tenant.
        </p>
        <div className="mt-4">
          <DocumentTypeList schoolId={schoolId} initial={docTypes} />
        </div>
      </section>
    </div>
  );
}

