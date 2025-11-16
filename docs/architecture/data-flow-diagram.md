# Data Flow Architecture - Netlify Functions & Blob Storage

This diagram shows how data flows through the Zorg Sentiment application, including collection, storage, and retrieval.

```mermaid
flowchart TB
    subgraph External["External Data Sources"]
        RSS1["NU.nl RSS Feed"]
        RSS2["NOS.nl RSS Feed"]
        RSS3["Zorgwijzer RSS Feed"]
        Reddit["Reddit API<br/>(r/thenetherlands)"]
    end

    subgraph NetlifySchedule["Netlify Scheduled Functions"]
        Schedule["@hourly Schedule<br/>(netlify.toml)"]
    end

    subgraph Collection["Collection Function (Serverless)"]
        CollectFunc["collect-sentiment.mts<br/>Netlify Function"]
        Orchestrator["sourceOrchestrator<br/>(fetchFromAllSources)"]
        Dedup["deduplicator<br/>(80% similarity)"]
        Analyzer["sentimentAnalyzer<br/>(analyzeArticleWithDetails)"]
    end

    subgraph Processing["Article Processing"]
        ArticleAnalysis["Per-Article Analysis:<br/>• Raw sentiment score<br/>• Positive/negative words<br/>• Recency weight<br/>• Source weight<br/>• Contribution %"]
        TopArticles["Filter Top 50 Articles<br/>per Source"]
        AggCalc["calculateMoodFromArticles<br/>(derive aggregates)"]
    end

    subgraph Storage["Netlify Blob Storage"]
        BlobStore[("Blob Store:<br/>sentiment-data")]
        BlobKey["Key: sentiment-history"]
        BlobData["SentimentHistory JSON:<br/>• dataPoints[] (7 days)<br/>• Each dataPoint contains:<br/>  - timestamp<br/>  - breakdown<br/>  - sourceContributions<br/>  - analyzedArticles[]"]
    end

    subgraph APILayer["API Endpoints (Nitro Server)"]
        SentimentAPI["/api/sentiment<br/>(getCurrentDataPoint)"]
        SourcesAPI["/api/sentiment/sources<br/>(source metrics)"]
        ArticlesAPI["/api/sentiment/articles<br/>(article details)"]
        HistoryAPI["/api/sentiment/history<br/>(trend data)"]
    end

    subgraph Frontend["Frontend (Nuxt/Vue)"]
        Homepage["Homepage<br/>• Mood Indicator<br/>• Trend Chart"]
        SourceCards["Source Cards<br/>• Per-source stats"]
        DetailPage["Detail Page<br/>• Article list<br/>• Real titles/links"]
    end

    subgraph DataStructure["Single Source of Truth"]
        AnalyzedArticles["analyzedArticles[]<br/><br/>ArticleWithSentiment:<br/>• id, title, link<br/>• rawSentimentScore<br/>• positiveWords[]<br/>• negativeWords[]<br/>• recencyWeight<br/>• sourceWeight<br/>• finalWeightedScore<br/>• contributionPercentage<br/>• pubDate, sourceId"]
    end

    %% External connections
    Schedule -->|Triggers hourly| CollectFunc
    RSS1 & RSS2 & RSS3 & Reddit -->|Fetch articles| Orchestrator

    %% Collection flow
    CollectFunc --> Orchestrator
    Orchestrator -->|Deduplicated articles| Dedup
    Dedup -->|Unique articles| Analyzer

    %% Processing flow
    Analyzer --> ArticleAnalysis
    ArticleAnalysis --> TopArticles
    TopArticles --> AggCalc

    %% Storage flow
    AggCalc -->|Save dataPoint| BlobStore
    BlobStore -.->|Stores as| BlobKey
    BlobKey -.->|Contains| BlobData
    BlobData -->|Includes| AnalyzedArticles

    %% Retrieval flow
    BlobStore -->|Read from blob| SentimentAPI
    BlobStore -->|Read from blob| SourcesAPI
    BlobStore -->|Read from blob| ArticlesAPI
    BlobStore -->|Read from blob| HistoryAPI

    %% API to Frontend
    SentimentAPI -->|Aggregate metrics| Homepage
    SourcesAPI -->|Source contributions| SourceCards
    ArticlesAPI -->|Real article data| DetailPage
    HistoryAPI -->|Historical data| Homepage

    %% Data derivation
    AnalyzedArticles -.->|Derives| SentimentAPI
    AnalyzedArticles -.->|Derives| SourcesAPI
    AnalyzedArticles -.->|Returns filtered| ArticlesAPI

    %% Styling
    classDef external fill:#e1f5ff,stroke:#0066cc,stroke-width:2px
    classDef function fill:#fff4e6,stroke:#ff9800,stroke-width:2px
    classDef storage fill:#e8f5e9,stroke:#4caf50,stroke-width:3px
    classDef api fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    classDef frontend fill:#fce4ec,stroke:#e91e63,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#ff6f00,stroke-width:3px

    class RSS1,RSS2,RSS3,Reddit external
    class Schedule,CollectFunc,Orchestrator,Dedup,Analyzer function
    class BlobStore,BlobKey,BlobData storage
    class SentimentAPI,SourcesAPI,ArticlesAPI,HistoryAPI api
    class Homepage,SourceCards,DetailPage frontend
    class AnalyzedArticles,ArticleAnalysis,TopArticles,AggCalc data
```

## Key Points

### Blob Storage Structure

**Only ONE blob key exists**: `sentiment-history`

This contains:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-16T10:00:00Z",
  "retentionDays": 7,
  "dataPoints": [
    {
      "timestamp": "2025-11-16T10:00:00Z",
      "breakdown": { "positive": 25, "neutral": 50, "negative": 25 },
      "sourceContributions": [...],
      "analyzedArticles": [
        {
          "id": "nu-nl-gezondheid-abc123",
          "title": "Real article title from NU.nl",
          "link": "https://www.nu.nl/...",
          "rawSentimentScore": 0.65,
          "positiveWords": ["verbetering", "vooruitgang"],
          "negativeWords": [],
          "recencyWeight": 0.95,
          "contributionPercentage": 8.2,
          "pubDate": "2025-11-16T09:30:00Z"
        }
        // ... up to ~400 articles total (top 50 per source)
      ]
    }
    // ... up to 168 dataPoints (7 days × 24 hours)
  ]
}
```

### Data Flow Summary

1. **Collection** (hourly via Netlify scheduled function)

   - Fetches from RSS/Reddit sources
   - Deduplicates across sources
   - Analyzes each article individually
   - Stores top 50 articles per source

2. **Storage** (Netlify Blob Storage)

   - Single blob: `sentiment-history`
   - Contains 7 days of hourly data points
   - Each data point includes ~400 analyzed articles
   - Total size: ~50MB (within Netlify limits)

3. **Retrieval** (API endpoints)

   - All endpoints read from same blob
   - All metrics derived from `analyzedArticles[]`
   - Single source of truth across entire app

4. **Frontend** (Nuxt/Vue)
   - Homepage, source cards, detail pages
   - All display data from same articles
   - No mock/dummy data anywhere

### Storage Limits

- **Netlify Blob limit**: 50MB per site
- **Retention**: 7 days (168 data points max)
- **Articles per collection**: ~400 total (top 50 per source)
- **Article size**: ~2KB each (title, excerpt, scores, words)
- **Total estimated**: ~50MB (168 points × 400 articles × 2KB)
