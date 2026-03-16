import { jsonErr, jsonOk } from "@/app/api/_util";
import { getStore } from "@/lib/server/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await ctx.params;
  const store = getStore();
  const school = store.schools.get(schoolId);
  if (!school) return jsonErr("School not found", 404, "NOT_FOUND");
  return jsonOk(school);
}
