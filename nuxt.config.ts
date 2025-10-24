// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  
  // Enable devtools for development
  devtools: { enabled: true },

  // Modules
  modules: ['@nuxt/ui'],

  // SSG configuration for static site generation
  ssr: true,
  
  // Nitro configuration for Netlify
  nitro: {
    preset: 'netlify',
    // Netlify Functions configuration
    serverAssets: [{
      baseName: 'data',
      dir: './data'
    }]
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-side only)
    rssFeedUrl: process.env.RSS_FEED_URL || 'https://www.nu.nl/rss/Gezondheid',
    feedFetchIntervalMinutes: process.env.FEED_FETCH_INTERVAL_MINUTES || '60',
    dataRetentionDays: process.env.DATA_RETENTION_DAYS || '7',
    rateLimitRequestsPerHour: process.env.RATE_LIMIT_REQUESTS_PER_HOUR || '20',
    netlifryBlobsStoreName: process.env.NETLIFY_BLOBS_STORE_NAME || 'sentiment-data',
    
    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disabled for faster dev server startup
  },

  // App configuration
  app: {
    head: {
      title: 'Zorg Sentiment Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Bekijk hoe Nederland zich voelt over zorgverzekeringen in real-time' 
        }
      ]
    }
  }
})
