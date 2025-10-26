/**
 * CORS Middleware for API Routes
 * Adds Cross-Origin Resource Sharing headers to allow external API access
 * Applies to all /api/* routes
 */

export default defineEventHandler((event) => {
  const path = event.path || '';

  // Only apply CORS to API routes
  if (path.startsWith('/api/')) {
    // Set CORS headers
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': '*', // Allow all origins (adjust for production if needed)
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      'Access-Control-Max-Age': '86400', // 24 hours
    });

    // Handle preflight OPTIONS requests
    if (event.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
  }
});
