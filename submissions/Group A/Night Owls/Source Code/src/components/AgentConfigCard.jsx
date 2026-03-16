import React from 'react';
import { Volume2, Terminal } from 'lucide-react';

export function AgentConfigCard({ role, color, desc, voice, prompt, icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white flex flex-col gap-5 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 group">
      <div className="flex items-center gap-5">
        <div 
          className="w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg border-[2px] border-white relative overflow-hidden transition-transform group-hover:scale-105" 
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          <div className="relative z-10">{icon}</div>
        </div>
        <div>
          <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{role}</h3>
          <p className="text-[14px] text-gray-500 font-semibold">{desc}</p>
        </div>
      </div>
      
      <div className="bg-gray-50/80 backdrop-blur-xl rounded-[24px] p-5 border border-gray-200/50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[12px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Volume2 size={14} className="text-gray-400" /> Voice Engine
          </span>
          <span className="text-[13px] font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">{voice}</span>
        </div>
        <div className="w-full h-[1px] bg-gray-200/60 mb-4" />
        <div>
          <span className="text-[12px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
            <Terminal size={14} className="text-gray-400" /> System Prompt
          </span>
          <p className="text-[14px] text-gray-600 italic leading-relaxed font-medium bg-white/50 p-4 rounded-xl">"{prompt}"</p>
        </div>
      </div>
    </div>
  );
}
