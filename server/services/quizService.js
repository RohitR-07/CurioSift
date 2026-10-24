/**
 * Quiz Generation Service — server/services/quizService.js
 *
 * Generates document-grounded quiz questions using the Gemini API.
 * Reuses the same GoogleGenAI instance and model as aiService.js.
 *
 * Design principles:
 *  - Never expose the API key to the client
 *  - Validate and sanitise Gemini output before returning
 *  - Return structured JSON that maps directly to the frontend QuizQuestion type
 *  - Gracefully handle malformed model output with clear error messages
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum characters of document text to send in a single request (~50k tokens) */
const MAX_CONTEXT_CHARS = parseInt(process.env.GEMINI_MAX_CONTEXT || "40000", 10);

/** Maximum characters per chunk when splitting large documents */
const CHUNK_CHARS = parseInt(process.env.GEMINI_CHUNK_SIZE || "35000", 10);

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildSystemInstruction() {
  return `You are an expert educational quiz writer for StudyMate AI.
Your ONLY job is to generate quiz questions strictly and exclusively based on the document text provided.

Rules you must follow without exception:
1. Every question MUST be answerable using ONLY the provided document text.
2. Do NOT use any external knowledge, general facts, or information outside the document.
3. If the document is about "Data Cleaning and Preprocessing", questions must be about data cleaning topics — not HTML, biology, history, programming languages, or anything unrelated.
4. Return ONLY a valid JSON array. No markdown fences, no explanation text, no preamble.
5. All keys must be exactly as specified in the schema.
6. The "correctKey" field must exactly match one of the option keys ("A", "B", "C", or "D" for MCQ; "A" or "B" for true-false).
7. Explanations must cite or paraphrase the relevant part of the document.`;
}

function buildMCQPrompt(documentText, count, difficulty, topic) {
  const topicClause = topic
    ? `Focus specifically on the topic: "${topic}".`
    : 'Cover the main concepts throughout the document.';

  const difficultyGuide = {
    easy:   'Questions should test basic recall and simple understanding of key terms and definitions.',
    medium: 'Questions should require applying and explaining concepts, not just recalling definitions.',
    hard:   'Questions should require analysis, synthesis, or evaluation of concepts — comparing approaches, identifying trade-offs, or explaining consequences.',
  }[difficulty] || 'Questions should test understanding of key concepts.';

  return `You are generating a ${difficulty.toUpperCase()} difficulty quiz from the following document.
${topicClause}

DIFFICULTY GUIDE: ${difficultyGuide}

Generate exactly ${count} multiple-choice questions (MCQ).

DOCUMENT TEXT:
"""
${documentText}
"""

Return a JSON array of exactly ${count} objects. Each object must match this schema exactly:
{
  "id": "q1",
  "type": "mcq",
  "question": "<question text based strictly on the document>",
  "options": [
    { "key": "A", "text": "<option text>" },
    { "key": "B", "text": "<option text>" },
    { "key": "C", "text": "<option text>" },
    { "key": "D", "text": "<option text>" }
  ],
  "correctKey": "A",
  "explanation": "<why this is correct, citing the document>"
}

IDs must be "q1", "q2", "q3", etc.
The correctKey must be exactly one of: "A", "B", "C", "D".
Return ONLY the JSON array. No markdown, no extra text.`;
}

function buildTrueFalsePrompt(documentText, count, difficulty, topic) {
  const topicClause = topic
    ? `Focus specifically on the topic: "${topic}".`
    : 'Cover the main concepts throughout the document.';

  const difficultyGuide = {
    easy:   'Statements should test basic recall of facts and definitions from the document.',
    medium: 'Statements should be about conceptual relationships or processes described in the document.',
    hard:   'Statements should involve subtle distinctions, edge cases, or nuanced claims that require careful reading of the document.',
  }[difficulty] || 'Statements should test understanding.';

  return `You are generating a ${difficulty.toUpperCase()} difficulty true-or-false quiz from the following document.
${topicClause}

DIFFICULTY GUIDE: ${difficultyGuide}

Generate exactly ${count} true-or-false questions. Make roughly half the statements TRUE and half FALSE.

DOCUMENT TEXT:
"""
${documentText}
"""

Return a JSON array of exactly ${count} objects. Each object must match this schema exactly:
{
  "id": "q1",
  "type": "true-false",
  "question": "<a statement about the document that is either true or false>",
  "options": [
    { "key": "A", "text": "True" },
    { "key": "B", "text": "False" }
  ],
  "correctKey": "A",
  "explanation": "<why the statement is true or false, citing the document>"
}

IDs must be "q1", "q2", "q3", etc.
The correctKey must be exactly "A" (True) or "B" (False).
Return ONLY the JSON array. No markdown, no extra text.`;
}

