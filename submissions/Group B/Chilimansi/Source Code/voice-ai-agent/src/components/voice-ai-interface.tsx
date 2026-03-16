"use client";

import { Mic, MicOff, PhoneOff, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VoiceAIInterfaceProps {
  isConnected: boolean;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

function AudioWaveVisualizer() {
  return (
    <div className="flex items-center justify-center gap-1 h-12" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-success animate-audio-wave"
          style={{
            height: "100%",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function VoiceAIInterface({
  isConnected,
  isMuted,
  onConnect,
  onDisconnect,
  onToggleMute,
}: VoiceAIInterfaceProps) {
  if (!isConnected) {
    return (
      <Button
        variant="success"
        className="w-full h-14 text-base font-semibold gap-3"
        onClick={onConnect}
        aria-label="Connect to Voice AI powered by Agora"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        Connect to Voice AI (Agora)
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
            <span className="text-sm font-semibold text-success">Voice AI Active</span>
          </div>
          <span className="sr-only">Voice AI is currently active</span>
        </div>

        <AudioWaveVisualizer />

        <div className="flex gap-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            className="h-12 w-12"
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Mic className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-12 text-base font-semibold"
            onClick={onDisconnect}
            aria-label="End voice AI call"
          >
            <PhoneOff className="h-5 w-5 mr-2" aria-hidden="true" />
            End Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
