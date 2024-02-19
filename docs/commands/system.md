`lisk-core system`
==================

Commands relating to Lisk Core node.

* [`lisk-core system:metadata`](#lisk-core-systemmetadata)
* [`lisk-core system:node-info`](#lisk-core-systemnode-info)

## `lisk-core system:metadata`

Get node metadata from a running application.

```
USAGE
  $ lisk-core system:metadata

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  system:metadata
  system:metadata --data-path ./lisk
```

_See code: [dist/commands/system/metadata.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/system/metadata.ts)_

## `lisk-core system:node-info`

Get node information from a running application.

```
USAGE
  $ lisk-core system:node-info

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  system:node-info
  system:node-info --data-path ./lisk
```

_See code: [dist/commands/system/node-info.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/system/node-info.ts)_
