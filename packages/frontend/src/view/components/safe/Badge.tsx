export type BadgeVariant = 'green' | 'yellow' | 'grey'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${variantToColor(
        variant,
      )} text-white`}
    >
      {children}
    </span>
  )
}

function variantToColor(variant: BadgeVariant): string {
  switch (variant) {
    case 'green':
      return 'bg-[#96be25]'
    case 'yellow':
      return 'bg-[#bea925]'
    case 'grey':
      return 'bg-[#145369]'
  }
}
