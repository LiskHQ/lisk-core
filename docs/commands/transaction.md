# `lisk-core transaction`

Commands relating to Lisk Core transactions.

- [`lisk-core transaction:create MODULEID COMMANDID FEE`](#lisk-core-transactioncreate-moduleid-commandid-fee)
- [`lisk-core transaction:get ID`](#lisk-core-transactionget-id)
- [`lisk-core transaction:send TRANSACTION`](#lisk-core-transactionsend-transaction)
- [`lisk-core transaction:sign TRANSACTION`](#lisk-core-transactionsign-transaction)

## `lisk-core transaction:create MODULEID COMMANDID FEE`

Create transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

```
USAGE
  $ lisk-core transaction:create MODULEID COMMANDID FEE

ARGUMENTS
  MODULEID  Registered transaction module id.
  COMMANDID Registered transaction asset id.
  FEE       Transaction fee in Beddows.

OPTIONS
  -a, --asset=asset                          Creates transaction with specific asset information

  -d, --data-path=data-path                  Directory path to specify where node data is stored. Environment variable
                                             "LISK_DATA_PATH" can also be used.

  -j, --json                                 Print the transaction in JSON format

  -n, --network=network                      [default: mainnet] Default network config to use. Environment variable
                                             "LISK_NETWORK" can also be used.

  -p, --passphrase=passphrase                Specifies a source for your secret passphrase. Command will prompt you for
                                             input if this option is not set.
                                             Examples:
                                             - --passphrase='my secret passphrase' (should only be used where security
                                             is not important)

  -s, --sender-public-key=sender-public-key  Creates the transaction with provided sender publickey, when passphrase is
                                             not provided

  --network-identifier=network-identifier    Network identifier defined for the network or main | test for the Lisk
                                             Network.

  --no-signature                             Creates the transaction without a signature. Your passphrase will therefore
                                             not be required

  --nonce=nonce                              Nonce of the transaction.

  --offline                                  Specify whether to connect to a local node or not.

  --pretty                                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  transaction:create 2 0 100000000
  --asset='{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}'
  transaction:create 2 0 100000000
  --asset='{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}'
  --json
  transaction:create 2 0 100000000 --offline --network mainnet --network-identifier
  873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 --nonce 1
  --asset='{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}'
```

_See code: [dist/commands/transaction/create.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/transaction/create.ts)_

## `lisk-core transaction:get ID`

Get transaction from local node by ID.

```
USAGE
  $ lisk-core transaction:get ID

ARGUMENTS
  ID  Transaction ID in hex format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:get eab06c6a22e88bca7150e0347a7d976acd070cb9284423e6eabecd657acc1263
```

_See code: [dist/commands/transaction/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/transaction/get.ts)_

## `lisk-core transaction:send TRANSACTION`

Send transaction to the local node.

```
USAGE
  $ lisk-core transaction:send TRANSACTION

ARGUMENTS
  TRANSACTION  A transaction to be sent to the node encoded as hex string

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:send
  080810011880cab5ee012220fd061b9146691f3c56504be051175d5b76d1b1d0179c5c4370e18534c58821222a2408641214ab0041a7d3f7b2c290
  b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e324028edd3601cdc35a41bb23415a0d9f3c3e9cf188d9971adf18742cea39d58aa84809a
  a87bcfe6feaac46211c80472ad9297fd87727709f5d7e7b4134caf106b02
```

_See code: [dist/commands/transaction/send.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/transaction/send.ts)_

## `lisk-core transaction:sign TRANSACTION`

Sign encoded transaction.

```
USAGE
  $ lisk-core transaction:sign TRANSACTION

ARGUMENTS
  TRANSACTION  The transaction to be signed encoded as hex string

OPTIONS
  -d, --data-path=data-path                  Directory path to specify where node data is stored. Environment variable
                                             "LISK_DATA_PATH" can also be used.

  -j, --json                                 Print the transaction in JSON format.

  -n, --network=network                      [default: mainnet] Default network config to use. Environment variable
                                             "LISK_NETWORK" can also be used.

  -p, --passphrase=passphrase                Specifies a source for your secret passphrase. Command will prompt you for
                                             input if this option is not set.
                                             Examples:
                                             - --passphrase='my secret passphrase' (should only be used where security
                                             is not important)

  -s, --sender-public-key=sender-public-key  Sign the transaction with provided sender public key, when passphrase is
                                             not provided

  --include-sender                           Include sender signature in transaction.

  --mandatory-keys=mandatory-keys            Mandatory publicKey string in hex format.

  --network-identifier=network-identifier    Network identifier defined for the network or main | test for the Lisk
                                             Network.

  --offline                                  Specify whether to connect to a local node or not.

  --optional-keys=optional-keys              Optional publicKey string in hex format.

  --pretty                                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  transaction:sign <hex-encoded-binary-transaction>
  transaction:sign <hex-encoded-binary-transaction> --network testnet
```

_See code: [dist/commands/transaction/sign.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/transaction/sign.ts)_
