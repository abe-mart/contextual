import { useState } from 'react';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { TextInput } from './components/TextInput';
import { TextVisualization } from './components/TextVisualization';
import { TermDetail } from './components/TermDetail';
import { TermsSummary } from './components/TermsSummary';
import { analyzeText } from './services/openai';
import { supabase } from './lib/supabase';
import { AmbiguousTerm } from './types';

type AppState = 'input' | 'analyzing' | 'results';

function App() {
  const [state, setState] = useState<AppState>('input');
  const [text, setText] = useState('');
  const [terms, setTerms] = useState<AmbiguousTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<AmbiguousTerm | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = async (submittedText: string) => {
    setText(submittedText);
    setState('analyzing');
    setError(null);
    setProgress({ current: 0, total: 0 });

    try {
      const session = await supabase
        .from('analysis_sessions')
        .insert({
          text_content: submittedText,
          status: 'processing',
        })
        .select()
        .single();

      if (session.error) throw session.error;

      const analyzedTerms = await analyzeText(
        submittedText,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      if (session.data) {
        await supabase
          .from('analysis_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', session.data.id);

        for (const term of analyzedTerms) {
          const termResult = await supabase
            .from('ambiguous_terms')
            .insert({
              session_id: session.data.id,
              term: term.term,
              context: term.context,
              position_start: term.position_start,
              position_end: term.position_end,
              likely_meaning: term.likely_intended_meaning,
              confidence: term.confidence,
            })
            .select()
            .single();

          if (termResult.data) {
            for (const meaning of term.possible_meanings) {
              await supabase.from('term_meanings').insert({
                term_id: termResult.data.id,
                field: meaning.field,
                definition: meaning.definition,
              });
            }
          }
        }
      }

      setTerms(analyzedTerms);
      setState('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze text. Please check your API key and try again.'
      );
      setState('input');
    }
  };

  const handleReset = () => {
    setState('input');
    setText('');
    setTerms([]);
    setSelectedTerm(null);
    setError(null);
  };

  const handleTermClick = (term: AmbiguousTerm) => {
    setSelectedTerm(selectedTerm?.term === term.term ? null : term);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Contextual</h1>
            </div>
            {state === 'results' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                New Analysis
              </button>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Identify ambiguous terms in academic texts
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {state === 'input' && (
          <TextInput onTextSubmit={handleTextSubmit} isLoading={false} />
        )}

        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Analyzing Text...
            </h2>
            {progress.total > 0 && (
              <p className="text-gray-600">
                Processing chunk {progress.current} of {progress.total}
              </p>
            )}
            <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {state === 'results' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TextVisualization
                text={text}
                terms={terms}
                onTermClick={handleTermClick}
                selectedTerm={selectedTerm}
              />
              {selectedTerm && (
                <TermDetail
                  term={selectedTerm}
                  onClose={() => setSelectedTerm(null)}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              <TermsSummary
                terms={terms}
                onTermSelect={handleTermClick}
                selectedTerm={selectedTerm}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>
            Analysis powered by OpenAI. Results are AI-generated and may be
            imperfect.
          </p>
          <p className="mt-1">
            Your data is processed securely and not stored after your session
            ends.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
