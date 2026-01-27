interface CategoryTitle {
  title: string;
}

export interface Question {
  _id: string;
  categoryId: string;
  level: string;
  type: string;
  content: string;
  followUp: boolean;
  audioUrl: string;
  category: CategoryTitle;
}

export interface Answer {
  questionId: string;
  question: string;
  transcription: string;
  audioURL: string;
  isFollowUp?: boolean;
  duration?: number;
  acknowledgment?: string;
}

export interface FollowUpQuestion {
  text: string;
  audioBase64: string;
  parentQuestionId: string;
}

export interface AcknowledgmentResponse {
  text: string;
  audioBase64: string;
  questionId: string;
}

export interface Category {
  _id: string;
  title: string;
  description: string;
  icon: string;
  level?: {
    junior: boolean;
    middle: boolean;
    senior: boolean;
  };
  published?: boolean;
}

export interface InterviewConfig {
  categoryId: string;
  categoryTitle: string;
  level: string;
  tier: string;
  tokenUsage: number;
}

export interface EvaluationScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewEvaluation {
  overallScore: number;
  overallGrade: string;
  totalQuestions: number;
  completionTime: string;
  evaluations: EvaluationScore[];
  summary: string;
  recommendations: string[];
}
