"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "duo";
  size?: "sm" | "md" | "lg" | "xl";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn-3d inline-flex items-center justify-center gap-2 font-heading font-bold rounded-2xl transition-colors duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          {
            // Primary — teal 3D
            "bg-primary text-white shadow-[0_4px_0_#0b8a8b] hover:brightness-105":
              variant === "primary",
            // Secondary — indigo 3D
            "bg-secondary text-white shadow-[0_4px_0_#4f46e5] hover:brightness-105":
              variant === "secondary",
            // Ghost — outlined
            "bg-transparent text-primary border-2 border-primary hover:bg-primary/10 shadow-none":
              variant === "ghost",
            // Danger — red 3D
            "bg-error text-white shadow-[0_4px_0_#dc2626] hover:brightness-105":
              variant === "danger",
            // Success — green 3D
            "bg-success text-white shadow-[0_4px_0_#16a34a] hover:brightness-105":
              variant === "success",
            // Duo — accent gold 3D (for special CTAs)
            "bg-accent text-white shadow-[0_4px_0_#d97706] hover:brightness-105":
              variant === "duo",
          },
          {
            "px-4 py-2 text-sm":   size === "sm",
            "px-5 py-3 text-base": size === "md",
            "px-7 py-3.5 text-lg": size === "lg",
            "px-9 py-4 text-xl":   size === "xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
