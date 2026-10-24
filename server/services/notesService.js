// server/services/notesService.js
// Generates structured revision notes from document text using Gemini.

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const MAX_CONTEXT_CHARS = parseInt(process.env.GEMINI_MAX_CONTEXT || '40000', 10);
const CHUNK_CHARS = parseInt(process.env.GEMINI_CHUNK_SIZE || '35000', 10);

// ─── Retry helpers (same pattern as quizService) ──────────────────────────────

const MAX_ATTEMPTS = 3;

function isRetryable(err) {
  if (new Set([429, 500, 503]).has(err?.status)) return true;
  if (new Set(['UNAVAILABLE', 'RESOURCE_EXHAUSTED', 'INTERNAL']).has(err?.code)) return true;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('503') || msg.includes('overload') || msg.includes('unavailable');
}

function backoffMs(attempt) {
  return Math.pow(2, attempt - 1) * 1000 + Math.random() * 200;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildSystemInstruction() {
  return `You are an expert academic tutor generating structured exam revision notes for StudyMate AI.
Your notes must be grounded STRICTLY in the provided document. Do not add external information.
Return ONLY a valid JSON object with this exact structure:
{
  "title": "<document or topic title>",
  "sections": [
    {
      "heading": "<topic heading>",
      "keyPoints": ["<concise bullet point>", ...],
      "definitions": [{ "term": "<term>", "definition": "<definition>" }, ...],
      "formulas": [{ "label": "<name>", "expression": "<formula or equation>" }, ...],
      "summary": "<1-2 sentence summary of this section>"
    }
  ],
  "quickRecap": ["<one-liner recap point>", ...]
}
Rules:
- Include 3-7 sections based on document structure.
- keyPoints: 3-6 bullets per section, short and exam-focused.
- definitions: include ONLY terms explicitly defined in the document.
- formulas: include ONLY if the document contains mathematical/chemical/logical expressions.
- quickRecap: 5-8 one-liners for last-minute revision.
- Do NOT include markdown, preamble, or any text outside the JSON object.`;
}

function buildNotesPrompt(documentText, topic) {
  const topicClause = topic
    ? `Focus specifically on the topic: "${topic}".`
    : 'Cover all major topics in the document.';

  return `Generate comprehensive exam revision notes from the following document.
${topicClause}

DOCUMENT TEXT:
"""
${documentText}
"""

Return a single JSON object following the structure specified in your instructions.`;
}

function selectContext(fullText, topic) {
  if (!fullText) return '';
  if (fullText.length <= MAX_CONTEXT_CHARS) return fullText;
  if (topic?.trim()) {
    const idx = fullText.toLowerCase().indexOf(topic.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - Math.floor(CHUNK_CHARS / 4));
      return fullText.slice(start, Math.min(fullText.length, start + CHUNK_CHARS));
    }
  }
  return fullText.slice(0, CHUNK_CHARS);
}

// ─── Gemini call with exponential-backoff retry ────────────────────────────────

async function callGemini(prompt) {
  if (!ai) throw new Error('GEMINI_API_KEY is not configured on the server.');

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        config: {
          systemInstruction: buildSystemInstruction(),
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text;
    } catch (err) {
      lastError = err;
      if (isRetryable(err) && attempt < MAX_ATTEMPTS) {
        const wait = backoffMs(attempt);
        console.warn(
          `[notesService] Attempt ${attempt}/${MAX_ATTEMPTS} failed ` +
          `(status=${err?.status ?? 'unknown'}). Retrying in ${Math.round(wait)}ms…`
        );
        await new Promise(r => setTimeout(r, wait));
      } else {
        break;
      }
    }
  }
  if (isRetryable(lastError)) {
    const friendly = new Error(
      'The AI service is temporarily overloaded. Please wait a moment and try again.'
    );
    friendly.status = 503;
    throw friendly;
  }
  throw lastError;
}

// ─── JSON extraction & validation ─────────────────────────────────────────────

function extractJson(rawText) {
  if (!rawText) throw new Error('Model returned an empty response.');
  let text = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Model response does not contain a JSON object. Preview: "${text.slice(0, 200)}"`);
  }
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    throw new Error(`Failed to parse notes JSON: ${e.message}. Preview: "${text.slice(0, 300)}"`);
  }
}

function validateNotes(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Notes response is not an object.');
  if (typeof obj.title !== 'string') obj.title = 'Revision Notes';
  if (!Array.isArray(obj.sections) || obj.sections.length === 0) {
    throw new Error('Notes response missing sections array.');
  }
  obj.sections = obj.sections.map((s, i) => ({
    heading: typeof s.heading === 'string' ? s.heading : `Section ${i + 1}`,
    keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints.filter(p => typeof p === 'string') : [],
    definitions: Array.isArray(s.definitions)
      ? s.definitions.filter(d => d?.term && d?.definition)
      : [],
    formulas: Array.isArray(s.formulas)
      ? s.formulas.filter(f => f?.label && f?.expression)
      : [],
    summary: typeof s.summary === 'string' ? s.summary : '',
  }));
  obj.quickRecap = Array.isArray(obj.quickRecap)
    ? obj.quickRecap.filter(r => typeof r === 'string')
    : [];
  return obj;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {{ documentText: string, documentName: string, topic?: string }} opts
 * @returns {Promise<{ notes: object, source: 'gemini', generatedAt: number }>}
 */
export async function generateRevisionNotes({ documentText, documentName, topic = '' }) {
  const context = selectContext(documentText, topic);

  const wordCount = context.trim().split(/\s+/).length;
  if (wordCount < 30) {
    throw new Error(
      `Document has too little text (${wordCount} words). ` +
      'A minimum of 30 words is required to generate revision notes.'
    );
  }

  console.log(
    `[notesService] Generating notes for "${documentName}" | ` +
    `Context: ${context.length} chars | Topic: "${topic || 'entire document'}"`
  );

  const prompt = buildNotesPrompt(context, topic);
  const raw = await callGemini(prompt);
  const parsed = extractJson(raw);
  const notes = validateNotes(parsed);

  return { notes, source: 'gemini', generatedAt: Date.now() };
}
