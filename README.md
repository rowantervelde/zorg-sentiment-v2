# Zorg Sentiment Dashboard 😊# Zorg Sentiment Dashboard 😊# Zorg Sentiment Dashboard 😊# Nuxt Minimal Starter

> Real-time sentiment analysis tracking Dutch public opinion about healthcare insurance> Real-time sentiment analysis tracking Dutch public opinion about healthcare insurance> Real-time sentiment analysis tracking Dutch public opinion about healthcare insuranceLook at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

A playful, real-time sentiment analysis dashboard that monitors Dutch public opinion about healthcare insurance using data from news sources and social media. Built with Nuxt 4, Vue 3, and deployed on Netlify.A playful, real-time sentiment analysis dashboard that monitors Dutch public opinion about healthcare insurance using data from news sources and social media. Built with Nuxt 4, Vue 3, and deployed on Netlify.A playful, real-time sentiment analysis dashboard that monitors Dutch public opinion about healthcare insurance using data from news sources and social media. Built with Nuxt 4, Vue 3, and deployed on Netlify.## Setup

## ✨ Features## ✨ Features## ✨ FeaturesMake sure to install dependencies:

- **Current Mood Indicator**: Visual sentiment representation with emoji-based indicators (😊😐😟)- **Current Mood Indicator**: Visual sentiment representation with emoji-based indicators (😊😐😟)- **Current Mood Indicator**: Visual sentiment representation with emoji-based indicators (😊😐😟)````markdown

- **Sentiment Breakdown**: Detailed percentages showing positive, neutral, and negative sentiment

- **7-Day Trends**: Interactive charts showing sentiment changes over time- **Sentiment Breakdown**: Detailed percentages showing positive, neutral, and negative sentiment

- **Multi-Source Data Collection**: Aggregates sentiment from Dutch news sources and Reddit

- **Source Contribution Metrics**: Track reliability and contribution of each data source- **7-Day Trends**: Interactive charts showing sentiment changes over time- **Sentiment Breakdown**: Detailed percentages showing positive, neutral, and negative sentiment# Zorg Sentiment Dashboard 😊

- **Real-Time Updates**: Hourly automated data collection with graceful degradation

- **Smart Deduplication**: Cross-source article detection with 80% similarity threshold- **Multi-Source Data Collection**: Aggregates sentiment from Dutch news sources and Reddit

- **Mobile Responsive**: Optimized experience on all devices

- **Dutch Language**: Full Dutch interface with friendly, warm tone- **Source Contribution Metrics**: Track reliability and contribution of each data source- **7-Day Trends**: Interactive charts showing sentiment changes over time

## 🚀 Quick Start- **Real-Time Updates**: Hourly automated data collection with graceful degradation

`````bash- **Smart Deduplication**: Cross-source article detection with 80% similarity threshold- **Multi-Source Data Collection**: Aggregates sentiment from Dutch news sources and Reddit> Volg de Nederlandse stemming over zorgverzekeringen in real-time

# Install dependencies

npm install- **Mobile Responsive**: Optimized experience on all devices



# Start development server with Netlify features- **Dutch Language**: Full Dutch interface with friendly, warm tone- **Source Contribution Metrics**: Track reliability and contribution of each data source

netlify dev

```## 🚀 Quick Start- **Real-Time Updates**: Hourly automated data collection with graceful degradationA playful, real-time sentiment analysis dashboard that tracks Dutch public opinion about healthcare insurance using data from news sources and social media.



Visit http://localhost:8888 to see the dashboard.````bash- **Smart Deduplication**: Cross-source article detection with 80% similarity threshold



**For detailed setup**: See [Getting Started Guide](docs/guides/getting-started.md)# Install dependencies



## 📚 Documentationnpm install- **Mobile Responsive**: Optimized experience on all devices## ✨ Features



### For Users & Operators



- **[Getting Started](docs/guides/getting-started.md)** - Installation and first run# Start development server with Netlify features- **Dutch Language**: Full Dutch interface with friendly, warm tone

- **[Reddit Integration](docs/guides/reddit-integration.md)** - Configure Reddit as a data source

- **[Operations Guide](docs/guides/operations.md)** - Monitoring and maintenancenetlify dev

- **[Local Testing](docs/guides/local-testing.md)** - Test the application locally

