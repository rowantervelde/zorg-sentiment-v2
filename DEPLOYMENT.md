# Quick Deployment Guide - MVP

## Prerequisites

- Netlify account (free tier is sufficient)
- GitHub repository with this code

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git add .
git commit -m "feat: MVP implementation - User Story 1 complete"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Netlify Dashboard (Recommended for MVP)

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and authorize Netlify
4. Select your repository: `zorg-sentiment-v2`
5. Branch: `main`
6. Build settings (should auto-detect from netlify.toml):
   - Build command: `npm run generate`
   - Publish directory: `.output/public`
   - Functions directory: `netlify/functions`
7. Click "Deploy site"

#### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 3. Initial Data Collection

After deployment, trigger the first data collection manually:

```bash
# Replace YOUR_SITE_URL with your Netlify URL
curl -X POST https://YOUR_SITE_URL/.netlify/functions/collect-sentiment
```

Or visit: `https://YOUR_SITE_URL/.netlify/functions/collect-sentiment` in your browser.

### 4. Verify Deployment

1. Visit your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. You should see:
   - Either the "No data available" message (if function hasn't run yet)
   - Or the mood indicator with current sentiment (after manual trigger)

### 5. Setup Hourly Collection

The `collect-sentiment` function is configured to run hourly automatically via Netlify's scheduled functions. This should work out of the box once deployed.

To verify it's scheduled:

1. Go to Netlify Dashboard → Your Site → Functions
2. Click on `collect-sentiment`
3. Check the "Schedule" section - should show "@hourly"

### 6. Monitor Function Logs

To see if data collection is working:

1. Netlify Dashboard → Your Site → Functions → `collect-sentiment`
2. Click "Function logs"
3. Look for successful executions and any errors

## Environment Variables (Optional)

The default values in `nuxt.config.ts` are sufficient for MVP. If you need to customize:

1. Netlify Dashboard → Your Site → Site settings → Environment variables
2. Add any of these (all optional):
   ```
   RSS_FEED_URL=https://www.nu.nl/rss/Gezondheid
   FEED_FETCH_INTERVAL_MINUTES=60
   DATA_RETENTION_DAYS=7
   RATE_LIMIT_REQUESTS_PER_HOUR=20
   ```

## Troubleshooting

### "No data available" persists

- Manually trigger the collection function (step 3)
- Check function logs for errors
- Verify NU.nl RSS feed is accessible: https://www.nu.nl/rss/Gezondheid

### Build fails

- Check Netlify build logs
- Ensure Node.js version is 20.x (set in netlify.toml)
- Verify all dependencies are in package.json

### Function errors

- Check if @netlify/blobs is working (requires Netlify deployment)
- Look for RSS fetch errors in function logs
- Verify sentiment analysis is processing correctly

## Next Steps After Deployment

1. **Test the MVP**:

   - Visit the site on mobile and desktop
   - Verify mood indicator displays correctly
   - Check timestamp updates
   - Test refresh button

2. **Share for Feedback**:

   - Share the Netlify URL with stakeholders
   - Gather feedback on UX and accuracy
   - Note any issues or improvements needed

3. **Plan Next Iteration**:
   - User Story 2: Add trends chart
   - User Story 3: Add breakdown visualization
   - Production hardening (rate limiting, error handling)

## Quick Reference

- **Site URL**: https://YOUR_SITE_NAME.netlify.app
- **Collection Function**: https://YOUR_SITE_NAME.netlify.app/.netlify/functions/collect-sentiment
- **API Endpoint**: https://YOUR_SITE_NAME.netlify.app/api/sentiment
- **Build Time**: ~2-3 minutes
- **Function Execution**: Hourly automatic + manual trigger available

## Support

For detailed documentation, see:

- [README.md](./README.md)
- [Quickstart Guide](./specs/001-mvp-sentiment-dashboard/quickstart.md)
- [Implementation Plan](./specs/001-mvp-sentiment-dashboard/plan.md)
