# Quickstart: Reddit Integration

**Feature Branch**: `003-reddit-integration`  
**Date**: 2025-11-02  
**Estimated Setup Time**: 15 minutes

## Prerequisites

- Node.js 20.x installed
- Reddit account (for API app registration)
- Netlify account (for deployment)
- Git access to repository

## 1. Reddit API Setup (5 minutes)

### Register Reddit App

1. **Go to Reddit App Preferences**:

   - Navigate to https://www.reddit.com/prefs/apps
   - Log in with your Reddit account

2. **Create New Application**:

   - Scroll to bottom and click **"create another app..."**
   - Fill in the form:
     - **name**: `zorg-sentiment-v2` (or your app name)
     - **App type**: Select **"script"** (for application-only OAuth2)
     - **description**: `Dutch healthcare insurance sentiment analysis`
     - **about url**: Leave blank or add your GitHub repo URL
     - **redirect uri**: `http://localhost` (required but not used for client credentials flow)
   - Click **"create app"**

3. **Copy Credentials**:
   - After creation, you'll see your app listed
   - **Client ID**: The string directly under your app name (e.g., `abc123xyz`)
   - **Client Secret**: Click **"edit"** to reveal the secret (e.g., `secretstring123`)
   - **Save these values** - you'll need them for environment variables

### Test API Access (Optional)

```bash
# Test authentication using curl
curl -X POST -d "grant_type=client_credentials" \
  --user "CLIENT_ID:CLIENT_SECRET" \
  https://www.reddit.com/api/v1/access_token

# Expected response:
# {"access_token":"...", "token_type":"bearer", "expires_in":3600, "scope":"*"}
```

---

## 2. Local Development Setup (5 minutes)

### Install Dependencies

```bash
# Navigate to project root
cd c:\git\github\zorg-sentiment-v2

# Install snoowrap package
npm install snoowrap@^1.23.0

# Install dev dependencies (if not already installed)
npm install
```

### Configure Environment Variables

Create `.env` file in project root (if it doesn't exist):

```bash
# .env file
REDDIT_CLIENT_ID=abc123xyz
REDDIT_CLIENT_SECRET=secretstring123
REDDIT_USER_AGENT="zorg-sentiment-v2:1.0.0 by /u/YOUR_REDDIT_USERNAME"
```

**Important**: Replace:

- `abc123xyz` with your actual Reddit Client ID
- `secretstring123` with your actual Reddit Client Secret
- `YOUR_REDDIT_USERNAME` with your Reddit username (e.g., `u/john_doe`)

**Note**: Reddit API requires a descriptive user agent. Format: `platform:app_id:version (by /u/username)`

### Verify Setup

```bash
# Run local development server
npm run dev

# In another terminal, test Reddit adapter
curl http://localhost:3000/api/sentiment/sources

# Expected: Existing RSS sources (Reddit not yet implemented)
```

---

## 3. Implementation Tasks (5 minutes reading)

### File Changes Overview

**Files to Create**:

1. `server/config/reddit-keywords.json` - Dutch healthcare keyword definitions
2. `specs/003-reddit-integration/contracts/sources-api-extension.yaml` - OpenAPI spec for engagement stats

**Files to Modify**:

1. `server/types/source.ts` - Add `SOCIAL_REDDIT` enum value
2. `server/types/sourceConfiguration.ts` - Add `RedditSourceConfig` interface
3. `server/utils/redditAdapter.ts` - Implement `fetchArticles()` and Reddit logic
4. `server/config/sources.json` - Add 3 Reddit source configurations
5. `server/api/sentiment/sources.get.ts` - Add `engagementStats` field calculation

### Quick Implementation Order

1. **Phase 1: Configuration** (10 min)

   - Add `SOCIAL_REDDIT` enum
   - Create `reddit-keywords.json`
   - Add Reddit sources to `sources.json`

2. **Phase 2: Core Logic** (30 min)

   - Implement `RedditAdapter.fetchArticles()`
   - Implement post normalization (text vs link posts)
   - Implement keyword filtering

3. **Phase 3: Comments** (15 min)

   - Implement comment fetching (top 5 by score)
   - Add comments to article content

4. **Phase 4: Error Handling** (15 min)

   - Implement exponential backoff retry
   - Handle 403/404 permanent failures
   - Update adapter state tracking

5. **Phase 5: API Extension** (10 min)
   - Add `engagementStats` calculation to `sources.get.ts`
   - Test source contribution API

**Total Estimated Implementation Time**: 80 minutes

---

## 4. Testing Reddit Integration (Local)

### Manual Test: Fetch Subreddit Posts

Create test file `test-reddit.ts`:

```typescript
// test-reddit.ts
import snoowrap from "snoowrap";

const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  grantType: snoowrap.grantType.CLIENT_CREDENTIALS,
});

async function testFetch() {
  console.log("Fetching r/thenetherlands hot posts...");

  const posts = await r.getSubreddit("thenetherlands").getHot({ limit: 5 });

  posts.forEach((post: any) => {
    console.log("\n---");
    console.log("Title:", post.title);
    console.log("Score:", post.score);
    console.log("Comments:", post.num_comments);
    console.log("URL:", `https://reddit.com${post.permalink}`);
  });
}

