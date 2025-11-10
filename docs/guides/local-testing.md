# Local Testing Guide

Comprehensive guide for testing the Zorg Sentiment Dashboard locally.

## Quick Start Testing

### 1. Start Development Server

```bash
netlify dev
```

Visit http://localhost:8888

### 2. Generate Test Data

```bash
# Use Netlify CLI (recommended)
netlify functions:invoke generate-test-data --querystring "hours=6"

# Alternative: Browser or curl
curl http://localhost:8888/api/generate-test-data?hours=6
```

### 3. View Dashboard

Refresh http://localhost:8888 - you should see the mood indicator and trend chart.

## API Endpoint Testing

### Using cURL

```bash
# Get current sentiment
curl http://localhost:8888/api/sentiment

# Get with trends
curl http://localhost:8888/api/sentiment?include=trend

# Get all data
curl "http://localhost:8888/api/sentiment?include=all"

# Get historical data
curl "http://localhost:8888/api/sentiment/history?limit=10"

# Get source metrics
curl http://localhost:8888/api/sentiment/sources

# Health check
curl http://localhost:8888/api/health
```

### Using PowerShell

```powershell
# Get current sentiment
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment"

# Get with trends
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment?include=trend"

# Get all data
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment?include=all"
```

### Using Browser

Simply visit:

- http://localhost:8888/api/sentiment
- http://localhost:8888/api/sentiment?include=all
- http://localhost:8888/api/health

## Testing Sentiment Collection

### Manual Collection Trigger

```bash
# Use Netlify CLI (recommended)
netlify functions:invoke collect-sentiment

# Alternative: Direct HTTP call
curl http://localhost:8888/.netlify/functions/collect-sentiment
```

**Expected response:**

```json
{
  "success": true,
  "dataPoint": {
    "timestamp": "2025-11-10T14:30:00.000Z",
    "mood": "positive",
    "articlesAnalyzed": 25
  },
  "durationMs": 2340
}
```

### Verify Data Storage

After collection, check the data was saved:

```bash
curl http://localhost:8888/api/sentiment
```

Should return the newly collected sentiment data.

## Testing Trend History

### Generate Realistic Test Data

```bash
# 6 hours of data (recommended) - using Netlify CLI
netlify functions:invoke generate-test-data --querystring "hours=6"

# 24 hours (1 day)
netlify functions:invoke generate-test-data --querystring "hours=24"

# Full 7 days (168 hours)
netlify functions:invoke generate-test-data --querystring "hours=168"

# Alternative: Direct HTTP calls
curl http://localhost:8888/api/generate-test-data?hours=6
```

### View Trends

Visit http://localhost:8888 and check:

- ✅ Trend chart displays
- ✅ X-axis shows time labels
- ✅ Y-axis shows sentiment scale
- ✅ Tooltip appears on hover
- ✅ Significant changes highlighted

### Adjust Trend Window (Testing)

For faster testing, use a shorter trend window:

```bash
# Edit .env
NUXT_TREND_WINDOW_HOURS=6

# Restart netlify dev
netlify dev
```

See [Testing Trends Guide](../testing-trends.md) for details.

## Testing Reddit Integration

### Prerequisites

Configure Reddit credentials in `.env`:

```bash
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=zorg-sentiment-v2:1.0.0 by /u/your_username
```

### Run Test Script

```bash
node test-reddit-api-simple.js
```

**Expected output:**

```
🧪 Testing Reddit API Integration

1️⃣  Testing /api/sentiment endpoint...
✅ Sentiment endpoint responded
   Score: 0.15
   Mood: neutral
   Total articles: 25

2️⃣  Testing /api/sentiment/sources endpoint...
✅ Sources endpoint responded

📊 Found 3 Reddit source(s)
```

See [Reddit Integration Guide](reddit-integration.md) for troubleshooting.

## Rate Limiting Testing

Test that rate limiting works (20 requests/hour per IP):

**Bash:**

```bash
# Make 21 requests - the 21st should fail with 429
for i in {1..21}; do
  echo "Request $i:"
  curl -i http://localhost:8888/api/sentiment | head -n 1
done
```

**PowerShell:**

```powershell
# Make 21 requests
1..21 | ForEach-Object {
    Write-Host "Request $_"
    try {
        Invoke-WebRequest -Uri "http://localhost:8888/api/sentiment" -UseBasicParsing
    } catch {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
```

**Expected:** Request 21 returns `429 Too Many Requests`.

## Frontend Testing

### Manual Testing Checklist

