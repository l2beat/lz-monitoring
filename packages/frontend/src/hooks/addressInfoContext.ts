import { DiscoveryApi, EthereumAddress } from '@lz/libs'
import { createContext, useContext } from 'react'

export const AddressInfoContext = createContext<DiscoveryApi['addressInfo']>([])

export function useAddressInfo(address: EthereumAddress) {
  const addressInfo = useContext(AddressInfoContext)

  return addressInfo.find((info) => info.address === address)
}
