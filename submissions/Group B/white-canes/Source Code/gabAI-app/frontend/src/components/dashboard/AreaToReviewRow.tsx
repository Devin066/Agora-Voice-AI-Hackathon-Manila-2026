import React from 'react';
import { cn } from '@/lib/utils';

interface AreaToReviewRowProps {
  topic: string;
  category: string;
  proficiency: number; // 0-100
}

const AreaToReviewRow = ({ topic, category, proficiency }: AreaToReviewRowProps) => {
  const isLow = proficiency < 40;

  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 last:border-0 group hover:bg-zinc-50/50 px-2 rounded-lg transition-colors">
      {/* Topic Info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-1 h-10 rounded-full flex-shrink-0",
          isLow ? "bg-red-400" : "bg-orange-400"
        )} />
        <div>
          <p className="text-sm font-semibold text-[#1E1E1E]">{topic}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{category}</p>
        </div>
      </div>

      {/* Proficiency */}
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isLow ? "bg-red-400" : "bg-orange-400"
            )}
            style={{ width: `${proficiency}%` }}
          />
        </div>
        <span className={cn(
          "text-sm font-bold w-10 text-right",
          isLow ? "text-red-500" : "text-orange-500"
        )}>
          {proficiency}%
        </span>
      </div>
    </div>
  );
};

export default AreaToReviewRow;
