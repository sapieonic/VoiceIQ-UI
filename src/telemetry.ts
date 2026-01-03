import { trace, context } from '@opentelemetry/api';

/**
 * Browser Telemetry for VoiceIQ-UI
 *
 * NOTE: Direct browser-to-Grafana-Cloud telemetry is disabled due to CORS restrictions.
 * Traces flow through backend services (Call-Mediator, MagicVoice) which handle OTel export.
 *
 * For browser-specific observability, consider Grafana Faro:
 * https://grafana.com/docs/grafana-cloud/faro-web-sdk/
 */

export function initTelemetry(): void {
  console.log('ℹ️  OpenTelemetry: Browser telemetry disabled (traces flow through backend services)');
}

// Helper to get the tracer for custom spans (no-op when telemetry disabled)
export function getTracer(name: string = 'voiceiq-ui') {
  return trace.getTracer(name);
}

// Helper to get the current context
export function getCurrentContext() {
  return context.active();
}

// Shutdown telemetry (no-op when telemetry disabled)
export async function shutdownTelemetry(): Promise<void> {
  // No-op - browser telemetry is disabled
}
