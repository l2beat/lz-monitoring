import { EtherscanLikeClient } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { ContractSource } from '@l2beat/discovery/dist/utils/EtherscanLikeClient'
import { EthereumAddress } from '@lz/libs'
import fs from 'fs'

const defaultMetaOverride = {
  SourceCode: '',
  CompilerVersion: 'v0.8.22+commit.4fc1097e',
  OptimizationUsed: '1',
  Runs: '20000',
  ConstructorArguments:
    '000000000000000000000000464570ada09869d8741132183721b4f0769a02870000000000000000000000000000000000000000000000000000000000030d400000000000000000000000000000000000000000000000000001c6bf52634000',
  EVMVersion: 'paris',
  Library: '',
  LicenseType: '',
  Proxy: '0',
  Implementation: '',
  SwarmSource: '',
} as const

const overrides: Record<string, ContractSource> = {
  // send301
  [EthereumAddress('0xf0e25d92b9e5ef8d3982f430a8d061a18809cd9c').toString()]: {
    ABI: fs.readFileSync(`${__dirname}/SendUln301.json`, 'utf-8'),
    ContractName: 'SendUln301',
    ...defaultMetaOverride,
  },
  // receive301
  [EthereumAddress('0x94c1483aecef5d1402f9b14ffb29baf91af53bbd').toString()]: {
    ABI: fs.readFileSync(`${__dirname}/ReceiveUln301.json`, 'utf-8'),
    ContractName: 'ReceiveUln301',
    ...defaultMetaOverride,
  },
  // send302 - verified!
  //   '0xb3f5e2ae7a0a7c4abc809730d8e5699020f466ef': {}
  // receive302
  [EthereumAddress('0xfa824de09da4a013e3bb7be7941af87b9481b869').toString()]: {
    ABI: fs.readFileSync(`${__dirname}/ReceiveUln302.json`, 'utf-8'),
    ContractName: 'ReceiveUln302',
    ...defaultMetaOverride,
  },
}

export class SpoofedEtherscanLikeClient extends EtherscanLikeClient {
  override async getContractSource(
    address: EthereumAddress,
  ): Promise<ContractSource> {
    if (address.toString() in overrides) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const override = overrides[address.toString()]!

      this.logger.info(
        `Using local override for ${address.toString()} - ${
          override.ContractName
        }`,
      )

      return override
    }

    return super.getContractSource(address)
  }
}
