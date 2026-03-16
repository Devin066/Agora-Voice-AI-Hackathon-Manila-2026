import React from 'react';
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  icon: React.ReactNode;
  value: string;
}

interface ModeToggleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const ModeToggle = ({ options, value, onChange }: ModeToggleProps) => {
  return (
    <div className="inline-flex bg-white border border-zinc-200 p-1.5 rounded-2xl gap-1.5 shadow-sm">
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              isActive 
                ? "bg-gradient-to-br from-[#1f0b47] to-[#2e1065] text-white shadow-md shadow-[#1f0b47]/20" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
            )}
          >
            <div className={cn("transition-colors", isActive ? "text-white" : "text-zinc-400")}>
              {option.icon}
            </div>
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
