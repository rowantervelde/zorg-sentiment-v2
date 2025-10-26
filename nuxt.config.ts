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
  },

  // T071: Optimize Chart.js bundle size with tree-shaking and lazy loading
  vite: {
    optimizeDeps: {
      include: [
        'chart.js',
        'vue-chartjs',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chart-vendor': ['chart.js', 'vue-chartjs'],
          },
        },
      },
    },
  },

  // Build optimizations for production
  build: {
    transpile: ['chart.js'],
  },

  // Enable tree-shaking for Chart.js
  // Chart.js v4 supports tree-shaking when importing only needed components
  // Components are registered in TrendChart.vue: CategoryScale, LinearScale, PointElement, etc.
  experimental: {
    payloadExtraction: false,
  },
})