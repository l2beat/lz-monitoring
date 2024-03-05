import { Logger } from '@l2beat/backend-tools'
import {
  DiscoveryLogger,
  DiscoveryProvider,
  EtherscanLikeClient,
  MulticallClient,
  MulticallConfig,
} from '@l2beat/discovery'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import { Config } from '../config'
import { TrackingConfig } from '../config/Config'
import { ApplicationModule } from '../modules/ApplicationModule'
import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
import { OAppConfigurationRepository } from '../peripherals/database/OAppConfigurationRepository'
import { OAppRepository } from '../peripherals/database/OAppRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ClockIndexer } from './domain/indexers/ClockIndexer'
import { TrackingIndexer } from './domain/indexers/TrackingIndexer'
import { DiscoveryDefaultConfigurationsProvider } from './domain/providers/DefaultConfigurationsProvider'
import { BlockchainOAppConfigurationProvider } from './domain/providers/OAppConfigurationProvider'
import { FileOAppListProvider } from './domain/providers/OAppsListProvider'

export { createTrackingModule }

interface Dependencies {
  config: Config
  database: Database
  logger: Logger
}

interface SubmoduleDependencies {
  logger: Logger
  database: Database
  config: TrackingConfig
}

function createTrackingModule(dependencies: Dependencies): ApplicationModule {
  const availableChainConfigs = Object.keys(
    dependencies.config.tracking,
  ) as (keyof Config['tracking'])[]
  const statusLogger = dependencies.logger.for('TrackingModule')

  const enabledChainsToTrack = availableChainConfigs.filter(
    (chainName) => dependencies.config.tracking[chainName].enabled,
  )

  const submodules = enabledChainsToTrack.flatMap((chainName) => {
    const submoduleConfig = dependencies.config.tracking[chainName]

    if (!submoduleConfig.enabled) {
      statusLogger.warn('Tracking submodule disabled', { chainName })
      return []
    }

    return createTrackingSubmodule(
      {
        logger: dependencies.logger,
        config: submoduleConfig.config,
        database: dependencies.database,
      },
      chainName,
    )
  })

  return {
    start: async () => {
      statusLogger.info('Starting tracking module')

      for (const submodule of submodules) {
        await submodule.start?.()
      }

      statusLogger.info('Tracking module started')
    },
  }
}

function createTrackingSubmodule(
  { logger, config, database }: SubmoduleDependencies,
  chain: keyof Config['tracking'],
): ApplicationModule {
  const statusLogger = logger.for('TrackingSubmodule').tag(chain)
  const chainId = ChainId.fromName(chain)

  const currDiscoveryRepo = new CurrentDiscoveryRepository(database, logger)
  const oAppRepo = new OAppRepository(database, logger)
  const oAppConfigurationRepo = new OAppConfigurationRepository(
    database,
    logger,
  )

  const provider = new providers.StaticJsonRpcProvider(config.rpcUrl)

  const multicall = getMulticall(provider, config.multicall)

  const oAppListProvider = new FileOAppListProvider('./oApps.json')

  const defaultConfigurationsProvider =
    new DiscoveryDefaultConfigurationsProvider(
      currDiscoveryRepo,
      chainId,
      logger,
    )

  const oAppConfigProvider = new BlockchainOAppConfigurationProvider(
    provider,
    multicall,
    config.ulnV2Address,
    chainId,
    logger,
  )

  const clockIndexer = new ClockIndexer(logger, config.tickIntervalMs, chainId)

  const trackingIndexer = new TrackingIndexer(
    logger,
    chainId,
    oAppListProvider,
    defaultConfigurationsProvider,
    oAppConfigProvider,
    oAppRepo,
    oAppConfigurationRepo,
    clockIndexer,
  )

  return {
    start: async () => {
      statusLogger.info('Starting tracking submodule')
      await clockIndexer.start()
      await trackingIndexer.start()
      statusLogger.info('Tracking submodule started')
    },
  }
}

function getMulticall(
  provider: providers.StaticJsonRpcProvider,
  config: MulticallConfig,
): MulticallClient {
  const dummyExplorer = {} as EtherscanLikeClient
  const discoveryProvider = new DiscoveryProvider(
    provider,
    dummyExplorer,
    DiscoveryLogger.SILENT,
  )

  return new MulticallClient(discoveryProvider, config)
}
