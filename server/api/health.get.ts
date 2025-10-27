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

    // Build source status from latest data point's sourceContributions
    let sources: Array<{
      id: string;
      name: string;
      status: 'operational' | 'degraded' | 'failed';
      lastSuccess: string | null;
      lastError: string | null;
    }> = [];

    // If we have data points with sourceContributions, use those
    if (history.dataPoints && history.dataPoints.length > 0) {
      const latestDataPoint = history.dataPoints[0]; // Newest first
      
      if (latestDataPoint.sourceContributions && latestDataPoint.sourceContributions.length > 0) {
        sources = latestDataPoint.sourceContributions.map((contrib) => {
          const sourceStatus = contrib.status === 'success' ? 'operational' : 'failed';
          
          return {
            id: contrib.sourceId,
            name: contrib.sourceName,
            status: sourceStatus,
            lastSuccess: contrib.status === 'success' ? contrib.fetchedAt : null,
            lastError: contrib.error || null,
          };
        });
      }
    }

    // Fallback to old sources array if no sourceContributions (backward compatibility)
    if (sources.length === 0 && history.sources && history.sources.length > 0) {
      sources = history.sources.map((source) => {
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
    }

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
    
    // Even if there's an error, try to return last known state
    try {
      const history = await getData();
      const dataAge = await getDataAge();
      
      // Try to get sources from last data point
      let sources: Array<{
        id: string;
        name: string;
        status: 'operational' | 'degraded' | 'failed';
        lastSuccess: string | null;
        lastError: string | null;
      }> = [];
      
      if (history.dataPoints && history.dataPoints.length > 0) {
        const latestDataPoint = history.dataPoints[0];
        if (latestDataPoint.sourceContributions) {
          sources = latestDataPoint.sourceContributions.map((contrib) => ({
            id: contrib.sourceId,
            name: contrib.sourceName,
            status: contrib.status === 'success' ? 'operational' : 'failed',
            lastSuccess: contrib.status === 'success' ? contrib.fetchedAt : null,
            lastError: contrib.error || null,
          }));
        }
      }
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        sources,
        dataAge: Math.round(dataAge),
        isStale: true,
      };
    } catch {
      // If all else fails, return empty sources
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        sources: [],
        dataAge: Infinity,
        isStale: true,
      };
    }
  }
});
