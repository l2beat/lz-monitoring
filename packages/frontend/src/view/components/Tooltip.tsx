import { useRef } from 'react'

interface TooltipProps {
  text: string
  children: React.ReactNode
}

export function Tooltip(props: TooltipProps) {
  const activeRef = useRef(null)
  const tooltipRef = useRef(null)
  const tooltipTriangleRef = useRef(null)

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
      >
        {props.children}
      </div>

      <div
        className="fixed z-tooltip hidden rounded-md bg-gray-700 px-3 py-1"
        ref={tooltipRef}
      >
        <svg
          ref={tooltipTriangleRef}
          width="16"
          height="8"
          viewBox="0 0 16 8"
          className="fixed h-2 w-4 fill-gray-700 stroke-1"
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

  const { left, triangleLeft, top, triangleTop, isInverted } = getPosition(
    activeElement,
    tooltip,
    tooltipTriangle,
  )
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  tooltipTriangle.style.top = `${triangleTop}px`
  tooltipTriangle.style.transform = isInverted ? 'rotate(180deg)' : ''
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
  const isOverflowingOnBottom =
    rect.y + rect.height + 7 + tooltipHeight >= window.innerHeight
  const isOverflowingOnTop = rect.top - tooltipHeight <= 7
  let top, triangleTop: number
  let isInverted: boolean
  if (!isOverflowingOnBottom || isOverflowingOnTop) {
    top = rect.bottom + 7
    triangleTop = rect.bottom
    isInverted = false
  } else {
    top = rect.top - 7 - tooltipHeight
    triangleTop = rect.top - 7
    isInverted = true
  }

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
    isInverted,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
