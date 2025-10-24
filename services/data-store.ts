/**
 * Data store service using Netlify Blobs
 */

import { getStore } from "@netlify/blobs";
import type { SentimentHistory, SentimentDataPoint } from "../types/sentiment";

const STORE_NAME = "sentiment-data";
const HISTORY_KEY = "sentiment-history";

/**
 * Get the sentiment data store
 */
export function getSentimentStore() {
  return getStore(STORE_NAME);
}

/**
 * Get sentiment history from storage
 */
export async function getSentimentHistory(): Promise<SentimentHistory | null> {
  try {
    const store = getSentimentStore();
    const data = await store.get(HISTORY_KEY, { type: "json" });
    return data as SentimentHistory | null;
  } catch (error) {
    console.error("Failed to get sentiment history:", error);
    return null;
  }
}

/**
 * Save sentiment history to storage
 */
export async function saveSentimentHistory(
  history: SentimentHistory
): Promise<boolean> {
  try {
    const store = getSentimentStore();
    await store.setJSON(HISTORY_KEY, history);
    return true;
  } catch (error) {
    console.error("Failed to save sentiment history:", error);
    return false;
  }
}

/**
 * Add a new data point to history
 */
export async function addDataPoint(
  dataPoint: SentimentDataPoint
): Promise<boolean> {
  try {
    let history = await getSentimentHistory();

    if (!history) {
      // Initialize new history
      history = {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        dataPoints: [],
        retentionDays: 7,
        sources: [
          {
            id: "nu-nl-gezondheid",
            name: "NU.nl Gezondheid",
            feedUrl: "https://www.nu.nl/rss/Gezondheid",
            language: "nl",
            isActive: true,
            lastFetchSuccess: null,
            lastFetchError: null,
            fetchIntervalMinutes: 60,
            articlesPerFetch: 20,
          },
        ],
      };
    }

    // Add new data point at the beginning
    history.dataPoints.unshift(dataPoint);

    // Clean up old data points (7-day retention)
    const cutoffTime =
      Date.now() - history.retentionDays * 24 * 60 * 60 * 1000;
    history.dataPoints = history.dataPoints.filter(
      (dp: SentimentDataPoint) => new Date(dp.timestamp).getTime() > cutoffTime
    );

    // Update metadata
    history.lastUpdated = new Date().toISOString();

    return await saveSentimentHistory(history);
  } catch (error) {
    console.error("Failed to add data point:", error);
    return false;
  }
}

/**
 * Get the latest data point
 */
export async function getLatestDataPoint(): Promise<SentimentDataPoint | null> {
  const history = await getSentimentHistory();
  return history && history.dataPoints.length > 0
    ? history.dataPoints[0]
    : null;
}

/**
 * Get data points for a time range
 */
export async function getDataPointsInRange(
  fromDate: Date,
  toDate: Date
): Promise<SentimentDataPoint[]> {
  const history = await getSentimentHistory();
  if (!history) return [];

  return history.dataPoints.filter((dp: SentimentDataPoint) => {
    const timestamp = new Date(dp.timestamp);
    return timestamp >= fromDate && timestamp <= toDate;
  });
}
