import { ChainId } from '@lz/libs'
import { createContext, useContext } from 'react'

export const ChainInfoContext = createContext<ChainId>(ChainId.ETHEREUM)

export function useChainId() {
  return useContext(ChainInfoContext)
}
