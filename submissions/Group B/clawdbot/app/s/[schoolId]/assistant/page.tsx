import { getCurrentUser } from "@/lib/server/auth";
import { AssistantPanel } from "@/app/s/[schoolId]/assistant/widgets";

export default async function AssistantPage(props: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await props.params;
  const user = await getCurrentUser();

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="text-lg font-semibold">Assistant</h2>
        <p className="mt-1 text-sm text-zinc-300">
          Tenant-aware assistant (Gemini optional). Voice room uses Agora if configured.
        </p>
        <div className="mt-4">
          <AssistantPanel schoolId={schoolId} signedIn={Boolean(user)} />
        </div>
      </section>
    </div>
  );
}
