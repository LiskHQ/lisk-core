`lisk-core block`
=================

Commands relating to Lisk Core blocks.

* [`lisk-core block:get INPUT`](#lisk-core-blockget-input)

## `lisk-core block:get INPUT`

Get block information for a given id or height.

```
USAGE
  $ lisk-core block:get INPUT

ARGUMENTS
  INPUT  Height in number or block id in hex format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  block:get e082e79d01016632c451c9df9276e486cb7f460dc793ff5b10d8f71eecec28b4
  block:get 2
```

_See code: [dist/commands/block/get.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/block/get.ts)_
