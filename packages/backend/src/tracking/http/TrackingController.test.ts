import { assert } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect, mockObject } from 'earl'

import {
  OAppConfigurationRecord,
  OAppConfigurationRepository,
} from '../../peripherals/database/OAppConfigurationRepository'
import { OAppDefaultConfigurationRepository } from '../../peripherals/database/OAppDefaultConfigurationRepository'
import {
  OAppRecord,
  OAppRepository,
} from '../../peripherals/database/OAppRepository'
import { OAppConfiguration } from '../domain/configuration'
import { ProtocolVersion } from '../domain/const'
import { TrackingController } from './TrackingController'

describe(TrackingController.name, () => {
  describe('getOApps', () => {
    it('returns null when there are no configurations for the chain ID', async () => {
      const chainId = ChainId.ETHEREUM
      const oAppRepo = mockObject<OAppRepository>({})
      const oAppConfigRepo = mockObject<OAppConfigurationRepository>({})
      const oAppDefaultConfigRepo =
        mockObject<OAppDefaultConfigurationRepository>({
          findBySourceChain: () => Promise.resolve([]),
        })

      const controller = new TrackingController(
        oAppRepo,
        oAppConfigRepo,
        oAppDefaultConfigRepo,
      )
      const result = await controller.getOApps(chainId)

      expect(result).toEqual(null)
    })

    describe('with oApps and default configurations', () => {
      it('returns oApps with configurations marking if given configuration is a default one', async () => {
        const chainId = ChainId.ETHEREUM

        const defaultConfiguration: OAppConfiguration = {
          inboundBlockConfirmations: 1,
          outboundBlockConfirmations: 1,
          outboundProofType: 2,
          inboundProofLibraryVersion: 2,
          relayer: EthereumAddress(
            '0x0000000000000000000000000000000000000001',
          ),
          oracle: EthereumAddress('0x0000000000000000000000000000000000000002'),
        }

        const customConfiguration = {
          ...defaultConfiguration,
          relayer: EthereumAddress(
            '0x0000000000000000000000000000000000000003',
          ),
          oracle: EthereumAddress('0x0000000000000000000000000000000000000004'),
        }
        const oAppA: OAppRecord = {
          id: 1,
          name: 'App 1',
          symbol: 'APP1',
          protocolVersion: ProtocolVersion.V1,
          address: EthereumAddress(
            '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          ),
          sourceChainId: chainId,
        }

        const oAppB: OAppRecord = {
          id: 2,
          name: 'App 2',
          symbol: 'APP2',
          protocolVersion: ProtocolVersion.V1,
          address: EthereumAddress(
            '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          ),
          sourceChainId: chainId,
        }

        const mockConfigurations: OAppConfigurationRecord[] = [
          {
            oAppId: oAppA.id,
            targetChainId: ChainId.ETHEREUM,
            configuration: defaultConfiguration,
          },
          {
            oAppId: oAppA.id,
            targetChainId: ChainId.BSC,
            configuration: customConfiguration,
          },
          {
            oAppId: oAppB.id,
            targetChainId: ChainId.ETHEREUM,
            configuration: customConfiguration,
          },
          {
            oAppId: oAppB.id,
            targetChainId: ChainId.OPTIMISM,
            configuration: defaultConfiguration,
          },
        ]

        const oAppRepo = mockObject<OAppRepository>({
          findBySourceChain: () => Promise.resolve([oAppA, oAppB]),
        })

        const oAppConfigRepo = mockObject<OAppConfigurationRepository>({
          findByOAppIds: () => Promise.resolve(mockConfigurations),
        })
        const oAppDefaultConfigRepo =
          mockObject<OAppDefaultConfigurationRepository>({
            findBySourceChain: (chainId) =>
              Promise.resolve([
                {
                  sourceChainId: chainId,
                  targetChainId: ChainId.ETHEREUM,
                  protocolVersion: ProtocolVersion.V1,
                  configuration: defaultConfiguration,
                },
                {
                  sourceChainId: chainId,
                  targetChainId: ChainId.OPTIMISM,
                  protocolVersion: ProtocolVersion.V1,
                  configuration: defaultConfiguration,
                },
                {
                  sourceChainId: chainId,
                  targetChainId: ChainId.BSC,
                  protocolVersion: ProtocolVersion.V1,
                  configuration: defaultConfiguration,
                },
              ]),
          })

        const controller = new TrackingController(
          oAppRepo,
          oAppConfigRepo,
          oAppDefaultConfigRepo,
        )

        const result = await controller.getOApps(chainId)

        assert(result)
        expect(result.sourceChainId).toEqual(chainId)
        expect(result.oApps).toEqual([
          {
            name: oAppA.name,
            symbol: oAppA.symbol,
            address: oAppA.address,
            iconUrl: null,
            // reflects mockConfigurations
            configurations: [
              {
                targetChainId: ChainId.ETHEREUM,
                configuration: defaultConfiguration,
                isDefault: true,
              },
              {
                targetChainId: ChainId.BSC,
                configuration: customConfiguration,
                isDefault: false,
                diffs: ['relayer', 'oracle'],
              },
            ],
          },
          {
            name: oAppB.name,
            symbol: oAppB.symbol,
            address: oAppB.address,
            iconUrl: null,
            // reflects mockConfigurations
            configurations: [
              {
                targetChainId: ChainId.ETHEREUM,
                configuration: customConfiguration,
                isDefault: false,
                diffs: ['relayer', 'oracle'],
              },
              {
                targetChainId: ChainId.OPTIMISM,
                configuration: defaultConfiguration,
                isDefault: true,
              },
            ],
          },
        ])
      })
    })
  })
})