function buildMixedPrompt(documentText, mcqCount, tfCount, difficulty, topic) {
  const topicClause = topic
    ? `Focus specifically on the topic: "${topic}".`
    : 'Cover the main concepts throughout the document.';

  return `You are generating a ${difficulty.toUpperCase()} difficulty mixed quiz from the following document.
${topicClause}

Generate exactly ${mcqCount} multiple-choice questions (type: "mcq") and ${tfCount} true-or-false questions (type: "true-false").

DOCUMENT TEXT:
"""
${documentText}
"""

Return a single JSON array of exactly ${mcqCount + tfCount} objects in this order: all MCQ questions first (q1 to q${mcqCount}), then all true-false questions (q${mcqCount + 1} to q${mcqCount + tfCount}).

MCQ schema:
{
  "id": "q1",
  "type": "mcq",
  "question": "<question>",
  "options": [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],
  "correctKey": "A",
  "explanation": "<document-grounded explanation>"
}

True-False schema:
{
  "id": "q6",
  "type": "true-false",
  "question": "<statement that is true or false>",
  "options": [{"key":"A","text":"True"},{"key":"B","text":"False"}],
  "correctKey": "A",
  "explanation": "<document-grounded explanation>"
}

Return ONLY the JSON array. No markdown, no extra text.`;
}

// ─── Text Selection ───────────────────────────────────────────────────────────

/**
 * Selects the most relevant portion of the document text.
 * If a topic is specified, tries to find the most topic-relevant chunk.
 * For large documents, uses the first CHUNK_CHARS characters to stay within limits.
 */
function selectDocumentContext(fullText, topic) {
  if (!fullText) return '';

  // If short enough, use all of it
  if (fullText.length <= MAX_CONTEXT_CHARS) return fullText;

  // If a topic is provided, try to find the most relevant region
  if (topic && topic.trim()) {
    const lowerTopic = topic.toLowerCase();
    const lowerText  = fullText.toLowerCase();
    const idx = lowerText.indexOf(lowerTopic);

    if (idx !== -1) {
      // Take CHUNK_CHARS characters centred around the first mention
      const start = Math.max(0, idx - Math.floor(CHUNK_CHARS / 4));
      const end   = Math.min(fullText.length, start + CHUNK_CHARS);
      return fullText.slice(start, end);
    }
  }

  // Default: take the first CHUNK_CHARS characters (introduction / overview area)
  return fullText.slice(0, CHUNK_CHARS);
}

// ─── Response Validation ──────────────────────────────────────────────────────

const VALID_MCQ_KEYS  = new Set(['A', 'B', 'C', 'D']);
const VALID_TF_KEYS   = new Set(['A', 'B']);

function validateMCQQuestion(q, index) {
  if (typeof q.question !== 'string' || !q.question.trim()) {
    throw new Error(`Question ${index + 1}: missing or empty "question" field.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error(`Question ${index + 1}: MCQ must have exactly 4 options.`);
  }
  for (const opt of q.options) {
    if (!VALID_MCQ_KEYS.has(opt.key) || typeof opt.text !== 'string' || !opt.text.trim()) {
      throw new Error(`Question ${index + 1}: invalid option key or empty text.`);
    }
  }
  if (!VALID_MCQ_KEYS.has(q.correctKey)) {
    throw new Error(`Question ${index + 1}: correctKey "${q.correctKey}" is not a valid MCQ key (A–D).`);
  }
  return true;
}

function validateTFQuestion(q, index) {
  if (typeof q.question !== 'string' || !q.question.trim()) {
    throw new Error(`Question ${index + 1}: missing or empty "question" field.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 2) {
    throw new Error(`Question ${index + 1}: True-False must have exactly 2 options.`);
  }
  if (!VALID_TF_KEYS.has(q.correctKey)) {
    throw new Error(`Question ${index + 1}: correctKey "${q.correctKey}" must be "A" (True) or "B" (False).`);
  }
  // Ensure options are always normalised
  q.options = [
    { key: 'A', text: 'True'  },
    { key: 'B', text: 'False' },
  ];
  return true;
}

function validateAndNormalise(questions, expectedType) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Gemini returned an empty or non-array response.');
  }

  const valid = [];
  const errors = [];

  questions.forEach((q, i) => {
    try {
      // Assign stable IDs regardless of what Gemini returns
      q.id = `ai-q${i + 1}`;
      q.explanation = (typeof q.explanation === 'string' && q.explanation.trim())
        ? q.explanation
        : 'See the relevant section in the document for more details.';

      if (q.type === 'mcq') {
        validateMCQQuestion(q, i);
        valid.push(q);
      } else if (q.type === 'true-false') {
        validateTFQuestion(q, i);
        valid.push(q);
      } else if (expectedType === 'mcq') {
        // Gemini may omit type field — infer from options length
        if (Array.isArray(q.options) && q.options.length === 4) {
          q.type = 'mcq';
          validateMCQQuestion(q, i);
          valid.push(q);
        } else {
          errors.push(`Question ${i + 1}: unknown type "${q.type}".`);
        }
      } else if (expectedType === 'true-false') {
        q.type = 'true-false';
        validateTFQuestion(q, i);
        valid.push(q);
      } else {
        errors.push(`Question ${i + 1}: unrecognised type "${q.type}".`);
      }
    } catch (err) {
      errors.push(err.message);
    }
  });

  if (valid.length === 0) {
    throw new Error(
      `All questions were invalid. Errors: ${errors.slice(0, 3).join('; ')}`,
    );
  }

  if (errors.length > 0) {
    console.warn(`[quizService] ${errors.length} question(s) were rejected:`, errors);
  }

  return valid;
}

