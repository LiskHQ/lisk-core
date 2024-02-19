`lisk-core transaction`
=======================

Commands relating to Lisk Core transactions.

* [`lisk-core transaction:create MODULE COMMAND FEE`](#lisk-core-transactioncreate-module-command-fee)
* [`lisk-core transaction:get ID`](#lisk-core-transactionget-id)
* [`lisk-core transaction:send TRANSACTION`](#lisk-core-transactionsend-transaction)
* [`lisk-core transaction:sign TRANSACTION`](#lisk-core-transactionsign-transaction)

## `lisk-core transaction:create MODULE COMMAND FEE`

Create transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

```
USAGE
  $ lisk-core transaction:create MODULE COMMAND FEE

ARGUMENTS
  MODULE   Registered transaction module.
  COMMAND  Registered transaction command.
  FEE      Transaction fee in Beddows.

OPTIONS
  -a, --params=params                            Creates transaction with specific params information

  -d, --data-path=data-path                      Directory path to specify where node data is stored. Environment
                                                 variable "LISK_DATA_PATH" can also be used.

  -f, --file=file                                The file to upload.
                                                 Example:
                                                 --file=./myfile.json

  -j, --json                                     Print the transaction in JSON format.

  -k, --key-derivation-path=key-derivation-path  [default: m/44'/134'/0'] Key derivation path to use to derive keypair
                                                 from passphrase

  -p, --passphrase=passphrase                    Specifies a source for your secret passphrase. Command will prompt you
                                                 for input if this option is not set.
                                                 Examples:
                                                 - --passphrase='my secret passphrase' (should only be used where
                                                 security is not important)

  -s, --sender-public-key=sender-public-key      Set a custom senderPublicKey property for the transaction, to be used
                                                 when account address does not correspond to signer's private key

  --chain-id=chain-id

  --no-signature                                 Creates the transaction without a signature. Your passphrase will
                                                 therefore not be required

  --nonce=nonce                                  Nonce of the transaction.

  --offline                                      Specify whether to connect to a local node or not.

  --pretty                                       Prints JSON in pretty format rather than condensed.

  --send                                         Create and immediately send transaction to a node

EXAMPLES
  transaction:create token transfer 100000000 --params='{"amount":100000000,"tokenID":"0400000000000000","recipientAddre
  ss":"lskycz7hvr8yfu74bcwxy2n4mopfmjancgdvxq8xz","data":"send token"}'
  transaction:create token transfer 100000000 --params='{"amount":100000000,"tokenID":"0400000000000000","recipientAddre
  ss":"lskycz7hvr8yfu74bcwxy2n4mopfmjancgdvxq8xz","data":"send token"}' --json
  transaction:create token transfer 100000000 --offline --network mainnet --chain-id 10000000 --nonce 1 --params='{"amou
  nt":100000000,"tokenID":"0400000000000000","recipientAddress":"lskycz7hvr8yfu74bcwxy2n4mopfmjancgdvxq8xz","data":"send
   token"}'
  transaction:create token transfer 100000000 --file=/txn_params.json
  transaction:create token transfer 100000000 --file=/txn_params.json --json
```

_See code: [dist/commands/transaction/create.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/transaction/create.ts)_

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

_See code: [dist/commands/transaction/get.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/transaction/get.ts)_

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
  transaction:send 080810011880cab5ee012220fd061b9146691f3c56504be051175d5b76d1b1d0179c5c4370e18534c58821222a2408641214a
  b0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e324028edd3601cdc35a41bb23415a0d9f3c3e9cf188d9971adf1874
  2cea39d58aa84809aa87bcfe6feaac46211c80472ad9297fd87727709f5d7e7b4134caf106b02
```

_See code: [dist/commands/transaction/send.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/transaction/send.ts)_

## `lisk-core transaction:sign TRANSACTION`

Sign encoded transaction.

```
USAGE
  $ lisk-core transaction:sign TRANSACTION

ARGUMENTS
  TRANSACTION  The transaction to be signed encoded as hex string

OPTIONS
  -d, --data-path=data-path                      Directory path to specify where node data is stored. Environment
                                                 variable "LISK_DATA_PATH" can also be used.

  -j, --json                                     Print the transaction in JSON format.

  -k, --key-derivation-path=key-derivation-path  [default: m/44'/134'/0'] Key derivation path to use to derive keypair
                                                 from passphrase

  -p, --passphrase=passphrase                    Specifies a source for your secret passphrase. Command will prompt you
                                                 for input if this option is not set.
                                                 Examples:
                                                 - --passphrase='my secret passphrase' (should only be used where
                                                 security is not important)

  --chain-id=chain-id

  --mandatory-keys=mandatory-keys                Mandatory publicKey string in hex format.

  --offline                                      Specify whether to connect to a local node or not.

  --optional-keys=optional-keys                  Optional publicKey string in hex format.

  --pretty                                       Prints JSON in pretty format rather than condensed.

EXAMPLES
  transaction:sign <hex-encoded-binary-transaction>
  transaction:sign <hex-encoded-binary-transaction> --network testnet
```

_See code: [dist/commands/transaction/sign.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.2/dist/commands/transaction/sign.ts)_
