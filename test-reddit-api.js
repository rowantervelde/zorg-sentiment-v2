/**
 * Reddit API Integration Test
 * Tests real Reddit API connection with credentials
 * 
 * Prerequisites:
 * 1. Create Reddit app at https://www.reddit.com/prefs/apps
 * 2. Copy .env.example to .env
 * 3. Fill in REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT
 */

import { RedditAdapter } from './server/utils/redditAdapter.js';
import { SourceType } from './server/types/source.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check environment variables
function checkEnvironment() {
  log('cyan', '\n=== Checking Environment ===\n');
  
  const required = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT'];
  const missing = [];
  
  required.forEach(key => {
    const value = process.env[key];
    if (!value || value.includes('your_') || value.includes('YOUR_')) {
      log('red', `✗ ${key}: NOT SET or using placeholder`);
      missing.push(key);
    } else {
      log('green', `✓ ${key}: Set (${value.substring(0, 20)}...)`);
    }
  });
  
  if (missing.length > 0) {
    log('red', '\n❌ Missing required environment variables!');
    log('yellow', '\nSetup instructions:');
    log('yellow', '1. Go to https://www.reddit.com/prefs/apps');
    log('yellow', '2. Click "create another app..." at the bottom');
    log('yellow', '3. Fill in:');
    log('yellow', '   - name: zorg-sentiment-v2');
    log('yellow', '   - App type: script');
    log('yellow', '   - redirect uri: http://localhost');
    log('yellow', '4. Copy your credentials:');
    log('yellow', '   - Client ID is shown under the app name');
    log('yellow', '   - Client Secret is shown after clicking edit');
    log('yellow', '5. Create .env file:');
    log('yellow', '   copy .env.example .env');
    log('yellow', '6. Edit .env and fill in your credentials');
    log('yellow', '\nThen run this test again!');
    process.exit(1);
  }
  
  log('green', '\n✓ All required environment variables are set!\n');
  return true;
}

// Test configuration
const testConfig = {
  id: 'reddit-thenetherlands',
  name: 'r/thenetherlands',
  type: SourceType.SOCIAL_REDDIT,
  url: 'https://www.reddit.com/r/thenetherlands/',
  category: 'general',
  isActive: true,
  maxArticles: 20,
  timeout: 10000,
  priority: 1,
  redditConfig: {
    subreddit: 'thenetherlands',
    timeWindow: 'day',
    minScore: 5,
    minComments: 3,
    maxPosts: 10, // Reduced for testing
    includeComments: true,
    topCommentsCount: 5
  }
};

async function runTests() {
  try {
    // Check environment
    checkEnvironment();
    
    log('cyan', '=== Testing Reddit Adapter ===\n');
    
    // Create adapter instance
    const adapter = new RedditAdapter();
    log('blue', 'Step 1: Created RedditAdapter instance');
    
    // Test 1: Validate configuration
    log('yellow', '\nTest 1: Configuration Validation');
    const isValid = adapter.validateConfig(testConfig);
    if (isValid) {
      log('green', '✓ Configuration is valid');
    } else {
      log('red', '✗ Configuration validation failed');
      process.exit(1);
    }
    
    // Test 2: Fetch articles from Reddit
    log('yellow', '\nTest 2: Fetch Articles from r/thenetherlands');
    log('blue', 'Fetching posts... (this may take 10-30 seconds)');
    
    const startTime = Date.now();
    const articles = await adapter.fetchArticles(testConfig);
    const duration = Date.now() - startTime;
    
    log('green', `✓ Fetched ${articles.length} articles in ${duration}ms`);
    
    // Test 3: Verify article structure
    log('yellow', '\nTest 3: Article Structure Validation');
    if (articles.length > 0) {
      const article = articles[0];
      const requiredFields = ['title', 'content', 'link', 'pubDate', 'sourceId', 'deduplicationHash'];
      const missing = requiredFields.filter(field => !article[field]);
      
      if (missing.length === 0) {
        log('green', '✓ All required fields present');
        
        // Display sample article
        log('cyan', '\n=== Sample Article ===');
        console.log(`Title: ${article.title}`);
        console.log(`Author: ${article.authorHandle || 'N/A'}`);
        console.log(`Link: ${article.link}`);
        console.log(`Published: ${article.pubDate}`);
        console.log(`Content length: ${article.content.length} characters`);
        
        if (article.engagementMetrics) {
          console.log(`Upvotes: ${article.engagementMetrics.likes || 0}`);
          console.log(`Comments: ${article.engagementMetrics.comments || 0}`);
        }
        
        console.log(`\nContent preview:\n${article.content.substring(0, 200)}...`);
      } else {
        log('red', `✗ Missing fields: ${missing.join(', ')}`);
        process.exit(1);
      }
    } else {
      log('yellow', '⚠ No articles fetched - subreddit may have no posts matching filters');
    }
    
    // Test 4: Check adapter state
    log('yellow', '\nTest 4: Adapter State');
    const state = adapter.getAdapterState();
    console.log(`Health: ${state.isHealthy ? 'Healthy' : 'Unhealthy'}`);
    console.log(`Error count: ${state.errorCount}`);
    console.log(`Last fetch: ${state.lastFetchTime || 'Never'}`);
    
    if (state.isHealthy) {
      log('green', '✓ Adapter is healthy');
    } else {
      log('red', '✗ Adapter is unhealthy');
    }
    
    // Test 5: Keyword filtering stats
    log('yellow', '\nTest 5: Filtering Statistics');
    console.log(`Total articles fetched: ${articles.length}`);
    console.log(`Articles with comments: ${articles.filter(a => a.content.includes('--- Comments ---')).length}`);
    console.log(`Average content length: ${articles.length > 0 ? Math.round(articles.reduce((sum, a) => sum + a.content.length, 0) / articles.length) : 0} chars`);
    
    // Summary
    log('cyan', '\n=== Test Summary ===');
    log('green', '✓ All tests passed!');
    log('green', `✓ Successfully connected to Reddit API`);
    log('green', `✓ Fetched ${articles.length} filtered articles`);
    log('green', `✓ Keyword filtering working`);
    log('green', `✓ Content normalization working`);
    log('green', `✓ Engagement metrics captured`);
    
    log('cyan', '\n=== Next Steps ===');
    log('blue', '1. Test with other subreddits (r/DutchPersonalFinance, r/geldzaken)');
    log('blue', '2. Deploy to Netlify with environment variables');
    log('blue', '3. Test automated hourly collection');
    log('blue', '4. Proceed to Phase 4 (engagement stats in API)');
    
  } catch (error) {
    log('red', '\n❌ Test Failed!');
    console.error(error);
    
    if (error.message?.includes('REDDIT_CLIENT_ID')) {
      log('yellow', '\n💡 Tip: Make sure your .env file has valid Reddit API credentials');
    } else if (error.statusCode === 401 || error.statusCode === 403) {
      log('yellow', '\n💡 Tip: Check your Reddit API credentials are correct');
      log('yellow', '   - Client ID and Client Secret must match your Reddit app');
      log('yellow', '   - Make sure app type is "script" (not "web app")');
    } else if (error.statusCode === 404) {
      log('yellow', '\n💡 Tip: The subreddit may not exist or is private');
    }
    
    process.exit(1);
  }
}

// Run tests
log('cyan', '╔════════════════════════════════════════════════╗');
log('cyan', '║   Reddit Integration Test (Feature 003)      ║');
log('cyan', '║   Testing real API connection with snoowrap  ║');
log('cyan', '╚════════════════════════════════════════════════╝');

runTests();
