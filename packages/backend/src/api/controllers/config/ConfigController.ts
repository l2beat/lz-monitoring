import { ChainModuleConfig, ChainModuleConfigsResponse } from '@lz/libs'

export class ConfigController {
  constructor(private readonly availableChains: ChainModuleConfig[]) {}

  public getAvailableChains(): ChainModuleConfigsResponse {
    return this.availableChains
  }
}
