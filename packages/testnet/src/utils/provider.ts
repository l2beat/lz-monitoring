import { providers, Wallet } from 'ethers'
import { EthereumProvider } from 'ganache'

import { ALICE_PK, BOB_PK, CHARLIE_PK } from './wallets'

export { getEthersProvider, setupEthersWallets }

function getEthersProvider(provider: EthereumProvider) {
  return new providers.Web3Provider(
    provider as unknown as providers.ExternalProvider,
  )
}

function setupEthersWallets(provider: providers.Provider) {
  return {
    alice: new Wallet(ALICE_PK, provider),
    bob: new Wallet(BOB_PK, provider),
    charlie: new Wallet(CHARLIE_PK, provider),
  }
}
