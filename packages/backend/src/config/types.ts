export type {
  AdditionalAddresses,
  CoreAddressesV1,
  CoreAddressesV2,
  LayerZeroAddresses,
}

type Prettify<T> = {
  [K in keyof T]: T[K]
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {}

type AddressRecord<
  Required extends string | never,
  Optional extends string | never = never,
> = Prettify<
  {
    [K in Required]: string
  } & {
    [K in Optional]?: string
  }
>

type CoreV1Contracts = 'ultraLightNodeV2' | 'endpoint'

type OptionalV1Contracts = 'layerZeroMultisig'

type CoreV2Contracts =
  | 'endpointV2'
  | 'send301'
  | 'receive301'
  | 'send302'
  | 'receive302'

type AdditionalContracts = 'stargateBridge' | 'stargateToken'

type NoContracts = never

type CoreAddressesV1 = AddressRecord<CoreV1Contracts, OptionalV1Contracts>

type CoreAddressesV2 = AddressRecord<CoreV2Contracts>

type AdditionalAddresses = AddressRecord<NoContracts, AdditionalContracts>

type LayerZeroAddresses = CoreAddressesV1 &
  CoreAddressesV2 &
  AdditionalAddresses
