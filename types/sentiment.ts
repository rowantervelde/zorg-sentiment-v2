/**
 * Core data types for sentiment analysis
 */

export type MoodType = "positive" | "negative" | "mixed" | "neutral";

export interface SentimentBreakdown {
  positive: number; // 0-100
  neutral: number; // 0-100
  negative: number; // 0-100
}

export interface SentimentDataPoint {
  // Identity & Timing
  timestamp: string; // ISO 8601 format
  collectionDurationMs: number;

  // Mood Classification
  moodClassification: MoodType;

  // Sentiment Breakdown (percentages, must sum to 100)
  breakdown: SentimentBreakdown;

  // Human-Readable Summary
  summary: string; // Dutch summary

  // Metadata
  articlesAnalyzed: number;
  source: string;

  // Data Quality (optional)
  confidence?: number; // 0-1
  errors?: string[];
}

export interface MoodSummary {
  text: string; // Dutch summary text
  mood: MoodType;
  generatedAt: string; // ISO 8601
  basedOnDataPoint: string; // ISO 8601 timestamp reference
  emoji: string; // Emoji representation
}

export interface TrendPeriod {
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  dataPoints: SentimentDataPoint[];
  averageMood: SentimentBreakdown;
  dominantMood: MoodType;
  totalDataPoints: number;
  missingHours: number;
  dataCompleteness: number; // 0-100 percentage
}

export interface DataSource {
  id: string;
  name: string;
  feedUrl: string;
  language: string;
  isActive: boolean;
  lastFetchSuccess: string | null;
  lastFetchError: string | null;
  fetchIntervalMinutes: number;
  articlesPerFetch: number;
}

export interface SentimentHistory {
  version: string;
  lastUpdated: string;
  dataPoints: SentimentDataPoint[];
  retentionDays: number;
  sources: DataSource[];
}
