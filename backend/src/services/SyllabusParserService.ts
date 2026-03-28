import { ISyllabusParserService } from './interfaces';
// pdf-parse is CJS-only; use require to avoid ESM/CJS interop issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;

export class SyllabusParserService implements ISyllabusParserService {
  /**
   * Parses a raw syllabus — supports plain text or PDF Buffer.
   * Frontend sends raw file bytes as base64 in syllabusText for PDFs,
   * or plain text for .txt/.docx extracted content.
   */
  async parseSyllabusText(syllabusText: string): Promise<string[]> {
    let cleanText = syllabusText;

    // Detect base64-encoded PDF (starts with %PDF when decoded, or raw base64)
    if (syllabusText.startsWith('data:application/pdf;base64,') || syllabusText.startsWith('JVBERi')) {
      try {
        const base64 = syllabusText.replace(/^data:application\/pdf;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');
        const parsed = await pdfParse(buffer);
        cleanText = parsed.text;
      } catch (err) {
        console.warn('[SyllabusParser] PDF parse failed, using raw text:', err);
      }
    }

    // Extract topics: split by newlines/bullets, filter meaningful lines
    const lines = cleanText
      .split(/[\n\r]+/)
      .map(l => l.replace(/^[\s\-•*\d.]+/, '').trim())
      .filter(l => l.length > 4 && l.length < 120 && !l.match(/^(page|chapter|\d+)$/i));

    // Deduplicate
    const unique = [...new Set(lines)];

    if (unique.length === 0) {
      return ['Introduction', 'Core Concepts', 'Advanced Topics', 'Applications', 'Review'];
    }

    // Cap at 20 topics to keep the graph manageable
    return unique.slice(0, 20);
  }
}
