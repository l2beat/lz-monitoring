import { Logger } from '@l2beat/backend-tools'
import {
  DiscoveryLogger,
  DiscoveryProvider,
  EtherscanLikeClient,
  HttpClient,
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
import { OAppDefaultConfigurationRepository } from '../peripherals/database/OAppDefaultConfigurationRepository'
import { OAppRemoteRepository } from '../peripherals/database/OAppRemoteRepository'
import { OAppRepository } from '../peripherals/database/OAppRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ProtocolVersion } from './domain/const'
import { ClockIndexer } from './domain/indexers/ClockIndexer'
import { DefaultConfigurationIndexer } from './domain/indexers/DefaultConfigurationIndexer'
import { OAppConfigurationIndexer } from './domain/indexers/OAppConfigurationIndexer'
import { OAppListIndexer } from './domain/indexers/OAppListIndexer'
import { OAppRemoteIndexer } from './domain/indexers/OAppRemotesIndexer'
import { DiscoveryDefaultConfigurationsProvider } from './domain/providers/DefaultConfigurationsProvider'
import { OFTInterfaceResolver } from './domain/providers/interface-resolvers/OFTInterfaceResolver'
import { StargateInterfaceResolver } from './domain/providers/interface-resolvers/StargateResolver'
import { BlockchainOAppConfigurationProvider } from './domain/providers/OAppConfigurationProvider'
import { BlockchainOAppRemotesProvider } from './domain/providers/OAppRemotesProvider'
import { HttpOAppListProvider } from './domain/providers/OAppsListProvider'
import { TrackingController } from './http/TrackingController'
import { createTrackingRouter } from './http/TrackingRouter'

export { createTrackingModule }

interface Dependencies {
  config: Config
  database: Database
  logger: Logger
}

interface SubmoduleDependencies {
  logger: Logger
  config: TrackingConfig
  repositories: {
    currentDiscovery: CurrentDiscoveryRepository
    oApp: OAppRepository
    oAppConfiguration: OAppConfigurationRepository
    oAppDefaultConfiguration: OAppDefaultConfigurationRepository
    oAppRemote: OAppRemoteRepository
  }
}

function createTrackingModule(dependencies: Dependencies): ApplicationModule {
  const availableChainConfigs = Object.keys(
    dependencies.config.tracking,
  ) as (keyof Config['tracking'])[]
  const statusLogger = dependencies.logger.for('TrackingModule')

  const enabledChainsToTrack = availableChainConfigs.filter(
    (chainName) => dependencies.config.tracking[chainName].enabled,
  )

  const currDiscoveryRepo = new CurrentDiscoveryRepository(
    dependencies.database,
    dependencies.logger,
  )
  const oAppRepo = new OAppRepository(
    dependencies.database,
    dependencies.logger,
  )
  const oAppConfigurationRepo = new OAppConfigurationRepository(
    dependencies.database,
    dependencies.logger,
  )
  const oAppDefaultConfigurationRepo = new OAppDefaultConfigurationRepository(
    dependencies.database,
    dependencies.logger,
  )

  const oAppRemoteRepo = new OAppRemoteRepository(
    dependencies.database,
    dependencies.logger,
  )

  const controller = new TrackingController(
    oAppRepo,
    oAppConfigurationRepo,
    oAppDefaultConfigurationRepo,
    currDiscoveryRepo,
  )

  const router = createTrackingRouter(controller)

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
        repositories: {
          currentDiscovery: currDiscoveryRepo,
          oApp: oAppRepo,
          oAppConfiguration: oAppConfigurationRepo,
          oAppDefaultConfiguration: oAppDefaultConfigurationRepo,
          oAppRemote: oAppRemoteRepo,
        },
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

    routers: [router],
  }
}

function createTrackingSubmodule(
  { logger, config, repositories }: SubmoduleDependencies,
  chain: keyof Config['tracking'],
): ApplicationModule {
  const statusLogger = logger.for('TrackingSubmodule').tag(chain)
  const chainId = ChainId.fromName(chain)

  const provider = new providers.StaticJsonRpcProvider(config.rpcUrl)

  const multicall = getMulticall(provider, config.multicall)

  const httpClient = new HttpClient()

  const OFTResolver = new OFTInterfaceResolver(multicall)
  const stargateResolver = new StargateInterfaceResolver(multicall)

  const oAppListProvider = new HttpOAppListProvider(
    logger,
    httpClient,
    config.listApiUrl,
  )

  const defaultConfigurationsProvider =
    new DiscoveryDefaultConfigurationsProvider(
      repositories.currentDiscovery,
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

  const supportedChains = ChainId.getAll()
  const resolvers = [OFTResolver, stargateResolver]

  const oAppRemotesProvider = new BlockchainOAppRemotesProvider(
    provider,
    multicall,
    chainId,
    supportedChains,
    resolvers,
    logger,
  )

  const clockIndexer = new ClockIndexer(logger, config.tickIntervalMs, chainId)
  const oAppListIndexer = new OAppListIndexer(
    logger,
    chainId,
    oAppListProvider,
    repositories.oApp,
    [clockIndexer],
  )

  const remotesIndexer = new OAppRemoteIndexer(
    logger,
    chainId,
    repositories.oApp,
    repositories.oAppRemote,
    oAppRemotesProvider,
    [oAppListIndexer],
  )

  const oAppConfigurationIndexer = new OAppConfigurationIndexer(
    logger,
    chainId,
    oAppConfigProvider,
    repositories.oApp,
    repositories.oAppRemote,
    repositories.oAppConfiguration,
    [remotesIndexer],
  )

  const defaultConfigurationIndexer = new DefaultConfigurationIndexer(
    logger,
    chainId,
    ProtocolVersion.V1,
    defaultConfigurationsProvider,
    repositories.oAppDefaultConfiguration,
    [oAppConfigurationIndexer],
  )

  return {
    start: async () => {
      statusLogger.info('Starting tracking submodule')
      await clockIndexer.start()
      await oAppListIndexer.start()
      await oAppConfigurationIndexer.start()
      await defaultConfigurationIndexer.start()

      await remotesIndexer.start()
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
