import { X } from 'lucide-react'
import { useAppStore } from '../../lib/store'

/**
 * Floating bar shown while one or more tasks are multi-selected. Makes the
 * selection visible and clearable; the actual bulk move is done by dragging any
 * selected task (all selected tasks travel together).
 */
export function SelectionBar() {
  const count = useAppStore((s) => s.selectedTaskIds.length)
  const clear = useAppStore((s) => s.clearTaskSelection)

  if (count === 0) return null

  return (
    <div className="animate-rise-in fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#1f2228] px-4 py-2.5 text-white shadow-xl">
      <span className="text-[13px] font-medium tabular-nums">
        {count} task{count > 1 ? 's' : ''} selected
      </span>
      <span className="hidden text-[12px] text-white/50 sm:inline">
        Drag any selected task to move them together · Shift-click to range-select
      </span>
      <button
        onClick={clear}
        className="flex h-6 cursor-pointer items-center gap-1 rounded-md bg-white/10 px-2 text-[12px] hover:bg-white/20"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </button>
    </div>
  )
}
