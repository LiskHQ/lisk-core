`lisk-core blockchain`
======================

Commands relating to Lisk Core blockchain data.

* [`lisk-core blockchain:download`](#lisk-core-blockchaindownload)
* [`lisk-core blockchain:export`](#lisk-core-blockchainexport)
* [`lisk-core blockchain:hash`](#lisk-core-blockchainhash)
* [`lisk-core blockchain:import FILEPATH`](#lisk-core-blockchainimport-filepath)
* [`lisk-core blockchain:reset`](#lisk-core-blockchainreset)

## `lisk-core blockchain:download`

Download snapshot from <URL>.

```
USAGE
  $ lisk-core blockchain:download

OPTIONS
  -n, --network=network  [default: mainnet] Default network config to use. Environment variable "LISK_NETWORK" can also
                         be used.

  -o, --output=output    Directory path to specify where snapshot is downloaded. By default outputs the files to current
                         working directory.

  -u, --url=url          The url to the snapshot.

EXAMPLES
  download
  download --network betanet
  download --url https://snapshots.lisk.com/mainnet/blockchain.db.tar.gz --output ./downloads
```

_See code: [dist/commands/blockchain/download.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/blockchain/download.ts)_

## `lisk-core blockchain:export`

Export to <FILE>.

```
USAGE
  $ lisk-core blockchain:export

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -o, --output=output        The output directory. Default will set to current working directory.

EXAMPLES
  blockchain:export
  blockchain:export --data-path ./data --output ./my/path/
```

_See code: [dist/commands/blockchain/export.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/blockchain/export.ts)_

## `lisk-core blockchain:hash`

Generate SHA256 hash from <PATH>.

```
USAGE
  $ lisk-core blockchain:hash

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

EXAMPLES
  blockchain:hash
  blockchain:hash --data-path ./data
```

_See code: [dist/commands/blockchain/hash.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/blockchain/hash.ts)_

## `lisk-core blockchain:import FILEPATH`

Import from <FILE>.

```
USAGE
  $ lisk-core blockchain:import FILEPATH

ARGUMENTS
  FILEPATH  Path to the gzipped blockchain data.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --force                Delete and overwrite existing blockchain data

EXAMPLES
  blockchain:import ./path/to/blockchain.tar.gz
  blockchain:import ./path/to/blockchain.tar.gz --data-path ./lisk/
  blockchain:import ./path/to/blockchain.tar.gz --data-path ./lisk/ --force
```

_See code: [dist/commands/blockchain/import.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/blockchain/import.ts)_

## `lisk-core blockchain:reset`

Reset the blockchain data.

```
USAGE
  $ lisk-core blockchain:reset

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -y, --yes                  Skip confirmation prompt.

EXAMPLES
  blockchain:reset
  blockchain:reset --data-path ./lisk
  blockchain:reset --yes
```

_See code: [dist/commands/blockchain/reset.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/blockchain/reset.ts)_
