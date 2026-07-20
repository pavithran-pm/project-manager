import { useEffect, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import {
  AlignLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  CirclePlus,
  Clock,
  Ellipsis,
  Flag,
  Network,
  Paperclip,
  Pencil,
  Plus,
  Tag,
  UserRound,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import { boardOrder } from '../../lib/seed'
import { comingSoon, PRIORITY_META, subtasksOf, tasksForLists, useAppStore } from '../../lib/store'
import type { Task, TaskStatus, User, WorkspaceTag } from '../../lib/types'
import { ListToolbar } from './ListToolbar'
import { TaskRowMenu } from './TaskRowMenu'

/* ---------------- Board pill styles (per the video's column headers) ---------------- */

/** Statuses whose board pill renders as a solid filled chip. */
const SOLID_PILLS: Record<string, { bg: string; text: string; icon: 'check' | 'clock' }> = {
  devInProgress: { bg: '#f2d600', text: '#4d4400', icon: 'clock' },
  holdForInfo: { bg: '#b01830', text: '#ffffff', icon: 'clock' },
  readyForBaReviewInQa: { bg: '#b01830', text: '#ffffff', icon: 'check' },
  readyForProduction: { bg: '#b01830', text: '#ffffff', icon: 'check' },
  baReviewComplete: { bg: '#27ae60', text: '#ffffff', icon: 'check' },
  movedToProduction: { bg: '#15803d', text: '#ffffff', icon: 'check' },
}

/** Light-pink pill + pale-pink column wash (REOPEN / NOT A BUG). */
const PINK_PILLS = new Set(['reopen', 'notABug'])

/** Column background tints behind the cards. */
const COLUMN_TINTS: Record<string, string> = {
  devInProgress: 'bg-[#fbf6dd]',
  reopen: 'bg-[#fdeef1]',
  notABug: 'bg-[#fdeef1]',
}

function DashedRing() {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-dashed border-current" />
}

function BoardPill({ status }: { status: TaskStatus }) {
  const base =
    'flex h-[22px] items-center gap-1.5 rounded-[4px] px-2 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase'
  const solid = SOLID_PILLS[status.id]
  if (solid) {
    return (
      <span className={base} style={{ backgroundColor: solid.bg, color: solid.text }}>
        {solid.icon === 'check' ? <Check className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
        {status.label}
      </span>
    )
  }
  if (PINK_PILLS.has(status.id)) {
    return (
      <span className={`${base} bg-[#fbdfe4] text-[#d8354f]`}>
        <DashedRing />
        {status.label}
      </span>
    )
  }
  if (status.style === 'outline') {
    return (
      <span className={`${base} bg-[#e8eaee] text-ink-soft`}>
        <DashedRing />
        {status.label}
      </span>
    )
  }
  if (status.group === 'done' || status.group === 'closed') {
    return (
      <span className={`${base} border border-line bg-white`} style={{ color: status.color }}>
        <CircleCheck className="h-3 w-3 shrink-0" />
        {status.label}
      </span>
    )
  }
  return (
    <span className={`${base} border border-line bg-white`} style={{ color: status.color }}>
      <DashedRing />
      {status.label}
    </span>
  )
}

/* ---------------- Small shared bits ---------------- */

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

/** Dark ClickUp-style tooltip, anchored below-right of the wrapped control. */
function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative flex">
      {children}
      <span className="animate-fade-in pointer-events-none absolute top-7 right-0 z-[70] hidden rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white group-hover/tip:block">
        {label}
      </span>
    </span>
  )
}

/* ---------------- Skeleton (board loads ~600ms like the video) ---------------- */

const SKELETON_COLUMNS: number[][] = [
  [64],
  [],
  [72, 96, 88, 64, 72, 80],
  [88, 72, 64],
  [72, 80, 72, 88, 72],
  [96, 72, 80, 72, 64],
]

function BoardSkeleton() {
  return (
    <div className="flex h-full items-start gap-3 px-4 py-3">
      {SKELETON_COLUMNS.map((heights, i) => (
        <div key={i} className="flex w-[280px] shrink-0 flex-col gap-2 p-1.5">
          <div className="flex items-center gap-2">
            <span className="pm-shimmer h-[22px] w-28" />
            <span className="pm-shimmer h-3 w-4" />
          </div>
          {heights.map((h, j) => (
            <span key={j} className="pm-shimmer w-full rounded-lg" style={{ height: h }} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ---------------- Card ---------------- */

function BoardCard({ task, allTasks }: { task: Task; allTasks: Task[] }) {
  const users = useAppStore((s) => s.users)
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const notify = useAppStore((s) => s.notify)
  const openTask = useAppStore((s) => s.openTask)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const [menuPos, setMenuPos] = useState<PopoverPos | null>(null)

  const assignees = (task.assigneeIds ?? []).map((id) => users[id]).filter(Boolean) as User[]
  const tags = (task.tags ?? [])
    .map((id) => workspaceTags[id])
    .filter(Boolean) as WorkspaceTag[]
  const subCount = task.subtaskCount ?? subtasksOf(allTasks, task.id).length
  const priority = task.priority ? PRIORITY_META[task.priority] : undefined
  const dueClass = task.dueOverdue
    ? 'text-[#d8354f]'
    : task.dueDone
      ? 'text-[#27ae60]'
      : 'text-ink-soft'

  const quick = (e: MouseEvent<HTMLElement>, fn: () => void) => {
    e.stopPropagation()
    fn()
  }

  return (
    <>
      <div
        onClick={() => openTask(task.id)}
        className="group/card relative shrink-0 cursor-pointer rounded-lg border border-line bg-white p-2.5 shadow-[0_1px_2px_rgba(42,46,52,0.05)] transition-shadow hover:border-line-strong hover:shadow-md"
      >
        {/* Hover quick actions: ✓ ⊕ ✎ ⋯ */}
        <div className="absolute top-1 right-1 z-10 hidden items-center rounded-md border border-line bg-white p-0.5 shadow-sm group-hover/card:flex">
          <Tip label="Mark complete">
            <button
              onClick={(e) => quick(e, () => setTaskStatus(task.id, 'qaComplete'))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover hover:text-[#27ae60]"
              aria-label="Mark complete"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </Tip>
          <Tip label="Quick add">
            <button
              onClick={(e) => quick(e, () => comingSoon(notify, 'Quick add'))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover hover:text-ink"
              aria-label="Quick add"
            >
              <CirclePlus className="h-3.5 w-3.5" />
            </button>
          </Tip>
          <Tip label="Rename">
            <button
              onClick={(e) => quick(e, () => comingSoon(notify, 'Renaming tasks'))}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover hover:text-ink"
              aria-label="Rename"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </Tip>
          <Tip label="Task menu">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuPos(popoverPosFor(e.currentTarget as HTMLElement))
              }}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover hover:text-ink"
              aria-label="Task menu"
            >
              <Ellipsis className="h-3.5 w-3.5" />
            </button>
          </Tip>
        </div>

        <div className="line-clamp-2 pr-2 text-[13px] leading-snug font-medium text-ink">
          {task.name}
        </div>

        {(task.hasDescription || task.attachmentCount) && (
          <div className="mt-1.5 flex items-center gap-2 text-ink-faint">
            {task.hasDescription && <AlignLeft className="h-3 w-3 shrink-0" />}
            {task.attachmentCount ? (
              <span className="flex items-center gap-0.5 text-[11.5px] tabular-nums">
                <Paperclip className="h-3 w-3 shrink-0" />
                {task.attachmentCount}
              </span>
            ) : null}
          </div>
        )}

        {/* Meta slots: assignees / due / priority / tags (ghost icons when empty) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {assignees.length ? (
            <span className="flex shrink-0 -space-x-1.5" title={assignees.map((a) => a.name).join(', ')}>
              {assignees.slice(0, 5).map((u) => (
                <span key={u.id} className="rounded-full ring-2 ring-white">
                  <Avatar initials={u.initials} color={u.color} size={22} title={u.name} />
                </span>
              ))}
            </span>
          ) : (
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong">
              <UserRound className="h-3 w-3 text-ink-faint/70" />
            </span>
          )}
          {task.dueDate ? (
            <span className={`flex items-center gap-1 text-[11.5px] font-semibold whitespace-nowrap ${dueClass}`}>
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {task.dueDate}
            </span>
          ) : (
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-ink-faint/50" />
          )}
          {priority ? (
            <span className="flex items-center gap-1 text-[11.5px] text-ink-soft">
              <Flag
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: priority.color }}
                fill={priority.color}
              />
              {priority.label}
            </span>
          ) : (
            <Flag className="h-3.5 w-3.5 shrink-0 text-ink-faint/50" />
          )}
          {tags.length ? (
            tags.map((tag) => <TagChip key={tag.id} tag={tag} />)
          ) : (
            <Tag className="h-3.5 w-3.5 shrink-0 text-ink-faint/50" />
          )}
        </div>

        {/* Subtasks row — ▸ expander appears on card hover */}
        {subCount > 0 && (
          <button
            onClick={(e) => quick(e, () => comingSoon(notify, 'Expanding subtasks on the Board'))}
            className="mt-2 flex cursor-pointer items-center gap-1 text-[12px] text-ink-soft hover:text-ink"
          >
            <ChevronRight className="hidden h-3 w-3 shrink-0 text-ink-faint group-hover/card:block" />
            <Network className="h-3 w-3 shrink-0 text-ink-faint group-hover/card:hidden" />
            {subCount === 1 ? '1 subtask' : `${subCount} subtasks`}
          </button>
        )}

        {/* Embedded attachment preview (gray screenshot block) */}
        {task.imagePreview && (
          <div className="mt-2 overflow-hidden rounded-md border border-line">
            <div className="h-4 border-b border-line bg-[#e6e8ec]" />
            <div className="flex flex-col gap-1.5 bg-[#f3f4f6] p-2">
              <span className="h-1.5 w-4/5 rounded-sm bg-[#dcdfe4]" />
              <span className="h-1.5 w-full rounded-sm bg-[#dcdfe4]" />
              <span className="h-1.5 w-2/3 rounded-sm bg-[#dcdfe4]" />
            </div>
          </div>
        )}
      </div>

      {menuPos && <TaskRowMenu task={task} pos={menuPos} onClose={() => setMenuPos(null)} />}
    </>
  )
}

/* ---------------- Column ---------------- */

function BoardColumn({
  status,
  items,
  allTasks,
  targetListId,
}: {
  status: TaskStatus
  items: Task[]
  allTasks: Task[]
  targetListId: string
}) {
  const notify = useAppStore((s) => s.notify)
  const addTask = useAppStore((s) => s.addTask)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = () => {
    if (draft.trim()) addTask(targetListId, status.id, draft)
    setDraft('')
    setAdding(false)
  }
  const cancel = () => {
    setDraft('')
    setAdding(false)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') cancel()
  }

  const tint = COLUMN_TINTS[status.id] ?? ''

  return (
    <section className={`flex max-h-full w-[280px] shrink-0 flex-col rounded-xl p-1.5 ${tint}`}>
      {/* Column header: pill + count, hover ⋯ / + */}
      <div className="group/colhead flex h-8 shrink-0 items-center gap-2 px-1 pb-1">
        <BoardPill status={status} />
        <span className="text-[12.5px] text-ink-faint tabular-nums">{items.length}</span>
        <span className="ml-auto hidden items-center gap-0.5 group-hover/colhead:flex">
          <button
            title="Group settings"
            onClick={() => comingSoon(notify, 'The column menu')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
          >
            <Ellipsis className="h-3.5 w-3.5" />
          </button>
          <button
            title="Add task"
            onClick={() => setAdding(true)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto p-0.5">
        {items.map((task) => (
          <BoardCard key={task.id} task={task} allTasks={allTasks} />
        ))}

        {adding ? (
          <div className="animate-pop-in shrink-0 rounded-lg border border-brand bg-white p-2 shadow-sm">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Task name..."
              className="w-full text-[13px] text-ink outline-none placeholder:text-ink-faint"
            />
            <div className="mt-2 flex items-center justify-end gap-1">
              <button
                title="Cancel"
                onClick={cancel}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={commit}
                className="flex h-6 cursor-pointer items-center gap-1 rounded-md bg-[#1f2228] px-2 text-[12px] font-medium text-white hover:bg-black"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-left text-[13px] text-ink-faint hover:bg-hover hover:text-ink"
          >
            <Plus className="h-[13px] w-[13px]" />
            Add Task
          </button>
        )}
      </div>
    </section>
  )
}

/* ---------------- BoardView ---------------- */

export function BoardView({ listIds }: { listIds: string[] }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const notify = useAppStore((s) => s.notify)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const tasks = tasksForLists(allTasks, listIds)
  const targetListId = listIds[0] ?? 'backlog'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ListToolbar saveViewVisible={false} listId={listIds[0]} />
      <div className="min-h-0 flex-1 overflow-x-auto bg-[#fafafa]">
        {loading ? (
          <BoardSkeleton />
        ) : (
          <div className="animate-fade-in flex h-full items-start gap-3 px-4 py-3">
            {boardOrder.map((statusId) => {
              const status = taskStatuses[statusId]
              if (!status) return null
              return (
                <BoardColumn
                  key={statusId}
                  status={status}
                  items={tasks.filter((t) => t.statusId === statusId)}
                  allTasks={allTasks}
                  targetListId={targetListId}
                />
              )
            })}
            <button
              onClick={() => comingSoon(notify, 'Adding board groups')}
              className="flex h-9 w-[200px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#eef0f3] px-3 text-[13px] font-medium text-ink-soft hover:bg-[#e4e7eb] hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
              Add group
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
