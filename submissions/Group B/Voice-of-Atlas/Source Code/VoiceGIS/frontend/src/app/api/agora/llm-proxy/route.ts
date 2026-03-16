/**
 * OpenAI-compatible proxy for Agora Conversational AI → your local Ollama.
 * Agora's cloud calls this URL; this server forwards the request to localhost:11434.
 *
 * Use with a tunnel (e.g. ngrok http 3000) and set AGORA_LLM_PROXY_URL to
 * https://your-tunnel.ngrok.io/api/agora/llm-proxy so Agora can reach your local LLM.
 */

import { NextRequest, NextResponse } from 'next/server';
import { LOCAL_OLLAMA_URL, LOCAL_OLLAMA_MODEL, ATLAS_CONTEXT } from '@/lib/atlas-llm';

export async function POST(req: NextRequest) {
  if (process.env.USE_LOCAL_LLM !== 'true') {
    return NextResponse.json(
      { error: 'Local LLM proxy is only enabled when USE_LOCAL_LLM=true' },
      { status: 503 }
    );
  }

  const localUrl = (process.env.LOCAL_LLM_URL || LOCAL_OLLAMA_URL).trim();
  const model = (process.env.LOCAL_LLM_MODEL || LOCAL_OLLAMA_MODEL).trim();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = body as {
    model?: string;
    messages?: Array<{ role: string; content: string }>;
    stream?: boolean;
  };

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const withSystem = [
    { role: 'system' as const, content: ATLAS_CONTEXT },
    ...messages,
  ];

  try {
    const res = await fetch(localUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: payload.model || model,
        messages: withSystem,
        stream: false,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { error: text || res.statusText },
        { status: res.status }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid Ollama response' }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Proxy request failed';
    const hint = msg.includes('ECONNREFUSED') || msg.includes('fetch failed')
      ? ' Is Ollama running? Try: ollama run gemma3:4b'
      : '';
    return NextResponse.json(
      { error: msg + hint },
      { status: 502 }
    );
  }
}
