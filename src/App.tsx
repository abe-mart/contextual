/**
 * Contextual - Main Application Component
 * 
 * An intelligent tool for identifying ambiguous terms in academic texts.
 * Uses OpenAI's GPT-4 to analyze documents and highlight terminology that
 * may have multiple meanings across different academic disciplines.
 */

import { useState } from 'react';
import { FileText, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { TextInput } from './components/TextInput';
import { TextVisualization } from './components/TextVisualization';
import { TermDetail } from './components/TermDetail';
import { TermsSummary } from './components/TermsSummary';
import { analyzeText } from './services/openai';
import { AmbiguousTerm } from './types';

/** Application workflow states */
type AppState = 'input' | 'analyzing' | 'results';

function App() {
  // State management
  const [state, setState] = useState<AppState>('input');
  const [text, setText] = useState('');
  const [terms, setTerms] = useState<AmbiguousTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<AmbiguousTerm | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles text submission and initiates the analysis process.
   * Calls the OpenAI service to analyze the text and identify ambiguous terms.
   */
  const handleTextSubmit = async (submittedText: string) => {
    setText(submittedText);
    setState('analyzing');
    setError(null);
    setProgress({ current: 0, total: 0 });

    try {
      const analyzedTerms = await analyzeText(
        submittedText,
        (current, total) => {
          setProgress({ current, total });
        }
      );

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

  /**
   * Resets the application state to start a new analysis.
   */
  const handleReset = () => {
    setState('input');
    setText('');
    setTerms([]);
    setSelectedTerm(null);
    setError(null);
  };

  /**
   * Handles clicking on a term in the text or summary.
   * Toggles the detail panel for the selected term.
   */
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
          <div className="relative">
            {/* Mobile terms button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => {
                  const panel = document.getElementById('mobile-terms-panel');
                  panel?.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-lg border border-gray-200"
              >
                <span className="font-semibold text-gray-800">
                  View All Terms ({terms.length})
                </span>
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
              <div id="mobile-terms-panel" className="hidden mt-2">
                <TermsSummary
                  terms={terms}
                  onTermSelect={handleTermClick}
                  selectedTerm={selectedTerm}
                />
              </div>
            </div>

            <div className="flex gap-6">
              {/* Detail panel - slides in from left when term is selected */}
              <div className={`
                hidden lg:block flex-shrink-0 transition-all duration-300 ease-out
                ${selectedTerm ? 'w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
              `}>
                {selectedTerm && (
                  <div className="sticky top-6 w-96">
                    <TermDetail
                      term={selectedTerm}
                      onClose={() => setSelectedTerm(null)}
                    />
                  </div>
                )}
              </div>

              {/* Main content area - text visualization */}
              <div className="flex-1 min-w-0">
                <TextVisualization
                  text={text}
                  terms={terms}
                  onTermClick={handleTermClick}
                  selectedTerm={selectedTerm}
                />
              </div>
              
              {/* Desktop side panel for terms summary - always visible */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6">
                  <TermsSummary
                    terms={terms}
                    onTermSelect={handleTermClick}
                    selectedTerm={selectedTerm}
                  />
                </div>
              </div>
            </div>

            {/* Mobile detail panel - slides up from bottom */}
            {selectedTerm && (
              <>
                {/* Overlay for mobile */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setSelectedTerm(null)}
                />
                
                {/* Detail panel - bottom sheet on mobile */}
                <div className="fixed bottom-0 left-0 right-0 lg:hidden w-full h-[75vh] bg-white rounded-t-2xl shadow-2xl z-50 overflow-hidden transform transition-transform duration-300 ease-out">
                  <TermDetail
                    term={selectedTerm}
                    onClose={() => setSelectedTerm(null)}
                  />
                </div>
              </>
            )}
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
            Your data is processed locally in your browser and is not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
