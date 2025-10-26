/**
 * Sentiment Analyzer for Dutch text
 * Analyzes text sentiment using the sentiment npm package
 * Classifies mood based on ≥60% threshold
 */

import Sentiment from 'sentiment';
import type { MoodType } from '~/types/sentiment';

const sentiment = new Sentiment();

/**
 * Sentiment analysis result
 */
export interface SentimentAnalysis {
  score: number; // Raw sentiment score
  comparative: number; // Normalized score per word
  positive: number; // Count of positive words
  negative: number; // Count of negative words
  moodClassification: MoodType;
  breakdown: {
    positive: number; // Percentage 0-100
    neutral: number; // Percentage 0-100
    negative: number; // Percentage 0-100
  };
}

/**
 * Analyze sentiment of Dutch text
 * Note: The sentiment package is English-focused, but works reasonably with Dutch
 * For production, consider using Google Cloud Natural Language API with Dutch support
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  const result = sentiment.analyze(text);

  // Calculate percentages based on positive/negative word counts
  const totalWords = result.positive.length + result.negative.length;
  
  let positivePercentage = 0;
  let negativePercentage = 0;
  let neutralPercentage = 100;

  if (totalWords > 0) {
    positivePercentage = Math.round((result.positive.length / totalWords) * 100);
    negativePercentage = Math.round((result.negative.length / totalWords) * 100);
    neutralPercentage = 100 - positivePercentage - negativePercentage;
  }

  // Classify mood based on ≥60% threshold
  const moodClassification = classifyMood(positivePercentage, negativePercentage);

  return {
    score: result.score,
    comparative: result.comparative,
    positive: result.positive.length,
    negative: result.negative.length,
    moodClassification,
    breakdown: {
      positive: positivePercentage,
      neutral: neutralPercentage,
      negative: negativePercentage,
    },
  };
}

/**
 * Classify mood based on breakdown percentages
 * Rules:
 * - positive: positive >= 60%
 * - negative: negative >= 60%
 * - mixed/neutral: otherwise
 */
function classifyMood(positivePercentage: number, negativePercentage: number): MoodType {
  if (positivePercentage >= 60) {
    return 'positive';
  }
  
  if (negativePercentage >= 60) {
    return 'negative';
  }
  
  // If neither dominates, it's mixed or neutral
  // Use comparative score to distinguish
  if (positivePercentage > negativePercentage) {
    return 'mixed'; // Slightly positive mix
  }
  
  return 'neutral'; // Balanced or slightly negative
}

/**
 * Analyze multiple texts and aggregate results
 */
export function analyzeMultiple(texts: string[]): SentimentAnalysis {
  if (texts.length === 0) {
    return {
      score: 0,
      comparative: 0,
      positive: 0,
      negative: 0,
      moodClassification: 'neutral',
      breakdown: {
        positive: 0,
        neutral: 100,
        negative: 0,
      },
    };
  }

  // Analyze each text
  const analyses = texts.map((text) => analyzeSentiment(text));

  // Calculate averages
  const avgPositive = Math.round(
    analyses.reduce((sum, a) => sum + a.breakdown.positive, 0) / analyses.length
  );
  const avgNegative = Math.round(
    analyses.reduce((sum, a) => sum + a.breakdown.negative, 0) / analyses.length
  );
  const avgNeutral = 100 - avgPositive - avgNegative;

  // Aggregate scores
  const totalScore = analyses.reduce((sum, a) => sum + a.score, 0);
  const avgComparative = analyses.reduce((sum, a) => sum + a.comparative, 0) / analyses.length;

  return {
    score: totalScore,
    comparative: avgComparative,
    positive: analyses.reduce((sum, a) => sum + a.positive, 0),
    negative: analyses.reduce((sum, a) => sum + a.negative, 0),
    moodClassification: classifyMood(avgPositive, avgNegative),
    breakdown: {
      positive: avgPositive,
      neutral: avgNeutral,
      negative: avgNegative,
    },
  };
}

/**
 * Calculate confidence score based on analysis quality
 * Higher confidence when:
 * - More words analyzed
 * - Clear positive/negative distinction
 * - Multiple articles analyzed
 */
export function calculateConfidence(
  analysis: SentimentAnalysis,
  articleCount: number
): number {
  const totalSentimentWords = analysis.positive + analysis.negative;
  
  // Base confidence on word count (0-0.5)
  const wordConfidence = Math.min(totalSentimentWords / 50, 0.5);
  
  // Confidence from article count (0-0.3)
  const articleConfidence = Math.min(articleCount / 20, 0.3);
  
  // Confidence from clear sentiment (0-0.2)
  const clarityConfidence = Math.abs(analysis.breakdown.positive - analysis.breakdown.negative) / 100 * 0.2;
  
  return Math.min(wordConfidence + articleConfidence + clarityConfidence, 1.0);
}
