import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { AmbiguousTerm } from '../types';

interface TermsSummaryProps {
  terms: AmbiguousTerm[];
  onTermSelect: (term: AmbiguousTerm) => void;
  selectedTerm: AmbiguousTerm | null;
}

export function TermsSummary({
  terms,
  onTermSelect,
  selectedTerm,
}: TermsSummaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'confidence'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredTerms = terms.filter((term) =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTerms = [...filteredTerms].sort((a, b) => {
    if (sortBy === 'position') {
      return sortOrder === 'asc'
        ? a.position_start - b.position_start
        : b.position_start - a.position_start;
    } else {
      return sortOrder === 'asc'
        ? a.confidence - b.confidence
        : b.confidence - a.confidence;
    }
  });

  const toggleSort = (newSortBy: 'position' | 'confidence') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Identified Terms ({terms.length})
      </h3>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => toggleSort('position')}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            sortBy === 'position'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Position
          {sortBy === 'position' &&
            (sortOrder === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            ))}
        </button>
        <button
          onClick={() => toggleSort('confidence')}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            sortBy === 'confidence'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confidence
          {sortBy === 'confidence' &&
            (sortOrder === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            ))}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedTerms.map((term, idx) => (
          <div
            key={idx}
            onClick={() => onTermSelect(term)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedTerm?.term === term.term
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <p className="font-medium text-gray-800">{term.term}</p>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(
                  term.confidence
                )}`}
              >
                {term.confidence}%
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {term.likely_intended_meaning}
            </p>
          </div>
        ))}
      </div>

      {sortedTerms.length === 0 && (
        <p className="text-gray-500 text-center py-8 text-sm">
          {searchQuery ? 'No terms match your search' : 'No terms identified'}
        </p>
      )}
    </div>
  );
}
