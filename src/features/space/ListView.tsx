import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlignLeft,
  CalendarPlus,
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
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { groupTasksByStatus, listStats, tasksForLists, useAppStore } from '../../lib/store'
import type { Task, TaskStatus, User } from '../../lib/types'

export function ListView({ listIds }: { listIds: string[] }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const users = useAppStore((s) => s.users)

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
          <button className="cursor-pointer underline">unfinished tasks</button>
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
  collapsed,
  onToggle,
}: {
  status: TaskStatus
  items: Task[]
  users: Record<string, User>
  collapsed: boolean
  onToggle: () => void
}) {
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
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md opacity-0 hover:bg-hover group-hover/header:opacity-100"
        >
          <Ellipsis className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        <button
          title="Add task"
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
              user={task.assigneeId ? users[task.assigneeId] : undefined}
            />
          ))}

          <button className="flex h-8 cursor-pointer items-center gap-1.5 px-2 text-[13px] text-ink-faint hover:text-ink">
            <Plus className="h-[13px] w-[13px]" />
            Add Task
          </button>
        </>
      )}
    </section>
  )
}

function TaskRow({ task, status, user }: { task: Task; status: TaskStatus; user?: User }) {
  return (
    <div className="group/row flex h-9 cursor-pointer items-center border-b border-line px-2 text-[13.5px] hover:bg-panel">
      {/* Name */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint opacity-0 group-hover/row:opacity-100" />
        <span
          className="h-[13px] w-[13px] shrink-0 rounded-full border-[2.5px]"
          style={{ borderColor: status.color }}
        />
        <span className="truncate text-ink">{task.name}</span>
        {task.subtaskCount ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded border border-line-strong px-1 text-[11px] text-ink-soft tabular-nums">
            <Network className="h-2.5 w-2.5" />
            {task.subtaskCount}
          </span>
        ) : null}
        {task.hasDescription && <AlignLeft className="h-3 w-3 shrink-0 text-ink-faint" />}
      </div>

      {/* Assignee */}
      <div className="flex w-24 shrink-0 items-center">
        {user ? (
          <Avatar initials={user.initials} color={user.color} size={22} title={user.name} />
        ) : (
          <button
            title="Assign"
            className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong hover:bg-hover"
          >
            <UserRound className="h-3 w-3 text-ink-faint" />
          </button>
        )}
      </div>

      {/* Due date */}
      <div className="flex w-24 shrink-0 items-center">
        {task.dueDate ? (
          <span
            className={`text-[12.5px] ${task.dueOverdue ? 'text-[#d8354f]' : 'text-ink-soft'}`}
          >
            {task.dueDate}
          </span>
        ) : (
          <button
            title="Set due date"
            className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-ink-faint" />
          </button>
        )}
      </div>

      {/* Priority */}
      <div className="flex w-24 shrink-0 items-center">
        <button
          title="Set priority"
          className="flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Flag className="h-3.5 w-3.5 text-ink-faint" />
        </button>
      </div>

      {/* Time estimate */}
      <div className="flex w-28 shrink-0 items-center">
        {task.estimateHours !== undefined && (
          <span className="flex items-center gap-1">
            <Hourglass className="h-3 w-3 text-ink-faint" />
            <span className="text-[12.5px] text-ink-soft tabular-nums">
              {task.estimateHours}h
            </span>
          </span>
        )}
      </div>

      {/* Trailing spacer */}
      <div className="w-8 shrink-0" />
    </div>
  )
}
