"use client";

import * as React from "react";
import type { DocumentType } from "@/lib/types";
import { Badge, Button } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";
import type { DocumentRequest } from "@/lib/types";

export function DocumentTypeList(props: { schoolId: string; initial: DocumentType[] }) {
  const [items, setItems] = React.useState<DocumentType[]>(props.initial);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function requestDoc(documentTypeId: string) {
    setBusyId(documentTypeId);
    setError(null);
    try {
      const res = await fetch(`/api/schools/${encodeURIComponent(props.schoolId)}/requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentTypeId }),
      });
      const json = (await res.json()) as ApiResponse<DocumentRequest>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Request failed");
      window.location.href = `/s/${encodeURIComponent(props.schoolId)}/requests`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  React.useEffect(() => {
    setItems(props.initial);
  }, [props.initial]);

  return (
    <div className="grid gap-3">
      {items.map((d) => (
        <div key={d.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold">{d.name}</div>
                {d.requiresUpload ? <Badge tone="warn">Requires upload</Badge> : <Badge>Auto</Badge>}
              </div>
              {d.description ? (
                <div className="mt-1 text-sm text-zinc-300">{d.description}</div>
              ) : null}
              <div className="mt-2 text-xs text-zinc-400">ID: {d.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => requestDoc(d.id)}
                disabled={busyId === d.id}
              >
                {busyId === d.id ? "Requesting..." : "Request"}
              </Button>
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          No document types configured for this school.
        </div>
      ) : null}
      {error ? <div className="text-sm text-rose-200">{error}</div> : null}
    </div>
  );
}
