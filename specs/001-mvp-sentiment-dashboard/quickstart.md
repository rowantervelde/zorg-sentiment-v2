# Quickstart Guide: MVP Sentiment Dashboard

**Last Updated**: 2025-10-24  
**Target Audience**: Developers setting up local environment or deploying to Netlify

---

## Prerequisites

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: For version control
- **Netlify CLI** (optional): `npm install -g netlify-cli`
- **Code Editor**: VS Code recommended with extensions:
  - Vue - Official
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense

---

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd zorg-sentiment-v2

# Checkout feature branch
git checkout 001-mvp-sentiment-dashboard

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file in project root:

```env
# RSS Feed Configuration
RSS_FEED_URL=https://www.nu.nl/rss/Gezondheid
FEED_FETCH_INTERVAL_MINUTES=60

# Data Storage (Netlify Blobs)
DATA_RETENTION_DAYS=7
NETLIFY_BLOBS_STORE_NAME=sentiment-data

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_HOUR=20

# Development
NUXT_PUBLIC_API_BASE=/api
```

### 3. Install Netlify Blobs Package

```bash
# Install Netlify Blobs for persistent storage
npm install @netlify/blobs
```

### 4. Run Development Server

```bash
# Start Nuxt dev server with hot reload
npm run dev

# Server will start at http://localhost:3000
```

**Note for Local Development**: Netlify Blobs requires deployment to Netlify to work. For local testing, you can mock the storage or use the Netlify CLI with `netlify dev` which provides blob storage emulation.

### 5. Test Netlify Functions Locally

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Run Netlify dev server (includes functions)
netlify dev

# Server will start at http://localhost:8888
# Functions available at http://localhost:8888/.netlify/functions/
```

---

## Project Structure Overview

```
zorg-sentiment-v2/
├── pages/
│   └── index.vue              # Main dashboard page
├── components/
│   ├── MoodIndicator.vue      # P1: Current mood display
│   ├── TrendsChart.vue        # P2: 7-day trend chart
│   ├── SentimentBreakdown.vue # P3: Percentage breakdown
│   └── DataTimestamp.vue      # Last updated indicator
├── composables/
│   ├── useSentiment.ts        # Sentiment data fetching
│   └── useRateLimit.ts        # Rate limiting logic
├── netlify/functions/
│   ├── collect-sentiment.ts   # Hourly data collection
│   ├── analyze-sentiment.ts   # Sentiment analysis
│   └── get-sentiment.ts       # API endpoint
├── server/api/
│   └── sentiment.get.ts       # Nitro API route
├── services/
│   ├── rss-fetcher.ts         # RSS parsing
│   ├── sentiment-analyzer.ts  # Sentiment classification
│   └── data-store.ts          # JSON file operations
├── types/
│   ├── sentiment.ts           # Type definitions
│   └── api.ts                 # API types
├── data/
│   └── sentiment-history.json # Local data storage
├── nuxt.config.ts             # Nuxt configuration
├── netlify.toml               # Netlify deployment config
└── package.json               # Dependencies
```

---

## Development Workflow

### Phase 1: Implement P1 (Current Mood) - Priority 1

```bash
# Create feature branch for P1
git checkout -b feature/p1-mood-indicator

# Implement components
# - pages/index.vue (basic layout)
# - components/MoodIndicator.vue
# - composables/useSentiment.ts
# - netlify/functions/get-sentiment.ts

# Test locally
npm run dev

# Run tests
npm run test

# Commit changes
git add .
git commit -m "feat(p1): implement current mood indicator"

# Push and create deploy preview
git push origin feature/p1-mood-indicator
```

### Phase 2: Implement P2 (Trends) - Priority 2

```bash
# Create feature branch for P2
git checkout -b feature/p2-trends-chart

# Implement components
# - components/TrendsChart.vue
# - Update composables/useSentiment.ts for trend data

# Test P1 + P2 together
npm run dev

# Run tests
npm run test

# Commit and push
git add .
git commit -m "feat(p2): implement 7-day trends chart"
git push origin feature/p2-trends-chart
```

### Phase 3: Implement P3 (Breakdown) - Priority 3

```bash
# Create feature branch for P3
git checkout -b feature/p3-sentiment-breakdown

# Implement components
# - components/SentimentBreakdown.vue

# Test all three features together
npm run dev

# Run tests
npm run test

# Commit and push
git add .
git commit -m "feat(p3): implement sentiment breakdown"
git push origin feature/p3-sentiment-breakdown
```

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Example Test**:

```typescript
// tests/unit/sentiment-analyzer.spec.ts
import { describe, it, expect } from "vitest";
import { analyzeSentiment } from "~/services/sentiment-analyzer";

describe("Sentiment Analyzer", () => {
  it("classifies positive sentiment correctly", () => {
    const result = analyzeSentiment([{ score: 5 }, { score: 4 }, { score: 3 }]);

    expect(result.moodClassification).toBe("positive");
    expect(result.breakdown.positive).toBeGreaterThanOrEqual(60);
  });
});
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

**Example E2E Test**:

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test("displays current mood indicator", async ({ page }) => {
  await page.goto("/");

  // Check mood indicator is visible
  const moodIndicator = page.locator('[data-testid="mood-indicator"]');
  await expect(moodIndicator).toBeVisible();

  // Check timestamp is displayed
  const timestamp = page.locator('[data-testid="last-updated"]');
  await expect(timestamp).toBeVisible();
});
```

---

## Building for Production

### Static Site Generation

```bash
# Generate static site
npm run generate

