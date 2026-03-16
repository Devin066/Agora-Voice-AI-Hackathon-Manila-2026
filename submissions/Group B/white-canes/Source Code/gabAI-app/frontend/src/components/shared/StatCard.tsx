import React from 'react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  delta?: string;
  deltaType?: 'positive' | 'negative';
  icon: React.ReactNode;
}

const StatCard = ({ label, value, subtext, delta, deltaType, icon }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1f0b47] to-[#2e1065] flex items-center justify-center text-white shadow-lg shadow-[#1f0b47]/10">
          {icon}
        </div>
        {delta && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            deltaType === 'positive' 
              ? "bg-green-50 text-green-600" 
              : "bg-red-50 text-red-600"
          )}>
            {delta}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-[#1E1E1E]">{value}</h3>
        <p className="text-xs text-zinc-400 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

export default StatCard;
