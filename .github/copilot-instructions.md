# Zorg Sentiment Dashboard - Copilot Instructions

## Project Overview

**Zorg Sentiment Dashboard** is a web application that visualizes real-time public sentiment about Dutch healthcare insurance. It collects data from multiple sources (RSS feeds, Reddit, planned: Twitter/X) and provides an interactive "national mood" indicator.

**Purpose**: Make healthcare insurance discussions more engaging and human through humor, data visualization, and storytelling. The app demonstrates how multiple open APIs can combine to create engaging insights from complex, regulated domains.

**Key Features**:
- Real-time sentiment analysis of Dutch healthcare discussions
- Multi-source data collection (RSS feeds, Reddit)
- Visual mood indicators and trend charts
- Historical sentiment tracking (7-day retention)
- Source reliability metrics and contribution tracking

## Technology Stack

### Frontend
- **Framework**: Nuxt 4.1.3 (Vue 3.5)
- **UI Library**: Nuxt UI v4.1
- **Styling**: Tailwind CSS (via Nuxt UI)
- **Charts**: Chart.js with vue-chartjs
- **Language**: TypeScript 5.9

### Backend
- **Server**: Nitro 2.x (Nuxt server engine)
- **Runtime**: Node.js 20.x
- **Deployment**: Netlify Edge Functions with scheduled functions
- **Storage**: Netlify Blob Storage (7-day retention) with file-based JSON fallback

### Data Collection & Analysis
- **Sentiment Analysis**: sentiment.js library (v5.0.2) with custom healthcare-focused tuning
- **RSS Sources**: NU.nl, NOS.nl, Zorgwijzer, RTL Nieuws, Zorgkrant
- **Reddit Integration**: snoowrap (v1.23.0) for r/thenetherlands with keyword filtering
- **Multi-Source Pattern**: Adapter pattern with orchestrator for extensibility

## Project Structure

```
zorg-sentiment-v2/
├── app/                      # Nuxt application (frontend)
│   ├── components/          # Vue components (MoodIndicator, TrendChart, etc.)
│   ├── composables/         # Reusable composition functions
│   ├── pages/              # File-based routing
│   ├── types/              # Frontend TypeScript interfaces
│   └── app.vue             # Root component
├── server/                  # Nitro server (backend)
│   ├── api/                # API endpoints (/api/sentiment, /api/sentiment/sources)
│   ├── config/             # Source configurations (RSS feeds, social media)
│   ├── middleware/         # Server middleware (CORS, rate limiting)
│   ├── types/              # Server TypeScript types
│   └── utils/              # Server utilities (adapters, orchestrator, deduplicator)
├── netlify/functions/      # Netlify scheduled functions (sentiment collection)
├── docs/                   # Documentation
│   ├── guides/            # User & developer guides
│   ├── architecture/      # Architecture design documents
│   └── api/               # API specifications
├── specs/                  # Feature specifications (spec-driven development)
│   ├── 001-mvp-sentiment-dashboard/
│   ├── 002-multi-source-sentiment/
│   └── 003-reddit-integration/
└── public/                 # Static assets
```

## Development Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)
netlify dev             # Start with Netlify features (http://localhost:8888)

# Build & Deploy
npm run build           # Build for production
npm run preview         # Preview production build
netlify deploy --prod   # Deploy to production

# Type Checking
npx nuxt typecheck      # Run TypeScript type checking

# Testing
netlify functions:invoke generate-test-data --querystring "hours=6"  # Generate test data
node test-reddit-api-simple.js                                       # Test Reddit integration
```

## Code Standards

### TypeScript

- **REQUIRED**: Use TypeScript for all new files (.ts, .vue with lang="ts")
- **REQUIRED**: Enable strict mode (already configured in tsconfig.json)
- **REQUIRED**: Provide explicit types for function parameters and return values
- **REQUIRED**: Use interfaces over type aliases for object shapes
- **AVOID**: `any` type - use `unknown` and type guards instead

**Example**:
```typescript
// ✅ Good
export async function fetchArticles(
  config: SourceConfiguration
): Promise<Article[]> {
  // ...
}

// ❌ Bad
export async function fetchArticles(config: any): Promise<any> {
  // ...
}
```

### Vue Components

- **REQUIRED**: Use `<script setup lang="ts">` syntax for all components
- **REQUIRED**: Define props with TypeScript interfaces
- **RECOMMENDED**: Extract shared logic to composables
- **REQUIRED**: Use component naming: PascalCase for files (e.g., `MoodIndicator.vue`)

**Example**:
```vue
<script setup lang="ts">
import type { SentimentData } from "~/types/sentiment";

interface Props {
  data: SentimentData;
}

const props = defineProps<Props>();
</script>
```

### Server Code (Nitro)

- **REQUIRED**: Use `async/await` over callbacks
- **REQUIRED**: Proper error handling with try/catch blocks
- **REQUIRED**: Use composable utilities from `server/utils/`
- **REQUIRED**: Return standardized error responses
- **RECOMMENDED**: Disable pagers in git commands (`git --no-pager`)

**Example**:
```typescript
export default defineEventHandler(async (event) => {
  try {
    const data = await getData();
    return { success: true, data };
  } catch (error) {
    return createErrorResponse(error, "FETCH_ERROR");
  }
});
```

### Naming Conventions

- **Components**: PascalCase (`MoodIndicator.vue`)
- **Composables**: camelCase with `use` prefix (`useSentiment.ts`)
- **Utils**: camelCase (`sentimentAnalyzer.ts`)
- **Types/Interfaces**: PascalCase (`SentimentData`, `SourceConfiguration`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ARTICLES`, `DEFAULT_TIMEOUT`)
- **API Routes**: kebab-case with RESTful patterns (`/api/sentiment/history`)

