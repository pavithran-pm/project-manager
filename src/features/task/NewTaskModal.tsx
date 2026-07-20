import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Ban,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CircleUserRound,
  Clock,
  Columns3,
  Ellipsis,
  FileText,
  Flag,
  Hourglass,
  Link2,
  List,
  Menu,
  Network,
  Paperclip,
  Plus,
  Search,
  Settings,
  Sparkles,
  SquareArrowOutUpRight,
  SquareCheck,
  Table2,
  Tag,
  Target,
  WandSparkles,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Popover, popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import {
  comingSoon,
  findListItem,
  formatDueDate,
  PRIORITY_META,
  useAppStore,
} from '../../lib/store'
import { statusOrder } from '../../lib/seed'
import type { StatusGroup, TaskPriority, TaskStatus, User } from '../../lib/types'

const TABS = ['Task', 'Doc', 'Reminder', 'Whiteboard', 'Dashboard'] as const
type TabName = (typeof TABS)[number]

interface Draft {
  name: string
  desc: string
  statusId: string
  assigneeIds: string[]
  dueIso?: string
  priority?: TaskPriority
  tags: string[]
}

type PopKind = 'status' | 'assignee' | 'due' | 'priority' | 'tags' | 'more'

/* ---------------- shared bits ---------------- */

