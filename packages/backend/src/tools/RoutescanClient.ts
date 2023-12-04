import { assert } from '@l2beat/backend-tools'
import {
  EtherscanLikeClient,
  getErrorMessage,
  tryParseEtherscanResponse,
} from '@l2beat/discovery'
import {
  ContractSource,
  ContractSourceResult,
  // eslint-disable-next-line import/no-internal-modules
} from '@l2beat/discovery/dist/utils/BlockchainExplorer'
// eslint-disable-next-line import/no-internal-modules
import { EthereumAddress } from '@l2beat/discovery/dist/utils/EthereumAddress'

class RoutescanError extends Error {}

/**
 * @notice Routescan does not return etherscan-compatible response for
 * unverified contracts.
 */
export class RoutescanClient extends EtherscanLikeClient {
  override async call(
    module: string,
    action: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    const query = new URLSearchParams({
      module,
      action,
      ...params,
      apikey: this.apiKey,
    })
    const url = `${this.url}?${query.toString()}`

    const start = Date.now()
    const { httpResponse, error } = await this.httpClient
      .fetch(url, { timeout: this.timeoutMs })
      .then(
        (httpResponse) => ({ httpResponse, error: undefined }),
        (error: unknown) => ({ httpResponse: undefined, error }),
      )
    const timeMs = Date.now() - start

    if (!httpResponse) {
      const message = getErrorMessage(error)
      this.recordError(module, action, timeMs, message)
      throw error
    }

    const text = await httpResponse.text()
    const etherscanResponse = tryParseEtherscanResponse(text)

    if (!httpResponse.ok) {
      this.recordError(module, action, timeMs, text)
      throw new Error(
        `Server responded with non-2XX result: ${httpResponse.status} ${httpResponse.statusText}`,
      )
    }

    if (!etherscanResponse) {
      const message = `Invalid Etherscan response [${text}] for request [${url}].`
      this.recordError(module, action, timeMs, message)
      throw new TypeError(message)
    }

    if (etherscanResponse.message === 'NOTOK' && action === 'getsourcecode') {
      this.logger.debug({
        type: 'success',
        notice: 'proceeding with monkey patch',
        timeMs,
        module,
        action,
      })
      return etherscanResponse.result
    }

    if (etherscanResponse.message !== 'OK') {
      this.recordError(module, action, timeMs, etherscanResponse.result)
      throw new RoutescanError(etherscanResponse.result)
    }

    this.logger.debug({ type: 'success', timeMs, module, action })
    return etherscanResponse.result
  }

  override async getContractSource(
    address: EthereumAddress,
  ): Promise<ContractSource> {
    const response = await this.call('contract', 'getsourcecode', {
      address: address.toString(),
    })

    if (response === 'Contract source code not verified') {
      return UnverifiedContractMonkeyPatch
    }

    const source = ContractSourceResult.parse(response)

    assert(source[0])

    return source[0]
  }
}

const UnverifiedContractMonkeyPatch = {
  SourceCode: '',
  ABI: 'Contract source code not verified',
  ContractName: '',
  CompilerVersion: '',
  OptimizationUsed: '',
  Runs: '',
  ConstructorArguments: '',
  EVMVersion: 'Default',
  Library: '',
  LicenseType: 'Unknown',
  Proxy: '0',
  Implementation: '',
  SwarmSource: '',
}
