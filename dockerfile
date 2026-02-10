FROM oven/bun:1.1-alpine

WORKDIR /app

# Install dependencies and Postgres client
RUN apk add --no-cache shadow bash curl \
 && apk add --no-cache --repository=https://dl-cdn.alpinelinux.org/alpine/edge/main postgresql17-client

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Create non-root user
RUN groupadd -g 1001 bunjs \
 && useradd -u 1001 -g bunjs -m appuser

# Copy entrypoint script
COPY init-db.sh /usr/local/bin/init-db.sh
RUN sed -i 's/\r$//' /usr/local/bin/init-db.sh \
 && chmod +x /usr/local/bin/init-db.sh

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/ || exit 1

# Use the script as entrypoint
ENTRYPOINT ["/usr/local/bin/init-db.sh"]
