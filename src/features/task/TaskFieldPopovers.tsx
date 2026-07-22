import { useMemo, useState } from 'react'
import {
  AlignLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock,
  DollarSign,
  Ellipsis,
  Network,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Timer,
  UserRoundPlus,
  X,
} from 'lucide-react'
import { Popover } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'
import { statusOrder } from '../../lib/seed'
import type { StatusGroup, Task, TaskStatus, User } from '../../lib/types'

export interface FieldPopoverProps {
  task: Task
  pos: PopoverPos
  onClose: () => void
}

/* ---------------- shared helpers ---------------- */

/** Keep a fixed popover of the given size fully on screen. */
function clampPos(pos: PopoverPos, width: number, height: number): PopoverPos {
  return {
    top: Math.max(8, Math.min(pos.top, window.innerHeight - height - 8)),
    left: Math.max(8, Math.min(pos.left, window.innerWidth - width - 8)),
  }
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

/* ---------------- StatusDropdown ---------------- */

const GROUP_LABELS: Record<StatusGroup, string> = {
  'not-started': 'Not started',
  active: 'Active',
  done: 'Done',
  closed: 'Closed',
}
const GROUP_SEQ: StatusGroup[] = ['not-started', 'active', 'done', 'closed']

export function StatusDropdown({ task, pos, onClose }: FieldPopoverProps) {
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const notify = useAppStore((s) => s.notify)
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

  const p = clampPos(pos, 240, 424)
  return (
    <Popover pos={p} width={240} onClose={onClose}>
      <div className="p-0.5 pb-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search..." />
      </div>
      <div className="max-h-[360px] overflow-y-auto pb-0.5">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="group/gh flex h-6 items-center justify-between px-2 pt-1">
              <span className="text-[11px] font-medium text-ink-faint">{g.label}</span>
              <button
                onClick={() => comingSoon(notify, 'Status settings')}
                className="cursor-pointer text-ink-faint opacity-0 group-hover/gh:opacity-100 hover:text-ink-soft"
              >
                <Ellipsis size={13} />
              </button>
            </div>
            {g.items.map((st) => {
              const current = st.id === task.statusId
              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setTaskStatus(task.id, st.id)
                    onClose()
                  }}
                  className="flex h-[30px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left hover:bg-hover"
                >
                  <StatusGlyph status={st} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">
                    {st.label}
                  </span>
                  {current && <Check size={14} className="shrink-0 text-ink" />}
                  {st.group === 'done' && (
                    <CircleCheck size={15} className="shrink-0 text-ink-faint" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </Popover>
  )
}

/* ---------------- DatePickerPopover ---------------- */

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

export function DatePickerPopover({ task, pos, onClose }: FieldPopoverProps) {
  const setTaskDueDate = useAppStore((s) => s.setTaskDueDate)
  const notify = useAppStore((s) => s.notify)
  const [focused, setFocused] = useState<DateField>('due')
  const [startText, setStartText] = useState('')
  const [dueText, setDueText] = useState(task.dueDate ?? '')
  const [durationText, setDurationText] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)
  const [skipNonWorking, setSkipNonWorking] = useState(true)

  const now = new Date()
  /** Real relative quick options, matching the video's Today…4 weeks list. */
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
    setTaskDueDate(task.id, toIso(d))
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
  const p = clampPos(pos, 544, 416)

  return (
    <Popover pos={p} width={544} onClose={onClose}>
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
        <button
          onClick={() => setSkipNonWorking((v) => !v)}
          className={`h-[18px] w-8 shrink-0 cursor-pointer rounded-full p-[2px] transition-colors ${
            skipNonWorking ? 'bg-brand' : 'bg-line-strong'
          }`}
        >
          <span
            className={`block h-[14px] w-[14px] rounded-full bg-white shadow transition-transform ${
              skipNonWorking ? 'translate-x-[14px]' : ''
            }`}
          />
        </button>
        <span className="text-[13px] text-ink">Skip non-working days</span>
      </div>
    </Popover>
  )
}

/* ---------------- TimeTrackPopover ---------------- */

export function TimeTrackPopover({ pos, onClose }: FieldPopoverProps) {
  const notify = useAppStore((s) => s.notify)
  const [value, setValue] = useState('')

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const t = timeShort(now)

  const save = () => {
    if (value.trim()) notify('Time tracking saved')
    onClose()
  }

  const p = clampPos(pos, 440, 340)
  return (
    <Popover pos={p} width={440} onClose={onClose}>
      <div className="px-2 pt-1.5">
        <div className="flex h-7 items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Time on all tasks</span>
          <span className="text-[13px] text-ink-soft">0h</span>
        </div>
        <div className="flex h-7 items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] text-ink-soft">
            <Network size={14} className="text-ink-faint" />
            Without Subtasks
          </span>
          <span className="text-[13px] text-ink-soft">0h</span>
        </div>
        <div className="relative mt-2 mb-1">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="Enter time (ex: 3h 20m) or start timer"
            className="h-11 w-full rounded-lg border border-line-strong pr-11 pl-3 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
          />
          <button
            onClick={() => comingSoon(notify, 'Timer')}
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#e0418c] text-white hover:bg-[#c93379]"
          >
            <Play size={12} fill="currentColor" />
          </button>
        </div>
        <button
          onClick={() => comingSoon(notify, 'Time entries')}
          className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md px-1 text-left hover:bg-hover"
        >
          <span className="flex items-center gap-2.5 text-[13px] text-ink">
            <Timer size={15} className="text-ink-faint" />
            {dateLabel}
          </span>
          <span className="text-[13px] text-ink-soft">
            {t} &ndash; {t}
          </span>
        </button>
        <button
          onClick={() => comingSoon(notify, 'Notes')}
          className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-1 text-left text-[13px] text-ink hover:bg-hover"
        >
          <AlignLeft size={15} className="text-ink-faint" />
          Notes
        </button>
        <button
          onClick={() => comingSoon(notify, 'Time entry tags')}
          className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-md px-1 text-left text-[13px] text-ink hover:bg-hover"
        >
          <Tag size={15} className="text-ink-faint" />
          Add tags
        </button>
      </div>
      <div className="-mx-1.5 -mb-1.5 mt-1.5 flex items-center justify-between rounded-b-[11px] border-t border-line px-3.5 py-2">
        <button
          onClick={() => comingSoon(notify, 'Billable time')}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-dashed border-ink-faint text-ink-faint hover:text-ink-soft"
        >
          <DollarSign size={12} />
        </button>
        <button
          onClick={save}
          className="h-8 cursor-pointer rounded-md bg-[#f0f0f2] px-3.5 text-[13px] font-medium text-ink hover:bg-hover"
        >
          Save
        </button>
      </div>
    </Popover>
  )
}

/* ---------------- AssigneePicker ---------------- */

export function AssigneePicker({ task, pos, onClose }: FieldPopoverProps) {
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const toggleTaskAssignee = useAppStore((s) => s.toggleTaskAssignee)
  const notify = useAppStore((s) => s.notify)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const assignedIds = task.assigneeIds ?? []
  const matches = (u: User) =>
    !q || u.name.toLowerCase().includes(q) || (u.id === currentUserId && 'me'.includes(q))
  const assigned = assignedIds
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))
    .filter(matches)
  const people = [currentUserId, ...Object.keys(users).filter((id) => id !== currentUserId)]
    .filter((id) => !assignedIds.includes(id))
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))
    .filter(matches)

  const toggle = (userId: string) => {
    toggleTaskAssignee(task.id, userId)
    onClose()
  }

  const row = (u: User, isAssigned: boolean) => (
    <div
      key={u.id}
      role="button"
      onClick={() => toggle(u.id)}
      className="group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 hover:bg-hover"
    >
      <Avatar initials={u.initials} color={u.color} size={24} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
        {u.id === currentUserId ? 'Me' : u.name}
        {u.deactivated && <span className="text-ink-faint"> (deactivated)</span>}
      </span>
      {isAssigned ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle(u.id)
          }}
          className="hidden h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint group-hover:flex hover:text-ink"
        >
          <X size={14} />
        </button>
      ) : (
        <span className="hidden shrink-0 items-center gap-1 group-hover:flex">
          <button
            onClick={(e) => {
              e.stopPropagation()
              comingSoon(notify, 'Profile')
            }}
            className="h-6 cursor-pointer rounded-md border border-line-strong px-1.5 text-[12px] text-ink-soft hover:bg-white"
          >
            Profile
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              comingSoon(notify, 'Swap assignee')
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-faint hover:bg-white"
          >
            <RefreshCw size={12} />
          </button>
        </span>
      )}
    </div>
  )

  const p = clampPos(pos, 265, 436)
  return (
    <Popover pos={p} width={265} onClose={onClose}>
      <div className="p-0.5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search or enter email..." />
      </div>
      <div className="max-h-[330px] overflow-y-auto">
        {assigned.length > 0 && (
          <>
            <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-ink-faint">Assignees</div>
            {assigned.map((u) => row(u, true))}
          </>
        )}
        <div className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium text-ink-faint">People</div>
        {people.map((u) => row(u, false))}
        <button
          onClick={() => comingSoon(notify, 'Invite people')}
          className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left hover:bg-hover"
        >
          <span className="flex h-6 w-6 items-center justify-center">
            <UserRoundPlus size={16} className="text-ink-faint" />
          </span>
          <span className="text-[13px] text-ink">Invite people via email</span>
        </button>
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
      </div>
      <div className="mt-1 border-t border-line p-1 pt-1.5">
        <button
          onClick={() => comingSoon(notify, 'Assign with AI')}
          className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line-strong text-[13px] font-medium text-ink hover:bg-hover"
        >
          <Sparkles size={13} className="text-brand" />
          Assign with AI
        </button>
      </div>
    </Popover>
  )
}

