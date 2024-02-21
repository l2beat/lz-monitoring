import { ChainId } from '@lz/libs'

import { Dropdown, DropdownOption } from './Dropdown'
import { toDropdownOption } from './protocol/utils'

export function ChainDropdown(props: {
  chains: ChainId[]
  selectedChainId?: ChainId
  setSelectedChainId: (chain: ChainId) => void
}) {
  function onDropdownSelect(option: DropdownOption): void {
    const chain = props.chains.find(
      (chain) => ChainId.getName(chain) === option.value,
    )

    if (!chain) {
      return
    }

    props.setSelectedChainId(chain)
  }

  const dropdownOptions = props.chains.map(toDropdownOption)

  const hasAnyChains = props.chains.length > 0

  const nullableDefault =
    props.selectedChainId && hasAnyChains
      ? { defaultValue: toDropdownOption(props.selectedChainId) }
      : {}

  if (!hasAnyChains) {
    return null
  }

  return (
    <Dropdown
      options={dropdownOptions}
      onChange={onDropdownSelect}
      {...nullableDefault}
    />
  )
}
