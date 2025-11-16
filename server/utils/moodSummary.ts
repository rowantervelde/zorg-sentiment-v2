/**
 * Mood Summary Generator
 * Generates human-readable Dutch summaries with emoji based on sentiment
 */

import type { MoodType, MoodSummary, SentimentDataPoint } from '~/types/sentiment';
import type { ArticleWithSentiment } from '../types/article';

/**
 * Dutch mood summary templates
 * Following VD-004 and VD-004a specifications for playful, friendly tone
 */
const MOOD_TEMPLATES: Record<MoodType, string[]> = {
  positive: [
    'Nederland voelt zich optimistisch over zorgverzekeringen',
    'De stemming over zorg is positief',
    'Er heerst een hoopvol gevoel over gezondheidszorg',
    'Positieve vibes over zorgverzekeringen',
    'Nederland kijkt hoopvol naar de gezondheidszorg',
    'De sfeer rondom zorg is opgewekt',
  ],
  negative: [
    'Er is onvrede over zorgverzekeringen',
    'De stemming over zorg is negatief',
    'Zorgen over gezondheidszorg domineren',
    'Nederland maakt zich zorgen over de gezondheidszorg',
    'Kritische geluiden over zorgverzekeringen',
    'Onrust over de zorgverzekeringen',
  ],
  mixed: [
    'De meningen over zorg zijn verdeeld',
    'Een gemengd gevoel over zorgverzekeringen',
    'De stemming over zorg is gemengd',
    'Nederland is verdeeld over de gezondheidszorg',
    'Wisselende meningen over zorgverzekeringen',
    'Een gemêleerd beeld over de gezondheidszorg',
  ],
  neutral: [
    'Een neutrale stemming over zorgverzekeringen',
    'Kalme reacties op gezondheidszorg',
    'De stemming over zorg is neutraal',
    'Rustig nieuws over gezondheidszorg',
    'Geen sterke reacties op zorgverzekeringen',
    'Evenwichtige berichtgeving over zorg',
  ],
};

/**
 * Emoji mapping for mood types (per VD-001)
 */
const MOOD_EMOJI: Record<MoodType, string> = {
  positive: '😊',
  negative: '😟',
  mixed: '😐',
  neutral: '😐',
};

/**
 * Generate a mood summary from a sentiment data point
 */
export function generateMoodSummary(dataPoint: SentimentDataPoint): MoodSummary {
  const template = getRandomTemplate(dataPoint.moodClassification);
  const emoji = getMoodEmoji(dataPoint.moodClassification);

  return {
    text: template,
    mood: dataPoint.moodClassification,
    generatedAt: new Date().toISOString(),
    basedOnDataPoint: dataPoint.timestamp,
    emoji,
  };
}

/**
 * Get a random template for the mood type
 */
function getRandomTemplate(mood: MoodType): string {
  const templates = MOOD_TEMPLATES[mood];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex] ?? templates[0] ?? 'De stemming over zorg';
}

/**
 * Get emoji for mood type
 */
export function getMoodEmoji(mood: MoodType): string {
  return MOOD_EMOJI[mood];
}

/**
 * Generate a summary with percentage details
 * Example: "Nederland is positief over zorg (65% positief, 25% neutraal, 10% negatief)"
 */
export function generateDetailedSummary(dataPoint: SentimentDataPoint): string {
  const baseTemplate = getRandomTemplate(dataPoint.moodClassification);
  const percentageDetail = `(${dataPoint.breakdown.positive}% positief, ${dataPoint.breakdown.neutral}% neutraal, ${dataPoint.breakdown.negative}% negatief)`;
  
  return `${baseTemplate} ${percentageDetail}`;
}

/**
 * Generate a summary for no data scenario
 */
export function getNoDataMessage(): string {
  return 'We verzamelen nog gegevens over de stemming. Check straks terug!';
}

/**
 * Generate a stale data warning message
 */
export function getStaleDataWarning(hoursOld: number): string {
  if (hoursOld < 24) {
    return '';
  }
  
  const daysOld = Math.floor(hoursOld / 24);
  
  if (daysOld === 1) {
    return '⚠️ Data is meer dan 1 dag oud';
  }
  
  return `⚠️ Data is ${daysOld} dagen oud`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return 'Zojuist';
  }
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minuut' : 'minuten'} geleden`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'uur' : 'uren'} geleden`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
  }
  
  // Format as date for older data
  return date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Validate summary text length (max 200 chars per VD-005)
 */
export function validateSummaryLength(text: string): boolean {
  return text.length <= 200;
}

/**
 * Calculate aggregate mood and breakdown from analyzed articles
 * Single source of truth - all metrics derived from article-level data
 * 
 * Feature 004: Replaces source-percentage based calculation
 * 
 * @param articles - Array of analyzed articles with sentiment scores
 * @returns Aggregate breakdown and mood classification
 */
export function calculateMoodFromArticles(articles: ArticleWithSentiment[]): {
  breakdown: { positive: number; neutral: number; negative: number };
  moodClassification: MoodType;
} {
  if (articles.length === 0) {
    return {
      breakdown: { positive: 0, neutral: 100, negative: 0 },
      moodClassification: 'neutral',
    };
  }
  
  // Count articles by sentiment category
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  
  articles.forEach((article) => {
    // Classify based on raw sentiment score
    // Positive: > 0.2
    // Negative: < -0.2
    // Neutral: -0.2 to 0.2
    if (article.rawSentimentScore > 0.2) {
      positiveCount++;
    } else if (article.rawSentimentScore < -0.2) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });
  
  // Calculate percentages
  const total = articles.length;
  const positivePercentage = Math.round((positiveCount / total) * 100);
  const negativePercentage = Math.round((negativeCount / total) * 100);
  const neutralPercentage = 100 - positivePercentage - negativePercentage;
  
  // Classify mood based on ≥60% threshold
  let moodClassification: MoodType = 'neutral';
  
  if (positivePercentage >= 60) {
    moodClassification = 'positive';
  } else if (negativePercentage >= 60) {
    moodClassification = 'negative';
  } else if (positivePercentage > negativePercentage && positivePercentage >= 40) {
    moodClassification = 'mixed'; // Leaning positive
  } else if (negativePercentage > positivePercentage && negativePercentage >= 40) {
    moodClassification = 'mixed'; // Leaning negative
  }
  
  return {
    breakdown: {
      positive: positivePercentage,
      neutral: neutralPercentage,
      negative: negativePercentage,
    },
    moodClassification,
  };
}
