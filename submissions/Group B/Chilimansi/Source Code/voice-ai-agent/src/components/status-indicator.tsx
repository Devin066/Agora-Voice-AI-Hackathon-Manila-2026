"use client";

import { Wifi, Radio, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "alerting" | "connected" | "offline";

interface StatusIndicatorProps {
  status: Status;
}

const statusConfig: Record<Status, { icon: React.ElementType; label: string; className: string }> = {
  idle: {
    icon: Wifi,
    label: "Ready",
    className: "bg-success/20 text-success",
  },
  alerting: {
    icon: Radio,
    label: "Alerting",
    className: "bg-warning/20 text-warning",
  },
  connected: {
    icon: Wifi,
    label: "Connected",
    className: "bg-success/20 text-success",
  },
  offline: {
    icon: WifiOff,
    label: "Offline",
    className: "bg-destructive/20 text-destructive",
  },
};

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        config.className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "alerting" && "animate-pulse")} aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  );
}
