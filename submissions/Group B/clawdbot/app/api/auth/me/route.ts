import { jsonOk } from "@/app/api/_util";
import { getCurrentUser, getSession } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  const session = await getSession();
  return jsonOk({ user, session });
}
