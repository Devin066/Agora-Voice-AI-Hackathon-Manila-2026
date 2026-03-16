import "server-only";

import { getStore, storeId, storeNowIso } from "@/lib/server/store";
import type { AuditLog, User } from "@/lib/types";

export function writeAudit(params: {
  action: string;
  actor?: User | null;
  schoolId?: string;
  metadata?: Record<string, unknown>;
}) {
  const store = getStore();
  const entry: AuditLog = {
    id: storeId(),
    at: storeNowIso(),
    action: params.action,
    actorUserId: params.actor?.id,
    schoolId: params.schoolId ?? params.actor?.schoolId,
    metadata: params.metadata,
  };
  store.audit.unshift(entry);
  if (store.audit.length > 5000) store.audit.length = 5000;
  return entry;
}

