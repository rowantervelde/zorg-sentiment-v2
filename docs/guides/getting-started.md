# Getting Started with Zorg Sentiment Dashboard

This guide will help you set up and run the Zorg Sentiment Dashboard locally and deploy it to production.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Netlify CLI**: `npm install -g netlify-cli`
- **Netlify account** (free tier is sufficient)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zorg-sentiment-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

**For basic testing**, the default configuration works out of the box.

**For Reddit integration**, add your credentials (see [Reddit Integration Guide](reddit-integration.md)):

```bash
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=zorg-sentiment-v2:1.0.0 by /u/your_reddit_username
```

### 4. Start Development Server

```bash
# Option A: Netlify Dev (RECOMMENDED)
netlify dev

# Option B: Standard Nuxt dev (no Netlify features)
npm run dev
```

**Use Netlify Dev** to get:

- ✅ Netlify Blobs storage support
- ✅ Netlify Functions (scheduled collection)
- ✅ Environment variables
- ✅ Edge Functions

Visit **http://localhost:8888** (Netlify) or **http://localhost:3000** (Nuxt).

## First Run

### Generate Test Data

The dashboard needs sentiment data to display. Generate test data using Netlify Functions:

```bash
# Use Netlify CLI to invoke the function (recommended)
netlify functions:invoke generate-test-data --querystring "hours=6"

# Alternative: Direct HTTP call
curl http://localhost:8888/api/generate-test-data?hours=6
```

This creates 6 hours of realistic test data with varying sentiment.

### Trigger Data Collection

Manually trigger the sentiment collection function:

```bash
# Use Netlify CLI to invoke the function (recommended)
netlify functions:invoke collect-sentiment

# Alternative: Direct HTTP call
curl http://localhost:8888/.netlify/functions/collect-sentiment
```

This fetches real articles from RSS feeds and Reddit (if configured).

### View the Dashboard

Open http://localhost:8888 in your browser. You should see:

- 😊😐😟 Mood indicator
- Sentiment breakdown (positive/neutral/negative percentages)
- Trend chart (if you generated test data)
- Data timestamp

## Project Structure Overview

```
zorg-sentiment-v2/
├── app/                    # Frontend Nuxt application
│   ├── components/        # MoodIndicator, TrendChart, etc.
│   └── pages/            # index.vue (dashboard homepage)
├── server/                # Backend Nitro server
│   ├── api/              # API endpoints (/sentiment, /health)
│   ├── config/           # sources.json, reddit-keywords.json
│   └── utils/            # Adapters, orchestrator, analyzers
├── netlify/functions/    # Scheduled functions (hourly collection)
└── docs/                 # Documentation (you are here!)
```

## Configuration

### Data Sources

Edit `server/config/sources.json` to configure data sources:

```json
{
  "sources": [
    {
      "id": "nu-nl-gezondheid",
      "name": "NU.nl Gezondheid",
      "type": "RSS",
      "url": "https://www.nu.nl/rss/Gezondheid",
      "category": "general",
      "isActive": true,
      "maxArticles": 30,
      "timeout": 10000
    }
  ]
}
```

**Key fields:**

- `isActive`: Set to `false` to disable a source
- `maxArticles`: Limit articles per collection (default: 30)
- `timeout`: Fetch timeout in milliseconds (default: 10000)

### Reddit Keywords

Edit `server/config/reddit-keywords.json` to tune keyword filtering:

```json
{
  "primary": ["zorgverzekering", "eigen risico"],
  "secondary": ["premie", "zorg"],
  "filtering": {
    "requirePrimary": false,
    "minimumScore": 1
  }
}
```

See [Reddit Integration Guide](reddit-integration.md) for details.

### Environment Variables

**Optional configuration** in `.env`:

```bash
# Show 6-hour trends instead of 7-day (for testing)
NUXT_TREND_WINDOW_HOURS=6

# RSS feed URL (default: NU.nl)
RSS_FEED_URL=https://www.nu.nl/rss/Gezondheid
```

## Testing Your Setup

### 1. Test API Endpoints

```bash
# Get current sentiment
curl http://localhost:8888/api/sentiment

# Get with trends
curl http://localhost:8888/api/sentiment?include=all

# Get source metrics
curl http://localhost:8888/api/sentiment/sources

# Health check
curl http://localhost:8888/api/health
```

### 2. Test Reddit Integration

If you configured Reddit:

```bash
node test-reddit-api-simple.js
```

Expected output: Articles fetched from configured subreddits.

### 3. Test Frontend

1. Open http://localhost:8888
2. Check browser console for errors (should be none)
3. Verify mood indicator displays
4. Check trend chart shows data
5. Test mobile view (resize browser)

**Complete testing guide**: [Local Testing Guide](local-testing.md)

## Deployment to Netlify

### 1. Link to Netlify

```bash
# Login to Netlify
netlify login

# Create new site or link existing
netlify init
```

### 2. Configure Environment Variables

In Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add variables from your `.env` file (if using Reddit)

### 3. Deploy

```bash
# Deploy to production
netlify deploy --prod

# Or push to GitHub (auto-deploy enabled)
git push origin main
```

### 4. Verify Deployment

1. Visit your Netlify site URL
2. Check **Functions** tab - `collect-sentiment` should be deployed
3. Verify scheduled function runs hourly
4. Monitor **Function logs** for errors

**Pre-deployment validation**: [Deployment Checklist](../deployment-checklist.md)

## Next Steps

### For Users

- ✅ You're done! The dashboard will update hourly automatically.
- Monitor source health at `/api/sentiment/sources`
- Check [Operations Guide](operations.md) for maintenance

### For Developers

- Read [Contributing Guide](../../CONTRIBUTING.md) for development workflow
- Explore [Architecture Overview](../architecture/multi-source-design.md)
- Learn to [Extend Sources](extending-sources.md) with new adapters
- Review [API Reference](../api/) for endpoint details

## Troubleshooting

### "Cannot connect to remote server" error

**Solution**: Make sure `netlify dev` is running.

### No data displayed on dashboard

**Solutions**:

1. Generate test data: `curl http://localhost:8888/api/generate-test-data?hours=6`
2. Or trigger collection: `curl http://localhost:8888/.netlify/functions/collect-sentiment`

### "Netlify Blobs is not available" error

**Solutions**:

1. Use `netlify dev` instead of `npm run dev`
2. Run `netlify login` to authenticate
3. Run `netlify link` to link your site

### RSS feed errors in logs

**Solutions**:

1. Check internet connection
2. Verify RSS URL works: `curl https://www.nu.nl/rss/Gezondheid`
3. Temporarily disable failed source in `sources.json`

### Reddit authentication fails

**Solution**: See [Reddit Integration Guide](reddit-integration.md) for credential setup.

## Getting Help

- **Documentation**: Browse [docs/](../) directory
- **Local Testing**: See [Local Testing Guide](local-testing.md)
- **Operations**: See [Operations Guide](operations.md)
- **Issues**: Open a GitHub issue

---

**Ready to contribute?** See [Contributing Guide](../../CONTRIBUTING.md)
