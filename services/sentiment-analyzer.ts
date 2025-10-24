/**
 * Sentiment analyzer service
 */

import Sentiment from "sentiment";
import type {
  MoodType,
  SentimentBreakdown,
  MoodSummary,
} from "../types/sentiment";

const sentiment = new Sentiment();

interface AnalysisResult {
  score: number;
  comparative: number;
  positive: string[];
  negative: string[];
}

/**
 * Analyze multiple texts and return aggregated sentiment breakdown
 */
export function analyzeSentimentBatch(texts: string[]): SentimentBreakdown {
  const results: AnalysisResult[] = texts.map((text) =>
    sentiment.analyze(text)
  );

  // Calculate positive, neutral, negative counts
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  results.forEach((result) => {
    if (result.comparative > 0.1) {
      positiveCount++;
    } else if (result.comparative < -0.1) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const total = results.length;

  return {
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100),
  };
}

/**
 * Classify mood based on sentiment breakdown (≥60% threshold)
 */
export function classifyMood(breakdown: SentimentBreakdown): MoodType {
  if (breakdown.positive >= 60) {
    return "positive";
  } else if (breakdown.negative >= 60) {
    return "negative";
  } else if (
    breakdown.positive > breakdown.neutral &&
    breakdown.positive > breakdown.negative
  ) {
    return "mixed";
  } else {
    return "neutral";
  }
}

/**
 * Generate mood summary with Dutch text
 */
export function generateMoodSummary(
  moodClassification: MoodType,
  timestamp: string
): MoodSummary {
  const templates = {
    positive: [
      "Nederland voelt zich optimistisch over zorgverzekeringen",
      "De stemming over zorg is positief",
      "Er heerst een hoopvol gevoel over gezondheidszorg",
    ],
    negative: [
      "Er is onvrede over zorgverzekeringen",
      "De stemming over zorg is negatief",
      "Zorgen over gezondheidszorg domineren",
    ],
    mixed: [
      "De meningen over zorg zijn verdeeld",
      "Een gemengd gevoel over zorgverzekeringen",
      "De stemming over zorg is gemengd",
    ],
    neutral: [
      "Een neutrale stemming over zorgverzekeringen",
      "Kalme reacties op gezondheidszorg",
      "De stemming over zorg is neutraal",
    ],
  };

  const moodTemplates = templates[moodClassification];
  const randomIndex = Math.floor(Math.random() * moodTemplates.length);
  const text = moodTemplates[randomIndex];

  return {
    text,
    mood: moodClassification,
    generatedAt: new Date().toISOString(),
    basedOnDataPoint: timestamp,
    emoji: getMoodEmoji(moodClassification),
  };
}

/**
 * Get emoji representation for mood
 */
export function getMoodEmoji(mood: MoodType): string {
  const emojiMap: Record<MoodType, string> = {
    positive: "😊",
    negative: "😟",
    mixed: "😐",
    neutral: "😐",
  };
  return emojiMap[mood];
}

/**
 * Normalize breakdown to ensure it sums to exactly 100
 */
export function normalizeBreakdown(
  breakdown: SentimentBreakdown
): SentimentBreakdown {
  const sum = breakdown.positive + breakdown.neutral + breakdown.negative;

  if (sum === 100) {
    return breakdown;
  }

  // Adjust values proportionally
  const factor = 100 / sum;
  const normalized = {
    positive: Math.round(breakdown.positive * factor),
    neutral: Math.round(breakdown.neutral * factor),
    negative: Math.round(breakdown.negative * factor),
  };

  // Handle rounding errors
  const newSum = normalized.positive + normalized.neutral + normalized.negative;
  if (newSum !== 100) {
    const diff = 100 - newSum;
    // Add diff to the largest component
    const largest =
      normalized.positive >= normalized.neutral &&
      normalized.positive >= normalized.negative
        ? "positive"
        : normalized.neutral >= normalized.negative
          ? "neutral"
          : "negative";
    normalized[largest] += diff;
  }

  return normalized;
}
