ARG NODEJS_VERSION=12
FROM node:$NODEJS_VERSION-alpine

ARG CORE_VERSION
ARG REGISTRY_URL
ARG REGISTRY_AUTH_TOKEN

ENV NODE_ENV=production

RUN apk --no-cache upgrade && \
    apk --no-cache add --virtual build-dependencies alpine-sdk autoconf automake libtool linux-headers python

RUN addgroup -g 1100 lisk && \
    adduser -h /home/lisk -s /bin/bash -u 1100 -G lisk -D lisk

USER lisk
WORKDIR /home/lisk

RUN if [ -n "$REGISTRY_URL" ]; then \
      echo -e "registry=$REGISTRY_URL/\n${REGISTRY_URL#*:}/:_authToken=$REGISTRY_AUTH_TOKEN" >/home/lisk/.npmrc; \
    fi
RUN npm install lisk-core@$CORE_VERSION && \
    rm -f /home/lisk/.npmrc

USER root
RUN apk --no-cache del build-dependencies

USER lisk
RUN mkdir /home/lisk/.lisk
VOLUME ["/home/lisk/.lisk"]

ENTRYPOINT ["/home/lisk/node_modules/.bin/lisk-core"]
CMD ["start", "--network", "mainnet"]
