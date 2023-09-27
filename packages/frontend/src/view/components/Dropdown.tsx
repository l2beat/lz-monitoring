import { Listbox } from '@headlessui/react'
import cx from 'classnames'
import { useState } from 'react'

import { DropdownArrowIcon } from '../icons/DropdownArrowIcon'

export interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  options: DropdownOption[]
  defaultValue?: DropdownOption
  onChange: (option: DropdownOption) => void
  className?: string
}

export function Dropdown(props: DropdownProps): JSX.Element {
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
        <div className={cx('relative', props.className)}>
          <Listbox.Button
            className={cx(
              'flex h-full w-full items-center justify-between bg-gray-750 pl-6 font-mono',
              !selectedOption && 'text-gray-500',
            )}
          >
            {selectedOption?.label ?? 'Select an option'}
            <span className="h-10 w-10 shrink-0 bg-white p-1">
              <DropdownArrowIcon
                className={cx(open && 'rotate-180', 'transition-all')}
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute w-full">
            {props.options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option}
                className="mr-10 pl-6 font-mono ui-active:bg-white ui-active:text-black 
                          ui-not-active:bg-black ui-not-active:text-white"
              >
                {option.label}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  )
}
