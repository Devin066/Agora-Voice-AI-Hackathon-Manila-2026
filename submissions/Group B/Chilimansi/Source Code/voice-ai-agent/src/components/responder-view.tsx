"use client";

import { Shield, Navigation, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IncomingAlertCard, { type PatientInfo } from "@/components/incoming-alert-card";
import EmergencyActionPlan from "@/components/emergency-action-plan";
import VoiceAIInterface from "@/components/voice-ai-interface";

type ResponderState = "waiting" | "alert-received" | "responding";

interface ResponderViewProps {
  responderState: ResponderState;
  voiceAIConnected: boolean;
  isMuted: boolean;
  onAcceptAlert: () => void;
  onDeclineAlert: () => void;
  onConnectVoice: () => void;
  onDisconnectVoice: () => void;
  onToggleMute: () => void;
  onMarkComplete: () => void;
}

const demoPatient: PatientInfo = {
  name: "Juan D.",
  avatar: "JD",
  location: "BGC Taguig",
  distance: "150m",
  time: "Just now",
  condition: "Severe Asthma",
};

const demoEAP = {
  condition: "Severe Asthma",
  actionRequired:
    "Inhaler is in my front right pocket. If unconscious, call 143 or 911 immediately.",
  emergencyContact: "143 (Red Cross)",
};

export default function ResponderView({
  responderState,
  voiceAIConnected,
  isMuted,
  onAcceptAlert,
  onDeclineAlert,
  onConnectVoice,
  onDisconnectVoice,
  onToggleMute,
  onMarkComplete,
}: ResponderViewProps) {
  /* TODO: 
Supabase Realtime — subscribe to emergencies table
      const channel = supabase
        .channel('emergencies')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergencies' }, (payload) => {
          // Handle new emergency alert
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
  */

  /* TODO: Agora RTC — initialize voice channel on accept
      const { joinVoiceSession } = useAgoraRTC();
      await joinVoiceSession({ appId, channel: emergencyId, token });
  */

  if (responderState === "waiting") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Shield className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">You&apos;re on standby</p>
          <p className="text-sm text-muted-foreground">Waiting for nearby emergencies...</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-success">
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Connected to Supabase Realtime</span>
        </div>
        <span className="sr-only">Responder is on standby, waiting for emergency alerts</span>
      </div>
    );
  }

  if (responderState === "alert-received") {
    return (
      <div className="space-y-4 py-4">
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
            Emergency Alert
          </p>
          <p className="text-lg font-bold">Someone nearby needs help</p>
        </div>
        <IncomingAlertCard
          patient={demoPatient}
          onAccept={onAcceptAlert}
          onDecline={onDeclineAlert}
        />
        <span className="sr-only">Emergency alert received, review patient details</span>
      </div>
    );
  }

  // responding state
  return (
    <div className="space-y-4 py-4">
      {/* Navigation card */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Navigation className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Navigating to patient</p>
            <p className="text-xs text-muted-foreground">{demoPatient.distance} away — {demoPatient.location}</p>
          </div>
        </CardContent>
      </Card>

      {/* Compact EAP */}
      <EmergencyActionPlan {...demoEAP} compact />

      {/* Voice AI */}
      <VoiceAIInterface
        isConnected={voiceAIConnected}
        isMuted={isMuted}
        onConnect={onConnectVoice}
        onDisconnect={onDisconnectVoice}
        onToggleMute={onToggleMute}
      />

      {/* Mark Complete */}
      <Button
        variant="outline"
        className="w-full h-12"
        onClick={onMarkComplete}
        aria-label="Mark emergency as complete"
      >
        Mark Complete
      </Button>

      <span className="sr-only">Responding to emergency, navigate to patient and use voice AI</span>
    </div>
  );
}
