#!/bin/bash
set -e

# Runtime environment variable substitution for the React app
# This replaces placeholder values in the built JS files with actual environment variables

# Default values
API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}
FARO_COLLECTOR_URL=${VITE_FARO_COLLECTOR_URL:-}
APP_NAME=${VITE_APP_NAME:-voiceiq-ui}
APP_VERSION=${VITE_APP_VERSION:-1.0.0}
APP_ENVIRONMENT=${VITE_APP_ENVIRONMENT:-production}

echo "Configuring VoiceIQ-UI..."
echo "  API_BASE_URL: $API_BASE_URL"
echo "  FARO_COLLECTOR_URL: ${FARO_COLLECTOR_URL:-<not configured>}"
echo "  APP_NAME: $APP_NAME"
echo "  APP_VERSION: $APP_VERSION"
echo "  APP_ENVIRONMENT: $APP_ENVIRONMENT"

# Find and replace placeholders in all JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i \
  -e "s|__API_BASE_URL_PLACEHOLDER__|${API_BASE_URL}|g" \
  -e "s|__FARO_COLLECTOR_URL_PLACEHOLDER__|${FARO_COLLECTOR_URL}|g" \
  -e "s|__APP_NAME_PLACEHOLDER__|${APP_NAME}|g" \
  -e "s|__APP_VERSION_PLACEHOLDER__|${APP_VERSION}|g" \
  -e "s|__APP_ENVIRONMENT_PLACEHOLDER__|${APP_ENVIRONMENT}|g" \
  {} \;

echo "Configuration complete, starting nginx..."

# Execute the CMD
exec "$@"
