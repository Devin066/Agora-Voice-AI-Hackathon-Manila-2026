"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SOSButtonProps {
  isAlerting: boolean;
  onTrigger: () => void;
}

export default function SOSButton({ isAlerting, onTrigger }: SOSButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={onTrigger}
        disabled={isAlerting}
        aria-label="Emergency SOS button"
        className={cn(
          "relative flex h-48 w-48 flex-col items-center justify-center rounded-full bg-destructive text-primary-foreground transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70",
          !isAlerting && "animate-pulse-emergency hover:scale-105 active:scale-95 cursor-pointer",
          isAlerting && "cursor-not-allowed"
        )}
      >
        <AlertTriangle className="h-12 w-12 mb-1" aria-hidden="true" />
        <span className="text-3xl font-black tracking-wider">SOS</span>
        <span className="text-sm font-semibold opacity-90">TULONG!</span>
      </button>

      <p className="text-sm text-muted-foreground text-center">
        {isAlerting
          ? "Hold tight, help is on the way..."
          : "Press the button in case of emergency"}
      </p>

      <span className="sr-only">
        {isAlerting ? "Emergency alert is active" : "Emergency alert is inactive"}
      </span>
    </div>
  );
}
