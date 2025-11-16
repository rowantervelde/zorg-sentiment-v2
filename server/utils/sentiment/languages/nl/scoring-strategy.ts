/**
 * Dutch sentiment scoring strategy
 * 
 * Handles negation in Dutch sentences.
 * When a negation word (niet, geen, nooit, etc.) precedes a sentiment word,
 * the sentiment is inverted.
 * 
 * Examples:
 * - "goed" (+2) → "niet goed" (-2)
 * - "slecht" (-2) → "niet slecht" (+2)
 * - "duur" (-2) → "geen dure" (+2)
 */

import { negators } from './negators';

export interface ScoringStrategy {
  apply: (tokens: string[], cursor: number, tokenScore: number) => number;
}

export const scoringStrategy: ScoringStrategy = {
  apply: function(tokens: string[], cursor: number, tokenScore: number): number {
    // Check if the previous token is a negator
    if (cursor > 0) {
      const prevToken = tokens[cursor - 1]?.toLowerCase();
      if (prevToken && negators[prevToken]) {
        // Invert the sentiment score
        tokenScore = -tokenScore;
      }
    }
    
    return tokenScore;
  }
};
