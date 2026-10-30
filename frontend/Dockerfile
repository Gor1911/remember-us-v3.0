FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Public URLs are baked into the bundle at build time — CI passes them from vars.PUBLIC_HOST.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MEDIA_HOST
ARG BACKEND_INTERNAL_URL=http://backend:8000
ARG BACKEND_MEDIA_HOST=backend
ARG BACKEND_MEDIA_PORT=8000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV BACKEND_MEDIA_HOST=$BACKEND_MEDIA_HOST
ENV BACKEND_MEDIA_PORT=$BACKEND_MEDIA_PORT

RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "NEXT_PUBLIC_API_URL build arg is required" >&2 && exit 1)
RUN npm run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
