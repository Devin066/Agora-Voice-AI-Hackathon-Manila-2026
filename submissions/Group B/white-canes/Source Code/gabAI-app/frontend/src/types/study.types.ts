// src/types/study.types.ts 

export interface StatCardData { 
  label: string 
  value: string 
  subtext: string 
  delta?: string 
  deltaType?: 'positive' | 'negative' 
} 

export interface Topic { 
  id: string 
  title: string 
  description: string 
  icon?: string 
  questionCount: number 
  proficiency: number   // 0–100 
} 

export interface AreaToReview { 
  topic: string 
  category: string 
  proficiency: number 
} 

export type FileType = 
  | 'pdf' | 'doc' | 'docx' | 'txt' | 'xls' | 'xlsx' | 'csv' 
  | 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' 

export interface Document { 
  id: string 
  name: string 
  size: number 
  sessionDate: string   // date of the Voice Session it was shared in 
  fileType: FileType 
  status: 'ready' | 'processing' | 'unavailable' 
} 

export interface PendingAttachment { 
  id: string            // temp client-side ID 
  file: File 
  filename: string 
  fileType: FileType 
  previewUrl?: string   // for images only 
} 

export interface TutorSettings { 
  name: string 
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' 
  teachingStyle: 'encouraging' | 'challenging' | 'neutral' 
} 

export interface ProgressStats { 
  totalStudyTime: string 
  averageScore: number 
  topicsMastered: number 
  totalTopics: number 
  areasToReview: number 
} 

export interface WeeklyData { 
  day: string 
  minutes: number 
  score: number 
} 
