# syntax=docker/dockerfile:1
FROM node:18-slim AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy entire project
COPY . .

# Build-time variables for Next.js (used by next.config.js and static generation)
ARG INSFORGE_BASE_URL
ARG INSFORGE_STORAGE_PUBLIC_BASE_URL
ARG INSFORGE_STORAGE_UPLOAD_BASE_URL
ARG INSFORGE_STORAGE_BUCKET
ARG INSFORGE_API_KEY
ARG NEXT_PUBLIC_INSFORGE_BASE_URL

ENV INSFORGE_BASE_URL=${INSFORGE_BASE_URL}
ENV INSFORGE_STORAGE_PUBLIC_BASE_URL=${INSFORGE_STORAGE_PUBLIC_BASE_URL}
ENV INSFORGE_STORAGE_UPLOAD_BASE_URL=${INSFORGE_STORAGE_UPLOAD_BASE_URL}
ENV INSFORGE_STORAGE_BUCKET=${INSFORGE_STORAGE_BUCKET}
ENV INSFORGE_API_KEY=${INSFORGE_API_KEY}
ENV NEXT_PUBLIC_INSFORGE_BASE_URL=${NEXT_PUBLIC_INSFORGE_BASE_URL}

RUN npm run build

# Runtime stage
FROM node:18-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# InsForge config needed at RUNTIME (server-side fetches in insforgeClient)
ENV INSFORGE_BASE_URL=${INSFORGE_BASE_URL:-http://insforge:7130}
ENV INSFORGE_API_KEY=${INSFORGE_API_KEY:-ik_vendora_docker_local_dev_key_1234567890abc}
ENV INSFORGE_STORAGE_BUCKET=${INSFORGE_STORAGE_BUCKET:-images}
ENV INSFORGE_STORAGE_PUBLIC_BASE_URL=${INSFORGE_STORAGE_PUBLIC_BASE_URL:-http://insforge:7130/api/storage/buckets/images/objects}
ENV INSFORGE_STORAGE_UPLOAD_BASE_URL=${INSFORGE_STORAGE_UPLOAD_BASE_URL:-http://insforge:7130/api/storage/buckets/images/objects}
ENV JWT_SECRET=${JWT_SECRET:-vendora_jwt_secret_change_in_production_min_32_chars}
ENV NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-vendora_jwt_secret_change_in_production_min_32_chars}

# Copy built application
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/components ./components
COPY --from=builder /app/context ./context
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/models ./models
COPY --from=builder /app/redux ./redux
COPY --from=builder /app/request ./request
COPY --from=builder /app/emails ./emails
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
