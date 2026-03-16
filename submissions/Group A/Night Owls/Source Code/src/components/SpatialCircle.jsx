import React from 'react';
import { User, Heart, BrainCircuit, Shield } from 'lucide-react';
import { AgentNode } from './AgentNode';
import { COLORS } from '../constants';

export function SpatialCircle({ activeSpeaker, appState }) {
  const isIdle = appState === 'idle';

  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }));

  return (
    <div className="absolute inset-0 rounded-[3rem] bg-white/30 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.03),inset_0_0_80px_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div 
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/80 blur-[1px]"
            style={{
              left: p.left,
              top: p.top,
              animation: `particleFloat ${p.animationDuration} ease-in-out infinite ${p.animationDelay}`
            }}
          />
        ))}
      </div>

      {isIdle && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-full aspect-square rounded-full border border-blue-400/20" style={{ animation: 'radarPing 4s linear infinite' }} />
          <div className="absolute w-full aspect-square rounded-full border border-purple-400/20" style={{ animation: 'radarPing 4s linear infinite 1.33s' }} />
          <div className="absolute w-full aspect-square rounded-full border border-orange-400/20" style={{ animation: 'radarPing 4s linear infinite 2.66s' }} />
        </div>
      )}

      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(#1e293b 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400/30 to-transparent" />
      <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-gray-400/30 to-transparent" />
      
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 z-10">
        <div className={isIdle ? 'animate-float' : ''}>
          <AgentNode name="Empath" color={COLORS.empath} coords="(0,0,1)" isActive={activeSpeaker === 'empath'} icon={<Heart size={20} color={COLORS.surface} />} />
        </div>
      </div>

      <div className="absolute top-1/2 left-[8%] -translate-y-1/2 z-10">
        <div className={isIdle ? 'animate-float-delayed' : ''}>
          <AgentNode name="Strategist" color={COLORS.strategist} coords="(-1,0,0)" isActive={activeSpeaker === 'strategist'} icon={<BrainCircuit size={20} color={COLORS.surface} />} />
        </div>
      </div>

      <div className="absolute top-1/2 right-[8%] -translate-y-1/2 z-10">
        <div className={isIdle ? 'animate-float-slow' : ''}>
          <AgentNode name="Stoic" color={COLORS.stoic} coords="(1,0,0)" isActive={activeSpeaker === 'stoic'} icon={<Shield size={20} color={COLORS.surface} />} />
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-[-40px] rounded-full border border-gray-400/30 border-dashed" />
          <div className="absolute inset-[-80px] rounded-full border border-gray-400/20" />
          
          {activeSpeaker === 'user' && (
            <>
              <div className="absolute inset-[-24px] bg-green-400 rounded-full opacity-40 animate-ping duration-1000" />
              <div className="absolute inset-[-48px] bg-green-400 rounded-full opacity-20 animate-ping duration-1000 delay-150" />
            </>
          )}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 relative z-10 bg-white"
            style={{ 
              transform: activeSpeaker === 'user' ? 'scale(1.2)' : 'scale(1)', 
              border: `4px solid ${COLORS.user}`,
              boxShadow: activeSpeaker === 'user' ? `0 10px 40px ${COLORS.user}66` : '0 8px 30px rgba(0,0,0,0.12)'
            }}
          >
            <User size={24} color={COLORS.user} />
          </div>
          <div className="absolute -bottom-9 text-[11px] font-extrabold text-gray-600 bg-white/95 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-md whitespace-nowrap tracking-widest border border-gray-200">
            YOU
          </div>
        </div>
      </div>
    </div>
  );
}
