import { jsonErr, jsonOk, readJson } from "@/app/api/_util";
import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { School } from "@/lib/types";

export async function GET() {
  const store = getStore();
  return jsonOk([...store.schools.values()]);
}

export async function POST(req: Request) {
  const body = await readJson<{ id?: string; name?: string; domain?: string }>(req);
  const name = body.name?.trim();
  if (!name) return jsonErr("School name is required", 400, "VALIDATION");

  const store = getStore();
  const id =
    body.id?.trim() ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) ||
    storeId();

  const school: School = {
    id,
    name,
    domain: body.domain?.trim() || undefined,
    createdAt: storeNowIso(),
  };
  store.schools.set(school.id, school);
  return jsonOk(school, { status: 201 });
}

