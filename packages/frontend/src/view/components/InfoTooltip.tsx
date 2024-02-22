import { InfoSquareIcon } from '../icons/InfoSquareIcon'
import { Tooltip } from './Tooltip'

interface Props {
  text: string
  children: React.ReactNode
}

export function InfoTooltip(props: Props) {
  return (
    <span className="flex items-center gap-1">
      {props.children}
      <Tooltip text={props.text} variant="text">
        <InfoSquareIcon
          width="12"
          height="12"
          className="fill-zinc-200 transition-all hover:brightness-125"
        />
      </Tooltip>
    </span>
  )
}
