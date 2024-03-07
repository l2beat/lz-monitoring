import { assert, Logger } from '@l2beat/backend-tools'
import { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'

import { CurrentDiscoveryRepository } from '../../../peripherals/database/CurrentDiscoveryRepository'
import { DiscoveryDefaultConfigurationsProvider } from './DefaultConfigurationsProvider'

describe(DiscoveryDefaultConfigurationsProvider.name, () => {
  it('returns null if no latest discovery was found', async () => {
    const currDiscoveryRepo = mockObject<CurrentDiscoveryRepository>({
      find: mockFn().resolvesTo(null),
    })

    const provider = new DiscoveryDefaultConfigurationsProvider(
      currDiscoveryRepo,
      ChainId.ETHEREUM,
      Logger.SILENT,
    )

    const result = await provider.getConfigurations()

    expect(result).toEqual(null)
  })

  it('returns default configurations based on discovery output', async () => {
    const currDiscoveryRepo = mockObject<CurrentDiscoveryRepository>({
      find: mockFn().resolvesTo({ discoveryOutput: mockOutput }),
    })

    const provider = new DiscoveryDefaultConfigurationsProvider(
      currDiscoveryRepo,
      ChainId.ETHEREUM,
      Logger.SILENT,
    )

    const result = await provider.getConfigurations()

    assert(result)
    const keys = Object.keys(result)

    // Remapped chain ids
    expect(keys).toEqual([
      '1',
      '10',
      '56',
      '137',
      '1101',
      '8453',
      '42161',
      '42220',
      '43114',
      '59144',
    ])

    const configurationsPerChain = Object.values(result)

    for (const config of configurationsPerChain) {
      expect(config.oracle).toBeTruthy()
      expect(config.relayer).toBeTruthy()
      expect(config.inboundProofLibraryVersion).toBeTruthy()
      expect(config.outboundProofType).toBeTruthy()
      expect(config.outboundBlockConfirmations).toBeTruthy()
      expect(config.inboundBlockConfirmations).toBeTruthy()
    }
  })
})

const mockOutput = {
  contracts: [
    {
      name: 'UltraLightNodeV2',
      address: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
      values: {
        defaultAppConfig: {
          '101': {
            inboundProofLib: 2,
            inboundBlockConfirm: 15,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '102': {
            inboundProofLib: 2,
            inboundBlockConfirm: 20,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '106': {
            inboundProofLib: 2,
            inboundBlockConfirm: 12,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '109': {
            inboundProofLib: 2,
            inboundBlockConfirm: 512,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '110': {
            inboundProofLib: 2,
            inboundBlockConfirm: 20,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '111': {
            inboundProofLib: 2,
            inboundBlockConfirm: 20,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '125': {
            inboundProofLib: 2,
            inboundBlockConfirm: 5,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },

          '158': {
            inboundProofLib: 2,
            inboundBlockConfirm: 20,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0x5a54fe5234E811466D5366846283323c954310B2',
          },

          '183': {
            inboundProofLib: 2,
            inboundBlockConfirm: 10,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
          '184': {
            inboundProofLib: 2,
            inboundBlockConfirm: 10,
            outboundProofType: 2,
            outboundBlockConfirm: 15,
            relayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
            oracle: '0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc',
          },
        },
      },
      derivedName: 'UltraLightNodeV2',
    },
  ],
} as unknown as DiscoveryOutput
