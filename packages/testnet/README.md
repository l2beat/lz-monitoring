# @lzmonitoring/testnet

## Setup

You can use pre-baked, dummy server instance by running
`lz-testnet binary`

or you can use it as a library - see `Server Suite`

## Server Suite

For raw server use `getTestnetServer`.
For bundle with providers and wallets use `getTestnet`

If you are using in-process server - you have to start server manually by calling `boot` method once setup.

```ts
const testnet = getTestnet(Logger.SILENT)({
  port: 8000,
})

await testnet.boot()
```

and would be great to stop it by calling `destroy` method.

```ts
await testnet.destroy()
```

## Utils

Utils are attachable to server and provider to extends its functionalities.
All of them are available in `utils` folder and are attached to server and provider in `getTestnet` function.

## Providers

Bundle you get with `getTestnet` function contains 2 providers already setup and ready to use:

- `ganache` - ganache raw provider
- `ethers` - ethers Web3 provider with custom transport setup via ganache raw provider

## Wallets

Package comes with 3 pre-configured wallets with 10000 ETH each. Private keys for those are exposed and free to use for testing purposes. If you want to set up your own wallets you have to pass private keys to server options. You won't get those wrapped in ethers' `Wallet` abstraction so you have to do it yourself.

```ts
const testnet = getTestnet(Logger.SILENT)({
  port: 8000,
  wallet: {
    lock: true,
    accounts: [
      {
        balance: 10_000n * 10n ** 18n,
        secretKey:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
    ],
  },
})
```

## Logging

Logger you pass as a dependency is for general use. Not much used now but might be handy in the future - if not, we will get rid of it.

By default, ganache stdout is muted. If you want to see logs from ganache you have to specify log level in the server options.

```ts
const testnet = getTestnet(Logger.SILENT)({
  port: 8000,
  logging: {
    quite: false // turn off log suppression
    verbose: true // for all logs and rpc calls as a example
    }
})
```

Explore more logging via ganache typings

## Forking

You can fork any rpc-compatible network by passing its url to `fork` option. For more forking options explore type definitions ganache expects. You can also fork stating from specific block by passing `blockNumber` option.

When passing early blocks, make sure your provider is able to serve them.

```ts
const testnet = getTestnet(Logger.SILENT)({
  port: 8000,
  fork: {
    url: 'https://your-mainnet-rpc.com/',
    blockNumber: 1234567,
  },
})
```
