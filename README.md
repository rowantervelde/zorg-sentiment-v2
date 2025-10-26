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
- **Real-Time Updates**: Hourly data collection from Dutch news sources
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

- [Feature Specification](./specs/001-mvp-sentiment-dashboard/spec.md) - Complete feature requirements
- [Implementation Plan](./specs/001-mvp-sentiment-dashboard/plan.md) - Technical architecture and decisions
- [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md) - Developer setup and deployment
- [Data Model](./specs/001-mvp-sentiment-dashboard/data-model.md) - Entity definitions and storage schema
- [API Contract](./specs/001-mvp-sentiment-dashboard/contracts/sentiment-api.yaml) - OpenAPI specification

## 🛠️ Tech Stack

- **Frontend**: Nuxt 4.1.3, Vue 3.5, Nuxt UI v4.1
- **Backend**: Nitro 2.x (Nuxt server engine), Netlify Functions
- **Charts**: Chart.js with vue-chartjs
- **Storage**: Netlify Blobs
- **Styling**: Tailwind CSS (via Nuxt UI)
- **Deployment**: Netlify Edge

## 📊 Project Structure

```
zorg-sentiment-v2/
├── app/                      # Nuxt application
│   ├── components/          # Vue components (MoodIndicator, TrendChart, etc.)
│   ├── composables/         # Reusable composition functions
│   ├── pages/              # File-based routing
│   ├── types/              # TypeScript interfaces
│   └── app.vue             # Root component
├── server/                  # Nitro server (API routes + utilities)
│   ├── api/                # API endpoints (/api/sentiment, /api/health)
│   ├── middleware/         # Server middleware (CORS, rate limiting)
│   └── utils/              # Server utilities (RSS fetcher, sentiment analyzer)
├── netlify/functions/      # Netlify scheduled functions
├── specs/                  # Feature specifications
└── public/                 # Static assets
```

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
