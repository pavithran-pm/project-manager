interface CountBadgeProps {
  value: number
  /**
   * outline — thin gray ring, gray number (inbox row counts)
   * red — filled red circle, white number (unread badges)
   * dark — filled dark pill, white number (sidebar "35" style)
   * plain — bare muted number (sidebar sprint counts)
   */
  variant?: 'outline' | 'red' | 'dark' | 'plain'
}

export function CountBadge({ value, variant = 'outline' }: CountBadgeProps) {
  if (variant === 'plain') {
    return <span className="text-xs text-ink-faint tabular-nums">{value}</span>
  }
  if (variant === 'red') {
    return (
      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white tabular-nums">
        {value}
      </span>
    )
  }
  if (variant === 'dark') {
    return (
      <span className="flex h-[18px] min-w-[22px] items-center justify-center rounded-full bg-[#3d434d] px-1.5 text-[10.5px] font-semibold text-white tabular-nums">
        {value}
      </span>
    )
  }
  return (
    <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full border border-line-strong px-1 text-[11px] font-medium text-ink-soft tabular-nums">
      {value}
    </span>
  )
}
