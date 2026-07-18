import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Bug,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsDownUp,
  ChevronsLeft,
  ChevronsRight,
  CircleCheck,
  CircleDot,
  CircleUserRound,
  ClipboardList,
  Crown,
  Diamond,
  Ellipsis,
  Flag,
  Hourglass,
  Info,
  LayoutGrid,
  Link2,
  List,
  Lock,
  MessageCircle,
  MessageSquareText,
  NotebookPen,
  PanelRight,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Scan,
  Sparkles,
  SquareArrowOutUpRight,
  Star,
  Tag,
  Target,
  Timer,
  UserRoundPlus,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { Popover, PopoverItem, popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import {
  comingSoon,
  findListItem,
  groupTasksByStatus,
  PRIORITY_META,
  subtasksOf,
  tasksForLists,
  useAppStore,
} from '../../lib/store'
import { statusOrder } from '../../lib/seed'
import type { Task, TaskPriority, TaskStatus, User } from '../../lib/types'
import { ActivityPanel } from './ActivityPanel'
import { TaskActionRows } from './TaskActionRows'
import { TaskDescription, TaskDocFullPage, useDocView } from './TaskDescription'
import {
  AssigneePicker,
  DatePickerPopover,
  StatusDropdown,
  TagPicker,
  TimeTrackPopover,
} from './TaskFieldPopovers'

const TASK_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: 'Task', icon: CircleCheck },
  { label: 'Milestone', icon: Diamond },
  { label: 'Bug', icon: Bug },
  { label: 'Epic', icon: Crown },
  { label: 'Feedback', icon: MessageSquareText },
  { label: 'Form Response', icon: ClipboardList },
  { label: 'Initiative', icon: Rocket },
  { label: 'Meeting Note', icon: NotebookPen },
  { label: 'User Story', icon: BookOpen },
]

const SKELETON_WIDTHS = ['38%', '100%', '92%', '61%', '78%']

