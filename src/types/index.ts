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

export interface AnalysisSession {
  id: string;
  text_content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  completed_at?: string;
}
