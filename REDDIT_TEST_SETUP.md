# Reddit API Testing Setup Guide

## Step 1: Create Reddit App

1. **Go to Reddit App Preferences**

   - Visit: https://www.reddit.com/prefs/apps
   - Log in with your Reddit account

2. **Create New App**

   - Scroll to bottom and click **"create another app..."**
   - Fill in the form:
     ```
     name: zorg-sentiment-v2
     App type: ☑ script (important!)
     description: Dutch healthcare sentiment analysis
     about url: (leave blank or add GitHub repo)
     redirect uri: http://localhost
     ```
   - Click **"create app"**

3. **Copy Your Credentials**
   - **Client ID**: The string directly under your app name (e.g., `abc123xyz`)
   - **Client Secret**: Click "edit" to reveal the secret (e.g., `secretstring123`)

## Step 2: Configure Environment

1. **Create .env file**

   ```powershell
   copy .env.example .env
   ```

2. **Edit .env file** and add your credentials:

   ```bash
   REDDIT_CLIENT_ID=abc123xyz
   REDDIT_CLIENT_SECRET=secretstring123
   REDDIT_USER_AGENT="zorg-sentiment-v2:1.0.0 by /u/YOUR_REDDIT_USERNAME"
   ```

   ⚠️ Replace:

   - `abc123xyz` with your actual Client ID
   - `secretstring123` with your actual Client Secret
   - `YOUR_REDDIT_USERNAME` with your Reddit username

## Step 3: Run Test

**Start the Nuxt dev server** (in a separate terminal):

```powershell
npm run dev
```

Wait for the server to start (you'll see "Nuxt 4.1.3" and "Local: http://localhost:3000")

**Run the test** (in another terminal):

```powershell
node test-reddit-api-simple.js
```

## Expected Output

```
🧪 Testing Reddit API Integration

1️⃣  Testing /api/sentiment endpoint...
✅ Sentiment endpoint responded
   Score: 0.15
   Mood: neutral
   Total articles: 25

2️⃣  Testing /api/sentiment/sources endpoint...
✅ Sources endpoint responded

📊 Found 3 Reddit source(s):

   Source: reddit-dutchpersonalfinance
   Articles: 5
   Avg Score: 0.18

   Source: reddit-thenetherlands
   Articles: 3
   Avg Score: 0.12

   Source: reddit-geldzaken
   Articles: 2
   Avg Score: 0.22

✅ All tests completed successfully!
```

## Troubleshooting

### Error: "Missing REDDIT_CLIENT_ID"

- Make sure .env file exists in project root
- Check that values don't contain "your\_" placeholder text

### Error: "401 Unauthorized" or "403 Forbidden"

- Verify Client ID and Client Secret are correct
- Make sure app type is "script" (not "web app")
- Check credentials are copied exactly (no extra spaces)

### Error: "404 Not Found"

- The subreddit may not exist or is private
- Try r/test or r/pics first to verify connection

### Error: "No articles fetched"

- This is normal! Keywords are strict (Dutch healthcare only)
- Try with minScore: 1 to see if more posts pass filter
- Check r/thenetherlands has recent posts about healthcare

## Testing Other Subreddits

Edit `test-reddit-api.js` and change the subreddit:

```javascript
subreddit: 'DutchPersonalFinance',  // or 'geldzaken'
```

## Next Steps After Successful Test

1. ✅ Phase 3 MVP is working!
2. ➡️ Proceed to Phase 4: Engagement stats API
3. ➡️ Deploy to Netlify with environment variables
4. ➡️ Test automated hourly collection

---

**Need help?** Check the quickstart guide: `specs/003-reddit-integration/quickstart.md`
