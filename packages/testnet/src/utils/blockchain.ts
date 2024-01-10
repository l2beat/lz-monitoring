import { Ethereum, EthereumProvider } from 'ganache'

export { attachBlockchainUtils }

function attachBlockchainUtils(ganacheProvider: EthereumProvider) {
  function mine(opts?: Ethereum.MineOptions) {
    return ganacheProvider.request({
      method: 'evm_mine',
      params: opts ? [opts] : [],
    })
  }

  return {
    mine,
  }
}
