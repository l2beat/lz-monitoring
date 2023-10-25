import { ChainId } from '@lz/libs'

import { Dropdown, DropdownOption } from './Dropdown'

interface Props {
  chainId: ChainId
  setChainId: (chainId: ChainId) => void
  chainsToDisplay: ChainId[]
}

export function NetworkDropdownSelector(props: Props) {
  const options = props.chainsToDisplay.map((chainToDisplay) => ({
    label: ChainId.getName(chainToDisplay),
    value: ChainId.getName(chainToDisplay),
  }))

  function onChange(option: DropdownOption) {
    const chainId = ChainId.fromName(option.value)
    props.setChainId(chainId)
  }

  const defaultValue = options.find(
    (option) => option.value === ChainId.getName(props.chainId),
  )

  if (!props.chainsToDisplay.includes(props.chainId)) {
    props.setChainId(ChainId.ETHEREUM)
  }

  return (
    <section className="bg-gray-900 px-6 pb-0 pt-6">
      <label className="mb-4 text-xs text-gray-500">Select network</label>
      <Dropdown
        defaultValue={defaultValue}
        onChange={onChange}
        options={options}
      />
    </section>
  )
}
