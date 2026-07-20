import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleDot,
  ClipboardList,
  Columns3,
  Copy,
  CornerDownRight,
  Crown,
  Diamond,
  Filter,
  Layers2,
  MessageSquareText,
  Network,
  Pin,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Popover } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import { comingSoon, useAppStore } from '../../lib/store'
import type { Task, TaskStatus, User } from '../../lib/types'

/** Dark hover tooltip below its child (ClickUp style). */
function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative flex">
      {children}
      <span className="animate-fade-in pointer-events-none absolute top-full left-1/2 z-[70] mt-1.5 hidden -translate-x-1/2 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-lg group-hover/tip:block">
        {label}
      </span>
    </span>
  )
}

function IconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
    >
      <Icon className="h-4 w-4 text-ink-soft" />
    </button>
  )
}

/* ---------------- Create dropdown (+ Task ⌄) ---------------- */

const CREATE_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: 'Task', icon: CircleDot },
  { label: 'Milestone', icon: Diamond },
  { label: 'Bug', icon: Bug },
  { label: 'Epic', icon: Crown },
  { label: 'Feedback', icon: MessageSquareText },
  { label: 'Form Response', icon: ClipboardList },
]

/** The six tasks the video's Recent flyout shows, resolved against live store data. */
const RECENT_NAMES = [
  'Dashboard - Inventory Health Status',
  'Dashboard Summary API',
  'Access and Permissions',
  'Purchase Listing page',
  'User Sign In',
  'Line Graph : Inventory Value Trend API',
]

function pickRecent(tasks: Task[]): Task[] {
  const picked: Task[] = []
  for (const name of RECENT_NAMES) {
    const t = tasks.find((x) => x.name === name && !picked.includes(x))
    if (t) picked.push(t)
  }
  for (const t of tasks) {
    if (picked.length >= 6) break
    if (!picked.includes(t)) picked.push(t)
  }
  return picked.slice(0, 6)
}

function StatusMarker({ status }: { status?: TaskStatus }) {
  const color = status?.color ?? '#87909e'
  if (status && (status.group === 'done' || status.group === 'closed')) {
    return (
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Check size={9} strokeWidth={3.5} className="text-white" />
      </span>
    )
  }
  if (!status || status.group === 'not-started') {
    return (
      <span
        className="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: color }}
      />
    )
  }
  if (status.id === 'baInProgress') {
    return <span className="h-3 w-3 shrink-0 rounded-full border-[3px]" style={{ borderColor: color }} />
  }
  return <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
}

function AvatarStack({ ids, users }: { ids?: string[]; users: Record<string, User> }) {
  const list = (ids ?? [])
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))
    .slice(0, 3)
  if (list.length === 0) return null
  return (
    <span className="flex shrink-0 items-center -space-x-1.5">
      {list.map((u) => (
        <span key={u.id} className="rounded-full ring-2 ring-white">
          <Avatar initials={u.initials} color={u.color} size={22} title={u.name} />
        </span>
      ))}
    </span>
  )
}

