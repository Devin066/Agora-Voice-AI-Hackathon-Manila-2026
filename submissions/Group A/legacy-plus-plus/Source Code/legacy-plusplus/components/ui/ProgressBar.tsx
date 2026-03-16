import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: "primary" | "success" | "accent" | "secondary";
  className?: string;
  showValue?: boolean;
}

export default function ProgressBar({
  value,
  label,
  color = "primary",
  className,
  showValue = true,
}: ProgressBarProps) {
  const colorMap = {
    primary: "bg-primary",
    success: "bg-success",
    accent: "bg-accent",
    secondary: "bg-secondary",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-body font-medium text-muted">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-data font-bold text-text">{value}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colorMap[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
