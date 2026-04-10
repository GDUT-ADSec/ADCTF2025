FROM oven/bun:canary-alpine AS base
WORKDIR /rkqa

FROM base AS builder
COPY . ./
RUN bun install --frozen-lockfile && bun run build

FROM base AS runner
COPY --from=builder /rkqa/.output ./

EXPOSE 3000
CMD ["bun", "server/index.mjs"]
