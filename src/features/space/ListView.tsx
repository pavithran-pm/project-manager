import { useState } from 'react'
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
  Ellipsis,
  Flag,
  Hourglass,
  Network,
  Plus,
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
  tasksForLists,
  useAppStore,
} from '../../lib/store'
import { statusOrder } from '../../lib/seed'
import type { Task, TaskPriority, TaskStatus, User } from '../../lib/types'

export function ListView({ listIds }: { listIds: string[] }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const users = useAppStore((s) => s.users)
  const notify = useAppStore((s) => s.notify)

  const tasks = tasksForLists(allTasks, listIds)
  const groups = groupTasksByStatus(tasks, taskStatuses)
  const stats = listStats(tasks)

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const toggleGroup = (statusId: string) =>
    setCollapsed((c) => ({ ...c, [statusId]: !c[statusId] }))

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {stats.unfinished > 0 && (
        <div className="w-full bg-[#fdeef3] px-4 py-1.5 text-center text-[12.5px] text-ink">
          This sprint has {stats.unfinished}{' '}
          <button
            className="cursor-pointer underline"
            onClick={() => comingSoon(notify, 'The unfinished-tasks filter')}
          >
            unfinished tasks
          </button>
        </div>
      )}

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

      <div className="flex flex-col gap-6 px-6 pt-4 pb-10">
        {groups.map(({ status, items }) => (
          <StatusGroup
            key={status.id}
            status={status}
            items={items}
            users={users}
            targetListId={listIds[0]}
            collapsed={!!collapsed[status.id]}
            onToggle={() => toggleGroup(status.id)}
          />
        ))}
      </div>
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

function StatusGroup({
  status,
  items,
  users,
  targetListId,
  collapsed,
  onToggle,
}: {
  status: TaskStatus
  items: Task[]
  users: Record<string, User>
  targetListId: string
  collapsed: boolean
  onToggle: () => void
}) {
  const notify = useAppStore((s) => s.notify)
  const addTask = useAppStore((s) => s.addTask)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

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
    <section>
      {/* Group header */}
      <div className="group/header mb-1 flex items-center gap-2">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand group' : 'Collapse group'}
          className="flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 text-ink-faint transition-transform ${collapsed ? '-rotate-90' : ''}`}
          />
        </button>
        <span
          className="flex items-center gap-1.5 rounded-[5px] px-2 py-[3px]"
          style={{ backgroundColor: status.color }}
        >
          <Circle className="h-2.5 w-2.5 fill-white/20 text-white" />
          <span className="text-[11px] font-bold tracking-wide whitespace-nowrap text-white">
            {status.label}
          </span>
        </span>
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
          {/* Column headers */}
          <div className="flex h-7 items-center border-b border-line px-2 text-[11.5px] text-ink-faint">
            <div className="flex-1">Name</div>
            <div className="w-24 shrink-0">Assignee</div>
            <div className="w-24 shrink-0">Due date</div>
            <div className="w-24 shrink-0">Priority</div>
            <div className="w-28 shrink-0">Time estimate</div>
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

          {items.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              status={status}
              users={users}
              user={task.assigneeId ? users[task.assigneeId] : undefined}
            />
          ))}

          {adding ? (
            <div className="animate-fade-in flex h-9 items-center gap-2 border-b border-line px-2">
              <span
                className="ml-5 h-[13px] w-[13px] shrink-0 rounded-full border-[2.5px]"
                style={{ borderColor: status.color }}
              />
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

type CellPopover =
  | { kind: 'status'; pos: PopoverPos }
  | { kind: 'assignee'; pos: PopoverPos }
  | { kind: 'due'; pos: PopoverPos }
  | { kind: 'priority'; pos: PopoverPos }
  | { kind: 'estimate'; pos: PopoverPos }

function TaskRow({
  task,
  status,
  users,
  user,
}: {
  task: Task
  status: TaskStatus
  users: Record<string, User>
  user?: User
}) {
  const notify = useAppStore((s) => s.notify)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const setTaskAssignee = useAppStore((s) => s.setTaskAssignee)
  const setTaskDueDate = useAppStore((s) => s.setTaskDueDate)
  const setTaskPriority = useAppStore((s) => s.setTaskPriority)
  const setTaskEstimate = useAppStore((s) => s.setTaskEstimate)

  const [pop, setPop] = useState<CellPopover | null>(null)
  const openPop = (kind: CellPopover['kind'], width = 240) => (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setPop({ kind, pos: popoverPosFor(e.currentTarget as HTMLElement, width) })
  }
  const close = () => setPop(null)

  const priorityMeta = task.priority ? PRIORITY_META[task.priority] : undefined

  return (
    <div className="group/row flex h-9 items-center border-b border-line px-2 text-[13.5px] transition-colors hover:bg-panel">
      {/* Name */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint opacity-0 group-hover/row:opacity-100" />
        <button
          title="Change status"
          onClick={openPop('status')}
          className="flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <span
            className="h-[13px] w-[13px] rounded-full border-[2.5px]"
            style={{ borderColor: status.color }}
          />
        </button>
        <button
          onClick={() => comingSoon(notify, 'The task detail view')}
          className="cursor-pointer truncate text-left text-ink hover:text-brand-deep"
        >
          {task.name}
        </button>
        {task.subtaskCount ? (
          <button
            onClick={() => comingSoon(notify, 'The subtasks panel')}
            className="flex shrink-0 cursor-pointer items-center gap-0.5 rounded border border-line-strong px-1 text-[11px] text-ink-soft tabular-nums hover:bg-hover"
          >
            <Network className="h-2.5 w-2.5" />
            {task.subtaskCount}
          </button>
        ) : null}
        {task.hasDescription && <AlignLeft className="h-3 w-3 shrink-0 text-ink-faint" />}
      </div>

      {/* Assignee */}
      <div className="flex w-24 shrink-0 items-center">
        <button
          title={user ? `Assigned to ${user.name}` : 'Assign'}
          onClick={openPop('assignee')}
          className={`flex cursor-pointer items-center justify-center rounded-full ${
            user
              ? ''
              : 'h-[22px] w-[22px] border border-dashed border-line-strong hover:bg-hover'
          }`}
        >
          {user ? (
            <Avatar initials={user.initials} color={user.color} size={22} title={user.name} />
          ) : (
            <UserRound className="h-3 w-3 text-ink-faint" />
          )}
        </button>
      </div>

      {/* Due date */}
      <div className="flex w-24 shrink-0 items-center">
        {task.dueDate ? (
          <button
            onClick={openPop('due')}
            className={`cursor-pointer rounded px-0.5 text-[12.5px] hover:bg-hover ${
              task.dueOverdue ? 'text-[#d8354f]' : 'text-ink-soft'
            }`}
          >
            {task.dueDate}
          </button>
        ) : (
          <button
            title="Set due date"
            onClick={openPop('due')}
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
          onClick={openPop('priority')}
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

      {/* Time estimate */}
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

      {/* Trailing spacer */}
      <div className="w-8 shrink-0" />

      {/* Cell popovers */}
      {pop?.kind === 'status' && (
        <Popover pos={pop.pos} onClose={close}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">Status</div>
          {statusOrder.map((sid) => {
            const st = taskStatuses[sid]
            return (
              <PopoverItem
                key={sid}
                selected={sid === task.statusId}
                onClick={() => {
                  setTaskStatus(task.id, sid)
                  close()
                }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border-[2.5px]"
                  style={{ borderColor: st.color }}
                />
                <span className="truncate text-[12px] font-semibold tracking-wide">
                  {st.label}
                </span>
                {sid === task.statusId && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
              </PopoverItem>
            )
          })}
        </Popover>
      )}

      {pop?.kind === 'assignee' && (
        <Popover pos={pop.pos} onClose={close}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">
            Assign to
          </div>
          {Object.values(users)
            .filter((u) => u.id !== 'azad')
            .map((u) => (
              <PopoverItem
                key={u.id}
                selected={u.id === task.assigneeId}
                onClick={() => {
                  setTaskAssignee(task.id, u.id === task.assigneeId ? undefined : u.id)
                  close()
                }}
              >
                <Avatar initials={u.initials} color={u.color} size={20} />
                <span className="truncate">{u.name}</span>
                {u.id === task.assigneeId && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
              </PopoverItem>
            ))}
          {task.assigneeId && (
            <PopoverItem
              onClick={() => {
                setTaskAssignee(task.id, undefined)
                close()
              }}
            >
              <X className="h-3.5 w-3.5 text-ink-faint" />
              <span className="text-ink-soft">Remove assignee</span>
            </PopoverItem>
          )}
        </Popover>
      )}

      {pop?.kind === 'due' && (
        <Popover pos={pop.pos} onClose={close}>
          <DueDateEditor
            onSet={(iso) => {
              setTaskDueDate(task.id, iso)
              close()
            }}
            onClear={
              task.dueDate
                ? () => {
                    setTaskDueDate(task.id, undefined)
                    close()
                  }
                : undefined
            }
          />
        </Popover>
      )}

      {pop?.kind === 'priority' && (
        <Popover pos={pop.pos} onClose={close} width={200}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">
            Priority
          </div>
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
              <X className="h-3.5 w-3.5 text-ink-faint" />
              <span className="text-ink-soft">Clear</span>
            </PopoverItem>
          )}
        </Popover>
      )}

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
    </div>
  )
}

function DueDateEditor({
  onSet,
  onClear,
}: {
  onSet: (iso: string) => void
  onClear?: () => void
}) {
  const [value, setValue] = useState('')
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-[11.5px] font-medium text-ink-faint">Due date</div>
      <input
        type="date"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 rounded-md border border-line-strong px-2 text-[13px] text-ink outline-none focus:border-brand"
      />
      <div className="flex items-center gap-2">
        <button
          disabled={!value}
          onClick={() => value && onSet(value)}
          className="flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md bg-[#1f2228] text-[12.5px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
        >
          Set date
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
