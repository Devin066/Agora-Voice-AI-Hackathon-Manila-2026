import React from 'react';
import { Shield, Heart, BrainCircuit, User } from 'lucide-react';
import { COLORS } from '../constants';

export function TranscriptCard({ role, text }) {
  const isUser = role === 'user';
  let color = COLORS[role] || COLORS.text;
  
  let IconComponent = Shield;
  if (role === 'empath') IconComponent = Heart;
  if (role === 'strategist') IconComponent = BrainCircuit;
  if (role === 'user') IconComponent = User;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in pop-in duration-500`}>
      <div className={`flex items-end gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div 
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-[2px] border-white relative z-10"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
        >
          <IconComponent size={16} color="white" />
        </div>
        <div 
          className={`p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl border relative transition-all hover:-translate-y-1 ${isUser ? 'rounded-[28px] rounded-br-[10px] text-white border-white/20' : 'rounded-[28px] rounded-bl-[10px] bg-white/95 border-white'}`}
          style={{ background: isUser ? `linear-gradient(135deg, ${color} 0%, ${color}ee 100%)` : 'rgba(255,255,255,0.95)' }}
        >
          <div className="text-[11px] font-extrabold mb-1.5 uppercase tracking-widest" style={{ color: isUser ? 'rgba(255,255,255,0.95)' : color }}>
            {isUser ? 'You' : role}
          </div>
          <div className={`text-[15px] leading-relaxed font-medium ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
