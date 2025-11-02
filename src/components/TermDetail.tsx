import { X, BookOpen, Target, TrendingUp } from 'lucide-react';
import { AmbiguousTerm } from '../types';

interface TermDetailProps {
  term: AmbiguousTerm;
  onClose: () => void;
}

export function TermDetail({ term, onClose }: TermDetailProps) {
  const confidenceColor =
    term.confidence >= 80
      ? 'text-green-600'
      : term.confidence >= 60
      ? 'text-yellow-600'
      : 'text-orange-600';

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800">{term.term}</h3>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className={`w-4 h-4 ${confidenceColor}`} />
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {term.confidence}% confidence
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-start gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Context:</p>
            <p className="text-sm text-gray-600 italic">"{term.context}"</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-start gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Likely Intended Meaning:
            </p>
            <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">
              {term.likely_intended_meaning}
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Possible Meanings Across Fields:
        </p>
        <div className="space-y-3">
          {term.possible_meanings.map((meaning, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="font-medium text-gray-800 mb-1">{meaning.field}</p>
              <p className="text-sm text-gray-600">{meaning.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
