import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function StatusItem({ label, active }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100 transition-colors hover:bg-white">
      {active ? (
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 blur-sm opacity-50 rounded-full" />
          <CheckCircle2 size={18} className="text-emerald-500 relative z-10" />
        </div>
      ) : (
        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300/80 bg-white" />
      )}
      <span className={`text-[12px] font-bold truncate tracking-wide ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
