/**
 * Quiz Types — Module 7, Phase 1
 *
 * All TypeScript interfaces for quiz generation, configuration, questions,
 * answers, and results. Designed so Phase 2 can swap mock generation for
 * real Gemini AI without changing any component interfaces.
 */

// ─── Configuration ────────────────────────────────────────────────────────────

export type QuizQuestionCount = 5 | 10 | 15 | 20;
export type QuizDifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuizQuestionType = 'mcq' | 'true-false' | 'mixed';

export interface QuizConfig {
  fileId: string;
  questionCount: QuizQuestionCount;
  questionType: QuizQuestionType;
  difficulty: QuizDifficultyLevel;
  /** Custom topic/chapter, or empty string for "entire document" */
  topic: string;
  showExplanations: boolean;
}

// ─── Questions ────────────────────────────────────────────────────────────────

export type QuizOptionKey = 'A' | 'B' | 'C' | 'D';

export interface QuizOption {
  key: QuizOptionKey;
  text: string;
}

/** A multiple-choice question with 4 options. */
export interface MCQQuestion {
  id: string;
  type: 'mcq';
  question: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
  correctKey: QuizOptionKey;
  explanation: string;
}

/** A true-or-false question. Options are always A=True, B=False. */
export interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  question: string;
  options: [QuizOption, QuizOption]; // A = True, B = False
  correctKey: 'A' | 'B';
  explanation: string;
}

export type QuizQuestion = MCQQuestion | TrueFalseQuestion;

// ─── Session ──────────────────────────────────────────────────────────────────

export interface GeneratedQuizSession {
  /** Unique session ID for this quiz attempt */
  sessionId: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  /** Source: 'mock' in Phase 1, 'gemini' in Phase 2+ */
  source: 'mock' | 'gemini';
  generatedAt: number;
}

// ─── User Answers ─────────────────────────────────────────────────────────────

/** Maps question ID → the key the user selected (or null if unanswered) */
export type UserAnswerMap = Record<string, QuizOptionKey | null>;

// ─── Results ─────────────────────────────────────────────────────────────────

export interface QuestionResult {
  question: QuizQuestion;
  userAnswer: QuizOptionKey | null;
  isCorrect: boolean;
}

export interface QuizResult {
  session: GeneratedQuizSession;
  questionResults: QuestionResult[];
  score: number;        // number of correct answers
  total: number;
  percentage: number;   // 0–100
  completedAt: number;
}

// ─── UI State Machine ─────────────────────────────────────────────────────────

export type QuizPageView =
  | 'config'        // Material selection + configuration form
  | 'loading'       // Mock generation spinner
  | 'quiz'          // Active question navigation
  | 'results';      // Score + review screen