```- **Current Mood Indicator**: Visual representation of national sentiment with emoji-based indicators

### For Developers



- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and standards

- **[Extending Sources](docs/guides/extending-sources.md)** - Add new data source adaptersVisit http://localhost:8888 to see the dashboard.## 🚀 Quick Start- **Sentiment Breakdown**: Detailed percentages showing positive, neutral, and negative sentiment

- **[Architecture Overview](docs/architecture/multi-source-design.md)** - System design and patterns

- **[API Reference](docs/api/)** - Endpoint specifications



### Testing & Deployment**For detailed setup**: See [Getting Started Guide](docs/guides/getting-started.md)- **7-Day Trends**: Interactive charts showing sentiment changes over time



- **[Edge Cases Testing](docs/guides/edge-cases-testing.md)** - Edge case scenarios

- **[Deployment Checklist](docs/guides/deployment.md)** - Pre-deployment validation

## 📚 Documentation```bash- **Multi-Source Data Collection**: Aggregates sentiment from 5+ Dutch news sources with graceful degradation

### Feature Specifications



- **[Feature 001: MVP Dashboard](specs/001-mvp-sentiment-dashboard/)** - Core sentiment visualization

- **[Feature 002: Multi-Source Collection](specs/002-multi-source-sentiment/)** - Orchestrator and adapters### For Users & Operators# Install dependencies- **Source Contribution Metrics**: Track reliability and contribution of each data source

- **[Feature 003: Reddit Integration](specs/003-reddit-integration/)** - Reddit API integration



## 🛠️ Tech Stack

- **[Getting Started](docs/guides/getting-started.md)** - Installation and first runnpm install- **Real-Time Updates**: Hourly data collection from multiple sources in parallel

- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1, Chart.js

- **Backend**: Nitro 2.x, Netlify Functions- **[Reddit Integration](docs/guides/reddit-integration.md)** - Configure Reddit as a data source

- **Data Collection**: Multi-source orchestrator with RSS and Reddit adapters

- **Sentiment Analysis**: sentiment.js library with Dutch healthcare tuning- **[Operations Guide](docs/guides/operations.md)** - Monitoring and maintenance- **Smart Deduplication**: Cross-source article detection with 80% similarity threshold

- **Storage**: Netlify Blobs (7-day retention)

- **Deployment**: Netlify Edge with scheduled functions- **[Local Testing](docs/guides/local-testing.md)** - Test the application locally



## 📰 Data Sources# Start development server with Netlify features- **Mobile Responsive**: Optimized experience on all devices



### Active Sources### For Developers



**RSS Feeds** (5 sources):netlify dev- **Dutch Language**: Full Dutch interface with friendly, warm tone

- NU.nl Gezondheid - General health news

- NOS.nl Algemeen - National broadcaster- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and standards

- Zorgwijzer - Healthcare-specific news

- RTL Nieuws Algemeen - Commercial broadcaster- **[Extending Sources](docs/guides/extending-sources.md)** - Add new data source adapters```

- Zorgkrant - Healthcare industry news

- **[Architecture Overview](docs/architecture/multi-source-design.md)** - System design and patterns

**Social Media**:

- Reddit - Dutch subreddits (r/thenetherlands, r/geldzaken) with keyword filtering- **[API Reference](docs/api/)** - Endpoint specifications## 🚀 Quick Start



**Planned**: Twitter/X integration (stub implemented)



## 🌐 API Endpoints### Feature SpecificationsVisit http://localhost:8888 to see the dashboard.



```bash

# Get current sentiment with trends

GET /api/sentiment?include=all- **[Feature 001: MVP Dashboard](specs/001-mvp-sentiment-dashboard/)** - Core sentiment visualizationFor detailed setup instructions, see [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md).



# Get historical data- **[Feature 002: Multi-Source Collection](specs/002-multi-source-sentiment/)** - Orchestrator and adapters

GET /api/sentiment/history?from=2025-01-01&limit=50

- **[Feature 003: Reddit Integration](specs/003-reddit-integration/)** - Reddit API integration**For detailed setup**: See [Getting Started Guide](docs/guides/getting-started.md)

# Get source metrics

GET /api/sentiment/sources



# Health check## 🛠️ Tech Stack### Prerequisites

GET /api/health

`````

**Complete documentation**: [API Reference](docs/api/)- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1, Chart.js## 📚 Documentation

## 🧪 Testing- **Backend**: Nitro 2.x, Netlify Functions

```bash- **Data Collection**: Multi-source orchestrator with RSS and Reddit adapters- Node.js 20.x or higher

# Type checking

npm run type-check- **Sentiment Analysis**: sentiment.js library with Dutch healthcare tuning



# Generate test data for local testing (using Netlify CLI)- **Storage**: Netlify Blobs (7-day retention)### For Users & Operators- npm 10.x or higher

netlify functions:invoke generate-test-data --querystring "hours=6"

