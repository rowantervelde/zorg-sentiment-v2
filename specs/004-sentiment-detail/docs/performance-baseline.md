## Performance Baseline & Measurement Plan — Sentiment Detail Page

This document defines measurable performance objectives, test methods, measurement tooling and pass/fail thresholds for the Sentiment Detail page (feature: `004-sentiment-detail`). Use this as the benchmark reference when running perf checks and regressions.

### Performance goals (derived from spec success criteria)
- PB-001: Detail page must load and display article list within 1 second for sources with up to 100 articles (desktop, uncached)
- PB-002: Clicking an article title should open original source URL in a new tab within 500ms (perceived open time)
- PB-003: Back navigation should restore dashboard scroll position in ≥95% of attempts
- PB-004: "Load More" operations (append 20 articles) should complete and render in ≤250ms for repeated loads (desktop)
- PB-005: Page must remain usable on mobile (320px width) with 100 articles, with first meaningful paint <1.5s on 4G

### Measurement setup
- Hardware/OS: Local developer machine or CI runner (record hardware details with each run)
- Browsers: Chrome stable (use Playwright/Chromium), Firefox for cross-checks
- Tools:
  - Playwright for scripted navigation, DOM timing and screenshot capture
  - Lighthouse for lab-style page load and TTI (time-to-interactive)
  - Browser devtools performance timeline or Playwright tracing for waterfall analysis
  - Axe (accessibility) combined with LightHouse for accessibility perf correlation

### Test harness & data
- Use `specs/tests/test-data.json` as the canonical dataset; instrument the dev server or E2E test harness to return this dataset for `/api/sentiment` endpoints
- Create two payloads:
  - Small: 10 articles
  - Large: 100 articles (includes social and RSS mixes, long excerpts)
- For consistent measurement, run with cold cache (clear browser cache before each run) and warm-cache runs for regression analysis

### Network profiles
- Unthrottled (local LAN)
- Fast 4G: RTT 150ms, throughput 10 Mbps down / 3 Mbps up
- Slow 3G: RTT 300ms, throughput 750 Kbps down / 250 Kbps up
- Offline: simulate network down for cache fallback verification (PB-006)

### Measurement procedure
1. Boot a clean browser context
2. Load dashboard
3. Click source card to navigate to detail (measure navigation start → DOMContentLoaded and First Meaningful Paint)
4. Measure time until article list renders (detect presence of article list DOM nodes and first visible article entry)
5. For Perf-2: Click article title and measure time until new tab `document.readyState === 'complete'` or until `window.open` resolved (approximate perceived open time)
6. For back navigation: From detail, navigate back and measure restored scrollTop vs saved
7. For "Load More": Click N times and measure render latency and CPU spikes
8. Repeat across network profiles and average over N=10 runs for each condition

### Pass / Fail thresholds
- PASS if measured median <= target and 90th percentile <= 2× target for critical metrics
  - Example: PB-001 median ≤ 1s and 90th ≤ 2s
- FAIL if median exceeds target

### Observability & instrumentation
- Add test-only debug timings in the client (optional) to surface fetch start, fetch end, DOM render complete timestamps
- Collect CPU and memory usage during large renders using Playwright metrics

### Reporting
- For each run capture:
  - Machine: CPU, RAM
  - Browser & version
  - Network profile
  - Dataset (small/large)
  - Metrics: FMP (first meaningful paint), TTFB, TTI, DOMContentLoaded, time-to-first-article, time-to-open-article, back-restore time
  - Screenshots at key moments
- Store results as JSON in `specs/docs/perf-results/<timestamp>.json` for comparisons

### Regression strategy
- Run perf suite on merges to `main` or release branch
- If a regression exceeds 20% of baseline median, create a performance ticket and block merge until triaged

### Notes & caveats
- The 1s load target assumes no heavy third-party scripts; if additional integrations are added, re-baseline
- Measuring "open original URL within 500ms" is environment-dependent; treat this as perceived target (network to external origin excluded for test harness - best tested by verifying `window.open` returned quickly and browser UI responded)
- Accessibility checks are separate but should be run in the same pipeline to detect regressions correlated with DOM structure changes

### Quick checklist to run baseline locally (Playwright recommended)
- Ensure dev server or preview is running and API endpoint returns `specs/tests/test-data.json`
- Run Playwright script (example):
  - Create a clean context, emulate network profile, navigate to dashboard, click source, measure timings
- Record metrics to `specs/docs/perf-results`

