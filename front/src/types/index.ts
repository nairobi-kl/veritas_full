export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  groupNumber: string;
  groupCode: string;
  profile: string;
  isAuthenticated: boolean;
  role: 'student' | 'teacher';
  token?: string; 
}

export interface Test {
  id: string;
  subject: string;
  lecturer: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  maxScore: number;
  color: string;
  status: 'available' | 'in_progress' | 'completed';
  groups?: string[];
}

export interface TestResult {
  id: string;
  testId: string;
  subject: string;
  lecturer: string;
  title: string;
  startTime: string;
  endTime: string;
  score: number;
  maxScore: number;
  status: 'completed';
  studentName?: string;
  studentGroup?: string;
}

export interface AuthError {
  type: 'login' | 'register';
  message: string;
}

export interface QuestionOption {
  id: string | number;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: QuestionOption[]; 
  points: number;
}

export interface TestSession {
  id: string;
  testId: string;
  subject: string;
  title: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  duration: number; 
  questions: Question[];
  answers: { [questionId: string]: string | string[] };
  timeRemaining: number;
  finalScore?: number;
}

export interface TestResult {
  id: string;
  testId: string;
  subject: string;
  lecturer: string;
  title: string;
  startTime: string;
  endTime: string;
  score: number;
  maxScore: number;
  status: 'completed';
  studentName?: string;
  studentGroup?: string;
}

export interface StudentResult {
  id: string;
  studentName: string;
  studentGroup: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface CreateTestData {
  subject: string;
  title: string;
  timeLimit: number;
  groups: number[];
  startDate: string;
  startTime: string;
  endTime: string;
  questions: CreateQuestionData[];
}

export interface DraftQuestion {
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];           
  correctAnswer: number[];      
  points: number;
}

export interface CreateQuestionData {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string[];      
  points: number;
}

export interface CreateTestData {
  subject: string;
  title: string;
  timeLimit: number;
  groups: number[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  questions: CreateQuestionData[];
}
export interface StudentResult {
  id: string;
  studentName: string;
  studentGroup: string;
  score: number;
  maxScore: number;
  completedAt: string;
}


