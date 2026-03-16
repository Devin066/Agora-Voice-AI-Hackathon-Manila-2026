import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { setSession } from "@/lib/server/auth";
import { getStore, upsertUser } from "@/lib/server/store";
import type { Role } from "@/lib/types";

export async function POST(req: Request) {
  const body = await readJson<{
    schoolId?: string;
    email?: string;
    name?: string;
    role?: Role;
  }>(req);

  const schoolId = body.schoolId?.trim();
  const email = body.email?.trim();
  const role = body.role;
  const name = body.name?.trim() || email?.split("@")[0] || "User";

  if (!schoolId || !email || !role) return jsonErr("Missing fields", 400, "VALIDATION");

  const store = getStore();
  if (!store.schools.has(schoolId)) return jsonErr("Unknown school", 404, "NOT_FOUND");

  const user = upsertUser({ schoolId, email, name, role });
  await setSession({ schoolId, userId: user.id, role: user.role });
  return jsonOk(user);
}
