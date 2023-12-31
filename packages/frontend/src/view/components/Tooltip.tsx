import cx from 'classnames'
import { useRef } from 'react'

type Variant = 'value' | 'text'

interface TooltipProps {
  text: string
  children: React.ReactNode
  variant?: Variant
  disabled?: boolean
  className?: string
}

export function Tooltip(props: TooltipProps) {
  const activeRef = useRef(null)
  const tooltipRef = useRef(null)
  const tooltipTriangleRef = useRef(null)

  const variantStyles =
    props.variant === 'text'
      ? 'leading-5 max-w-[300px]'
      : 'leading-none whitespace-nowrap'

  if (props.disabled) {
    return <>{props.children}</>
  }

  return (
    <>
      <div
        ref={activeRef}
        onMouseEnter={() => {
          show(
            activeRef.current,
            tooltipRef.current,
            tooltipTriangleRef.current,
          )
        }}
        onMouseLeave={() => hide(tooltipRef.current)}
        className={props.className}
      >
        {props.children}
      </div>

      <div
        className={cx(
          'fixed z-tooltip hidden rounded bg-zinc-600 px-2.5 py-1.5 font-sans text-sm text-white shadow',
          variantStyles,
        )}
        ref={tooltipRef}
      >
        <svg
          ref={tooltipTriangleRef}
          width="16"
          height="8"
          viewBox="0 0 16 8"
          className="fixed h-2 w-4 fill-zinc-600 stroke-1"
        >
          <path d="M0 8L8 1L16 8" />
        </svg>
        {props.text}
      </div>
    </>
  )
}

function hide(tooltip: HTMLElement | null) {
  if (!tooltip) {
    return
  }
  tooltip.style.display = 'none'
  tooltip.classList.add('hidden')
}

function show(
  activeElement: HTMLElement | null,
  tooltip: HTMLElement | null,
  tooltipTriangle: HTMLElement | null,
) {
  if (!activeElement || !tooltip || !tooltipTriangle) {
    return
  }

  const { left, triangleLeft, top, triangleTop } = getPosition(
    activeElement,
    tooltip,
    tooltipTriangle,
  )
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  tooltipTriangle.style.top = `${triangleTop}px`
  tooltipTriangle.style.transform = 'rotate(180deg)'
  tooltipTriangle.style.left = `${triangleLeft}px`
  tooltip.classList.add('block')
  tooltip.classList.remove('hidden')
}

function getPosition(
  activeElement: HTMLElement,
  tooltip: HTMLElement,
  tooltipTriangle: HTMLElement,
) {
  const rect = activeElement.getBoundingClientRect()
  tooltip.style.display = 'block'
  const tooltipHeight = tooltip.getBoundingClientRect().height
  const tooltipWidth = tooltip.getBoundingClientRect().width
  const left = clamp(
    rect.left + rect.width / 2 - tooltipWidth / 2,
    10,
    window.innerWidth - 10 - tooltipWidth,
  )
  const top = rect.top - 7 - tooltipHeight
  const triangleTop = rect.top - 7

  const triangleLeft = clamp(
    rect.left + rect.width / 2 - 8,
    10,
    window.innerWidth - 10 - 16,
  )
  tooltipTriangle.style.left = `${triangleLeft}px`

  return {
    left,
    triangleLeft,
    top,
    triangleTop,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