### File Organization

- **Group** related functionality in directories
- **Single responsibility**: Keep files focused and single-purpose
- **Barrel exports**: Use `index.ts` for public APIs
- **Co-locate**: Keep types with implementation when specific to that module

## Architecture Patterns

### Multi-Source Data Collection

The app uses an **adapter pattern** for data sources:

1. **SourceAdapter Interface**: All sources implement a common interface
2. **Orchestrator**: Coordinates parallel data collection with timeouts
3. **Deduplicator**: Removes cross-source duplicates (80% similarity threshold)
4. **Source Types**: `rss`, `twitter`, `reddit` (see `server/types/source.ts`)

**When adding a new source**:
1. Implement `SourceAdapter` interface in `server/utils/adapters/`
2. Register in orchestrator (`server/utils/orchestrator.ts`)
3. Configure in `server/config/sources.json`
4. See `docs/guides/extending-sources.md` for complete guide

### Data Storage

- **Primary**: Netlify Blob Storage (7-day retention)
- **Fallback**: File-based JSON storage
- **Schema**: See `server/types/` for data models
- **Limits**: Max 30 articles per source per collection cycle

## Testing Requirements

### Manual Testing Checklist

Before submitting PR:
- [ ] Homepage loads without errors at http://localhost:8888
- [ ] API endpoints return valid responses:
  - `GET /api/sentiment?include=all`
  - `GET /api/sentiment/history?limit=10`
  - `GET /api/sentiment/sources`
  - `GET /api/health`
- [ ] TypeScript compiles without errors (`npx nuxt typecheck`)
- [ ] No console errors in browser devtools
- [ ] Mobile responsive design works
- [ ] Error states display properly (no data, stale data warnings)
- [ ] Trend charts render correctly with test data

### Generate Test Data

```bash
# Using Netlify CLI (recommended)
netlify functions:invoke generate-test-data --querystring "hours=6"

# Or via HTTP
curl http://localhost:8888/api/generate-test-data?hours=6
```

### Integration Testing

For Reddit integration:
```bash
# Configure .env with Reddit credentials first
node test-reddit-api-simple.js
```

## Documentation Requirements

### When to Update Documentation

- **REQUIRED** when adding new features: Create/update spec in `specs/`
- **REQUIRED** when adding new API endpoints: Update API docs in `docs/api/`
- **REQUIRED** when changing data models: Update `data-model.md` in feature spec
- **REQUIRED** when adding new data sources: Update `docs/guides/extending-sources.md`
- **RECOMMENDED** for significant architecture changes: Update `docs/architecture/`

### Specification-Driven Development

All new features follow this process:

1. Create spec document in `specs/[feature-number]/spec.md`
2. Define data model in `specs/[feature-number]/data-model.md`
3. Create implementation plan in `specs/[feature-number]/plan.md`
4. Break down into tasks in `specs/[feature-number]/tasks.md`
5. Implement following the plan
6. Update documentation

## Commit Message Format

Follow conventional commits:

```
feat: add Reddit integration with keyword filtering
fix: resolve sentiment calculation bug in negative threshold
docs: update API documentation for /sources endpoint
refactor: extract deduplication logic to utility
test: add validation for RSS adapter
chore: update dependencies to latest Nuxt 4.1.3
```

## Important Constraints

### Rate Limiting
- API endpoints: 20 requests/hour per IP (strict, may impact shared IPs)
- Sentiment collection: Hourly scheduled function
- Per-source timeout: 10 seconds maximum

### Performance
- Target: Lighthouse score >90
- Frontend bundle: Keep minimal, lazy-load charts
- API response time: <500ms for sentiment endpoints

### Data Freshness
- Display warning if data is >24 hours old
- Collection cycle: Every hour via Netlify scheduled function
- Retention: 7 days in Blob Storage

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
# Optional: Override default trend window
NUXT_TREND_WINDOW_HOURS=6

# Reddit Integration (Feature 003)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=zorg-sentiment:v1.0.0
```

## Common Patterns

### Error Handling
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error("Operation failed:", error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : "Unknown error" 
  };
}
```

### API Response Format
```typescript
// Success
{ success: true, data: { /* ... */ } }

// Error
{ success: false, error: "Error message", code: "ERROR_CODE" }
```

### Component Composition
```typescript
// Prefer composables for shared logic
const { sentiment, loading, error } = useSentiment();

// Over mixins or global state
```

## Validation Checklist

Before finalizing any change:

1. **Type Safety**: Run `npx nuxt typecheck` - no errors
2. **Functionality**: Test locally with `netlify dev`
3. **API Contracts**: Verify endpoints match specs in `docs/api/`
4. **Mobile**: Test responsive design on mobile viewport
5. **Performance**: Check bundle size, no unnecessary dependencies
6. **Documentation**: Update relevant docs if API/architecture changed
7. **Deploy Preview**: Verify Netlify deploy preview builds successfully

## Getting Help

- **Documentation**: Check `docs/` directory first
- **Feature Specs**: See `specs/` for detailed feature requirements
- **Contributing Guide**: See `CONTRIBUTING.md` for full development workflow
- **Architecture**: See `docs/architecture/` for design decisions

## Recent Changes
- 003-reddit-integration: Added Reddit integration with snoowrap@^1.23.0
- 002-multi-source-sentiment: Added multi-source orchestrator pattern
- 001-mvp-sentiment-dashboard: Initial MVP with sentiment dashboard

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
