# Scripts

Lisk quality assurance scripts.

## Stress Test

Stress test script enables creating and sending transactions to local node.

### Run node locally with default data path

Command to run lisk core node

```sh
./bin/run start -n devnet --enable-ipc
```

Command to run stress test

```sh
$ npm run test:stress
```

### Run node locally with custom data path

Command to run lisk core node

```sh
./bin/run start -n devnet --enable-ipc -d /tmp/test_node
```

Command to run stress test

```sh
$ DATAPATH=/tmp/test_node npm run test:stress
```
