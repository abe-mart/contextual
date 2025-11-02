import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { extractTextFromPDF } from '../utils/pdfExtractor';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export function TextInput({ onTextSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleFileUpload = async (file: File) => {
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(file);
        setText(extractedText);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setText(text);
      } else {
        setError('Please upload a PDF or TXT file');
      }
    } catch (err) {
      setError('Failed to extract text from file. Please try again.');
      console.error('File extraction error:', err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      setError('Please enter or upload some text to analyze');
      return;
    }

    if (text.length < 100) {
      setError('Please provide at least 100 characters for meaningful analysis');
      return;
    }

    onTextSubmit(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Upload or Paste Academic Text
        </h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">
              Drag and drop your file here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                browse files
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.txt"
                onChange={handleFileInputChange}
                disabled={isLoading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supports PDF and TXT files
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or paste your text directly:
          </label>
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Paste your academic text here..."
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              {text.length} characters
            </p>
            {text.length > 0 && (
              <button
                onClick={() => setText('')}
                className="text-sm text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {text.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
            <FileText className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Text preview ready. Click "Analyze Text" to identify ambiguous terms.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Text'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Analysis is AI-generated and may be imperfect. No data is stored after your session ends.
        </p>
      </div>
    </div>
  );
}
