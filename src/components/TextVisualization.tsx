/**
 * TextVisualization Component
 * 
 * Displays the analyzed text with ambiguous terms highlighted.
 * Color coding indicates confidence levels, and terms are clickable
 * to view detailed information. Users can toggle highlights on/off.
 */

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
            ? 'bg-green-200 hover:bg-green-300 border-green-400'
            : term.confidence >= 60
            ? 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400'
            : 'bg-orange-200 hover:bg-orange-300 border-orange-400';

        elements.push(
          <mark
            key={`term-${idx}`}
            className={`
              cursor-pointer transition-all duration-200 rounded-sm px-0.5
              ${isSelected
                ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-1 shadow-lg scale-105'
                : `${confidenceColor} hover:shadow-md hover:scale-102 border-b-2`
              }
            `}
            onClick={() => onTermClick(term)}
            title={`${term.term} - ${term.confidence}% confidence - Click for details`}
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Analyzed Text</h2>
          <button
            onClick={() => setHighlightsEnabled(!highlightsEnabled)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          >
            {highlightsEnabled ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">Hide Highlights</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Show Highlights</span>
              </>
            )}
          </button>
        </div>

        {highlightsEnabled && terms.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Highlight Legend
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-5 h-3 bg-green-200 border-b-2 border-green-400 rounded-sm"></span>
                <span className="text-gray-700">High (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-5 h-3 bg-yellow-200 border-b-2 border-yellow-400 rounded-sm"></span>
                <span className="text-gray-700">Medium (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-5 h-3 bg-orange-200 border-b-2 border-orange-400 rounded-sm"></span>
                <span className="text-gray-700">Lower (&lt;60%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="p-8">
        <div className="prose max-w-none text-gray-700 text-base leading-relaxed">
          {renderHighlightedText()}
        </div>

        {terms.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              No ambiguous terms identified in this text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
