# Build stage: Node to produce dist/
# Pinned on purpose: 22.23.4 is the first 22.x carrying the brotli decoder fix
# for CVE-2026-111497. A floating `node:22` makes the built bundle depend on
# whatever the tag pointed at when the runner's image cache was populated.
FROM node:22.23.4-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.17.0 --activate
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Run stage: Alpine + nginx to serve static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
