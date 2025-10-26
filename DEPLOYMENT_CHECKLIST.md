# Deployment Preview Validation Checklist

**Purpose**: Ensure quality and completeness before merging to production  
**When to use**: For every Deploy Preview created by Netlify (pull requests, feature branches)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All TypeScript compilation errors resolved
- [ ] No console errors in browser DevTools
- [ ] ESLint/Prettier checks pass (if configured)
- [ ] Git branch is up to date with base branch

### Build Verification

- [ ] Netlify build succeeds without warnings
- [ ] Build time is reasonable (<5 minutes for MVP)
- [ ] No missing dependencies or module errors
- [ ] Environment variables are set correctly in Netlify dashboard

---

## User Story Validation

### User Story 1: View Current National Mood (P1) - MVP

- [ ] **Homepage loads successfully** within 3 seconds
- [ ] **Mood indicator displays** with correct emoji (😊/😐/😟)
- [ ] **Dutch summary text** appears below mood indicator
- [ ] **Sentiment breakdown** shows percentages (positive/neutral/negative)
- [ ] **Breakdown colors** match mood (green/gray/red)
- [ ] **Dominant sentiment** (>70%) is visually emphasized
- [ ] **Timestamp** shows when data was last updated
- [ ] **"No data" message** displays when no data exists (test with empty Blob storage)
- [ ] **Stale data warning** appears when data >24 hours old

### User Story 2: See Sentiment Trends (P2)

- [ ] **Trend chart displays** below mood indicator
- [ ] **Chart shows 7-day historical data** (or available data if <7 days)
- [ ] **X-axis labels** show dates/times clearly
- [ ] **Y-axis** shows sentiment scale (-100 to +100)
- [ ] **Hover/tap interaction** shows tooltip with date + sentiment value
- [ ] **Notable changes** (>20% swing) are highlighted with different colors
- [ ] **Data gaps** (missing hours) are indicated clearly, not interpolated
- [ ] **"Building history" message** appears when <7 days of data available

---

## Responsive Design Validation (RD-001, RD-002, RD-003)

### Mobile (<768px)

- [ ] Test on **iPhone SE (375px)** - all content visible, no horizontal scroll
- [ ] Test on **Android (360px)** - all content visible, no horizontal scroll
- [ ] **Mood emoji scales down** to 80px on mobile
- [ ] **Breakdown percentages** stack vertically or wrap properly
- [ ] **Chart is readable** and interactive on mobile (touch works)
- [ ] **Typography sizes** are readable (min 16px for body text)
- [ ] **Touch targets** are at least 44x44px (buttons, interactive elements)

### Desktop (≥768px)

- [ ] Test on **1920x1080 (desktop)** - content is centered, max-width applied
- [ ] **Mood emoji scales up** to 120px on desktop
- [ ] **Chart is wide enough** to show all data points without crowding
- [ ] **Hover interactions** work smoothly (tooltips, color changes)

---

## Accessibility Validation (A11Y-001 to A11Y-004)

### Semantic HTML & ARIA

- [ ] **Mood emoji has ARIA label** (e.g., "Positieve stemming: blij gezicht emoji")
- [ ] **Chart has descriptive title** and accessible labels
- [ ] **All images/icons have alt text** or aria-label attributes
- [ ] **Keyboard navigation works**: Tab through all interactive elements
- [ ] **Focus indicators** are visible (not removed with CSS)
- [ ] **Screen reader test**: Use VoiceOver (macOS) or NVDA (Windows)

### Color Contrast (A11Y-003)

- [ ] **Text contrast ratio** ≥4.5:1 (WCAG AA) - test with browser DevTools
- [ ] **Mood colors** (green/gray/red) have sufficient contrast against backgrounds
- [ ] **Chart text** (axis labels, tooltips) is readable

---

## Performance Validation (SC-006, SC-006a)

### Lighthouse Audit (T072)

- [ ] **Performance score** ≥90
- [ ] **Accessibility score** ≥95
- [ ] **Best Practices score** ≥90
- [ ] **SEO score** ≥90
- [ ] **First Contentful Paint (FCP)** <1.5s
- [ ] **Largest Contentful Paint (LCP)** <2.5s
- [ ] **Time to Interactive (TTI)** <3.0s
- [ ] **Total Blocking Time (TBT)** <200ms

Run Lighthouse:

```bash
npx lighthouse https://deploy-preview-[PR-NUMBER]--zorg-sentiment.netlify.app --view
```

### Network Performance

