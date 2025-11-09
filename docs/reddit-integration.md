# Reddit Integration Guide

This guide explains how to configure and use Reddit as a data source for sentiment analysis in the Zorg Sentiment Dashboard.

## Overview

The Reddit integration collects healthcare-related discussions from Dutch subreddits using the Reddit API via the `snoowrap` library. Posts are filtered by:

- **Keyword relevance** - Weighted scoring based on Dutch healthcare terms
- **Quality thresholds** - Minimum upvotes and comments
- **Upvote ratio** - Community approval indicator (default: ≥40%)
- **Language detection** - Dutch keyword presence
- **Content length** - Truncated to 2000 characters for consistency

## Reddit API Setup

### 1. Create a Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..."
3. Fill in the form:
   - **name**: `zorg-sentiment-v2` (or your preferred name)
   - **App type**: Select "script"
   - **description**: Optional
   - **about url**: Optional
   - **redirect uri**: `http://localhost:8888` (required but not used for script apps)
4. Click "create app"
5. Note your **client ID** (under the app name) and **client secret**

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=zorg-sentiment-v2:1.0.0 by /u/your_reddit_username
```

**Important**: For "script" type apps, you must use your Reddit username and password (not needed for web apps).

### 3. Add to Netlify Environment Variables

For production deployment:

1. Go to Netlify dashboard → Site settings → Environment variables
2. Add the same three variables:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USER_AGENT`

## Source Configuration

Reddit sources are configured in `server/config/sources.json`:

```json
{
  "id": "reddit-thenetherlands",
  "name": "r/thenetherlands",
  "type": "SOCIAL_REDDIT",
  "url": "https://www.reddit.com/r/thenetherlands",
  "category": "general",
  "isActive": true,
  "maxArticles": 20,
  "timeout": 30000,
  "redditConfig": {
    "subreddit": "thenetherlands",
    "timeWindow": "week",
    "minScore": 5,
    "minComments": 3,
    "maxPosts": 20,
    "includeComments": true,
    "topCommentsCount": 5,
    "minUpvoteRatio": 0.4,
    "maxContentLength": 2000
  }
}
```

### Configuration Options

#### RedditSourceConfig

| Field              | Type                             | Default      | Description                             |
| ------------------ | -------------------------------- | ------------ | --------------------------------------- |
| `subreddit`        | string                           | **required** | Subreddit name without "r/" prefix      |
| `timeWindow`       | `"day"` \| `"week"` \| `"month"` | `"week"`     | Time window for fetching posts          |
| `minScore`         | number                           | `5`          | Minimum upvote score threshold          |
| `minComments`      | number                           | `3`          | Minimum comment count threshold         |
| `maxPosts`         | number                           | `20`         | Maximum posts to fetch before filtering |
| `includeComments`  | boolean                          | `true`       | Include top comments in article content |
| `topCommentsCount` | number                           | `5`          | Number of top comments to include       |
| `minUpvoteRatio`   | number                           | `0.4`        | Minimum upvote ratio (0.0-1.0)          |
| `maxContentLength` | number                           | `2000`       | Maximum content length in characters    |

## Keyword Configuration

Keywords are defined in `server/config/reddit-keywords.json`:

```json
{
  "primary": [
    "zorgverzekering",
    "zorgverzekeraar",
    "eigen risico",
    "zorgtoeslag",
    "zorgkosten"
  ],
  "secondary": ["premie", "huisarts", "ziekenhuis", "zorg"],
  "insurers": ["CZ", "VGZ", "Menzis", "Zilveren Kruis"],
  "filtering": {
    "requirePrimary": false,
    "secondaryBonus": 1,
    "insurerBonus": 1,
    "minimumScore": 1
  }
}
```

### Keyword Types

- **Primary keywords**: Core healthcare insurance terms (e.g., "zorgverzekering")
- **Secondary keywords**: Related healthcare terms (e.g., "zorg", "premie")
- **Insurer keywords**: Dutch insurance company names

### Scoring System

Each post receives a relevance score:

