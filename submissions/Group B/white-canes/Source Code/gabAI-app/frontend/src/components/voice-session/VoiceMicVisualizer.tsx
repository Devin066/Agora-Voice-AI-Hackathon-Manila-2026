import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface VoiceMicVisualizerProps {
  isActive: boolean;
  isConnecting?: boolean;
  isMuted?: boolean;
}

const VoiceMicVisualizer = ({ isActive, isConnecting = false, isMuted = false }: VoiceMicVisualizerProps) => {
  const showPulse = isActive && !isMuted && !isConnecting;

  return (
    <div className="relative flex items-center justify-center w-72 h-72">

      {/* Outer concentric rings — pulse when active */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full border transition-all duration-700",
            "border-[#2e1065]/20",
            showPulse && "animate-ping"
          )}
          style={{
            inset: `${i * 20}px`,
            animationDelay: `${i * 200}ms`,
            animationDuration: '2s',
            opacity: showPulse ? 0.4 - i * 0.1 : 0.12,
          }}
        />
      ))}

      {/* Static decorative ring */}
      <div
        className={cn(
          "absolute inset-8 rounded-full border-2 transition-all duration-700",
          isMuted
            ? "border-red-200"
            : isConnecting
            ? "border-amber-200 animate-pulse"
            : isActive
            ? "border-[#2e1065]/30"
            : "border-zinc-100"
        )}
      />

      {/* Center button */}
      <div
        className={cn(
          "relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl cursor-pointer select-none",
          isMuted
            ? "bg-red-500 scale-95 shadow-red-500/30"
            : isConnecting
            ? "bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/30"
            : isActive
            ? "bg-gradient-to-br from-[#1f0b47] to-[#2e1065] scale-110 shadow-[#1f0b47]/30"
            : "bg-white border border-zinc-100 shadow-zinc-100"
        )}
      >
        {isConnecting ? (
          <Loader2 size={36} className="text-white animate-spin" />
        ) : isMuted ? (
          <MicOff size={36} className="text-white" />
        ) : (
          <Mic
            size={36}
            className={cn(
              "transition-colors duration-500",
              isActive ? "text-white" : "text-zinc-300"
            )}
          />
        )}
      </div>

      {/* Status label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className={cn(
          "text-sm font-semibold px-4 py-1.5 rounded-full",
          isMuted
            ? "text-red-500 bg-red-50"
            : isConnecting
            ? "text-amber-600 bg-amber-50"
            : isActive
            ? "text-[#2e1065] bg-purple-50"
            : "text-zinc-400 bg-zinc-50"
        )}>
          {isMuted ? "Muted" : isConnecting ? "Connecting..." : isActive ? "Listening" : "Ready"}
        </span>
      </div>
    </div>
  );
};

export default VoiceMicVisualizer;
