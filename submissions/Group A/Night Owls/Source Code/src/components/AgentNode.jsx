import React from 'react';
import { Volume2 } from 'lucide-react';
import { SoundWave } from './SoundWave';

export function AgentNode({ name, color, coords, isActive, icon }) {
  return (
    <div className="relative flex flex-col items-center">
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: color, animationDuration: '1.5s' }} />
          <div className="absolute inset-[-15px] rounded-full animate-ping opacity-30" style={{ backgroundColor: color, animationDuration: '2s', animationDelay: '0.2s' }} />
          <div className="absolute -top-10 animate-bounce bg-white/95 p-2 rounded-full shadow-lg backdrop-blur-md border border-gray-100">
             <Volume2 size={16} color={color} />
          </div>
        </>
      )}
      
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.1)] border-[4px] border-white transition-all duration-500 relative z-10 overflow-hidden group"
        style={{ 
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          boxShadow: isActive ? `0 15px 40px ${color}aa, inset 0 -4px 15px rgba(0,0,0,0.2)` : '0 8px 25px rgba(0,0,0,0.1), inset 0 -4px 10px rgba(0,0,0,0.1)',
          transform: isActive ? 'scale(1.25)' : 'scale(1)'
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent transition-opacity group-hover:opacity-70" />
        <div className="absolute inset-0 -translate-x-[150%] skew-x-[30deg] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[hologram_1.5s_ease-in-out_infinite]" />
        <div className="relative z-10 transition-transform group-hover:scale-110">{icon}</div>
      </div>
      
      <div className={`mt-4 text-center bg-white/90 backdrop-blur-xl border border-white px-3.5 py-1.5 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ${isActive ? 'translate-y-2 scale-110' : ''}`}>
        <div className="text-[12px] font-extrabold tracking-wide flex items-center justify-center gap-1" style={{ color: isActive ? color : '#4b5563' }}>
          {isActive && <SoundWave color={color} />}
          {name}
        </div>
        <div className="text-[10px] font-mono text-gray-400 opacity-90 mt-0.5">{coords}</div>
      </div>
    </div>
  );
}
