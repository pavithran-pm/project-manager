import type { LucideIcon } from 'lucide-react'
import {
  CalendarClock,
  CalendarSync,
  ChevronLeft,
  ChevronUp,
  CircleAlert,
  Clock,
  Flag,
  Hourglass,
  ListTree,
  LoaderCircle,
  Mail,
  PencilRuler,
  RefreshCw,
  Split,
  Star,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { CLICKAPPS } from './contract'
import type { ClickAppsPanelProps } from './contract'

/**
 * "Enable ClickApps" sub-modal (Step 2 → ClickApps panel of the Create-a-Space wizard).
 * PURE: all state comes in via props; every change goes out through callbacks.
 * Renders ONLY the inner white card — the wizard shell owns the backdrop.
 */

/** Fitting lucide icon per ClickApp key (all 15 keys covered). */
const ICONS: Record<string, LucideIcon> = {
  priority: Flag,
  sprints: RefreshCw,
  email: Mail,
  tags: Tags,
  customFields: PencilRuler,
  multipleAssignees: Users,
  timeTracking: Clock,
  timeEstimates: Hourglass,
  remapSubtaskDates: CalendarClock,
  wipLimits: Split,
  sprintPoints: Star,
  incompleteWarning: CircleAlert,
  dependencyWarning: ListTree,
  rescheduleDependencies: CalendarSync,
  showStatusProgress: LoaderCircle,
}

export function ClickAppsPanel(props: ClickAppsPanelProps) {
  return (
    <div className="animate-pop-in relative w-[560px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
      {/* Header: back-arrow + centered title + close */}
      <button
        type="button"
        aria-label="Back"
        onClick={props.onBack}
        className="absolute top-4 left-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <ChevronLeft className="h-4 w-4 text-ink-soft" />
      </button>
      <button
        type="button"
        aria-label="Close"
        onClick={props.onClose}
        className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <X className="h-3.5 w-3.5 text-ink-soft" />
      </button>
      <h2 className="text-center text-[17px] font-semibold text-ink">Enable ClickApps</h2>

      {/* Turn off all ClickApps — shown in the ON look; click delegates to callback */}
      <div className="mt-6 flex items-center justify-center gap-2.5">
        <button
          type="button"
          role="switch"
          aria-checked
          aria-label="Turn off all ClickApps"
          onClick={props.onTurnOffAll}
          className="h-5 w-9 shrink-0 cursor-pointer rounded-full bg-brand p-0.5 transition-colors"
        >
          <span className="block h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
        </button>
        <span className="text-[13.5px] font-medium text-ink">Turn off all ClickApps</span>
      </div>

      {/* 2-column grid of ClickApp cards */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {CLICKAPPS.map((app) => {
          const Icon = ICONS[app.key] ?? Flag
          const on = !!props.enabled[app.key]
          const gated = !!app.gated
          return (
            <div
              key={app.key}
              className={`flex items-center gap-3 rounded-lg border border-line-strong px-3 py-3 ${
                gated ? 'opacity-50' : ''
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-ink-soft" />
              <span className="flex-1 text-[13.5px] font-medium text-ink">{app.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={gated ? false : on}
                aria-label={app.label}
                disabled={gated}
                onClick={gated ? undefined : () => props.onToggle(app.key)}
                className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${
                  gated ? 'cursor-default bg-line-strong' : 'cursor-pointer'
                } ${!gated && on ? 'bg-brand' : !gated ? 'bg-line-strong' : ''}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    !gated && on ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {/* Show less — visual only */}
      <div className="mt-5 flex items-center justify-center gap-1 text-[13px] font-medium text-ink-soft">
        <span>Show less</span>
        <ChevronUp className="h-3.5 w-3.5" />
      </div>

      {/* Footer: full-width dark Done button */}
      <button
        type="button"
        onClick={props.onDone}
        className="mt-5 h-11 w-full cursor-pointer rounded-lg bg-[#1f2228] text-[14px] font-medium text-white hover:bg-black"
      >
        Done
      </button>
    </div>
  )
}
