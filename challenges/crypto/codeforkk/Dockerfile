FROM oven/bun:canary-alpine AS base
WORKDIR /codeforkk

FROM base AS builder
RUN apk add g++
COPY . ./
RUN bun install --frozen-lockfile && bun run build
RUN g++ -O2 -std=c++23 victim.cpp -o victim

FROM base AS runner
COPY --from=builder /codeforkk/.output ./
COPY --from=builder /codeforkk/victim ./

EXPOSE 3000
CMD ["bun", "server/index.mjs"]
