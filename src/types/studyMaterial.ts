/**
 * Study Material Types — Module 5 Phase 3
 *
 * All types for study material generation, configuration, and generated content.
 * Designed so the UI never needs to change when the mock provider is swapped
 * for a real AI API.
 */

// ─── Generation Configuration ──────────────────────────────────────────────────

export type MaterialType = 'summary' | 'notes' | 'quiz';
export type SummaryLength = 'short' | 'medium' | 'detailed';
export type NoteLength = 'concise' | 'detailed';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizCount = 5 | 10 | 15;

export interface GenerationConfig {
  type: MaterialType;
  // Summary options
  summaryLength?: SummaryLength;
  // Notes options
  noteLength?: NoteLength;
  // Quiz options
  questionCount?: QuizCount;
  difficulty?: QuizDifficulty;
}

// ─── Generated Content Types ───────────────────────────────────────────────────

export interface GeneratedSummary {
  type: 'summary';
  title: string;
  content: string;
  keyPoints: string[];
  length: SummaryLength;
}

export interface NoteSection {
  heading: string;
  content: string;
}

export interface GeneratedNotes {
  type: 'notes';
  title: string;
  sections: NoteSection[];
  length: NoteLength;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string]; // always 4 options
  correctAnswer: string;                     // one of the options
  explanation: string;
}

export interface GeneratedQuiz {
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
  difficulty: QuizDifficulty;
}

/** Discriminated union of all possible generated outputs */
export type GeneratedContent = GeneratedSummary | GeneratedNotes | GeneratedQuiz;

// ─── Study Material Record (persisted) ────────────────────────────────────────

export type GenerationStatus = 'idle' | 'generating' | 'generated' | 'error';

export interface StudyMaterial {
  id: string;
  fileId: string;
  config: GenerationConfig;
  content?: GeneratedContent;
  status: GenerationStatus;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}
