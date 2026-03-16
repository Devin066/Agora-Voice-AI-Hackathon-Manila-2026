"use client";

import { useState, useCallback, useRef } from "react";
import { Heart, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PatientView from "@/components/patient-view";
import ResponderView from "@/components/responder-view";
import { useAgoraRTC } from "@/hooks/useAgoraRTC";
import { useConvoAI } from "@/hooks/useConvoAI";

type EmergencyState = "idle" | "alerting";
type ResponderState = "waiting" | "alert-received" | "responding";

export default function Home() {
  const [emergencyState, setEmergencyState] = useState<EmergencyState>("idle");
  const [responderState, setResponderState] = useState<ResponderState>("waiting");
  const [isMuted, setIsMuted] = useState(false);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localTrackRef = useRef<import("agora-rtc-sdk-ng").ILocalAudioTrack | null>(null);

  const { client, joinVoiceSession, leaveVoiceSession, toggleLocalMute } = useAgoraRTC();
  const { status: convoStatus, startSession, stopSession, sessionData } = useConvoAI();

  const voiceAIConnected = convoStatus === "active";

  const handleSOSTrigger = useCallback(() => {
    setEmergencyState("alerting");
    alertTimerRef.current = setTimeout(() => {
      setResponderState("alert-received");
    }, 2000);
  }, []);

  const handleAcceptAlert = useCallback(() => {
    setResponderState("responding");
  }, []);

  const handleDeclineAlert = useCallback(() => {
    setResponderState("waiting");
    setEmergencyState("idle");
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
  }, []);

  const handleConnectVoice = useCallback(async () => {
    try {
      // 1. Start the Conversational AI agent (server-side)
      const session = await startSession();
      if (!session || !client) return;

      // 2. Join the Agora RTC channel as the user
      await joinVoiceSession({
        appId: session.appId,
        channel: session.channelName,
        token: session.userToken,
        uid: session.userUid,
      });

      // 3. Create and publish local audio track
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([localAudioTrack]);
      localTrackRef.current = localAudioTrack;
    } catch (err) {
      console.error("Failed to connect voice AI:", err);
    }
  }, [client, joinVoiceSession, startSession]);

  const handleDisconnectVoice = useCallback(async () => {
    try {
      // Stop local audio track
      if (localTrackRef.current) {
        localTrackRef.current.stop();
        localTrackRef.current.close();
        localTrackRef.current = null;
      }

      // Leave RTC channel
      await leaveVoiceSession();

      // Stop the Conversational AI agent
      await stopSession();
    } catch (err) {
      console.error("Failed to disconnect voice AI:", err);
    }
  }, [leaveVoiceSession, stopSession]);

  const handleToggleMute = useCallback(async () => {
    await toggleLocalMute(localTrackRef.current);
    setIsMuted((prev) => !prev);
  }, [toggleLocalMute]);

  const handleMarkComplete = useCallback(async () => {
    await handleDisconnectVoice();
    setResponderState("waiting");
    setEmergencyState("idle");
    setIsMuted(false);
  }, [handleDisconnectVoice]);

  const status = emergencyState === "alerting" ? "alerting" : "idle";

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-md items-center gap-3 px-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-destructive" aria-hidden="true">
            <Heart className="h-5 w-5 text-primary-foreground fill-current" />
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold leading-tight">First Aid Bot</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Agora Voice AI Hackathon</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md flex-1 px-4">
        <Tabs defaultValue="patient" className="mt-4">
          <TabsList aria-label="Switch between Patient and Responder views">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="responder">Responder</TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <PatientView
              emergencyState={emergencyState}
              onSOSTrigger={handleSOSTrigger}
              status={status}
            />
          </TabsContent>

          <TabsContent value="responder">
            <ResponderView
              responderState={responderState}
              voiceAIConnected={voiceAIConnected}
              isMuted={isMuted}
              onAcceptAlert={handleAcceptAlert}
              onDeclineAlert={handleDeclineAlert}
              onConnectVoice={handleConnectVoice}
              onDisconnectVoice={handleDisconnectVoice}
              onToggleMute={handleToggleMute}
              onMarkComplete={handleMarkComplete}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        <p>Agora Voice AI Hackathon Manila 2026</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" aria-hidden="true" />
            911
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" aria-hidden="true" />
            143
          </span>
        </div>
      </footer>
    </div>
  );
}
