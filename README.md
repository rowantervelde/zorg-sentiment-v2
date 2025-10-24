# Zorg Sentiment Dashboard - MVP

> Real-time sentiment visualization for Dutch healthcare insurance news

## 🎯 Overview

The Zorg Sentiment Dashboard visualizes Dutch healthcare insurance sentiment by analyzing RSS feeds hourly. The MVP displays the current national mood with a playful emoji-based interface, built with Nuxt 3 and deployed on Netlify.

## ✨ Features (MVP - User Story 1)

- **Current Mood Indicator**: Visual emoji display (😊/😐/😟) showing current sentiment
- **Dutch Summary**: Human-readable description of the national mood
- **Sentiment Breakdown**: Percentage distribution of positive, neutral, and negative sentiment
- **Data Timestamp**: Last updated time with staleness warnings
- **Responsive Design**: Mobile-first interface with Nuxt UI components

## 🛠️ Tech Stack

- **Framework**: Nuxt 3 (SSG) with TypeScript 5.x
- **UI**: Nuxt UI v3 + Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Data Storage**: Netlify Blobs (persistent key-value store)
- **Sentiment Analysis**: `sentiment` npm package
- **RSS Parsing**: Custom RSS fetcher for NU.nl Gezondheid
- **Deployment**: Netlify with hourly scheduled functions

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Netlify account (for deployment)
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd zorg-sentiment-v2
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default values in `.env.example` are suitable for local development.

### 3. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

**Note**: Netlify Blobs requires deployment to work. For local testing, the app will show "No data available" until deployed.

### 4. Build for Production

```bash
npm run generate
```

This creates a static site in `.output/public/` ready for deployment.

## 📦 Deployment to Netlify

### Automatic Deployment (Recommended)

1. **Connect Repository**:

   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository
   - Select branch: `main` (or your feature branch)

2. **Build Settings** (auto-detected from `netlify.toml`):

   - Build command: `npm run generate`
   - Publish directory: `.output/public`
   - Functions directory: `netlify/functions`

3. **Environment Variables** (optional, defaults are in `nuxt.config.ts`):

   ```
   RSS_FEED_URL=https://www.nu.nl/rss/Gezondheid
   FEED_FETCH_INTERVAL_MINUTES=60
   DATA_RETENTION_DAYS=7
   RATE_LIMIT_REQUESTS_PER_HOUR=20
   ```

4. **Deploy**: Netlify will automatically build and deploy

### Scheduled Data Collection

The `collect-sentiment` function is configured to run hourly via Netlify's scheduled functions. To trigger it manually:

```bash
# Via Netlify CLI
netlify functions:invoke collect-sentiment

# Or via HTTP
curl -X POST https://your-site.netlify.app/.netlify/functions/collect-sentiment
```

## 📁 Project Structure

```
zorg-sentiment-v2/
├── components/           # Vue components
│   ├── MoodIndicator.vue # Current mood display
│   └── DataTimestamp.vue # Last updated timestamp
├── composables/          # Vue composables
│   └── useSentiment.ts   # Sentiment data fetching
├── netlify/functions/    # Serverless functions
│   └── collect-sentiment.ts # Hourly data collection
├── pages/                # Nuxt pages
│   └── index.vue         # Main dashboard
├── server/api/           # Nitro API routes
│   └── sentiment.get.ts  # GET /api/sentiment
├── services/             # Business logic
│   ├── data-store.ts     # Netlify Blobs storage
│   ├── rss-fetcher.ts    # RSS feed parsing
│   └── sentiment-analyzer.ts # Sentiment classification
├── types/                # TypeScript definitions
│   ├── sentiment.ts      # Core types
│   └── api.ts            # API types
├── nuxt.config.ts        # Nuxt configuration
├── netlify.toml          # Netlify deployment config
└── package.json          # Dependencies
```

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run generate    # Generate static site (SSG)
npm run preview     # Preview production build
npm run type-check  # TypeScript type checking
```

### Testing Locally with Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Run dev server with functions
netlify dev
```

This provides Netlify Blobs emulation and function testing locally.

## 🎨 Design Decisions

### MVP Scope

Following the MVP-first approach, this implementation includes only **User Story 1** (P1):

- ✅ View current national mood
- ⏭️ See sentiment trends (P2) - Future iteration
- ⏭️ Understand sentiment breakdown chart (P3) - Future iteration

