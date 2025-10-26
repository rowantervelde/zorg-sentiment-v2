#!/bin/bash
# Test script for local development
# Run with: bash test-local.sh

echo "🧪 Testing Zorg Sentiment v2 locally..."
echo ""

# Check if netlify dev is running
if ! curl -s http://localhost:8888 > /dev/null; then
  echo "❌ Error: netlify dev is not running"
  echo "Start it with: netlify dev"
  exit 1
fi

echo "✅ Netlify dev is running"
echo ""

# Test 1: Collect sentiment data
echo "📊 Test 1: Collecting sentiment data..."
echo "Note: Using netlify CLI to invoke function"

# Check if netlify CLI is available
if command -v netlify &> /dev/null; then
  COLLECT_RESPONSE=$(netlify functions:invoke collect-sentiment --payload '{"next_run": "2025-10-25T15:00:00Z"}' 2>&1)
  echo "Response: $COLLECT_RESPONSE"
else
  echo "⚠️  netlify CLI not found. Install with: npm install -g netlify-cli"
fi
echo ""

# Wait a moment for data to be saved
sleep 2

# Test 2: Fetch current sentiment
echo "📈 Test 2: Fetching current sentiment..."
SENTIMENT_RESPONSE=$(curl -s http://localhost:8888/api/sentiment)
echo "Response: $SENTIMENT_RESPONSE"
echo ""

# Test 3: Fetch with trend
echo "📉 Test 3: Fetching sentiment with trend..."
TREND_RESPONSE=$(curl -s "http://localhost:8888/api/sentiment?include=trend")
echo "Response: $TREND_RESPONSE"
echo ""

# Test 4: Test rate limiting
echo "🚦 Test 4: Testing rate limiting (making 21 requests)..."
for i in {1..21}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/api/sentiment)
  if [ $i -eq 21 ]; then
    if [ "$HTTP_CODE" == "429" ]; then
      echo "✅ Rate limiting working! Got 429 on request $i"
    else
      echo "⚠️  Expected 429, got $HTTP_CODE on request $i"
    fi
  fi
done
echo ""

echo "✅ All tests complete!"
echo ""
echo "📱 Open the app in browser:"
echo "   http://localhost:8888"
