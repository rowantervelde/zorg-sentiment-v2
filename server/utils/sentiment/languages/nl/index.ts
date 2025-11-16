/**
 * Dutch (Netherlands) language module for sentiment analysis
 * 
 * This module provides Dutch-specific sentiment analysis with:
 * - Healthcare-focused vocabulary (premie, eigen risico, verzekering, etc.)
 * - General Dutch sentiment words (goed, slecht, fantastisch, etc.)
 * - Dutch negation handling (niet, geen, nooit, etc.)
 * 
 * Usage:
 * ```typescript
 * import Sentiment from 'sentiment';
 * import { dutchLanguage } from './languages/nl';
 * 
 * const sentiment = new Sentiment();
 * sentiment.registerLanguage('nl', dutchLanguage);
 * 
 * const result = sentiment.analyze('De premie is niet te duur', { language: 'nl' });
 * // Result will correctly handle "niet te duur" as less negative
 * ```
 */

import { labels } from './labels';
import { scoringStrategy } from './scoring-strategy';

export const dutchLanguage = {
  labels,
  scoringStrategy
};

// Also export individual components for flexibility
export { labels } from './labels';
export { negators } from './negators';
export { scoringStrategy } from './scoring-strategy';
