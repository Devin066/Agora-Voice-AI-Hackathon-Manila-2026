import React from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TopicCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  questionCount: number;
  proficiency: number; // 0-100
}

const TopicCard = ({ icon, title, description, questionCount, proficiency }: TopicCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-[#2e1065] group-hover:text-white transition-colors duration-300">
          {icon || <BookOpen size={24} />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1E1E1E] mb-1">{title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {questionCount} Questions
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">Proficiency</span>
          <span className="text-sm font-bold text-[#2e1065]">{proficiency}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${proficiency}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