# Output will be in .output/public/
# This directory is what gets deployed to Netlify
```

### Preview Production Build

```bash
# Build and preview
npm run generate
npm run preview

# Server will start at http://localhost:3000
```

---

## Netlify Deployment

### Automatic Deployment (Recommended)

1. **Connect Repository to Netlify**:

   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository
   - Select branch: `001-mvp-sentiment-dashboard`

2. **Configure Build Settings**:

   ```
   Build command: npm run generate
   Publish directory: .output/public
   ```

3. **Set Environment Variables** (in Netlify dashboard):

   ```
   RSS_FEED_URL=https://www.nu.nl/rss/Gezondheid
   FEED_FETCH_INTERVAL_MINUTES=60
   DATA_RETENTION_DAYS=7
   RATE_LIMIT_REQUESTS_PER_HOUR=20
   ```

4. **Deploy**:
   - Netlify will automatically build and deploy on push
   - Deploy previews created for pull requests
   - Production deploys on merge to main

### Manual Deployment (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

---

## Scheduled Functions (Hourly Data Collection)

Netlify Functions can be scheduled using GitHub Actions or external cron services.

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/collect-sentiment.yml`:

```yaml
name: Collect Sentiment Data

on:
  schedule:
    # Run every hour
    - cron: "0 * * * *"
  workflow_dispatch: # Allow manual triggers

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - name: Trigger collection function
        env:
          NETLIFY_SITE_URL: ${{ secrets.NETLIFY_SITE_URL }}
        run: |
          curl -X POST "$NETLIFY_SITE_URL/.netlify/functions/collect-sentiment"
```

### Option 2: External Cron Service

Use services like [cron-job.org](https://cron-job.org/) or [EasyCron](https://www.easycron.com/):

- URL: `https://your-site.netlify.app/.netlify/functions/collect-sentiment`
- Schedule: Every hour (`0 * * * *`)

---

## Monitoring and Debugging

### View Netlify Function Logs

```bash
# Stream function logs
netlify functions:log collect-sentiment

# View recent logs in Netlify dashboard
# Site → Functions → Select function → Logs
```

### Check Data File

```bash
# View current sentiment data
cat data/sentiment-history.json | jq .

# Check data point count
cat data/sentiment-history.json | jq '.dataPoints | length'

# View latest data point
cat data/sentiment-history.json | jq '.dataPoints[0]'
```

### Health Check Endpoint

```bash
# Check system health
curl https://your-site.netlify.app/api/health

# Response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-24T14:30:00Z",
#   "sources": [...],
#   "dataAge": 1800,
#   "isStale": false
# }
```

---

## Troubleshooting

### Issue: RSS Feed Not Fetching

**Solution**:

```bash
# Test RSS feed URL manually
curl -I https://www.nu.nl/rss/Gezondheid

# Check function logs
netlify functions:log collect-sentiment

# Verify environment variables
netlify env:list
```

### Issue: Rate Limiting Not Working

**Solution**:

- Rate limiting uses IP address from `context.ip` in Edge Functions
- Test with: `curl -v https://your-site.netlify.app/api/sentiment` (repeat 21 times)
- Should receive 429 status after 20 requests

### Issue: Data Not Persisting

**Solution**:

- Netlify Functions have ephemeral `/tmp` storage - files don't persist across invocations
- **This MVP uses Netlify Blobs by default** - data is automatically persisted
- Verify `@netlify/blobs` is installed: `npm list @netlify/blobs`
- Check deployment logs for Blobs API access errors
- Ensure `data-store.ts` uses `getStore()` and `setJSON()` methods

### Issue: Page Load Time > 3s

**Solution**:

```bash
# Analyze bundle size
npm run analyze

# Check Lighthouse score
npx lighthouse https://your-site.netlify.app

# Optimize:
# - Enable Nuxt image optimization
# - Lazy load TrendsChart.vue
# - Use Netlify CDN caching (5 min for /api/sentiment)
```

---

## Next Steps

After completing MVP deployment:

1. **Monitor Performance**:

   - Set up Netlify Analytics
   - Track page load times
   - Monitor function execution times

2. **Collect User Feedback**:

   - Share MVP with test users
   - Gather feedback on UX and accuracy

3. **Plan Iterations**:
   - Add more RSS sources
   - Implement AI-generated commentary
   - Add export functionality
   - Migrate to database if needed

---

## Useful Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run generate               # Build static site
npm run preview                # Preview production build
netlify dev                    # Run with Netlify Functions locally

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:e2e               # E2E tests

# Deployment
netlify deploy --prod          # Deploy to production
netlify functions:list         # List deployed functions
netlify functions:log <name>   # View function logs

# Maintenance
npm run lint                   # Lint code
npm run type-check             # TypeScript check
npm run clean                  # Clean build artifacts
```

---

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Deployment Guide](https://docs.netlify.com/site-deploys/overview/)
- [Sentiment npm Package](https://www.npmjs.com/package/sentiment)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Nuxt UI Documentation](https://ui.nuxt.com/)

---

**Questions or Issues?** Check the [research.md](./research.md) and [data-model.md](./data-model.md) documents for additional context.
