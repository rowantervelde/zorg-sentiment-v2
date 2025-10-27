/**
 * Netlify Function to generate test sentiment data
 * 
 * GET /.netlify/functions/generate-test-data?hours=6
 * 
 * Query Parameters:
 * - hours: Number of hours of data to generate (default: 6)
 */

import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import type { SentimentDataPoint, MoodType, SentimentHistory, DataSource, SourceContribution, SourceDiversity } from '../../app/types/sentiment';
import type { SourceConfiguration } from '../../server/types/sourceConfiguration';
import sourcesConfig from '../../server/config/sources.json';

const STORE_NAME = 'sentiment-data';
const HISTORY_KEY = 'sentiment-history';
const RETENTION_DAYS = 7;

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
 * Generate source contributions for a data point
 * Uses actual sources from sources.json configuration
 */
function generateSourceContributions(timestamp: Date): SourceContribution[] {
  const contributions: SourceContribution[] = [];
  const sources = sourcesConfig.sources as SourceConfiguration[];
  const activeSources = sources.filter(s => s.isActive);
  
  const totalArticles = 60 + Math.floor(Math.random() * 20); // 60-80 articles total
  let remainingArticles = totalArticles;
  
  // Randomly fail 0-2 sources per collection
  const failedCount = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : 2) : 0;
  const failedIndices = new Set<number>();
  while (failedIndices.size < failedCount) {
    failedIndices.add(Math.floor(Math.random() * activeSources.length));
  }
  
  activeSources.forEach((source, index) => {
    const isFailed = failedIndices.has(index);
    const isLastSource = index === activeSources.length - 1;
    
    if (isFailed) {
      contributions.push({
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        articlesCollected: 0,
        sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
        fetchedAt: timestamp.toISOString(),
        fetchDurationMs: 0,
        status: 'failed',
        error: 'Failed to fetch RSS feed: 404 Not Found',
      });
    } else {
      // Distribute articles across successful sources (some variation)
      const articleCount = isLastSource 
        ? remainingArticles 
        : Math.floor(Math.random() * 20) + 5; // 5-25 articles per source
      
      remainingArticles -= articleCount;
      
      // Generate varied sentiment per source
      const positive = Math.floor(Math.random() * 60) + 20; // 20-80%
      const negative = Math.floor(Math.random() * (80 - positive));
      const neutral = 100 - positive - negative;
      
      contributions.push({
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        articlesCollected: articleCount,
        sentimentBreakdown: {
          positive: Math.round(positive),
          neutral: Math.round(neutral),
          negative: Math.round(negative),
        },
        fetchedAt: timestamp.toISOString(),
        fetchDurationMs: 2000 + Math.floor(Math.random() * 5000), // 2-7 seconds
        status: 'success',
      });
    }
  });
  
  return contributions;
}

/**
 * Calculate source diversity from contributions
 */
function calculateSourceDiversity(contributions: SourceContribution[]): SourceDiversity {
  const activeSources = contributions.filter(c => c.status === 'success').length;
  const failedSources = contributions.filter(c => c.status === 'failed').length;
  
  return {
    totalSources: contributions.length,
    activeSources,
    failedSources,
  };
}

/**
 * Generate realistic sentiment data with some variation
 */
