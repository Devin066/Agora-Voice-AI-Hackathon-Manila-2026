import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { requireUser } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";
import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { DocumentType } from "@/lib/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const store = getStore();
  const docs = [...store.documentTypes.values()].filter((d) => d.schoolId === schoolId);
  return jsonOk(docs);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const user = await requireUser({ schoolId });
  if (user.role !== "school_admin") return jsonErr("Admin only", 403, "FORBIDDEN");

  const body = await readJson<{ name?: string; description?: string; requiresUpload?: boolean }>(
    req,
  );
  const name = body.name?.trim();
  if (!name) return jsonErr("Name is required", 400, "VALIDATION");

  const store = getStore();
  const doc: DocumentType = {
    id: storeId(),
    schoolId,
    name,
    description: body.description?.trim() || undefined,
    requiresUpload: Boolean(body.requiresUpload),
    createdAt: storeNowIso(),
  };
  store.documentTypes.set(doc.id, doc);
  writeAudit({ action: "document_type.create", actor: user, schoolId, metadata: { docTypeId: doc.id } });
  return jsonOk(doc, { status: 201 });
}
