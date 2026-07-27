import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  Circle,
  GripVertical,
  Info,
  MoreHorizontal,
  Plus,
  X,
} from 'lucide-react'
import { comingSoon, statusesByGroup, useAppStore } from '../../lib/store'
import type { StatusGroup, TaskStatus } from '../../lib/types'

const GROUP_LABEL: Record<StatusGroup, string> = {
  'not-started': 'Not started',
  active: 'Active',
  done: 'Done',
  closed: 'Closed',
}

const NEW_STATUS_COLOR = '#8792a2'

/** Preset status colors (ClickUp-style palette) for the per-status color picker. */
const STATUS_PALETTE = [
  '#87909e',
  '#1f9d61',
  '#e8871e',
  '#d6336c',
  '#4194f6',
  '#7b68ee',
  '#0f7f70',
  '#d8354f',
  '#2ea44f',
  '#8a5fe8',
]

/** ClickUp "Statuses" editor. Always mounted at the App root; renders nothing until opened. */
export function TaskStatusesModal() {
  const open = useAppStore((s) => s.statusesOpen)
  const closeStatuses = useAppStore((s) => s.closeStatuses)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const addTaskStatus = useAppStore((s) => s.addTaskStatus)
  const renameTaskStatus = useAppStore((s) => s.renameTaskStatus)
  const setTaskStatusColor = useAppStore((s) => s.setTaskStatusColor)
  const notify = useAppStore((s) => s.notify)

  const [statusType, setStatusType] = useState<'inherit' | 'custom'>('custom')
  const [addingFor, setAddingFor] = useState<StatusGroup | null>(null)
  const [addValue, setAddValue] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [colorFor, setColorFor] = useState<string | null>(null)
  const renameCommitted = useRef(false)
  const addCommitted = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStatuses()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeStatuses])

  // The modal stays mounted (returns null when closed), so transient editor state
  // must be reset each time it (re)opens — otherwise a half-typed add/rename input
  // could linger or phantom-commit on the next open.
  useEffect(() => {
    if (!open) return
    setStatusType('custom')
    setAddingFor(null)
    setAddValue('')
    setRenamingId(null)
    setRenameValue('')
    setColorFor(null)
    renameCommitted.current = false
    addCommitted.current = false
  }, [open])

  if (!open) return null

  const groups = statusesByGroup(taskStatuses)

  const startAdding = (group: StatusGroup) => {
    setAddingFor(group)
    setAddValue('')
    addCommitted.current = false
  }

  const commitAdd = (group: StatusGroup) => {
    if (addCommitted.current) return
    addCommitted.current = true
    const value = addValue.trim()
    if (value) addTaskStatus(group, value, NEW_STATUS_COLOR)
    setAddValue('')
    setAddingFor(null)
  }

  const startRename = (status: TaskStatus) => {
    setRenamingId(status.id)
    setRenameValue(status.label)
    renameCommitted.current = false
  }

  const commitRename = (id: string) => {
    if (renameCommitted.current) return
    renameCommitted.current = true
    const value = renameValue.trim()
    if (value) renameTaskStatus(id, value)
    setRenamingId(null)
    setRenameValue('')
  }

  const cancelRename = () => {
    renameCommitted.current = true
    setRenamingId(null)
    setRenameValue('')
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeStatuses()
      }}
    >
      <div className="animate-pop-in relative flex w-[720px] max-w-[92vw] flex-col rounded-xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={closeStatuses}
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
        >
          <X className="h-3.5 w-3.5 text-ink-soft" />
        </button>

        {/* Header: back arrow + title */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Back"
            onClick={closeStatuses}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <h2 className="text-[17px] font-semibold text-ink">Statuses</h2>
        </div>

        {/* Two columns */}
        <div className="mt-5 flex gap-8">
          {/* LEFT: Status type + template */}
          <div className="w-[190px] shrink-0">
            <div className="mb-3 flex items-center gap-1 text-[12.5px] font-semibold text-ink">
              Status type
              <Info className="h-[13px] w-[13px] text-ink-faint" />
            </div>

            <label className="mb-2.5 flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="pm-status-type"
                checked={statusType === 'inherit'}
                onChange={() => setStatusType('inherit')}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-[13.5px] text-ink">Inherit from Space</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="pm-status-type"
                checked={statusType === 'custom'}
                onChange={() => setStatusType('custom')}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-[13.5px] text-ink">Use custom statuses</span>
            </label>

            <div className="mt-6 mb-1.5 text-[12.5px] font-semibold text-ink">Status template</div>
            <button
              type="button"
              onClick={() => comingSoon(notify, 'Status templates')}
              className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-line-strong px-3 text-[13.5px] text-ink hover:bg-hover"
            >
              Custom
              <ChevronDown className="h-4 w-4 text-ink-faint" />
            </button>
          </div>

          {/* RIGHT: the 4 status groups — disabled when inheriting from Space */}
          <div
            className={`max-h-[460px] min-w-0 flex-1 overflow-y-auto pr-1 ${
              statusType === 'inherit' ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            {groups.map(({ group, statuses }) => (
              <div key={group} className="mb-5 last:mb-0">
                {/* Group header */}
                <div className="mb-1.5 flex items-center">
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold text-ink-soft">
                    {GROUP_LABEL[group]}
                    <Info className="h-[13px] w-[13px] text-ink-faint" />
                  </span>
                  <button
                    type="button"
                    aria-label={`Add status to ${GROUP_LABEL[group]}`}
                    onClick={() => startAdding(group)}
                    className="ml-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Status rows */}
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="group flex h-10 items-center gap-2 rounded-lg border border-line px-2 mb-1.5"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-faint opacity-0 group-hover:opacity-100" />
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label={`${status.label} color`}
                        onClick={() => setColorFor((c) => (c === status.id ? null : status.id))}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-hover"
                      >
                        <Circle className="h-3.5 w-3.5" style={{ color: status.color }} fill="currentColor" />
                      </button>
                      {colorFor === status.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setColorFor(null)} />
                          <div className="animate-pop-in absolute top-6 left-0 z-20 grid grid-cols-5 gap-1.5 rounded-lg border border-line bg-white p-2 shadow-xl">
                            {STATUS_PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                aria-label={`Set color ${c}`}
                                onClick={() => {
                                  setTaskStatusColor(status.id, c)
                                  setColorFor(null)
                                }}
                                className="h-5 w-5 rounded-full ring-1 ring-line transition-transform hover:scale-110"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {renamingId === status.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(status.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            commitRename(status.id)
                          } else if (e.key === 'Escape') {
                            e.stopPropagation()
                            cancelRename()
                          }
                        }}
                        className="h-7 min-w-0 flex-1 rounded-md border border-line-strong px-2 text-[12.5px] font-semibold tracking-wide uppercase text-ink outline-none focus:border-ink"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startRename(status)}
                        className="min-w-0 flex-1 cursor-text truncate text-left text-[12.5px] font-semibold tracking-wide uppercase text-ink"
                      >
                        {status.label}
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`${status.label} options`}
                      onClick={() => comingSoon(notify, 'Status options')}
                      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Inline add input */}
                {addingFor === group && (
                  <input
                    autoFocus
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                    onBlur={() => commitAdd(group)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        commitAdd(group)
                      } else if (e.key === 'Escape') {
                        e.stopPropagation()
                        setAddValue('')
                        setAddingFor(null)
                      }
                    }}
                    placeholder="Status name"
                    className="mb-1.5 h-10 w-full rounded-lg border-2 border-ink px-3 text-[13px] outline-none placeholder:text-ink-faint"
                  />
                )}

                {/* Add status button */}
                <button
                  type="button"
                  onClick={() => startAdding(group)}
                  className="flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink-soft hover:bg-hover"
                >
                  <Plus className="h-4 w-4 text-ink-faint" />
                  Add status
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
          <button
            type="button"
            onClick={() => comingSoon(notify, 'Statuses help')}
            className="flex cursor-pointer items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-ink"
          >
            <Info className="h-[15px] w-[15px]" />
            Learn more about statuses
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => comingSoon(notify, 'Save as template')}
              className="h-9 cursor-pointer rounded-lg border border-line-strong bg-white px-4 text-[13.5px] font-medium text-ink hover:bg-hover"
            >
              Save as template
            </button>
            <button
              type="button"
              onClick={closeStatuses}
              className="h-9 cursor-pointer rounded-lg bg-brand px-5 text-[13.5px] font-medium text-white hover:bg-brand-deep"
            >
              Apply changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
