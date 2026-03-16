import type { Doc } from "../_generated/dataModel";
import type { DatabaseWriter } from "../_generated/server";
import { SUPPORT_AGENT_SEED } from "./constants";

export async function ensureSeededAgents(
  db: DatabaseWriter,
): Promise<Doc<"supportAgents">[]> {
  const existingAgents = await db.query("supportAgents").collect();
  if (existingAgents.length > 0) {
    return sortAgents(existingAgents);
  }

  for (const agent of SUPPORT_AGENT_SEED) {
    await db.insert("supportAgents", {
      slug: agent.slug,
      name: agent.name,
      specialties: [...agent.specialties],
      avatar: agent.avatar,
      available: agent.available,
      sortOrder: agent.sortOrder,
    });
  }

  return sortAgents(await db.query("supportAgents").collect());
}

export function sortAgents<T extends { name: string; sortOrder: number }>(
  agents: T[],
): T[] {
  return [...agents].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name);
  });
}
