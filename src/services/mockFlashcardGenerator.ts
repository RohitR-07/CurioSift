// Mock flashcard generator for frontend fallback – src/services/mockFlashcardGenerator.ts

export interface Flashcard {
  front: string;
  back: string;
  explanation?: string;
}

/** Generates deterministic mock flashcards */
export function generateMockFlashcards(count: number = 10): Flashcard[] {
  const samples: Flashcard[] = [
    { front: 'What is the capital of France?', back: 'Paris' },
    { front: 'What does HTML stand for?', back: 'HyperText Markup Language' },
    { front: 'What is 2 + 2?', back: '4' },
    { front: 'Who wrote "To be, or not to be"?', back: 'William Shakespeare' },
    { front: 'What is the chemical symbol for water?', back: 'H₂O' },
    { front: 'What planet is known as the Red Planet?', back: 'Mars' },
    { front: 'What is the largest organ in the human body?', back: 'Skin' },
    { front: 'What language is used for styling web pages?', back: 'CSS' },
    { front: 'What is the speed of light in vacuum (approx.)?', back: '3.00 × 10⁸ m/s' },
    { front: 'What does CPU stand for?', back: 'Central Processing Unit' },
  ];
  // Return first N, repeat if needed
  const result: Flashcard[] = [];
  for (let i = 0; i < count; i++) {
    result.push(samples[i % samples.length]);
  }
  return result;
}
