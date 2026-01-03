import {
  initializeFaro,
  getWebInstrumentations,
  FaroErrorBoundary,
  faro,
  LogLevel,
} from '@grafana/faro-react';

/**
 * Grafana Faro - Frontend Observability for VoiceIQ-UI
 *
 * Captures:
 * - Errors and exceptions
 * - Web Vitals (LCP, CLS, INP, FCP, TTFB)
 * - User sessions and interactions
 * - Console logs
 * - Network requests (fetch/XHR)
 * - Custom events and measurements
 */

// Configuration from environment variables
const FARO_COLLECTOR_URL = import.meta.env.VITE_FARO_COLLECTOR_URL || '';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'voiceiq-ui';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const APP_ENVIRONMENT = import.meta.env.VITE_APP_ENVIRONMENT || 'development';

// Track initialization state to prevent double init (HMR, StrictMode, etc.)
let isInitialized = false;

// Check if Faro is properly configured
function isFaroConfigured(): boolean {
  // Not configured if empty or placeholder value
  if (!FARO_COLLECTOR_URL) return false;
  if (FARO_COLLECTOR_URL.includes('PLACEHOLDER')) return false;
  if (!FARO_COLLECTOR_URL.startsWith('http')) return false;
  return true;
}

export function initTelemetry(): void {
  // Prevent double initialization
  if (isInitialized) {
    return;
  }

  // Skip initialization if collector URL is not configured
  if (!isFaroConfigured()) {
    console.log('Faro: Collector URL not configured, frontend telemetry disabled');
    isInitialized = true; // Mark as "handled" to prevent repeated logs
    return;
  }

  try {
    isInitialized = true;
    initializeFaro({
      // Required: Grafana Cloud collector URL
      url: FARO_COLLECTOR_URL,

      // Required: Application identification
      app: {
        name: APP_NAME,
        version: APP_VERSION,
        environment: APP_ENVIRONMENT,
      },

      // Instrumentations for automatic data collection
      instrumentations: [
        // Default web instrumentations (errors, web vitals, console, etc.)
        ...getWebInstrumentations({
          captureConsole: true,
        }),
        // Note: TracingInstrumentation removed - add back if you need distributed tracing
        // Requires: npm install @grafana/faro-web-tracing
      ],

      // Session tracking
      sessionTracking: {
        enabled: true,
        persistent: true, // Persist session across page reloads
      },

      // Batching configuration for performance
      batching: {
        enabled: true,
        sendTimeout: 1000, // Send batch every 1 second
        itemLimit: 50, // Or when 50 items accumulated
      },

      // Console instrumentation settings (v2 style)
      consoleInstrumentation: {
        consoleErrorAsLog: true, // Treat console.error as log instead of error
      },

      // User identification (can be set later with faro.api.setUser)
      // user: { id: 'anonymous' },
    });

    console.log(`Faro: Initialized for ${APP_NAME} (${APP_ENVIRONMENT})`);
  } catch (error) {
    console.error('Faro: Failed to initialize', error);
  }
}

// Export Faro instance for custom instrumentation
export { faro, FaroErrorBoundary };

// Helper to push custom events
export function pushEvent(name: string, attributes?: Record<string, string>) {
  if (faro.api) {
    faro.api.pushEvent(name, attributes);
  }
}

// Helper to push custom measurements
export function pushMeasurement(
  type: string,
  values: Record<string, number>,
  context?: Record<string, string>
) {
  if (faro.api) {
    faro.api.pushMeasurement({ type, values }, context);
  }
}

// Helper to push custom logs
export function pushLog(message: string, level: LogLevel = LogLevel.INFO, context?: Record<string, string>) {
  if (faro.api) {
    faro.api.pushLog([message], { level, context });
  }
}

// Helper to set user identity
export function setUser(id: string, attributes?: Record<string, string>) {
  if (faro.api) {
    faro.api.setUser({ id, attributes });
  }
}

// Helper to push errors
export function pushError(error: Error, context?: Record<string, string>) {
  if (faro.api) {
    faro.api.pushError(error, { context });
  }
}

// Shutdown telemetry
export async function shutdownTelemetry(): Promise<void> {
  // Faro v2 doesn't expose a pause method, telemetry stops when page unloads
}
