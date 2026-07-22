import { useState } from 'react'
import {
  ChevronRight,
  Copy,
  Download,
  FileText,
  Layers2,
  ListFilter,
  Shield,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

/** iOS-style toggle: dark navy when on, gray track when off. */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`flex h-[18px] w-[34px] shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
        on ? 'bg-[#2e2c48]' : 'bg-line-strong'
      }`}
    >
      <span
        className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex h-[38px] items-center justify-between rounded-md px-2 hover:bg-hover">
      <span className="text-[13.5px] text-ink">{label}</span>
      <Toggle on={value} onClick={onToggle} />
    </div>
  )
}

function ValueRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left hover:bg-hover"
    >
      <Icon className="h-4 w-4 shrink-0 text-ink-soft" />
      <span className="flex-1 text-[13.5px] text-ink">{label}</span>
      {value && <span className="text-[12.5px] text-ink-faint">{value}</span>}
      <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />
    </button>
  )
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  chevron,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  chevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left hover:bg-hover"
    >
      <Icon className="h-4 w-4 shrink-0 text-ink-soft" />
      <span className="flex-1 text-[13.5px] text-ink">{label}</span>
      {chevron && <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />}
    </button>
  )
}

function Divider() {
  return <div className="my-1.5 border-t border-line" />
}

/** Right-docked "Customize view" panel (video secs 96-101). */
export function CustomizeViewPanel() {
  const open = useAppStore((s) => s.customizeViewOpen)
  const setOpen = useAppStore((s) => s.setCustomizeViewOpen)
  const notify = useAppStore((s) => s.notify)

  const [toggles, setToggles] = useState({
    emptyStatuses: true,
    wrapText: true,
    taskLocations: true,
    subtaskParents: true,
    closedTasks: true,
    autosave: false,
    pin: false,
    private: false,
    protect: false,
    defaultView: false,
  })
  const [templatesOpen, setTemplatesOpen] = useState(false)

  if (!open) return null
  const set = (k: keyof typeof toggles) => () => setToggles((t) => ({ ...t, [k]: !t[k] }))
  const soon = (what: string) => () => comingSoon(notify, what)
  const close = () => setOpen(false)

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <div className="animate-fade-in fixed top-0 right-0 z-50 flex h-full w-[316px] flex-col border-l border-line bg-white shadow-2xl">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
          <span className="text-[15px] font-semibold text-ink">Customize view</span>
          <button
            type="button"
            aria-label="Close customize view"
            onClick={close}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-2 flex h-9 items-center gap-2 rounded-md border border-line-strong px-2.5">
            <Layers2 className="h-4 w-4 text-ink-soft" />
            <span className="text-[13.5px] font-medium text-ink">List</span>
          </div>

          <ToggleRow label="Show empty statuses" value={toggles.emptyStatuses} onToggle={set('emptyStatuses')} />
          <ToggleRow label="Wrap text" value={toggles.wrapText} onToggle={set('wrapText')} />
          <ToggleRow label="Show task locations" value={toggles.taskLocations} onToggle={set('taskLocations')} />
          <ToggleRow label="Show subtask parent names" value={toggles.subtaskParents} onToggle={set('subtaskParents')} />
          <ToggleRow label="Show closed tasks" value={toggles.closedTasks} onToggle={set('closedTasks')} />
          <ActionRow icon={SlidersHorizontal} label="More options" onClick={soon('More view options')} chevron />

          <Divider />

          <ValueRow icon={FileText} label="Fields" value="6 shown" onClick={soon('Field settings')} />
          <ValueRow icon={ListFilter} label="Filter" value="None" onClick={soon('Filters')} />
          <ValueRow icon={Layers2} label="Group" value="Status" onClick={soon('Grouping')} />
          <ValueRow icon={Layers2} label="Subtasks" value="Collapsed" onClick={soon('Subtask display')} />
          <div className="relative">
            <ActionRow icon={FileText} label="Templates" onClick={() => setTemplatesOpen((o) => !o)} chevron />
            {templatesOpen && (
              <div className="animate-pop-in absolute top-1 right-full z-10 mr-1 w-[220px] rounded-xl border border-line bg-white p-1.5 shadow-xl">
                <div className="px-2.5 pt-1 pb-1 text-[11.5px] font-medium text-ink-faint">Templates</div>
                {['Apply a template', 'Save as template', 'Update existing template'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      comingSoon(notify, 'View templates')
                      setTemplatesOpen(false)
                    }}
                    className="flex h-8 w-full cursor-pointer items-center rounded-lg px-2.5 text-left text-[13px] text-ink hover:bg-hover"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Divider />

          <ToggleRow label="Autosave for me" value={toggles.autosave} onToggle={set('autosave')} />
          <ToggleRow label="Pin view" value={toggles.pin} onToggle={set('pin')} />
          <ToggleRow label="Private view" value={toggles.private} onToggle={set('private')} />
          <ToggleRow label="Protect view" value={toggles.protect} onToggle={set('protect')} />
          <ToggleRow label="Set as default view" value={toggles.defaultView} onToggle={set('defaultView')} />

          <Divider />

          <ActionRow
            icon={Copy}
            label="Copy link to view"
            onClick={() => {
              void navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
              notify('Link to view copied to clipboard')
            }}
          />
          <ActionRow icon={Star} label="Favorite" onClick={soon('Favoriting views')} chevron />
          <ActionRow icon={Download} label="Export view" onClick={soon('Exporting views')} />
          <ActionRow icon={Shield} label="Sharing & Permissions" onClick={soon('Sharing & Permissions')} />
        </div>
      </div>
    </>
  )
}
