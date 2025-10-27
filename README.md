# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

````markdown
# Zorg Sentiment Dashboard 😊

> Volg de Nederlandse stemming over zorgverzekeringen in real-time

A playful, real-time sentiment analysis dashboard that tracks Dutch public opinion about healthcare insurance using data from news sources and social media.

## ✨ Features

- **Current Mood Indicator**: Visual representation of national sentiment with emoji-based indicators
- **Sentiment Breakdown**: Detailed percentages showing positive, neutral, and negative sentiment
- **7-Day Trends**: Interactive charts showing sentiment changes over time
- **Multi-Source Data Collection**: Aggregates sentiment from 5+ Dutch news sources with graceful degradation
- **Source Contribution Metrics**: Track reliability and contribution of each data source
- **Real-Time Updates**: Hourly data collection from multiple sources in parallel
- **Smart Deduplication**: Cross-source article detection with 80% similarity threshold
- **Mobile Responsive**: Optimized experience on all devices
- **Dutch Language**: Full Dutch interface with friendly, warm tone

## 🚀 Quick Start

For detailed setup instructions, see [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md).

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Netlify account (for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zorg-sentiment-v2

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### Using Netlify Dev (Recommended for Local Testing)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run with Netlify functions support
netlify dev
```

Visit `http://localhost:8888` to test with Netlify functions.

## 📚 Documentation

### Feature 001: MVP Sentiment Dashboard

- [Feature Specification](./specs/001-mvp-sentiment-dashboard/spec.md) - Complete feature requirements
- [Implementation Plan](./specs/001-mvp-sentiment-dashboard/plan.md) - Technical architecture and decisions
- [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md) - Developer setup and deployment
- [Data Model](./specs/001-mvp-sentiment-dashboard/data-model.md) - Entity definitions and storage schema
- [API Contract](./specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml) - OpenAPI specification

### Feature 002: Multi-Source Sentiment Collection

- [Feature Specification](./specs/002-multi-source-sentiment/spec.md) - Multi-source architecture requirements
- [Implementation Plan](./specs/002-multi-source-sentiment/plan.md) - Orchestrator pattern and adapter system
- [Data Model](./specs/002-multi-source-sentiment/data-model.md) - Source configuration and article schema
- [Extending Sources Guide](./docs/extending-sources.md) - How to add new data source adapters
- [Source API Contract](./specs/002-multi-source-sentiment/contracts/sources-api.yaml) - Source metrics API specification

## 🛠️ Tech Stack

- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1
- **Backend**: Nitro 2.x (Nuxt server engine), Netlify Functions
- **Data Collection**: Multi-source orchestrator with RSS, Twitter (planned), Reddit (planned) adapters
- **Sentiment Analysis**: sentiment.js library with custom healthcare-focused tuning
- **Charts**: Chart.js with vue-chartjs
- **Storage**: Netlify Blobs (7-day retention with source contribution tracking)
- **Styling**: Tailwind CSS (via Nuxt UI)
- **Deployment**: Netlify Edge with scheduled functions

## 📊 Project Structure

```
zorg-sentiment-v2/
├── app/                      # Nuxt application
│   ├── components/          # Vue components (MoodIndicator, TrendChart, etc.)
│   ├── composables/         # Reusable composition functions
│   ├── pages/              # File-based routing
│   ├── types/              # TypeScript interfaces (API, sentiment)
│   └── app.vue             # Root component
├── server/                  # Nitro server (API routes + utilities)
│   ├── api/                # API endpoints (/api/sentiment, /api/sentiment/sources)
│   ├── config/             # Source configurations (RSS feeds, social media)
│   ├── middleware/         # Server middleware (CORS, rate limiting)
│   ├── types/              # Server types (Article, SourceConfiguration, SourceType)
│   └── utils/              # Server utilities (adapters, orchestrator, deduplicator)
├── netlify/functions/      # Netlify scheduled functions (sentiment collection)
├── docs/                   # Additional documentation
│   ├── extending-sources.md # Guide for adding new data sources
│   └── architecture/       # Architecture design documents
├── specs/                  # Feature specifications
└── public/                 # Static assets
```

## 📰 Data Sources

The system currently collects sentiment data from multiple Dutch news sources:

### Active RSS Feeds

1. **NU.nl Gezondheid** - General health news
2. **NOS.nl Algemeen** - National broadcaster general news
3. **Zorgwijzer** - Healthcare-specific news
4. **RTL Nieuws Algemeen** - Commercial broadcaster news
5. **Zorgkrant** - Healthcare industry news

### Planned Sources (Future Implementation)

- **Twitter/X** - Social media sentiment via TwitterAdapter (stub implemented)
- **Reddit** - Community discussions via RedditAdapter (stub implemented)

The multi-source architecture uses an **adapter pattern** allowing new sources to be added without modifying core sentiment logic. See [Extending Sources Guide](./docs/extending-sources.md) for implementation details.

### Source Features

- **Graceful Degradation**: System continues with available sources if some fail
- **Smart Deduplication**: Cross-source duplicate detection (80% similarity threshold)
- **Parallel Collection**: All sources fetched simultaneously (10s timeout per source)
- **Source Reliability Tracking**: 7-day metrics for each source's success rate
- **Per-Source Limits**: Max 30 articles per source per collection cycle

## 🌐 API Endpoints

### `GET /api/sentiment`

Returns current sentiment data with optional trend and summary.

**Query Parameters**:

- `include` (optional): `trend`, `summary`, or `all`

**Example**:

```bash
curl https://your-site.netlify.app/api/sentiment?include=all
```

### `GET /api/sentiment/history`

Returns historical sentiment data with date filtering.

**Query Parameters**:

- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)
- `limit` (optional): Max results (1-168)

### `GET /api/sentiment/sources`

Returns source contribution metrics and reliability statistics.

**Response includes**:

- Articles collected per source
- Sentiment breakdown by source
- 7-day reliability metrics
- Last fetch status

### `GET /api/health`

Health check endpoint with system status.

See [API Documentation](./specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml) for complete specification.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚢 Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables (see `.env.example`)
5. Deploy!

Automatic deployments on push to `main` branch.

For manual deployment:

```bash
netlify deploy --prod
```

## 📝 Development Workflow

1. Create a feature branch from `main`
2. Implement changes following the [task breakdown](./specs/001-mvp-sentiment-dashboard/tasks.md)
3. Test locally with `netlify dev`
4. Push to create a Deploy Preview
5. Review and merge to `main`

## 🤝 Contributing

This project follows a specification-driven development workflow:

1. Review [specification](./specs/001-mvp-sentiment-dashboard/spec.md)
2. Check [implementation plan](./specs/001-mvp-sentiment-dashboard/plan.md)
3. Follow [task checklist](./specs/001-mvp-sentiment-dashboard/tasks.md)
4. Submit pull requests with clear descriptions

## 📄 License

[Add license information]

## 🙋 Support

For questions or issues, please refer to the [documentation](./specs/001-mvp-sentiment-dashboard/) or open an issue.

---

Built with ❤️ for Dutch healthcare transparency
````

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