function StatusGlyph({ status }: { status: TaskStatus }) {
  if (status.group === 'done' || status.group === 'closed') {
    return <CircleCheck size={15} className="shrink-0" style={{ color: status.color }} />
  }
  return (
    <span
      className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full ${
        status.style === 'outline' ? 'border-[1.5px] border-dashed' : 'border-2'
      }`}
      style={{ borderColor: status.color }}
    />
  )
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Search
        size={13}
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
      />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[30px] w-full rounded-md border border-line-strong bg-white pr-2 pl-7 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
      />
    </div>
  )
}

/** Purple pill switch used by the Private toggles and the date footer. */
function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle"
      className={`h-[18px] w-8 shrink-0 cursor-pointer rounded-full p-[2px] transition-colors ${
        on ? 'bg-brand' : 'bg-line-strong'
      }`}
    >
      <span
        className={`block h-[14px] w-[14px] rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-[14px]' : ''
        }`}
      />
    </button>
  )
}

/* ---------------- chip popovers (all write to the local draft) ---------------- */

const GROUP_LABELS: Record<StatusGroup, string> = {
  'not-started': 'Not started',
  active: 'Active',
  done: 'Done',
  closed: 'Closed',
}
const GROUP_SEQ: StatusGroup[] = ['not-started', 'active', 'done', 'closed']

function StatusPop({
  pos,
  statusId,
  onPick,
  onClose,
}: {
  pos: PopoverPos
  statusId: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GROUP_SEQ.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: statusOrder
        .map((id) => taskStatuses[id])
        .filter((st): st is TaskStatus => Boolean(st))
        .filter((st) => st.group === group && (!q || st.label.toLowerCase().includes(q))),
    })).filter((g) => g.items.length > 0)
  }, [query, taskStatuses])

  return (
    <Popover pos={pos} width={240} onClose={onClose}>
      <div className="p-0.5 pb-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search..." />
      </div>
      <div className="max-h-[320px] overflow-y-auto pb-0.5">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-ink-faint">{g.label}</div>
            {g.items.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onPick(st.id)
                  onClose()
                }}
                className="flex h-[30px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left hover:bg-hover"
              >
                <StatusGlyph status={st} />
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">
                  {st.label}
                </span>
                {st.id === statusId && <Check size={14} className="shrink-0 text-ink" />}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Popover>
  )
}

function PeoplePop({
  pos,
  assigneeIds,
  onToggle,
  onClose,
}: {
  pos: PopoverPos
  assigneeIds: string[]
  onToggle: (userId: string) => void
  onClose: () => void
}) {
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const notify = useAppStore((s) => s.notify)
  const [query, setQuery] = useState('')

  // The video's picker lists just Me and Arun RK.
  const people = useMemo(() => {
    const ids = [currentUserId, 'arun'].filter((id) => users[id])
    if (ids.length < 2) {
      for (const id of Object.keys(users)) {
        if (ids.length >= 2) break
        if (!ids.includes(id)) ids.push(id)
      }
    }
    const q = query.trim().toLowerCase()
    return ids
      .map((id) => users[id])
      .filter((u): u is User => Boolean(u))
      .filter(
        (u) =>
          !q || u.name.toLowerCase().includes(q) || (u.id === currentUserId && 'me'.includes(q)),
      )
  }, [users, currentUserId, query])

  return (
    <Popover pos={pos} width={280} onClose={onClose}>
      <div className="p-0.5 pb-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search or enter email..." />
      </div>
      <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-ink-faint">People</div>
      {people.map((u) => (
        <button
          key={u.id}
          onClick={() => onToggle(u.id)}
          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left hover:bg-hover"
        >
          <Avatar initials={u.initials} color={u.color} size={24} presence={u.id === currentUserId} />
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
            {u.id === currentUserId ? 'Me' : u.name}
          </span>
          {assigneeIds.includes(u.id) && <Check size={14} className="shrink-0 text-ink" />}
        </button>
      ))}
      <div className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium text-ink-faint">Agents</div>
      <button
        onClick={() => comingSoon(notify, 'Agents')}
        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left hover:bg-hover"
      >
        <span className="flex h-6 w-6 items-center justify-center">
          <Plus size={16} className="text-ink-faint" />
        </span>
        <span className="text-[13px] text-ink">Create Agent</span>
      </button>
    </Popover>
  )
}

/* ---- due-date popover (DatePickerPopover pattern, draft-local) ---- */

type DateField = 'start' | 'due' | 'duration'

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}
const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const weekdayShort = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' })
const dayMonth = (d: Date) => `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`
const timeShort = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()

function DuePop({
  pos,
  dueIso,
  onPick,
  onClose,
}: {
  pos: PopoverPos
  dueIso?: string
  onPick: (iso: string) => void
  onClose: () => void
}) {
  const notify = useAppStore((s) => s.notify)
  const [focused, setFocused] = useState<DateField>('due')
  const [startText, setStartText] = useState('')
  const [dueText, setDueText] = useState(dueIso ? formatDueDate(dueIso) : '')
  const [durationText, setDurationText] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)
  const [skipNonWorking, setSkipNonWorking] = useState(true)

  const now = new Date()
  const quick = useMemo(() => {
    const base = new Date()
    const dow = base.getDay()
    const toSat = (6 - dow + 7) % 7
    const toMon = ((1 - dow + 7) % 7) || 7
    return [
      { label: 'Today', hint: weekdayShort(base), days: 0 },
      { label: 'Later', hint: timeShort(new Date(base.getTime() + 2 * 60 * 60 * 1000)), days: 0 },
      { label: 'Tomorrow', hint: weekdayShort(addDays(base, 1)), days: 1 },
      { label: 'This weekend', hint: weekdayShort(addDays(base, toSat)), days: toSat },
      { label: 'Next week', hint: weekdayShort(addDays(base, toMon)), days: toMon },
      { label: 'Next weekend', hint: dayMonth(addDays(base, toSat + 7)), days: toSat + 7 },
      { label: '2 weeks', hint: dayMonth(addDays(base, 14)), days: 14 },
      { label: '4 weeks', hint: dayMonth(addDays(base, 28)), days: 28 },
    ]
  }, [])

  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const gridStart = addDays(viewMonth, -((viewMonth.getDay() + 6) % 7))
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  const setDue = (d: Date) => {
    onPick(toIso(d))
    onClose()
  }
  const pickDay = (d: Date) => {
    if (focused === 'start') {
      setStartText(`${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`)
      setFocused('due')
    } else {
      setDue(d)
    }
  }

  const inputCls = (f: DateField) =>
    `h-8 w-full rounded-lg border bg-white pl-7 pr-2 text-[13px] text-ink outline-none placeholder:text-ink-faint ${
      focused === f ? 'border-ink-soft' : 'border-line-strong'
    }`

  return (
    <Popover pos={pos} width={544} onClose={onClose}>
      <div className="flex gap-1.5 p-1 pb-2">
        <div className="relative flex-1">
          <Calendar
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={startText}
            onChange={(e) => setStartText(e.target.value)}
            onFocus={() => setFocused('start')}
            placeholder="Start date"
            className={inputCls('start')}
          />
        </div>
        <div className="relative flex-1">
          <Calendar
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            autoFocus
            value={dueText}
            onChange={(e) => setDueText(e.target.value)}
            onFocus={() => setFocused('due')}
            placeholder="Due date"
            className={inputCls('due')}
          />
        </div>
        <div className="relative w-[92px]">
          <Clock
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={durationText}
            onChange={(e) => setDurationText(e.target.value)}
            onFocus={() => setFocused('duration')}
            placeholder="Duration"
            className={inputCls('duration')}
          />
        </div>
      </div>
      <div className="flex">
        <div className="w-[206px] border-r border-line py-1 pr-1.5">
          {quick.map((q) => (
            <button
              key={q.label}
              onClick={() => setDue(addDays(new Date(), q.days))}
              className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2 text-left hover:bg-hover"
            >
              <span className="text-[13px] text-ink">{q.label}</span>
              <span className="text-[12px] text-ink-faint">{q.hint}</span>
            </button>
          ))}
          <div className="my-1 border-t border-line" />
          <button
            onClick={() => comingSoon(notify, 'Recurring tasks')}
            className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2 text-left hover:bg-hover"
          >
            <span className="text-[13px] text-ink">Set Recurring</span>
            <ChevronRight size={14} className="text-ink-faint" />
          </button>
        </div>
        <div className="flex-1 px-3 py-1.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink">{monthLabel}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMonthOffset(0)}
                className="cursor-pointer text-[12px] text-ink-soft hover:text-ink"
              >
                Today
              </button>
              <div className="flex flex-col">
                <button
                  onClick={() => setMonthOffset((m) => m - 1)}
                  className="cursor-pointer text-ink-faint hover:text-ink"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => setMonthOffset((m) => m + 1)}
                  className="cursor-pointer text-ink-faint hover:text-ink"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="pb-1 text-[11px] text-ink-faint">
                {d}
              </span>
            ))}
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === viewMonth.getMonth()
              const isToday =
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate()
              return (
                <button
                  key={i}
                  onClick={() => pickDay(d)}
                  className="flex h-8 cursor-pointer items-center justify-center"
                >
                  <span
                    className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] ${
                      isToday
                        ? 'bg-brand font-medium text-white'
                        : inMonth
                          ? 'text-ink hover:bg-hover'
                          : 'text-ink-faint/60 hover:bg-hover'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="-mx-1.5 -mb-1.5 mt-1 flex items-center gap-2.5 rounded-b-[11px] border-t border-line px-4 py-2.5">
        <Switch on={skipNonWorking} onToggle={() => setSkipNonWorking((v) => !v)} />
        <span className="text-[13px] text-ink">Skip non-working days</span>
      </div>
    </Popover>
  )
}

const PRIORITY_SEQ: TaskPriority[] = ['urgent', 'high', 'normal', 'low']

function PriorityPop({
  pos,
  onPick,
  onClose,
}: {
  pos: PopoverPos
  onPick: (p: TaskPriority | undefined) => void
  onClose: () => void
}) {
  return (
    <Popover pos={pos} width={180} onClose={onClose}>
      <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-ink-faint">Priority</div>
      {PRIORITY_SEQ.map((p) => (
        <button
          key={p}
          onClick={() => {
            onPick(p)
            onClose()
          }}
          className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
        >
          <Flag size={14} fill="currentColor" style={{ color: PRIORITY_META[p].color }} />
          {PRIORITY_META[p].label}
        </button>
      ))}
      <div className="my-1 border-t border-line" />
      <button
        onClick={() => {
          onPick(undefined)
          onClose()
        }}
        className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink-soft hover:bg-hover"
      >
        <Ban size={14} className="text-ink-faint" />
        Clear
      </button>
    </Popover>
  )
}

function TagsPop({
  pos,
  tags,
  onToggle,
  onClose,
}: {
  pos: PopoverPos
  tags: string[]
  onToggle: (tagId: string) => void
  onClose: () => void
}) {
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const notify = useAppStore((s) => s.notify)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const list = Object.values(workspaceTags).filter((t) => !q || t.label.toLowerCase().includes(q))

  return (
    <Popover pos={pos} width={275} onClose={onClose}>
      <div className="p-0.5 pb-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search or add tags..." />
      </div>
      <div className="flex h-7 items-center justify-between px-2">
        <span className="text-[11px] font-medium text-ink-faint">Select an option</span>
        <button
          onClick={() => comingSoon(notify, 'Tag settings')}
          className="cursor-pointer text-ink-faint hover:text-ink-soft"
        >
          <Settings size={13} />
        </button>
      </div>
      <div className="max-h-[220px] overflow-y-auto pb-0.5">
        {list.map((t) => (
          <button
            key={t.id}
            onClick={() => onToggle(t.id)}
            className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2 text-left hover:bg-hover"
          >
            <span
              className="flex h-[18px] items-center rounded px-1.5 text-[11px] font-bold"
              style={{ backgroundColor: t.bg, color: t.text }}
            >
              {t.label}
            </span>
            {tags.includes(t.id) && <Check size={14} className="text-ink" />}
          </button>
        ))}
      </div>
    </Popover>
  )
}

function MorePop({ pos, onClose }: { pos: PopoverPos; onClose: () => void }) {
  const notify = useAppStore((s) => s.notify)
  const item = (icon: ReactNode, label: string, what: string) => (
    <button
      onClick={() => {
        onClose()
        comingSoon(notify, what)
      }}
      className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
    >
      {icon}
      {label}
    </button>
  )
  return (
    <Popover pos={pos} width={190} onClose={onClose}>
      {item(<Hourglass size={14} className="text-ink-faint" />, 'Time Estimate', 'Time estimates')}
      {item(<Target size={14} className="text-ink-faint" />, 'Sprint Points', 'Sprint points')}
      {item(<Link2 size={14} className="text-ink-faint" />, 'Dependencies', 'Dependencies')}
      <div className="my-1 border-t border-line" />
      {item(<Network size={14} className="text-ink-faint" />, 'Subtasks', 'Subtasks in the create modal')}
      {item(<SquareCheck size={14} className="text-ink-faint" />, 'Checklist', 'Checklists in the create modal')}
    </Popover>
  )
}

/* ---------------- non-task tab forms ---------------- */

function OptionRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
    >
      {icon}
      {label}
    </button>
  )
}

function LocationChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-[26px] cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2 text-[13px] text-ink hover:bg-hover"
    >
      <Menu size={13} className="text-ink-faint" />
      {label}
      <ChevronDown size={13} className="text-ink-faint" />
    </button>
  )
}

function DocForm() {
  const notify = useAppStore((s) => s.notify)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const soon = (what: string) => () => comingSoon(notify, what)

  return (
    <>
      <div className="px-5 pt-4 pb-3">
        <LocationChip label="My Docs" onClick={soon('Doc locations')} />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this Doc..."
          className="mt-3 w-full border-none text-[20px] font-medium text-ink outline-none placeholder:text-[#b7bcc6]"
        />
        <div className="mt-2">
          <OptionRow
            icon={<FileText size={15} className="text-ink-faint" />}
            label="Start writing"
            onClick={soon('Docs')}
          />
          <OptionRow
            icon={<Sparkles size={15} className="text-brand" />}
            label="Write with AI"
            onClick={soon('Writing with AI')}
          />
        </div>
        <div className="mt-2 px-2 text-[12px] font-medium text-ink-faint">Add new</div>
        <div className="mt-1">
          <OptionRow
            icon={<Table2 size={15} className="text-brand" />}
            label="Table"
            onClick={soon('Doc tables')}
          />
          <OptionRow
            icon={<Columns3 size={15} className="text-brand" />}
            label="Column"
            onClick={soon('Doc columns')}
          />
          <OptionRow
            icon={<List size={15} className="text-brand" />}
            label="ClickUp List"
            onClick={soon('Embedded Lists')}
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="flex items-center gap-2.5">
          <Switch on={isPrivate} onToggle={() => setIsPrivate((v) => !v)} />
          <span className="text-[13px] text-ink">Private</span>
        </span>
        <button
          onClick={soon('Doc creation')}
          className="h-8 cursor-pointer rounded-lg bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-deep"
        >
          Create Doc
        </button>
      </div>
    </>
  )
}

function ReminderForm() {
  const notify = useAppStore((s) => s.notify)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const [name, setName] = useState('')
  const soon = (what: string) => () => comingSoon(notify, what)
  const me = users[currentUserId]

  const chip = (content: ReactNode, what: string) => (
    <button
      onClick={soon(what)}
      className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-2.5 text-[12.5px] font-medium text-ink-soft hover:bg-hover"
    >
      {content}
    </button>
  )

  return (
    <>
      <div className="px-5 pt-5 pb-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Reminder name or type '/' for commands"
          className="w-full border-none text-[20px] font-medium text-ink outline-none placeholder:text-[#b7bcc6]"
        />
        <button
          onClick={soon('Reminder descriptions')}
          className="mt-2 flex h-8 cursor-pointer items-center gap-2 rounded-md px-1.5 text-[13px] text-ink-soft hover:bg-hover"
        >
          <FileText size={14} className="text-ink-faint" />
          Add description
        </button>
        <div className="mt-3 flex items-center gap-1.5">
          {chip(
            <>
              <Calendar size={14} className="text-ink-faint" />
              Today
            </>,
            'Reminder scheduling',
          )}
          {chip(
            <>
              <Avatar
                initials={me ? me.initials.charAt(0) : 'P'}
                color={me?.color ?? '#7b68ee'}
                size={18}
              />
              For me
            </>,
            'Reminder assignment',
          )}
          {chip(
            <>
              <Bell size={14} className="text-ink-faint" />
              Notify me
            </>,
            'Reminder notifications',
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
        <button
          aria-label="Attach"
          onClick={soon('Attachments')}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
        >
          <Paperclip size={15} />
        </button>
        <button
          onClick={soon('Reminders')}
          className="h-8 cursor-pointer rounded-lg bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-deep"
        >
          Create Reminder
        </button>
      </div>
    </>
  )
}

function BoardForm({ kind }: { kind: 'Whiteboard' | 'Dashboard' }) {
  const notify = useAppStore((s) => s.notify)
  const [name, setName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const soon = (what: string) => () => comingSoon(notify, what)

  return (
    <>
      <div className="px-5 pt-4 pb-4">
        <LocationChip label={`My ${kind}s`} onClick={soon(`${kind} locations`)} />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Name this ${kind}…`}
          className="mt-4 w-full border-none text-[20px] font-medium text-ink outline-none placeholder:text-[#b7bcc6]"
        />
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="flex items-center gap-2.5">
          <Switch on={isPrivate} onToggle={() => setIsPrivate((v) => !v)} />
          <span className="text-[13px] text-ink">Private</span>
        </span>
        <button
          onClick={soon(`${kind} creation`)}
          className="h-8 cursor-pointer rounded-lg bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-deep"
        >
          Create {kind}
        </button>
      </div>
    </>
  )
}