- [ ] **API response time** <200ms (p95) - check Network tab
- [ ] **Chart.js bundle size** is optimized (lazy-loaded if possible)
- [ ] **No unnecessary API calls** (check for duplicate requests)
- [ ] **CDN caching works**: Second page load faster than first

### Load Testing (T075)

- [ ] **100 concurrent users**: Use [Loader.io](https://loader.io/) or similar
- [ ] **Response time stays <3s** under load
- [ ] **No 500 errors** under concurrent load

---

## API Validation

### `/api/sentiment` Endpoint

- [ ] **Returns current data** with 200 status
- [ ] **Query parameter `?include=trend`** returns trend data
- [ ] **Query parameter `?include=all`** returns all data (current + trend + summary)
- [ ] **Cache headers** set correctly (5 min max-age)
- [ ] **CORS headers** present (if external API access needed)

### `/api/sentiment/history` Endpoint (T061)

- [ ] **Returns 200** with valid data
- [ ] **Query parameter `?from=2025-10-20T00:00:00Z`** filters correctly
- [ ] **Query parameter `?to=2025-10-24T23:59:59Z`** filters correctly
- [ ] **Query parameter `?limit=50`** limits results correctly
- [ ] **Invalid date formats** return 400 error
- [ ] **Date range validation** works (from < to)

### `/api/health` Endpoint (T062)

- [ ] **Returns 200** with health status
- [ ] **Shows data source status** (operational/degraded/failed)
- [ ] **Shows data age** in seconds
- [ ] **Shows `isStale` flag** when data >24 hours old
- [ ] **No caching** (Cache-Control: no-cache)

---

## Rate Limiting Validation (FR-010a, T078)

### Client-Side Rate Limiting

- [ ] **429 response** after 20 requests in 1 hour (test with curl or Postman)
- [ ] **Retry-After header** included in 429 response
- [ ] **Friendly error message** shown in UI: "Snelheidsbeperking bereikt"
- [ ] **Retry countdown** displayed to user (if implemented)

Test with:

```bash
# Make 21 requests rapidly
for i in {1..21}; do curl -i https://deploy-preview-[PR-NUMBER]--zorg-sentiment.netlify.app/api/sentiment; done
```

---

## Edge Cases & Error Handling

### No Data State (T030)

- [ ] **Homepage shows friendly message** when no data in Blob storage
- [ ] **No console errors** when data is missing
- [ ] **User can refresh** and see new data if collection succeeds

### Stale Data (FR-008a, T053, T054)

- [ ] **Warning appears** when data >24 hours old
- [ ] **Warning message is clear**: "Data is X dagen oud"
- [ ] **Warning is prominent** (yellow alert with icon)

### Data Gaps (T041)

- [ ] **Chart shows gaps clearly** (not interpolated)
- [ ] **Tooltip indicates missing data** when hovering over gaps
- [ ] **No visual artifacts** from missing data points

### Extreme Values (T076)

- [ ] **100% positive sentiment** displays correctly (no overflow)
- [ ] **0% positive (100% negative)** displays correctly
- [ ] **Exactly 60% threshold** classified correctly (positive or negative)

### API Downtime (FR-008, T056)

- [ ] **Last known data shown** when API fails
- [ ] **Error message displayed** to user
- [ ] **Retry mechanism works** (user can refresh)

---

## Scheduled Function Validation

### Netlify Function: `collect-sentiment`

- [ ] **Function deploys successfully** to Netlify
- [ ] **Cron schedule** is active (@hourly) - check Netlify Functions dashboard
- [ ] **Manual trigger works**: Test via Netlify dashboard or curl
- [ ] **Function completes in <10s** (check Netlify logs)
- [ ] **Data is saved to Blob storage** after collection
- [ ] **7-day retention cleanup works** (old data points removed)
- [ ] **Error handling logs failures** to Netlify logs

Test manual trigger:

```bash
curl -X POST https://deploy-preview-[PR-NUMBER]--zorg-sentiment.netlify.app/.netlify/functions/collect-sentiment
```

---

## Dutch Language & UX (VD-004, VD-004a, T069)

### Content Quality

- [ ] **All UI text is in Dutch** (no English remnants)
- [ ] **Tone is friendly and warm** (not clinical or robotic)
- [ ] **Grammar is correct** (no typos or awkward phrasing)
- [ ] **Emoji usage is appropriate** (😊/😐/😟 match sentiment)

### Playful Design (VD-004, T070)

- [ ] **Color palette is bright and accessible** (green, gray, red per VD-003)
- [ ] **Typography is readable** (Inter or similar sans-serif)
- [ ] **Spacing is generous** (not cramped or cluttered)
- [ ] **Animations are smooth** (mood indicator hover, chart interactions)

---

## SEO & Social Sharing (T068)

### Meta Tags

- [ ] **Page title** is descriptive: "Zorg Sentiment - Hoe voelt Nederland zich..."
- [ ] **Meta description** is compelling (150-160 chars)
- [ ] **Open Graph tags** present (og:title, og:description, og:image)
- [ ] **Twitter Card tags** present (twitter:card, twitter:title)
- [ ] **Canonical URL** set correctly
- [ ] **Language attribute** set to Dutch (lang="nl")

Test with:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Icons & Branding (T073)

- [ ] **Favicon appears** in browser tab (check favicon.ico)
- [ ] **Apple touch icon** present for iOS (apple-touch-icon.png)
- [ ] **Logo/icon is visible** in social share previews

---

## Browser Compatibility

### Desktop Browsers

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): All features work (especially Chart.js)
- [ ] **Edge** (latest): All features work

