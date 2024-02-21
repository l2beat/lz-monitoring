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

export function intersect<T, K>(a: Record<string, T>, b: Record<string, K>) {
  return Object.entries(a).filter(([k, _]) => k in b)
}

export function toV2LibType(messageLibType: string | number): string {
  const numLibType = Number(messageLibType)

  if (numLibType === 0) {
    return 'Send'
  }

  if (numLibType === 1) {
    return 'Receive'
  }

  if (numLibType === 2) {
    return 'Send & Receive'
  }

  return 'Unknown message library type'
}
