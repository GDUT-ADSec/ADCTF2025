FROM silkeh/clang AS base
WORKDIR /rickylang
RUN apt update
RUN apt install curl unzip
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

FROM base AS builder
COPY . ./
RUN bun install --frozen-lockfile && bun run build

FROM base AS runner
COPY ./autofront /usr/local/bin/
COPY --from=builder /rickylang/.output ./

EXPOSE 3000
CMD ["bun", "server/index.mjs"]