### Mobile Browsers

- [ ] **iOS Safari** (latest): Touch interactions, responsive design
- [ ] **Chrome Android** (latest): Touch interactions, responsive design

---

## Security & Privacy

### Data Handling

- [ ] **No sensitive data** in console logs
- [ ] **No PII (Personal Identifiable Information)** collected or stored
- [ ] **API keys** not exposed in client-side code
- [ ] **Environment variables** properly configured (not hardcoded)

### HTTPS & Headers

- [ ] **HTTPS enabled** (Netlify provides SSL by default)
- [ ] **Security headers** present (check with [securityheaders.com](https://securityheaders.com/))

---

## Final Checks Before Merge

- [ ] **All above validation items passed** (or documented exceptions)
- [ ] **Deploy Preview URL tested** by at least one other person
- [ ] **No regressions** from previous Deploy Previews
- [ ] **Git commit messages are clear** and follow convention
- [ ] **Pull request description** includes:
  - What was changed
  - Why it was changed
  - Testing performed
  - Screenshots (if UI changes)
- [ ] **Code review approved** by team member (if applicable)
- [ ] **tasks.md updated** with completed tasks marked [X]

---

## Post-Merge Validation (Production)

After merge to `main` and production deployment:

- [ ] **Production URL loads successfully**
- [ ] **Smoke test all User Stories** (US1, US2)
- [ ] **Check Netlify Analytics** for any errors
- [ ] **Monitor scheduled function** for successful hourly runs
- [ ] **Verify Blob storage** is working (data persists across function runs)

---

## Quick Test Script

```bash
#!/bin/bash
# Quick validation script for Deploy Preview

DEPLOY_URL="https://deploy-preview-[PR-NUMBER]--zorg-sentiment.netlify.app"

echo "Testing Deploy Preview: $DEPLOY_URL"

# Test homepage
echo "1. Testing homepage..."
curl -I "$DEPLOY_URL" | grep "200 OK"

# Test API endpoints
echo "2. Testing /api/sentiment..."
curl -s "$DEPLOY_URL/api/sentiment" | jq .current.moodClassification

echo "3. Testing /api/health..."
curl -s "$DEPLOY_URL/api/health" | jq .status

echo "4. Testing /api/sentiment/history..."
curl -s "$DEPLOY_URL/api/sentiment/history?limit=5" | jq .count

echo "✅ API tests complete!"

# Lighthouse audit
echo "5. Running Lighthouse audit..."
npx lighthouse "$DEPLOY_URL" --only-categories=performance,accessibility --quiet --chrome-flags="--headless"

echo "✅ Deploy Preview validation complete!"
```

---

## Troubleshooting Common Issues

### Issue: Deploy Preview build fails

- Check Netlify build logs for errors
- Verify all dependencies are in package.json
- Ensure Node version matches (20.x)

### Issue: Functions don't work in Deploy Preview

- Check Netlify Functions tab for logs
- Verify environment variables are set for Deploy Previews
- Test function manually via Netlify dashboard

### Issue: Blob storage not working

- Ensure `@netlify/blobs` is installed
- Check Netlify logs for Blob API errors
- Verify Deploy Preview has access to Blob stores

### Issue: Rate limiting not working

- Check if IP address is being captured correctly
- Verify middleware is loaded (check Nitro logs)
- Test with different IP addresses (use VPN or proxy)

---

**Last Updated**: 2025-10-26  
**For questions**: See [quickstart.md](../specs/001-mvp-sentiment-dashboard/quickstart.md)
