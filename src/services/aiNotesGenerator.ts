// src/services/aiNotesGenerator.ts
// Frontend service — calls POST /api/notes

export interface NotesDefinition {
  term: string;
  definition: string;
}

export interface NotesFormula {
  label: string;
  expression: string;
}

export interface NotesSection {
  heading: string;
  keyPoints: string[];
  definitions: NotesDefinition[];
  formulas: NotesFormula[];
  summary: string;
}

export interface RevisionNotes {
  title: string;
  sections: NotesSection[];
  quickRecap: string[];
}

export interface NotesGenerationResult {
  notes: RevisionNotes;
  source: 'gemini';
  generatedAt: number;
}

export async function generateNotes({
  documentText,
  documentName,
  topic = '',
}: {
  documentText: string;
  documentName: string;
  topic?: string;
}): Promise<NotesGenerationResult> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentText, documentName, topic }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (HTTP ${response.status})`);
  }

  if (!data.notes || !Array.isArray(data.notes.sections)) {
    throw new Error('Invalid response from notes service.');
  }

  return {
    notes: data.notes as RevisionNotes,
    source: 'gemini',
    generatedAt: data.generatedAt ?? Date.now(),
  };
}
