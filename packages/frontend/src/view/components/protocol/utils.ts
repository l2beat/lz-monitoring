import { ChainId, RemoteChain } from '@lz/libs'

import { DropdownOption } from '../Dropdown'

export function toDropdownOption(chain: RemoteChain | ChainId): DropdownOption {
  if (ChainId.isChainId(chain)) {
    const name = ChainId.getName(chain)
    return {
      label: name,
      value: name,
    }
  }

  return {
    label: chain.name,
    value: chain.name,
  }
}
