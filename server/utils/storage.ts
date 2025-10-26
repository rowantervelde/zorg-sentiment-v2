/**
 * Storage utility using Netlify Blobs
 * Manages persistent storage of sentiment data with 7-day retention
 * 
 * Supports multi-source sentiment data with sourceContributions and sourceDiversity
 * (added in feature 002-multi-source-sentiment)
 */

import { getStore } from '@netlify/blobs';
import type { SentimentDataPoint, SentimentHistory, DataSource } from '~/types/sentiment';

const STORE_NAME = 'sentiment-data';
const RETENTION_DAYS = 7;
const HISTORY_KEY = 'sentiment-history';

const MVP_DATA_SOURCE: DataSource = {
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

/**
 * Get the Netlify Blobs store instance
 */
export function getSentimentStore() {
  return getStore({
    name: STORE_NAME,
    consistency: 'strong', // Ensure consistency for data integrity
  });
}

/**
 * Get all sentiment data from storage
 */
export async function getData(): Promise<SentimentHistory> {
  const store = getSentimentStore();
  
  try {
    const data = await store.get(HISTORY_KEY, { type: 'json' }) as SentimentHistory | null;
    
    if (!data) {
      // Return empty history if no data exists
      return {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        dataPoints: [],
        retentionDays: RETENTION_DAYS,
        sources: [MVP_DATA_SOURCE],
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error reading sentiment data:', error);
    // Return empty history on error
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      dataPoints: [],
      retentionDays: RETENTION_DAYS,
      sources: [MVP_DATA_SOURCE],
    };
  }
}

/**
 * Save sentiment data to storage
 */
export async function saveData(history: SentimentHistory): Promise<void> {
  const store = getSentimentStore();
  
  try {
    await store.setJSON(HISTORY_KEY, history);
  } catch (error) {
    console.error('Error saving sentiment data:', error);
    throw new Error('Failed to save sentiment data');
  }
}

/**
 * Add a new data point and clean up old data (7-day window)
 */
export async function addDataPoint(dataPoint: SentimentDataPoint): Promise<void> {
  const history = await getData();
  
  // Add new data point at the beginning (newest first)
  history.dataPoints.unshift(dataPoint);
  
  // Clean up data older than retention period
  const cleanedHistory = cleanup7DayWindow(history);
  
  // Update metadata
  cleanedHistory.lastUpdated = new Date().toISOString();
  
  // Save back to storage
  await saveData(cleanedHistory);
}

/**
 * Remove data points older than 7 days
 */
export function cleanup7DayWindow(history: SentimentHistory): SentimentHistory {
  const now = new Date();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const cutoffDate = new Date(now.getTime() - retentionMs);
  
  // Filter out data points older than cutoff date
  const filteredDataPoints = history.dataPoints.filter((dp) => {
    const dpDate = new Date(dp.timestamp);
    return dpDate >= cutoffDate;
  });
  
  return {
    ...history,
    dataPoints: filteredDataPoints,
  };
}

/**
 * Get the most recent data point
 */
export async function getCurrentDataPoint(): Promise<SentimentDataPoint | null> {
  const history = await getData();
  
  if (history.dataPoints.length === 0) {
    return null;
  }
  
  return history.dataPoints[0] || null; // Newest first
}

/**
 * Get data points within a specific time range
 */
export async function getDataPointsInRange(
  startDate: Date,
  endDate: Date
): Promise<SentimentDataPoint[]> {
  const history = await getData();
  
  return history.dataPoints.filter((dp) => {
    const dpDate = new Date(dp.timestamp);
    return dpDate >= startDate && dpDate <= endDate;
  });
}

/**
 * Update data source status
 */
export async function updateDataSourceStatus(
  sourceId: string,
  success: boolean,
  error?: string
): Promise<void> {
  const history = await getData();
  
  const sourceIndex = history.sources.findIndex((s) => s.id === sourceId);
  
  if (sourceIndex !== -1) {
    const now = new Date().toISOString();
    const source = history.sources[sourceIndex];
    
    if (source) {
      if (success) {
        source.lastFetchSuccess = now;
        source.lastFetchError = null;
      } else {
        source.lastFetchError = error || 'Unknown error';
      }
      
      await saveData(history);
    }
  }
}

/**
 * Check if data is stale (older than 24 hours)
 */
export async function isDataStale(): Promise<boolean> {
  const current = await getCurrentDataPoint();
  
  if (!current) {
    return true; // No data is considered stale
  }
  
  const now = new Date();
  const dataDate = new Date(current.timestamp);
  const hoursSinceUpdate = (now.getTime() - dataDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceUpdate > 24;
}

/**
 * Get data age in seconds
 */
export async function getDataAge(): Promise<number> {
  const current = await getCurrentDataPoint();
  
  if (!current) {
    return Infinity; // No data
  }
  
  const now = new Date();
  const dataDate = new Date(current.timestamp);
  const ageSeconds = (now.getTime() - dataDate.getTime()) / 1000;
  
  return ageSeconds;
}
