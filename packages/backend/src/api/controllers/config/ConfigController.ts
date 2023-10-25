import { ChainModuleConfig, ChainModuleConfigsResponse } from '@lz/libs'

export class ConfigController {
  constructor(private readonly chainConfigs: ChainModuleConfig[]) {}

  public getChainConfigs(): ChainModuleConfigsResponse {
    return this.chainConfigs
  }
}
