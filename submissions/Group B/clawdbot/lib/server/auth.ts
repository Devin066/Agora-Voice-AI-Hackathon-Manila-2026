import "server-only";

import type { Role, User } from "@/lib/types";
import { getStore } from "@/lib/server/store";
import { cookies } from "next/headers";

const COOKIE_SCHOOL = "claw_school_id";
const COOKIE_USER = "claw_user_id";
const COOKIE_ROLE = "claw_role";

export async function setSession(params: {
  schoolId: string;
  userId: string;
  role: Role;
}) {
  const jar = await cookies();
  jar.set(COOKIE_SCHOOL, params.schoolId, { httpOnly: true, sameSite: "lax", path: "/" });
  jar.set(COOKIE_USER, params.userId, { httpOnly: true, sameSite: "lax", path: "/" });
  jar.set(COOKIE_ROLE, params.role, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_SCHOOL, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  jar.set(COOKIE_USER, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  jar.set(COOKIE_ROLE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSession(): Promise<{
  schoolId?: string;
  userId?: string;
  role?: Role;
}> {
  const jar = await cookies();
  const schoolId = jar.get(COOKIE_SCHOOL)?.value;
  const userId = jar.get(COOKIE_USER)?.value;
  const role = jar.get(COOKIE_ROLE)?.value as Role | undefined;
  return { schoolId, userId, role };
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await getSession();
  if (!userId) return null;
  const store = getStore();
  return store.users.get(userId) ?? null;
}

export async function requireUser(params: { schoolId?: string } = {}): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (params.schoolId && user.schoolId !== params.schoolId) throw new Error("FORBIDDEN_TENANT");
  return user;
}
