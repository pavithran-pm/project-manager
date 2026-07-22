import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import {
  AlignLeft,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Flag,
  GripVertical,
  Maximize2,
  Paperclip,
  Plus,
  UserRound,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Popover, PopoverItem, popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import { comingSoon, PRIORITY_META, useAppStore } from '../../lib/store'
import type { Task, TaskPriority, TaskStatus, User } from '../../lib/types'
import { AssigneePicker, DatePickerPopover, StatusDropdown } from '../task/TaskFieldPopovers'
import { ListToolbar } from './ListToolbar'

/* ---------------- Column geometry ---------------- */

const GUTTER_W = 36
const ASSIGNEE_W = 200
const STATUS_W = 195
const DUE_W = 160
const PRIORITY_W = 150
const NAME_MIN = 240
const NAME_MAX = 640
const NAME_DEFAULT = 280

const ONBOARD_KEY = 'pm-table-onboarding-seen'

/* ---------------- Status visuals ---------------- */

/** Leading icon in the Name cell: check-circle (done), dark dot (hold), clock (active). */
function NameStatusIcon({ status }: { status: TaskStatus }) {
  if (status.id === 'holdForInfo') {
    return (
      <span
        className="h-[13px] w-[13px] shrink-0 rounded-full"
        style={{ backgroundColor: status.color }}
      />
    )
  }
  if (status.group === 'done' || status.group === 'closed') {
    return (
      <span
        className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: status.color }}
      >
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
      </span>
    )
  }
  if (status.style === 'outline') {
    return (
      <span
        className="block h-[15px] w-[15px] shrink-0 rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: status.color }}
      />
    )
  }
  return <Clock className="h-[15px] w-[15px] shrink-0" style={{ color: status.color }} />
}

/** Grid status pill: filled (white text) vs outline (white bg, colored icon + text). */
function TablePill({ status }: { status: TaskStatus }) {
  const outline = status.tableStyle === 'outline' || status.style === 'outline'
  const glyph =
    status.group === 'done' || status.group === 'closed' ? (
      <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
    ) : status.style === 'outline' ? (
      <span className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-dashed border-current" />
    ) : (
      <Clock className="h-3 w-3 shrink-0" />
    )
  return (
    <span
      className={`flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ${
        outline ? 'border border-line-strong bg-white' : 'text-white'
      }`}
      style={outline ? { color: status.color } : { backgroundColor: status.color }}
    >
      {glyph}
      {status.label}
    </span>
  )
}

/* ---------------- Onboarding popover (video sec 59-61) ---------------- */

function OnboardingPopover({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="animate-pop-in absolute top-14 z-30 w-[310px] rounded-[10px] border border-line bg-white p-4 shadow-xl"
      style={{ left: 'calc(50% - 155px)' }}
    >
      <button
        title="Dismiss"
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="pr-6 text-[13.5px] font-bold text-ink">
        Explore what&apos;s new in Table view!
      </div>
      <div className="mt-1 text-[12.5px] text-ink-soft">Let us show you around.</div>
      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-[12px] text-ink-faint">1 of 3</span>
        <button
          onClick={onDismiss}
          className="h-7 cursor-pointer rounded-md bg-panel px-3 text-[12.5px] font-medium text-ink hover:bg-hover"
        >
          Get started
        </button>
      </div>
    </div>
  )
}

/* ---------------- Task row ---------------- */

type RowPopover = { kind: 'status' | 'assignee' | 'due' | 'priority'; pos: PopoverPos }

