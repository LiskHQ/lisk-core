`lisk-core keys`
================

Return keys corresponding to the given passphrase.

* [`lisk-core keys:create`](#lisk-core-keyscreate)
* [`lisk-core keys:encrypt`](#lisk-core-keysencrypt)
* [`lisk-core keys:export`](#lisk-core-keysexport)
* [`lisk-core keys:import`](#lisk-core-keysimport)

## `lisk-core keys:create`

Return keys corresponding to the given passphrase.

```
USAGE
  $ lisk-core keys:create

OPTIONS
  -c, --count=count            [default: 1] Number of keys to create
  -f, --offset=offset          [default: 0] Offset for the key derivation path
  -i, --chainid=chainid        [default: 0] Chain id
  -n, --no-encrypt             No encrypted message object to be created
  -o, --output=output          The output directory. Default will set to current working directory.

  -p, --passphrase=passphrase  Specifies a source for your secret passphrase. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --passphrase='my secret passphrase' (should only be used where security is not
                               important)

  -w, --password=password      Specifies a source for your secret password. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --password=pass:password123 (should only be used where security is not important)

EXAMPLES
  keys:create
  keys:create --passphrase your-passphrase
  keys:create --passphrase your-passphrase --no-encrypt
  keys:create --passphrase your-passphrase --password your-password
  keys:create --passphrase your-passphrase --password your-password --count 2
  keys:create --passphrase your-passphrase --no-encrypt --count 2 --offset 1
  keys:create --passphrase your-passphrase --no-encrypt --count 2 --offset 1 --chainid 1
  keys:create --passphrase your-passphrase --password your-password --count 2 --offset 1 --chainid 1 --output 
  /mypath/keys.json
```

_See code: [dist/commands/keys/create.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/keys/create.ts)_

## `lisk-core keys:encrypt`

Encrypt keys from a file and overwrite the file

```
USAGE
  $ lisk-core keys:encrypt

OPTIONS
  -f, --file-path=file-path  (required) Path of the file to encrypt from

  -w, --password=password    Specifies a source for your secret password. Command will prompt you for input if this
                             option is not set.
                             Examples:
                             - --password=pass:password123 (should only be used where security is not important)

EXAMPLES
  keys:encrypt --file-path ./my/path/keys.json
  keys:encrypt --file-path ./my/path/keys.json --password mypass
```

_See code: [dist/commands/keys/encrypt.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/keys/encrypt.ts)_

## `lisk-core keys:export`

Export to <FILE>.

```
USAGE
  $ lisk-core keys:export

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -o, --output=output        (required) The output directory. Default will set to current working directory.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  keys:export --output /mypath/keys.json
  keys:export --output /mypath/keys.json --data-path ./data
```

_See code: [dist/commands/keys/export.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/keys/export.ts)_

## `lisk-core keys:import`

Import from <FILE>.

```
USAGE
  $ lisk-core keys:import

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --file-path=file-path  (required) Path of the file to import from

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  keys:import --file-path ./my/path/keys.json
  keys:import --file-path ./my/path/keys.json --data-path ./data
```

_See code: [dist/commands/keys/import.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/keys/import.ts)_
