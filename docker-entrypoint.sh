#!/bin/bash
set -e

# Runtime environment variable substitution for the React app
# This replaces placeholder values in the built JS files with actual environment variables

# Default values
API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:4000}

echo "🔧 Configuring VoiceIQ-UI..."
echo "   API_BASE_URL: $API_BASE_URL"

# Find and replace placeholder in all JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__API_BASE_URL_PLACEHOLDER__|${API_BASE_URL}|g" {} \;

echo "✅ Configuration complete, starting nginx..."

# Execute the CMD
exec "$@"
