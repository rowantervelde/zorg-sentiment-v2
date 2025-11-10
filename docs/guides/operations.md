# Operations Guide - Multi-Source Sentiment Collection

**Last Updated**: October 27, 2025  
**Feature**: 002-multi-source-sentiment

## Overview

This guide covers operational procedures for monitoring and maintaining the multi-source sentiment collection system, including source health monitoring, troubleshooting, and performance tracking.

## Source Reliability Monitoring

### Key Metrics to Track

#### 1. Source Success Rate (7-Day)

**Definition**: Percentage of successful fetches from each source over the last 7 days.

**How to Check**:

```bash
# Via API
curl https://your-site.netlify.app/api/sentiment/sources

# Check the metrics.successRate field for each source
```

**Healthy Thresholds**:

- ✅ **>90%**: Excellent reliability
- ⚠️ **70-90%**: Acceptable, monitor closely
- 🚨 **<70%**: Action required

**Common Issues**:

- RSS feed URL changed/moved (check source website)
- Feed temporarily down (wait for recovery)
- Network timeouts (check Netlify function logs)
- Invalid XML/feed format (contact source maintainer)

#### 2. Articles Per Source

**Definition**: Average number of articles contributed by each source per collection cycle.

**How to Check**:

```bash
# Via API - check articlesCollected field
curl https://your-site.netlify.app/api/sentiment/sources | jq '.sources[] | {name: .sourceName, articles: .articlesCollected}'
```

**Expected Ranges**:

- General news sources: 10-30 articles
- Healthcare-specific: 5-20 articles
- Social media (future): 20-50 posts

**Anomalies**:

- **0 articles**: Source failed or no new content
- **<5 articles**: Feed may be inactive or rate-limited
- **>50 articles**: May indicate pagination issue or RSS bomb

#### 3. Fetch Duration

**Definition**: Time taken to fetch and parse articles from each source.

**How to Check**:

```bash
# Check Netlify function logs for timing
netlify functions:log collect-sentiment

# Look for: "[RSSAdapter] {source}: {count} articles fetched in {duration}ms"
```

**Healthy Thresholds**:

- ✅ **<3 seconds**: Normal
- ⚠️ **3-8 seconds**: Slow but acceptable
- 🚨 **>8 seconds**: Performance issue (may timeout at 10s)

**Action Items**:

- > 5s consistently: Check source server response time
- Approaching 10s: Risk of timeout, investigate source health
- Frequent timeouts: Consider disabling source or increasing timeout

#### 4. Source Diversity

**Definition**: Distribution of articles across sources (avoid single-source dominance).

**How to Check**:

```bash
# Via API - check sourceDiversity field
curl https://your-site.netlify.app/api/sentiment?include=all | jq '.current.sourceDiversity'
```

**Healthy Metrics**:

- ✅ **No single source >60%** of total articles
- ✅ **At least 3 active sources** per cycle
- ⚠️ **Single source >70%**: Over-reliance on one source
- 🚨 **<3 active sources**: Insufficient diversity

**Action Items**:

- Add more sources if diversity <60%
- Check if dominant source is flooding with duplicate content
- Adjust maxArticles per source if needed

## Daily Health Checks

### Morning Check (Recommended)

**5-Minute Checklist**:

1. **Check System Health**:

   ```bash
   curl https://your-site.netlify.app/api/health
   # Status should be "healthy"
   ```

2. **Verify Latest Data**:

   ```bash
   curl https://your-site.netlify.app/api/sentiment | jq '.current.timestamp'
   # Should be within last 2 hours
   ```

3. **Check Source Status**:

   ```bash
   curl https://your-site.netlify.app/api/sentiment/sources | jq '.sources[] | select(.status != "operational")'
   # Should return empty or few failures
   ```

4. **Review Function Logs** (if issues detected):
   ```bash
   netlify functions:log collect-sentiment --lines 50
   ```

### Weekly Review (Recommended)

