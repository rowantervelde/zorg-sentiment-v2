/**
 * Dutch negation words
 * 
 * These words invert the sentiment of the following word.
 * Examples:
 * - "niet goed" (not good) → negative sentiment
 * - "geen probleem" (no problem) → positive sentiment (inverts negative)
 * - "nooit slecht" (never bad) → positive sentiment (inverts negative)
 */

export const negators: Record<string, boolean> = {
  // Primary negations
  'niet': true,
  'geen': true,
  'nooit': true,
  'nergens': true,
  'niemand': true,
  'niets': true,
  
  // Variations and compounds
  'nee': true,
  'neen': true,
  'noch': true,
  'zonder': true,
  
  // Contractions (informal Dutch)
  "n't": true,     // bijvoorbeeld: da's n't waar (that's not true)
  "'t": true,      // in negative contexts
};
