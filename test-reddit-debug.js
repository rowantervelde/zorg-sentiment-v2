/**
 * Reddit Integration Debug Script
 * 
 * This helps diagnose why Reddit sources aren't showing up
 */

import fetch from 'node-fetch';

const SOURCES_URL = 'http://localhost:3000/api/sentiment/sources';

async function debugReddit() {
  console.log('🔍 Reddit Integration Diagnostic\n');
  
  try {
    console.log('Fetching sources from API...');
    const response = await fetch(SOURCES_URL);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('\n📋 All Sources:');
    data.sources.forEach((source, index) => {
      console.log(`\n${index + 1}. ${source.sourceName || 'Unknown'}`);
      console.log(`   ID: ${source.sourceId || 'N/A'}`);
      console.log(`   Type: ${source.sourceType || 'N/A'}`);
      console.log(`   Active: ${source.isActive !== false ? 'Yes' : 'No'}`);
      console.log(`   Articles: ${source.articlesCollected || 0}`);
      console.log(`   Status: ${source.status || 'N/A'}`);
      
      if (source.error) {
        console.log(`   ⚠️  Error: ${source.error}`);
      }
    });
    
    const redditSources = data.sources.filter(s => s.sourceType === 'SOCIAL_REDDIT');
    const rssSources = data.sources.filter(s => s.sourceType === 'RSS');
    
    console.log('\n\n📊 Summary:');
    console.log(`   Total sources: ${data.sources.length}`);
    console.log(`   RSS sources: ${rssSources.length}`);
    console.log(`   Reddit sources: ${redditSources.length}`);
    
    if (redditSources.length === 0) {
      console.log('\n⚠️  NO REDDIT SOURCES FOUND!');
      console.log('\nPossible causes:');
      console.log('1. Reddit API credentials missing or invalid');
      console.log('2. RedditAdapter failed during initialization');
      console.log('3. sourceOrchestrator not loading Reddit sources');
      console.log('\n👉 Check your dev server console for error messages');
      console.log('👉 Look for lines containing "Reddit" or "snoowrap"');
      console.log('👉 Verify .env has REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT');
    } else {
      console.log('\n✅ Reddit sources are loaded!');
      
      const articlesFound = redditSources.reduce((sum, s) => sum + (s.articlesCollected || 0), 0);
      
      if (articlesFound === 0) {
        console.log('\n⚠️  But no articles were fetched from Reddit');
        console.log('\nThis could mean:');
        console.log('1. No posts matched the keyword filters (Dutch healthcare terms)');
        console.log('2. No posts met quality thresholds (minScore: 5, minComments: 3)');
        console.log('3. API rate limit reached');
        console.log('4. Subreddits had no recent posts');
        console.log('\n👉 Try lowering minScore and minComments in sources.json');
        console.log('👉 Check dev server logs for "RedditAdapter" messages');
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Could not connect to server');
      console.error('   Make sure: npm run dev is running\n');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

debugReddit();
