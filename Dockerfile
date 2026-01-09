# VoiceIQ-UI
# Multi-stage build: Build React app, serve with nginx

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with default/placeholder values (will be replaced at runtime)
ENV VITE_API_BASE_URL=__API_BASE_URL_PLACEHOLDER__
ENV VITE_FARO_COLLECTOR_URL=__FARO_COLLECTOR_URL_PLACEHOLDER__
ENV VITE_APP_NAME=__APP_NAME_PLACEHOLDER__
ENV VITE_APP_VERSION=__APP_VERSION_PLACEHOLDER__
ENV VITE_APP_ENVIRONMENT=__APP_ENVIRONMENT_PLACEHOLDER__

# Firebase Authentication placeholders
ENV VITE_FIREBASE_API_KEY=__FIREBASE_API_KEY_PLACEHOLDER__
ENV VITE_FIREBASE_AUTH_DOMAIN=__FIREBASE_AUTH_DOMAIN_PLACEHOLDER__
ENV VITE_FIREBASE_PROJECT_ID=__FIREBASE_PROJECT_ID_PLACEHOLDER__
ENV VITE_FIREBASE_STORAGE_BUCKET=__FIREBASE_STORAGE_BUCKET_PLACEHOLDER__
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=__FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER__
ENV VITE_FIREBASE_APP_ID=__FIREBASE_APP_ID_PLACEHOLDER__

RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine AS production

# Install envsubst for runtime environment variable substitution
RUN apk add --no-cache bash

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for runtime env substitution
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Use entrypoint to substitute environment variables at runtime
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
