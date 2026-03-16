"use client";

import type { IAgoraRTCClient, ILocalTrack, UID } from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";

type JoinVoiceSessionPayload = {
  appId: string;
  channel: string;
  token: string | null;
  uid?: UID | null;
};

export function useAgoraRTC() {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [connectionState, setConnectionState] = useState("DISCONNECTED");
  const [isMuted, setIsMuted] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const prepareAgoraClient = async () => {
      const agoraModule = await import("agora-rtc-sdk-ng");
      if (!mounted) {
        return;
      }
      const agoraClient = agoraModule.default.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);
    };

    void prepareAgoraClient();

    return () => {
      mounted = false;
    };
  }, []);

  const joinVoiceSession = async ({ appId, channel, token, uid }: JoinVoiceSessionPayload) => {
    if (!client) {
      throw new Error("Agora client is still initializing.");
    }
    await client.join(appId, channel, token, uid ?? null);
    setActiveChannel(channel);
    setConnectionState("CONNECTED");
  };

  const leaveVoiceSession = async () => {
    if (!client) {
      return;
    }
    await client.leave();
    setConnectionState("DISCONNECTED");
    setActiveChannel(null);
  };

  const toggleLocalMute = async (track: ILocalTrack | null) => {
    const nextMutedState = !isMuted;
    if (track) {
      await track.setMuted(nextMutedState);
    }
    setIsMuted(nextMutedState);
  };

  return {
    client,
    connectionState,
    isMuted,
    activeChannel,
    joinVoiceSession,
    leaveVoiceSession,
    toggleLocalMute,
  };
}