- **Deployment**: Netlify Edge with scheduled functions

# Test Reddit integration

node test-reddit-api-simple.js- Netlify account (for deployment)

```

## 📰 Data Sources

**Complete testing guide**: [Local Testing](docs/guides/local-testing.md)

- **[Getting Started](docs/guides/getting-started.md)** - Installation and first run

## 🚢 Deployment

### Active Sources

### Netlify (Recommended)

- **[Reddit Integration](docs/guides/reddit-integration.md)** - Configure Reddit as a data source### Installation

1. Connect repository to Netlify

2. Configure environment variables (see `.env.example`)**RSS Feeds** (5 sources):

3. Deploy automatically on push to `main`

- NU.nl Gezondheid - General health news- **[Operations Guide](docs/guides/operations.md)** - Monitoring and maintenance

````bash

# Manual deployment- NOS.nl Algemeen - National broadcaster

netlify deploy --prod

```- Zorgwijzer - Healthcare-specific news- **[Local Testing](docs/guides/local-testing.md)** - Test the application locally```bash



**Pre-deployment validation**: [Deployment Checklist](docs/guides/deployment.md)- RTL Nieuws Algemeen - Commercial broadcaster



## 📊 Project Structure- Zorgkrant - Healthcare industry news# Clone the repository



````

zorg-sentiment-v2/

├── app/ # Nuxt application**Social Media**:### For Developersgit clone <repository-url>

│ ├── components/ # Vue components

│ ├── composables/ # Composition functions- Reddit - Dutch subreddits (r/thenetherlands, r/geldzaken) with keyword filtering

│ ├── pages/ # File-based routing

│ └── types/ # Frontend TypeScript typescd zorg-sentiment-v2

├── server/ # Nitro server

│ ├── api/ # API endpoints**Planned**: Twitter/X integration (stub implemented)

│ ├── config/ # Configuration (sources.json, etc.)

│ ├── utils/ # Adapters, orchestrator, analyzers- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and standards

│ └── types/ # Server TypeScript types

├── netlify/functions/ # Scheduled functions## 🌐 API Endpoints

├── docs/ # Documentation

│ ├── guides/ # User & developer guides- **[Extending Sources](docs/guides/extending-sources.md)** - Add new data source adapters# Install dependencies

│ ├── architecture/ # Technical design docs

│ └── api/ # API specifications```bash

└── specs/ # Feature specifications

```# Get current sentiment with trends- **[Architecture Overview](docs/architecture/multi-source-design.md)** - System design and patternsnpm install



## 🤝 ContributingGET /api/sentiment?include=all



We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:- **[API Reference](docs/api/)** - Endpoint specifications



- Development setup# Get historical data

- Code standards

- Testing requirementsGET /api/sentiment/history?from=2025-01-01&limit=50# Create environment file

- Pull request process



## 📄 License

# Get source metrics### Feature Specificationscp .env.example .env

[Add license information]

GET /api/sentiment/sources

## 🙋 Support

- **[Feature 001: MVP Dashboard](specs/001-mvp-sentiment-dashboard/)** - Core sentiment visualization# Start development server

- **Documentation**: Check [docs/](docs/) directory

- **Issues**: [GitHub Issues](https://github.com/your-org/zorg-sentiment-v2/issues)# Health check

- **Feature Specs**: See [specs/](specs/) for detailed requirements

GET /api/health- **[Feature 002: Multi-Source Collection](specs/002-multi-source-sentiment/)** - Orchestrator and adaptersnpm run dev

---

```

Built with ❤️ for Dutch healthcare transparency

- **[Feature 003: Reddit Integration](specs/003-reddit-integration/)** - Reddit API integration```

**Complete documentation**: [API Reference](docs/api/)

## 🛠️ Tech StackVisit `http://localhost:3000` to see the dashboard.

## 🧪 Testing

- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1, Chart.js### Using Netlify Dev (Recommended for Local Testing)

`````bash

# Type checking- **Backend**: Nitro 2.x, Netlify Functions

npm run type-check

- **Data Collection**: Multi-source orchestrator with RSS and Reddit adapters```bash

# Generate test data for local testing (using Netlify CLI)

netlify functions:invoke generate-test-data --querystring "hours=6"- **Sentiment Analysis**: sentiment.js library with Dutch healthcare tuning# Install Netlify CLI



# Test Reddit integration- **Storage**: Netlify Blobs (7-day retention)npm install -g netlify-cli

node test-reddit-api-simple.js

