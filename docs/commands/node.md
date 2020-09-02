# `lisk-core node`

Gets node information from a running application

- [`lisk-core node:info`](#lisk-core-nodeinfo)

## `lisk-core node:info`

Gets node information from a running application

```
USAGE
  $ lisk-core node:info

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  node:info
  node:info --data-path ./lisk
```

_See code: [dist/commands/node/info.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/node/info.ts)_