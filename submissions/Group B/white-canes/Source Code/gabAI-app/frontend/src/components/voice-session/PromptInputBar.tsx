import React, { useState } from 'react';
import { Plus, Send } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PromptInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

const PromptInputBar = ({ value, onChange, onSubmit, placeholder = "Start prompt here" }: PromptInputBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full flex items-center gap-3 bg-white border border-zinc-200 p-2 rounded-[24px] shadow-lg shadow-zinc-200/50 focus-within:border-[#2e1065] focus-within:ring-4 focus-within:ring-[#2e1065]/5 transition-all duration-300">
      <button 
        title="Upload file"
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
      >
        <Plus size={24} />
      </button>
      
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none px-2 text-zinc-800 placeholder:text-zinc-400 font-medium"
      />

      <button 
        title="Send message"
        onClick={onSubmit}
        disabled={!value.trim()}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
          value.trim() 
            ? "bg-gradient-to-br from-[#1f0b47] to-[#2e1065] text-white shadow-lg shadow-[#1f0b47]/20 hover:scale-105 active:scale-95" 
            : "bg-zinc-100 text-zinc-300 cursor-not-allowed"
        )}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default PromptInputBar;