/* ---------------- the modal ---------------- */

export function NewTaskModal() {
  const newTaskFor = useAppStore((s) => s.newTaskFor)
  if (!newTaskFor) return null
  return <ModalCard key={newTaskFor} listId={newTaskFor} />
}

function ModalCard({ listId }: { listId: string }) {
  const closeNewTask = useAppStore((s) => s.closeNewTask)
  const notify = useAppStore((s) => s.notify)
  const spaces = useAppStore((s) => s.spaces)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const addTask = useAppStore((s) => s.addTask)

  const [tab, setTab] = useState<TabName>('Task')
  const [draft, setDraft] = useState<Draft>({
    name: '',
    desc: '',
    statusId: 'toDo',
    assigneeIds: [],
    tags: [],
  })
  const [pop, setPop] = useState<{ kind: PopKind; pos: PopoverPos } | null>(null)
  const [nameFocused, setNameFocused] = useState(false)
  const [descOpen, setDescOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const soon = (what: string) => () => comingSoon(notify, what)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pop) setPop(null)
      else closeNewTask()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pop, closeNewTask])

  const loc = findListItem(spaces, listId)
  const locName = loc?.item.name ?? 'List'
  const status = taskStatuses[draft.statusId] ?? taskStatuses.toDo

  const openPop = (kind: PopKind, width: number) => (e: { currentTarget: HTMLElement }) =>
    setPop({ kind, pos: popoverPosFor(e.currentTarget, width) })

  const createTask = () => {
    const name = draft.name.trim()
    if (!name) {
      nameRef.current?.focus()
      return
    }
    addTask(listId, draft.statusId || 'toDo', name)
    const st = useAppStore.getState()
    const created = st.tasks[st.tasks.length - 1]
    if (created && created.listId === listId && created.name === name) {
      if (draft.dueIso) st.setTaskDueDate(created.id, draft.dueIso)
      if (draft.priority) st.setTaskPriority(created.id, draft.priority)
      if (draft.tags.length > 0) st.setTaskTags(created.id, draft.tags)
      for (const uid of draft.assigneeIds) st.toggleTaskAssignee(created.id, uid)
    }
    closeNewTask()
    notify('Task created')
  }

  // Description zone: full "write with AI" row until the name is touched, then
  // the collapsed "+ Add description" link (as in the video), textarea once opened.
  const descCollapsed = nameFocused || draft.name.trim() !== ''
  const chipCls =
    'flex h-[26px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2 text-[12px] font-medium text-ink-soft hover:bg-hover'

  const assignedUsers = draft.assigneeIds
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))

  return (
    <>
      <div className="animate-fade-in fixed inset-0 z-40 bg-black/35" onClick={closeNewTask} />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center overflow-y-auto px-4 pt-[13vh]">
        <div className="animate-pop-in pointer-events-auto w-[636px] rounded-xl bg-white shadow-2xl">
          {/* ---- Tab row ---- */}
          <div className="flex items-center border-b border-line pr-2 pl-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex h-11 cursor-pointer items-center px-2.5 text-[13.5px] ${
                  tab === t ? 'font-semibold text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink" />
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-0.5">
              <button
                aria-label="Pop out"
                onClick={soon('The pop-out editor')}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
              >
                <SquareArrowOutUpRight size={14} />
              </button>
              <button
                aria-label="Close"
                onClick={closeNewTask}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {tab === 'Task' && (
            <>
              <div className="px-5 pt-4">
                {/* Location pills */}
                <div className="flex items-center gap-2">
                  <button onClick={soon('The location picker')} className={chipCls}>
                    {loc?.item.icon === 'sprint' ? (
                      <Target size={14} className="text-[#1f9d61]" />
                    ) : (
                      <List size={14} className="text-ink-faint" />
                    )}
                    <span className="max-w-[220px] truncate text-ink">{locName}</span>
                    <ChevronDown size={13} className="text-ink-faint" />
                  </button>
                  <button onClick={soon('Task types')} className={chipCls}>
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3f4650]">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                    <span className="text-ink">Task</span>
                    <ChevronDown size={13} className="text-ink-faint" />
                  </button>
                </div>

                {/* Name */}
                <input
                  ref={nameRef}
                  autoFocus
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && createTask()}
                  placeholder={nameFocused ? "Task Name or type '/' for commands" : 'Task Name'}
                  className={
                    nameFocused
                      ? 'mt-3 h-10 w-full rounded-lg border border-line-strong px-3 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-brand'
                      : 'mt-3 h-10 w-full border border-transparent px-1 text-[20px] font-medium text-ink outline-none placeholder:text-[#b7bcc6]'
                  }
                />

                {/* Description */}
                <div className="mt-2">
                  {descOpen || draft.desc !== '' ? (
                    <textarea
                      autoFocus
                      spellCheck
                      value={draft.desc}
                      onChange={(e) => setDraft((d) => ({ ...d, desc: e.target.value }))}
                      onBlur={() => {
                        if (draft.desc.trim() === '') setDescOpen(false)
                      }}
                      className="min-h-[64px] w-full resize-none rounded-md px-1.5 py-1 text-[13px] text-ink outline-none"
                    />
                  ) : descCollapsed ? (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setDescOpen(true)}
                      className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[13px] text-ink-soft hover:bg-hover"
                    >
                      <Plus size={13} />
                      Add description
                    </button>
                  ) : (
                    <button
                      onClick={() => setDescOpen(true)}
                      className="flex h-9 w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-left text-[13px] text-ink-soft hover:bg-hover"
                    >
                      Add description, or write with
                      <span className="flex items-center gap-1 font-medium text-brand">
                        <Sparkles size={13} />
                        AI
                      </span>
                    </button>
                  )}
                </div>

                {/* Chip row */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={openPop('status', 240)}
                    className="flex h-[26px] shrink-0 cursor-pointer items-center rounded-md bg-[#f1f1f4] px-2.5 text-[11px] font-bold text-ink hover:bg-hover"
                  >
                    {status?.label ?? 'TO DO'}
                  </button>
                  <button onClick={openPop('assignee', 280)} className={chipCls}>
                    {assignedUsers.length > 0 ? (
                      <>
                        <span className="flex items-center -space-x-1">
                          {assignedUsers.slice(0, 3).map((u) => (
                            <span key={u.id} className="rounded-full ring-2 ring-white">
                              <Avatar initials={u.initials} color={u.color} size={18} />
                            </span>
                          ))}
                        </span>
                        {assignedUsers.length === 1 && (
                          <span className="text-ink">
                            {assignedUsers[0].id === currentUserId ? 'Me' : assignedUsers[0].name}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <CircleUserRound size={14} className="text-ink-faint" />
                        Assignee
                      </>
                    )}
                  </button>
                  <button onClick={openPop('due', 544)} className={chipCls}>
                    <Calendar size={14} className="text-ink-faint" />
                    {draft.dueIso ? (
                      <span className="text-ink">{formatDueDate(draft.dueIso)}</span>
                    ) : (
                      'Due date'
                    )}
                  </button>
                  <button onClick={openPop('priority', 180)} className={chipCls}>
                    <Flag
                      size={14}
                      fill={draft.priority ? 'currentColor' : 'none'}
                      style={{
                        color: draft.priority ? PRIORITY_META[draft.priority].color : undefined,
                      }}
                      className={draft.priority ? '' : 'text-ink-faint'}
                    />
                    {draft.priority ? (
                      <span className="text-ink">{PRIORITY_META[draft.priority].label}</span>
                    ) : (
                      'Priority'
                    )}
                  </button>
                  <button onClick={openPop('tags', 275)} className={chipCls}>
                    {draft.tags.length > 0 ? (
                      <>
                        {draft.tags.slice(0, 2).map((id) => {
                          const t = workspaceTags[id]
                          if (!t) return null
                          return (
                            <span
                              key={id}
                              className="flex h-[16px] items-center rounded px-1.5 text-[10.5px] font-bold"
                              style={{ backgroundColor: t.bg, color: t.text }}
                            >
                              {t.label}
                            </span>
                          )
                        })}
                        {draft.tags.length > 2 && (
                          <span className="text-ink-faint">+{draft.tags.length - 2}</span>
                        )}
                      </>
                    ) : (
                      <>
                        <Tag size={14} className="text-ink-faint" />
                        Tags
                      </>
                    )}
                  </button>
                  <button
                    aria-label="More fields"
                    onClick={openPop('more', 190)}
                    className="flex h-[26px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-line-strong text-ink-soft hover:bg-hover"
                  >
                    <Ellipsis size={14} />
                  </button>
                </div>

                {/* Fields */}
                <div className="mt-5 pb-4">
                  <div className="text-[12px] font-medium text-ink-faint">Fields</div>
                  <button
                    onClick={soon('Custom fields')}
                    className="mt-2 flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong px-2.5 text-[12.5px] text-ink-soft hover:bg-hover"
                  >
                    <Plus size={13} />
                    Create new field
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-line px-5 py-3">
                <button
                  onClick={soon('Templates')}
                  className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[13px] text-ink hover:bg-hover"
                >
                  <WandSparkles size={14} className="text-ink-soft" />
                  Templates
                </button>
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Attach"
                    onClick={soon('Attachments')}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
                  >
                    <Paperclip size={15} />
                  </button>
                  <button
                    aria-label="Watchers"
                    onClick={soon('Watchers')}
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
                  >
                    <Bell size={15} />
                    <span className="absolute right-0.5 bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-line-strong bg-white text-[9px] font-semibold text-ink">
                      1
                    </span>
                  </button>
                  <div className="ml-1.5 flex items-center">
                    <button
                      onClick={createTask}
                      className="h-8 cursor-pointer rounded-l-lg bg-brand px-3.5 text-[13px] font-medium text-white hover:bg-brand-deep"
                    >
                      Create Task
                    </button>
                    <button
                      aria-label="Create options"
                      onClick={soon('Create options')}
                      className="flex h-8 w-7 cursor-pointer items-center justify-center rounded-r-lg border-l border-white/20 bg-brand text-white hover:bg-brand-deep"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chip popovers */}
              {pop?.kind === 'status' && (
                <StatusPop
                  pos={pop.pos}
                  statusId={draft.statusId}
                  onPick={(id) => setDraft((d) => ({ ...d, statusId: id }))}
                  onClose={() => setPop(null)}
                />
              )}
              {pop?.kind === 'assignee' && (
                <PeoplePop
                  pos={pop.pos}
                  assigneeIds={draft.assigneeIds}
                  onToggle={(uid) =>
                    setDraft((d) => ({
                      ...d,
                      assigneeIds: d.assigneeIds.includes(uid)
                        ? d.assigneeIds.filter((x) => x !== uid)
                        : [...d.assigneeIds, uid],
                    }))
                  }
                  onClose={() => setPop(null)}
                />
              )}
              {pop?.kind === 'due' && (
                <DuePop
                  pos={pop.pos}
                  dueIso={draft.dueIso}
                  onPick={(iso) => setDraft((d) => ({ ...d, dueIso: iso }))}
                  onClose={() => setPop(null)}
                />
              )}
              {pop?.kind === 'priority' && (
                <PriorityPop
                  pos={pop.pos}
                  onPick={(p) => setDraft((d) => ({ ...d, priority: p }))}
                  onClose={() => setPop(null)}
                />
              )}
              {pop?.kind === 'tags' && (
                <TagsPop
                  pos={pop.pos}
                  tags={draft.tags}
                  onToggle={(id) =>
                    setDraft((d) => ({
                      ...d,
                      tags: d.tags.includes(id)
                        ? d.tags.filter((x) => x !== id)
                        : [...d.tags, id],
                    }))
                  }
                  onClose={() => setPop(null)}
                />
              )}
              {pop?.kind === 'more' && <MorePop pos={pop.pos} onClose={() => setPop(null)} />}
            </>
          )}

          {tab === 'Doc' && <DocForm />}
          {tab === 'Reminder' && <ReminderForm />}
          {tab === 'Whiteboard' && <BoardForm kind="Whiteboard" />}
          {tab === 'Dashboard' && <BoardForm kind="Dashboard" />}
        </div>
      </div>
    </>
  )
}
