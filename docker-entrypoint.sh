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

# Firebase Authentication
FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY:-}
FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN:-}
FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID:-}
FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET:-}
FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID:-}
FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID:-}

echo "Configuring VoiceIQ-UI..."
echo "  API_BASE_URL: $API_BASE_URL"
echo "  FARO_COLLECTOR_URL: ${FARO_COLLECTOR_URL:-<not configured>}"
echo "  APP_NAME: $APP_NAME"
echo "  APP_VERSION: $APP_VERSION"
echo "  APP_ENVIRONMENT: $APP_ENVIRONMENT"
echo "  FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID:-<not configured>}"
echo "  FIREBASE_AUTH_DOMAIN: ${FIREBASE_AUTH_DOMAIN:-<not configured>}"

# Find and replace placeholders in all JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i \
  -e "s|__API_BASE_URL_PLACEHOLDER__|${API_BASE_URL}|g" \
  -e "s|__FARO_COLLECTOR_URL_PLACEHOLDER__|${FARO_COLLECTOR_URL}|g" \
  -e "s|__APP_NAME_PLACEHOLDER__|${APP_NAME}|g" \
  -e "s|__APP_VERSION_PLACEHOLDER__|${APP_VERSION}|g" \
  -e "s|__APP_ENVIRONMENT_PLACEHOLDER__|${APP_ENVIRONMENT}|g" \
  -e "s|__FIREBASE_API_KEY_PLACEHOLDER__|${FIREBASE_API_KEY}|g" \
  -e "s|__FIREBASE_AUTH_DOMAIN_PLACEHOLDER__|${FIREBASE_AUTH_DOMAIN}|g" \
  -e "s|__FIREBASE_PROJECT_ID_PLACEHOLDER__|${FIREBASE_PROJECT_ID}|g" \
  -e "s|__FIREBASE_STORAGE_BUCKET_PLACEHOLDER__|${FIREBASE_STORAGE_BUCKET}|g" \
  -e "s|__FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER__|${FIREBASE_MESSAGING_SENDER_ID}|g" \
  -e "s|__FIREBASE_APP_ID_PLACEHOLDER__|${FIREBASE_APP_ID}|g" \
  {} \;

echo "Configuration complete, starting nginx..."

# Execute the CMD
exec "$@"