function TableRow({
  task,
  index,
  status,
  nameWidth,
}: {
  task: Task
  index: number
  status: TaskStatus
  nameWidth: number
}) {
  const users = useAppStore((s) => s.users)
  const notify = useAppStore((s) => s.notify)
  const openTask = useAppStore((s) => s.openTask)
  const setTaskPriority = useAppStore((s) => s.setTaskPriority)

  const [pop, setPop] = useState<RowPopover | null>(null)

  const assignees = (task.assigneeIds ?? []).map((id) => users[id]).filter(Boolean) as User[]
  const priorityMeta = task.priority ? PRIORITY_META[task.priority] : undefined

  const openPop =
    (kind: RowPopover['kind'], width = 240) =>
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setPop({ kind, pos: popoverPosFor(e.currentTarget as HTMLElement, width) })
    }
  const close = () => setPop(null)

  return (
    <>
      <div className="group/row flex h-8 items-center border-b border-line text-[13px] hover:bg-[#fafafc]">
        {/* Row number → checkbox + grip on hover */}
        <div className="flex h-full shrink-0 items-center justify-center" style={{ width: GUTTER_W }}>
          <span className="text-[11.5px] text-ink-faint tabular-nums group-hover/row:hidden">
            {index}
          </span>
          <span className="hidden items-center group-hover/row:flex">
            <button
              title="Drag to move"
              onClick={() => comingSoon(notify, 'Row reordering')}
              className="flex h-5 w-3.5 cursor-grab items-center justify-center text-ink-faint"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <button
              title="Select task"
              onClick={() => comingSoon(notify, 'Bulk task selection')}
              className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded-[3px] border border-line-strong hover:border-ink-faint"
            />
          </span>
        </div>

        {/* Name */}
        <div
          className="relative flex h-full min-w-0 shrink-0 items-center gap-2 border-r border-line px-2 group-hover/row:pr-9"
          style={{ width: nameWidth }}
        >
          <button title="Change status" onClick={openPop('status')} className="shrink-0 cursor-pointer">
            <NameStatusIcon status={status} />
          </button>
          <button
            onClick={() => openTask(task.id)}
            className="min-w-0 cursor-pointer truncate text-left text-ink hover:text-brand-deep"
          >
            {task.name}
          </button>
          {task.hasDescription && (
            <button
              title="This task has a description"
              onClick={() => openTask(task.id)}
              className="shrink-0 cursor-pointer"
            >
              <AlignLeft className="h-3 w-3 text-ink-faint" />
            </button>
          )}
          {task.attachmentCount ? (
            <button
              title={`${task.attachmentCount} attachment${task.attachmentCount > 1 ? 's' : ''}`}
              onClick={() => openTask(task.id)}
              className="shrink-0 cursor-pointer"
            >
              <Paperclip className="h-3 w-3 text-ink-faint" />
            </button>
          ) : null}
          <button
            title="Open task"
            onClick={() => openTask(task.id)}
            className="absolute right-1.5 hidden h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md border border-line-strong bg-white text-ink-soft shadow-sm group-hover/row:flex hover:bg-hover"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>

        {/* Assignee: stack + comma-joined names (3+ = avatars only) */}
        <div
          className="flex h-full min-w-0 shrink-0 items-center border-r border-line px-2"
          style={{ width: ASSIGNEE_W }}
        >
          {assignees.length ? (
            <button
              onClick={openPop('assignee', 268)}
              title={assignees.map((a) => a.name).join(', ')}
              className="flex min-w-0 cursor-pointer items-center gap-1.5"
            >
              <span className="flex shrink-0 -space-x-1.5">
                {assignees.slice(0, 4).map((a) => (
                  <span key={a.id} className="rounded-full ring-2 ring-white">
                    <Avatar initials={a.initials} color={a.color} size={22} title={a.name} />
                  </span>
                ))}
              </span>
              {assignees.length <= 2 && (
                <span className="truncate text-[12.5px] text-ink-soft">
                  {assignees.length === 1
                    ? assignees[0].name
                    : assignees.map((a) => a.name.split(' ')[0]).join(', ')}
                </span>
              )}
            </button>
          ) : (
            <button
              title="Assign"
              onClick={openPop('assignee', 268)}
              className="hidden h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong group-hover/row:flex hover:bg-hover"
            >
              <UserRound className="h-3 w-3 text-ink-faint" />
            </button>
          )}
        </div>

        {/* Status pill */}
        <div
          className="flex h-full shrink-0 items-center border-r border-line px-2"
          style={{ width: STATUS_W }}
        >
          <button title="Change status" onClick={openPop('status')} className="cursor-pointer">
            <TablePill status={status} />
          </button>
        </div>

        {/* Due date */}
        <div
          className="flex h-full shrink-0 items-center border-r border-line px-2"
          style={{ width: DUE_W }}
        >
          {task.dueDate ? (
            <button
              onClick={openPop('due', 560)}
              className="cursor-pointer truncate rounded px-0.5 text-[12.5px] text-ink-soft hover:bg-hover"
            >
              {task.dueDate}
            </button>
          ) : (
            <button
              title="Set due date"
              onClick={openPop('due', 560)}
              className="hidden h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md group-hover/row:flex hover:bg-hover"
            >
              <CalendarPlus className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          )}
        </div>

        {/* Priority */}
        <div
          className="flex h-full shrink-0 items-center border-r border-line px-2"
          style={{ width: PRIORITY_W }}
        >
          {priorityMeta ? (
            <button
              title={`Priority: ${priorityMeta.label}`}
              onClick={openPop('priority', 200)}
              className="flex h-[22px] cursor-pointer items-center gap-1 rounded-md px-1 hover:bg-hover"
            >
              <Flag
                className="h-3.5 w-3.5"
                style={{ color: priorityMeta.color }}
                fill={priorityMeta.color}
              />
              <span className="text-[12.5px] text-ink-soft">{priorityMeta.label}</span>
            </button>
          ) : (
            <button
              title="Set priority"
              onClick={openPop('priority', 200)}
              className="hidden h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md group-hover/row:flex hover:bg-hover"
            >
              <Flag className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          )}
        </div>

        <div className="w-10 shrink-0" />
      </div>

      {/* Cell popovers */}
      {pop?.kind === 'status' && <StatusDropdown task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'assignee' && <AssigneePicker task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'due' && <DatePickerPopover task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'priority' && (
        <Popover pos={pop.pos} onClose={close} width={200}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">Priority</div>
          {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
            <PopoverItem
              key={p}
              selected={p === task.priority}
              onClick={() => {
                setTaskPriority(task.id, p)
                close()
              }}
            >
              <Flag
                className="h-3.5 w-3.5"
                style={{ color: PRIORITY_META[p].color }}
                fill={PRIORITY_META[p].color}
              />
              <span>{PRIORITY_META[p].label}</span>
              {p === task.priority && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
            </PopoverItem>
          ))}
          {task.priority && (
            <PopoverItem
              onClick={() => {
                setTaskPriority(task.id, undefined)
                close()
              }}
            >
              <Circle className="h-3.5 w-3.5 text-ink-faint" />
              <span className="text-ink-soft">Clear</span>
            </PopoverItem>
          )}
        </Popover>
      )}
    </>
  )
}

