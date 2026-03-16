import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonErr(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { ok: false, error: { message, code: code ?? "BAD_REQUEST" } },
    { status },
  );
}

export async function readJson<T>(req: Request): Promise<T> {
  const text = await req.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