```- **Deployment**: Netlify Edge with scheduled functions



**Complete testing guide**: [Local Testing](docs/guides/local-testing.md)# Run with Netlify functions support



## 🚢 Deployment## 📰 Data Sourcesnetlify dev



### Netlify (Recommended)````



1. Connect repository to Netlify### Active Sources

2. Configure environment variables (see `.env.example`)

3. Deploy automatically on push to `main`Visit `http://localhost:8888` to test with Netlify functions.



```bash**RSS Feeds** (5 sources):

# Manual deployment

netlify deploy --prod- NU.nl Gezondheid - General health news## 📚 Documentation

`````

- NOS.nl Algemeen - National broadcaster

**Pre-deployment validation**: [Deployment Checklist](docs/deployment-checklist.md)

- Zorgwijzer - Healthcare-specific news### Feature 001: MVP Sentiment Dashboard

## 📊 Project Structure

- RTL Nieuws Algemeen - Commercial broadcaster

```

zorg-sentiment-v2/- Zorgkrant - Healthcare industry news- [Feature Specification](./specs/001-mvp-sentiment-dashboard/spec.md) - Complete feature requirements

├── app/                    # Nuxt application

│   ├── components/        # Vue components- [Implementation Plan](./specs/001-mvp-sentiment-dashboard/plan.md) - Technical architecture and decisions

│   ├── composables/       # Composition functions

│   ├── pages/            # File-based routing**Social Media**:- [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md) - Developer setup and deployment

│   └── types/            # Frontend TypeScript types

├── server/                # Nitro server- Reddit - Dutch subreddits (r/thenetherlands, r/geldzaken) with keyword filtering- [Data Model](./specs/001-mvp-sentiment-dashboard/data-model.md) - Entity definitions and storage schema

│   ├── api/              # API endpoints

│   ├── config/           # Configuration (sources.json, etc.)- [API Contract](./specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml) - OpenAPI specification

│   ├── utils/            # Adapters, orchestrator, analyzers

│   └── types/            # Server TypeScript types**Planned**: Twitter/X integration (stub implemented)

├── netlify/functions/    # Scheduled functions

├── docs/                 # Documentation### Feature 002: Multi-Source Sentiment Collection

│   ├── guides/          # User & developer guides

│   ├── architecture/    # Technical design docs## 🌐 API Endpoints

│   └── api/             # API specifications

└── specs/               # Feature specifications- [Feature Specification](./specs/002-multi-source-sentiment/spec.md) - Multi-source architecture requirements

```

```bash- [Implementation Plan](./specs/002-multi-source-sentiment/plan.md) - Orchestrator pattern and adapter system

## 🤝 Contributing

# Get current sentiment with trends- [Data Model](./specs/002-multi-source-sentiment/data-model.md) - Source configuration and article schema

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:

GET /api/sentiment?include=all- [Extending Sources Guide](./docs/extending-sources.md) - How to add new data source adapters

- Development setup

- Code standards- [Source API Contract](./specs/002-multi-source-sentiment/contracts/sources-api.yaml) - Source metrics API specification

- Testing requirements

- Pull request process# Get historical data



## 📄 LicenseGET /api/sentiment/history?from=2025-01-01&limit=50### Feature 003: Reddit Integration



[Add license information]



## 🙋 Support# Get source metrics- [Feature Specification](./specs/003-reddit-integration/spec.md) - Reddit data source integration requirements



- **Documentation**: Check [docs/](docs/) directoryGET /api/sentiment/sources- [Implementation Plan](./specs/003-reddit-integration/plan.md) - Reddit API integration with snoowrap

- **Issues**: [GitHub Issues](https://github.com/your-org/zorg-sentiment-v2/issues)

- **Feature Specs**: See [specs/](specs/) for detailed requirements- [Data Model](./specs/003-reddit-integration/data-model.md) - Reddit-specific article schema and engagement metrics



---# Health check- [Reddit Integration Guide](./docs/reddit-integration.md) - Configuration and keyword setup



Built with ❤️ for Dutch healthcare transparencyGET /api/health- [Quickstart Guide](./specs/003-reddit-integration/quickstart.md) - Reddit API credentials and local testing


```

## 🛠️ Tech Stack

**Complete documentation**: [API Reference](docs/api/)

- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1

## 🧪 Testing- **Backend**: Nitro 2.x (Nuxt server engine), Netlify Functions

- **Data Collection**: Multi-source orchestrator with RSS, Twitter (planned), Reddit (planned) adapters

````bash- **Sentiment Analysis**: sentiment.js library with custom healthcare-focused tuning

# Type checking- **Charts**: Chart.js with vue-chartjs