// ─── Retry helpers ────────────────────────────────────────────────────────────

const MAX_ATTEMPTS = 3;

/**
 * Returns true for errors that are safe to retry:
 * 503 Service Unavailable / model overloaded, 429 rate-limit, 500 transient.
 * Handles numeric err.status, gRPC string err.code, and err.message patterns.
 */
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

// ─── Gemini Call (with retry) ─────────────────────────────────────────────────

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
      lastError = err;

      if (isRetryable(err) && attempt < MAX_ATTEMPTS) {
        const wait = backoffMs(attempt);
        console.warn(
          `[quizService] Attempt ${attempt}/${MAX_ATTEMPTS} failed ` +
          `(status=${err?.status ?? 'unknown'}, code=${err?.code ?? '—'}). ` +
          `Retrying in ${Math.round(wait)}ms…`
        );
        await new Promise((r) => setTimeout(r, wait));
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

// ─── JSON Extraction ──────────────────────────────────────────────────────────

/**
 * Extracts a JSON array from a model response that may include markdown fences,
 * stray text, or partial wrapping.
 */
function extractJsonArray(rawText) {
  if (!rawText) throw new Error('Model returned an empty response.');

  // Strip markdown code fences if present
  let text = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  // Find the first '[' and last ']'
  const start = text.indexOf('[');
  const end   = text.lastIndexOf(']');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      `Model response does not contain a valid JSON array. Raw response: "${text.slice(0, 200)}"`
    );
  }

  text = text.slice(start, end + 1);

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    throw new Error(
      `Failed to parse model response as JSON: ${parseErr.message}. ` +
      `First 300 chars: "${text.slice(0, 300)}"`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates quiz questions from document text using Gemini.
 *
 * @param {object} params
 * @param {string}  params.documentText    Full extracted text from the document
 * @param {string}  params.documentName    Human-readable file name (for logging)
 * @param {number}  params.questionCount   Number of questions to generate (5/10/15/20)
 * @param {string}  params.questionType    'mcq' | 'true-false' | 'mixed'
 * @param {string}  params.difficulty      'easy' | 'medium' | 'hard'
 * @param {string}  params.topic           Optional topic/chapter filter
 * @param {boolean} params.showExplanations Whether the client wants explanations
 * @returns {Promise<Array>}  Array of validated question objects
 */
export async function generateAIQuiz({
  documentText,
  documentName,
  questionCount,
  questionType,
  difficulty,
  topic,
}) {
  if (!documentText || !documentText.trim()) {
    throw new Error('Document text is empty. Please process the document first.');
  }

  const minWords = 50;
  const wordCount = documentText.trim().split(/\s+/).length;
  if (wordCount < minWords) {
    throw new Error(
      `Document has too little text (${wordCount} words). A minimum of ${minWords} words is required to generate meaningful quiz questions.`
    );
  }

  const contextText = selectDocumentContext(documentText, topic);
  console.log(
    `[quizService] Generating ${questionCount} ${questionType} (${difficulty}) questions ` +
    `for "${documentName}" | Context: ${contextText.length} chars | Topic: "${topic || 'entire document'}"`
  );

  let prompt;
  let expectedType = questionType;

  if (questionType === 'mcq') {
    prompt = buildMCQPrompt(contextText, questionCount, difficulty, topic);
  } else if (questionType === 'true-false') {
    prompt = buildTrueFalsePrompt(contextText, questionCount, difficulty, topic);
  } else {
    // mixed: half MCQ, half T/F
    const mcqCount = Math.ceil(questionCount / 2);
    const tfCount  = questionCount - mcqCount;
    prompt = buildMixedPrompt(contextText, mcqCount, tfCount, difficulty, topic);
    expectedType = 'mixed';
  }

  const rawText = await callGemini(prompt);
  const parsed  = extractJsonArray(rawText);
  const valid   = validateAndNormalise(parsed, expectedType === 'mixed' ? 'mcq' : expectedType);

  // Trim to the requested count in case the model returned more
  return valid.slice(0, questionCount);
}
