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
import { PRESETS, type PresetStatus, type StatusesPanelProps } from './contract'

/** The 4 status groups, in the order the ClickUp editor renders them. */
const GROUPS: { key: PresetStatus['group']; label: string }[] = [
  { key: 'not-started', label: 'Not started' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
  { key: 'closed', label: 'Closed' },
]

/**
 * "Edit statuses" sub-modal for the Create-a-Space wizard.
 *
 * PURE / presentational: statuses come from the selected preset (via props.preset),
 * so add / rename / recolor are visual no-ops here — there is no store and no callback
 * for editing individual statuses. Only the shell owns state; this renders the inner card.
 */
export function StatusesPanel(props: StatusesPanelProps) {
  const preset = PRESETS.find((p) => p.key === props.preset) ?? PRESETS[0]

  return (
    <div className="animate-pop-in relative flex w-[640px] max-w-[92vw] flex-col rounded-xl bg-white p-6 shadow-2xl">
      <button
        type="button"
        aria-label="Close"
        onClick={props.onClose}
        className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <X className="h-3.5 w-3.5 text-ink-soft" />
      </button>

      {/* Header: back arrow + title */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Back"
          onClick={props.onBack}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <h2 className="text-[17px] font-semibold text-ink">Edit statuses</h2>
      </div>

      {/* Two columns */}
      <div className="mt-5 flex gap-8">
        {/* LEFT: Status template (visual / no-op) */}
        <div className="w-[190px] shrink-0">
          <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Status template</div>
          <button
            type="button"
            className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-line-strong px-3 text-[13.5px] text-ink hover:bg-hover"
          >
            Custom
            <ChevronDown className="h-4 w-4 text-ink-faint" />
          </button>
        </div>

        {/* RIGHT: the 4 status groups from the preset */}
        <div className="max-h-[460px] min-w-0 flex-1 overflow-y-auto pr-1">
          {GROUPS.map(({ key, label }) => {
            const statuses = preset.statuses.filter((s) => s.group === key)
            return (
              <div key={key} className="mb-5 last:mb-0">
                {/* Group header */}
                <div className="mb-1.5 flex items-center">
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold text-ink-soft">
                    {label}
                    <Info className="h-[13px] w-[13px] text-ink-faint" />
                  </span>
                  <button
                    type="button"
                    aria-label={`Add status to ${label}`}
                    className="ml-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Status rows */}
                {statuses.map((status, i) => (
                  <div
                    key={`${key}-${i}`}
                    className="group mb-1.5 flex h-10 items-center gap-2 rounded-lg border border-line px-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-faint opacity-0 group-hover:opacity-100" />
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <Circle
                        className="h-3.5 w-3.5"
                        style={{ color: status.color }}
                        fill="currentColor"
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold tracking-wide text-ink uppercase">
                      {status.label}
                    </span>
                    <button
                      type="button"
                      aria-label={`${status.label} options`}
                      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Add-status button — the reference shows it once, under the Done group. */}
                {key === 'done' && (
                  <button
                    type="button"
                    className="flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink-soft hover:bg-hover"
                  >
                    <Plus className="h-4 w-4 text-ink-faint" />
                    Add status
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-ink"
        >
          <Info className="h-[15px] w-[15px]" />
          Learn more about statuses
        </button>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="h-9 cursor-pointer rounded-lg border border-line-strong bg-white px-4 text-[13.5px] font-medium text-ink hover:bg-hover"
          >
            Save as template
          </button>
          <button
            type="button"
            onClick={props.onDone}
            className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black"
          >
            Apply changes
          </button>
        </div>
      </div>
    </div>
  )
}
