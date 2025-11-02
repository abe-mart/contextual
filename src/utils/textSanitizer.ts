/**
 * Sanitize text for storage in PostgreSQL
 * Removes null bytes and other problematic characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove null bytes
    .replace(/\u0000/g, '')
    // Remove other control characters except newlines, tabs, and carriage returns
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize text but preserve formatting (newlines, etc)
 */
export function sanitizeTextPreserveFormatting(text: string): string {
  if (!text) return '';
  
  return text
    // Remove null bytes
    .replace(/\u0000/g, '')
    // Remove other control characters except newlines, tabs, and carriage returns
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
