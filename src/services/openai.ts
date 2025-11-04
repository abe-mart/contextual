/**
 * OpenAI Service
 * 
 * This module handles the integration with OpenAI's API for analyzing academic texts
 * and identifying ambiguous terminology. It processes large texts by chunking them
 * into manageable pieces and uses GPT-4 to identify terms that may have multiple
 * meanings across different academic disciplines.
 */

import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

/** Represents a possible meaning of an ambiguous term in a specific academic field */
export interface PossibleMeaning {
  field: string;       // Academic field (e.g., "Computer Science", "Biology")
  definition: string;  // Definition within that field
}

/** Represents an ambiguous term identified in the text */
export interface AmbiguousTerm {
  term: string;                          // The ambiguous word or phrase
  context: string;                       // Surrounding text for context
  position_start: number;                // Starting position in original text
  position_end: number;                  // Ending position in original text
  possible_meanings: PossibleMeaning[];  // Array of possible interpretations
  likely_intended_meaning: string;       // AI's best guess at intended meaning
  confidence: number;                    // Confidence score (0-100)
}

/** Internal interface for text chunks during processing */
interface AnalysisChunk {
  chunk: string;      // The text chunk to analyze
  startIndex: number; // Starting position in the full text
}

// Configuration constants for text chunking
const CHUNK_SIZE = 3000;    // Maximum characters per chunk (fits within GPT-4 context window)
const OVERLAP_SIZE = 200;   // Overlap between chunks to avoid missing terms at boundaries

/**
 * Splits a large text into smaller, overlapping chunks for processing.
 * 
 * Large texts are broken into manageable chunks that fit within GPT-4's context window.
 * Chunks overlap to ensure terms appearing near chunk boundaries aren't missed.
 * 
 * @param text - The full text to split into chunks
 * @returns Array of chunks with their starting positions in the original text
 */
function splitTextIntoChunks(text: string): AnalysisChunk[] {
  const chunks: AnalysisChunk[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
    const chunk = text.substring(startIndex, endIndex);

    chunks.push({
      chunk,
      startIndex,
    });

    // If we've reached the end, stop; otherwise, create overlap
    if (endIndex >= text.length) break;
    startIndex = endIndex - OVERLAP_SIZE;
  }

  return chunks;
}

/**
 * Analyzes a single chunk of text using OpenAI's GPT-4 to identify ambiguous terms.
 * 
 * Sends the text chunk to GPT-4 with specific instructions to identify terms that
 * have multiple meanings across different academic disciplines. The AI returns
 * structured data including possible meanings, context, and confidence scores.
 * 
 * @param chunk - The text chunk to analyze
 * @param startIndex - Starting position of this chunk in the full text
 * @returns Array of ambiguous terms found in the chunk
 */
async function analyzeChunk(
  chunk: string,
  startIndex: number
): Promise<AmbiguousTerm[]> {
  const prompt = `You are an academic text analyzer. Identify ALL words or short phrases in the following text that may have multiple meanings across different academic fields.

For each ambiguous term, provide:
1. The term itself
2. A brief context snippet (20-30 words) showing where it appears
3. At least 2-3 possible meanings from different academic fields
4. Your best guess at the intended meaning in this context
5. A confidence score (0-100) for your interpretation

IMPORTANT: Return your analysis as a JSON object with a "terms" array, like this:
{
  "terms": [
    {
      "term": "string",
      "context": "string",
      "possible_meanings": [
        {"field": "string", "definition": "string"}
      ],
      "likely_intended_meaning": "string",
      "confidence": number
    }
  ]
}

Text to analyze:
${chunk}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic text analyzer specializing in identifying ambiguous terminology across disciplines. Always respond with valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3, // Lower temperature for more consistent, focused results
  });

  const content = response.choices[0].message.content;
  
  if (!content) {
    console.warn('OpenAI returned empty response');
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    
    // Handle different response formats (array, object with 'terms', etc.)
    let terms: any[] = [];
    if (Array.isArray(parsed)) {
      terms = parsed;
    } else if (parsed.terms && Array.isArray(parsed.terms)) {
      terms = parsed.terms;
    } else if (parsed.ambiguous_terms && Array.isArray(parsed.ambiguous_terms)) {
      terms = parsed.ambiguous_terms;
    } else if (parsed.term) {
      terms = [parsed]; // Single term object
    }

    // Map the terms to our AmbiguousTerm interface with proper positioning
    return terms.map((term: any) => {
      const termText = term.term || '';
      const contextText = term.context || '';
      const termIndex = chunk.toLowerCase().indexOf(termText.toLowerCase());

      return {
        term: termText,
        context: contextText,
        position_start: startIndex + termIndex,
        position_end: startIndex + termIndex + termText.length,
        possible_meanings: term.possible_meanings || [],
        likely_intended_meaning: term.likely_intended_meaning || term.likely_meaning || '',
        confidence: term.confidence || 0,
      };
    });
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    return [];
  }
}

/**
 * Merges duplicate terms from multiple chunks, keeping the highest confidence version.
 * 
 * When processing overlapping chunks, the same term may be identified multiple times.
 * This function deduplicates terms by their text, keeping only the instance with
 * the highest confidence score.
 * 
 * @param allTerms - Array of all terms from all chunks (may contain duplicates)
 * @returns Deduplicated array of terms, sorted by position in the original text
 */
function mergeTerms(allTerms: AmbiguousTerm[]): AmbiguousTerm[] {
  const termMap = new Map<string, AmbiguousTerm>();

  for (const term of allTerms) {
    const key = term.term.toLowerCase();

    if (termMap.has(key)) {
      // Keep the term with higher confidence
      const existing = termMap.get(key)!;
      if (term.confidence > existing.confidence) {
        termMap.set(key, term);
      }
    } else {
      termMap.set(key, term);
    }
  }

  // Return terms sorted by their position in the original text
  return Array.from(termMap.values()).sort((a, b) => a.position_start - b.position_start);
}

/**
 * Analyzes a full text document to identify ambiguous terminology.
 * 
 * This is the main entry point for text analysis. It:
 * 1. Splits large texts into processable chunks
 * 2. Analyzes each chunk with GPT-4
 * 3. Merges and deduplicates results
 * 4. Reports progress via callback
 * 
 * @param text - The full text to analyze
 * @param onProgress - Optional callback for progress updates (currentChunk, totalChunks)
 * @returns Array of unique ambiguous terms found in the text
 */
export async function analyzeText(
  text: string,
  onProgress?: (current: number, total: number) => void
): Promise<AmbiguousTerm[]> {
  const chunks = splitTextIntoChunks(text);
  const allTerms: AmbiguousTerm[] = [];

  // Process each chunk sequentially
  for (let i = 0; i < chunks.length; i++) {
    const { chunk, startIndex } = chunks[i];

    // Report progress
    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    const terms = await analyzeChunk(chunk, startIndex);
    allTerms.push(...terms);
  }

  return mergeTerms(allTerms);
}
