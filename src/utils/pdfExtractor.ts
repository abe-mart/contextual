/**
 * PDF Extraction Utility
 * 
 * Handles PDF file loading and text extraction using PDF.js.
 * Supports extracting text from specific pages or entire documents.
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { sanitizeTextPreserveFormatting } from './textSanitizer';

// Configure PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** PDF document information */
export interface PDFInfo {
  numPages: number;
  file: File;
}

/**
 * Loads a PDF file and returns the PDF.js document proxy.
 * 
 * @param file - The PDF file to load
 * @returns Promise resolving to the PDF document proxy
 */
export async function loadPDF(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return await loadingTask.promise;
}

/**
 * Gets basic information about a PDF file.
 * 
 * @param file - The PDF file to inspect
 * @returns Promise resolving to PDF information (page count, etc.)
 */
export async function getPDFInfo(file: File): Promise<PDFInfo> {
  const pdf = await loadPDF(file);
  return {
    numPages: pdf.numPages,
    file,
  };
}

/**
 * Extracts text content from a PDF file.
 * 
 * Extracts text from specified pages or all pages if none specified.
 * Text is sanitized to remove null bytes and control characters that
 * might cause issues with storage or processing.
 * 
 * @param file - The PDF file to extract text from
 * @param selectedPages - Optional array of page numbers to extract (1-indexed)
 * @returns Promise resolving to the extracted and sanitized text
 * @throws Error if PDF loading or text extraction fails
 */
export async function extractTextFromPDF(file: File, selectedPages?: number[]): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Determine which pages to process (selected pages or all pages)
    const pagesToProcess = selectedPages && selectedPages.length > 0 
      ? selectedPages 
      : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

    // Extract text from each page
    for (const pageNum of pagesToProcess) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }

    // Sanitize the extracted text to remove problematic characters
    const sanitizedResult = sanitizeTextPreserveFormatting(fullText.trim());
    
    return sanitizedResult;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw error;
  }
}
