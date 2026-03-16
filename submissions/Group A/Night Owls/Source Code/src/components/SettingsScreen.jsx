import React from 'react';
import { Heart, BrainCircuit, Shield } from 'lucide-react';
import { AgentConfigCard } from './AgentConfigCard';
import { COLORS } from '../constants';

export function SettingsScreen() {
  return (
    <div className="p-4 h-full flex flex-col relative z-10">
      <div className="mt-8 mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">Agent Setup</h1>
        <p className="text-[13px] text-gray-500 font-semibold mt-1">Configure AI personality parameters</p>
      </div>

      <div className="space-y-5 overflow-y-auto pb-10 no-scrollbar px-1">
        <AgentConfigCard 
          role="Empath" 
          icon={<Heart size={20} color={COLORS.surface} />}
          color={COLORS.empath}
          desc="Emotional validation & support"
          voice="Calm & Soothing"
          prompt="You are a deeply empathetic listener. Acknowledge feelings without immediately trying to fix them. Speak with warmth."
        />
        <AgentConfigCard 
          role="Strategist" 
          icon={<BrainCircuit size={20} color={COLORS.surface} />}
          color={COLORS.strategist}
          desc="Logical reframing & planning"
          voice="Analytical & Clear"
          prompt="You are a practical strategist. Break down the user's problem into actionable, logical steps. Focus on solutions."
        />
        <AgentConfigCard 
          role="Stoic" 
          icon={<Shield size={20} color={COLORS.surface} />}
          color={COLORS.stoic}
          desc="Philosophical grounding"
          voice="Deep & Resonant"
          prompt="You are a Stoic philosopher. Remind the user of what is in their control and offer enduring wisdom. Keep it brief."
        />
      </div>
    </div>
  );
}
