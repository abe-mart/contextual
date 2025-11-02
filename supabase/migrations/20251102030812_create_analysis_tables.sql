/*
  # Create Analysis Tables for Contextual App

  1. New Tables
    - `analysis_sessions`
      - `id` (uuid, primary key) - Unique identifier for each analysis session
      - `text_content` (text) - The original text being analyzed
      - `status` (text) - Status of analysis (pending, processing, completed, error)
      - `created_at` (timestamptz) - When the session was created
      - `completed_at` (timestamptz) - When the analysis was completed
      
    - `ambiguous_terms`
      - `id` (uuid, primary key) - Unique identifier for each term
      - `session_id` (uuid, foreign key) - Reference to analysis_sessions
      - `term` (text) - The ambiguous word or phrase
      - `context` (text) - The surrounding context where the term appears
      - `position_start` (integer) - Starting position in the text
      - `position_end` (integer) - Ending position in the text
      - `likely_meaning` (text) - AI's best guess at intended meaning
      - `confidence` (numeric) - Confidence score (0-100)
      - `created_at` (timestamptz) - When the term was identified
      
    - `term_meanings`
      - `id` (uuid, primary key) - Unique identifier for each meaning
      - `term_id` (uuid, foreign key) - Reference to ambiguous_terms
      - `field` (text) - Academic field where this meaning is used
      - `definition` (text) - Definition of the term in this context
      - `created_at` (timestamptz) - When the meaning was recorded

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no persistence is required between sessions)
    - Allow anyone to insert and read their own session data
*/

CREATE TABLE IF NOT EXISTS analysis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_content text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ambiguous_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  term text NOT NULL,
  context text NOT NULL,
  position_start integer NOT NULL,
  position_end integer NOT NULL,
  likely_meaning text NOT NULL,
  confidence numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS term_meanings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid REFERENCES ambiguous_terms(id) ON DELETE CASCADE,
  field text NOT NULL,
  definition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambiguous_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_meanings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analysis sessions"
  ON analysis_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read all sessions"
  ON analysis_sessions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON analysis_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert ambiguous terms"
  ON ambiguous_terms
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read all terms"
  ON ambiguous_terms
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert term meanings"
  ON term_meanings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read all meanings"
  ON term_meanings
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ambiguous_terms_session_id ON ambiguous_terms(session_id);
CREATE INDEX IF NOT EXISTS idx_term_meanings_term_id ON term_meanings(term_id);