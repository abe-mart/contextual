/**
 * Type Definitions
 * 
 * Core TypeScript interfaces and types used throughout the application
 * for representing ambiguous terms, analysis results, and related data.
 */

/** Represents a possible meaning of a term in a specific academic field */
export interface PossibleMeaning {
  field: string;       // Academic discipline (e.g., "Computer Science", "Physics")
  definition: string;  // Definition of the term within that field
}

/** Represents an ambiguous term identified in the analyzed text */
export interface AmbiguousTerm {
  term: string;                          // The ambiguous word or phrase
  context: string;                       // Surrounding text showing usage
  position_start: number;                // Starting character position in text
  position_end: number;                  // Ending character position in text
  possible_meanings: PossibleMeaning[];  // Array of possible interpretations
  likely_intended_meaning: string;       // AI's best guess at intended meaning
  confidence: number;                    // Confidence score (0-100)
}

/** Represents an analysis session (for potential future use) */
export interface AnalysisSession {
  id: string;
  text_content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  completed_at?: string;
}
