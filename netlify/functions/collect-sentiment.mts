/**
 * Netlify Scheduled Function: Collect Sentiment Data
 * Runs hourly to fetch from multiple RSS feeds, analyze sentiment, and store results
 * Schedule configured in netlify.toml: @hourly
 * 
 * Updated for multi-source collection (feature 002-multi-source-sentiment)
 */

import type { Config } from '@netlify/functions';
import type { SentimentDataPoint } from '../../app/types/sentiment';
import type { SourceConfiguration } from '../../server/types/sourceConfiguration';
import { fetchFromAllSources } from '../../server/utils/sourceOrchestrator';
import { analyzeMultiple, calculateConfidence } from '../../server/utils/sentimentAnalyzer';
import { generateMoodSummary } from '../../server/utils/moodSummary';
import { addDataPoint } from '../../server/utils/storage';
import sourcesConfig from '../../server/config/sources.json';

/**
 * Main scheduled function handler
 */
export default async (req: Request) => {
  const startTime = Date.now();
  
  try {
    const { next_run } = await req.json();
    console.log('[Collect Sentiment] Starting multi-source collection. Next run:', next_run);

    // Step 1: Load source configurations
    const sources = sourcesConfig.sources as SourceConfiguration[];
    console.log(`[Collect Sentiment] Loaded ${sources.length} source configurations`);
    console.time('[Collect Sentiment] Total duration');

    // Step 2: Fetch from all sources with orchestration
    console.log('[Collect Sentiment] Fetching from all sources...');
    console.time('[Collect Sentiment] Orchestration');
    const orchestrationResult = await fetchFromAllSources(sources);
    console.timeEnd('[Collect Sentiment] Orchestration');
    
    const { articles, sourceContributions, sourceDiversity, totalDurationMs } = orchestrationResult;
    
    console.log(`[Collect Sentiment] Orchestration complete in ${totalDurationMs}ms`);
    console.log(`[Collect Sentiment] Collected ${articles.length} unique articles from ${sourceDiversity.activeSources}/${sourceDiversity.totalSources} sources`);
    console.log(`[Collect Sentiment] Source contributions: ${sourceContributions.length} sources tracked`);

    if (articles.length === 0) {
      console.warn('[Collect Sentiment] No articles collected from any source');
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No articles collected from any source',
        sourceContributions,
        sourceDiversity,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Analyze sentiment across all articles
    console.log('[Collect Sentiment] Analyzing sentiment...');
    console.time('[Collect Sentiment] Sentiment analysis');
    const articleTexts = articles.map((a) => a.content);
    console.log(`[Collect Sentiment] Analyzing ${articleTexts.length} article texts...`);
    
    const analysis = analyzeMultiple(articleTexts);
    console.timeEnd('[Collect Sentiment] Sentiment analysis');
    
    console.log('[Collect Sentiment] Analysis complete:', {
      mood: analysis.moodClassification,
      breakdown: analysis.breakdown,
    });

    // Step 4: Calculate per-source sentiment breakdown
    console.log('[Collect Sentiment] Calculating per-source sentiment breakdowns...');
    console.time('[Collect Sentiment] Per-source analysis');
    const updatedContributions = sourceContributions.map((contribution) => {
      if (contribution.status === 'failed' || contribution.articlesCollected === 0) {
        console.log(`[Collect Sentiment] Skipping ${contribution.sourceName}: status=${contribution.status}`);
        return contribution;
      }
      
      // Get articles from this source
      const sourceArticles = articles.filter((a) => a.sourceId === contribution.sourceId);
      
      if (sourceArticles.length === 0) {
        console.log(`[Collect Sentiment] No articles found for ${contribution.sourceName} in deduplicated set`);
        return contribution;
      }
      
      // Analyze sentiment for this source's articles
      const sourceTexts = sourceArticles.map((a) => a.content);
      console.log(`[Collect Sentiment] Analyzing ${sourceTexts.length} articles from ${contribution.sourceName}...`);
      const sourceAnalysis = analyzeMultiple(sourceTexts);
      
      return {
        ...contribution,
        sentimentBreakdown: sourceAnalysis.breakdown,
      };
    });
    console.timeEnd('[Collect Sentiment] Per-source analysis');
    console.log(`[Collect Sentiment] Per-source sentiment analysis complete for ${updatedContributions.length} sources`);

    // Step 5: Generate mood summary
    console.log('[Collect Sentiment] Generating mood summary...');
    const timestamp = new Date().toISOString();
    const confidence = calculateConfidence(analysis, articles.length);
    
    const dataPoint: SentimentDataPoint = {
      timestamp,
      collectionDurationMs: Date.now() - startTime,
      moodClassification: analysis.moodClassification,
      breakdown: analysis.breakdown,
      summary: '', // Will be set below
      articlesAnalyzed: articles.length,
      source: 'multi-source', // Legacy field - kept for backward compatibility
      confidence,
      sourceContributions: updatedContributions,
      sourceDiversity,
    };

    const moodSummary = generateMoodSummary(dataPoint);
    dataPoint.summary = moodSummary.text;

    console.log('[Collect Sentiment] Generated summary:', moodSummary.text);
    console.log('[Collect Sentiment] Data point object created:', {
      timestamp: dataPoint.timestamp,
      mood: dataPoint.moodClassification,
      articlesAnalyzed: dataPoint.articlesAnalyzed,
      sourceContributions: dataPoint.sourceContributions?.length,
    });

    // Step 6: Store data point with 7-day retention validation
    console.log('[Collect Sentiment] Saving data point with 7-day retention validation...');
    console.time('[Collect Sentiment] Storage save');
    try {
      await addDataPoint(dataPoint);
      console.timeEnd('[Collect Sentiment] Storage save');
      console.log('[Collect Sentiment] Data point saved successfully to storage');
    } catch (storageError) {
      console.error('[Collect Sentiment] CRITICAL ERROR saving data point:', storageError);
      throw storageError;
    }

    // Verify data retention (7-day max)
    console.log('[Collect Sentiment] Verifying data retention...');
    console.time('[Collect Sentiment] Verify retention');
    const { getData } = await import('../../server/utils/storage');
    const history = await getData();
    const retentionDays = history.retentionDays;
    const oldestAllowed = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const violatingPoints = history.dataPoints.filter(
      (dp: SentimentDataPoint) => new Date(dp.timestamp) < oldestAllowed
    );
    console.timeEnd('[Collect Sentiment] Verify retention');
    
    if (violatingPoints.length > 0) {
      console.warn(`[Collect Sentiment] Found ${violatingPoints.length} data points older than ${retentionDays} days (should have been cleaned up)`);
    } else {
      console.log(`[Collect Sentiment] Data retention validation passed: all ${history.dataPoints.length} points within ${retentionDays}-day window`);
    }

    const duration = Date.now() - startTime;
    console.timeEnd('[Collect Sentiment] Total duration');
    console.log(`[Collect Sentiment] Collection complete in ${duration}ms`);
    console.log(`[Collect Sentiment] Source diversity: ${sourceDiversity.activeSources} active, ${sourceDiversity.failedSources} failed`);

    return new Response(JSON.stringify({
      success: true,
      dataPoint: {
        timestamp: dataPoint.timestamp,
        mood: dataPoint.moodClassification,
        articlesAnalyzed: dataPoint.articlesAnalyzed,
        sourceDiversity: dataPoint.sourceDiversity,
      },
      durationMs: duration,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Collect Sentiment] Error during collection:', error);

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
