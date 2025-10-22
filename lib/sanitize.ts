export function sanitize(text: string): string {
  // Trim and collapse whitespace
  let sanitized = text.trim().replace(/\s+/g, ' ');
  
  // Remove control characters (except newlines, tabs, carriage returns)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Basic profanity filter placeholder (can be expanded)
  const profanityWords = ['spam', 'scam', 'hack']; // Add more as needed
  for (const word of profanityWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  }
  
  return sanitized;
}