- [ ] Homepage loads without errors
- [ ] Mood indicator displays (😊😐😟)
- [ ] Summary text appears in Dutch
- [ ] Sentiment breakdown shows percentages
- [ ] Breakdown colors match mood (green/gray/red)
- [ ] Timestamp shows "X uren geleden"
- [ ] Stale data warning appears (when >24 hours old)
- [ ] "No data" message displays when empty
- [ ] Trend chart renders
- [ ] Chart tooltip appears on hover
- [ ] Mobile responsive (resize browser to 375px)

### Browser Testing

Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android

### Responsive Design Testing

```bash
# Use browser DevTools (F12)
# 1. Toggle device toolbar
# 2. Select "iPhone SE" (375px)
# 3. Check layout doesn't overflow
# 4. Test "iPad" (768px)
# 5. Test desktop (1920px)
```

## Error State Testing

### Test "No Data" State

```bash
# Clear blob storage (simulate empty state)
# Then visit dashboard
```

Expected: "We verzamelen nog gegevens..." message.

### Test API Error

```bash
# Stop netlify dev
# Visit http://localhost:8888
```

Expected: Error message or last known data with warning.

### Test Stale Data Warning

Create old data point (>24 hours ago):

```bash
# Generate data with past timestamp
# (requires manual modification of test data generator)
```

Expected: Yellow warning: "Data is meer dan 1 dag oud"

## Performance Testing

### Local Performance Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit (requires netlify dev running)
lighthouse http://localhost:8888 --view
```

**Target scores:**

- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90

### Network Throttling

Test on slow connection:

1. Open DevTools (F12)
2. Network tab → Throttling
3. Select "Slow 3G"
4. Reload page

Expected: Page loads in <10 seconds.

## Edge Cases Testing

See [Edge Cases Testing Guide](edge-cases-testing.md) for comprehensive scenarios:

- 100% positive/negative sentiment
- Exactly 60% threshold
- Data gaps in trends
- Very long summary text
- Rate limit exceeded
- All sources failing
- Empty RSS feeds

## Automated Testing

### Type Checking

```bash
npm run type-check
```

Should complete with no errors.

### Unit Tests (if configured)

```bash
npm run test
```

### E2E Tests (if configured)

```bash
npm run test:e2e
```

## Debugging

### Enable Debug Logging

```bash
# Add to .env
DEBUG=*

# Restart netlify dev
netlify dev
```

### View Function Logs

Netlify Dev shows function logs in real-time:

```
[collect-sentiment] Fetching from 5 active sources
[collect-sentiment] NU.nl Gezondheid: 15 articles fetched in 847ms
[collect-sentiment] Complete in 3456ms
```

### Browser Console

Open DevTools (F12) → Console tab:

- Check for JavaScript errors
- Verify API responses
- Monitor network requests

### Network Tab

DevTools → Network tab:

- Check API response times
- Verify correct status codes (200, 429, etc.)
- Inspect request/response payloads

## Troubleshooting

### Issue: "Cannot connect to remote server"

**Solution:** Make sure `netlify dev` is running.

### Issue: No data displayed

**Solution:**

```bash
# Use Netlify CLI
netlify functions:invoke generate-test-data --querystring "hours=6"

# Or use curl
curl http://localhost:8888/api/generate-test-data?hours=6
```

### Issue: Trend chart not showing

**Solutions:**

1. Generate more data points (need at least 2)
2. Check `NUXT_TREND_WINDOW_HOURS` matches generated data
3. Check browser console for errors

### Issue: Rate limiting not working

**Solution:** Rate limits reset on server restart. Restart `netlify dev` and try again.

### Issue: Reddit data not appearing

**Solutions:**

1. Verify Reddit credentials in `.env`
2. Run `node test-reddit-api-simple.js` to check connection
3. Check keywords in `server/config/reddit-keywords.json`

## Testing Checklist

Before deployment, verify:

- [ ] All API endpoints return valid responses
- [ ] Frontend displays mood indicator correctly
- [ ] Trends chart renders with test data
- [ ] Rate limiting works (21st request → 429)
- [ ] Mobile responsive design works
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No console errors in browser
- [ ] Health endpoint returns "healthy"
- [ ] Source metrics endpoint works
- [ ] Reddit integration works (if configured)

## Related Documentation

- [Getting Started](getting-started.md) - Initial setup
- [Edge Cases Testing](edge-cases-testing.md) - Comprehensive test scenarios
- [Deployment Checklist](deployment.md) - Pre-production validation
- [Testing Trends](../testing-trends.md) - Trend-specific testing

---

**Next:** [Deployment Checklist](deployment.md)
