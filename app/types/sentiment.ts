/**
 * Core TypeScript interfaces for MVP Sentiment Dashboard
 * Based on data-model.md specification
 */

// Mood classification types
export type MoodType = "positive" | "negative" | "mixed" | "neutral";

/**
 * Source contribution tracking for multi-source sentiment
 */
export interface SourceContribution {
  /** References SourceConfiguration.id */
  sourceId: string
  
  /** Display name at time of collection */
  sourceName: string
  
  /** Source type: 'rss' | 'social' | 'other' */
  sourceType: string
  
  /** Count of articles from this source */
  articlesCollected: number
  
  /** Sentiment breakdown from this source */
  sentimentBreakdown: {
    positive: number // Percentage 0-100
    neutral: number // Percentage 0-100
    negative: number // Percentage 0-100
  }
  
  /** Timestamp of fetch (ISO 8601) */
  fetchedAt: string
  
  /** Time taken to fetch articles */
  fetchDurationMs: number
  
  /** Fetch status */
  status: 'success' | 'failed' | 'partial'
  
  /** Error message if status='failed' */
  error?: string
}

/**
 * Source diversity metrics
 */
export interface SourceDiversity {
  /** Total sources attempted */
  totalSources: number
  
  /** Sources that returned data */
  activeSources: number
  
  /** Sources that failed */
  failedSources: number
}

/**
 * Single hourly measurement of Dutch healthcare insurance sentiment
 */
export interface SentimentDataPoint {
  // Identity & Timing
  timestamp: string; // ISO 8601 format: "2025-10-24T14:00:00Z"
  collectionDurationMs: number; // Time taken to collect & analyze data

  // Mood Classification
  moodClassification: MoodType;

  // Sentiment Breakdown (percentages, must sum to 100)
  breakdown: {
    positive: number; // 0-100
    neutral: number; // 0-100
    negative: number; // 0-100
  };

  // Human-Readable Summary
  summary: string; // e.g., "Nederland voelt zich optimistisch over zorg"

  // Metadata
  articlesAnalyzed: number; // Count of RSS articles processed
  source: string; // "nu.nl" for MVP (deprecated, use sourceContributions)

  // Multi-Source Attribution (NEW - optional for backward compatibility)
  sourceContributions?: SourceContribution[]; // Per-source breakdown
  sourceDiversity?: SourceDiversity; // Source diversity metrics

  // Data Quality (optional)
  confidence?: number; // 0-1, quality indicator
  errors?: string[]; // Collection errors if any (for debugging)
}

/**
 * Human-friendly text description of current sentiment
 */
export interface MoodSummary {
  // Content
  text: string; // "Nederland voelt zich optimistisch over zorg"
  mood: MoodType;

  // Generation Metadata
  generatedAt: string; // ISO 8601 timestamp
  basedOnDataPoint: string; // Timestamp reference to source SentimentDataPoint

  // Emoji/Icon Suggestion (for UI)
  emoji: string; // "😊", "😐", "😟"
}

/**
 * Collection of SentimentDataPoints over a time range (7 days for MVP)
 */
export interface TrendPeriod {
  // Time Range
  startDate: string; // ISO 8601: "2025-10-17T00:00:00Z"
  endDate: string; // ISO 8601: "2025-10-24T00:00:00Z"

  // Data Points (ordered chronologically)
  dataPoints: SentimentDataPoint[];

  // Summary Statistics
  averageMood: {
    positive: number; // Average positive % across period
    neutral: number; // Average neutral % across period
    negative: number; // Average negative % across period
  };

  dominantMood: MoodType; // Most frequent classification in period

  // Data Quality
  totalDataPoints: number; // Count of data points
  missingHours: number; // Expected vs actual (168 hours - actual count)
  dataCompleteness: number; // 0-100 percentage
}

/**
 * Reference to RSS feed source configuration
 */
export interface DataSource {
  // Identity
  id: string; // "nu-nl-gezondheid"
  name: string; // "NU.nl Gezondheid"

  // Configuration
  feedUrl: string; // RSS feed URL
  language: string; // "nl" for Dutch

  // Status
  isActive: boolean;
  lastFetchSuccess: string | null; // ISO 8601 timestamp
  lastFetchError: string | null; // Error message if failed

  // Metadata
  fetchIntervalMinutes: number; // 60 for hourly
  articlesPerFetch: number; // Target article count per fetch
}

/**
 * JSON file structure for sentiment history storage
 */
export interface SentimentHistory {
  version: string; // "1.0.0" for schema versioning
  lastUpdated: string; // ISO 8601 of last write
  dataPoints: SentimentDataPoint[]; // Ordered chronologically, newest first
  retentionDays: number; // 7 for MVP
  sources: DataSource[]; // Array of configured sources
}

/**
 * MVP Data Source Configuration
 */
export const MVP_DATA_SOURCE: DataSource = {
  id: "nu-nl-gezondheid",
  name: "NU.nl Gezondheid",
  feedUrl: "https://www.nu.nl/rss/Gezondheid",
  language: "nl",
  isActive: true,
  lastFetchSuccess: null,
  lastFetchError: null,
  fetchIntervalMinutes: 60,
  articlesPerFetch: 20,
};
