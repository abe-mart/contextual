import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { sanitizeTextPreserveFormatting } from './textSanitizer';

// Use the worker with Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFInfo {
  numPages: number;
  file: File;
}

export async function loadPDF(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return await loadingTask.promise;
}

export async function getPDFInfo(file: File): Promise<PDFInfo> {
  const pdf = await loadPDF(file);
  return {
    numPages: pdf.numPages,
    file,
  };
}

export async function extractTextFromPDF(file: File, selectedPages?: number[]): Promise<string> {
  console.log('=== PDF Extraction Started ===');
  console.log('File name:', file.name);
  console.log('File size:', file.size, 'bytes');
  console.log('File type:', file.type);
  console.log('PDF.js version:', pdfjsLib.version);
  console.log('Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);

  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('Array buffer created, size:', arrayBuffer.byteLength);

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    console.log('Loading task created');

    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully');
    console.log('Number of pages:', pdf.numPages);

    let fullText = '';

    // Determine which pages to process
    const pagesToProcess = selectedPages && selectedPages.length > 0 
      ? selectedPages 
      : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

    console.log('Pages to process:', pagesToProcess);

    for (const pageNum of pagesToProcess) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      console.log(`Page ${pageNum} extracted, text length:`, pageText.length);
    }

    const result = fullText.trim();
    
    // Sanitize the extracted text to remove null bytes and problematic characters
    const sanitizedResult = sanitizeTextPreserveFormatting(result);
    
    console.log('=== PDF Extraction Complete ===');
    console.log('Total text length (before sanitization):', result.length);
    console.log('Total text length (after sanitization):', sanitizedResult.length);
    console.log('Characters removed:', result.length - sanitizedResult.length);
    console.log('First 200 characters:', sanitizedResult.substring(0, 200));
    
    return sanitizedResult;
  } catch (error) {
    console.error('=== PDF Extraction Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    throw error;
  }
}
