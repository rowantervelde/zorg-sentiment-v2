/**
 * Simple Reddit API Test
 * 
 * This script tests the Reddit integration by:
 * 1. Starting the Nuxt dev server
 * 2. Calling the /api/sentiment endpoint
 * 3. Verifying Reddit sources are included
 * 
 * Prerequisites:
 * - .env file with REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT
 * - server/config/sources.json configured with Reddit sources
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/sentiment';
const SOURCES_URL = 'http://localhost:3000/api/sentiment/sources';

async function testRedditAPI() {
  console.log('🧪 Testing Reddit API Integration\n');
  
  try {
    // Test 1: Check sentiment endpoint
    console.log('1️⃣  Testing /api/sentiment endpoint...');
    const sentimentResponse = await fetch(API_URL);
    
    if (!sentimentResponse.ok) {
      throw new Error(`Sentiment API returned ${sentimentResponse.status}: ${sentimentResponse.statusText}`);
    }
    
    const sentimentData = await sentimentResponse.json();
    console.log('✅ Sentiment endpoint responded');
    console.log(`   Score: ${sentimentData.score}`);
    console.log(`   Mood: ${sentimentData.mood}`);
    console.log(`   Total articles: ${sentimentData.articleCount}`);
    
    // Test 2: Check sources endpoint
    console.log('\n2️⃣  Testing /api/sentiment/sources endpoint...');
    const sourcesResponse = await fetch(SOURCES_URL);
    
    if (!sourcesResponse.ok) {
      throw new Error(`Sources API returned ${sourcesResponse.status}: ${sourcesResponse.statusText}`);
    }
    
    const sourcesData = await sourcesResponse.json();
    console.log('✅ Sources endpoint responded');
    
    // Find Reddit sources
    const redditSources = sourcesData.sources.filter(s => s.type === 'SOCIAL_REDDIT');
    
    if (redditSources.length === 0) {
      console.log('⚠️  No Reddit sources found in response');
      console.log('   This might mean:');
      console.log('   - Reddit API credentials are invalid');
      console.log('   - No Reddit posts matched the filters');
      console.log('   - Reddit sources are disabled in sources.json');
    } else {
      console.log(`\n📊 Found ${redditSources.length} Reddit source(s):`);
      redditSources.forEach(source => {
        console.log(`\n   Source: ${source.name}`);
        console.log(`   Articles: ${source.articleCount}`);
        console.log(`   Avg Score: ${source.averageScore?.toFixed(2) || 'N/A'}`);
        
        if (source.engagementStats) {
          console.log(`   Engagement:`);
          console.log(`   - Total upvotes: ${source.engagementStats.totalUpvotes}`);
          console.log(`   - Total comments: ${source.engagementStats.totalComments}`);
          console.log(`   - Avg upvotes: ${source.engagementStats.avgUpvotes?.toFixed(1)}`);
          console.log(`   - Avg comments: ${source.engagementStats.avgComments?.toFixed(1)}`);
        }
      });
    }
    
    console.log('\n✅ All tests completed successfully!\n');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Could not connect to the server');
      console.error('   Make sure the Nuxt dev server is running:');
      console.error('   Run: npm run dev\n');
    } else {
      console.error('\n❌ Test failed:', error.message);
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the test
testRedditAPI();
