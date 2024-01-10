import {
  ChainId,
  DefaultExecutorConfigs,
  DefaultExecutors,
  DefaultUlnConfigs,
  RemoteChain,
} from '@lz/libs'

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

type DecodedDefaultUlnConfigs = Record<
  number,
  {
    confirmations: number
    requiredDVNCount: number
    optionalDVNCount: number
    optionalDVNThreshold: number
    requiredDVNs: string[]
    optionalDVNs: string[]
  }
>

export function decodeDefaultUlnConfigs(defaultUlnConfigs: DefaultUlnConfigs) {
  return defaultUlnConfigs.reduce<DecodedDefaultUlnConfigs>(
    (acc, { params }) => {
      const [
        [
          eid,
          [
            confirmations,
            requiredDVNCount,
            optionalDVNCount,
            optionalDVNThreshold,
            requiredDVNs,
            optionalDVNs,
          ],
        ],
      ] = params

      acc[eid] = {
        confirmations,
        requiredDVNCount,
        optionalDVNCount,
        optionalDVNThreshold,
        requiredDVNs,
        optionalDVNs,
      }

      return acc
    },
    {},
  )
}

type DecodedDefaultExecutorConfigs = Record<
  number,
  { gas: number; executor: string }
>

export function decodeDefaultExecutorConfigs(
  defaultExecutorConfigs: DefaultExecutorConfigs,
) {
  return defaultExecutorConfigs.reduce<DecodedDefaultExecutorConfigs>(
    (acc, { params }) => {
      const [[eid, [gas, executor]]] = params
      acc[eid] = {
        gas,
        executor,
      }
      return acc
    },
    {},
  )
}

type DecodedDefaultExecutors = Record<number, string>

export function decodeDefaultExecutors(defaultExecutors: DefaultExecutors) {
  return defaultExecutors.reduce<DecodedDefaultExecutors>((acc, { params }) => {
    const [[eid, executor]] = params
    acc[eid] = executor
    return acc
  }, {})
}
