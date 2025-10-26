<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <!-- Error Boundary (T077: Graceful failure handling) -->
    <NuxtErrorBoundary @error="handleError">
      <template #error="{ error, clearError }">
        <div class="error-boundary">
          <div class="error-container">
            <div class="error-icon" aria-hidden="true">⚠️</div>
            <h1 class="error-title">Er is iets misgegaan</h1>
            <p class="error-message">
              {{ getErrorMessage(error) }}
            </p>
            <div class="error-actions">
              <button 
                @click="clearError" 
                class="error-button primary"
                aria-label="Probeer opnieuw"
              >
                Probeer opnieuw
              </button>
              <button 
                @click="reloadPage" 
                class="error-button secondary"
                aria-label="Pagina herladen"
              >
                Pagina herladen
              </button>
            </div>
            <details class="error-details">
              <summary>Technische details</summary>
              <pre>{{ error }}</pre>
            </details>
          </div>
        </div>
      </template>
      
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </NuxtErrorBoundary>
  </div>
</template>

<script setup lang="ts">
// Global app setup and error handling (T077)

/**
 * Handle errors from error boundary
 */
function handleError(error: any) {
  console.error('[App Error Boundary] Caught error:', error);
  
  // Log to external service if configured (e.g., Sentry)
  // if (window.Sentry) {
  //   window.Sentry.captureException(error);
  // }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: any): string {
  if (!error) {
    return 'Er is een onverwachte fout opgetreden.';
  }
  
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Er is een netwerkfout opgetreden. Controleer je internetverbinding.';
  }
  
  // API errors
  if (error.statusCode === 429) {
    return 'Je hebt te veel verzoeken gedaan. Wacht even voordat je het opnieuw probeert.';
  }
  
  if (error.statusCode >= 500) {
    return 'De server ondervindt problemen. Probeer het later opnieuw.';
  }
  
  // Default message
  return error.message || 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.';
}

/**
 * Reload the entire page
 */
function reloadPage() {
  window.location.reload();
}
</script>

<style>
/* Global styles */
html, body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}

#__nuxt {
  min-height: 100vh;
}

/* Error Boundary Styles (T077) */
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(to bottom, #fef2f2, #ffffff);
}

.error-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 1rem 0;
}

.error-message {
  font-size: 1.125rem;
  color: #4b5563;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-button.primary {
  background-color: #10b981;
  color: white;
}

.error-button.primary:hover {
  background-color: #059669;
}

.error-button.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.error-button.secondary:hover {
  background-color: #d1d5db;
}

.error-button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.error-details {
  margin-top: 2rem;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  user-select: none;
}

.error-details pre {
  margin: 1rem 0 0 0;
  padding: 1rem;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 640px) {
  .error-container {
    padding: 2rem 1.5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-button {
    width: 100%;
  }
}
</style>

```
