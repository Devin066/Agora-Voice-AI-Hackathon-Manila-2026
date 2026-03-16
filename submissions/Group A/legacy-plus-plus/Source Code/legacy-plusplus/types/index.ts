export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  targetSounds: string[];
  parentId: string;
}

export interface SessionScore {
  pronunciation: number; // 0-100
  fluency: number; // 0-100
  articulation: number; // 0-100
  confidence: number; // 0-100
}

export interface FeedbackChip {
  type: "success" | "warning" | "tip";
  message: string;
}

export interface SessionResult {
  id: string;
  childId: string;
  startedAt: string;
  endedAt: string;
  scores: SessionScore;
  promptsCompleted: number;
  totalPrompts: number;
  feedbackEvents: FeedbackChip[];
  nextRecommendation: string;
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  consentGiven: boolean;
  consentDate: string;
}
