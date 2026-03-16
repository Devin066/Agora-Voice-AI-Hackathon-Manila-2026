export const SCENARIOS = {
  SALARY_NEGOTIATION: {
    id: 'salary-negotiation',
    name: 'Salary Negotiation',
    description: 'Practice negotiating your compensation with an AI hiring manager',
    icon: '💰',
    difficulty: 'Medium',
    avgDuration: '5-7 minutes',
    available: true,
  },
  JOB_INTERVIEW: {
    id: 'job-interview',
    name: 'Job Interview',
    description: 'Answer behavioral questions and handle follow-up pressure',
    icon: '💼',
    difficulty: 'Easy',
    avgDuration: '5-10 minutes',
    available: true,
  },
  PERFORMANCE_REVIEW: {
    id: 'performance-review',
    name: 'Performance Review',
    description: 'Coming soon: discuss impact, growth, and goals with your manager',
    icon: '📊',
    difficulty: 'Hard',
    avgDuration: '8-10 minutes',
    available: false,
  },
}

export const CONVERSATION_CONFIG = {
  THINKING_DELAY_MS: 700,
  MAX_MESSAGE_LENGTH: 500,
}

export const AI_VOICES = {
  HIRING_MANAGER: 'pNInz6obpgDQGcFmaJgB',
  INTERVIEWER: '21m00Tcm4TlvDq8ikWAM',
}

export const ANALYTICS_METRICS = {
  NEGOTIATION: ['settlement_quality', 'evidence_usage', 'pacing', 'confidence'],
  INTERVIEW: ['completeness', 'structure', 'relevance', 'professionalism'],
}
