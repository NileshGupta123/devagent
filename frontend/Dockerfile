# ─────────────────────────────────────────
# Frontend Dockerfile
# React + Vite — Multi-stage build
# ─────────────────────────────────────────

# Stage 1 — Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all frontend code
COPY . .

# Build for production
RUN npm run build

# ─────────────────────────────────────────
# Stage 2 — Serve with Nginx
# ─────────────────────────────────────────

FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]