**15-Minute Checklist**:

1. **Analyze Source Reliability Trends**:

   - Review 7-day success rates for all sources
   - Identify sources with declining reliability
   - Check if any sources consistently fail

2. **Review Collection Performance**:

   - Average collection duration (target: <2 minutes)
   - Deduplication rate (expected: 10-30%)
   - Articles per source distribution

3. **Check Data Completeness**:

   ```bash
   curl https://your-site.netlify.app/api/sentiment/history?limit=168 | jq '.trend.dataCompleteness'
   # Should be >90%
   ```

4. **Review Error Logs**:
   - Check for recurring errors
   - Identify patterns (time of day, specific sources)

## Troubleshooting Common Issues

### Issue: Source Returns 0 Articles

**Symptoms**:

- `articlesCollected: 0` in API response
- Status may be "success" or "partial"

**Diagnosis Steps**:

1. **Check if feed has new content**:

   ```bash
   curl "https://www.nu.nl/rss/Gezondheid" | head -50
   # Verify RSS has recent items
   ```

2. **Check function logs**:

   ```bash
   netlify functions:log collect-sentiment | grep "0 articles"
   ```

3. **Test feed manually**:
   - Visit feed URL in browser
   - Verify XML is valid
   - Check pubDate of items (may be too old)

**Common Causes**:

