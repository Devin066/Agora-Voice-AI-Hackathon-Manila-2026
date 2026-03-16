import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { requireUser } from "@/lib/server/auth";
import { writeAudit } from "@/lib/server/audit";
import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { DocumentRequest, RequestStatus } from "@/lib/types";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const user = await requireUser({ schoolId });

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId") || undefined;

  const store = getStore();
  let items = [...store.requests.values()].filter((r) => r.schoolId === schoolId);

  if (user.role === "student") {
    items = items.filter((r) => r.studentId === user.id);
  } else if (studentId) {
    items = items.filter((r) => r.studentId === studentId);
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return jsonOk(items);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const user = await requireUser({ schoolId });

  const body = await readJson<{ studentId?: string; documentTypeId?: string }>(req);
  const documentTypeId = body.documentTypeId?.trim();
  if (!documentTypeId) return jsonErr("documentTypeId is required", 400, "VALIDATION");

  const store = getStore();
  const docType = store.documentTypes.get(documentTypeId);
  if (!docType || docType.schoolId !== schoolId) return jsonErr("Unknown document type", 404, "NOT_FOUND");

  const studentId = user.role === "student" ? user.id : body.studentId?.trim() || user.id;
  const at = storeNowIso();
  const request: DocumentRequest = {
    id: storeId(),
    schoolId,
    studentId,
    documentTypeId,
    status: "pending",
    createdAt: at,
    updatedAt: at,
  };
  store.requests.set(request.id, request);
  writeAudit({
    action: "request.create",
    actor: user,
    schoolId,
    metadata: { requestId: request.id, documentTypeId },
  });
  return jsonOk(request, { status: 201 });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const user = await requireUser({ schoolId });
  const body = await readJson<{ requestId?: string; status?: RequestStatus }>(req);
  const requestId = body.requestId?.trim();
  const status = body.status;
  if (!requestId || !status) return jsonErr("Missing fields", 400, "VALIDATION");

  const store = getStore();
  const request = store.requests.get(requestId);
  if (!request || request.schoolId !== schoolId) return jsonErr("Request not found", 404, "NOT_FOUND");

  const isOwner = request.studentId === user.id;
  const isAdmin = user.role === "school_admin";
  if (!isAdmin) {
    // Students can only cancel their own requests.
    if (!(isOwner && status === "cancelled")) return jsonErr("Forbidden", 403, "FORBIDDEN");
  }

  request.status = status;
  request.updatedAt = storeNowIso();
  store.requests.set(request.id, request);
  writeAudit({
    action: "request.update_status",
    actor: user,
    schoolId,
    metadata: { requestId: request.id, status },
  });
  return jsonOk(request);
}
