import { jsonOk } from "@/app/api/_util";
import { clearSession } from "@/lib/server/auth";

export async function POST() {
  await clearSession();
  return jsonOk({ loggedOut: true });
}
