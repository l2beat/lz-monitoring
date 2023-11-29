import { Listbox } from '@headlessui/react'
import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useState } from 'react'

import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'
import { BlockchainIcon } from './BlockchainIcon'

export interface DropdownOption {
  label: string
  value: string
}

interface Props {
  options: DropdownOption[]
  defaultValue?: DropdownOption
  onChange: (option: DropdownOption) => void
}

export function Dropdown(props: Props): JSX.Element {
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    props.defaultValue ?? null,
  )

  function onChange(option: DropdownOption): void {
    setSelectedOption(option)
    props.onChange(option)
  }

  return (
    <Listbox value={selectedOption} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-full font-sans">
          <Listbox.Button
            className={cx(
              'flex w-full items-center justify-between border-b bg-gray-200 pl-6',
              !selectedOption && 'text-gray-15',
              open
                ? 'rounded-t-lg border-gray-50'
                : 'border-transparent rounded-lg',
            )}
          >
            {selectedOption?.value ? (
              <span className="flex items-center gap-2 text-xs">
                <BlockchainIcon
                  chainId={ChainId.fromName(selectedOption.value)}
                />
                {getPrettyChainName(ChainId.fromName(selectedOption.value))}
              </span>
            ) : (
              <span>Select chain</span>
            )}
            <span className="m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-yellow-100 p-0.5">
              <DropdownArrowIcon
                className={cx(open && 'rotate-180', 'transition-all')}
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-[102] w-full">
            {props.options
              .sort((a, b) => a.value.localeCompare(b.value))
              .filter((option) => option.value !== selectedOption?.value)
              .map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option}
                  className="flex w-full cursor-pointer items-center gap-3 px-6 py-2 text-xs first:pt-3 last:rounded last:pb-3 ui-active:bg-white 
                          ui-active:text-black ui-not-active:bg-gray-200 ui-not-active:text-white"
                >
                  <BlockchainIcon chainId={ChainId.fromName(option.value)} />
                  {getPrettyChainName(ChainId.fromName(option.value))}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  )
}
