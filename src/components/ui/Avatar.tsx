interface AvatarProps {
  initials: string
  color: string
  /** Diameter in px */
  size?: number
  /** Show a green presence dot at the bottom-right */
  presence?: boolean
  /** Square-ish avatar with rounded corners (used for space icons) instead of a circle */
  rounded?: 'full' | 'md'
  title?: string
}

export function Avatar({ initials, color, size = 24, presence, rounded = 'full', title }: AvatarProps) {
  return (
    <span className="relative inline-flex shrink-0" title={title} style={{ width: size, height: size }}>
      <span
        className={`flex h-full w-full items-center justify-center font-semibold text-white ${
          rounded === 'full' ? 'rounded-full' : 'rounded-md'
        }`}
        style={{ backgroundColor: color, fontSize: Math.max(9, Math.round(size * 0.42)) }}
      >
        {initials}
      </span>
      {presence && (
        <span
          className="absolute -right-px -bottom-px rounded-full border-2 border-white bg-[#27ae60]"
          style={{ width: Math.round(size * 0.38), height: Math.round(size * 0.38) }}
        />
      )}
    </span>
  )
}
