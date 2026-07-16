import { useEffect } from 'react'
import { Info, X } from 'lucide-react'
import { useAppStore } from '../../lib/store'
import type { Toast } from '../../lib/store'

function ToastCard({ toast }: { toast: Toast }) {
  const dismissToast = useAppStore((s) => s.dismissToast)

  useEffect(() => {
    const t = setTimeout(() => dismissToast(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, dismissToast])

  return (
    <div className="animate-rise-in flex w-[340px] items-start gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3 shadow-xl">
      <Info className="mt-px h-4 w-4 shrink-0 text-brand" />
      <div className="flex-1 text-[13px] leading-snug text-ink">{toast.message}</div>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={() => dismissToast(toast.id)}
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
      >
        <X className="h-3 w-3 text-ink-faint" />
      </button>
    </div>
  )
}

export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 left-4 z-[70] flex flex-col gap-2">
      {toasts.slice(-4).map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  )
}
