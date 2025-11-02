import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey || apiKey === 'your_openai_api_key_here') {
  throw new Error('OpenAI API key not configured');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export interface PossibleMeaning {
  field: string;
  definition: string;
}

export interface AmbiguousTerm {
  term: string;
  context: string;
  position_start: number;
  position_end: number;
  possible_meanings: PossibleMeaning[];
  likely_intended_meaning: string;
  confidence: number;
}

interface AnalysisChunk {
  chunk: string;
  startIndex: number;
}

const CHUNK_SIZE = 3000;
const OVERLAP_SIZE = 200;

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

    if (endIndex >= text.length) break;
    startIndex = endIndex - OVERLAP_SIZE;
  }

  return chunks;
}

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
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  
  // Debug logging
  console.log('=== Raw OpenAI Response ===');
  console.log('Full response object:', JSON.stringify(response, null, 2));
  console.log('Content:', content);
  console.log('========================');
  
  if (!content) {
    console.warn('No content in response');
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    console.log('Parsed JSON:', parsed);
    
    // Handle both array and single object responses
    let terms: any[] = [];
    if (Array.isArray(parsed)) {
      terms = parsed;
    } else if (parsed.terms && Array.isArray(parsed.terms)) {
      terms = parsed.terms;
    } else if (parsed.ambiguous_terms && Array.isArray(parsed.ambiguous_terms)) {
      terms = parsed.ambiguous_terms;
    } else if (parsed.term) {
      // Single term object returned directly
      terms = [parsed];
    }
    
    console.log('Extracted terms array:', terms);

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
    console.error('Raw content that failed to parse:', content);
    return [];
  }
}

function mergeTerms(allTerms: AmbiguousTerm[]): AmbiguousTerm[] {
  const termMap = new Map<string, AmbiguousTerm>();

  for (const term of allTerms) {
    const key = term.term.toLowerCase();

    if (termMap.has(key)) {
      const existing = termMap.get(key)!;
      if (term.confidence > existing.confidence) {
        termMap.set(key, term);
      }
    } else {
      termMap.set(key, term);
    }
  }

  return Array.from(termMap.values()).sort((a, b) => a.position_start - b.position_start);
}

export async function analyzeText(
  text: string,
  onProgress?: (current: number, total: number) => void
): Promise<AmbiguousTerm[]> {
  const chunks = splitTextIntoChunks(text);
  const allTerms: AmbiguousTerm[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const { chunk, startIndex } = chunks[i];

    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    const terms = await analyzeChunk(chunk, startIndex);
    allTerms.push(...terms);
  }

  return mergeTerms(allTerms);
}
