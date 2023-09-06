ARG NODEJS_VERSION=18

##### Stage 1

FROM node:$NODEJS_VERSION-alpine AS builder

RUN apk add --no-cache alpine-sdk=~1 python3=~3 libtool=~2 autoconf=~2 automake=~1 rust=~1 cargo=~1 cmake=~3 clang15-libs=~15 clang15-dev=~15 clang15=~15 rustfmt=~1 linux-headers=~6 && \
    adduser -D lisk && \
    mkdir /home/lisk/build && \
    chown -R lisk:lisk /home/lisk/ && \
    npm install -g npm

USER lisk
WORKDIR /home/lisk/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


##### Stage 2

FROM node:$NODEJS_VERSION-alpine

RUN adduser -D lisk && \
    mkdir /home/lisk/.lisk && \
    chown -R lisk:lisk /home/lisk/ && \
    npm install -g npm

USER lisk
WORKDIR /home/lisk
VOLUME ["/home/lisk/.lisk/lisk-core"]

COPY --chown=lisk:lisk ./ .
COPY --from=builder /home/lisk/build/node_modules/ ./node_modules/

RUN npm run build

ENTRYPOINT ["/home/lisk/bin/run"]
CMD ["start", "--network", "mainnet"]
