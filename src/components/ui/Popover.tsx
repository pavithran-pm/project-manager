import { useEffect } from 'react'
import type { ReactNode } from 'react'

export interface PopoverPos {
  top: number
  left: number
}

/** Position a popover below-left of a clicked element, clamped to the viewport. */
export function popoverPosFor(el: HTMLElement, width = 240): PopoverPos {
  const rect = el.getBoundingClientRect()
  return {
    top: Math.min(rect.bottom + 4, window.innerHeight - 60),
    left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
  }
}

/**
 * Anchored floating panel: transparent backdrop closes on outside click,
 * Escape closes, pop-in animation. Render conditionally.
 */
export function Popover({
  pos,
  width = 240,
  onClose,
  children,
}: {
  pos: PopoverPos
  width?: number
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="animate-pop-in fixed z-50 rounded-xl border border-line bg-white p-1.5 shadow-xl"
        style={{ top: pos.top, left: pos.left, width }}
      >
        {children}
      </div>
    </>
  )
}

/** Standard row inside a Popover. */
export function PopoverItem({
  onClick,
  selected,
  children,
}: {
  onClick: () => void
  selected?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink hover:bg-hover ${
        selected ? 'bg-panel' : ''
      }`}
    >
      {children}
    </button>
  )
}
