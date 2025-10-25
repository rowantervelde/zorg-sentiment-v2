// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  
  runtimeConfig: {
    // Private keys (server-side only)
    trendWindowHours: parseInt(process.env.NUXT_TREND_WINDOW_HOURS || '168', 10),
    
    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    }
  }
})