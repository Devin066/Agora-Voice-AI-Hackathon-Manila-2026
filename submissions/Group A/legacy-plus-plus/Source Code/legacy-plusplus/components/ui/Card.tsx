import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  variant?: "default" | "accent" | "success" | "warning";
}

export function Card({
  className,
  elevated = false,
  variant = "default",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border p-6",
        elevated && "shadow-lg",
        variant === "default" && "border-border",
        variant === "accent" && "border-accent/20 bg-accent/5",
        variant === "success" && "border-success/20 bg-success/5",
        variant === "warning" && "border-warning/20 bg-warning/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-heading font-bold text-lg text-text", className)}
      {...props}
    >
      {children}
    </h3>
  );
}
