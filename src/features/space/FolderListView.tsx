import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  AlignLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Ellipsis,
  Flag,
  Hourglass,
  Network,
  Paperclip,
  Plus,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import {
  comingSoon,
  findFolder,
  groupTasksByStatus,
  PRIORITY_META,
  tasksForLists,
  useAppStore,
} from '../../lib/store'
import {
  beginTaskDrag,
  endTaskDrag,
  getDraggedTaskIds,
  isDraggingTasks,
} from '../../lib/taskDnd'
import type { FolderItem, Task, TaskStatus, User, WorkspaceTag } from '../../lib/types'
import { ListToolbar } from './ListToolbar'

function StatusPill({ status, count }: { status: TaskStatus; count: number }) {
  const outline = status.style === 'outline'
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-[22px] items-center gap-1.5 rounded-[4px] px-2 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ${
          outline ? 'border border-line-strong bg-white text-ink-soft' : 'text-white'
        }`}
        style={outline ? undefined : { backgroundColor: status.color }}
      >
        {status.group === 'done' || status.group === 'closed' ? (
          <Check className="h-3 w-3 text-white" />
        ) : outline ? (
          <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-current" />
        ) : (
          <Clock className="h-3 w-3 text-white" />
        )}
        {status.label}
      </span>
      <span className="text-[12.5px] text-ink-faint tabular-nums">{count}</span>
    </div>
  )
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

function TaskRow({
  task,
  status,
  users,
  orderedIds = [],
  justMoved = false,
  onMoved,
}: {
  task: Task
  status: TaskStatus
  users: Record<string, User>
  orderedIds?: string[]
  justMoved?: boolean
  onMoved?: (ids: string[]) => void
}) {
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const openTask = useAppStore((s) => s.openTask)
  const moveTasks = useAppStore((s) => s.moveTasks)
  const toggleTaskSelected = useAppStore((s) => s.toggleTaskSelected)
  const selectTaskRange = useAppStore((s) => s.selectTaskRange)
  const clearTaskSelection = useAppStore((s) => s.clearTaskSelection)
  const selected = useAppStore((s) => s.selectedTaskIds.includes(task.id))
  const anySelected = useAppStore((s) => s.selectedTaskIds.length > 0)
  const [dragging, setDragging] = useState(false)
  const [over, setOver] = useState(false)
  const assignees = (task.assigneeIds ?? []).map((id) => users[id]).filter(Boolean) as User[]
  const priorityMeta = task.priority ? PRIORITY_META[task.priority] : undefined
  const done = status.group === 'done' || status.group === 'closed'

  return (
    <div
      draggable
      onDragStart={(e) => {
        const sel = useAppStore.getState().selectedTaskIds
        beginTaskDrag(sel.includes(task.id) ? sel : [task.id])
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', task.id)
        setDragging(true)
      }}
      onDragEnd={() => {
        endTaskDrag()
        setDragging(false)
      }}
      onDragOver={(e) => {
        if (isDraggingTasks() && !getDraggedTaskIds().includes(task.id)) {
          e.preventDefault()
          e.stopPropagation()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (isDraggingTasks() && !getDraggedTaskIds().includes(task.id)) {
          e.preventDefault()
          e.stopPropagation()
          const ids = getDraggedTaskIds()
          moveTasks(ids, { listId: task.listId, statusId: task.statusId, beforeTaskId: task.id })
          onMoved?.(ids)
          clearTaskSelection()
        }
        setOver(false)
      }}
      className={`group/row relative flex h-9 items-center border-b border-line px-2 text-[13.5px] transition-colors ${
        selected ? 'bg-[#eef0fb]' : 'hover:bg-panel'
      } ${dragging ? 'opacity-40' : ''} ${justMoved ? 'animate-pop-in' : ''}`}
    >
      {over && (
        <div className="pointer-events-none absolute inset-x-1 -top-px z-10 h-0.5 rounded-full bg-brand" />
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
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
        {done ? (
          <BadgeCheck className="h-4 w-4 shrink-0 text-white" fill={status.color} />
        ) : status.style === 'outline' ? (
          <span
            className="h-[15px] w-[15px] shrink-0 rounded-full border-[1.5px] border-dashed"
            style={{ borderColor: status.color }}
          />
        ) : (
          <Clock className="h-[15px] w-[15px] shrink-0" style={{ color: status.color }} />
        )}
        <button
          onClick={() => openTask(task.id)}
          className="cursor-pointer truncate text-left text-ink hover:text-brand-deep"
        >
          {task.name}
        </button>
        {task.subtaskCount ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded border border-line-strong px-1 text-[11px] text-ink-soft tabular-nums">
            <Network className="h-2.5 w-2.5" />
            {task.subtaskCount}
          </span>
        ) : null}
        {task.hasDescription && <AlignLeft className="h-3 w-3 shrink-0 text-ink-faint" />}
        {task.attachmentCount ? <Paperclip className="h-3 w-3 shrink-0 text-ink-faint" /> : null}
        {(task.tags ?? []).map((tid) =>
          workspaceTags[tid] ? <TagChip key={tid} tag={workspaceTags[tid]} /> : null,
        )}
      </div>

      <div className="flex w-24 shrink-0 items-center">
        {assignees.length ? (
          <span className="flex -space-x-1.5">
            {assignees.slice(0, 3).map((a) => (
              <span key={a.id} className="rounded-full ring-2 ring-white">
                <Avatar initials={a.initials} color={a.color} size={22} title={a.name} />
              </span>
            ))}
          </span>
        ) : (
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-dashed border-line-strong">
            <UserRound className="h-3 w-3 text-ink-faint" />
          </span>
        )}
      </div>

      <div className="flex w-28 shrink-0 items-center">
        {task.dueDate ? (
          <span
            className={`text-[12.5px] ${
              task.dueDone ? 'text-[#27ae60]' : task.dueOverdue ? 'text-[#d8354f]' : 'text-ink-soft'
            }`}
          >
            {task.dueDate}
          </span>
        ) : (
          <CalendarDays className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover/row:opacity-100" />
        )}
      </div>

      <div className="flex w-24 shrink-0 items-center">
        {priorityMeta ? (
          <span className="flex items-center gap-1">
            <Flag className="h-3.5 w-3.5" style={{ color: priorityMeta.color }} fill={priorityMeta.color} />
            <span className="text-[12.5px] text-ink-soft">{priorityMeta.label}</span>
          </span>
        ) : (
          <Flag className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover/row:opacity-100" />
        )}
      </div>
      <div className="w-6 shrink-0" />
    </div>
  )
}

function SprintCard({ sprint, users }: { sprint: FolderItem; users: Record<string, User> }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const addTask = useAppStore((s) => s.addTask)
  const moveTasks = useAppStore((s) => s.moveTasks)
  const clearTaskSelection = useAppStore((s) => s.clearTaskSelection)
  const notify = useAppStore((s) => s.notify)
  const [open, setOpen] = useState(true)
  const [addingIn, setAddingIn] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [dropStatusId, setDropStatusId] = useState<string | null>(null)
  const [justMovedIds, setJustMovedIds] = useState<string[]>([])
  const markMoved = (ids: string[]) => {
    setJustMovedIds(ids)
    setTimeout(() => setJustMovedIds([]), 600)
  }

  const tasks = tasksForLists(allTasks, [sprint.id])
  const groups = groupTasksByStatus(tasks, taskStatuses)
  const meta = sprint.sprintMeta

  const commit = (statusId: string) => {
    if (draft.trim()) addTask(sprint.id, statusId, draft)
    setDraft('')
    setAddingIn(null)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>, statusId: string) => {
    if (e.key === 'Enter') commit(statusId)
    if (e.key === 'Escape') {
      setDraft('')
      setAddingIn(null)
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-1 text-[11px] text-ink-faint">MSM / MVP - MSM</div>
      <div className="group/header mb-3 flex items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <ChevronDown className={`h-4 w-4 text-ink-faint transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
        <span className="text-[15px] font-semibold text-ink">{sprint.name}</span>
        <button
          onClick={() => comingSoon(notify, 'The sprint menu')}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md opacity-0 hover:bg-hover group-hover/header:opacity-100"
        >
          <Ellipsis className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        {meta && (
          <div className="ml-1 flex items-center gap-2.5 text-[12.5px] text-ink-soft">
            {meta.done && (
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-white" fill="#27ae60" />
                Done
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-ink-faint" />
              {meta.range}
            </span>
            <span className="flex items-center gap-1">
              <Hourglass className="h-3 w-3 text-ink-faint" />-
            </span>
            {meta.notEst > 0 && (
              <span className="flex items-center gap-1 text-[#c98a06]">
                <TriangleAlert className="h-3.5 w-3.5" />
                {meta.notEst} not est
              </span>
            )}
          </div>
        )}
      </div>

      {meta?.descriptionTitle && (
        <div className="mb-4 pl-8">
          <button
            onClick={() => comingSoon(notify, 'The Figma link')}
            className="cursor-pointer text-[17px] font-semibold text-[#4a80f5] underline"
          >
            {meta.descriptionTitle}
          </button>
          {meta.descriptionText && (
            <div className="text-[14px] text-ink-soft">{meta.descriptionText}</div>
          )}
        </div>
      )}

      {open && (
        <div className="flex flex-col gap-5">
          {groups.map(({ status, items }) => (
            <div
              key={status.id}
              onDragOver={(e) => {
                if (isDraggingTasks()) {
                  e.preventDefault()
                  setDropStatusId(status.id)
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setDropStatusId((c) => (c === status.id ? null : c))
              }}
              onDrop={(e) => {
                if (isDraggingTasks()) {
                  e.preventDefault()
                  const ids = getDraggedTaskIds()
                  moveTasks(ids, { listId: sprint.id, statusId: status.id })
                  markMoved(ids)
                  clearTaskSelection()
                }
                setDropStatusId(null)
              }}
              className={
                dropStatusId === status.id ? 'rounded-lg bg-[#f5f3ff] ring-1 ring-brand/50 ring-inset' : ''
              }
            >
              <div className="mb-1 flex items-center gap-2">
                <StatusPill status={status} count={items.length} />
              </div>
              <div className="flex h-7 items-center border-b border-line px-2 text-[11.5px] text-ink-faint">
                <div className="flex-1 pl-5">Name</div>
                <div className="w-24 shrink-0">Assignee</div>
                <div className="w-28 shrink-0">Due date</div>
                <div className="w-24 shrink-0">Priority</div>
                <div className="w-6 shrink-0" />
              </div>
              {items.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  status={status}
                  users={users}
                  orderedIds={items.map((t) => t.id)}
                  justMoved={justMovedIds.includes(task.id)}
                  onMoved={markMoved}
                />
              ))}
              {addingIn === status.id ? (
                <div className="animate-fade-in flex h-9 items-center gap-2 border-b border-line px-2 pl-7">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => onKey(e, status.id)}
                    placeholder="Task name..."
                    className="h-7 flex-1 rounded-md border border-line-strong px-2 text-[13.5px] text-ink outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => commit(status.id)}
                    className="flex h-7 cursor-pointer items-center gap-1 rounded-md bg-[#1f2228] px-2.5 text-[12.5px] font-medium text-white hover:bg-black"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDraft('')
                      setAddingIn(null)
                    }}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
                  >
                    <X className="h-3.5 w-3.5 text-ink-faint" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingIn(status.id)}
                  className="flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[13px] text-ink-faint hover:text-ink"
                >
                  <Plus className="h-[13px] w-[13px]" />
                  Add Task
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Folder List tab — one white card per sprint, grouped by status (video secs 22-31). */
export function FolderListView({ folderId }: { folderId: string }) {
  const spaces = useAppStore((s) => s.spaces)
  const users = useAppStore((s) => s.users)
  const found = findFolder(spaces, folderId)
  const sprints = (found?.folder.items ?? []).filter((i) => i.icon === 'sprint')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListToolbar saveViewVisible={false} />
      <div className="flex-1 overflow-y-auto bg-panel/40 p-6">
        <div className="flex flex-col gap-6">
          {sprints.map((sprint) => (
            <SprintCard key={sprint.id} sprint={sprint} users={users} />
          ))}
        </div>
      </div>
    </div>
  )
}
