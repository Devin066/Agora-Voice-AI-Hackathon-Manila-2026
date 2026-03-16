"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
          {
            "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl":
              variant === "primary",
            "bg-secondary text-white hover:bg-blue-700 shadow-lg hover:shadow-xl":
              variant === "secondary",
            "bg-transparent text-primary border-2 border-primary hover:bg-primary/10":
              variant === "ghost",
            "bg-error text-white hover:bg-red-700": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-base": size === "md",
            "px-6 py-3 text-lg": size === "lg",
            "px-8 py-4 text-xl": size === "xl",
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
