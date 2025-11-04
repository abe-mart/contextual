/**
 * PDFPreview Component
 * 
 * Provides a page-by-page preview of PDF files, allowing users to select
 * specific pages for text analysis. Renders each page as an image and
 * extracts text content when a page is selected.
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Check, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFPreviewProps {
  file: File;
  onPagesSelected: (pages: number[], text: string) => void;
  onCancel: () => void;
}

export function PDFPreview({ file, onPagesSelected, onCancel }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadPDFPreview();
  }, [file, currentPage]);

  const loadPDFPreview = async () => {
    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      if (numPages === 0) {
        setNumPages(pdf.numPages);
      }

      // Render current page
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as any).promise;

      setPreviewUrl(canvas.toDataURL());
      setLoading(false);
    } catch (err) {
      console.error('PDF preview error:', err);
      setError('Failed to load PDF preview');
      setLoading(false);
    }
  };

  const handleAnalyzeCurrentPage = async () => {
    try {
      setLoading(true);
      
      // Extract text from current page only
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const page = await pdf.getPage(currentPage);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      const extractedText = `--- Page ${currentPage} ---\n${pageText}`;

      onPagesSelected([currentPage], extractedText.trim());
    } catch (err) {
      console.error('Text extraction error:', err);
      setError('Failed to extract text from page');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Select Pages to Analyze</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {file.name} - {numPages} pages
        </p>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Preview Area */}
          <div className="bg-gray-100 rounded-lg p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Page Preview */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                  <img 
                    src={previewUrl} 
                    alt={`Page ${currentPage}`}
                    className="w-full h-auto"
                  />
                </div>

                {/* Navigation and Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Page {currentPage} of {numPages}
                    </p>
                    <button
                      onClick={handleAnalyzeCurrentPage}
                      disabled={loading}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          Analyze This Page
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