- Feed has no new items since last collection
- Feed URL changed (returns 404)
- Feed format changed (parser fails)
- Articles filtered out (don't meet criteria)

**Resolution**:

- Wait for new content if feed is just inactive
- Update feed URL in `sources.json` if moved
- Adjust article filtering logic if too aggressive
- Disable source if permanently inactive

### Issue: Source Consistently Times Out

**Symptoms**:

- Status: "failed"
- Error: "Timeout after 10000ms"
- Happens on >30% of collection cycles

**Diagnosis Steps**:

1. **Check source response time**:

   ```bash
   time curl -I "https://www.nu.nl/rss/Gezondheid"
   # Should be <5 seconds
   ```

2. **Test from Netlify region**:

   ```bash
   netlify functions:invoke collect-sentiment
   # Check if timeout reproduces locally
   ```

3. **Review source server status**:
   - Check if source website is slow/down
   - Look for maintenance windows
   - Check social media for announcements

**Resolution Options**:

1. **Increase timeout** (if source is reliable but slow):

   ```json
   // sources.json
   {
     "timeout": 15000 // Increase from 10s to 15s
   }
   ```

2. **Reduce maxArticles** (fetch less data):

   ```json
   {
     "maxArticles": 15 // Reduce from 30 to 15
   }
   ```

3. **Temporarily disable source**:

   ```json
   {
     "isActive": false
   }
   ```

4. **Find alternative feed** for same source

### Issue: High Deduplication Rate (>50%)

**Symptoms**:

- Many articles marked as duplicates
- Final article count much lower than fetched
- Log shows: "78 → 32 articles" (59% deduplication)

**Diagnosis Steps**:

1. **Check which sources overlap**:

   - Review article titles in function logs
   - Identify if 2+ sources cover same stories

2. **Analyze deduplication threshold**:

   ```bash
   # Check deduplicator.ts SIMILARITY_THRESHOLD
   # Default: 0.8 (80% similarity)
   ```

3. **Review source categories**:
   ```bash
   cat server/config/sources.json | jq '.sources[] | {name, category}'
   ```

**Common Causes**:

- Multiple general news sources (NU.nl, NOS, RTL)
- Same breaking news story across all sources
- Sources syndicating content from same wire service

**Resolution**:

- **Expected behavior**: 20-40% deduplication is normal for general news
- **If >60%**: Consider removing one general news source
- **If >80%**: Sources may be too similar (redundant)

**Note**: High deduplication is NOT a bug - it's a feature ensuring cross-source diversity!

### Issue: Collection Takes >5 Minutes

**Symptoms**:

- `totalDurationMs` in logs >300000 (5 minutes)
- May cause function timeout (10 min Netlify limit)
- Delays sentiment updates

**Diagnosis Steps**:

1. **Identify slow sources**:

   ```bash
   netlify functions:log collect-sentiment | grep "fetched in"
   # Look for sources with >8000ms duration
   ```

2. **Check deduplication time**:

   ```bash
   netlify functions:log collect-sentiment | grep "Deduplication:"
   # Should be <30s for 100 articles
   ```

3. **Check total article count**:
   - If >150 articles, deduplication may be slow
   - If >200 articles, consider reducing maxArticles

**Resolution**:

1. **Reduce maxArticles per source** (most effective):

   ```json
   {
     "maxArticles": 20 // Reduce from 30
   }
   ```

2. **Disable slowest sources** temporarily

3. **Optimize deduplication** (dev task):

   - Already optimized with 3-stage algorithm
   - Further optimization may require sampling

4. **Split collection across multiple functions** (future enhancement)

## Monitoring Dashboards

### Netlify Functions Dashboard

**Location**: Netlify UI → Functions → collect-sentiment

**Key Metrics**:

- **Invocations**: Should be ~24/day (hourly)
- **Success Rate**: Target >95%
- **Duration**: Target <2 minutes (120s)
- **Errors**: Should be <2/day

### API Endpoints for Monitoring

#### Real-Time Status

```bash
GET /api/health
# Returns: system status, source health, data age
```

#### Source Metrics

```bash
GET /api/sentiment/sources
# Returns: per-source reliability, article counts, errors
```

#### Historical Trends

```bash
GET /api/sentiment/history?limit=168
# Returns: 7 days of data points, completeness metrics
```

### Setting Up Alerts (Recommended)

**Option 1: Netlify Monitor (Built-in)**

- Enable notifications for function failures
- Set up status checks for API endpoints

**Option 2: External Monitoring (Uptime Robot, Pingdom)**

```bash
# Monitor endpoints
https://your-site.netlify.app/api/health
https://your-site.netlify.app/api/sentiment

# Alert conditions:
- Response time >3 seconds
- Status code != 200
- Response contains "unhealthy"
```

**Option 3: Custom Slack/Discord Webhook**

```javascript
// Add to collect-sentiment.mts on failures
if (failureCount > 3) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      text: `⚠️ Sentiment collection: ${failureCount} sources failed`,
    }),
  });
}
```

## Maintenance Tasks

### Adding a New RSS Source

**Procedure**:

1. **Find RSS feed URL**:

   - Check source website for RSS icon
   - Look in page source for `<link rel="alternate" type="application/rss+xml">`
   - Use browser extensions (RSS Feed Reader)

2. **Test feed manually**:

   ```bash
   curl "https://example.com/rss" | head -100
   # Verify valid XML and recent items
   ```

3. **Add to sources.json**:

   ```json
   {
     "id": "example-health",
     "name": "Example Health News",
     "type": "RSS",
     "url": "https://example.com/rss",
     "category": "healthcare-specific",
     "isActive": true,
     "maxArticles": 30,
     "timeout": 10000
   }
   ```

4. **Deploy and test**:

   ```bash
   git add server/config/sources.json
   git commit -m "Add Example Health News RSS feed"
   git push

   # Wait for deployment, then trigger collection
   netlify functions:invoke collect-sentiment
   ```

5. **Monitor first 24 hours**:
   - Check source appears in `/api/sentiment/sources`
   - Verify articles being collected
   - Check for errors in function logs

### Removing a Source

**Procedure**:

1. **Disable first** (don't delete immediately):

   ```json
   {
     "isActive": false,
     "comment": "Disabled 2025-10-27: RSS feed no longer maintained"
   }
   ```

2. **Monitor for 7 days**:

   - Verify system works without source
   - Check source diversity remains healthy
   - Ensure no dependencies

3. **Remove from sources.json** after verification:
   ```bash
   git add server/config/sources.json
   git commit -m "Remove Example source (inactive feed)"
   git push
   ```

### Updating Source Configuration

**Procedure**:

1. **Update sources.json**:

   ```json
   {
     "url": "https://new-url.com/feed.xml", // Updated
     "maxArticles": 20, // Reduced from 30
     "comment": "Updated URL 2025-10-27: Site migration"
   }
   ```

2. **Test locally** (if possible):

   ```bash
   netlify dev
   # Then invoke function locally
   ```

3. **Deploy and verify**:

   ```bash
   git add server/config/sources.json
   git commit -m "Update Example source URL"
   git push

   # Check first collection after deploy
   netlify functions:log collect-sentiment --lines 30
   ```

## Performance Optimization

### Current Performance Targets

- **Collection Duration**: <2 minutes (average)
- **Source Success Rate**: >90% (7-day)
- **Data Completeness**: >95% (168 hours/week)
- **Deduplication Time**: <30 seconds (for 100 articles)

### Optimization Strategies

#### 1. Reduce Article Volume

**When**: Collection time >3 minutes consistently

**Action**:

```json
// sources.json - reduce maxArticles
{
  "maxArticles": 20 // From 30
}
```

**Impact**: -33% articles = -40% processing time

#### 2. Adjust Fetch Timeout

**When**: Sources timing out but returning data

**Action**:

```json
{
  "timeout": 15000 // From 10000
}
```

**Impact**: +5s max per source, but reduces failures

#### 3. Disable Low-Value Sources

**When**: Source contributes <5 articles or high duplicate rate

**Action**:

```json
{
  "isActive": false
}
```

**Impact**: Reduces fetch time, may reduce diversity

## Data Retention and Cleanup

### Automatic Cleanup

**Netlify Blobs**: 7-day TTL (automatic)

- Sentiment data older than 7 days automatically deleted
- No manual cleanup required
- Configured in `server/utils/storage.ts`

### Manual Data Inspection

**View blob contents**:

```bash
# Requires Netlify CLI access
netlify blobs:list

# Get specific blob
netlify blobs:get sentiment:history
```

## Emergency Procedures

### All Sources Failing

**Symptoms**: Every source shows status: "failed"

**Immediate Actions**:

1. **Check Netlify status**: https://www.netlifystatus.com
2. **Check network connectivity** from Netlify functions
3. **Review function logs** for common error
4. **Test local collection**:
   ```bash
   netlify dev
   netlify functions:invoke collect-sentiment
   ```

**Likely Causes**:

- Netlify outage (wait for recovery)
- Network policy change (firewall/IP block)
- Code bug in orchestrator (check recent deploys)
- Environment variable missing

### Data Not Updating

**Symptoms**: API returns stale data (>2 hours old)

**Diagnosis**:

1. **Check scheduled function status**:

   ```bash
   netlify functions:list
   # Verify collect-sentiment is deployed
   ```

2. **Check function invocations**:

   - Netlify UI → Functions → collect-sentiment
   - Verify invocations in last 2 hours

3. **Manually trigger collection**:
   ```bash
   netlify functions:invoke collect-sentiment
   ```

**Resolution**:

- If manual trigger works: Re-deploy to fix scheduler
- If manual fails: Check logs for errors
- If API caching issue: Wait 5 minutes (cache TTL)

## Contact and Escalation

### For Technical Issues

1. **Check this guide** first
2. **Review function logs** for errors
3. **Check recent commits** for breaking changes
4. **Create GitHub issue** with:
   - Error message
   - Function logs
   - Source configuration
   - Expected vs actual behavior

### For Source-Related Issues

1. **Check source website** directly
2. **Test RSS feed** manually
3. **Search for source announcements** (feed changes)
4. **Document issue** in sources.json comments
5. **Disable source** if persistently failing

---

**Document Owner**: DevOps / Platform Team  
**Review Cycle**: Monthly or after major incidents
