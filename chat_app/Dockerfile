# # --- Stage 1: Build ---
# FROM node:22-alpine AS builder
# RUN npm install -g pnpm
# WORKDIR /app
# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile
# COPY . .
#
# # Build with a placeholder that we will swap at runtime
# RUN VITE_API_URL=VITE_API_URL_PLACEHOLDER pnpm build
#
# # --- Stage 2: Nginx ---
# FROM nginx:alpine
#
# # Copy the built assets
# COPY --from=builder /app/dist /usr/share/nginx/html
#
# # Copy our custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf
#
# # Script to replace the placeholder with the actual ENV variable at runtime
# # This runs every time the container starts
# CMD ["/bin/sh", "-c", "sed -i 's|VITE_API_URL_PLACEHOLDER|'\"$VITE_API_URL\"'|g' /usr/share/nginx/html/assets/*.js && nginx -g 'daemon off;'"]
#
# --- Stage 1: Build ---
FROM node:22-alpine AS builder

# 1. Install pnpm and configure it for stability
RUN npm install -g pnpm && \
  pnpm config set fetch-retries 5 && \
  pnpm config set fetch-retry-maxtimeout 120000

WORKDIR /app

# 2. Copy only lockfiles first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# 3. Install dependencies (added --prod if you don't need devDeps for build, 
# but usually Vite needs devDeps to run the build command)
RUN pnpm install --frozen-lockfile

# 4. Copy the rest of the source code
COPY . .

# 5. Build the app
# Use a specific, unique string for the placeholder to avoid accidental matches
RUN VITE_API_URL=__VITE_API_URL_PLACEHOLDER__ pnpm build

# --- Stage 2: Production ---
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /usr/share/nginx/html

# Copy built assets from builder stage
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 6. Optimized Runtime Script
# We use a shell variable to make the sed command cleaner and handle slashes in URLs
CMD ["/bin/sh", "-c", "sed -i \"s|__VITE_API_URL_PLACEHOLDER__|${VITE_API_URL}|g\" assets/*.js && nginx -g 'daemon off;'"]