testFetch().catch(console.error);
```

Run test:

```bash
npx tsx test-reddit.ts
```

### Manual Test: Keyword Filtering

```typescript
// test-keywords.ts
const keywords = {
  primary: ["zorgverzekering", "eigen risico", "zorgkosten"],
};

function testFiltering() {
  const testPosts = [
    {
      title: "Zorgverzekering 2025 premies",
      selftext: "De premies stijgen...",
    },
    { title: "Wat te doen dit weekend?", selftext: "Leuke tips..." },
    { title: "Eigen risico te hoog", selftext: "Hoe kan ik dit verlagen?" },
  ];

  testPosts.forEach((post) => {
    const text = (post.title + " " + post.selftext).toLowerCase();
    const hasKeyword = keywords.primary.some((kw) =>
      text.includes(kw.toLowerCase())
    );
    console.log(`"${post.title}": ${hasKeyword ? "RELEVANT" : "FILTERED"}`);
  });
}

testFiltering();
```

Expected output:

```
"Zorgverzekering 2025 premies": RELEVANT
"Wat te doen dit weekend?": FILTERED
"Eigen risico te hoog": RELEVANT
```

---

## 5. Netlify Deployment (Once implementation complete)

### Add Environment Variables to Netlify

1. **Go to Netlify Dashboard**:

   - Navigate to your site
   - Go to **Site settings** > **Environment variables**

2. **Add Variables**:

   - `REDDIT_CLIENT_ID` = `abc123xyz`
   - `REDDIT_CLIENT_SECRET` = `secretstring123`
   - `REDDIT_USER_AGENT` = `zorg-sentiment-v2:1.0.0 by /u/YOUR_USERNAME`

3. **Deploy**:

   ```bash
   git add .
   git commit -m "feat: implement Reddit sentiment integration (003)"
   git push origin 003-reddit-integration
   ```

4. **Verify Deployment**:
   - Check Netlify build logs
   - Visit `https://your-site.netlify.app/api/sentiment/sources`
   - Confirm Reddit sources appear with `articleCount > 0`

---

## 6. Common Issues & Solutions

### Issue: "403 Forbidden" Error

**Cause**: Invalid credentials or app not configured correctly  
**Solution**:

1. Verify `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` in `.env`
2. Ensure Reddit app type is "script" (not "web app")
3. Check user agent format matches requirements

### Issue: "429 Rate Limit" Error

**Cause**: Exceeded 60 requests/minute  
**Solution**: Snoowrap automatically handles rate limiting. If error persists:

1. Reduce `maxPosts` in source configuration (default: 20)
2. Ensure not running multiple instances simultaneously
3. Wait 60 seconds and retry

### Issue: No Reddit Posts Collected

**Possible Causes**:

1. Keyword filtering too strict → Check `reddit-keywords.json` for typos
2. Quality threshold too high → Lower `minScore` from 5 to 3
3. Subreddit has no recent posts → Check subreddit activity on Reddit.com

**Debug**:

```typescript
// Add debug logging to redditAdapter.ts
console.log("Fetched posts:", posts.length);
console.log("After keyword filter:", filteredPosts.length);
console.log("After quality filter:", qualifiedPosts.length);
```

### Issue: Comments Not Appearing in Content

**Cause**: `includeComments: false` in config or comment fetch error  
**Solution**:

1. Verify `includeComments: true` in `sources.json`
2. Check `topCommentsCount` is set (default: 5)
3. Ensure comment fetching doesn't exceed rate limit

---

## 7. Next Steps

After successful setup:

1. **Run Full Data Collection**:

   ```bash
   # Trigger collection locally
   curl -X POST http://localhost:3000/api/collect-sentiment
   ```

2. **Verify Data Storage**:

   ```bash
   # Check Netlify Blobs (if deployed)
   # Or check local storage in .netlify/blobs-serve/
   ```

3. **View Sentiment Dashboard**:

   - Navigate to `http://localhost:3000`
   - Confirm sentiment includes Reddit contribution
   - Check source breakdown shows Reddit sources

4. **Monitor Source Health**:
   ```bash
   curl http://localhost:3000/api/sentiment/sources | jq '.sources[] | select(.sourceType == "SOCIAL_REDDIT")'
   ```

---

## Resources

- **Reddit API Documentation**: https://www.reddit.com/dev/api/
- **Snoowrap Documentation**: https://not-an-aardvark.github.io/snoowrap/
- **Feature Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Implementation Tasks**: [tasks.md](./tasks.md) (generated by `/speckit.tasks`)

---

## Quick Reference: Environment Variables

| Variable               | Description          | Example                                  |
| ---------------------- | -------------------- | ---------------------------------------- |
| `REDDIT_CLIENT_ID`     | Reddit app client ID | `abc123xyz`                              |
| `REDDIT_CLIENT_SECRET` | Reddit app secret    | `secretstring123`                        |
| `REDDIT_USER_AGENT`    | User agent string    | `zorg-sentiment-v2:1.0.0 by /u/username` |

---

**Setup Complete!** 🎉

You're now ready to implement Reddit sentiment integration. Start with Phase 1 tasks (configuration files) and proceed through Phase 5 (API extension).

For detailed implementation guidance, see [tasks.md](./tasks.md) (generate with `/speckit.tasks` command).
