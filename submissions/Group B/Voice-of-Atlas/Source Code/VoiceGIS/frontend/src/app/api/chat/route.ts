import { NextRequest, NextResponse } from 'next/server';
import { getChatConfig, ATLAS_CONTEXT } from '@/lib/atlas-llm';

export async function POST(req: NextRequest) {
  const config = getChatConfig();
  if (!config.apiKey && !process.env.USE_LOCAL_LLM) {
    return NextResponse.json(
      { error: 'Set OPENROUTER_API_KEY in .env.local, or set USE_LOCAL_LLM=true and run Ollama (e.g. ollama run gemma3:4b).' },
      { status: 500 }
    );
  }
  try {
    const body = await req.json();
    const { messages } = body as { messages: Array<{ role: string; content: string }> };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }
    const messagesWithContext = config.useSystemRole
      ? [{ role: 'system' as const, content: ATLAS_CONTEXT }, ...messages]
      : [{ role: 'user' as const, content: ATLAS_CONTEXT }, ...messages];
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
    const res = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithContext,
        stream: false,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429) {
        let friendly = 'Free daily limit reached for this model (50 requests/day). ';
        try {
          const errJson = JSON.parse(errText) as {
            error?: { message?: string; metadata?: { headers?: Record<string, string> } };
          };
          const msg = errJson?.error?.message;
          const headers = errJson?.error?.metadata?.headers;
          const reset =
            headers?.['x-ratelimit-reset'] ?? headers?.['X-RateLimit-Reset'];
          if (msg) friendly = msg.replace(/^Rate limit exceeded[.:]?\s*/i, '').trim() + '. ';
          if (reset) {
            const resetDate = new Date(Number(reset));
            if (!Number.isNaN(resetDate.getTime())) friendly += `Limit resets around ${resetDate.toLocaleTimeString()}. `;
          }
        } catch {
          /* use default */
        }
        friendly += 'Add credits at openrouter.ai for more requests, or try again later.';
        return NextResponse.json({ error: friendly }, { status: 429 });
      }
      return NextResponse.json({ error: errText || res.statusText }, { status: res.status });
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ content });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Chat request failed';
    const isLocal = process.env.USE_LOCAL_LLM === 'true';
    const hint =
      isLocal && (msg.includes('ECONNREFUSED') || msg.includes('fetch failed'))
        ? ' Make sure Ollama is running (e.g. ollama run gemma3:4b).'
        : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
