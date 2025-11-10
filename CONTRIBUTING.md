# Contributing to Zorg Sentiment Dashboard

Thank you for your interest in contributing! This document provides guidelines and workflows for developers.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Standards](#code-standards)
- [Submitting Changes](#submitting-changes)

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Netlify CLI: `npm install -g netlify-cli`
- Netlify account (for deployment testing)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd zorg-sentiment-v2

# Install dependencies
npm install

# Start development server with Netlify features
netlify dev
```

Visit http://localhost:8888 to see the dashboard.

### Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Configure for local testing (optional)
NUXT_TREND_WINDOW_HOURS=6  # Show 6-hour trends instead of 7-day
```

For Reddit integration, see [docs/guides/reddit-integration.md](docs/guides/reddit-integration.md).

## Project Structure

```
zorg-sentiment-v2/
├── app/                    # Nuxt application
│   ├── components/        # Vue components
│   ├── composables/       # Composition functions
│   ├── pages/            # File-based routing
│   └── types/            # TypeScript types
├── server/                # Nitro server
│   ├── api/              # API endpoints
│   ├── config/           # Configuration files
│   ├── middleware/       # Server middleware
│   ├── types/            # Server types
│   └── utils/            # Server utilities
├── netlify/functions/    # Netlify scheduled functions
├── docs/                 # Documentation
│   ├── guides/          # User/developer guides
│   ├── architecture/    # Technical design docs
│   └── api/             # API specifications
└── specs/               # Feature specifications
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the [Code Standards](#code-standards) below.

### 3. Test Locally

```bash
# Start dev server
netlify dev

# In another terminal, test endpoints
curl http://localhost:8888/api/sentiment

# Trigger sentiment collection
curl http://localhost:8888/.netlify/functions/collect-sentiment
```

### 4. Run Type Checking

```bash
npm run type-check
```

### 5. Create Pull Request

Push your branch and create a PR on GitHub. Netlify will automatically create a Deploy Preview.

## Testing

### Local Testing

See [docs/guides/local-testing.md](docs/guides/local-testing.md) for comprehensive testing guide.

**Quick test checklist:**

```bash
# 1. Test API endpoints
curl http://localhost:8888/api/sentiment
curl http://localhost:8888/api/sentiment/history?limit=10
curl http://localhost:8888/api/sentiment/sources

# 2. Generate test data for trends (using Netlify CLI)
netlify functions:invoke generate-test-data --querystring "hours=6"

# 3. Test health endpoint
curl http://localhost:8888/api/health
```

### Test Utilities

#### Generate Test Data

```bash
# Using Netlify CLI (recommended)
netlify functions:invoke generate-test-data --querystring "hours=6"

# Alternative: Direct HTTP call
curl http://localhost:8888/api/generate-test-data?hours=6

# Alternative: Directly with Node
node scripts/generate-test-data.ts
```

#### Test Reddit Integration

```bash
# Configure Reddit credentials in .env first
node test-reddit-api-simple.js
```

### Testing Checklist

Before submitting a PR:

- [ ] Homepage loads without errors
- [ ] API endpoints return valid responses
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Error states display properly

## Code Standards

### TypeScript

- Enable strict mode in `tsconfig.json`
- Provide explicit types for function parameters and return values
- Use interfaces over type aliases for object shapes
- Avoid `any` type - use `unknown` and type guards instead

**Example:**

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

- Use `<script setup>` syntax
- TypeScript for all components
- Composables for shared logic
- Props with types defined

**Example:**

```vue
<script setup lang="ts">
import type { SentimentData } from "~/types/sentiment";

interface Props {
  data: SentimentData;
}

const props = defineProps<Props>();
</script>
```

### Server Code

- Async/await over callbacks
- Proper error handling with try/catch
- Use composable utilities from `server/utils/`
- Return standardized error responses

**Example:**

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
- **Types**: PascalCase (`SentimentData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ARTICLES`)

### File Organization

- Group related functionality in directories
- Keep files focused and single-purpose
- Use barrel exports (`index.ts`) for public APIs
- Co-locate types with implementation

## Submitting Changes

### Commit Messages

Follow conventional commits format:

```
feat: add Reddit integration
fix: resolve deduplication bug
docs: update API documentation
refactor: extract sentiment logic
test: add unit tests for analyzer
chore: update dependencies
```

### Pull Request Process

1. **Create descriptive PR title** using conventional commits format
2. **Fill out PR template** with:
   - What changed
   - Why it changed
   - Testing performed
   - Screenshots (for UI changes)
3. **Link related issues** if applicable
4. **Request review** from team members
5. **Verify Deploy Preview** passes checklist
6. **Address review feedback**
7. **Squash and merge** when approved

### Deploy Preview Checklist

See [docs/deployment-checklist.md](docs/deployment-checklist.md) for comprehensive validation.

**Essential checks:**

- [ ] Build succeeds without errors
- [ ] Homepage loads successfully
- [ ] API endpoints work correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable (Lighthouse >90)

## Adding New Features

### Specification-Driven Development

All new features should follow the specification process:

1. **Create spec document** in `specs/[feature-number]/spec.md`
2. **Define data model** in `specs/[feature-number]/data-model.md`
3. **Create implementation plan** in `specs/[feature-number]/plan.md`
4. **Break down into tasks** in `specs/[feature-number]/tasks.md`
5. **Implement following plan**
6. **Update documentation**

### Adding a New Data Source

See [docs/guides/extending-sources.md](docs/guides/extending-sources.md) for complete guide.

**Quick overview:**

1. Implement `SourceAdapter` interface
2. Add source type to enum
3. Register adapter in orchestrator
4. Configure source in `sources.json`
5. Test with local collection

## Getting Help

- **Documentation**: Check `docs/` directory first
- **Feature Specs**: See `specs/` for feature details
- **API Docs**: See `docs/api/` for endpoint specifications
- **Issues**: Search existing GitHub issues
- **Questions**: Open a GitHub discussion

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
