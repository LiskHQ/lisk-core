# Using the lisk/core docker image

lisk/core version 3 does not have any external dependencies and thus does not require using `docker-compose`.

Note: [podman](https://github.com/containers/podman/) can be used. Simply replace occurrences of `docker` with `podman` or `alias docker=podman`.

## Run

Create a "lisk-core" container for betanet:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 5001:5001 \
           --name lisk-core \
           lisk/core:3.0.1 \
             start --network=betanet
```

### Configuration

Further parameters can be passed after `--network`, e.g.:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 5001:5001 \
           --publish 127.0.0.1:5000:5000 \
           --name lisk-core \
           lisk/core:3.0.1 \
             start --network=betanet --enable-http-api-plugin
```

Environment variables can be set with `--env`:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 5001:5001 \
           --env LISK_CONSOLE_LOG_LEVEL=debug \
           --name lisk-core \
           lisk/core:3.0.1 \
             start --network=betanet`
```

See https://lisk.com/documentation/lisk-core/v3/management/configuration.html for a reference of configuration options.

## Import blockchain snapshot

```
docker run --volume lisk-data:/home/lisk/.lisk -it --rm lisk/core:3.0.1 blockchain:download --network=betanet --output=/home/lisk/.lisk/tmp/
docker run --volume lisk-data:/home/lisk/.lisk -it --rm lisk/core:3.0.1 blockchain:import /home/lisk/.lisk/tmp/blockchain.db.tar.gz
docker run --volume lisk-data:/home/lisk/.lisk -it --rm --entrypoint rm lisk/core:3.0.1 -f /home/lisk/.lisk/tmp/blockchain.db.tar.gz
docker start lisk-core
docker logs -f lisk-core
```
