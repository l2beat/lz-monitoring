# @lz/backend Infrastructure and Concepts

Before you start working on the backend it is great to familiarize yourself with core concepts.

## Supported chains

Currently we support 10 EVM-compatible chains.

## Modules

Indexing data on each supported chain is wrapped and abstracted by so-called `discovery submodule`.

Every submodule is responsible for indexing data from a single chain.
Each submodule is equipped with set of `indexers` that are responsible for indexing specific data.

Each module is configurable through environment variables.
Variables are discriminated by chain name as a suffix in case of chain-related configuration and by explorer-name as a suffix in case of explorer-related configuration.

Given you want to index data on **Ethereum** and you are using **Etherscan** as an explorer, you need to set following variables:

```bash

# Important: Enabled module will enforce required variables to be present
ETHEREUM_DISCOVERY_ENABLED=true
ETHEREUM_RPC_URL=<alchemy/quicknode/infura>
ETHERSCAN_API_KEY=your_api_key
ETHEREUM_VISIBLE=true
```

## Indexing

Here is the compiled list of indexers and its responsibilities each chain submodule is equipped with:

- [`LatestBlockNumberIndexer`](src/indexers/LatestBlockNumberIndexer.ts)

  - Responsible for fetching latest block number from the chain
  - Fetching latest block number and passing it further as a tick is configured using `TICK_INTERVAL_MS`
  - It is a **ROOT** indexer supervising peace and tempo of all other indexers by issuing root tick to all children indexers
  - The only one with **no state persistence**

- [`BlockNumberIndexer`](src/indexers/BlockNumberIndexer.ts)
  - Responsible for fetching block every tick.
  - Storing blocks servers as reference/foundation for later data transformations
  - Responsible for issuing invalidation in case of block reorg
- [`CacheInvalidationIndexer`](src/indexers/CacheInvalidationIndexer.ts)

  - Does not contain update logic
  - Solely responsible for invalidating cache in case of reorg

- [`EventIndexer`](src/indexers/EventIndexer.ts)
  - Responsible for fetching events for range from previous tick to current tick
  - Serves optimization purpose, by doing so called `event quick-swipe` we saves ourselves trouble of running discovery on each consecutive block since if given event occurred, we are certain that it is crucial for us to index it
  - Stores events as a block numbers discovery later must be run on
- [`DiscoveryIndexer`](src/indexers/DiscoveryIndexer.ts)
  - Runs discovery on each block marked by `EventIndexer`
  - Saves full discovery output to the database
  - Each run utilize per-chain discovery configuration that can be found in [**discovery configs folder**](src/config/discovery/)
- [`CurrentDiscoveryIndexer`](src/indexers//CurrentDiscoveryIndexer.ts)
  - Combines latest discovery output and combines it with metadata ready to be utilized by frontend
- [`ChangelogIndexer`](src/indexers/ChangelogIndexer.ts)
  - Responsible for comparing previous outputs in form of pairs and deriving changes made to the protocol between paired outputs
  - Filters-out changes that are not whitelisted

> **Indexers are related and connected in the linear waterfall manner.** **Invalidation in one indexer will affect and invalidate all its children to the required height.**

|    Indexer waterfall     |
| :----------------------: |
| LatestBlockNumberIndexer |
|            ⬇️            |
|    BlockNumberIndexer    |
|            ⬇️            |
| CacheInvalidationIndexer |
|            ⬇️            |
|       EventIndexer       |
|            ⬇️            |
|     DiscoveryIndexer     |
|            ⬇️            |
| CurrentDiscoveryIndexer  |
|            ⬇️            |
|     ChangelogIndexer     |

## Discovery config description

Each chain must have its own configuration in `src/config/discovery/`

See [**discovery configs folder**](src/config/discovery/) for more details.
