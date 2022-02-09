# `lisk-core start`

Start Lisk Core Node.

- [`lisk-core start`](#lisk-core-start)

## `lisk-core start`

Start Lisk Core Node.

```
USAGE
  $ lisk-core start

OPTIONS
  -c, --config=config                                    File path to a custom config. Environment variable
                                                         "LISK_CONFIG_FILE" can also be used.

  -d, --data-path=data-path                              Directory path to specify where node data is stored.
                                                         Environment variable "LISK_DATA_PATH" can also be used.

  -l, --log=trace|debug|info|warn|error|fatal            File log level. Environment variable "LISK_FILE_LOG_LEVEL" can
                                                         also be used.

  -n, --network=network                                  [default: mainnet] Default network config to use. Environment
                                                         variable "LISK_NETWORK" can also be used.

  -p, --port=port                                        Open port for the peer to peer incoming connections.
                                                         Environment variable "LISK_PORT" can also be used.

  --api-ipc                                              Enable IPC communication. This will also load up plugins in
                                                         child process and communicate over IPC.

  --api-ws                                               Enable websocket communication for api-client.

  --api-ws-host=api-ws-host                              Host to be used for api-client websocket.

  --api-ws-port=api-ws-port                              Port to be used for api-client websocket.

  --console-log=trace|debug|info|warn|error|fatal        Console log level. Environment variable
                                                         "LISK_CONSOLE_LOG_LEVEL" can also be used.

  --enable-faucet-plugin                                 Enable Faucet Plugin. Environment variable
                                                         "LISK_ENABLE_FAUCET_PLUGIN" can also be used.

  --enable-forger-plugin                                 Enable Forger Plugin. Environment variable
                                                         "LISK_ENABLE_FORGER_PLUGIN" can also be used.

  --enable-http-api-plugin                               Enable HTTP API Plugin. Environment variable
                                                         "LISK_ENABLE_HTTP_API_PLUGIN" can also be used.

  --enable-monitor-plugin                                Enable Monitor Plugin. Environment variable
                                                         "LISK_ENABLE_MONITOR_PLUGIN" can also be used.

  --enable-report-misbehavior-plugin                     Enable ReportMisbehavior Plugin. Environment variable
                                                         "LISK_ENABLE_REPORT_MISBEHAVIOR_PLUGIN" can also be used.

  --http-api-plugin-host=http-api-plugin-host            Host to be used for HTTP API Plugin. Environment variable
                                                         "LISK_HTTP_API_PLUGIN_HOST" can also be used.

  --http-api-plugin-port=http-api-plugin-port            Port to be used for HTTP API Plugin. Environment variable
                                                         "LISK_HTTP_API_PLUGIN_PORT" can also be used.

  --http-api-plugin-whitelist=http-api-plugin-whitelist  List of IPs in comma separated value to allow the connection.
                                                         Environment variable "LISK_HTTP_API_PLUGIN_WHITELIST" can also
                                                         be used.

  --monitor-plugin-host=monitor-plugin-host              Host to be used for Monitor Plugin. Environment variable
                                                         "LISK_MONITOR_PLUGIN_HOST" can also be used.

  --monitor-plugin-port=monitor-plugin-port              Port to be used for Monitor Plugin. Environment variable
                                                         "LISK_MONITOR_PLUGIN_PORT" can also be used.

  --monitor-plugin-whitelist=monitor-plugin-whitelist    List of IPs in comma separated value to allow the connection.
                                                         Environment variable "LISK_MONITOR_PLUGIN_WHITELIST" can also
                                                         be used.

  --overwrite-config                                     Overwrite network configs if they exist already

  --seed-peers=seed-peers                                Seed peers to initially connect to in format of comma separated
                                                         "ip:port". IP can be DNS name or IPV4 format. Environment
                                                         variable "LISK_SEED_PEERS" can also be used.

EXAMPLES
  start
  start --network devnet --data-path /path/to/data-dir --log debug
  start --network devnet --api-ws
  start --network devnet --api-ws --api-ws-host 0.0.0.0 --api-ws-port 8888
  start --network devnet --port 9000
  start --network devnet --port 9002 --seed-peers 127.0.0.1:9001,127.0.0.1:9000
  start --network testnet --overwrite-config
  start --network testnet --config ~/my_custom_config.json
```

_See code: [dist/commands/start.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/start.ts)_
