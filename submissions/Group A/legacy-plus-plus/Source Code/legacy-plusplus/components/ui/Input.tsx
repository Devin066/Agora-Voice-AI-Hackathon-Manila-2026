import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-body font-semibold text-text mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border border-border rounded-xl px-4 py-3 text-text font-body text-sm bg-surface",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-shadow duration-150",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-body text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
