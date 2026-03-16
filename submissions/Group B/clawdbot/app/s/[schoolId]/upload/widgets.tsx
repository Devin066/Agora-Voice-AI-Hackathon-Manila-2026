"use client";

import * as React from "react";
import type { DocumentRequest, DocumentType } from "@/lib/types";
import { Badge, Button, Select } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";

type UploadValidation = { status: string; missing: string[] };
type UploadResponse = { upload: { id: string }; validation: UploadValidation };

export function OcrUploadPanel(props: {
  schoolId: string;
  requests: DocumentRequest[];
  docTypes: Record<string, DocumentType>;
  signedIn: boolean;
}) {
  const [requestId, setRequestId] = React.useState(props.requests[0]?.id ?? "");
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [ocrText, setOcrText] = React.useState<string>("");
  const [busy, setBusy] = React.useState<"ocr" | "submit" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [validation, setValidation] = React.useState<UploadValidation | null>(null);

  React.useEffect(() => {
    if (!requestId && props.requests[0]?.id) setRequestId(props.requests[0].id);
  }, [props.requests, requestId]);

  async function runOcr() {
    if (!file) return;
    setBusy("ocr");
    setError(null);
    setValidation(null);
    setProgress(0);
    try {
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (typeof m?.progress === "number") setProgress(Math.round(m.progress * 100));
        },
      });
      const text = String(result?.data?.text ?? "").trim();
      setOcrText(text);
      if (!text) setError("OCR completed but extracted text was empty.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!requestId || !ocrText.trim()) return;
    setBusy("submit");
    setError(null);
    setValidation(null);
    try {
      const res = await fetch(`/api/schools/${encodeURIComponent(props.schoolId)}/uploads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId, ocrText }),
      });
      const json = (await res.json()) as ApiResponse<UploadResponse>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Submit failed");
      setValidation(json.data.validation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const request = props.requests.find((r) => r.id === requestId) ?? null;

  return (
    <div className="grid gap-4">
      {!props.signedIn ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
          Sign in from Home to submit uploads.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Request"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          disabled={!props.signedIn || props.requests.length === 0}
        >
          {props.requests.map((r) => (
            <option key={r.id} value={r.id}>
              {props.docTypes[r.documentTypeId]?.name ?? "Unknown"} ({r.status})
            </option>
          ))}
        </Select>

        <label className="block">
          <div className="mb-1 text-xs text-zinc-300">Image / PDF</div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-zinc-200"
            disabled={!props.signedIn}
          />
        </label>
      </div>

      {request ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold">
              {props.docTypes[request.documentTypeId]?.name ?? "Unknown document"}
            </div>
            <Badge>{request.status}</Badge>
          </div>
          <div className="mt-2 text-xs text-zinc-400">Request ID: {request.id}</div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={runOcr} disabled={!props.signedIn || !file || busy !== null}>
          {busy === "ocr" ? `Running OCR (${progress}%)...` : "Run OCR"}
        </Button>
        <Button onClick={submit} disabled={!props.signedIn || !requestId || !ocrText.trim() || busy !== null}>
          {busy === "submit" ? "Submitting..." : "Submit OCR text"}
        </Button>
        <span className="text-xs text-zinc-300">
          Validation is a demo heuristic (checks if your name/email appears).
        </span>
      </div>

      <label className="block">
        <div className="mb-1 text-xs text-zinc-300">Extracted text</div>
        <textarea
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-white/25"
          placeholder="Run OCR to fill this, or paste text to simulate OCR."
          disabled={!props.signedIn}
        />
      </label>

      {validation ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-200">
          <div className="font-semibold">Validation</div>
          <div className="mt-1 text-zinc-300">
            Status: <span className="text-zinc-100">{validation.status}</span>
          </div>
          {Array.isArray(validation.missing) && validation.missing.length > 0 ? (
            <div className="mt-1 text-zinc-300">Missing tokens: {validation.missing.join(", ")}</div>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="text-sm text-rose-200">{error}</div> : null}
    </div>
  );
}
