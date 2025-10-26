/**
 * Generate test sentiment data for local development
 * Creates hourly data points for the past N hours
 * 
 * Usage (run with netlify dev for Blobs access):
 * - netlify dev --command "npx tsx scripts/generate-test-data.ts 6"
 * 
 * Or run the API endpoint:
 * - Start: netlify dev
 * - Visit: http://localhost:8888/.netlify/functions/generate-test-data?hours=6
 */

import { getStore } from '@netlify/blobs';
import type { SentimentDataPoint, MoodType, SentimentHistory, DataSource } from '../app/types/sentiment';

const HOURS = parseInt(process.argv[2] || '168', 10); // Default: 7 days (168 hours)
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

console.log(`Generating ${HOURS} hours of test data...`);

/**
 * Generate realistic sentiment data with some variation
 */
function generateDataPoint(hoursAgo: number): SentimentDataPoint {
  const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  
  // Create realistic variation over time
  // Morning hours (6-12): More positive
  // Afternoon (12-18): Mixed
  // Evening (18-24): More negative
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
  
  return {
    timestamp: timestamp.toISOString(),
    collectionDurationMs: 100 + Math.random() * 200,
    moodClassification: mood,
    breakdown,
    summary,
    articlesAnalyzed: 15 + Math.floor(Math.random() * 10),
    source: 'test-data',
    confidence: 0.7 + Math.random() * 0.3,
  };
}

/**
 * Save data points to Netlify Blobs
 */
async function saveDataPoints() {
  try {
    const store = getStore({
      name: STORE_NAME,
      consistency: 'strong',
    });
    
    // Generate data points from oldest to newest
    const dataPoints: SentimentDataPoint[] = [];
    for (let i = HOURS - 1; i >= 0; i--) {
      dataPoints.push(generateDataPoint(i));
    }
    
    console.log(`Generated ${dataPoints.length} data points`);
    console.log(`Time range: ${dataPoints[0].timestamp} to ${dataPoints[dataPoints.length - 1].timestamp}`);
    
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
    
    console.log('✅ Test data saved successfully!');
    console.log('\nData point distribution:');
    const moodCounts = dataPoints.reduce((acc, dp) => {
      acc[dp.moodClassification] = (acc[dp.moodClassification] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);
    
    console.log(`  Positive: ${moodCounts.positive || 0}`);
    console.log(`  Negative: ${moodCounts.negative || 0}`);
    console.log(`  Mixed: ${moodCounts.mixed || 0}`);
    console.log(`  Neutral: ${moodCounts.neutral || 0}`);
    
    // Show significant changes (>20% swing)
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
    
    if (changes.length > 0) {
      console.log('\nSignificant changes (>20% swing):');
      changes.forEach(c => {
        console.log(`  ${c.time}: ${c.swing > 0 ? '+' : ''}${c.swing}`);
      });
    }
    
    console.log('\n🚀 Now visit http://localhost:8888 to see the trend chart!');
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run the script
saveDataPoints();
