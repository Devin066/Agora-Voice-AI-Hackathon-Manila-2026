"use client";

import * as React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import type { ChatMessage } from "@/lib/types";
import { Button, Input } from "@/app/_components/ui";
import type { ApiResponse } from "@/lib/api";
import { isApiOk } from "@/lib/api";

function nowIso() {
  return new Date().toISOString();
}

function envAgoraAppId() {
  return process.env.NEXT_PUBLIC_AGORA_APP_ID || process.env.NEXT_PUBLIC_APP_ID;
}

export function AssistantPanel(props: { schoolId: string; signedIn: boolean }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => [
    {
      role: "system",
      content:
        "Ask about documents, requesting, or statuses. This demo falls back to a rule-based assistant if Gemini isn’t configured.",
      at: nowIso(),
    },
  ]);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function send() {
    const content = text.trim();
    if (!content) return;
    if (!props.signedIn) {
      setError("Sign in from Home to chat.");
      return;
    }
    setBusy(true);
    setError(null);
    const userMsg = { role: "user", content, at: nowIso() } satisfies ChatMessage;
    const next = [...messages, userMsg];
    setMessages(next);
    setText("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schoolId: props.schoolId, messages: next }),
      });
      const json = (await res.json()) as ApiResponse<{ reply: string; chatLogId: string }>;
      if (!res.ok || !isApiOk(json)) throw new Error(!isApiOk(json) ? json.error.message : "Chat failed");
      const assistantMsg = {
        role: "assistant",
        content: json.data.reply,
        at: nowIso(),
      } satisfies ChatMessage;
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === "user" ? "text-zinc-50" : "text-zinc-200"}>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{m.role}</div>
            <div className="whitespace-pre-wrap text-sm leading-6">{m.content}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I need a Good Moral certificate"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
        </div>
        <Button onClick={send} disabled={busy || !text.trim()}>
          {busy ? "Sending..." : "Send"}
        </Button>
      </div>

      {error ? <div className="text-sm text-rose-200">{error}</div> : null}

      <VoiceRoom schoolId={props.schoolId} />
    </div>
  );
}

function VoiceRoom(props: { schoolId: string }) {
  const appId = envAgoraAppId();
  const [joined, setJoined] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const clientRef = React.useRef<IAgoraRTCClient | null>(null);
  const trackRef = React.useRef<IMicrophoneAudioTrack | null>(null);

  async function join() {
    if (!appId) {
      setError("Set NEXT_PUBLIC_AGORA_APP_ID (or APP_ID) to enable voice.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;
      const channel = `clawdbot-${props.schoolId}`;
      await client.join(appId, channel, null, null);
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      trackRef.current = track;
      await client.publish([track]);
      setJoined(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to join voice room");
      await leave();
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    try {
      const track = trackRef.current;
      if (track) {
        track.stop();
        track.close();
      }
      trackRef.current = null;
      await clientRef.current?.leave();
      clientRef.current = null;
    } finally {
      setJoined(false);
    }
  }

  React.useEffect(() => {
    return () => {
      void leave();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">Voice room (Agora)</div>
          <div className="mt-1 text-xs text-zinc-400">
            Channel: clawdbot-{props.schoolId}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!joined ? (
            <Button onClick={join} disabled={busy}>
              {busy ? "Joining..." : "Join"}
            </Button>
          ) : (
            <Button variant="ghost" onClick={leave} disabled={busy}>
              Leave
            </Button>
          )}
        </div>
      </div>
      {error ? <div className="mt-3 text-sm text-rose-200">{error}</div> : null}
    </div>
  );
}