/** Left flyout of the Create dropdown: search + 6 recent tasks from the store. */
function RecentFlyout({ onPick }: { onPick: (taskId: string) => void }) {
  const tasks = useAppStore((s) => s.tasks)
  const users = useAppStore((s) => s.users)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const notify = useAppStore((s) => s.notify)
  const [query, setQuery] = useState('')

  const recent = useMemo(() => pickRecent(tasks), [tasks])
  const q = query.trim().toLowerCase()
  const shown = q ? recent.filter((t) => t.name.toLowerCase().includes(q)) : recent

  return (
    <div className="animate-pop-in w-[500px] rounded-xl border border-line bg-white shadow-xl">
      <div className="border-b border-line p-2">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for task name, ID, or URL"
            className="h-8 w-full rounded-md border border-line-strong bg-white pr-2 pl-7 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-brand"
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[13px] font-medium text-ink">Recent</span>
        <button
          onClick={() => comingSoon(notify, 'Browsing tasks')}
          className="cursor-pointer text-[13px] text-ink-faint hover:text-ink-soft"
        >
          Browse tasks
        </button>
      </div>
      <div className="max-h-[220px] overflow-y-auto p-1.5 pt-0">
        {shown.map((t, i) => {
          const parent = t.parentId ? tasks.find((x) => x.id === t.parentId) : undefined
          return (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left hover:bg-hover ${
                parent ? 'py-1' : 'h-8'
              } ${i === 0 ? 'bg-panel' : ''}`}
            >
              {parent ? (
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate pl-[18px] text-[12px] text-ink-faint">{parent.name}</span>
                  <span className="flex items-center gap-1.5">
                    <CornerDownRight size={13} className="shrink-0 text-ink-faint" />
                    <span className="truncate text-[13px] text-ink">{t.name}</span>
                  </span>
                </span>
              ) : (
                <>
                  <StatusMarker status={taskStatuses[t.statusId]} />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{t.name}</span>
                </>
              )}
              <AvatarStack ids={t.assigneeIds} users={users} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CreateDropdown({
  pos,
  listId,
  onClose,
}: {
  pos: PopoverPos
  listId: string
  onClose: () => void
}) {
  const notify = useAppStore((s) => s.notify)
  const openNewTask = useAppStore((s) => s.openNewTask)
  const openTask = useAppStore((s) => s.openTask)
  const [query, setQuery] = useState('')
  const [flyout, setFlyout] = useState(false)

  const q = query.trim().toLowerCase()
  const types = CREATE_TYPES.filter((t) => !q || t.label.toLowerCase().includes(q))

  const pickType = (label: string) => {
    onClose()
    if (label === 'Task') openNewTask(listId)
    else comingSoon(notify, `The ${label} task type`)
  }

  const row = (icon: LucideIcon, label: string, onClick: () => void, trailing?: ReactNode) => {
    const Icon = icon
    return (
      <button
        key={label}
        onClick={onClick}
        className="flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
      >
        <Icon size={15} className="shrink-0 text-ink-soft" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {trailing}
      </button>
    )
  }

  return (
    <Popover pos={pos} width={277} onClose={onClose}>
      <div className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium text-ink-faint">Create</div>
      <div className="px-0.5 pb-1">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find type (e.g. Milestone)"
          className="h-8 w-full rounded-md border border-line-strong bg-white px-2.5 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-brand"
        />
      </div>
      <div className="max-h-[212px] overflow-y-auto">
        {types.map((t, i) => (
          <button
            key={t.label}
            onClick={() => pickType(t.label)}
            className={`flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover ${
              i === 0 ? 'bg-panel' : ''
            }`}
          >
            <t.icon size={15} className={`shrink-0 ${t.label === 'Task' ? 'text-ink' : 'text-ink-soft'}`} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="my-1 border-t border-line" />
      <div
        className="relative"
        onMouseEnter={() => setFlyout(true)}
        onMouseLeave={() => setFlyout(false)}
      >
        {row(Plus, 'Task from another List', () => setFlyout(true), (
          <ChevronRight size={14} className="shrink-0 text-ink-faint" />
        ))}
        {flyout && (
          <div className="absolute -top-2 right-full z-10 pr-2">
            <RecentFlyout
              onPick={(taskId) => {
                onClose()
                openTask(taskId)
              }}
            />
          </div>
        )}
      </div>
      {row(Pin, 'Pin a Template', () => {
        onClose()
        comingSoon(notify, 'Pinning templates')
      })}
      {row(Copy, 'Apply a template', () => {
        onClose()
        comingSoon(notify, 'Applying templates')
      })}
    </Popover>
  )
}

/* ---------------- Toolbar ---------------- */

/**
 * Toolbar row under the view tabs: Status grouping pill + display icons on the
 * left; Save view (only once the view was modified), filter icons and the
 * brand "+ Task ▾" split button on the right.
 */
export function ListToolbar({
  saveViewVisible,
  listId,
}: {
  saveViewVisible: boolean
  listId?: string
}) {
  const notify = useAppStore((s) => s.notify)
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const setCustomizeViewOpen = useAppStore((s) => s.setCustomizeViewOpen)
  const openNewTask = useAppStore((s) => s.openNewTask)
  const [createPos, setCreatePos] = useState<PopoverPos | null>(null)
  const soon = (what: string) => () => comingSoon(notify, what)
  const targetList = listId ?? 'backlog'

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line bg-white px-4">
      {/* Left — grouping + display options */}
      <button
        onClick={soon('View grouping')}
        className="flex h-[26px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#eeeafb] px-2.5 text-[12.5px] font-medium text-[#5f48ea] hover:bg-[#e3dcf9]"
      >
        <Layers2 className="h-3.5 w-3.5" />
        Status
      </button>
      <IconBtn icon={Network} label="Subtasks" onClick={soon('Subtask display options')} />
      <IconBtn icon={Columns3} label="Columns" onClick={soon('Column settings')} />

      {/* Right — view actions */}
      <div className="ml-auto flex items-center gap-1">
        {saveViewVisible && (
          <div className="animate-fade-in mr-0.5 flex items-center">
            <button
              onClick={soon('Saving views')}
              className="h-7 cursor-pointer rounded-l-lg border border-line-strong px-2.5 text-[12.5px] font-medium text-ink hover:bg-hover"
            >
              Save view
            </button>
            <button
              title="Save view options"
              onClick={soon('Saving views')}
              className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-line-strong hover:bg-hover"
            >
              <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
            </button>
          </div>
        )}
        <Tip label="Quickly filter your tasks">
          <IconBtn icon={Filter} label="Filter" onClick={soon('Filters')} />
        </Tip>
        <IconBtn icon={CircleCheck} label="Show closed" onClick={soon('The closed-tasks toggle')} />
        <IconBtn icon={Users} label="Assignees" onClick={soon('The assignee filter')} />
        <button
          title="Me mode"
          onClick={soon('Me Mode')}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Avatar initials="P" color="#4a80f5" size={22} />
        </button>
        <IconBtn icon={Search} label="Search tasks" onClick={() => setSearchOpen(true)} />
        <Tip label="Customize your view settings">
          <IconBtn
            icon={Settings}
            label="View settings"
            onClick={() => setCustomizeViewOpen(true)}
          />
        </Tip>
        <div className="ml-1 flex items-center">
          <Tip label="Add a Task to this location">
            <button
              onClick={() => openNewTask(targetList)}
              className="flex h-7 cursor-pointer items-center gap-1 rounded-l-lg bg-brand px-2.5 text-[13px] font-medium text-white hover:bg-brand-deep"
            >
              <Plus className="h-3.5 w-3.5" />
              Task
            </button>
          </Tip>
          <button
            aria-label="Create options"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setCreatePos({
                top: Math.min(r.bottom + 6, window.innerHeight - 80),
                left: Math.max(8, r.right - 277),
              })
            }}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-r-lg border-l border-white/20 bg-brand hover:bg-brand-deep"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 text-white transition-transform ${createPos ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
      {createPos && (
        <CreateDropdown pos={createPos} listId={targetList} onClose={() => setCreatePos(null)} />
      )}
    </div>
  )
}
