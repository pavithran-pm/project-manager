import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BellPlus,
  Bug,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleMinus,
  ClipboardList,
  Copy,
  Crown,
  Diamond,
  FileText,
  Layers2,
  Link2,
  ListPlus,
  Mail,
  Merge,
  MessageSquareText,
  NotebookPen,
  Package,
  Pencil,
  Plus,
  Rocket,
  Search,
  SquareArrowOutUpRight,
  Star,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import type { PopoverPos } from '../../components/ui/Popover'
import { comingSoon, useAppStore } from '../../lib/store'
import type { Task } from '../../lib/types'

const MENU_W = 248
const FLYOUT_W = 236

type FlyoutId =
  | 'favorite'
  | 'remind'
  | 'addTo'
  | 'convert'
  | 'templates'
  | 'relationships'
  | 'taskType'

interface Item {
  label: string
  icon: LucideIcon
  flyout?: FlyoutId
  danger?: boolean
  divider?: boolean
}

const ITEMS: Item[] = [
  { label: 'Rename', icon: Pencil },
  { label: 'Duplicate', icon: Copy },
  { label: 'Move to', icon: ArrowRight },
  { label: 'Add to', icon: ListPlus, flyout: 'addTo' },
  { label: 'Convert to', icon: Layers2, flyout: 'convert' },
  { label: 'Templates', icon: FileText, flyout: 'templates', divider: true },
  { label: 'Remind me in Inbox', icon: BellPlus, flyout: 'remind' },
  { label: 'Favorite', icon: Star, flyout: 'favorite' },
  { label: 'Relationships', icon: Link2, flyout: 'relationships' },
  { label: 'Task Type', icon: CircleCheck, flyout: 'taskType', divider: true },
  { label: 'Send email to task', icon: Mail },
  { label: 'Merge', icon: Merge },
  { label: 'Archive', icon: Package },
  { label: 'Delete', icon: Trash2, danger: true },
]

const TASK_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: 'Task', icon: CircleCheck },
  { label: 'Milestone', icon: Diamond },
  { label: 'Bug', icon: Bug },
  { label: 'Epic', icon: Crown },
  { label: 'Feedback', icon: MessageSquareText },
  { label: 'Form Response', icon: ClipboardList },
  { label: 'Initiative', icon: Rocket },
  { label: 'Meeting Note', icon: NotebookPen },
  { label: 'User Story', icon: FileText },
]

function FlyoutShell({ top, left, children }: { top: number; left: number; children: ReactNode }) {
  return (
    <div
      className="animate-pop-in fixed z-[60] rounded-xl border border-line bg-white p-1.5 shadow-xl"
      style={{ top: Math.max(8, Math.min(top, window.innerHeight - 60)), left, width: FLYOUT_W }}
    >
      {children}
    </div>
  )
}

function FlyoutRow({
  icon,
  label,
  hint,
  onClick,
}: {
  icon?: ReactNode
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink hover:bg-hover"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {hint && <span className="shrink-0 text-[12px] text-ink-faint">{hint}</span>}
    </button>
  )
}

