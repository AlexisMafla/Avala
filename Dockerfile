# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY web/package.json web/package-lock.json ./web/
COPY scripts/patch-agentgate.mjs ./scripts/
RUN npm ci && npm ci --prefix web

COPY . .
ENV VITE_API_BASE=
RUN npm run build:all

# Runtime stage
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY package.json package-lock.json ./
COPY scripts/patch-agentgate.mjs ./scripts/
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/web/dist ./web/dist

EXPOSE 8787
CMD ["node", "dist/http/server.js"]