### Architecture

- **Static Site Generation (SSG)**: Fast page loads (<3s goal)
- **Serverless Functions**: No server maintenance, scales automatically
- **Netlify Blobs**: Simple key-value storage, easy migration to database later
- **Hourly Collection**: Balances freshness with API rate limits

### Data Flow

1. **Collection** (hourly via Netlify Function):

   - Fetch RSS feed from NU.nl Gezondheid
   - Analyze sentiment using `sentiment` package
   - Store data point in Netlify Blobs (7-day retention)

2. **Display** (client-side):
   - Fetch latest data from `/api/sentiment`
   - Render mood indicator with emoji
   - Show Dutch summary and breakdown
   - Auto-refresh every 5 minutes

## 📊 API Endpoints

### GET /api/sentiment

Returns current sentiment data with optional trend and summary.

**Query Parameters**:

- `include`: `trend` | `summary` | `all` (default: `all`)

**Response**:

```json
{
  "current": {
    "timestamp": "2025-10-24T14:00:00Z",
    "moodClassification": "positive",
    "breakdown": {
      "positive": 65,
      "neutral": 25,
      "negative": 10
    },
    "summary": "Nederland voelt zich optimistisch over zorgverzekeringen",
    "articlesAnalyzed": 12,
    "source": "nu-nl-gezondheid"
  },
  "meta": {
    "lastUpdated": "2025-10-24T14:00:00Z",
    "dataAge": 0,
    "isStale": false
  }
}
```

## 🔒 Rate Limiting

The API implements rate limiting:

- **20 requests per hour** per IP address
- Returns `429 Too Many Requests` when exceeded
- Client automatically handles 429 responses

## 📝 Data Retention

- **7-day rolling window**: Data older than 7 days is automatically purged
- **Hourly collection**: Up to 168 data points (7 days × 24 hours)
- **Staleness warning**: Data older than 24 hours triggers a warning

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads in <3 seconds
- [ ] Mood emoji displays correctly (😊/😐/😟)
- [ ] Dutch summary text is grammatically correct
- [ ] Sentiment breakdown percentages sum to 100%
- [ ] Timestamp shows last update time
- [ ] "No data" message appears when no data exists
- [ ] Staleness warning appears for data >24 hours old
- [ ] Responsive design works on mobile (320px width)
- [ ] Refresh button fetches new data
- [ ] Auto-refresh works every 5 minutes

## 🚀 Next Steps (Post-MVP)

### User Story 2: Trends (P2)

- Add 7-day trend chart with Chart.js
- Visualize sentiment changes over time
- Highlight notable swings (>20% change)

### User Story 3: Breakdown (P3)

- Add doughnut chart for sentiment distribution
- Visual emphasis when one category dominates (>70%)
- Color-coded categories

### Production Enhancements

- Migrate from Netlify Blobs to PostgreSQL (Supabase)
- Add more RSS sources (NOS, Zorgverzekeraars.nl)
- Implement AI-generated commentary
- Add export functionality (CSV/JSON)
- Performance optimization (bundle size, lazy loading)
- Comprehensive test coverage (Vitest, Playwright)

## 📚 Documentation

For detailed documentation, see:

- [Specification](./specs/001-mvp-sentiment-dashboard/spec.md)
- [Implementation Plan](./specs/001-mvp-sentiment-dashboard/plan.md)
- [Data Model](./specs/001-mvp-sentiment-dashboard/data-model.md)
- [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md)
- [API Contract](./specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml)

## 🐛 Troubleshooting

### Issue: "No data available" on deployed site

**Solution**: Manually trigger the collection function once:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/collect-sentiment
```

### Issue: RSS feed not fetching

**Solution**: Check Netlify function logs:

1. Go to Netlify Dashboard → Your Site → Functions
2. Click `collect-sentiment` → View logs
3. Look for fetch errors

### Issue: TypeScript errors in IDE

**Solution**: These are expected for auto-imported Nuxt composables. Run `npm run build` to generate `.nuxt/tsconfig.json` which resolves imports.

## 📄 License

Private project - All rights reserved

## 👥 Contributors

- Initial MVP implementation following speckit.implement workflow

---

**Questions?** Check the [quickstart guide](./specs/001-mvp-sentiment-dashboard/quickstart.md) or [research doc](./specs/001-mvp-sentiment-dashboard/research.md).
