// Flashcard generation service – server/services/flashcardService.js

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Configuration – environment variables for limits
const MAX_CONTEXT_CHARS = parseInt(process.env.GEMINI_MAX_CONTEXT || "40000", 10);
const CHUNK_CHARS = parseInt(process.env.GEMINI_CHUNK_SIZE || "35000", 10);

/** System instruction for flashcard generation */
function buildSystemInstruction() {
  return `You are an expert educational content creator for StudyMate AI.
Your job is to generate concise flashcards based on the provided document text.
Return ONLY a valid JSON array where each element has the shape:
{ "front": "<term or question>", "back": "<answer or explanation>", "explanation": "<optional detailed explanation>" }
Do NOT include any markdown, preamble, or additional text.`;
}

/** Build the prompt for flashcards */
function buildFlashcardPrompt(documentText, count, topic) {
  const topicClause = topic ? `Focus on the topic: "${topic}".` : 'Cover the main concepts throughout the document.';
  return `Create ${count} flashcards from the following document.
${topicClause}

DOCUMENT TEXT:
"""
${documentText}
"""

Return a JSON array of exactly ${count} objects with keys: front, back, explanation (optional).`;
}

/** Select a context slice from the document */
function selectDocumentContext(fullText, topic) {
  if (!fullText) return '';
  if (fullText.length <= MAX_CONTEXT_CHARS) return fullText;
  if (topic && topic.trim()) {
    const lowerTopic = topic.toLowerCase();
    const lowerText = fullText.toLowerCase();
    const idx = lowerText.indexOf(lowerTopic);
    if (idx !== -1) {
      const start = Math.max(0, idx - Math.floor(CHUNK_CHARS / 4));
      const end = Math.min(fullText.length, start + CHUNK_CHARS);
      return fullText.slice(start, end);
    }
  }
  // Default to first chunk
  return fullText.slice(0, CHUNK_CHARS);
}

/** Returns true for errors safe to retry (mirrors quizService logic). */
function isRetryable(err) {
  if (new Set([429, 500, 503]).has(err?.status)) return true;
  if (new Set(['UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'INTERNAL']).has(err?.code)) return true;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('503') || msg.includes('overload') || msg.includes('unavailable');
}

/** Exponential backoff: ~1 s, ~2 s, ~4 s (plus up to 200 ms jitter). */
function backoffMs(attempt) {
  return Math.pow(2, attempt - 1) * 1000 + Math.random() * 200;
}

const MAX_ATTEMPTS = 3;

/** Call Gemini with exponential-backoff retry logic. */
async function callGemini(prompt) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        config: {
          systemInstruction: buildSystemInstruction(),
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (err) {
      lastError = err; // always capture before deciding whether to retry
      if (isRetryable(err) && attempt < MAX_ATTEMPTS) {
        const wait = backoffMs(attempt);
        console.warn(
          `[flashcardService] Attempt ${attempt}/${MAX_ATTEMPTS} failed ` +
          `(status=${err?.status ?? 'unknown'}, code=${err?.code ?? '—'}). ` +
          `Retrying in ${Math.round(wait)}ms…`
        );
        await new Promise(r => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }

  // Wrap overload errors with a friendly user-facing message
  if (isRetryable(lastError)) {
    const friendly = new Error(
      'The AI service is temporarily overloaded. All 3 attempts failed. ' +
      'Please wait a moment and try again.'
    );
    friendly.status = 503;
    friendly.cause = lastError;
    throw friendly;
  }

  throw lastError;
}

/** Extract JSON array from Gemini response */
function extractJsonArray(rawText) {
  if (!rawText) throw new Error('Model returned an empty response.');
  let text = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Model response does not contain a valid JSON array. Raw response: "${text.slice(0, 200)}"`);
  }
  text = text.slice(start, end + 1);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse model response as JSON: ${e.message}. Preview: "${text.slice(0, 300)}"`);
  }
}

/** Validate flashcard objects */
function validateFlashcards(arr) {
  if (!Array.isArray(arr)) throw new Error('Expected an array of flashcards');
  return arr.map((card, idx) => {
    if (typeof card.front !== 'string' || typeof card.back !== 'string') {
      throw new Error(`Flashcard at index ${idx} missing required fields`);
    }
    return {
      front: card.front.trim(),
      back: card.back.trim(),
      explanation: card.explanation ? card.explanation.trim() : undefined,
    };
  });
}

/** Public API */
export async function generateFlashcards({ documentText, documentName, cardCount = 10, topic }) {
  if (!documentText || !documentText.trim()) {
    throw new Error('Document text is empty. Please process the document first.');
  }
  const context = selectDocumentContext(documentText, topic);
  const prompt = buildFlashcardPrompt(context, cardCount, topic);
  const raw = await callGemini(prompt);
  const parsed = extractJsonArray(raw);
  const valid = validateFlashcards(parsed);
  return { cards: valid.slice(0, cardCount), source: 'gemini' };
}