/** Small colored status ring (dashed for outline-style statuses like TO DO). */
function StatusRing({ status, size = 13 }: { status?: TaskStatus; size?: number }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full border-2 ${
        status?.style === 'outline' ? 'border-dashed' : ''
      }`}
      style={{ width: size, height: size, borderColor: status?.color ?? '#87909e' }}
    />
  )
}

/** Dark hover tooltip rendered below its child (ClickUp style), optional Esc key badge. */
function Tip({ label, esc, children }: { label: string; esc?: boolean; children: ReactNode }) {
  return (
    <span className="group/tip relative flex">
      {children}
      <span className="animate-fade-in pointer-events-none absolute top-full left-1/2 z-[70] mt-1.5 hidden -translate-x-1/2 items-center gap-1.5 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-lg group-hover/tip:flex">
        {label}
        {esc && (
          <span className="rounded border border-white/30 px-1 text-[10.5px] leading-4">Esc</span>
        )}
      </span>
    </span>
  )
}

/** Header layout switcher: hover popover with Modal / Full screen / Sidebar thumbnails. */
function LayoutSwitch() {
  const notify = useAppStore((s) => s.notify)
  const [open, setOpen] = useState(false)
  const pick = (label: string) => () => {
    if (label !== 'Modal') comingSoon(notify, `The ${label} layout`)
    setOpen(false)
  }
  return (
    <span
      className="relative flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Change layout"
        onClick={() => setOpen(true)}
        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover ${
          open ? 'bg-hover' : ''
        }`}
      >
        <PanelRight className="h-4 w-4 text-ink-soft" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-[70] pt-1">
          <div className="animate-pop-in flex gap-1.5 rounded-xl border border-line bg-white p-2 shadow-xl">
            {(['Modal', 'Full screen', 'Sidebar'] as const).map((label) => {
              const selected = label === 'Modal'
              return (
                <button
                  key={label}
                  type="button"
                  onClick={pick(label)}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-hover"
                >
                  <span
                    className={`flex h-10 w-16 items-center justify-center rounded-md border ${
                      selected ? 'border-brand bg-[#ece8fd]' : 'border-line-strong bg-panel'
                    }`}
                  >
                    {label === 'Modal' && (
                      <span
                        className={`h-5 w-9 rounded-[3px] border bg-white ${
                          selected ? 'border-brand/40' : 'border-line-strong'
                        }`}
                      />
                    )}
                    {label === 'Full screen' && (
                      <span className="h-7 w-[52px] rounded-[3px] border border-line-strong bg-white" />
                    )}
                    {label === 'Sidebar' && (
                      <span className="flex h-7 w-[52px] justify-end overflow-hidden rounded-[3px] border border-line-strong bg-white/40">
                        <span className="h-full w-5 border-l border-line-strong bg-white" />
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[11.5px] ${
                      selected ? 'font-medium text-brand' : 'text-ink-soft'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </span>
  )
}

function RailBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md ${
        active ? 'bg-[#ece8fd] text-brand' : 'text-ink-faint hover:bg-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

interface FieldDef {
  key: string
  label: string
  icon: ReactNode
  empty: boolean
  value: ReactNode
}

function FieldRow({ field }: { field: FieldDef }) {
  return (
    <div className="flex min-h-9 items-center py-0.5">
      <div className="flex w-[150px] shrink-0 items-center gap-2.5 text-[13px] text-ink-soft">
        {field.icon}
        <span>{field.label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center">{field.value}</div>
    </div>
  )
}

type PopKind = 'status' | 'dates' | 'track' | 'assignees' | 'tags' | 'priority' | 'type'

/** Global task-detail modal, driven by store.selectedTaskId. */
export function TaskModal() {
  const task = useAppStore((s) =>
    s.selectedTaskId ? s.tasks.find((t) => t.id === s.selectedTaskId) : undefined,
  )
  if (!task) return null
  // Keyed by task id so prev/next & subtask navigation replay the load sequence.
  return <TaskModalShell key={task.id} task={task} />
}

function TaskModalShell({ task }: { task: Task }) {
  const allTasks = useAppStore((s) => s.tasks)
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const workspaceTags = useAppStore((s) => s.workspaceTags)
  const users = useAppStore((s) => s.users)
  const spaces = useAppStore((s) => s.spaces)
  const favorites = useAppStore((s) => s.favorites)
  const notify = useAppStore((s) => s.notify)
  const closeTask = useAppStore((s) => s.closeTask)
  const openTask = useAppStore((s) => s.openTask)
  const setTaskStatus = useAppStore((s) => s.setTaskStatus)
  const setTaskPriority = useAppStore((s) => s.setTaskPriority)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const navigate = useNavigate()
  const fullDoc = useDocView((s) => s.expandedTaskId === task.id)

  const [loaded, setLoaded] = useState(false)
  const [bannerVisible, setBannerVisible] = useState(true)
  const [collapseEmpty, setCollapseEmpty] = useState(false)
  const [activityOpen, setActivityOpen] = useState(true)
  const [miniHeader, setMiniHeader] = useState(false)
  const [pop, setPop] = useState<{ kind: PopKind; pos: PopoverPos } | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)

  const soon = (what: string) => () => comingSoon(notify, what)

  // Window title mirrors the video: "<task name> | <codeId>" while open.
  useEffect(() => {
    const prevTitle = document.title
    document.title = task.codeId ? `${task.name} | ${task.codeId}` : task.name
    return () => {
      document.title = prevTitle
    }
  }, [task.name, task.codeId])

  // Skeleton-first content load (description bars + staggered fields).
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 500)
    return () => clearTimeout(t)
  }, [])

  // Escape closes (full-page doc first); open popovers keep their own Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (document.querySelector('.fixed.z-50')) return
      if (useDocView.getState().expandedTaskId) {
        useDocView.getState().closeFullDoc()
        return
      }
      closeTask()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeTask])

  // Leave no stale full-page doc state behind when the modal unmounts.
  useEffect(() => () => useDocView.getState().closeFullDoc(), [])

  // Sticky mini-header once the H1 scrolls out of the modal's scroll container.
  useEffect(() => {
    const rootEl = scrollRef.current
    const target = titleRef.current
    if (!rootEl || !target) return
    const io = new IntersectionObserver(([entry]) => setMiniHeader(!entry.isIntersecting), {
      root: rootEl,
    })
    io.observe(target)
    return () => io.disconnect()
  }, [fullDoc])

  // Prev/next navigation follows the list's status-group order (subtasks after parent).
  const orderedIds = useMemo(() => {
    const flat: string[] = []
    for (const g of groupTasksByStatus(tasksForLists(allTasks, [task.listId]), taskStatuses)) {
      for (const t of g.items) {
        flat.push(t.id)
        for (const st of subtasksOf(allTasks, t.id)) flat.push(st.id)
      }
    }
    return flat
  }, [allTasks, taskStatuses, task.listId])
  const navIdx = orderedIds.indexOf(task.id)
  const prevId = navIdx > 0 ? orderedIds[navIdx - 1] : undefined
  const nextId = navIdx !== -1 && navIdx < orderedIds.length - 1 ? orderedIds[navIdx + 1] : undefined

  const status = taskStatuses[task.statusId]
  const outline = status?.style === 'outline'
  const listCtx = findListItem(spaces, task.listId)
  const parent = task.parentId ? allTasks.find((t) => t.id === task.parentId) : undefined
  const subCount = useMemo(
    () => subtasksOf(allTasks, task.id).length,
    [allTasks, task.id],
  )
  const isFavorite = favorites.includes(task.id)

  // loadDelayed tasks stagger estimate + tags into the content pass (like the video).
  const stagger = !loaded && !!task.loadDelayed
  const estimateHours = stagger ? undefined : task.estimateHours
  const tags = stagger ? [] : (task.tags ?? [])
  const assignees = (task.assigneeIds ?? [])
    .map((id) => users[id])
    .filter((u): u is User => Boolean(u))

  const openPop =
    (kind: PopKind, width = 240) =>
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation()
      setPop({ kind, pos: popoverPosFor(e.currentTarget, width) })
    }
  const closePop = () => setPop(null)

  const advanceStatus = () => {
    const idx = statusOrder.indexOf(task.statusId)
    setTaskStatus(task.id, statusOrder[(idx + 1) % statusOrder.length])
  }
  const completeTask = () => {
    const closed = [...statusOrder].reverse().find((sid) => taskStatuses[sid]?.group === 'closed')
    if (closed) setTaskStatus(task.id, closed)
  }

  const emptyText = <span className="text-[13px] text-ink-faint">Empty</span>

  const col1: FieldDef[] = [
    {
      key: 'status',
      label: 'Status',
      icon: <CircleDot className="h-4 w-4 text-ink-faint" />,
      empty: false,
      value: (
        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-6 overflow-hidden rounded-[4px] ${
              outline ? 'border border-line-strong bg-white' : ''
            }`}
            style={outline ? undefined : { backgroundColor: status?.color ?? '#87909e' }}
          >
            <button
              type="button"
              title="Set status"
              onClick={openPop('status', 250)}
              className={`flex cursor-pointer items-center px-2.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ${
                outline ? 'text-ink-soft hover:bg-hover' : 'text-white hover:bg-white/15'
              }`}
            >
              {status?.label ?? task.statusId}
            </button>
            <button
              type="button"
              title="Next status"
              onClick={advanceStatus}
              className={`flex w-6 cursor-pointer items-center justify-center ${
                outline
                  ? 'border-l border-line-strong text-ink-soft hover:bg-hover'
                  : 'border-l border-white/25 text-white hover:bg-white/15'
              }`}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            title="Mark complete"
            onClick={completeTask}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] border border-line-strong text-ink-faint hover:border-[#27ae60] hover:bg-[#e7f6ec] hover:text-[#27ae60]"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      icon: <Calendar className="h-4 w-4 text-ink-faint" />,
      empty: !task.dueDate,
      value: (
        <button
          type="button"
          onClick={openPop('dates', 544)}
          className="flex h-7 cursor-pointer items-center rounded-md px-1.5 text-[13px] hover:bg-hover"
        >
          {task.dueDate ? (
            <span className={task.dueOverdue ? 'text-[#d8354f]' : 'text-ink'}>{task.dueDate}</span>
          ) : (
            <>
              <span className="text-ink-faint group-hover/fields:hidden">Empty</span>
              <span className="hidden items-center gap-1.5 text-ink-faint group-hover/fields:flex">
                <Calendar className="h-3.5 w-3.5" />
                Start
                <ArrowRight className="h-3 w-3" />
                <Calendar className="h-3.5 w-3.5" />
                Due
              </span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'estimate',
      label: 'Time estimate',
      icon: <Hourglass className="h-4 w-4 text-ink-faint" />,
      empty: estimateHours === undefined,
      value: (
        <button
          key={loaded ? 'loaded' : 'loading'}
          type="button"
          onClick={soon('The time estimate editor')}
          className="animate-fade-in flex h-7 cursor-pointer items-center rounded-md px-1.5 text-[13px] hover:bg-hover"
        >
          {estimateHours !== undefined ? (
            <span className="text-ink tabular-nums">{estimateHours}h</span>
          ) : (
            emptyText
          )}
        </button>
      ),
    },
    {
      key: 'track',
      label: 'Track time',
      icon: <Timer className="h-4 w-4 text-ink-faint" />,
      empty: true,
      value: (
        <button
          type="button"
          onClick={openPop('track', 445)}
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-[13px] text-ink hover:bg-hover"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink">
            <Play className="h-2 w-2 text-white" fill="currentColor" />
          </span>
          Start
        </button>
      ),
    },
  ]

  const col2: FieldDef[] = [
    {
      key: 'assignees',
      label: 'Assignees',
      icon: <CircleUserRound className="h-4 w-4 text-ink-faint" />,
      empty: assignees.length === 0,
      value: (
        <button
          type="button"
          onClick={openPop('assignees', 265)}
          className="flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 hover:bg-hover"
        >
          {assignees.length > 0 ? (
            <>
              <span className="flex -space-x-1.5">
                {assignees.map((u) => (
                  <span key={u.id} className="rounded-full ring-2 ring-white">
                    <Avatar initials={u.initials} color={u.color} size={24} title={u.name} />
                  </span>
                ))}
              </span>
              {assignees.length === 1 && (
                <span className="truncate text-[13.5px] text-ink">{assignees[0].name}</span>
              )}
            </>
          ) : (
            emptyText
          )}
        </button>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      icon: <Flag className="h-4 w-4 text-ink-faint" />,
      empty: !task.priority,
      value: (
        <button
          type="button"
          onClick={openPop('priority', 200)}
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-[13px] hover:bg-hover"
        >
          {task.priority ? (
            <>
              <Flag
                className="h-3.5 w-3.5"
                style={{ color: PRIORITY_META[task.priority].color }}
                fill={PRIORITY_META[task.priority].color}
              />
              <span className="text-ink">{PRIORITY_META[task.priority].label}</span>
            </>
          ) : (
            emptyText
          )}
        </button>
      ),
    },
    {
      key: 'sprint',
      label: 'Sprint points',
      icon: <Target className="h-4 w-4 text-ink-faint" />,
      empty: task.sprintPoints === undefined,
      value: (
        <button
          type="button"
          onClick={soon('Sprint points')}
          className="flex h-7 cursor-pointer items-center rounded-md px-1.5 text-[13px] hover:bg-hover"
        >
          {task.sprintPoints !== undefined ? (
            <span className="text-ink tabular-nums">{task.sprintPoints}</span>
          ) : (
            emptyText
          )}
        </button>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      icon: <Tag className="h-4 w-4 text-ink-faint" />,
      empty: tags.length === 0,
      value: (
        <button
          key={loaded ? 'loaded' : 'loading'}
          type="button"
          onClick={openPop('tags', 260)}
          className="animate-fade-in flex h-8 min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 hover:bg-hover"
        >
          {tags.length > 0
            ? tags.map((id) => {
                const tag = workspaceTags[id]
                return (
                  <span
                    key={id}
                    className="flex h-5 shrink-0 items-center rounded-[5px] px-1.5 text-[11.5px] font-medium"
                    style={{
                      backgroundColor: tag?.bg ?? '#eef0f3',
                      color: tag?.text ?? '#656f7d',
                    }}
                  >
                    {tag?.label ?? id}
                  </span>
                )
              })
            : emptyText}
        </button>
      ),
    },
  ]

  const visible1 = collapseEmpty ? col1.filter((f) => !f.empty) : col1
  const visible2 = collapseEmpty ? col2.filter((f) => !f.empty) : col2

  return (
    <>
      <div className="animate-fade-in fixed inset-0 z-40 bg-black/35" onClick={closeTask} />
      <div className="animate-pop-in fixed inset-x-[150px] inset-y-[56px] z-40 flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-[1280px]:inset-x-10 max-[860px]:inset-x-3">
        {/* ---- Header ---- */}
        <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-line pr-2 pl-3">
          <button
            type="button"
            title="Previous task"
            disabled={!prevId}
            onClick={() => prevId && openTask(prevId)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Next task"
            disabled={!nextId}
            onClick={() => nextId && openTask(nextId)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="ml-1.5 flex min-w-0 items-center gap-0.5">
            <button
              type="button"
              onClick={soon('The Space overview')}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover"
            >
              <Avatar
                initials={listCtx?.space.abbr ?? 'M'}
                color={listCtx?.space.color ?? '#7b68ee'}
                size={18}
                rounded="md"
              />
              <span className="text-[13px] font-medium whitespace-nowrap text-ink">
                {listCtx?.space.name ?? 'Space'}
              </span>
              {listCtx?.space.isPrivate && <Lock className="h-[11px] w-[11px] text-ink-faint" />}
            </button>
            <span className="text-[13px] text-ink-faint">/</span>
            <button
              type="button"
              onClick={() => {
                if (listCtx) {
                  closeTask()
                  navigate(`/space/${listCtx.space.id}/list/${task.listId}/list`)
                } else {
                  comingSoon(notify, 'The list view')
                }
              }}
              className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover"
            >
              <List className="h-3.5 w-3.5 shrink-0 text-[#d6336c]" />
              <span className="truncate text-[13px] text-ink">
                {listCtx?.item.name ?? 'List'}
              </span>
            </button>
            <button
              type="button"
              title="New tab"
              onClick={soon('Task tabs')}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Open as full page"
              onClick={soon('Opening as a full page')}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
            >
              <SquareArrowOutUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {task.createdLabel && (
              <span className="px-1.5 text-[12px] whitespace-nowrap text-ink-faint">
                Created {task.createdLabel}
              </span>
            )}
            <button
              type="button"
              onClick={soon('Brain² AI')}
              className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-ink hover:bg-hover"
            >
              <Brain className="h-[15px] w-[15px] text-[#b15de8]" />
              <span>
                Brain<sup>2</sup>
              </span>
            </button>
            <button
              type="button"
              onClick={soon('Sharing')}
              className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-ink hover:bg-hover"
            >
              <UserRoundPlus className="h-3.5 w-3.5 text-ink-soft" />
              Share
            </button>
            <button
              type="button"
              aria-label="Task settings"
              onClick={soon('The task settings menu')}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
            >
              <Ellipsis className="h-4 w-4" />
            </button>
            <Tip label="Favorite">
              <button
                type="button"
                aria-label="Favorite"
                onClick={() => toggleFavorite(task.id)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
              >
                <Star
                  className={`h-4 w-4 ${isFavorite ? 'text-[#e8a33d]' : 'text-ink-soft'}`}
                  fill={isFavorite ? '#e8a33d' : 'none'}
                />
              </button>
            </Tip>
            <LayoutSwitch />
            <Tip label="Close window" esc>
              <button
                type="button"
                aria-label="Close window"
                onClick={closeTask}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </Tip>
          </div>
        </div>

        {/* ---- Body ---- */}
        {fullDoc ? (
          <div className="flex min-h-0 flex-1">
            <TaskDocFullPage task={task} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            {/* Left content pane */}
            <div className="relative flex min-w-0 flex-1">
              <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
                <div className="relative pb-16 pl-20 max-[1280px]:pl-14 pr-12">
                  <button
                    type="button"
                    title="Calls"
                    onClick={soon('Calls')}
                    className="absolute top-3.5 left-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
                  >
                    <Phone className="h-4 w-4" />
                  </button>

                  {/* Row 2: type pill + focus + subtask badge */}
                  <div className="flex items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={openPop('type', 230)}
                      className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2 hover:bg-hover"
                    >
                      <StatusRing status={status} size={11} />
                      <span className="text-[13px] text-ink">Task</span>
                      <ChevronDown className="h-3 w-3 text-ink-faint" />
                    </button>
                    <button
                      type="button"
                      title="Focus mode"
                      onClick={soon('Focus mode')}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                    {subCount > 0 && (
                      <button
                        type="button"
                        title={`${subCount} subtasks`}
                        onClick={soon('Subtask navigation')}
                        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12.5px] text-ink-soft tabular-nums hover:bg-hover"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {subCount}
                      </button>
                    )}
                  </div>

                  {/* Subtask parent line */}
                  {parent && (
                    <div className="flex items-center gap-1 pt-3 text-[13px] text-ink-soft">
                      <span className="pr-0.5">Subtask of</span>
                      <button
                        type="button"
                        onClick={() => openTask(parent.id)}
                        className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 hover:bg-hover"
                      >
                        <StatusRing status={taskStatuses[parent.statusId]} size={12} />
                        <span className="truncate text-ink">{parent.name}</span>
                      </button>
                    </div>
                  )}

                  <h1
                    ref={titleRef}
                    className="pt-3 text-[26px] leading-tight font-bold text-ink"
                  >
                    {task.name}
                  </h1>

                  {/* Ask Brain² banner */}
                  {bannerVisible && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-[#f5f4fd] py-2.5 pr-2 pl-3.5">
                      <Sparkles className="h-4 w-4 shrink-0 text-brand" />
                      <span className="min-w-0 truncate text-[13px] text-ink-soft">
                        Ask Brain<sup>2</sup> for a{' '}
                        <button
                          type="button"
                          onClick={soon('Brain² presentations')}
                          className="cursor-pointer font-medium text-brand hover:underline"
                        >
                          presentation
                        </button>
                        ,{' '}
                        <button
                          type="button"
                          onClick={soon('Brain² documents')}
                          className="cursor-pointer font-medium text-brand hover:underline"
                        >
                          document
                        </button>{' '}
                        or{' '}
                        <button
                          type="button"
                          onClick={soon('Brain² prototypes')}
                          className="cursor-pointer font-medium text-brand hover:underline"
                        >
                          prototype
                        </button>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss suggestion"
                        onClick={() => setBannerVisible(false)}
                        className="ml-auto flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-black/5"
                      >
                        <X className="h-3.5 w-3.5 text-ink-faint" />
                      </button>
                    </div>
                  )}

                  {/* Fields grid */}
                  <div className="group/fields mt-4 border-y border-line py-2.5">
                    <div className="grid grid-cols-2 gap-x-10 max-[1100px]:grid-cols-1">
                      <div>
                        {visible1.map((f) => (
                          <FieldRow key={f.key} field={f} />
                        ))}
                      </div>
                      <div>
                        {visible2.map((f) => (
                          <FieldRow key={f.key} field={f} />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollapseEmpty((v) => !v)}
                      className="mt-1 flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-[12.5px] text-ink-faint opacity-0 group-hover/fields:opacity-100 hover:text-ink"
                    >
                      <ChevronsDownUp className="h-3.5 w-3.5" />
                      {collapseEmpty ? 'Show empty fields' : 'Collapse empty fields'}
                    </button>
                  </div>

                  {/* Description (skeleton-first) */}
                  {loaded ? (
                    <div className="animate-fade-in mt-5">
                      <TaskDescription task={task} />
                    </div>
                  ) : (
                    <div className="mt-6 mb-4 flex flex-col gap-3.5">
                      {SKELETON_WIDTHS.map((w, i) => (
                        <div key={i} className="pm-shimmer h-3.5" style={{ width: w }} />
                      ))}
                    </div>
                  )}

                  {/* Add fields / subtasks / relationships / checklists / attach */}
                  <div className="mt-2">
                    <TaskActionRows task={task} />
                  </div>
                </div>
              </div>

              {/* Sticky mini-header */}
              {miniHeader && (
                <div className="absolute inset-x-0 top-0 z-10 flex h-10 items-center gap-2.5 border-b border-line bg-white px-5">
                  <StatusRing status={status} size={15} />
                  <span className="min-w-0 truncate text-[14px] font-medium text-ink">
                    {task.name}
                  </span>
                  {assignees[0] && (
                    <span className="ml-auto shrink-0">
                      <Avatar
                        initials={assignees[0].initials}
                        color={assignees[0].color}
                        size={26}
                        title={assignees[0].name}
                      />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right-edge icon rail */}
            <div className="flex w-10 shrink-0 flex-col items-center gap-1.5 pt-2.5">
              <RailBtn
                title={activityOpen ? 'Collapse activity' : 'Expand activity'}
                onClick={() => setActivityOpen((v) => !v)}
              >
                {activityOpen ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <ChevronsLeft className="h-4 w-4" />
                )}
              </RailBtn>
              <RailBtn
                title="Comments"
                active={activityOpen}
                onClick={() =>
                  activityOpen ? comingSoon(notify, 'Panel views') : setActivityOpen(true)
                }
              >
                <MessageCircle className="h-4 w-4" />
              </RailBtn>
              <RailBtn title="Activity" onClick={soon('The activity view')}>
                <RefreshCw className="h-4 w-4" />
              </RailBtn>
              <RailBtn title="Apps" onClick={soon('The apps panel')}>
                <LayoutGrid className="h-4 w-4" />
              </RailBtn>
            </div>

            {/* Activity panel (collapsible) */}
            {activityOpen && (
              <div className="flex w-[34.5%] max-w-[560px] min-w-[300px] shrink-0 flex-col overflow-hidden border-l border-line">
                <ActivityPanel task={task} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- Field popovers (B's components) ---- */}
      {pop?.kind === 'status' && (
        <StatusDropdown task={task} pos={pop.pos} onClose={closePop} />
      )}
      {pop?.kind === 'dates' && (
        <DatePickerPopover task={task} pos={pop.pos} onClose={closePop} />
      )}
      {pop?.kind === 'track' && (
        <TimeTrackPopover task={task} pos={pop.pos} onClose={closePop} />
      )}
      {pop?.kind === 'assignees' && (
        <AssigneePicker task={task} pos={pop.pos} onClose={closePop} />
      )}
      {pop?.kind === 'tags' && <TagPicker task={task} pos={pop.pos} onClose={closePop} />}

      {/* Priority popover (inline, PRIORITY_META pattern) */}
      {pop?.kind === 'priority' && (
        <Popover pos={pop.pos} onClose={closePop} width={200}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">
            Priority
          </div>
          {(Object.keys(PRIORITY_META) as TaskPriority[]).map((p) => (
            <PopoverItem
              key={p}
              selected={p === task.priority}
              onClick={() => {
                setTaskPriority(task.id, p)
                closePop()
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
                closePop()
              }}
            >
              <X className="h-3.5 w-3.5 text-ink-faint" />
              <span className="text-ink-soft">Clear</span>
            </PopoverItem>
          )}
        </Popover>
      )}

      {/* Task type popover (9 types, current ✓) */}
      {pop?.kind === 'type' && (
        <Popover pos={pop.pos} onClose={closePop} width={230}>
          <div className="flex items-center gap-1 px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">
            Task Types
            <Info className="h-3 w-3" />
          </div>
          {TASK_TYPES.map(({ label, icon: Icon }) => (
            <PopoverItem
              key={label}
              selected={label === 'Task'}
              onClick={() => {
                if (label !== 'Task') comingSoon(notify, `The ${label} task type`)
                closePop()
              }}
            >
              <Icon className="h-4 w-4 text-ink-soft" />
              <span>{label}</span>
              {label === 'Task' && <Check className="ml-auto h-3.5 w-3.5 text-ink" />}
            </PopoverItem>
          ))}
        </Popover>
      )}
    </>
  )
}
