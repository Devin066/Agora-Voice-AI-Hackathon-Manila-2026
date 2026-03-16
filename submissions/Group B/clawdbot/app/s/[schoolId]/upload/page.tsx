import { getCurrentUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";
import { OcrUploadPanel } from "@/app/s/[schoolId]/upload/widgets";

export default async function UploadPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const user = await getCurrentUser();
  const store = getStore();

  const docTypes = new Map(
    [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId).map((d) => [d.id, d]),
  );

  const allRequests = [...store.requests.values()].filter((r) => r.schoolId === schoolId);
  const myRequests = user ? allRequests.filter((r) => r.studentId === user.id) : [];
  myRequests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">OCR upload</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Upload a requirement scan (ID, form, etc). OCR runs in-browser via `tesseract.js`.
        </p>
        <div className="mt-4">
          <OcrUploadPanel
            schoolId={schoolId}
            requests={myRequests}
            docTypes={Object.fromEntries(docTypes)}
            signedIn={Boolean(user)}
          />
        </div>
      </section>
    </div>
  );
}
