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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description: string[];
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Skill {
  _id?: string;
  name: string;
  level?: string;
}

export interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Profile {
  email?: string;
  fullName?: string;
  title?: string;
  summary?: string;
  location?: string;
  phone?: string;
  aiSummary?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  skills: (string | Skill)[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
}

export interface ProfileFormData {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  aiSummary?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  lastUpdated?: string;
  jobUrl: string;
  location: string;
  jobType: string; // e.g., "Full Time", "Remote"
  benefits?: string[];
  companyDetails?: {
    industry: string;
    size: string;
    website: string;
    address: string;
    description: string;
  };
  experienceLevel: string; // e.g., "Junior", "Mid"
  minEducation?: string;
  salary?:
    | string
    | {
        min: number;
        max: number;
        currency: string;
      };
  skills: string[];
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token: number;
}
