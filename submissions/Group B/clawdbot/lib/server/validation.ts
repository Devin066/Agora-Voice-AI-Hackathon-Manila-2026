import "server-only";

import type { ValidationStatus } from "@/lib/types";

export function validateOcrText(params: { ocrText: string; expectedTokens: string[] }) {
  const haystack = params.ocrText.toLowerCase();
  const missing = params.expectedTokens.filter((t) => !haystack.includes(t.toLowerCase()));
  const status: ValidationStatus = missing.length === 0 ? "passed" : "unverified";
  return { status, missing };
}

