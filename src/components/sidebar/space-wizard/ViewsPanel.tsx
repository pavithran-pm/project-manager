import { useState } from 'react'
import {
  Activity,
  Calendar,
  ChartColumnBig,
  ChartGantt,
  ChevronLeft,
  GanttChart,
  LayoutGrid,
  List,
  Map,
  Network,
  Table2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { SPACE_VIEWS } from './contract'
import type { ViewsPanelProps } from './contract'

/**
 * "Default settings for views" sub-panel of the Create-a-Space wizard.
 * Pure/presentational: view enablement comes in via props.enabled and every
 * change goes out through props.onToggle — no store access. The tab switch is
 * local UI-only state; "Default View Templates" is visual-only (no content).
 */

const VIEW_ICONS: Record<string, LucideIcon> = {
  list: List,
  board: LayoutGrid,
  calendar: Calendar,
  map: Map,
  activity: Activity,
  team: Users,
  gantt: ChartGantt,
  mindmap: Network,
  table: Table2,
  timeline: GanttChart,
  workload: ChartColumnBig,
}

export function ViewsPanel(props: ViewsPanelProps) {
  const { enabled, onToggle, onBack, onClose, onDone } = props
  const [tab, setTab] = useState<'required' | 'templates'>('required')

  return (
    <div className="animate-pop-in relative w-[420px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 pr-8">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-soft hover:bg-hover"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <h2 className="text-[17px] font-semibold text-ink">Default settings for views</h2>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <X className="h-3.5 w-3.5 text-ink-soft" />
      </button>

      {/* Pill tabs */}
      <div className="mt-4 flex items-center gap-1 rounded-lg bg-panel p-1">
        <button
          type="button"
          onClick={() => setTab('required')}
          className={`h-8 flex-1 cursor-pointer rounded-md text-[13px] font-medium transition-colors ${
            tab === 'required'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          Required views
        </button>
        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`h-8 flex-1 cursor-pointer rounded-md text-[13px] font-medium transition-colors ${
            tab === 'templates'
              ? 'bg-white text-ink shadow-sm'
              : 'text-ink-soft hover:text-ink'
          }`}
        >
          Default View Templates
        </button>
      </div>

      {/* Subtitle */}
      <p className="mt-3 text-[13px] leading-snug text-ink-soft">
        Set up views that appear automatically in every Space, Folder, or List — and can't be
        removed.
      </p>

      {/* Views list */}
      <div className="mt-3 max-h-[320px] overflow-y-auto">
        {SPACE_VIEWS.map((view) => {
          const Icon = VIEW_ICONS[view.key] ?? List
          const isOn = view.required ? true : !!enabled[view.key]
          return (
            <div
              key={view.key}
              className="flex items-center gap-3 rounded-md py-2 pr-0.5 pl-0.5 hover:bg-hover"
            >
              <Icon className="h-4.5 w-4.5 shrink-0" style={{ color: view.color }} />
              <span className="flex-1 truncate text-[13.5px] text-ink">
                {view.label}
                {view.required && <span className="text-ink-faint"> &ndash; Required</span>}
              </span>

              {view.required ? (
                <span className="text-[12px] text-ink-faint">Default</span>
              ) : null}

              <button
                type="button"
                role="switch"
                aria-checked={isOn}
                aria-label={`Enable ${view.label} view`}
                disabled={view.required}
                onClick={() => {
                  if (!view.required) onToggle(view.key)
                }}
                className={`ml-1 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${
                  isOn ? 'bg-brand' : 'bg-line-strong'
                } ${view.required ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    isOn ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="-mx-6 -mb-6 mt-6 rounded-b-xl border-t border-line bg-panel px-6 py-4">
        <button
          type="button"
          onClick={onDone}
          className="h-9 w-full cursor-pointer rounded-lg bg-[#1f2228] text-[13.5px] font-medium text-white hover:bg-black"
        >
          Done
        </button>
      </div>
    </div>
  )
}
