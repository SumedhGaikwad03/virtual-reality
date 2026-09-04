# ==============================================================================
# NOTE: This Docker production configuration is currently retained for future
# deployment. The project is presently using a free hosting strategy, so the
# Docker/VPS production deployment is intentionally paused to avoid infrastructure
# costs. The containers have been locally built and verified successfully.
# Do not remove or modify this configuration unless the Docker production
# deployment is resumed. The existing live deployment remains active.
# ==============================================================================

# Stage 1: Build the Vite React application
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies using clean install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
ARG VITE_API_BASE_URL=/api
ARG VITE_VAPID_PUBLIC_KEY=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN npm run build

# Stage 2: Serve static production assets with Nginx
FROM nginx:1.27-alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
