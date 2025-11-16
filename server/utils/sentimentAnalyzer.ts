/**
 * Sentiment Analyzer for Dutch text
 * Analyzes text sentiment using custom Dutch healthcare lexicon
 * Classifies mood based on ≥60% threshold
 */

import Sentiment from 'sentiment';
import type { MoodType } from '~/types/sentiment';
import type { Article, ArticleWithSentiment } from '../types/article';
import type { SourceConfiguration } from '../types/sourceConfiguration';
import { dutchLanguage } from './sentiment/languages/nl';

// Initialize sentiment analyzer with Dutch language support
const sentiment = new Sentiment();
sentiment.registerLanguage('nl', dutchLanguage);

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
 * Analyze sentiment of Dutch text using custom Dutch healthcare lexicon
 * Uses Dutch-specific vocabulary including healthcare terms
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  const result = sentiment.analyze(text, { language: 'nl' });

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

/**
 * Calculate recency weight using exponential decay
 * More recent articles have higher weight (closer to 1.0)
 * Older articles decay towards 0.5
 * 
 * @param pubDate - Publication date (ISO 8601)
 * @param halfLifeHours - Time for weight to decay to 0.75 (default 24 hours)
 * @returns Weight between 0.5 and 1.0
 */
export function calculateRecencyWeight(pubDate: string, halfLifeHours: number = 24): number {
  const now = Date.now();
  const pubTime = new Date(pubDate).getTime();
  const ageHours = (now - pubTime) / (1000 * 60 * 60);
  
  // Exponential decay: weight = 0.5 + 0.5 * exp(-ageHours / halfLifeHours)
  // Recent articles (age=0) → 1.0
  // Old articles (age→∞) → 0.5
  const weight = 0.5 + 0.5 * Math.exp(-ageHours / halfLifeHours);
  
  return Math.max(0.5, Math.min(1.0, weight));
}

/**
 * Calculate source reliability weight
 * Based on source's historical success rate and response time
 * 
 * @param sourceConfig - Source configuration with reliability metrics
 * @returns Weight between 0.5 and 1.0
 */
export function calculateSourceWeight(sourceConfig?: SourceConfiguration): number {
  if (!sourceConfig?.reliability) {
    return 1.0; // Default to full weight if no reliability data
  }
  
  const reliability = sourceConfig.reliability;
  const successRate = reliability.successRate ?? 100;
  const isHealthy = (reliability as any).isHealthy ?? true;
  const isInactive = (reliability as any).isInactive ?? false;
  
  // Inactive sources get minimum weight
  if (isInactive) {
    return 0.5;
  }
  
  // Unhealthy sources get reduced weight
  if (!isHealthy) {
    return 0.7;
  }
  
  // Scale success rate (0-100) to weight (0.8-1.0)
  // 100% success → 1.0
  // 0% success → 0.8
  const weight = 0.8 + (successRate / 100) * 0.2;
  
  return Math.max(0.5, Math.min(1.0, weight));
}

/**
 * Analyze individual article with complete sentiment details
 * Returns ArticleWithSentiment including scores, word lists, and weights
 * 
 * Feature 004: Single source of truth for all sentiment metrics
 * 
 * @param article - Article to analyze
 * @param sourceConfig - Optional source configuration for weighting
 * @returns ArticleWithSentiment with complete analysis
 */
export function analyzeArticleWithDetails(
  article: Article,
  sourceConfig?: SourceConfiguration
): ArticleWithSentiment {
  // Analyze article content using Dutch language
  const result = sentiment.analyze(article.content, { language: 'nl' });
  
  // Extract word lists from sentiment analyzer
  const positiveWords = result.positive || [];
  const negativeWords = result.negative || [];
  
  // Normalize score to -1.0 to +1.0 range
  // comparative score is already normalized per word
  const rawSentimentScore = Math.max(-1.0, Math.min(1.0, result.comparative));
  
  // Calculate weights
  const recencyWeight = calculateRecencyWeight(article.pubDate);
  const sourceWeight = calculateSourceWeight(sourceConfig);
  
  // Calculate final weighted score
  const finalWeightedScore = rawSentimentScore * recencyWeight * sourceWeight;
  
  // Generate unique ID
  const id = `${article.sourceId}-${article.deduplicationHash.substring(0, 8)}`;
  
  return {
    ...article,
    id,
    rawSentimentScore,
    positiveWords,
    negativeWords,
    recencyWeight,
    sourceWeight,
    finalWeightedScore,
    contributionPercentage: 0, // Will be calculated after analyzing all articles
    deduplicated: false, // Will be set by deduplicator
  };
}

/**
 * Calculate contribution percentages for analyzed articles
 * Normalizes finalWeightedScore to percentage of total impact
 * 
 * @param articles - Articles with sentiment analysis
 * @returns Same articles with updated contributionPercentage
 */
export function calculateContributionPercentages(
  articles: ArticleWithSentiment[]
): ArticleWithSentiment[] {
  if (articles.length === 0) {
    return articles;
  }
  
  // Sum of absolute weighted scores (total impact)
  const totalImpact = articles.reduce(
    (sum, article) => sum + Math.abs(article.finalWeightedScore),
    0
  );
  
  if (totalImpact === 0) {
    // All neutral articles
    const equalPercentage = 100 / articles.length;
    return articles.map(article => ({
      ...article,
      contributionPercentage: equalPercentage,
    }));
  }
  
  // Calculate percentage for each article
  return articles.map(article => ({
    ...article,
    contributionPercentage: (Math.abs(article.finalWeightedScore) / totalImpact) * 100,
  }));
}
