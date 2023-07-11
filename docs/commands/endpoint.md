`lisk-core endpoint`
====================

Invokes the provided endpoint.

* [`lisk-core endpoint:invoke ENDPOINT [PARAMS]`](#lisk-core-endpointinvoke-endpoint-params)
* [`lisk-core endpoint:list [ENDPOINT]`](#lisk-core-endpointlist-endpoint)

## `lisk-core endpoint:invoke ENDPOINT [PARAMS]`

Invokes the provided endpoint.

```
USAGE
  $ lisk-core endpoint:invoke ENDPOINT [PARAMS]

ARGUMENTS
  ENDPOINT  Endpoint to invoke
  PARAMS    Endpoint parameters (Optional)

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --file=file            Input file.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  endpoint:invoke {endpoint} {parameters}
  endpoint:invoke --data-path --file
  endpoint:invoke generator_getAllKeys
  endpoint:invoke consensus_getBFTParameters '{"height": 2}' -d ~/.lisk/pos-mainchain --pretty
  endpoint:invoke consensus_getBFTParameters -f ./input.json
```

_See code: [dist/commands/endpoint/invoke.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/endpoint/invoke.ts)_

## `lisk-core endpoint:list [ENDPOINT]`

Lists registered endpoints.

```
USAGE
  $ lisk-core endpoint:list [ENDPOINT]

ARGUMENTS
  ENDPOINT  Endpoint name (Optional)

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -i, --info                 Prints additional info; Request and Response objects.

  -m, --module=module        Parent module.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  endpoint:list
  endpoint:list {endpoint} -m {module}
  endpoint:list {endpoint} -m {module} -i
  endpoint:list -m validator
  endopint:list getBalance
  endpoint:list get -m token 
  endpoint:list getBalances -m token -i --pretty
  endpoint:list getBalances -m token -d ~/.lisk/pos-mainchain
```

_See code: [dist/commands/endpoint/list.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-beta.4/dist/commands/endpoint/list.ts)_
