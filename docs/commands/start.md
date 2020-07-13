`core start`
============

Start Lisk Core Node with given config parameters

* [`core start`](#core-start)

## `core start`

Start Lisk Core Node with given config parameters

```
USAGE
  $ core start

OPTIONS
  -c, --config=config                              File path to a custom config. Environment variable "LISK_CONFIG_FILE"
                                                   can also be used.

  -d, --data-path=data-path                        Directory path to specify where node data is stored. Environment
                                                   variable "LISK_DATA_PATH" can also be used.

  -l, --log=trace|debug|info|warn|error|fatal      File log level. Environment variable "LISK_FILE_LOG_LEVEL" can also
                                                   be used.

  -n, --network=network                            Default network config to use. Environment variable "LISK_NETWORK"
                                                   can also be used.

  -p, --port=port                                  Open port for the peer to peer incoming connections. Environment
                                                   variable "LISK_PORT" can also be used.

  -x, --peer=peer                                  Seed peer to initially connect to in format of "ip:port".

  --console-log=trace|debug|info|warn|error|fatal  Console log level. Environment variable "LISK_CONSOLE_LOG_LEVEL" can
                                                   also be used.

  --enable-ipc                                     Enable IPC communication.

EXAMPLES
  start
  start --network dev --data-path ./data --log debug
```

_See code: [dist/commands/start.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-beta.1/dist/commands/start.ts)_