/* ---------------- TableView ---------------- */

export function TableView({ listIds }: { listIds: string[] }) {
  const allTasks = useAppStore((s) => s.tasks)
  const users = useAppStore((s) => s.users)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const notify = useAppStore((s) => s.notify)
  const addTask = useAppStore((s) => s.addTask)

  const [loaded, setLoaded] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [viewDirty, setViewDirty] = useState(false)
  const [nameWidth, setNameWidth] = useState(NAME_DEFAULT)
  const [resizing, setResizing] = useState(false)
  const [sort, setSort] = useState<'asc' | 'desc' | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const drag = useRef<{ startX: number; startWidth: number } | null>(null)

  // Header renders immediately; rows pop in ~500ms, onboarding shortly after.
  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 500)
    const t2 = setTimeout(() => {
      if (!sessionStorage.getItem(ONBOARD_KEY)) {
        sessionStorage.setItem(ONBOARD_KEY, '1')
        setOnboarding(true)
      }
    }, 1150)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // All top-level tasks in listId-then-seed order, optionally sorted by assignee.
  const rows = useMemo(() => {
    const base: Task[] = []
    for (const id of listIds) {
      for (const t of allTasks) if (t.listId === id && !t.parentId) base.push(t)
    }
    if (!sort) return base
    const dir = sort === 'asc' ? 1 : -1
    const key = (t: Task) => {
      const first = t.assigneeIds?.[0]
      return first ? (users[first]?.name.toLowerCase() ?? '') : ''
    }
    return [...base].sort((a, b) => {
      const ka = key(a)
      const kb = key(b)
      if (!ka && !kb) return 0
      if (!ka) return 1
      if (!kb) return -1
      return ka.localeCompare(kb) * dir
    })
  }, [allTasks, listIds, sort, users])

  /* Name/Assignee divider — real column resize via pointer capture */
  const onDividerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    drag.current = { startX: e.clientX, startWidth: nameWidth }
    setResizing(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDividerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 2) setViewDirty(true)
    setNameWidth(Math.max(NAME_MIN, Math.min(NAME_MAX, d.startWidth + dx)))
  }
  const onDividerUp = () => {
    drag.current = null
    setResizing(false)
  }

  const cycleSort = () => setSort((s) => (s === null ? 'asc' : s === 'asc' ? 'desc' : null))

  const dismissOnboarding = () => {
    sessionStorage.setItem(ONBOARD_KEY, '1')
    setOnboarding(false)
  }

  const commitDraft = () => {
    if (draft.trim() && listIds.length) addTask(listIds[0], 'toDo', draft)
    setDraft('')
    setAdding(false)
  }
  const onDraftKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitDraft()
    if (e.key === 'Escape') {
      setDraft('')
      setAdding(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListToolbar saveViewVisible={viewDirty} listId={listIds[0]} />
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-auto bg-white">
          <div className="min-w-max pb-16">
            {/* Sticky column headers */}
            <div className="sticky top-0 z-20 flex h-[34px] items-center border-b border-line bg-white text-[12px] font-medium text-ink-soft select-none">
              <div className="h-full shrink-0" style={{ width: GUTTER_W }} />
              <div
                className="relative flex h-full shrink-0 items-center border-r border-line px-2"
                style={{ width: nameWidth }}
              >
                Name
                <div
                  onPointerDown={onDividerDown}
                  onPointerMove={onDividerMove}
                  onPointerUp={onDividerUp}
                  className="group/divider absolute inset-y-0 -right-[4px] z-10 w-[8px] cursor-col-resize touch-none"
                  title="Drag to resize the Name column"
                >
                  <span
                    className={`absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 ${
                      resizing ? 'bg-brand' : 'bg-transparent group-hover/divider:bg-brand'
                    }`}
                  />
                </div>
              </div>
              <button
                onClick={cycleSort}
                title="Sort by assignee"
                className="group/sort flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-line px-2 text-left font-medium hover:bg-panel"
                style={{ width: ASSIGNEE_W }}
              >
                Assignee
                <span
                  className={`flex flex-col items-center ${
                    sort ? '' : 'opacity-0 group-hover/sort:opacity-100'
                  }`}
                >
                  <ChevronUp
                    className={`h-3 w-3 ${sort === 'asc' ? 'text-brand' : 'text-ink-faint'}`}
                  />
                  <ChevronDown
                    className={`-mt-1.5 h-3 w-3 ${sort === 'desc' ? 'text-brand' : 'text-ink-faint'}`}
                  />
                </span>
              </button>
              <div
                className="flex h-full shrink-0 items-center border-r border-line px-2"
                style={{ width: STATUS_W }}
              >
                Status
              </div>
              <div
                className="flex h-full shrink-0 items-center border-r border-line px-2"
                style={{ width: DUE_W }}
              >
                Due date
              </div>
              <div
                className="flex h-full shrink-0 items-center border-r border-line px-2"
                style={{ width: PRIORITY_W }}
              >
                Priority
              </div>
              <div className="flex h-full w-10 shrink-0 items-center justify-center">
                <button
                  title="Add column"
                  onClick={() => comingSoon(notify, 'Custom columns')}
                  className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md hover:bg-hover"
                >
                  <Plus className="h-3.5 w-3.5 text-ink-faint" />
                </button>
              </div>
            </div>

            {/* Body loads after the header (video sec 56 → 57) */}
            {loaded && (
              <div className="animate-fade-in">
                {rows.map((t, i) => (
                  <TableRow
                    key={t.id}
                    task={t}
                    index={i + 1}
                    status={taskStatuses[t.statusId] ?? taskStatuses.toDo}
                    nameWidth={nameWidth}
                  />
                ))}

                {/* Bottom "+" add row → inline addTask into TO DO */}
                {adding ? (
                  <div className="animate-fade-in flex h-9 items-center gap-2 border-b border-line pr-3">
                    <span className="shrink-0" style={{ width: GUTTER_W }} />
                    <span className="h-[13px] w-[13px] shrink-0 rounded-full border-[1.5px] border-dashed border-line-strong" />
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={onDraftKey}
                      placeholder="Task name..."
                      className="h-7 w-[300px] rounded-md border border-line-strong px-2 text-[13px] text-ink outline-none focus:border-brand"
                    />
                    <button
                      onClick={commitDraft}
                      className="flex h-7 cursor-pointer items-center gap-1 rounded-md bg-[#1f2228] px-2.5 text-[12.5px] font-medium text-white hover:bg-black"
                    >
                      <Check className="h-3 w-3" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDraft('')
                        setAdding(false)
                      }}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
                    >
                      <X className="h-3.5 w-3.5 text-ink-faint" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-9 items-center">
                    <span className="shrink-0" style={{ width: GUTTER_W }} />
                    <button
                      title="Add Task"
                      onClick={() => setAdding(true)}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {onboarding && loaded && <OnboardingPopover onDismiss={dismissOnboarding} />}
      </div>
    </div>
  )
}
