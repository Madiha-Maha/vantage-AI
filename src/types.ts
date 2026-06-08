export enum InterviewDifficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

export interface InterviewSession {
  id: string;
  date: Date;
  role: string;
  difficulty: InterviewDifficulty;
  questions: InterviewQuestion[];
  overallScore: number;
  feedback: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  answer?: string;
  transcript?: string;
  analysis?: QuestionAnalysis;
}

export interface QuestionAnalysis {
  score: number;
  confidence: number;
  speakingSpeed: number; // words per minute
  keywordsFound: string[];
  tips: string[];
  eyeContactScore?: number;
}

export interface InterviewConfig {
  role: string;
  industry: string;
  difficulty: InterviewDifficulty;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  recordingEnabled: boolean;
  privacyMode: boolean;
  biometricAnalysis: boolean;
  // Advanced Features
  aiMentorship: boolean;
  realTimeMetrics: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  title: string;
  bio: string;
  avatar?: string;
  skills: string[];
  experience: string;
  interests: string[];
  socials: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}