/* ---------------- TagPicker ---------------- */

export function TagPicker({ task, pos, onClose }: FieldPopoverProps) {
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const setTaskTags = useAppStore((s) => s.setTaskTags)
  const notify = useAppStore((s) => s.notify)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const current = task.tags ?? []
  const list = Object.values(workspaceTags).filter((t) => !q || t.label.toLowerCase().includes(q))

  const toggle = (id: string) => {
    setTaskTags(task.id, current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  const p = clampPos(pos, 240, 300)
  return (
    <Popover pos={p} width={240} onClose={onClose}>
      <div className="p-0.5 pb-1">
        <SearchInput value={query} onChange={setQuery} placeholder="Search or Create New Tag" />
      </div>
      <div className="max-h-[240px] overflow-y-auto pb-0.5">
        {list.map((t) => {
          const on = current.includes(t.id)
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="flex h-8 w-full cursor-pointer items-center justify-between rounded-md px-2 text-left hover:bg-hover"
            >
              <span
                className="flex h-[18px] items-center rounded px-1.5 text-[11px] font-medium"
                style={{ backgroundColor: t.bg, color: t.text }}
              >
                {t.label}
              </span>
              {on && <Check size={14} className="text-ink" />}
            </button>
          )
        })}
        {list.length === 0 && q && (
          <button
            onClick={() => comingSoon(notify, 'Creating tags')}
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
          >
            <Plus size={14} className="text-ink-faint" />
            Create &quot;{query.trim()}&quot;
          </button>
        )}
      </div>
    </Popover>
  )
}
