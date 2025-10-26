/**
 * Error Response Standardization Utility
 * Implements OpenAPI ErrorResponse schema across all API endpoints
 */

export interface ErrorResponse {
  error: string; // Error title
  message: string; // Detailed error message
  code: string; // Machine-readable error code
  retryAfter?: number; // Seconds until retry allowed (for rate limiting)
}

/**
 * Create standardized error response per OpenAPI contract
 */
export function createStandardError(
  statusCode: number,
  error: string,
  message: string,
  code: string,
  retryAfter?: number
) {
  const data: ErrorResponse = {
    error,
    message,
    code,
  };

  if (retryAfter !== undefined) {
    data.retryAfter = retryAfter;
  }

  return createError({
    statusCode,
    statusMessage: error,
    data,
  });
}

/**
 * Common error responses per OpenAPI contract
 */
export const StandardErrors = {
  /**
   * 400 Bad Request
   */
  badRequest: (message: string, code: string = 'BAD_REQUEST') =>
    createStandardError(400, 'Bad Request', message, code),

  /**
   * 404 Not Found
   */
  notFound: (message: string = 'Resource not found', code: string = 'NOT_FOUND') =>
    createStandardError(404, 'Not Found', message, code),

  /**
   * 429 Rate Limit Exceeded
   */
  rateLimitExceeded: (retryAfter: number = 3600) =>
    createStandardError(
      429,
      'Rate Limit Exceeded',
      'You have exceeded the rate limit of 20 requests per hour',
      'RATE_LIMIT_EXCEEDED',
      retryAfter
    ),

  /**
   * 500 Internal Server Error
   */
  internalError: (message: string = 'An internal server error occurred', code: string = 'INTERNAL_ERROR') =>
    createStandardError(500, 'Internal Server Error', message, code),

  /**
   * 503 Service Unavailable
   */
  serviceUnavailable: (message: string = 'Service temporarily unavailable', code: string = 'SERVICE_UNAVAILABLE') =>
    createStandardError(503, 'Service Unavailable', message, code),
};
