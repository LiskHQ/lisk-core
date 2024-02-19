# Using the lisk/core docker image

lisk/core version 4 does not have any external dependencies and thus does not require using `docker-compose`.

Note: It is also possible to use [podman](https://github.com/containers/podman/) instead of docker by simply replacing the occurrences of docker with podman, in the following examples or alternatively by creating an alias with `alias docker=podman`.

## Run

Run a "lisk-core" container against the mainnet:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 7667:7667 \
           --name lisk-core \
           lisk/core:4.0.2 \
           start --network=mainnet
```

### Configuration

Further parameters can be passed after `--network`, e.g.:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 7667:7667 \
           --publish 127.0.0.1:7887:7887 \
           --name lisk-core \
           lisk/core:4.0.2 \
           start --network=mainnet --api-ws --api-http --log=debug
```

Environment variables can be set with `--env`:

```
docker run --volume lisk-data:/home/lisk/.lisk \
           --publish 7667:7667 \
           --env LISK_LOG_LEVEL=debug \
           --name lisk-core \
           lisk/core:4.0.2 \
           start --network=mainnet
```

See https://lisk.com/documentation/lisk-core/management/configuration.html for a reference of configuration options.

## Import blockchain snapshot

```
docker run --volume lisk-data:/home/lisk/.lisk -it --rm lisk/core:4.0.2 blockchain:download --network=mainnet --output=/home/lisk/.lisk/tmp/

docker run --volume lisk-data:/home/lisk/.lisk -it --rm lisk/core:4.0.2 blockchain:import /home/lisk/.lisk/tmp/blockchain.db.tar.gz

docker run --volume lisk-data:/home/lisk/.lisk -it --rm --entrypoint rm lisk/core:4.0.2 -f /home/lisk/.lisk/tmp/blockchain.db.tar.gz

docker start lisk-core

docker logs -f lisk-core
```
