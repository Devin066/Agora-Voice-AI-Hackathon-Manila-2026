"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";

type VoiceAvatarProps = {
  isSpeaking?: boolean;
  className?: string;
};

export function VoiceAvatar({ isSpeaking = true, className }: VoiceAvatarProps) {
  return (
    <div
      className={`relative flex h-64 w-64 items-center justify-center ${className ?? ""}`}
      aria-label="AI voice avatar"
    >
      <motion.div
        className="absolute h-56 w-56 rounded-full bg-gradient-to-r from-[#E2B34B] via-[#5C9EAD] to-[#1C4E78] blur-xl"
        animate={
          isSpeaking
            ? { scale: [0.95, 1.1, 0.95], opacity: [0.25, 0.55, 0.25] }
            : { scale: 1, opacity: 0.25 }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-44 w-44 rounded-full border border-[#E2B34B]/60 bg-[#1C4E78]/40"
        animate={
          isSpeaking
            ? { scale: [0.95, 1.08, 0.95], opacity: [0.35, 0.75, 0.35] }
            : { scale: 1, opacity: 0.4 }
        }
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-32 w-32 rounded-full border border-[#5C9EAD]/80 bg-[#183B56]/70"
        animate={isSpeaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#183B56] text-white shadow-[0_0_40px_rgba(28,78,120,0.55)]">
        <Mic className="h-9 w-9" strokeWidth={1.75} />
      </div>
    </div>
  );
}
