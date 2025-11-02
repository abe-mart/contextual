import { X, BookOpen, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { AmbiguousTerm } from '../types';

interface TermDetailProps {
  term: AmbiguousTerm;
  onClose: () => void;
}

export function TermDetail({ term, onClose }: TermDetailProps) {
  const confidenceColor =
    term.confidence >= 80
      ? 'text-green-600 bg-green-50'
      : term.confidence >= 60
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-orange-600 bg-orange-50';

  const confidenceBadgeColor =
    term.confidence >= 80
      ? 'bg-green-100 text-green-700'
      : term.confidence >= 60
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-orange-100 text-orange-700';

  return (
    <div className="h-full flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 flex-shrink-0 z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 break-words">
              {term.term}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${confidenceBadgeColor}`}>
                <TrendingUp className="w-3 h-3" />
                {term.confidence}% confident
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Context */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Context
            </p>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            "{term.context}"
          </p>
        </div>

        {/* Likely Meaning - Highlighted */}
        <div className={`rounded-lg p-4 border-2 border-blue-200 ${confidenceColor}`}>
          <div className="flex items-start gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Likely Intended Meaning
            </p>
          </div>
          <p className="text-gray-900 font-medium leading-relaxed">
            {term.likely_intended_meaning}
          </p>
        </div>

        {/* Possible Meanings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Other Possible Meanings
            </p>
          </div>
          <div className="space-y-2">
            {term.possible_meanings.map((meaning, idx) => (
              <div
                key={idx}
                className="group bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm mb-1">
                      {meaning.field}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {meaning.definition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
