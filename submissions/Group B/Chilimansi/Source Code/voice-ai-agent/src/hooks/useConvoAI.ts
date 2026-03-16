"use client";

import { useState, useCallback } from "react";
import {
  startConvoAISession,
  stopConvoAISession,
  type StartSessionResponse,
} from "@/lib/agora/convoAIClient";

type SessionStatus = "idle" | "starting" | "active" | "stopping" | "error";

export function useConvoAI() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [sessionData, setSessionData] = useState<StartSessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (channel?: string) => {
    try {
      setStatus("starting");
      setError(null);
      const session = await startConvoAISession(channel);

      if (!session.ok) {
        throw new Error(session.error ?? "Failed to start session");
      }

      setSessionId(session.sessionId);
      setSessionData(session);
      setStatus("active");
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (!sessionId) return null;

    try {
      setStatus("stopping");
      const result = await stopConvoAISession(sessionId);
      setSessionId(null);
      setSessionData(null);
      setStatus("idle");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [sessionId]);

  return {
    sessionId,
    status,
    sessionData,
    error,
    startSession,
    stopSession,
  };
}
