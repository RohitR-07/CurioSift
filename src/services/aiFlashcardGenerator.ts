// Flashcard generation service for frontend – src/services/aiFlashcardGenerator.ts

// No toast import needed

export interface Flashcard {
  front: string;
  back: string;
  explanation?: string;
}

export interface FlashcardGenerationResult {
  cards: Flashcard[];
  source: 'gemini' | 'mock';
  generatedAt: number;
  fallbackReason?: string;
}

/**
 * Calls the backend /api/flashcards endpoint.
 * Returns a validated result or throws an error.
 */
export async function generateFlashcards({
  documentText,
  documentName,
  cardCount = 10,
  topic = '',
}: {
  documentText: string;
  documentName: string;
  cardCount?: number;
  topic?: string;
}): Promise<FlashcardGenerationResult> {
  try {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
        documentName,
        cardCount,
        topic,
      }),
    });

    if (!response.ok) {
      // Attempt to read error message for fallback info
      const errData = await response.json().catch(() => ({}));
      const fallbackReason = errData.error || `HTTP ${response.status}`;
      // Use mock fallback
      const mock = await import('./mockFlashcardGenerator');
      const mockCards = mock.generateMockFlashcards(cardCount);
      return {
        cards: mockCards,
        source: 'mock',
        generatedAt: Date.now(),
        fallbackReason,
      };
    }

    const data = await response.json();
    if (!data.cards || !Array.isArray(data.cards)) {
      throw new Error('Invalid response format from flashcard service.');
    }

    return {
      cards: data.cards,
      source: data.source ?? 'gemini',
      generatedAt: Date.now(),
    };
  } catch (err: any) {
    // Network or parsing error – fallback to mock
    const fallbackReason = err?.message || 'Network error';
    const mock = await import('./mockFlashcardGenerator');
    const mockCards = mock.generateMockFlashcards(cardCount);
    return {
      cards: mockCards,
      source: 'mock',
      generatedAt: Date.now(),
      fallbackReason,
    };
  }
}
