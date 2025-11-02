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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Identified Terms
        </h3>
        <p className="text-xs text-gray-600">
          {terms.length} {terms.length === 1 ? 'term' : 'terms'} found
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="p-3 border-b border-gray-200 flex gap-2 flex-shrink-0">
        <button
          onClick={() => toggleSort('position')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-all font-medium ${
            sortBy === 'position'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Position
          {sortBy === 'position' &&
            (sortOrder === 'asc' ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
        <button
          onClick={() => toggleSort('confidence')}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-all font-medium ${
            sortBy === 'confidence'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confidence
          {sortBy === 'confidence' &&
            (sortOrder === 'asc' ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </button>
      </div>

      {/* Terms List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedTerms.map((term, idx) => (
          <div
            key={idx}
            onClick={() => onTermSelect(term)}
            className={`group p-3 rounded-lg border cursor-pointer transition-all ${
              selectedTerm?.term === term.term
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                {term.term}
              </p>
              <span
                className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(
                  term.confidence
                )}`}
              >
                {term.confidence}%
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {term.likely_intended_meaning}
            </p>
          </div>
        ))}
      </div>

      {sortedTerms.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-gray-400 text-sm text-center">
            {searchQuery ? 'No matching terms' : 'No terms identified'}
          </p>
        </div>
      )}
    </div>
  );
}
