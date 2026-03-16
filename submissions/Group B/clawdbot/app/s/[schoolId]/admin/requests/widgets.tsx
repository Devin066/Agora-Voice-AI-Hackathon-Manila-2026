"use client";

import * as React from "react";
import type { DocumentRequest, DocumentType, RequestStatus } from "@/lib/types";
import { Badge, Select } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";

const STATUSES: RequestStatus[] = ["pending", "processing", "ready", "rejected", "cancelled"];

export function AdminRequestTable(props: {
  schoolId: string;
  items: DocumentRequest[];
  docTypes: Record<string, DocumentType>;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function setStatus(requestId: string, status: RequestStatus) {
    setBusy(requestId);
    setError(null);
    try {
      const res = await fetch(`/api/schools/${encodeURIComponent(props.schoolId)}/requests`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const json = (await res.json()) as ApiResponse<DocumentRequest>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Update failed");
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3">
      {props.items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold">
                  {props.docTypes[r.documentTypeId]?.name ?? "Unknown document"}
                </div>
                <Badge>{r.status}</Badge>
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                Request ID: {r.id} · Student ID: {r.studentId}
              </div>
            </div>
            <div className="w-full sm:w-56">
              <Select
                label="Set status"
                value={r.status}
                disabled={busy === r.id}
                onChange={(e) => setStatus(r.id, e.target.value as RequestStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      ))}
      {props.items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          No requests yet.
        </div>
      ) : null}
      {error ? <div className="text-sm text-rose-200">{error}</div> : null}
    </div>
  );
}
