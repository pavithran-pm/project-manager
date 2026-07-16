import { X } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

export function PromoBanner() {
  const bannerDismissed = useAppStore((s) => s.bannerDismissed)
  const dismissBanner = useAppStore((s) => s.dismissBanner)
  const notify = useAppStore((s) => s.notify)

  if (bannerDismissed) return null

  return (
    <div className="relative flex h-9 min-h-9 w-full shrink-0 items-center justify-center bg-gradient-to-r from-[#fdeef3] via-[#fbf0f7] to-[#f3effc] px-10 text-[13px] text-ink">
      <span className="truncate">
        Think Brain<sup>2</sup> won&apos;t impress you? Hand it one task.{' '}
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Brain² AI')}
          className="cursor-pointer font-medium underline hover:opacity-70"
        >
          Fine, prove me wrong →
        </button>
      </span>
      <button
        type="button"
        title="Dismiss"
        aria-label="Dismiss"
        onClick={dismissBanner}
        className="absolute right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
