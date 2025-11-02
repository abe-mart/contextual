import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AmbiguousTerm } from '../types';

interface TextVisualizationProps {
  text: string;
  terms: AmbiguousTerm[];
  onTermClick: (term: AmbiguousTerm) => void;
  selectedTerm: AmbiguousTerm | null;
}

export function TextVisualization({
  text,
  terms,
  onTermClick,
  selectedTerm,
}: TextVisualizationProps) {
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);

  const renderHighlightedText = () => {
    if (!highlightsEnabled || terms.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;
    }

    const sortedTerms = [...terms].sort(
      (a, b) => a.position_start - b.position_start
    );

    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    sortedTerms.forEach((term, idx) => {
      if (term.position_start >= lastIndex && term.position_start < text.length) {
        if (term.position_start > lastIndex) {
          elements.push(
            <span key={`text-${idx}`}>
              {text.substring(lastIndex, term.position_start)}
            </span>
          );
        }

        const isSelected = selectedTerm?.term === term.term;
        const confidenceColor =
          term.confidence >= 80
            ? 'bg-green-200 hover:bg-green-300'
            : term.confidence >= 60
            ? 'bg-yellow-200 hover:bg-yellow-300'
            : 'bg-orange-200 hover:bg-orange-300';

        elements.push(
          <mark
            key={`term-${idx}`}
            className={`cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-400 ring-2 ring-blue-500'
                : confidenceColor
            }`}
            onClick={() => onTermClick(term)}
            title={`${term.term} - Click for details`}
          >
            {text.substring(term.position_start, term.position_end)}
          </mark>
        );

        lastIndex = term.position_end;
      }
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key="text-final">{text.substring(lastIndex)}</span>
      );
    }

    return <p className="whitespace-pre-wrap leading-relaxed">{elements}</p>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analyzed Text</h2>
        <button
          onClick={() => setHighlightsEnabled(!highlightsEnabled)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {highlightsEnabled ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Highlights
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Highlights
            </>
          )}
        </button>
      </div>

      {highlightsEnabled && terms.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-2 font-medium">
            Highlight Legend:
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-green-200 rounded"></span>
              <span className="text-gray-600">High confidence (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-yellow-200 rounded"></span>
              <span className="text-gray-600">Medium confidence (60-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-orange-200 rounded"></span>
              <span className="text-gray-600">Lower confidence (&lt;60%)</span>
            </div>
          </div>
        </div>
      )}

      <div className="prose max-w-none text-gray-700">
        {renderHighlightedText()}
      </div>

      {terms.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No ambiguous terms identified in this text.
        </p>
      )}
    </div>
  );
}
