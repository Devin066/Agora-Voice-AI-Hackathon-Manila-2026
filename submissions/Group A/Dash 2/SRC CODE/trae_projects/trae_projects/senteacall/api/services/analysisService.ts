
// Mock Analysis Service for STT and NLU

interface AnalysisResult {
  transcript: string;
  riskScore: number;
  threats: string[];
  recommendation: string;
}

export interface ThreatState {
  riskScore: number;
  threats: Set<string>;
  financialContextHits: number;
  sensitiveRequestHits: number;
  urgencyHits: number;
  authorityHits: number;
}

export const createInitialThreatState = (): ThreatState => {
  return {
    riskScore: 0,
    threats: new Set<string>(),
    financialContextHits: 0,
    sensitiveRequestHits: 0,
    urgencyHits: 0,
    authorityHits: 0,
  };
};

export const analyzeAudioChunk = async (audioData: Buffer): Promise<string> => {
  // Simulate STT processing delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return mock transcript segments based on random logic or predefined scenarios
  const phrases = [
    "Hello, I am calling from your bank regarding a suspicious transaction.",
    "We need you to verify your account immediately.",
    "Please provide your one-time password sent to your device.",
    "If you do not act now, your account will be frozen.",
    "This is a limited time offer for a loan.",
    "Can you confirm your social security number?",
    "I am calling from the tax office.",
    "You have a refund waiting for you."
  ];
  
  return phrases[Math.floor(Math.random() * phrases.length)];
};

export const getRecommendation = (riskScore: number): string => {
  if (riskScore > 80) {
    return 'High Risk! Do not share any information. Hang up immediately.';
  }
  if (riskScore > 50) {
    return 'Medium Risk. Verify caller identity through official channels.';
  }
  if (riskScore > 20) {
    return 'Low Risk. Proceed with caution.';
  }
  return 'Safe';
};

const hasAny = (haystack: string, needles: string[]): boolean => {
  return needles.some((n) => haystack.includes(n));
};

export const analyzeThreat = async (transcript: string): Promise<AnalysisResult> => {
  // Backwards-compatible single-turn analysis.
  // For cumulative context scoring, use analyzeThreatIncremental().
  const state = createInitialThreatState();
  const updated = await analyzeThreatIncremental(transcript, state);
  return {
    transcript,
    riskScore: updated.riskScore,
    threats: Array.from(updated.threats),
    recommendation: getRecommendation(updated.riskScore),
  };
};

export const analyzeThreatIncremental = async (
  transcript: string,
  state: ThreatState,
): Promise<ThreatState> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const lowerTranscript = transcript.toLowerCase();

  const isFinancial = hasAny(lowerTranscript, ['bank', 'account', 'transaction', 'card', 'payment']);
  const isSensitive = hasAny(lowerTranscript, [
    'verify',
    'password',
    'otp',
    'one-time password',
    'verification code',
    'social security',
    'pin',
  ]);
  const isUrgent = hasAny(lowerTranscript, ['immediately', 'act now', 'urgent', 'right now', 'frozen', 'suspended']);
  const isAuthority = hasAny(lowerTranscript, ['tax office', 'refund', 'police', 'government', 'irs']);

  let delta = 0;

  if (isFinancial) {
    state.financialContextHits += 1;
    state.threats.add('Financial Context');
    delta += state.financialContextHits === 1 ? 15 : 8;
  }

  if (isSensitive) {
    state.sensitiveRequestHits += 1;
    state.threats.add('Sensitive Data Request');
    delta += state.sensitiveRequestHits === 1 ? 25 : 12;
    if (state.financialContextHits > 0) {
      delta += 10;
    }
  }

  if (isUrgent) {
    state.urgencyHits += 1;
    state.threats.add('Urgency/Pressure');
    delta += state.urgencyHits === 1 ? 10 : 6;
    if (state.sensitiveRequestHits > 0) {
      delta += 8;
    }
  }

  if (isAuthority) {
    state.authorityHits += 1;
    state.threats.add('Authority Impersonation');
    delta += state.authorityHits === 1 ? 18 : 10;
    if (state.urgencyHits > 0) {
      delta += 8;
    }
  }

  state.riskScore = Math.min(100, state.riskScore + delta);
  return state;
};
