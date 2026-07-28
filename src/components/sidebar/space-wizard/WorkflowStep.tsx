import { ChevronRight, HelpCircle, Layers, LayoutGrid, Target, X } from 'lucide-react'
import { PRESETS } from './contract'
import type { WorkflowStepProps } from './contract'

/**
 * Step 2 of the "Create a Space" wizard: pick a preset workflow, then peek at /
 * customize the three defaults (views, statuses, ClickApps) it seeds.
 *
 * PURE component — all state comes in via props, all intent goes out via callbacks.
 * This renders only the inner white card; the wizard shell owns the backdrop.
 */
export function WorkflowStep(props: WorkflowStepProps) {
  const selected = PRESETS.find((p) => p.key === props.preset) ?? PRESETS[0]

  return (
    <div className="animate-pop-in relative w-[560px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
      <button
        type="button"
        aria-label="Close"
        onClick={props.onClose}
        className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <X className="h-3.5 w-3.5 text-ink-soft" />
      </button>

      <h2 className="text-[17px] font-semibold text-ink">Define your workflow</h2>
      <p className="mt-1 pr-6 text-[13px] text-ink-soft">
        Choose a pre-configured solution or customize to your liking with advanced ClickApps,
        required views, and task statuses.
      </p>

      {/* Preset picker — 2x2 grid */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {PRESETS.map((p) => {
          const active = p.key === props.preset
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => props.onPreset(p.key)}
              className={`cursor-pointer rounded-lg px-3.5 py-3 text-left transition-colors ${
                active
                  ? 'border-2 border-ink bg-panel'
                  : 'border border-line-strong hover:bg-hover'
              }`}
            >
              <div className="text-[13.5px] font-semibold text-ink">{p.label}</div>
              <div className="mt-0.5 text-[12.5px] text-ink-soft">{p.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 mb-3 text-[13.5px] font-semibold text-ink">
        Customize defaults for <span className="text-ink">{selected.label}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Default views */}
        <SettingRow
          icon={<Layers className="h-5 w-5 text-ink-soft" />}
          title="Default views"
          onClick={props.onOpenViews}
          summary={<span className="truncate">{selected.viewsSummary}</span>}
        />

        {/* Task statuses — colored dot arrow flow */}
        <SettingRow
          icon={<Target className="h-5 w-5 text-ink-soft" />}
          title="Task statuses"
          onClick={props.onOpenStatuses}
          summary={
            <span className="flex items-center gap-1 truncate">
              {selected.statuses.map((s, i) => (
                <span key={s.label} className="flex shrink-0 items-center gap-1">
                  <span className="text-[9px] leading-none" style={{ color: s.color }}>
                    ●
                  </span>
                  <span>{s.label}</span>
                  {i < selected.statuses.length - 1 && (
                    <span className="text-ink-faint">→</span>
                  )}
                </span>
              ))}
            </span>
          }
        />

        {/* ClickApps */}
        <SettingRow
          icon={<LayoutGrid className="h-5 w-5 text-ink-soft" />}
          title="ClickApps"
          onClick={props.onOpenClickApps}
          summary={<span className="truncate">{selected.clickAppsSummary}</span>}
        />
      </div>

      {/* Footer */}
      <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
        <button
          type="button"
          onClick={props.onBack}
          className="cursor-pointer text-[13.5px] text-ink-soft hover:text-ink"
        >
          Back
        </button>
        <button
          type="button"
          onClick={props.onCreate}
          className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black"
        >
          Create Space
        </button>
      </div>
    </div>
  )
}

interface SettingRowProps {
  icon: React.ReactNode
  title: string
  summary: React.ReactNode
  onClick: () => void
}

function SettingRow({ icon, title, summary, onClick }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line-strong px-3 py-2.5 text-left hover:bg-hover"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-ink">{title}</div>
        <div className="mt-0.5 overflow-hidden text-[12px] text-ink-soft">{summary}</div>
      </div>
      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
    </button>
  )
}
