"use client";

import * as React from "react";
import { Button, Input } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";
import type { School } from "@/lib/types";

export function SchoolCreateForm() {
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/schools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      const json = (await res.json()) as ApiResponse<School>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Failed to create school");
      setName("");
      setDomain("");
      window.location.href = `/s/${encodeURIComponent(json.data.id)}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input label="School name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. San Isidro National HS" />
      <Input label="Domain (optional)" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="e.g. sanisidro.edu.ph" />
      {error ? <div className="text-sm text-rose-200">{error}</div> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy || !name.trim()}>
          {busy ? "Creating..." : "Create school"}
        </Button>
        <span className="text-xs text-zinc-300">Stored in memory for this demo.</span>
      </div>
    </form>
  );
}
