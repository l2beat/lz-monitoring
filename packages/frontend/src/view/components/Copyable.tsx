import { useState } from 'react'

import { CopyIcon } from '../icons/CopyIcon'
import { OkIcon } from '../icons/OkIcon'
import { Tooltip } from './Tooltip'

interface Props<T> {
  label: string
  value: T
  children: React.ReactNode[] | React.ReactNode
}

export function Copyable<T extends string>(props: Props<T>) {
  const [hasCopied, setHasCopied] = useState(false)
  async function copyToClipboard(text: T) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      document.execCommand('copy', true, text)
    }

    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 500)
  }

  return (
    <span className="inline-flex items-center gap-1">
      {props.children}
      <Tooltip
        text={hasCopied ? 'Copied!' : `Copy ${props.label} to clipboard`}
      >
        <button
          className="fill-zinc-500 hover:fill-white"
          onClick={() => void copyToClipboard(props.value)}
        >
          {hasCopied ? <OkIcon /> : <CopyIcon />}
        </button>
      </Tooltip>
    </span>
  )
}
