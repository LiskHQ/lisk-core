# `core start`

Start Lisk Core Node with given config parameters

- [`core start`](#core-start)

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

  -n, --network=network                            [default: mainnet] Default network config to use. Environment
                                                   variable "LISK_NETWORK" can also be used.

  -p, --port=port                                  Open port for the peer to peer incoming connections. Environment
                                                   variable "LISK_PORT" can also be used.

  --console-log=trace|debug|info|warn|error|fatal  Console log level. Environment variable "LISK_CONSOLE_LOG_LEVEL" can
                                                   also be used.

  --enable-forger                                  Enable Forger Plugin. Environment variable "LISK_ENABLE_FORGER" can
                                                   also be used.

  --enable-http-api                                Enable HTTP API Plugin. Environment variable "LISK_ENABLE_HTTP_API"
                                                   can also be used.

  --enable-ipc                                     Enable IPC communication.

  --forger-port=forger-port                        Port to be used for Forger Plugin. Environment variable
                                                   "LISK_FORGER_PORT" can also be used.

  --forger-whitelist=forger-whitelist              List of IPs in comma separated value to allow the connection.
                                                   Environment variable "LISK_FORGER_WHITELIST" can also be used.

  --http-api-port=http-api-port                    Port to be used for HTTP API Plugin. Environment variable
                                                   "LISK_HTTP_API_PORT" can also be used.

  --http-api-whitelist=http-api-whitelist          List of IPs in comma separated value to allow the connection.
                                                   Environment variable "LISK_HTTP_API_WHITELIST" can also be used.

  --peers=peers                                    Seed peers to initially connect to in format of comma separated
                                                   "ip:port". IP can be DNS name or IPV4 format. Environment variable
                                                   "LISK_PEERS" can also be used.

EXAMPLES
  start
  start --network dev --data-path ./data --log debug
```

_See code: [dist/commands/start.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-beta.1/dist/commands/start.ts)_
