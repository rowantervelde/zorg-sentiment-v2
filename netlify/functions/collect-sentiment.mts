/**
 * Netlify Scheduled Function: Collect Sentiment Data
 * Runs hourly to fetch RSS feed, analyze sentiment, and store results
 * Schedule configured in netlify.toml: @hourly
 */

import type { Config } from '@netlify/functions';
import type { SentimentDataPoint } from '../../app/types/sentiment';
import { fetchRSSFeed, limitArticles } from '../../server/utils/rssFetcher';
import { analyzeMultiple, calculateConfidence } from '../../server/utils/sentimentAnalyzer';
import { generateMoodSummary } from '../../server/utils/moodSummary';
import { addDataPoint, updateDataSourceStatus } from '../../server/utils/storage';

const RSS_FEED_URL = process.env.RSS_FEED_URL || 'https://www.nu.nl/rss/Gezondheid';
const ARTICLES_PER_FETCH = 20;
const SOURCE_ID = 'nu-nl-gezondheid';

/**
 * Main scheduled function handler
 */
export default async (req: Request) => {
  const startTime = Date.now();
  
  try {
    const { next_run } = await req.json();
    console.log('[Collect Sentiment] Starting collection. Next run:', next_run);

    // Step 1: Fetch RSS feed
    console.log('[Collect Sentiment] Fetching RSS feed:', RSS_FEED_URL);
    const articles = await fetchRSSFeed(RSS_FEED_URL);
    const limitedArticles = limitArticles(articles, ARTICLES_PER_FETCH);
    
    console.log(`[Collect Sentiment] Fetched ${articles.length} articles, using ${limitedArticles.length}`);

    if (limitedArticles.length === 0) {
      console.warn('[Collect Sentiment] No articles found in RSS feed');
      await updateDataSourceStatus(SOURCE_ID, false, 'No articles found in RSS feed');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No articles found' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Analyze sentiment
    console.log('[Collect Sentiment] Analyzing sentiment...');
    const articleTexts = limitedArticles.map((a) => a.content);
    const analysis = analyzeMultiple(articleTexts);
    
    console.log('[Collect Sentiment] Analysis complete:', {
      mood: analysis.moodClassification,
      breakdown: analysis.breakdown,
    });

    // Step 3: Generate mood summary
    const timestamp = new Date().toISOString();
    const confidence = calculateConfidence(analysis, limitedArticles.length);
    
    const dataPoint: SentimentDataPoint = {
      timestamp,
      collectionDurationMs: Date.now() - startTime,
      moodClassification: analysis.moodClassification,
      breakdown: analysis.breakdown,
      summary: '', // Will be set below
      articlesAnalyzed: limitedArticles.length,
      source: SOURCE_ID,
      confidence,
    };

    const moodSummary = generateMoodSummary(dataPoint);
    dataPoint.summary = moodSummary.text;

    console.log('[Collect Sentiment] Generated summary:', moodSummary.text);

    // Step 4: Store data point
    console.log('[Collect Sentiment] Saving data point...');
    await addDataPoint(dataPoint);
    await updateDataSourceStatus(SOURCE_ID, true);

    const duration = Date.now() - startTime;
    console.log(`[Collect Sentiment] Collection complete in ${duration}ms`);

    return new Response(JSON.stringify({
      success: true,
      dataPoint: {
        timestamp: dataPoint.timestamp,
        mood: dataPoint.moodClassification,
        articlesAnalyzed: dataPoint.articlesAnalyzed,
      },
      durationMs: duration,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Collect Sentiment] Error during collection:', error);
    
    await updateDataSourceStatus(
      SOURCE_ID,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Netlify scheduled function configuration
 * Runs every hour via netlify.toml configuration
 */
export const config: Config = {
  schedule: '@hourly',
};
