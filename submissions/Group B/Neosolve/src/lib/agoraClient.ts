/**
 * Browser-side Agora RTC client wrapper.
 *
 * Manages the lifecycle of an Agora RTC session:
 * - Create client + local microphone track
 * - Join a channel with a token
 * - Subscribe to the remote AI agent's audio so the user can hear Neo
 * - Leave the channel and clean up resources
 */

import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
  type IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";

// Suppress Agora SDK console noise in production
AgoraRTC.setLogLevel(import.meta.env.PROD ? /* NONE */ 4 : /* WARNING */ 1);

export type CallSessionState =
  | "idle"
  | "joining"
  | "connected"
  | "leaving"
  | "error";

export type AgoraCallSession = {
  client: IAgoraRTCClient;
  micTrack: IMicrophoneAudioTrack | null;
  uid: number;
  channelName: string;
};

let activeSession: AgoraCallSession | null = null;

/**
 * Join an Agora RTC channel, publish the local microphone, and
 * auto-subscribe to remote audio (the AI agent).
 *
 * @returns The session info including the numeric UID assigned by Agora.
 */
export async function joinChannel(opts: {
  appId: string;
  channelName: string;
  token: string | null;
  /** Numeric UID. Pass 0 to let Agora assign one automatically. */
  uid?: number;
}): Promise<AgoraCallSession> {
  if (activeSession) {
    throw new Error(
      "Already in a call. Leave the current channel before joining a new one.",
    );
  }

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Auto-subscribe to remote users so we hear the AI agent
  client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
    if (mediaType === "audio") {
      await client.subscribe(user, "audio");
      user.audioTrack?.play();
    }
  });

  // Join the channel
  const assignedUid = await client.join(
    opts.appId,
    opts.channelName,
    opts.token,
    opts.uid ?? 0,
  );

  // Create and publish the microphone track
  let micTrack: IMicrophoneAudioTrack | null = null;
  try {
    micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([micTrack]);
  } catch (error) {
    console.warn("Microphone access failed:", error);
    // Continue without mic — the user can still hear the AI agent
  }

  activeSession = {
    client,
    micTrack,
    uid: assignedUid as number,
    channelName: opts.channelName,
  };

  return activeSession;
}

/**
 * Leave the current Agora RTC channel and clean up all resources.
 */
export async function leaveChannel(): Promise<void> {
  if (!activeSession) return;

  const { client, micTrack } = activeSession;
  activeSession = null;

  if (micTrack) {
    micTrack.stop();
    micTrack.close();
  }

  await client.leave();
}

/**
 * Get the active session (if any).
 */
export function getActiveSession(): AgoraCallSession | null {
  return activeSession;
}

/**
 * Toggle the local microphone mute state.
 * Returns the new mute state (true = muted).
 */
export async function toggleMute(): Promise<boolean> {
  if (!activeSession?.micTrack) {
    throw new Error("No active microphone track to toggle.");
  }

  const track = activeSession.micTrack;
  const newMuted = !track.muted;
  await track.setMuted(newMuted);
  return newMuted;
}
