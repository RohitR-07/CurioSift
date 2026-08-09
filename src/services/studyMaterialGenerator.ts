/**
 * Study Material Generator — Module 5 Phase 3
 *
 * Clean provider abstraction so mock generation can later be swapped for a
 * real AI API (OpenAI, Gemini, etc.) without changing any UI code.
 *
 * Architecture:
 *   GenerationProvider (interface)
 *     ├── MockGenerationProvider   ← active now
 *     └── AIGenerationProvider    ← future (plug in when ready)
 *
 * The exported `generateStudyMaterial()` function delegates to whichever
 * provider is currently configured via `activeProvider`.
 */

import type {
  ExtractedContent,
} from './documentProcessor';

import type {
  GenerationConfig,
  GeneratedContent,
  GeneratedSummary,
  GeneratedNotes,
  GeneratedQuiz,
  QuizQuestion,
  SummaryLength,
  NoteLength,
  QuizDifficulty,
} from '../types/studyMaterial';

// ─── Provider Interface ────────────────────────────────────────────────────────

export interface GenerationProvider {
  generate(content: ExtractedContent, config: GenerationConfig): Promise<GeneratedContent>;
}

// ─── Mock Generation Provider ─────────────────────────────────────────────────
// NOTE: This provider uses extracted text to create realistic-looking
// structured content. It is NOT AI output — it is a UI demonstration
// layer. Replace `activeProvider` below with an AI provider when ready.

function truncate(text: string, words: number): string {
  const ws = text.split(/\s+/);
  return ws.length <= words ? text : ws.slice(0, words).join(' ') + '…';
}

function splitIntoChunks(text: string, chunkCount: number): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  if (sentences.length === 0) return Array(chunkCount).fill(text.slice(0, 100) || 'No content');

  const perChunk = Math.max(1, Math.floor(sentences.length / chunkCount));
  return Array.from({ length: chunkCount }, (_, i) => {
    const start = i * perChunk;
    const end = i === chunkCount - 1 ? sentences.length : start + perChunk;
    return sentences.slice(start, end).join(' ').trim() || '—';
  });
}

function extractHeadings(text: string, count: number): string[] {
  // Try to extract lines that look like headings (short, capitalised lines)
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const headingLike = lines.filter(
    (l) => l.length < 60 && l.trim() === l.trim().replace(/[a-z]/, (c) => c)
  );
  const candidates = headingLike.length >= count ? headingLike : lines;

  const headings: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = candidates[Math.floor((i / count) * candidates.length)] ?? `Section ${i + 1}`;
    headings.push(truncate(raw.trim(), 8) || `Section ${i + 1}`);
  }
  return headings;
}

class MockGenerationProvider implements GenerationProvider {
  private async delay(ms = 800): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private generateSummary(
    content: ExtractedContent,
    length: SummaryLength,
  ): GeneratedSummary {
    const wordLimits: Record<SummaryLength, number> = {
      short: 80,
      medium: 160,
      detailed: 300,
    };
    const keyPointCount: Record<SummaryLength, number> = {
      short: 3,
      medium: 5,
      detailed: 7,
    };

    const limit = wordLimits[length];
    const kpCount = keyPointCount[length];
    const summaryText = truncate(content.fullText, limit);

    // Extract key points from different parts of the text
    const chunks = splitIntoChunks(content.fullText, kpCount);
    const keyPoints = chunks.map((c) => truncate(c, 20));

    return {
      type: 'summary',
      title: `Document Summary`,
      content: summaryText,
      keyPoints,
      length,
    };
  }

