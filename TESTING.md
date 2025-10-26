# Local Testing Guide

## Quick Start

### 1. Start Development Server

```bash
# Option A: Standard Nuxt dev (no Netlify Blobs support)
npm run dev
# → http://localhost:3000

# Option B: Netlify Dev (RECOMMENDED - full Netlify environment)
netlify dev
# → http://localhost:8888
```

**Use Netlify Dev for full testing** since it emulates:

- ✅ Netlify Blobs storage
- ✅ Netlify Functions
- ✅ Edge Functions
- ✅ Environment variables

---

## Component Testing

### Test Individual Utilities

Create test files in your terminal or use Node REPL:

**Test RSS Fetcher:**

```bash
# Using netlify dev, open Node console
node

# Then run:
const { fetchRSSFeed } = require('./server/utils/rssFetcher.ts');
await fetchRSSFeed('https://www.nu.nl/rss/Gezondheid');
```

**Test Sentiment Analyzer:**

```bash
node

const { analyzeSentiment } = require('./server/utils/sentimentAnalyzer.ts');
analyzeSentiment('Dit is geweldig nieuws over de gezondheidszorg!');
// Should return positive sentiment
```

---

## API Endpoint Testing

### Using cURL (Command Line)

```bash
# 1. Get current sentiment
curl http://localhost:8888/api/sentiment

# 2. Get sentiment with trend data
curl "http://localhost:8888/api/sentiment?include=trend"

# 3. Get all data (current + trend + summary)
curl "http://localhost:8888/api/sentiment?include=all"

# 4. View headers (rate limit info)
curl -i http://localhost:8888/api/sentiment
```

### Using PowerShell

```powershell
# Get current sentiment
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment"

# Get with trend
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment?include=trend"

# Get all data
Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment?include=all"
```

### Using Browser

Simply visit:

- http://localhost:8888/api/sentiment
- http://localhost:8888/api/sentiment?include=trend
- http://localhost:8888/api/sentiment?include=all

---

## Netlify Functions Testing

### Manual Trigger of Scheduled Function

The scheduled function normally runs every hour automatically in production. Locally, trigger it using the Netlify CLI:

**Using Netlify CLI (Recommended):**

```bash
# Invoke the function
netlify functions:invoke collect-sentiment

# Or with explicit payload
netlify functions:invoke collect-sentiment --payload '{"next_run": "2025-10-25T15:00:00Z"}'
```

**⚠️ Important Notes:**

- Scheduled functions **cannot** be triggered via HTTP requests in production
- HTTP requests (POST/GET) only work locally for testing with `netlify dev`
- In production, the function runs automatically based on the schedule in `netlify.toml`

**Using HTTP (Local Testing Only):**

```bash
# This only works with netlify dev, NOT in production
curl -X POST http://localhost:8888/.netlify/functions/collect-sentiment \
  -H "Content-Type: application/json" \
  -d '{"next_run": "2025-10-25T15:00:00Z"}'
```

**PowerShell (Local Testing Only):**

```powershell
# This only works with netlify dev, NOT in production
$body = @{ next_run = "2025-10-25T15:00:00Z" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8888/.netlify/functions/collect-sentiment" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**

```json
{
  "success": true,
  "dataPoint": {
    "timestamp": "2025-10-25T14:30:00.000Z",
    "mood": "positive",
    "articlesAnalyzed": 15
  },
  "durationMs": 2340
}
```

---

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

**Expected:** Request 21 should return `429 Too Many Requests` with headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1729872000
Retry-After: 3600
```

---

## Storage Testing

### Check Netlify Blobs Data

When using `netlify dev`, Blobs are stored in `.netlify/blobs-serve/`.

**Inspect stored data:**

```bash
# List blob stores
ls .netlify/blobs-serve/

# View sentiment data (if using file-based fallback)
cat .netlify/blobs-serve/sentiment-data/sentiment-history
```

### Test Storage Functions Directly

