/**
 * Netlify Function: Collect Sentiment Data
 * Scheduled to run hourly to fetch RSS feed and analyze sentiment
 */

import type { Config } from "@netlify/functions";
import { fetchRSSFeed, extractTextForAnalysis } from "../../services/rss-fetcher";
import {
  analyzeSentimentBatch,
  classifyMood,
  generateMoodSummary,
  normalizeBreakdown,
} from "../../services/sentiment-analyzer";
import { addDataPoint } from "../../services/data-store";
import type { SentimentDataPoint } from "../../types/sentiment";

export default async (req: Request) => {
  const startTime = Date.now();

  try {
    // Get RSS feed URL from environment
    const feedUrl =
      process.env.RSS_FEED_URL || "https://www.nu.nl/rss/Gezondheid";

    console.log(`[Collect] Starting sentiment collection from ${feedUrl}`);

    // Fetch RSS feed
    const fetchResult = await fetchRSSFeed(feedUrl);

    if (!fetchResult.success || fetchResult.articles.length === 0) {
      console.error("[Collect] Failed to fetch RSS feed:", fetchResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: fetchResult.error || "No articles found",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Collect] Fetched ${fetchResult.articles.length} articles`);

    // Extract text for analysis
    const texts = extractTextForAnalysis(fetchResult.articles);

    // Analyze sentiment
    const breakdown = analyzeSentimentBatch(texts);
    const normalizedBreakdown = normalizeBreakdown(breakdown);
    const moodClassification = classifyMood(normalizedBreakdown);

    // Create data point
    const timestamp = new Date().toISOString();
    const moodSummary = generateMoodSummary(moodClassification, timestamp);

    const dataPoint: SentimentDataPoint = {
      timestamp,
      collectionDurationMs: Date.now() - startTime,
      moodClassification,
      breakdown: normalizedBreakdown,
      summary: moodSummary.text,
      articlesAnalyzed: fetchResult.articles.length,
      source: "nu-nl-gezondheid",
    };

    // Save to storage
    const saved = await addDataPoint(dataPoint);

    if (!saved) {
      console.error("[Collect] Failed to save data point");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save data",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[Collect] Successfully collected sentiment: ${moodClassification}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        dataPoint,
        duration: Date.now() - startTime,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Collect] Error during sentiment collection:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Configure as scheduled function (hourly)
export const config: Config = {
  schedule: "@hourly",
};
