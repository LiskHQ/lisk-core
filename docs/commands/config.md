`lisk-core config`
==================

Commands relating to Lisk Core node configuration.

* [`lisk-core config:create`](#lisk-core-configcreate)
* [`lisk-core config:show`](#lisk-core-configshow)

## `lisk-core config:create`

Creates network configuration file.

```
USAGE
  $ lisk-core config:create

OPTIONS
  -i, --chain-id=chain-id  (required) ChainID in hex format. For example, Lisk mainnet mainchain is 00000000
  -l, --label=label        [default: beta-sdk-app] App Label

  -o, --output=output      [default: /Users/sameer/Documents/Lisk/github/lisk-core] Directory where the config file is
                           saved

EXAMPLES
  config:create --output mydir
  config:create --output mydir --label beta-sdk-app
  config:create --output mydir --label beta-sdk-app --community-identifier sdk
```

_See code: [dist/commands/config/create.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/config/create.ts)_

## `lisk-core config:show`

Show application config.

```
USAGE
  $ lisk-core config:show

OPTIONS
  -c, --config=config        File path to a custom config. Environment variable "LISK_CONFIG_FILE" can also be used.

  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  config:show
  config:show --pretty
  config:show --config ./custom-config.json --data-path ./data
```

_See code: [dist/commands/config/show.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/config/show.ts)_
