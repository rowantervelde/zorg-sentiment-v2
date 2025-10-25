/**
 * GET /api/health
 * Health check endpoint - returns system health status and data source status
 * Per OpenAPI contract
 */

import { getData, getDataAge } from '../utils/storage';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  sources: Array<{
    id: string;
    name: string;
    status: 'operational' | 'degraded' | 'failed';
    lastSuccess: string | null;
    lastError: string | null;
  }>;
  dataAge: number; // seconds
  isStale: boolean;
}

export default defineEventHandler(async (event): Promise<HealthResponse> => {
  try {
    const history = await getData();
    const dataAge = await getDataAge();
    const isStale = dataAge > 24 * 60 * 60; // 24 hours in seconds

    // Check data source statuses
    const sources = history.sources.map((source) => {
      let sourceStatus: 'operational' | 'degraded' | 'failed' = 'operational';
      
      if (source.lastFetchError) {
        sourceStatus = 'failed';
      } else if (source.lastFetchSuccess) {
        const lastSuccessAge = (Date.now() - new Date(source.lastFetchSuccess).getTime()) / 1000;
        if (lastSuccessAge > 2 * 60 * 60) { // >2 hours since last success
          sourceStatus = 'degraded';
        }
      } else {
        sourceStatus = 'failed'; // Never fetched successfully
      }

      return {
        id: source.id,
        name: source.name,
        status: sourceStatus,
        lastSuccess: source.lastFetchSuccess,
        lastError: source.lastFetchError,
      };
    });

    // Determine overall system status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    const failedSources = sources.filter((s) => s.status === 'failed').length;
    const degradedSources = sources.filter((s) => s.status === 'degraded').length;
    
    if (failedSources === sources.length) {
      overallStatus = 'unhealthy'; // All sources failed
    } else if (failedSources > 0 || degradedSources > 0 || isStale) {
      overallStatus = 'degraded'; // Some sources failed/degraded or data is stale
    }

    // No cache headers for health endpoint (always fresh)
    setResponseHeaders(event, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    });

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      sources,
      dataAge: Math.round(dataAge),
      isStale,
    };
  } catch (error) {
    console.error('[API /health] Error:', error);
    
    // Even if there's an error, return unhealthy status instead of throwing
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      sources: [],
      dataAge: Infinity,
      isStale: true,
    };
  }
});
