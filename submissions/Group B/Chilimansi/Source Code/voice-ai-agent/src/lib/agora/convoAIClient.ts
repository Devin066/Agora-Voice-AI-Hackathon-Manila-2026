export type StartSessionResponse = {
  ok: boolean;
  sessionId: string;
  channelName: string;
  userUid: number;
  userToken: string;
  appId: string;
  error?: string;
};

type StopSessionResponse = {
  ok: boolean;
  sessionId: string;
  error?: string;
};

export async function startConvoAISession(channel?: string): Promise<StartSessionResponse> {
  const response = await fetch("/api/voice-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start-session", channel }),
  });

  if (!response.ok) {
    throw new Error("Unable to start conversational AI session.");
  }

  return (await response.json()) as StartSessionResponse;
}

export async function stopConvoAISession(sessionId: string): Promise<StopSessionResponse> {
  const response = await fetch("/api/voice-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "stop-session", sessionId }),
  });

  if (!response.ok) {
    throw new Error("Unable to stop conversational AI session.");
  }

  return (await response.json()) as StopSessionResponse;
}
