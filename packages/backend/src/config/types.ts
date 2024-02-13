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

interface CoreAddressesV1 {
  ultraLightNodeV2: string
  endpoint: string
  layerZeroMultisig?: string
}

interface CoreAddressesV2 {
  endpointV2: string
  send301: string
  receive301: string
  send302: string
  receive302: string
}

interface AdditionalAddresses {
  stargateBridge?: string
  stargateToken?: string
}

type LayerZeroAddresses = Prettify<
  CoreAddressesV1 & CoreAddressesV2 & AdditionalAddresses
>
