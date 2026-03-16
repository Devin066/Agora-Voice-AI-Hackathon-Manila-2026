export type AgeGroup = "early" | "growing" | "preteen";

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  language: string;
  createdAt: string;
}

export interface SessionScore {
  pronunciation: number;
  fluency: number;
  articulation: number;
  confidence: number;
}

export interface FeedbackChip {
  type: "success" | "tip" | "warning";
  message: string;
}

export interface SessionResult {
  scores: SessionScore;
  promptsCompleted: number;
  totalPrompts: number;
  feedbackEvents: FeedbackChip[];
  weakest: keyof SessionScore;
}

export interface WeekEntry {
  day: string;
  score: number;
  completed: boolean;
}

export interface StoredProfile {
  childId: string;
  childName: string;
  childAge: number;
  parentName: string;
}