npm run type-check- **Storage**: Netlify Blobs (7-day retention with source contribution tracking)

- **Styling**: Tailwind CSS (via Nuxt UI)

# Generate test data for local testing- **Deployment**: Netlify Edge with scheduled functions

curl http://localhost:8888/api/generate-test-data?hours=6

## 📊 Project Structure

# Test Reddit integration

node test-reddit-api-simple.js```

```zorg-sentiment-v2/

├── app/                      # Nuxt application

**Complete testing guide**: [Local Testing](docs/guides/local-testing.md)│   ├── components/          # Vue components (MoodIndicator, TrendChart, etc.)

│   ├── composables/         # Reusable composition functions

## 🚢 Deployment│   ├── pages/              # File-based routing

│   ├── types/              # TypeScript interfaces (API, sentiment)

### Netlify (Recommended)│   └── app.vue             # Root component

├── server/                  # Nitro server (API routes + utilities)

1. Connect repository to Netlify│   ├── api/                # API endpoints (/api/sentiment, /api/sentiment/sources)

2. Configure environment variables (see `.env.example`)│   ├── config/             # Source configurations (RSS feeds, social media)

3. Deploy automatically on push to `main`│   ├── middleware/         # Server middleware (CORS, rate limiting)

│   ├── types/              # Server types (Article, SourceConfiguration, SourceType)

```bash│   └── utils/              # Server utilities (adapters, orchestrator, deduplicator)

# Manual deployment├── netlify/functions/      # Netlify scheduled functions (sentiment collection)

netlify deploy --prod├── docs/                   # Additional documentation

```│   ├── extending-sources.md # Guide for adding new data sources

│   └── architecture/       # Architecture design documents

**Pre-deployment validation**: [Deployment Checklist](docs/deployment-checklist.md)├── specs/                  # Feature specifications

└── public/                 # Static assets

## 📊 Project Structure```



```## 📰 Data Sources

zorg-sentiment-v2/

├── app/                    # Nuxt applicationThe system currently collects sentiment data from multiple Dutch news sources:

│   ├── components/        # Vue components

│   ├── composables/       # Composition functions### Active RSS Feeds

│   ├── pages/            # File-based routing

│   └── types/            # Frontend TypeScript types1. **NU.nl Gezondheid** - General health news

├── server/                # Nitro server2. **NOS.nl Algemeen** - National broadcaster general news

│   ├── api/              # API endpoints3. **Zorgwijzer** - Healthcare-specific news

│   ├── config/           # Configuration (sources.json, etc.)4. **RTL Nieuws Algemeen** - Commercial broadcaster news

│   ├── utils/            # Adapters, orchestrator, analyzers5. **Zorgkrant** - Healthcare industry news

│   └── types/            # Server TypeScript types

├── netlify/functions/    # Scheduled functions### Planned Sources (Future Implementation)

├── docs/                 # Documentation

│   ├── guides/          # User & developer guides- **Twitter/X** - Social media sentiment via TwitterAdapter (stub implemented)

│   ├── architecture/    # Technical design docs

│   └── api/             # API specifications### Active Social Media Sources (Feature 003)

└── specs/               # Feature specifications

```- **Reddit** - Community discussions from Dutch subreddits (r/thenetherlands) with configurable keyword filtering



## 🤝 ContributingThe multi-source architecture uses an **adapter pattern** allowing new sources to be added without modifying core sentiment logic. See [Extending Sources Guide](./docs/extending-sources.md) for implementation details.



We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:### Source Features



- Development setup- **Graceful Degradation**: System continues with available sources if some fail

- Code standards- **Smart Deduplication**: Cross-source duplicate detection (80% similarity threshold)

- Testing requirements- **Parallel Collection**: All sources fetched simultaneously (10s timeout per source)

- Pull request process- **Source Reliability Tracking**: 7-day metrics for each source's success rate

- **Per-Source Limits**: Max 30 articles per source per collection cycle

## 📄 License

## 🌐 API Endpoints

[Add license information]

### `GET /api/sentiment`

## 🙋 Support

Returns current sentiment data with optional trend and summary.

- **Documentation**: Check [docs/](docs/) directory

- **Issues**: [GitHub Issues](https://github.com/your-org/zorg-sentiment-v2/issues)**Query Parameters**:

- **Feature Specs**: See [specs/](specs/) for detailed requirements

- `include` (optional): `trend`, `summary`, or `all`

---

**Example**:

Built with ❤️ for Dutch healthcare transparency

```bash
curl https://your-site.netlify.app/api/sentiment?include=all
````

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
````
