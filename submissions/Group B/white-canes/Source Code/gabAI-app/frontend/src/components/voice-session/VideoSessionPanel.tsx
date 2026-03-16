import React, { useRef, useEffect } from 'react';
import { Video, Mic, PhoneOff, VideoOff, MicOff, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface VideoSessionPanelProps {
  mode: 'single' | 'dual';
  remoteVideoTrack?: any;
  isMuted: boolean;
  isVideoActive: boolean;
  isConnecting?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

const VideoSessionPanel = ({
  mode,
  remoteVideoTrack,
  isMuted,
  isVideoActive,
  isConnecting = false,
  onToggleMute,
  onToggleVideo,
  onEndCall
}: VideoSessionPanelProps) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remoteVideoTrack && videoRef.current) {
      remoteVideoTrack.play(videoRef.current);
    }
  }, [remoteVideoTrack]);

  return (
    <div className="relative w-full aspect-video bg-zinc-900 rounded-[28px] overflow-hidden border-8 border-white shadow-2xl shadow-black/20">
      {/* Video / State Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {remoteVideoTrack ? (
          /* Live Video */
          <div ref={videoRef} className="w-full h-full object-cover" />
        ) : isConnecting ? (
          /* Connecting State */
          <div className="flex flex-col items-center gap-5 text-white">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping scale-150" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping scale-125 animation-delay-150" />
              <div className="w-24 h-24 bg-gradient-to-br from-[#1f0b47] to-[#2e1065] rounded-full flex items-center justify-center shadow-xl shadow-indigo-900/40 relative">
                <Loader2 size={36} className="animate-spin text-white/80" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">Connecting to gabAI...</p>
              <p className="text-white/50 text-sm mt-1">Waking up your Filipino study buddy</p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Connected but no video — AI is audio-only */
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1f0b47] to-[#2e1065] rounded-full flex items-center justify-center shadow-xl shadow-indigo-900/40">
              <Mic size={36} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">gabAI is listening</p>
              <p className="text-white/40 text-sm mt-1">Voice-only mode active</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
        <button
          onClick={onToggleVideo}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
            isVideoActive
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
          )}
        >
          {isVideoActive ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={onEndCall}
          className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-90 transition-all shadow-xl shadow-red-500/30"
        >
          <PhoneOff size={24} fill="currentColor" />
        </button>

        <button
          onClick={onToggleMute}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
            !isMuted
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
          )}
        >
          {!isMuted ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
      </div>
    </div>
  );
};

export default VideoSessionPanel;