1. **Base score**: 1 point if any primary keyword found
2. **Secondary bonus**: +1 point per secondary keyword (configurable)
3. **Insurer bonus**: +1 point per insurer keyword (configurable)

Posts must meet `minimumScore` threshold (default: 1).

If `requirePrimary` is `true`, posts without primary keywords are rejected immediately.

## Filtering Pipeline

Posts go through multiple filters in sequence:

### 1. Keyword Relevance Filter

- Checks post title and selftext for keywords
- Calculates weighted score based on keyword types
- Rejects if score < `minimumScore`

**Rejection reason**: `notRelevant`

### 2. Quality Threshold Filter

- Checks `score >= minScore` OR `num_comments >= minComments`
- Ensures posts have community engagement

**Rejection reason**: `lowQuality`

### 3. Upvote Ratio Filter

- Checks `upvote_ratio >= minUpvoteRatio`
- Filters out controversial/downvoted content
- Default threshold: 0.4 (40% approval)

**Rejection reason**: `lowUpvoteRatio`

### 4. Dutch Language Detection

- Checks if post contains any Dutch keywords
- Simple presence-based detection
- Filters non-Dutch content

**Rejection reason**: `notDutch`

### 5. Content Length Truncation

- Truncates content to `maxContentLength` characters
- Applied after filtering (doesn't reject posts)
- Ensures consistent storage size

## Engagement Metrics

Reddit posts include engagement statistics in the API response:

```typescript
{
  "sourceId": "reddit-thenetherlands",
  "sourceName": "r/thenetherlands",
  "articlesCollected": 12,
  "engagementStats": {
    "totalUpvotes": 1234,
    "totalComments": 456,
    "avgUpvotes": 103,
    "avgComments": 38,
    "avgUpvoteRatio": 0.78
  }
}
```

Access via `GET /api/sentiment/sources`.

## Rate Limiting

The Reddit API enforces rate limits:

- **60 requests per minute** (enforced by Reddit)
- `snoowrap` automatically queues requests to stay under limit
- Rate limit status tracked in adapter state:
  - `rateLimitRemaining`: Requests remaining in current window
  - `rateLimitResetTime`: When the limit resets

**Graceful degradation**: If Reddit fails, the system continues with RSS sources only.

## Testing

### Local Testing

```bash
# Start development server
netlify dev

# Trigger manual collection (in another terminal)
curl http://localhost:8888/.netlify/functions/collect-sentiment
```

Check logs for:

- `[RedditAdapter] Fetched X posts from r/subreddit`
- `[RedditAdapter] X posts passed filtering`
- `[RedditAdapter] Rejection breakdown: notRelevant=X, lowQuality=X, ...`

### Test Reddit Connection

```bash
# Run the test script
node test-reddit-api.js
```

Expected output:

- Authentication successful
- Posts fetched from configured subreddit
- Keyword filtering applied
- Articles generated

### Validate Filtering

Check the rejection breakdown in logs:

```
[RedditAdapter] Rejection breakdown:
  notRelevant=5,
  lowQuality=3,
  lowUpvoteRatio=2,
  notDutch=1
```

This shows:

- 5 posts rejected for not matching keywords
- 3 posts rejected for low engagement
- 2 posts rejected for low upvote ratio
- 1 post rejected for non-Dutch content

## Troubleshooting

### Authentication Errors

**Error**: `401 Unauthorized` or `403 Forbidden`

**Solutions**:

- Verify `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are correct
- Check app type is "script" (not "web app")
- Ensure `REDDIT_USER_AGENT` follows format: `platform:app_id:version by /u/username`

### No Posts Collected

**Possible causes**:

1. **Keywords too restrictive**: Adjust `minimumScore` or add more secondary keywords
2. **Quality thresholds too high**: Lower `minScore` or `minComments`
3. **Upvote ratio too strict**: Lower `minUpvoteRatio` from 0.4 to 0.3
4. **Subreddit not active**: Try r/thenetherlands or r/zorgverzekeringen

**Debugging**:

- Check rejection breakdown in logs
- Test with `requirePrimary: false` to see if keyword matching is the issue
- Try wider `timeWindow` ("month" instead of "week")

### Rate Limit Errors

**Error**: `429 Too Many Requests`

**Solutions**:

- `snoowrap` should handle this automatically with queuing
- Reduce `maxPosts` in configuration
- Increase collection interval (default: 1 hour)

### Deduplication Issues

If the same post appears multiple times:

1. Check deduplication hash generation in `mapToArticle()`
2. Verify title and content are normalized properly
3. Test cross-source deduplication between Reddit and RSS

## Performance Guidelines

Target performance metrics:

- **Per subreddit**: < 30 seconds
- **Total (3 subreddits)**: < 2 minutes
- **Timeout**: 30 seconds per source (configurable)

Monitor performance in logs:

```
[RedditAdapter] Collected 12 articles in 8234ms
```

If collection takes too long:

- Reduce `maxPosts` (default: 20)
- Reduce `topCommentsCount` (default: 5)
- Set `includeComments: false` to skip comment fetching

## Best Practices

### Keyword Configuration

1. **Start broad**: Use `requirePrimary: false` and `minimumScore: 1`
2. **Monitor rejection stats**: Check which filter rejects most posts
3. **Refine gradually**: Add specific terms based on collected data
4. **Balance quality vs quantity**: Aim for 10-20 posts per subreddit

### Quality Thresholds

1. **Use OR logic**: Post needs high score OR high comments (not both)
2. **Adjust by subreddit**: Active subs can have higher thresholds
3. **Track engagement stats**: Use `/api/sentiment/sources` to monitor
4. **A/B test**: Try different thresholds and compare sentiment quality

### Production Deployment

1. **Set environment variables** in Netlify dashboard
2. **Enable scheduled function**: `collect-sentiment` runs hourly
3. **Monitor error rates**: Check Netlify function logs
4. **Track source reliability**: Use `/api/sentiment/sources` endpoint
5. **Set up alerts**: Notify if Reddit source fails for 72+ hours

## Related Documentation

- [Feature Specification](../specs/003-reddit-integration/spec.md) - Full requirements and user stories
- [Quickstart Guide](../specs/003-reddit-integration/quickstart.md) - 15-minute setup walkthrough
- [Data Model](../specs/003-reddit-integration/data-model.md) - Article schema and engagement metrics
- [Extending Sources](./extending-sources.md) - How to add new source adapters

## Example Sources Configuration

```json
{
  "sources": [
    {
      "id": "reddit-thenetherlands",
      "name": "r/thenetherlands",
      "type": "SOCIAL_REDDIT",
      "url": "https://www.reddit.com/r/thenetherlands",
      "category": "general",
      "isActive": true,
      "redditConfig": {
        "subreddit": "thenetherlands",
        "timeWindow": "week",
        "minScore": 5,
        "minComments": 3,
        "maxPosts": 20,
        "includeComments": true,
        "topCommentsCount": 5,
        "minUpvoteRatio": 0.4,
        "maxContentLength": 2000
      }
    },
    {
      "id": "reddit-zorgverzekeringen",
      "name": "r/geldzaken (zorg)",
      "type": "SOCIAL_REDDIT",
      "url": "https://www.reddit.com/r/geldzaken",
      "category": "healthcare-specific",
      "isActive": true,
      "redditConfig": {
        "subreddit": "geldzaken",
        "timeWindow": "month",
        "minScore": 3,
        "minComments": 2,
        "maxPosts": 15,
        "includeComments": true,
        "topCommentsCount": 3,
        "minUpvoteRatio": 0.3,
        "maxContentLength": 2000
      }
    }
  ]
}
```

## Support

For issues or questions:

1. Check [troubleshooting section](#troubleshooting) above
2. Review [Reddit API documentation](https://www.reddit.com/dev/api)
3. Check [snoowrap documentation](https://not-an-aardvark.github.io/snoowrap/)
4. Open an issue in the repository