  private generateNotes(
    content: ExtractedContent,
    noteLength: NoteLength,
  ): GeneratedNotes {
    const sectionCount = noteLength === 'concise' ? 4 : 7;
    const wordsPerSection = noteLength === 'concise' ? 40 : 80;

    // Use page breaks for sections when available, else split text
    let sections;
    if (content.pages.length > 1 && content.pageCount >= sectionCount) {
      // One section per page (up to sectionCount pages)
      sections = content.pages.slice(0, sectionCount).map((p) => ({
        heading: `Page ${p.pageNumber} Summary`,
        content: truncate(p.text, wordsPerSection),
      }));
    } else {
      const headings = extractHeadings(content.fullText, sectionCount);
      const chunks = splitIntoChunks(content.fullText, sectionCount);
      sections = headings.map((h, i) => ({
        heading: h,
        content: truncate(chunks[i] ?? '', wordsPerSection),
      }));
    }

    return {
      type: 'notes',
      title: `Study Notes`,
      sections,
      length: noteLength,
    };
  }

  private generateQuiz(
    content: ExtractedContent,
    questionCount: number,
    difficulty: QuizDifficulty,
  ): GeneratedQuiz {
    // Extract sentences that are substantial enough to base questions on
    const sentences = content.fullText
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.split(/\s+/).length >= 6)
      .filter((s) => s.length < 200);

    const wordPool = content.fullText.split(/\s+/).filter((w) => w.length > 4);

    const questions: QuizQuestion[] = [];

    for (let i = 0; i < questionCount; i++) {
      const idx = Math.floor((i / questionCount) * sentences.length);
      const sentence = sentences[idx] ?? `Key concept ${i + 1} from the document.`;

      // Build a cloze-style question by blanking the last meaningful word
      const words = sentence.split(/\s+/);
      const targetWord = words.find((w) => w.length > 4) ?? words[words.length - 1];
      const questionText =
        difficulty === 'easy'
          ? `Which of the following best completes: "${sentence.replace(targetWord, '___')}"?`
          : difficulty === 'medium'
          ? `Based on the document, what does the following refer to: "${truncate(sentence, 12)}"`
          : `Critically evaluate: "${truncate(sentence, 10)}" — what is the most accurate interpretation?`;

      // Generate plausible wrong answers from random words in the doc
      const shuffledPool = [...wordPool].sort(() => 0.5 - Math.random());
      const distractors = shuffledPool
        .filter((w) => w.toLowerCase() !== targetWord.toLowerCase())
        .slice(0, 3)
        .map((w) => w.replace(/[.,!?;:]/g, ''));

      while (distractors.length < 3) distractors.push(`Option ${distractors.length + 1}`);

      const correctAnswer = targetWord.replace(/[.,!?;:]/g, '');
      const options: [string, string, string, string] = [
        correctAnswer,
        distractors[0],
        distractors[1],
        distractors[2],
      ].sort(() => 0.5 - Math.random()) as [string, string, string, string];

      questions.push({
        id: `q-${i}`,
        question: questionText,
        options,
        correctAnswer,
        explanation: `This answer is derived from the document content: "${truncate(sentence, 20)}"`,
      });
    }

    return {
      type: 'quiz',
      title: `Quiz — ${questionCount} Questions`,
      questions,
      difficulty,
    };
  }

  async generate(content: ExtractedContent, config: GenerationConfig): Promise<GeneratedContent> {
    // Simulate realistic async delay
    await this.delay(900 + Math.random() * 600);

    switch (config.type) {
      case 'summary':
        return this.generateSummary(content, config.summaryLength ?? 'medium');
      case 'notes':
        return this.generateNotes(content, config.noteLength ?? 'concise');
      case 'quiz':
        return this.generateQuiz(
          content,
          config.questionCount ?? 5,
          config.difficulty ?? 'medium',
        );
    }
  }
}

// ─── Active Provider ──────────────────────────────────────────────────────────
// To switch to a real AI provider, replace `activeProvider` here.
// The rest of the codebase (UI, context) requires no changes.

const activeProvider: GenerationProvider = new MockGenerationProvider();

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateStudyMaterial(
  content: ExtractedContent,
  config: GenerationConfig,
): Promise<GeneratedContent> {
  return activeProvider.generate(content, config);
}
