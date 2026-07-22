import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import {
  AlignLeft,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleUserRound,
  Clock,
  Ellipsis,
  Flag,
  Hourglass,
  Network,
  Pencil,
  Plus,
  Tag,
  UserRound,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { Popover, PopoverItem, popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import {
  comingSoon,
  groupTasksByStatus,
  listStats,
  PRIORITY_META,
  subtasksOf,
  tasksForLists,
  useAppStore,
} from '../../lib/store'
import {
  beginTaskDrag,
  endTaskDrag,
  getDraggedTaskIds,
  isDraggingTasks,
} from '../../lib/taskDnd'
import type { Task, TaskPriority, TaskStatus, User, WorkspaceTag } from '../../lib/types'
import { AssigneePicker, DatePickerPopover, StatusDropdown } from '../task/TaskFieldPopovers'
import { ListToolbar } from './ListToolbar'
import { TaskRowMenu } from './TaskRowMenu'

/* ---------------- Group status pill ---------------- */

function statusGlyph(status: TaskStatus) {
  if (status.group === 'done' || status.group === 'closed')
    return <Check className="h-3 w-3 text-white" />
  if (status.style === 'outline')
    return <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-current" />
  return <Clock className="h-3 w-3 text-white" />
}

function StatusPill({ status }: { status: TaskStatus }) {
  const outline = status.style === 'outline'
  return (
    <span
      className={`flex h-[22px] items-center gap-1.5 rounded-[4px] px-2 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ${
        outline ? 'border border-line-strong bg-white text-ink-soft' : 'text-white'
      }`}
      style={outline ? undefined : { backgroundColor: status.color }}
    >
      {statusGlyph(status)}
      {status.label}
    </span>
  )
}

/** Row status icon: clock in the status color (dashed ring for TO DO-style). */
function RowStatusIcon({ status }: { status: TaskStatus }) {
  if (status.style === 'outline') {
    return (
      <span
        className="h-[15px] w-[15px] shrink-0 rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: status.color }}
      />
    )
  }
  return <Clock className="h-[15px] w-[15px] shrink-0" style={{ color: status.color }} />
}

function TagChip({ tag }: { tag: WorkspaceTag }) {
  return (
    <span
      className="flex h-[18px] shrink-0 items-center rounded-full px-1.5 text-[11px] font-medium"
      style={{ backgroundColor: tag.bg, color: tag.text }}
    >
      {tag.label}
    </span>
  )
}

/* ---------------- Description hover preview (video sec 182) ---------------- */

function DescriptionPreview({ task, pos }: { task: Task; pos: PopoverPos }) {
  const blocks = (task.description ?? []).slice(0, 2)
  return (
    <div
      className="animate-pop-in pointer-events-none fixed z-[60] w-[420px] rounded-lg border border-line bg-white p-4 shadow-xl"
      style={{
        top: Math.max(8, Math.min(pos.top, window.innerHeight - 220)),
        left: Math.max(8, Math.min(pos.left, window.innerWidth - 436)),
      }}
    >
      {blocks.map((b, i) =>
        b.kind === 'h2' || b.kind === 'sub' ? (
          <div key={i} className="mb-1.5 text-[17px] font-bold text-ink">
            {b.text}
          </div>
        ) : b.kind === 'p' ? (
          <p key={i} className="text-[13px] leading-relaxed text-ink-soft">
            {b.text}
          </p>
        ) : (
          <ul key={i} className="flex list-disc flex-col gap-0.5 pl-5">
            {b.items.slice(0, 5).map((item, j) => (
              <li key={j} className="text-[13px] leading-relaxed text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        ),
      )}
      <ChevronDown className="absolute right-2 bottom-1.5 h-3.5 w-3.5 text-ink-faint" />
    </div>
  )
}

/* ---------------- Priorities toast (video sec 84) ---------------- */

function PrioritiesToast({ name, onClose }: { name: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="animate-rise-in fixed bottom-4 left-4 z-[70] w-[330px] rounded-xl border border-line bg-white p-3.5 shadow-xl">
      <div className="text-[13.5px] text-ink">Add this task to {name}&apos;s priorities?</div>
      <div className="mt-2.5 flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="h-7 cursor-pointer rounded-md bg-panel px-2.5 text-[12.5px] text-ink-soft hover:bg-hover"
        >
          Don&apos;t ask again
        </button>
        <button
          onClick={onClose}
          className="h-7 cursor-pointer rounded-md bg-[#2b2f3a] px-2.5 text-[12.5px] font-medium text-white hover:bg-[#1f232c]"
        >
          Add to priorities
        </button>
      </div>
    </div>
  )
}

/* ---------------- ListView ---------------- */

export function ListView({ listIds }: { listIds: string[] }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const groupCollapse = useAppStore((s) => s.groupCollapse)
  const toggleGroup = useAppStore((s) => s.toggleGroup)

  const listKey = listIds[0]
  const collapsed = groupCollapse[listKey] ?? []
  const tasks = tasksForLists(allTasks, listIds)
  const groups = groupTasksByStatus(tasks, taskStatuses)
  const stats = listStats(tasks, taskStatuses)
  const showCards = !['backlog', 'list1'].includes(listKey)

  const [viewDirty, setViewDirty] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState<Record<string, boolean>>({})
  const [priorityToastFor, setPriorityToastFor] = useState<string | null>(null)
  // Tasks most recently dropped into a new spot — briefly get a pop-in.
  const [justMovedIds, setJustMovedIds] = useState<string[]>([])
  const markMoved = (ids: string[]) => {
    setJustMovedIds(ids)
    setTimeout(() => setJustMovedIds([]), 600)
  }

  const onToggleGroup = (statusId: string) => {
    const expanding = collapsed.includes(statusId)
    toggleGroup(listKey, statusId)
    setViewDirty(true)
    if (expanding) {
      setLoadingGroups((l) => ({ ...l, [statusId]: true }))
      setTimeout(() => setLoadingGroups((l) => ({ ...l, [statusId]: false })), 700)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListToolbar saveViewVisible={viewDirty} listId={listKey} />
      <div className="relative flex-1 overflow-y-auto bg-white">
        {showCards && stats.unfinished > 0 && (
          <div className="w-full bg-[#fdeef3] px-4 py-1.5 text-center text-[12.5px] text-ink">
            This sprint has {stats.unfinished} <span className="underline">unfinished tasks</span>
          </div>
        )}
        {showCards && (
          <div className="flex gap-4 px-6 pt-4 pb-2">
            <SummaryCard
              tileClass="bg-[#e7f6ec]"
              icon={<CircleCheck className="h-[18px] w-[18px] text-[#27ae60]" />}
              title="Backlog"
              sub={`${stats.total} tasks added`}
            />
            <SummaryCard
              tileClass="bg-[#fdf3e7]"
              icon={<CircleUserRound className="h-[18px] w-[18px] text-[#e8871e]" />}
              title="Assigned"
              sub={`${stats.missingAssignee} tasks missing assignee`}
            />
            <SummaryCard
              tileClass="bg-[#fdf3e7]"
              icon={<Hourglass className="h-[18px] w-[18px] text-[#e8871e]" />}
              title="Effort"
              sub={`${stats.missingEffort} tasks missing effort`}
            />
          </div>
        )}

        <div className="flex flex-col gap-5 px-6 pt-3 pb-12">
          {groups.map(({ status, items }) => (
            <StatusGroup
              key={status.id}
              status={status}
              items={items}
              allTasks={allTasks}
              targetListId={listKey}
              collapsed={collapsed.includes(status.id)}
              loading={!!loadingGroups[status.id]}
              showEstimate={showCards}
              justMovedIds={justMovedIds}
              onMoved={markMoved}
              onToggle={() => onToggleGroup(status.id)}
              onAssigned={(name) => setPriorityToastFor(name)}
            />
          ))}
        </div>
      </div>
      {priorityToastFor && (
        <PrioritiesToast name={priorityToastFor} onClose={() => setPriorityToastFor(null)} />
      )}
    </div>
  )
}

function SummaryCard({
  tileClass,
  icon,
  title,
  sub,
}: {
  tileClass: string
  icon: ReactNode
  title: string
  sub: string
}) {
  return (
    <div className="flex w-[300px] items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
      <span
        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg ${tileClass}`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13.5px] font-semibold text-ink">{title}</span>
        <span className="truncate text-[12.5px] text-ink-soft">{sub}</span>
      </span>
    </div>
  )
}

/* ---------------- Status group ---------------- */

function SkeletonRow() {
  const widths = ['62%', '38%', '48%', '55%']
  const w = widths[Math.floor(Math.random() * widths.length)]
  return (
    <div className="flex h-9 items-center gap-3 border-b border-line px-2">
      <span className="pm-shimmer h-4 w-4 shrink-0 rounded-full" />
      <span className="pm-shimmer h-3" style={{ width: w }} />
    </div>
  )
}

function StatusGroup({
  status,
  items,
  allTasks,
  targetListId,
  collapsed,
  loading,
  showEstimate,
  justMovedIds,
  onMoved,
  onToggle,
  onAssigned,
}: {
  status: TaskStatus
  items: Task[]
  allTasks: Task[]
  targetListId: string
  collapsed: boolean
  loading: boolean
  showEstimate: boolean
  justMovedIds: string[]
  onMoved: (taskIds: string[]) => void
  onToggle: () => void
  onAssigned: (name: string) => void
}) {
  const notify = useAppStore((s) => s.notify)
  const addTask = useAppStore((s) => s.addTask)
  const moveTasks = useAppStore((s) => s.moveTasks)
  const clearTaskSelection = useAppStore((s) => s.clearTaskSelection)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [dropActive, setDropActive] = useState(false)

  const orderedIds = items.map((t) => t.id)

  // Dropping on the group body appends the dragged task(s) to the end of this group.
  const dropToEnd = () => {
    const ids = getDraggedTaskIds()
    if (!ids.length) return
    moveTasks(ids, { listId: targetListId, statusId: status.id })
    onMoved(ids)
    clearTaskSelection()
  }

  const commitDraft = () => {
    if (draft.trim()) addTask(targetListId, status.id, draft)
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
    <section
      onDragOver={(e) => {
        if (isDraggingTasks()) {
          e.preventDefault()
          setDropActive(true)
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropActive(false)
      }}
      onDrop={(e) => {
        if (isDraggingTasks()) {
          e.preventDefault()
          dropToEnd()
        }
        setDropActive(false)
      }}
      className={
        dropActive ? 'rounded-lg bg-[#f5f3ff] ring-1 ring-brand/50 ring-inset' : ''
      }
    >
      {/* Sticky group header */}
      <div className="group/header sticky top-0 z-20 flex items-center gap-2 bg-white py-1">
        <span className="group/chev relative flex">
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand group' : 'Collapse group'}
            className="flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 text-ink-faint transition-transform ${collapsed ? '-rotate-90' : ''}`}
            />
          </button>
          <span className="animate-fade-in pointer-events-none absolute -top-8 left-1/2 z-[70] hidden -translate-x-1/2 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white group-hover/chev:block">
            {collapsed ? 'Expand group' : 'Collapse group'}
          </span>
        </span>
        <StatusPill status={status} />
        <span className="text-[12.5px] text-ink-faint tabular-nums">{items.length}</span>
        <button
          title="Group settings"
          onClick={() => comingSoon(notify, 'The status-group menu')}
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md opacity-0 hover:bg-hover group-hover/header:opacity-100"
        >
          <Ellipsis className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        <button
          title="Add task"
          onClick={() => setAdding(true)}
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md opacity-0 hover:bg-hover group-hover/header:opacity-100"
        >
          <Plus className="h-3.5 w-3.5 text-ink-faint" />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Sticky column headers */}
          <div className="sticky top-[34px] z-10 flex h-7 items-center border-b border-line bg-white px-2 text-[11.5px] text-ink-faint">
            <div className="flex-1">Name</div>
            <div className="w-28 shrink-0">Assignee</div>
            <div className="w-28 shrink-0">Due date</div>
            <div className="w-24 shrink-0">Priority</div>
            {showEstimate && <div className="w-28 shrink-0">Time estimate</div>}
            <div className="flex w-8 shrink-0 items-center justify-center">
              <button
                title="Add column"
                onClick={() => comingSoon(notify, 'Custom columns')}
                className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md hover:bg-hover"
              >
                <Plus className="h-3.5 w-3.5 text-ink-faint" />
              </button>
            </div>
          </div>

          {loading ? (
            <>
              {items.slice(0, Math.max(1, Math.min(items.length, 4))).map((t) => (
                <SkeletonRow key={t.id} />
              ))}
            </>
          ) : (
            items.map((task) => (
              <TaskRowV2
                key={task.id}
                task={task}
                status={status}
                allTasks={allTasks}
                showEstimate={showEstimate}
                justMoved={justMovedIds.includes(task.id)}
                orderedIds={orderedIds}
                onMoved={onMoved}
                onAssigned={onAssigned}
              />
            ))
          )}

          {adding ? (
            <div className="animate-fade-in flex h-9 items-center gap-2 border-b border-line px-2">
              <span className="ml-6">
                <RowStatusIcon status={status} />
              </span>
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onDraftKey}
                placeholder="Task name..."
                className="h-7 flex-1 rounded-md border border-line-strong px-2 text-[13.5px] text-ink outline-none focus:border-brand"
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
            <button
              onClick={() => setAdding(true)}
              className="flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[13px] text-ink-faint hover:text-ink"
            >
              <Plus className="h-[13px] w-[13px]" />
              Add Task
            </button>
          )}
        </>
      )}
    </section>
  )
}

/* ---------------- Task row ---------------- */

type RowPopover =
  | { kind: 'status'; pos: PopoverPos }
  | { kind: 'assignee'; pos: PopoverPos }
  | { kind: 'due'; pos: PopoverPos }
  | { kind: 'priority'; pos: PopoverPos }
  | { kind: 'estimate'; pos: PopoverPos }
  | { kind: 'menu'; pos: PopoverPos }

function TaskRowV2({
  task,
  status,
  allTasks,
  showEstimate = false,
  justMoved = false,
  orderedIds = [],
  onMoved,
  onAssigned,
  isSubtask = false,
}: {
  task: Task
  status: TaskStatus
  allTasks: Task[]
  showEstimate?: boolean
  justMoved?: boolean
  orderedIds?: string[]
  onMoved?: (ids: string[]) => void
  onAssigned: (name: string) => void
  isSubtask?: boolean
}) {
  const users = useAppStore((s) => s.users)
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const notify = useAppStore((s) => s.notify)
  const openTask = useAppStore((s) => s.openTask)
  const setTaskPriority = useAppStore((s) => s.setTaskPriority)
  const setTaskEstimate = useAppStore((s) => s.setTaskEstimate)
  const moveTasks = useAppStore((s) => s.moveTasks)
  const toggleTaskSelected = useAppStore((s) => s.toggleTaskSelected)
  const selectTaskRange = useAppStore((s) => s.selectTaskRange)
  const clearTaskSelection = useAppStore((s) => s.clearTaskSelection)
  const selected = useAppStore((s) => s.selectedTaskIds.includes(task.id))
  const anySelected = useAppStore((s) => s.selectedTaskIds.length > 0)

  const [pop, setPop] = useState<RowPopover | null>(null)
  const [expandedSubs, setExpandedSubs] = useState(false)
  const [preview, setPreview] = useState<PopoverPos | null>(null)
  const [dragging, setDragging] = useState(false)
  const [over, setOver] = useState(false)
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subtasks = task.parentId ? [] : subtasksOf(allTasks, task.id)
  const hasSubs = subtasks.length > 0
  const assignees = (task.assigneeIds ?? []).map((id) => users[id]).filter(Boolean) as User[]
  const priorityMeta = task.priority ? PRIORITY_META[task.priority] : undefined
  const prevAssigneeIds = useRef(task.assigneeIds ?? [])
  // Tracks "the row's assignee picker was just used" across the same-render
  // close, so the priorities toast fires even though `pop` is already null.
  const assignPickerActive = useRef(false)

  // Fire the "Add to priorities?" toast when a NEW assignee is added from this row.
  useEffect(() => {
    const prev = prevAssigneeIds.current
    const cur = task.assigneeIds ?? []
    const added = cur.find((id) => !prev.includes(id))
    if (added && assignPickerActive.current) {
      const u = users[added]
      if (u) onAssigned(u.name)
      assignPickerActive.current = false
      setPop(null)
    }
    prevAssigneeIds.current = cur
  }, [task.assigneeIds, users, onAssigned])

  const openPop =
    (kind: RowPopover['kind'], width = 240) =>
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      if (kind === 'assignee') assignPickerActive.current = true
      setPop({ kind, pos: popoverPosFor(e.currentTarget as HTMLElement, width) } as RowPopover)
    }
  const close = () => {
    setPop(null)
    // Give the store-change effect one tick to consume the flag, then drop it.
    setTimeout(() => {
      assignPickerActive.current = false
    }, 150)
  }

  const startPreview = (e: MouseEvent<HTMLElement>) => {
    if (!task.description?.length) return
    const el = e.currentTarget as HTMLElement
    previewTimer.current = setTimeout(() => {
      const r = el.getBoundingClientRect()
      setPreview({ top: r.bottom + 6, left: r.left - 40 })
    }, 350)
  }
  const stopPreview = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    setPreview(null)
  }

  return (
    <>
      <div
        draggable={!isSubtask}
        onDragStart={
          isSubtask
            ? undefined
            : (e) => {
                const sel = useAppStore.getState().selectedTaskIds
                beginTaskDrag(sel.includes(task.id) ? sel : [task.id])
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', task.id)
                setDragging(true)
              }
        }
        onDragEnd={
          isSubtask
            ? undefined
            : () => {
                endTaskDrag()
                setDragging(false)
              }
        }
        onDragOver={
          isSubtask
            ? undefined
            : (e) => {
                if (isDraggingTasks() && !getDraggedTaskIds().includes(task.id)) {
                  e.preventDefault()
                  e.stopPropagation()
                  setOver(true)
                }
              }
        }
        onDragLeave={isSubtask ? undefined : () => setOver(false)}
        onDrop={
          isSubtask
            ? undefined
            : (e) => {
                if (isDraggingTasks() && !getDraggedTaskIds().includes(task.id)) {
                  e.preventDefault()
                  e.stopPropagation()
                  const ids = getDraggedTaskIds()
                  moveTasks(ids, {
                    listId: task.listId,
                    statusId: task.statusId,
                    beforeTaskId: task.id,
                  })
                  onMoved?.(ids)
                  clearTaskSelection()
                }
                setOver(false)
              }
        }
        className={`group/row relative flex h-9 items-center border-b border-line px-2 text-[13.5px] transition-colors ${
          selected ? 'bg-[#eef0fb]' : 'hover:bg-panel'
        } ${isSubtask ? 'pl-9' : ''} ${dragging ? 'opacity-40' : ''} ${
          justMoved ? 'animate-pop-in' : ''
        }`}
      >
        {over && (
          <div className="pointer-events-none absolute inset-x-1 -top-px z-10 h-0.5 rounded-full bg-brand" />
        )}
        {/* Hover gutter: grip + checkbox + expand chevron */}
        <div className="flex w-6 shrink-0 items-center justify-end gap-0.5 opacity-0 group-hover/row:opacity-100">
          <span className="cursor-grab text-ink-faint">⠿</span>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-1.5">
          {isSubtask ? (
            <span className="hidden h-3.5 w-3.5 shrink-0 rounded-[3px] border border-line-strong group-hover/row:block" />
          ) : (
            <button
              aria-label={selected ? 'Deselect task' : 'Select task'}
              onClick={(e) => {
                e.stopPropagation()
                if (e.shiftKey) selectTaskRange(task.id, orderedIds)
                else toggleTaskSelected(task.id)
              }}
              className={`h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-[3px] border ${
                selected
                  ? 'flex border-brand bg-brand'
                  : `border-line-strong ${anySelected ? 'flex' : 'hidden group-hover/row:flex'}`
              }`}
            >
              {selected && <Check className="h-2.5 w-2.5 text-white" />}
            </button>
          )}
          {hasSubs ? (
            <button
              title={expandedSubs ? 'Collapse subtasks' : 'Expand subtasks'}
              onClick={() => setExpandedSubs((x) => !x)}
              className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover"
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${expandedSubs ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <span className="hidden h-4 w-4 shrink-0 items-center justify-center text-ink-faint group-hover/row:flex">
              <ChevronRight className="h-3 w-3 opacity-40" />
            </span>
          )}
          <button title="Change status" onClick={openPop('status')} className="cursor-pointer">
            {isSubtask ? (
              <span className="h-[13px] w-[13px] shrink-0 rounded-full border-[1.5px] border-dashed border-line-strong" />
            ) : (
              <RowStatusIcon status={status} />
            )}
          </button>
          <button
            onClick={() => openTask(task.id)}
            className="cursor-pointer truncate text-left text-ink hover:text-brand-deep"
          >
            {task.name}
          </button>
          {hasSubs && (
            <button
              onClick={() => setExpandedSubs((x) => !x)}
              className="flex shrink-0 cursor-pointer items-center gap-0.5 rounded border border-line-strong px-1 text-[11px] text-ink-soft tabular-nums hover:bg-hover"
            >
              <Network className="h-2.5 w-2.5" />
              {subtasks.length}
            </button>
          )}
          {task.hasDescription && (
            <button
              onMouseEnter={startPreview}
              onMouseLeave={stopPreview}
              onClick={() => openTask(task.id)}
              className="cursor-pointer"
              aria-label="Description"
            >
              <AlignLeft className="h-3 w-3 shrink-0 text-ink-faint" />
            </button>
          )}
          {(task.tags ?? []).map((tid) =>
            workspaceTags[tid] ? <TagChip key={tid} tag={workspaceTags[tid]} /> : null,
          )}
          {/* Hover actions after chips */}
          <span className="hidden items-center gap-0.5 group-hover/row:flex">
            {task.tags?.length ? (
              <button
                title="Edit tags"
                onClick={() => comingSoon(notify, 'Tag editing from the row')}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover"
              >
                <Tag className="h-3 w-3" />
              </button>
            ) : null}
            <button
              title="Add"
              onClick={() => comingSoon(notify, 'Quick add')}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-line-strong text-ink-faint hover:bg-hover"
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              title="Rename"
              onClick={() => comingSoon(notify, 'Renaming tasks')}
              className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-line-strong text-ink-faint hover:bg-hover"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </span>
        </div>

        {/* Assignee */}
        <div className="flex w-28 shrink-0 items-center">
          {assignees.length ? (
            <button
              onClick={openPop('assignee', 268)}
              className="flex cursor-pointer -space-x-1.5"
              title={assignees.map((a) => a.name).join(', ')}
            >
              {assignees.slice(0, 3).map((a) => (
                <span key={a.id} className="rounded-full ring-2 ring-white">
                  <Avatar initials={a.initials} color={a.color} size={24} title={a.name} />
                </span>
              ))}
            </button>
          ) : (
            <button
              title="Assign"
              onClick={openPop('assignee', 268)}
              className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong hover:bg-hover"
            >
              <UserRound className="h-3 w-3 text-ink-faint" />
            </button>
          )}
        </div>

        {/* Due date */}
        <div className="flex w-28 shrink-0 items-center">
          {task.dueDate ? (
            <button
              onClick={openPop('due', 560)}
              className={`cursor-pointer rounded px-0.5 text-[12.5px] hover:bg-hover ${
                task.dueOverdue ? 'text-[#d8354f]' : 'text-ink-soft'
              }`}
            >
              {task.dueDate}
            </button>
          ) : (
            <button
              title="Set due date"
              onClick={openPop('due', 560)}
              className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md hover:bg-hover"
            >
              <CalendarPlus className="h-3.5 w-3.5 text-ink-faint" />
            </button>
          )}
        </div>

        {/* Priority */}
        <div className="flex w-24 shrink-0 items-center">
          <button
            title={priorityMeta ? `Priority: ${priorityMeta.label}` : 'Set priority'}
            onClick={openPop('priority', 200)}
            className="flex h-[22px] cursor-pointer items-center gap-1 rounded-md px-1 hover:bg-hover"
          >
            {priorityMeta ? (
              <>
                <Flag
                  className="h-3.5 w-3.5"
                  style={{ color: priorityMeta.color }}
                  fill={priorityMeta.color}
                />
                <span className="text-[12.5px] text-ink-soft">{priorityMeta.label}</span>
              </>
            ) : (
              <Flag className="h-3.5 w-3.5 text-ink-faint" />
            )}
          </button>
        </div>

        {/* Time estimate (sprint lists only) */}
        {showEstimate && (
          <div className="flex w-28 shrink-0 items-center">
            <button
              title="Set time estimate"
              onClick={openPop('estimate')}
              className={`flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 hover:bg-hover ${
                task.estimateHours === undefined ? 'opacity-0 group-hover/row:opacity-100' : ''
              }`}
            >
              <Hourglass className="h-3 w-3 text-ink-faint" />
              {task.estimateHours !== undefined && (
                <span className="text-[12.5px] text-ink-soft tabular-nums">
                  {task.estimateHours}h
                </span>
              )}
            </button>
          </div>
        )}

        {/* Row menu */}
        <div className="flex w-8 shrink-0 items-center justify-center">
          <button
            title="Task menu"
            onClick={openPop('menu')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint opacity-0 group-hover/row:opacity-100 hover:bg-hover"
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subtask rows */}
      {expandedSubs &&
        subtasks.map((sub) => (
          <TaskRowV2
            key={sub.id}
            task={sub}
            status={taskStatuses[sub.statusId] ?? status}
            allTasks={allTasks}
            showEstimate={showEstimate}
            onAssigned={onAssigned}
            isSubtask
          />
        ))}

      {/* Popovers */}
      {pop?.kind === 'status' && <StatusDropdown task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'assignee' && <AssigneePicker task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'due' && <DatePickerPopover task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'menu' && <TaskRowMenu task={task} pos={pop.pos} onClose={close} />}
      {pop?.kind === 'estimate' && (
        <Popover pos={pop.pos} onClose={close}>
          <EstimateEditor
            initial={task.estimateHours}
            onSet={(h) => {
              setTaskEstimate(task.id, h)
              close()
            }}
            onClear={
              task.estimateHours !== undefined
                ? () => {
                    setTaskEstimate(task.id, undefined)
                    close()
                  }
                : undefined
            }
          />
        </Popover>
      )}
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

      {preview && <DescriptionPreview task={task} pos={preview} />}
    </>
  )
}

function EstimateEditor({
  initial,
  onSet,
  onClear,
}: {
  initial?: number
  onSet: (hours: number) => void
  onClear?: () => void
}) {
  const [value, setValue] = useState(initial !== undefined ? String(initial) : '')
  const hours = Number(value)
  const valid = value.trim() !== '' && Number.isFinite(hours) && hours > 0
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-[11.5px] font-medium text-ink-faint">Time estimate (hours)</div>
      <input
        type="number"
        min={0}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && valid) onSet(hours)
        }}
        placeholder="e.g. 8"
        className="h-8 rounded-md border border-line-strong px-2 text-[13px] text-ink outline-none focus:border-brand"
      />
      <div className="flex items-center gap-2">
        <button
          disabled={!valid}
          onClick={() => onSet(hours)}
          className="flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md bg-[#1f2228] text-[12.5px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
        >
          Set estimate
        </button>
        {onClear && (
          <button
            onClick={onClear}
            className="h-7 cursor-pointer rounded-md border border-line-strong px-2.5 text-[12.5px] text-ink-soft hover:bg-hover"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
