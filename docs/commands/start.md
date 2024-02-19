`lisk-core start`
=================

Start Blockchain Node.

* [`lisk-core start`](#lisk-core-start)

## `lisk-core start`

Start Blockchain Node.

```
USAGE
  $ lisk-core start

OPTIONS
  -c, --config=config                                  File path to a custom config. Environment variable
                                                       "LISK_CONFIG_FILE" can also be used.

  -d, --data-path=data-path                            Directory path to specify where node data is stored. Environment
                                                       variable "LISK_DATA_PATH" can also be used.

  -l, --log=trace|debug|info|warn|error|fatal          Log level. Environment variable "LISK_LOG_LEVEL" can also be
                                                       used.

  -n, --network=network                                [default: mainnet] Default network config to use. Environment
                                                       variable "LISK_NETWORK" can also be used.

  -p, --port=port                                      Open port for the peer to peer incoming connections. Environment
                                                       variable "LISK_PORT" can also be used.

  -u, --genesis-block-url=genesis-block-url            The URL to download the genesis block. Environment variable
                                                       "LISK_GENESIS_BLOCK_URL" can also be used. Kindly ensure that the
                                                       provided URL downloads the genesis block 'blob' in the tarball
                                                       format.

  --api-host=api-host                                  Host to be used for api-client. Environment variable
                                                       "LISK_API_HOST" can also be used.

  --api-http                                           Enable HTTP communication for api-client. Environment variable
                                                       "LISK_API_HTTP" can also be used.

  --api-ipc                                            Enable IPC communication. This will load plugins as a child
                                                       process and communicate over IPC. Environment variable
                                                       "LISK_API_IPC" can also be used.

  --api-port=api-port                                  Port to be used for api-client. Environment variable
                                                       "LISK_API_PORT" can also be used.

  --api-ws                                             Enable websocket communication for api-client. Environment
                                                       variable "LISK_API_WS" can also be used.

  --dashboard-plugin-port=dashboard-plugin-port        Port to be used for Dashboard Plugin. Environment variable
                                                       "LISK_DASHBOARD_PLUGIN_PORT" can also be used.

  --enable-chain-connector-plugin                      Enable Chain Connector Plugin. Environment variable
                                                       "LISK_ENABLE_CHAIN_CONNECTOR_PLUGIN" can also be used.

  --enable-dashboard-plugin                            Enable Dashboard Plugin. Environment variable
                                                       "LISK_ENABLE_DASHBOARD_PLUGIN" can also be used.

  --enable-faucet-plugin                               Enable Faucet Plugin. Environment variable
                                                       "LISK_ENABLE_FAUCET_PLUGIN" can also be used.

  --enable-forger-plugin                               Enable Forger Plugin. Environment variable
                                                       "LISK_ENABLE_FORGER_PLUGIN" can also be used.

  --enable-monitor-plugin                              Enable Monitor Plugin. Environment variable
                                                       "LISK_ENABLE_MONITOR_PLUGIN" can also be used.

  --enable-report-misbehavior-plugin                   Enable ReportMisbehavior Plugin. Environment variable
                                                       "LISK_ENABLE_REPORT_MISBEHAVIOR_PLUGIN" can also be used.

  --faucet-plugin-port=faucet-plugin-port              Port to be used for Faucet Plugin. Environment variable
                                                       "LISK_FAUCET_PLUGIN_PORT" can also be used.

  --monitor-plugin-port=monitor-plugin-port            Port to be used for Monitor Plugin. Environment variable
                                                       "LISK_MONITOR_PLUGIN_PORT" can also be used.

  --monitor-plugin-whitelist=monitor-plugin-whitelist  List of IPs in comma separated value to allow the connection.
                                                       Environment variable "LISK_MONITOR_PLUGIN_WHITELIST" can also be
                                                       used.

  --overwrite-config                                   Overwrite network configs if they exist already

  --overwrite-genesis-block                            Download and overwrite existing genesis block. Environment
                                                       variable "LISK_GENESIS_BLOCK_OVERWRITE" can also be used.

  --seed-peers=seed-peers                              Seed peers to initially connect to in format of comma separated
                                                       "ip:port". IP can be DNS name or IPV4 format. Environment
                                                       variable "LISK_SEED_PEERS" can also be used.

EXAMPLES
  start
  start --network devnet --data-path /path/to/data-dir --log debug
  start --network devnet --api-ws
  start --network devnet --api-ws --api-port 8888
  start --network devnet --port 9000
  start --network devnet --port 9002 --seed-peers 127.0.0.1:9001,127.0.0.1:9000
  start --network testnet --overwrite-config
  start --network testnet --config ~/my_custom_config.json
```

_See code: [dist/commands/start.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/start.ts)_
