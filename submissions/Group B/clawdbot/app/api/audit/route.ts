import { jsonErr, jsonOk } from "@/app/api/_util";
import { requireUser } from "@/lib/server/auth";
import { getStore } from "@/lib/server/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const schoolId = url.searchParams.get("schoolId") || undefined;

  const user = await requireUser(schoolId ? { schoolId } : undefined);
  if (user.role !== "school_admin") return jsonErr("Admin only", 403, "FORBIDDEN");

  const store = getStore();
  const entries = store.audit.filter((a) => (schoolId ? a.schoolId === schoolId : true));
  return jsonOk(entries.slice(0, 200));
}