/** Mini month calendar (current month, today highlighted) for the reminder flyout. */
function MiniCalendar() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const start = new Date(first)
  start.setDate(start.getDate() - ((first.getDay() + 6) % 7))
  const label = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
  return (
    <div className="px-2 pt-1 pb-1.5">
      <div className="flex items-center justify-between py-1">
        <span className="text-[12.5px] font-semibold text-ink">{label}</span>
        <span className="flex items-center gap-1 text-ink-faint">
          <span className="text-[11.5px]">Today</span>
          <ChevronUp className="h-3 w-3" />
          <ChevronDown className="h-3 w-3" />
        </span>
      </div>
      <div className="grid grid-cols-7 text-center text-[10.5px] text-ink-faint">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="py-0.5">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center">
        {cells.map((d, i) => {
          const isToday = d.toDateString() === now.toDateString()
          const inMonth = d.getMonth() === now.getMonth()
          return (
            <span
              key={i}
              className={`flex h-6 items-center justify-center text-[11.5px] ${
                isToday
                  ? 'mx-auto h-6 w-6 rounded-full bg-brand font-medium text-white'
                  : inMonth
                    ? 'text-ink'
                    : 'text-ink-faint/60'
              }`}
            >
              {d.getDate()}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Right-anchored task context menu with left-side hover flyouts (video secs 87-109). */
export function TaskRowMenu({
  task,
  pos,
  onClose,
}: {
  task: Task
  pos: PopoverPos
  onClose: () => void
}) {
  const notify = useAppStore((s) => s.notify)
  const users = useAppStore((s) => s.users)
  const [flyout, setFlyout] = useState<{ id: FlyoutId; top: number } | null>(null)

  const left = Math.max(8, Math.min(pos.left - MENU_W + 24, window.innerWidth - MENU_W - 8))
  const top = Math.max(8, Math.min(pos.top, window.innerHeight - 560))
  const flyoutLeft = Math.max(8, left - FLYOUT_W - 6)

  const done = (what: string) => () => {
    comingSoon(notify, what)
    onClose()
  }
  const copy = (text: string, message: string) => () => {
    void navigator.clipboard?.writeText(text).catch(() => undefined)
    notify(message)
    onClose()
  }

  const reminderTimes = (() => {
    const now = new Date()
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', ' ')
    const in20 = new Date(now.getTime() + 20 * 60 * 1000)
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    return [
      { label: 'In 20 minutes', hint: fmt(in20) },
      { label: 'In 2 hours', hint: fmt(in2h) },
      { label: 'Tomorrow', hint: 'Sat, 8:00 AM' },
      { label: 'Next week', hint: 'Mon, 8:00 AM' },
    ]
  })()

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="animate-pop-in fixed z-50 rounded-xl border border-line bg-white p-1.5 shadow-xl"
        style={{ top, left, width: MENU_W }}
        onMouseLeave={() => setFlyout(null)}
      >
        {/* Segmented copy header */}
        <div className="mb-1 flex overflow-hidden rounded-lg border border-line-strong">
          {(
            [
              ['Copy link', copy(`https://app.clickup.com/t/${(task.codeId ?? task.id).replace('#', '')}`, 'Link copied to clipboard')],
              ['Copy ID', copy(task.codeId ?? task.id, 'Task ID copied to clipboard')],
              ['New tab', done('Opening tasks in a new tab')],
            ] as const
          ).map(([label, onClick], i) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`h-7 flex-1 cursor-pointer text-[12px] text-ink-soft hover:bg-hover hover:text-ink ${
                i > 0 ? 'border-l border-line-strong' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {ITEMS.map((item) => (
          <div key={item.label}>
            <button
              type="button"
              onClick={item.flyout ? undefined : done(item.label)}
              onMouseEnter={(e) =>
                setFlyout(
                  item.flyout
                    ? { id: item.flyout, top: e.currentTarget.getBoundingClientRect().top - 8 }
                    : null,
                )
              }
              className={`flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] hover:bg-hover ${
                item.danger ? 'text-[#d8354f]' : 'text-ink'
              } ${flyout?.id === item.flyout && item.flyout ? 'bg-hover' : ''}`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${item.danger ? 'text-[#d8354f]' : 'text-ink-faint'}`}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.flyout && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" />}
            </button>
            {item.divider && <div className="my-1 border-t border-line" />}
          </div>
        ))}

        <button
          type="button"
          onClick={done('Sharing & Permissions')}
          className="mt-1 h-8 w-full cursor-pointer rounded-lg bg-[#2b2f3a] text-[13px] font-medium text-white hover:bg-[#1f232c]"
        >
          Sharing & Permissions
        </button>
      </div>

      {/* ---- Left-side flyouts ---- */}
      {flyout?.id === 'relationships' && (
        <FlyoutShell top={flyout.top} left={flyoutLeft}>
          <FlyoutRow
            icon={<Link2 className="h-4 w-4 text-ink-faint" />}
            label="Relate a Task or Doc"
            onClick={done('Relationships')}
          />
          <div className="my-1 border-t border-line" />
          <FlyoutRow
            icon={<CircleMinus className="h-4 w-4 text-[#d8354f]" fill="#d8354f" stroke="white" />}
            label="This task blocks..."
            onClick={done('Blocking relationships')}
          />
          <FlyoutRow
            icon={<TriangleAlert className="h-4 w-4 text-[#e8a33d]" />}
            label="This task is blocked by..."
            onClick={done('Blocking relationships')}
          />
          <div className="my-1 border-t border-line" />
          <FlyoutRow
            icon={<Plus className="h-4 w-4 text-ink-faint" />}
            label="Create Relationship"
            onClick={done('Custom relationships')}
          />
        </FlyoutShell>
      )}

      {flyout?.id === 'remind' && (
        <FlyoutShell top={flyout.top - 180} left={flyoutLeft}>
          <div className="p-1">
            <input
              placeholder='Try "Tomorrow at 2 PM"...'
              className="h-8 w-full rounded-md border border-line-strong px-2 text-[12.5px] text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
            />
          </div>
          {reminderTimes.map((r) => (
            <FlyoutRow
              key={r.label}
              icon={<CalendarDays className="h-3.5 w-3.5 text-ink-faint" />}
              label={r.label}
              hint={r.hint}
              onClick={done('Reminders')}
            />
          ))}
          <div className="my-1 border-t border-line" />
          <MiniCalendar />
        </FlyoutShell>
      )}

      {flyout?.id === 'favorite' && (
        <FlyoutShell top={flyout.top} left={flyoutLeft}>
          <div className="flex gap-1.5 p-1.5">
            {['Sidebar', 'Top', 'Bottom'].map((placement) => (
              <button
                key={placement}
                type="button"
                onClick={done('Favorites placement')}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1 hover:bg-hover"
              >
                <span className="flex h-11 w-[66px] flex-col gap-1 rounded-md border border-line-strong bg-panel p-1.5">
                  <span className="pm-shimmer h-1.5 w-1/2 !animate-none" />
                  <span className="pm-shimmer h-1.5 w-full !animate-none" />
                  <span className="pm-shimmer h-1.5 w-2/3 !animate-none" />
                </span>
                <span className="text-[11px] text-ink-soft">{placement}</span>
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-line" />
          <FlyoutRow
            icon={<Plus className="h-4 w-4 text-ink-faint" />}
            label="Sections"
            onClick={done('Favorite sections')}
          />
          <FlyoutRow
            icon={<Star className="h-4 w-4 text-ink-faint" />}
            label="Favorites"
            onClick={done('Favorites')}
          />
        </FlyoutShell>
      )}

      {flyout?.id === 'addTo' && (
        <FlyoutShell top={flyout.top} left={flyoutLeft}>
          <FlyoutRow
            icon={<ListPlus className="h-4 w-4 text-ink-faint" />}
            label="Another List"
            onClick={done('Adding to Lists')}
          />
          <FlyoutRow
            icon={<FileText className="h-4 w-4 text-ink-faint" />}
            label="Personal List"
            onClick={done('The Personal List')}
          />
          <div className="my-1 border-t border-line" />
          <div className="px-2.5 pt-1 pb-1.5 text-[11.5px] text-ink-faint">
            Add to Personal Priorities
          </div>
          <div className="flex items-center gap-1.5 px-2.5 pb-1.5">
            {['pavithran', 'lydia', 'arun'].map((id) => {
              const u = users[id]
              return u ? (
                <button
                  key={id}
                  className="cursor-pointer rounded-full"
                  onClick={done('Personal priorities')}
                >
                  <Avatar initials={u.initials} color={u.color} size={26} title={u.name} />
                </button>
              ) : null
            })}
            <button
              onClick={done('Inviting people')}
              className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong hover:bg-hover"
            >
              <Plus className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          </div>
        </FlyoutShell>
      )}

      {flyout?.id === 'convert' && (
        <FlyoutShell top={flyout.top} left={flyoutLeft}>
          <FlyoutRow
            icon={<Layers2 className="h-4 w-4 text-ink-faint" />}
            label="List"
            onClick={done('Converting to a List')}
          />
          <FlyoutRow
            icon={<SquareArrowOutUpRight className="h-4 w-4 text-ink-faint" />}
            label="Subtask"
            onClick={done('Converting to a subtask')}
          />
        </FlyoutShell>
      )}

      {flyout?.id === 'templates' && (
        <FlyoutShell top={flyout.top} left={flyoutLeft}>
          <div className="px-2.5 pt-1 pb-0.5 text-[11.5px] text-ink-faint">Recent Templates</div>
          {['ArenaCX PRD', 'PRD', 'Task Template'].map((t) => (
            <FlyoutRow
              key={t}
              icon={
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2b2f3a]">
                  <FileText className="h-2.5 w-2.5 text-white" />
                </span>
              }
              label={t}
              onClick={done('Templates')}
            />
          ))}
          <div className="my-1 border-t border-line" />
          <FlyoutRow label="Apply a template" onClick={done('Templates')} />
          <FlyoutRow label="Save as template" onClick={done('Templates')} />
          <FlyoutRow label="Update existing template" onClick={done('Templates')} />
        </FlyoutShell>
      )}

      {flyout?.id === 'taskType' && (
        <FlyoutShell top={flyout.top - 60} left={flyoutLeft}>
          <div className="p-1">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                placeholder="Find type (e.g. Milestone)"
                className="h-8 w-full rounded-md border border-line-strong pr-2 pl-7 text-[12.5px] text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
              />
            </div>
          </div>
          <div className="px-2.5 pt-0.5 pb-1 text-[11.5px] text-ink-faint">Task Types ⓘ</div>
          {TASK_TYPES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={done('Task types')}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-ink hover:bg-hover"
            >
              <t.icon className="h-4 w-4 shrink-0 text-ink-faint" />
              <span className="min-w-0 flex-1 truncate">{t.label}</span>
              {t.label === 'Task' && <CircleCheck className="h-3.5 w-3.5 shrink-0 text-ink" />}
            </button>
          ))}
        </FlyoutShell>
      )}
    </>
  )
}