```javascript
// In Node console or test file
import { getData, addDataPoint } from "./server/utils/storage";

// Get current data
const history = await getData();
console.log(history);

// Add test data point
const testPoint = {
  timestamp: new Date().toISOString(),
  collectionDurationMs: 1000,
  moodClassification: "positive",
  breakdown: { positive: 70, neutral: 20, negative: 10 },
  summary: "Test mood summary",
  articlesAnalyzed: 10,
  source: "nu-nl-gezondheid",
  confidence: 0.85,
};
await addDataPoint(testPoint);
```

---

## Frontend Testing

### Test in Browser

1. **Start netlify dev:**

   ```bash
   netlify dev
   ```

2. **Open browser:**

   ```
   http://localhost:8888
   ```

3. **Manual test steps:**
   - [ ] Page loads without errors
   - [ ] Mood indicator displays (after data collection)
   - [ ] Summary text shows in Dutch
   - [ ] Timestamp displays "X hours ago"
   - [ ] "No data" message shows when empty
   - [ ] Mobile responsive (resize browser)

### Test Vue Composable

In a Vue component or browser console:

```vue
<script setup>
const { fetchCurrent, state, hasData } = useSentiment();

onMounted(async () => {
  await fetchCurrent();
  console.log("Has data:", hasData.value);
  console.log("Current mood:", state.value.current?.moodClassification);
});
</script>
```

---

## Automated Test Script

Run the included test script:

**PowerShell (Windows):**

```powershell
.\test-local.ps1
```

**Bash (Mac/Linux):**

```bash
bash test-local.sh
```

This script will:

1. ✅ Check if netlify dev is running
2. ✅ Trigger sentiment collection
3. ✅ Fetch current data
4. ✅ Fetch trend data
5. ✅ Test rate limiting

---

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:** Make sure you're using `netlify dev`, not `npm run dev`:

```bash
netlify dev
```

### Issue: "Netlify Blobs is not available"

**Solution:**

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Link site: `netlify link`
4. Use `netlify dev` instead of `npm run dev`

### Issue: RSS feed fetch fails

**Solution:** Check your internet connection and verify the RSS URL:

```bash
curl https://www.nu.nl/rss/Gezondheid
```

### Issue: Rate limiting not working

**Solution:** Rate limits are stored in-memory and reset on server restart. Restart `netlify dev` and try again.

### Issue: No data in API response

**Solution:** You need to collect data first:

```bash
# Trigger the collection function (recommended method)
netlify functions:invoke collect-sentiment --payload '{"next_run": "2025-10-25T15:00:00Z"}'

# Or using HTTP (local only)
curl -X POST http://localhost:8888/.netlify/functions/collect-sentiment \
  -H "Content-Type: application/json" \
  -d '{"next_run": "2025-10-25T15:00:00Z"}'

# Wait 2 seconds, then fetch
curl http://localhost:8888/api/sentiment
```

---

## Testing Checklist

Before deploying to production, verify:

- [ ] ✅ Netlify dev runs without errors
- [ ] ✅ Scheduled function collects data successfully
- [ ] ✅ API endpoint returns valid JSON
- [ ] ✅ Rate limiting triggers at 21st request
- [ ] ✅ Frontend displays mood indicator
- [ ] ✅ Dutch summaries are grammatically correct
- [ ] ✅ Mobile responsive design works
- [ ] ✅ No TypeScript errors (`npm run build`)
- [ ] ✅ No console errors in browser
- [ ] ✅ Stale data warning shows after 24 hours

---

## Next Steps

After local testing passes:

1. Commit changes: `git add . && git commit -m "feat: phase 2 foundational infrastructure"`
2. Push to GitHub: `git push origin 001-mvp-sentiment-dashboard`
3. Deploy to Netlify: Automatically triggers on push
4. Test on production URL
5. Proceed to Phase 3 (User Story 1 UI components)

---

## Useful Commands Reference

```bash
# Development
npm run dev              # Nuxt dev server (basic)
netlify dev              # Netlify dev server (full features)
npm run build            # Build for production
npm run generate         # Generate static site

# Testing
npm run type-check       # TypeScript validation
npm run lint             # ESLint check

# Netlify CLI
netlify login            # Authenticate
netlify link             # Link to site
netlify deploy --prod    # Deploy to production
netlify functions:list   # List all functions
netlify dev --debug      # Debug mode
```
