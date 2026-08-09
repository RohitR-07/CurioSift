/**
 * Document Processing Service — Module 5 Phase 2
 *
 * Provides modular, reusable text-extraction from uploaded documents.
 * Currently supports:
 *   - PDF  (via pdfjs-dist which is already installed for the viewer)
 *   - TXT / MD / CSV / XML / code files (plain text read)
 *
 * Returns a clean ExtractedContent object ready for Phase 3 AI processing.
 * The original Blob is NEVER modified.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Reuse the same worker path set up in PdfViewer.tsx
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface ExtractedContent {
  /** Raw joined text from all pages/content */
  fullText: string;
  /** Per-page breakdown (PDF only; single entry for other types) */
  pages: PageContent[];
  /** Total page count (meaningful for PDFs) */
  pageCount: number;
  /** Character count of cleaned fullText */
  charCount: number;
  /** Word count estimate */
  wordCount: number;
}

export type ProcessableCategory =
  | 'pdf'
  | 'text'
  | 'code'
  | 'spreadsheet'; // CSV text extraction

export const PROCESSABLE_CATEGORIES: ProcessableCategory[] = [
  'pdf',
  'text',
  'code',
  'spreadsheet',
];

/** Returns true when the given category can be processed */
export function isProcessable(category: string): category is ProcessableCategory {
  return PROCESSABLE_CATEGORIES.includes(category as ProcessableCategory);
}

// ─── Text Cleaning ─────────────────────────────────────────────────────────────

/**
 * Basic text preparation:
 *  - Normalize line endings (CRLF → LF)
 *  - Collapse runs of more than 2 blank lines into 2
 *  - Strip leading/trailing whitespace from each line while preserving indentation
 *  - Remove NUL / non-printable control characters
 *  - Trim overall result
 */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')              // CRLF → LF
    .replace(/\r/g, '\n')               // lone CR → LF
    .replace(/\x00/g, '')               // remove NUL chars (common in PDF extraction)
    .replace(/[^\S\n]+/g, ' ')          // collapse horizontal whitespace runs to a single space
    .replace(/\n{3,}/g, '\n\n')         // max 2 consecutive blank lines
    .replace(/^ +$/gm, '')              // blank lines with only spaces → truly empty
    .trim();
}

// ─── PDF Extraction ───────────────────────────────────────────────────────────

async function extractPdf(blob: Blob): Promise<ExtractedContent> {
  const arrayBuffer = await blob.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  const pages: PageContent[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Each item in content.items may be TextItem or TextMarkedContent
    const pageText = content.items
      .map((item) => {
        // TextItem has a `str` property; TextMarkedContent does not
        if ('str' in item) return item.str;
        return '';
      })
      .join(' ');

    pages.push({ pageNumber: i, text: cleanText(pageText) });
  }

  const fullText = cleanText(pages.map((p) => p.text).join('\n\n'));

  return {
    fullText,
    pages,
    pageCount,
    charCount: fullText.length,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
  };
}

// ─── Plain-Text Extraction ────────────────────────────────────────────────────

async function extractPlainText(blob: Blob): Promise<ExtractedContent> {
  const raw = await blob.text();
  const fullText = cleanText(raw);

  return {
    fullText,
    pages: [{ pageNumber: 1, text: fullText }],
    pageCount: 1,
    charCount: fullText.length,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
  };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export class ExtractionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Extract text content from a document blob.
 * @param blob      The raw file data (from FileContext.getFileBlob)
 * @param category  The FileCategory of the document
 * @param extension The file extension (used for additional routing if needed)
 */
export async function extractContent(
  blob: Blob,
  category: string,
  extension: string,
): Promise<ExtractedContent> {
  if (!isProcessable(category)) {
    throw new ExtractionError(
      `File type "${extension.toUpperCase()}" cannot be processed for text extraction.`,
    );
  }

  try {
    if (category === 'pdf') {
      return await extractPdf(blob);
    }
    // text, code, spreadsheet (CSV) → plain text
    return await extractPlainText(blob);
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError(
      `Failed to extract content from the document. The file may be corrupted or empty.`,
      err,
    );
  }
}
