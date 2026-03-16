import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { requireUser } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";
import { validateOcrText } from "@/lib/server/validation";
import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { Upload } from "@/lib/types";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const user = await requireUser({ schoolId });
  const body = await readJson<{ requestId?: string; ocrText?: string }>(req);
  const requestId = body.requestId?.trim();
  const ocrText = body.ocrText?.trim();
  if (!requestId || !ocrText) return jsonErr("Missing fields", 400, "VALIDATION");

  const store = getStore();
  const request = store.requests.get(requestId);
  if (!request || request.schoolId !== schoolId) return jsonErr("Request not found", 404, "NOT_FOUND");

  const isOwner = request.studentId === user.id;
  const isAdmin = user.role === "school_admin";
  if (!isOwner && !isAdmin) return jsonErr("Forbidden", 403, "FORBIDDEN");

  const expectedTokens = [user.email, user.name].filter(Boolean);
  const validation = validateOcrText({ ocrText, expectedTokens });

  const upload: Upload = {
    id: storeId(),
    schoolId,
    requestId,
    ocrText,
    validationStatus: validation.status,
    createdAt: storeNowIso(),
  };
  store.uploads.set(upload.id, upload);
  writeAudit({
    action: "upload.create",
    actor: user,
    schoolId,
    metadata: { uploadId: upload.id, requestId, validation },
  });
  return jsonOk({ upload, validation }, { status: 201 });
}
