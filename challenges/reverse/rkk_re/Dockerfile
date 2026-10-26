FROM alpine AS base
WORKDIR /rkk_re

FROM base AS builder
COPY rkk.ll math.ll io.ll crypto.ll ./
RUN apk add llvm clang
RUN clang -Wno-override-module io.ll math.ll crypto.ll rkk.ll -o rkk

FROM base AS runner
COPY --from=builder /rkk_re/rkk ./
RUN apk add socat

EXPOSE 1145
ENTRYPOINT [ "socat", "tcp-l:1145,reuseaddr,fork", "exec:'/rkk_re/rkk',pty" ]
