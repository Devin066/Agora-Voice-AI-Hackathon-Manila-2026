export const COLORS = {
  empath: '#6BA8FF',
  strategist: '#9B8CFF',
  stoic: '#FFB36B',
  user: '#4CAF50',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#333333',
  textMuted: '#666666'
};

export const DEMO_TRANSCRIPT = {
  user: "I feel overwhelmed with school work.",
  empath: "It sounds like you're carrying a lot right now. It's completely valid to feel that way.",
  strategist: "Let's break the workload into manageable parts. What's due first?",
  stoic: "Remember that hardship builds resilience. Focus only on what is within your control today."
};

export const AGORA_CONFIG = {
  APP_ID: import.meta.env.VITE_AGORA_APP_ID || '',
  CHANNEL: import.meta.env.VITE_AGORA_CHANNEL || 'Serene',
  TOKEN: import.meta.env.VITE_AGORA_TOKEN || '',
  CUSTOMER_ID: import.meta.env.VITE_AGORA_CUSTOMER_ID || '',
  CUSTOMER_SECRET: import.meta.env.VITE_AGORA_CUSTOMER_SECRET || '',
  AGENTS: {
     empath: import.meta.env.VITE_AGENT_ID_EMPATH || '1001',
     strategist: import.meta.env.VITE_AGENT_ID_STRATEGIST || '1002',
     stoic: import.meta.env.VITE_AGENT_ID_STOIC || '1003'
   }
};

