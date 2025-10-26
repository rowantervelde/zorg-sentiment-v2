# Testing Trend History Locally

## 🚀 Quick Start (EASIEST METHOD)

### Step 1: Start Netlify Dev

```bash
netlify dev
```

### Step 2: Generate Test Data via HTTP

Open your browser or use curl:

```bash
# Generate 6 hours of test data (recommended for quick testing)
http://localhost:8888/api/generate-test-data?hours=6

# Or use curl in PowerShell:
curl http://localhost:8888/api/generate-test-data?hours=6

# For 24 hours of data:
http://localhost:8888/api/generate-test-data?hours=24
```

### Step 3: View Your Dashboard

Visit http://localhost:8888 - The trend chart should now display your test data! 📈

---

## Alternative: Configure Shorter Trend Window

Instead of waiting 7 days for trend data, configure a shorter window for **local testing**:

1. Create a `.env` file (if you don't have one):

   ```bash
   cp .env.example .env
   ```

2. Add this line to your `.env`:

   ```bash
   # Show 6-hour trends instead of 7-day trends
   NUXT_TREND_WINDOW_HOURS=6

   # Or 1-hour for super fast testing
   # NUXT_TREND_WINDOW_HOURS=1

   # Or 24-hour trends (1 day)
   # NUXT_TREND_WINDOW_HOURS=24
   ```

   > **Note**: Use `.env` for local testing. For production deployment, configure this via Netlify's UI under Site settings > Environment variables (if needed).

3. Generate matching test data via HTTP:

   ```bash
   http://localhost:8888/api/generate-test-data?hours=6
   ```

4. Refresh your dashboard at http://localhost:8888

## What the Test Data Includes

The test data generator creates realistic sentiment data with:

✅ **Time-based variation**: Morning hours (6-12) are more positive, evening (18-24) more negative  
✅ **Random fluctuations**: Natural variation in sentiment percentages  
✅ **Mood classification**: Proper positive/negative/mixed/neutral labeling based on ≥60% threshold  
✅ **Dutch summaries**: Realistic mood descriptions ("Nederland voelt zich optimistisch...")  
✅ **Significant changes**: Some data points have >20% swings (highlighted with larger colored dots in chart)  
✅ **Valid percentages**: All breakdowns sum to exactly 100%

**Example Response:**

```json
{
  "success": true,
  "message": "Generated 6 hours of test data successfully!",
  "stats": {
    "totalDataPoints": 6,
    "moodDistribution": {
      "positive": 2,
      "negative": 1,
      "mixed": 2,
      "neutral": 1
    },
    "significantChanges": 1
  }
}
```

## Expected Trend Chart Behavior

### With Full Data (168+ hours):

- Shows "Stemmingstrend afgelopen 7 dagen" title
- Full line chart with 7 days of data points
- Significant changes highlighted with larger colored dots
- Data gaps indicator (if any hours are missing)

### With Partial Data (<168 hours):

- Shows "building trend history" blue message
- Displays how many hours/days collected
- Shows completeness percentage
- Updates as more data arrives

### With 1-Hour Window (Testing):

- Title changes to "Stemmingstrend afgelopen uur"
- X-axis shows minute-level timestamps
- Perfect for rapid iteration during development

## Troubleshooting

### "Cannot connect to remote server" error

- Make sure `netlify dev` is running first!
- The generate-test-data function only works when the dev server is active

### Chart shows "building trend history" message

- This is normal! Generate more test data hours
- Or set `NUXT_TREND_WINDOW_HOURS` to match your data
- Example: If you generated 6 hours of data, set `NUXT_TREND_WINDOW_HOURS=6`

### No data visible

- Refresh the page after generating data
- Check browser console for API errors
- Verify the function returned success: `{"success": true, ...}`

### Function returns 403 Forbidden

- The generate-test-data function only works in development mode
- Make sure you're using `netlify dev`, not production deployment

### Chart looks compressed/weird

- Adjust the trend window to match your test data
- 6-12 data points work well for visualization
- Too few points (<3) won't show a clear trend line

## Real Production Usage

Once deployed to Netlify:

1. Remove `NUXT_TREND_WINDOW_HOURS` from environment variables (or set to 168)
2. Let the scheduled function collect data hourly
3. Full 7-day trends will build up over a week
4. Test data will be replaced by real sentiment analysis

## How It Works

1. **Netlify Function**: `netlify/functions/generate-test-data.mts` creates `SentimentDataPoint` objects and saves them to Netlify Blobs
2. **HTTP Access**: Call the function via `/.netlify/functions/generate-test-data?hours=N` while dev server is running
3. **API Endpoint**: `/api/sentiment?include=trend` reads from Blobs and calculates the TrendPeriod
4. **TrendChart Component**: Visualizes the data with Chart.js, automatically adjusting labels/messages based on window size
5. **Trend Window**: Controlled by `NUXT_TREND_WINDOW_HOURS` environment variable (default: 168 hours = 7 days)

**Architecture:**

```
Browser → /.netlify/functions/generate-test-data
              ↓ (saves to)
         Netlify Blobs (sentiment-history)
              ↓ (reads from)
         /api/sentiment?include=trend
              ↓ (displays)
         TrendChart.vue Component
```

---

**Pro Tip**: Start with 6-hour window + 6 hours of test data for fastest iteration, then scale up to 24 hours, then eventually remove the variable for production 7-day trends!