function generateDataPoint(hoursAgo: number): SentimentDataPoint {
  const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  
  // Create realistic variation over time
  const hour = timestamp.getHours();
  let basePositive = 40;
  let baseNegative = 30;
  
  if (hour >= 6 && hour < 12) {
    basePositive = 55 + Math.random() * 10;
    baseNegative = 15 + Math.random() * 10;
  } else if (hour >= 12 && hour < 18) {
    basePositive = 40 + Math.random() * 15;
    baseNegative = 25 + Math.random() * 15;
  } else if (hour >= 18 && hour < 24) {
    basePositive = 30 + Math.random() * 15;
    baseNegative = 40 + Math.random() * 15;
  }
  
  // Add some random variation
  const positive = Math.round(basePositive + (Math.random() - 0.5) * 20);
  const negative = Math.round(baseNegative + (Math.random() - 0.5) * 20);
  const neutral = 100 - positive - negative;
  
  // Ensure valid percentages
  const breakdown = {
    positive: Math.max(0, Math.min(100, positive)),
    negative: Math.max(0, Math.min(100, negative)),
    neutral: Math.max(0, Math.min(100, neutral)),
  };
  
  // Normalize to sum to 100
  const sum = breakdown.positive + breakdown.negative + breakdown.neutral;
  breakdown.positive = Math.round((breakdown.positive / sum) * 100);
  breakdown.negative = Math.round((breakdown.negative / sum) * 100);
  breakdown.neutral = 100 - breakdown.positive - breakdown.negative;
  
  // Determine mood classification
  let mood: MoodType = 'neutral';
  if (breakdown.positive >= 60) mood = 'positive';
  else if (breakdown.negative >= 60) mood = 'negative';
  else if (Math.abs(breakdown.positive - breakdown.negative) < 10) mood = 'mixed';
  
  // Generate Dutch summary
  const summaries: Record<MoodType, string[]> = {
    positive: [
      'Nederland voelt zich optimistisch over zorgverzekeringen',
      'De stemming over zorg is positief',
      'Er heerst een hoopvol gevoel over gezondheidszorg',
    ],
    negative: [
      'Er is onvrede over zorgverzekeringen',
      'De stemming over zorg is negatief',
      'Zorgen over gezondheidszorg domineren',
    ],
    mixed: [
      'De meningen over zorg zijn verdeeld',
      'Een gemengd gevoel over zorgverzekeringen',
      'De stemming over zorg is wisselend',
    ],
    neutral: [
      'Rustig nieuws over gezondheidszorg',
      'Kalme reacties op zorgverzekeringen',
      'De stemming over zorg is neutraal',
    ],
  };
  
  const summary = summaries[mood][Math.floor(Math.random() * summaries[mood].length)];
  
  // Generate multi-source data
  const sourceContributions = generateSourceContributions(timestamp);
  const sourceDiversity = calculateSourceDiversity(sourceContributions);
  
  // Calculate total articles from all successful sources
  const totalArticles = sourceContributions
    .filter(c => c.status === 'success')
    .reduce((sum, c) => sum + c.articlesCollected, 0);
  
  return {
    timestamp: timestamp.toISOString(),
    collectionDurationMs: 100 + Math.random() * 200,
    moodClassification: mood,
    breakdown,
    summary,
    articlesAnalyzed: totalArticles,
    source: 'multi-source', // Legacy field for backward compatibility
    confidence: 0.7 + Math.random() * 0.3,
    sourceContributions,
    sourceDiversity,
  };
}

export default async (req: Request, context: Context) => {
  // Only allow in development
  if (context.deploy?.context !== 'dev' && process.env.CONTEXT !== 'dev') {
    return new Response('This function is only available in development', {
      status: 403,
    });
  }

  try {
    const url = new URL(req.url);
    const hours = parseInt(url.searchParams.get('hours') || '6', 10);
    
    console.log(`[Generate Test Data] Creating ${hours} hours of test data...`);
    
    // Get store
    const store = getStore({
      name: STORE_NAME,
      consistency: 'strong',
    });
    
    // Generate data points from oldest to newest
    const dataPoints: SentimentDataPoint[] = [];
    for (let i = hours - 1; i >= 0; i--) {
      dataPoints.push(generateDataPoint(i));
    }
    
    console.log(`[Generate Test Data] Generated ${dataPoints.length} data points`);
    console.log(`[Generate Test Data] Time range: ${dataPoints[0].timestamp} to ${dataPoints[dataPoints.length - 1].timestamp}`);
    
    // Create SentimentHistory object
    const history: SentimentHistory = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      dataPoints: dataPoints.reverse(), // Store newest first
      retentionDays: RETENTION_DAYS,
      sources: [MVP_DATA_SOURCE],
    };
    
    // Save to Netlify Blobs
    await store.setJSON(HISTORY_KEY, history);
    
    console.log('[Generate Test Data] ✅ Test data saved successfully!');
    
    // Calculate statistics
    const moodCounts = dataPoints.reduce((acc, dp) => {
      acc[dp.moodClassification] = (acc[dp.moodClassification] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);
    
    // Find significant changes
    const changes: Array<{ time: string; swing: number }> = [];
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      const swing = (curr.breakdown.positive - curr.breakdown.negative) - 
                   (prev.breakdown.positive - prev.breakdown.negative);
      if (Math.abs(swing) >= 20) {
        changes.push({
          time: new Date(curr.timestamp).toLocaleString('nl-NL'),
          swing: Math.round(swing),
        });
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${hours} hours of test data successfully!`,
      stats: {
        totalDataPoints: dataPoints.length,
        timeRange: {
          from: dataPoints[0].timestamp,
          to: dataPoints[dataPoints.length - 1].timestamp,
        },
        moodDistribution: {
          positive: moodCounts.positive || 0,
          negative: moodCounts.negative || 0,
          mixed: moodCounts.mixed || 0,
          neutral: moodCounts.neutral || 0,
        },
        significantChanges: changes.length,
      },
      nextSteps: [
        'Visit http://localhost:8888 to see your dashboard',
        'The trend chart should now display your test data',
        `Consider setting NUXT_TREND_WINDOW_HOURS=${hours} in .env for best visualization`,
      ],
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('[Generate Test Data] ❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: '/api/generate-test-data',
};
