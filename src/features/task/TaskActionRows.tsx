import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import {
  AlignLeft,
  ArrowUpDown,
  Box,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleChevronDown,
  CircleMinus,
  CircleUserRound,
  Cloud,
  DollarSign,
  FileText,
  Files,
  Flag,
  Gauge,
  Globe,
  Hash,
  Languages,
  LayoutTemplate,
  Link2,
  ListChecks,
  Mail,
  MapPin,
  Maximize2,
  MessagesSquare,
  MousePointerClick,
  Network,
  Paperclip,
  PenLine,
  Phone,
  Plus,
  Search,
  Shapes,
  Shirt,
  SlidersHorizontal,
  Smile,
  Sparkles,
  SquareCheck,
  SquareFunction,
  SquarePen,
  Star,
  Tag,
  ThumbsUp,
  TriangleAlert,
  Type,
  Upload,
  UserRoundPlus,
  UsersRound,
  WandSparkles,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Popover, PopoverItem } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, PRIORITY_META, subtasksOf, useAppStore } from '../../lib/store'
import type { Checklist, Task, TaskStatus, User } from '../../lib/types'

const ICON_BTN =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink-soft'

/* ---------------- Field-type popover data (verbatim from the video) ---------------- */

const AI_FIELD_TYPES = ['Summary', 'Custom Text', 'Custom Dropdown']
const ALL_FIELD_TYPES = [
  'Dropdown',
  'Text',
  'Date',
  'Text area (Long Text)',
  'Number',
  'Labels',
  'Checkbox',
  'Money',
  'Website',
  'Formula',
  'Custom Text',
  'Summary',
  'Progress Updates',
  'Files',
  'Relationship',
  'People',
  'Progress (Auto)',
  'Email',
  'Phone',
  'Categorize',
  'Custom Dropdown',
  'Translation',
  'Sentiment',
  'Tasks',
  'Location',
  'Progress (Manual)',
  'Rating',
  'Voting',
  'Signature',
  'Button',
  'Action Items',
  'T-shirt Size',
]
/** Types rendered with the purple AI glyph in the video. */
const AI_GLYPHS = new Set([
  'Summary',
  'Custom Text',
  'Custom Dropdown',
  'Translation',
  'Sentiment',
  'Categorize',
  'Progress Updates',
])
const FIELD_TYPE_ICONS: Record<string, LucideIcon> = {
  Dropdown: CircleChevronDown,
  Text: Type,
  Date: Calendar,
  'Text area (Long Text)': AlignLeft,
  Number: Hash,
  Labels: Tag,
  Checkbox: SquareCheck,
  Money: DollarSign,
  Website: Globe,
  Formula: SquareFunction,
  'Custom Text': Type,
  Summary: Sparkles,
  'Progress Updates': MessagesSquare,
  Files: Files,
  Relationship: Link2,
  People: UsersRound,
  'Progress (Auto)': Gauge,
  Email: Mail,
  Phone: Phone,
  Categorize: Shapes,
  'Custom Dropdown': CircleChevronDown,
  Translation: Languages,
  Sentiment: Smile,
  Tasks: CircleCheck,
  Location: MapPin,
  'Progress (Manual)': SlidersHorizontal,
  Rating: Star,
  Voting: ThumbsUp,
  Signature: PenLine,
  Button: MousePointerClick,
  'Action Items': ListChecks,
  'T-shirt Size': Shirt,
}

/* ---------------- Attach menu (7 items verbatim) ---------------- */

function DropboxGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="#0062ff" className="shrink-0">
      <path d="M6 2.6 12 6.4 6 10.2 0 6.4ZM18 2.6 24 6.4 18 10.2 12 6.4ZM6 11 12 14.8 6 18.6 0 14.8ZM18 11 24 14.8 18 18.6 12 14.8ZM6.1 19.5 12 15.8l5.9 3.7L12 23.2Z" />
    </svg>
  )
}
function DriveGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" className="shrink-0">
      <path fill="#188038" d="M8.4 2.9 1 15.7l3.7 6.4 7.4-12.8Z" />
      <path fill="#fbbc04" d="M15.6 2.9H8.4l7.4 12.8h7.2Z" />
      <path fill="#4285f4" d="M4.7 22.1h14.6l3.7-6.4H8.4Z" />
    </svg>
  )
}
const ATTACH_ITEMS: { label: string; icon: ReactNode }[] = [
  { label: 'Upload file', icon: <Upload size={15} className="shrink-0 text-ink-faint" /> },
  { label: 'New Document', icon: <FileText size={15} className="shrink-0 text-[#4a90e2]" /> },
  { label: 'Dropbox', icon: <DropboxGlyph /> },
  {
    label: 'OneDrive/SharePoint',
    icon: <Cloud size={15} fill="#0364b8" className="shrink-0 text-[#0364b8]" />,
  },
  { label: 'Box', icon: <Box size={15} className="shrink-0 text-[#0061d5]" /> },
  { label: 'Google Drive', icon: <DriveGlyph /> },
  { label: 'New Google Doc', icon: <FileText size={15} className="shrink-0 text-[#3086f6]" /> },
]

/* ---------------- Small shared pieces ---------------- */

function ActionRow({
  icon: Icon,
  label,
  active,
  onClick,
  children,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  children?: ReactNode
}) {
  return (
    <div
      role="button"
      onClick={onClick}
      className={`group flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-2 ${
        active ? 'bg-hover' : 'hover:bg-hover'
      }`}
    >
      <Icon size={16} className="shrink-0 text-ink-faint" />
      <span className="min-w-0 flex-1 truncate text-[14px] text-ink-soft">{label}</span>
      {children}
    </div>
  )
}

/** Icon button with the dark hover tooltip from the subtask composer strip. */
function ComposerIcon({
  icon: Icon,
  tip,
  onClick,
}: {
  icon: LucideIcon
  tip?: string
  onClick: () => void
}) {
  return (
    <span className="group/ci relative">
      <button
        type="button"
        onClick={onClick}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink-soft"
      >
        <Icon size={15} />
      </button>
      {tip && (
        <span className="animate-fade-in pointer-events-none absolute -top-[30px] left-1/2 z-[60] hidden -translate-x-1/2 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white group-hover/ci:block">
          {tip}
        </span>
      )}
    </span>
  )
}

/** Right-side controls shared by the Add-subtask composer header and Subtasks section header. */
function SubtaskControls({ onAdd, className = '' }: { onAdd: () => void; className?: string }) {
  const notify = useAppStore((s) => s.notify)
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <button
        onClick={() => comingSoon(notify, 'Sorting')}
        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12px] text-ink-faint hover:bg-hover hover:text-ink-soft"
      >
        <ArrowUpDown size={13} />
        Sort
      </button>
      <button onClick={() => comingSoon(notify, 'Expanded view')} className={ICON_BTN}>
        <Maximize2 size={13} />
      </button>
      <button
        onClick={() => comingSoon(notify, 'Suggest subtasks')}
        className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[13px] font-medium text-brand hover:bg-brand/10"
      >
        <Sparkles size={13} />
        Suggest
      </button>
      <button onClick={onAdd} className={ICON_BTN}>
        <Plus size={14} />
      </button>
    </div>
  )
}

/* ---------------- Subtask composer ---------------- */

function SubtaskComposer({ taskId, onCancel }: { taskId: string; onCancel: () => void }) {
  const addSubtask = useAppStore((s) => s.addSubtask)
  const notify = useAppStore((s) => s.notify)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const save = () => {
    if (!draft.trim()) return
    addSubtask(taskId, draft)
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <div className="animate-fade-in mx-2 flex h-10 items-center gap-2.5 rounded-lg border border-[#e4e4e9] pr-1.5 pl-3">
      <span className="h-4 w-4 shrink-0 rounded-full border-[1.5px] border-dashed border-ink-faint/70" />
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') onCancel()
        }}
        placeholder="Task Name or type '/' for commands"
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
      />
      <span className="flex shrink-0 items-center">
        <ComposerIcon icon={LayoutTemplate} onClick={() => comingSoon(notify, 'Templates')} />
        <ComposerIcon icon={WandSparkles} onClick={() => comingSoon(notify, 'Write with AI')} />
        <ComposerIcon icon={UserRoundPlus} tip="Assign" onClick={() => comingSoon(notify, 'Assign')} />
        <ComposerIcon
          icon={Calendar}
          tip="Set Due Date"
          onClick={() => comingSoon(notify, 'Set Due Date')}
        />
        <ComposerIcon
          icon={Flag}
          tip="Set priority"
          onClick={() => comingSoon(notify, 'Set priority')}
        />
        <ComposerIcon icon={Tag} tip="Edit tags" onClick={() => comingSoon(notify, 'Edit tags')} />
      </span>
      <button
        onClick={onCancel}
        className="shrink-0 cursor-pointer px-1 text-[13px] text-ink-soft hover:text-ink"
      >
        Cancel
      </button>
      <button
        onClick={save}
        className="flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-brand px-2.5 text-[13px] font-medium text-white hover:bg-brand-deep"
      >
        Save <span className="text-[11px]">&#8629;</span>
      </button>
    </div>
  )
}

/* ---------------- Subtasks table section ---------------- */

function SubtaskStatusIcon({ status }: { status: TaskStatus | undefined }) {
  if (!status || status.style === 'outline') {
    return <span className="h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-dashed border-ink-faint/80" />
  }
  return (
    <span
      className="h-3.5 w-3.5 shrink-0 rounded-full border-2"
      style={{ borderColor: status.color }}
    />
  )
}

function SubtasksSection({
  task,
  subtasks,
  composerOpen,
  setComposerOpen,
}: {
  task: Task
  subtasks: Task[]
  composerOpen: boolean
  setComposerOpen: (open: boolean) => void
}) {
  const taskStatuses = useAppStore((s) => s.taskStatuses)
  const users = useAppStore((s) => s.users)
  const openTask = useAppStore((s) => s.openTask)
  const notify = useAppStore((s) => s.notify)
  const [collapsed, setCollapsed] = useState(false)

  const openCount = subtasks.filter((t) => {
    const g = taskStatuses[t.statusId]?.group
    return g !== 'done' && g !== 'closed'
  }).length
  const pct =
    subtasks.length === 0 ? 0 : Math.round(((subtasks.length - openCount) / subtasks.length) * 100)

  return (
    <div className="group/sub py-1.5">
      <div className="flex h-8 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
          <span className="text-[14px] font-semibold text-ink">Subtasks</span>
          <span className="text-[13px] text-ink-faint">{openCount} open</span>
          <span className="h-1 w-9 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-[#27ae60]"
              style={{ width: `${pct}%` }}
            />
          </span>
        </div>
        <SubtaskControls
          onAdd={() => setComposerOpen(true)}
          className="opacity-0 transition-opacity group-hover/sub:opacity-100"
        />
      </div>
      {!collapsed && (
        <div className="animate-fade-in">
          <div className="flex h-7 items-center border-b border-line text-[12px] text-ink-faint">
            <span className="min-w-0 flex-1 pl-9">Name</span>
            <span className="w-[104px]">Assignee</span>
            <span className="w-[88px]">Priority</span>
            <button
              onClick={() => comingSoon(notify, 'Custom columns')}
              className="flex w-8 cursor-pointer items-center justify-center text-ink-faint hover:text-ink-soft"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-line-strong">
                <Plus size={10} />
              </span>
            </button>
          </div>
          {subtasks.map((st) => {
            const status = taskStatuses[st.statusId]
            const assignees = (st.assigneeIds ?? [])
              .map((id) => users[id])
              .filter((u): u is User => Boolean(u))
            return (
              <div
                key={st.id}
                role="button"
                onClick={() => openTask(st.id)}
                className="flex h-9 cursor-pointer items-center border-b border-line hover:bg-panel"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5 pl-2">
                  <SubtaskStatusIcon status={status} />
                  <span className="truncate text-[14px] text-ink">{st.name}</span>
                </span>
                <span className="flex w-[104px] items-center">
                  {assignees.length > 0 ? (
                    <span className="flex -space-x-1.5">
                      {assignees.slice(0, 2).map((u) => (
                        <Avatar key={u.id} initials={u.initials} color={u.color} size={20} title={u.name} />
                      ))}
                    </span>
                  ) : (
                    <CircleUserRound size={16} className="text-ink-faint/60" />
                  )}
                </span>
                <span className="flex w-[88px] items-center">
                  {st.priority ? (
                    <Flag
                      size={14}
                      fill={PRIORITY_META[st.priority].color}
                      style={{ color: PRIORITY_META[st.priority].color }}
                    />
                  ) : (
                    <Flag size={14} className="text-ink-faint/60" />
                  )}
                </span>
                <span className="w-8" />
              </div>
            )
          })}
          {composerOpen ? (
            <div className="pt-1.5">
              <SubtaskComposer taskId={task.id} onCancel={() => setComposerOpen(false)} />
            </div>
          ) : (
            <button
              onClick={() => setComposerOpen(true)}
              className="flex h-8 w-full cursor-pointer items-center gap-1.5 pl-9 text-left text-[13px] text-ink-faint hover:text-ink-soft"
            >
              <Plus size={13} />
              Add Task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------- Checklists ---------------- */

function ChecklistCard({
  taskId,
  checklist,
  editing,
  onStartEdit,
  onDoneEdit,
}: {
  taskId: string
  checklist: Checklist
  editing: boolean
  onStartEdit: () => void
  onDoneEdit: () => void
}) {
  const renameChecklist = useAppStore((s) => s.renameChecklist)
  const addChecklistItem = useAppStore((s) => s.addChecklistItem)
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem)
  const notify = useAppStore((s) => s.notify)
  const [addingItem, setAddingItem] = useState(false)
  const [itemDraft, setItemDraft] = useState('')

  const commitTitle = (value: string) => {
    renameChecklist(taskId, checklist.id, value)
    onDoneEdit()
  }
  const commitItem = () => {
    if (itemDraft.trim()) {
      addChecklistItem(taskId, checklist.id, itemDraft)
      setItemDraft('')
    }
  }

  return (
    <div className="group/card mt-1.5 ml-6 rounded-lg border border-[#e6e8ec] px-3 py-2">
      <div className="flex h-7 items-center justify-between">
        {editing ? (
          <input
            autoFocus
            defaultValue={checklist.title}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle(e.currentTarget.value)
              if (e.key === 'Escape') onDoneEdit()
            }}
            onBlur={(e) => commitTitle(e.currentTarget.value)}
            className="h-7 w-60 rounded-md border border-brand px-1.5 text-[14px] font-semibold text-ink outline-none"
          />
        ) : (
          <button
            onClick={onStartEdit}
            className="cursor-pointer truncate text-[14px] font-semibold text-ink"
          >
            {checklist.title}
          </button>
        )}
        <button
          onClick={() => comingSoon(notify, 'Checklist assignment')}
          className={`${ICON_BTN} opacity-0 group-hover/card:opacity-100`}
        >
          <UserRoundPlus size={14} />
        </button>
      </div>
      {checklist.items.map((it) => (
        <div key={it.id} className="flex min-h-7 items-center gap-2.5 py-0.5">
          <button
            onClick={() => toggleChecklistItem(taskId, checklist.id, it.id)}
            className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border ${
              it.done ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white hover:border-brand'
            }`}
          >
            {it.done && <Check size={11} strokeWidth={3} />}
          </button>
          <span className={`text-[13px] ${it.done ? 'text-ink-faint line-through' : 'text-ink'}`}>
            {it.text}
          </span>
        </div>
      ))}
      {addingItem ? (
        <div className="flex h-8 items-center gap-2.5">
          <span className="h-4 w-4 shrink-0 rounded-[4px] border border-line-strong" />
          <input
            autoFocus
            value={itemDraft}
            onChange={(e) => setItemDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitItem()
              if (e.key === 'Escape') {
                setItemDraft('')
                setAddingItem(false)
              }
            }}
            onBlur={() => {
              commitItem()
              setAddingItem(false)
            }}
            className="h-7 min-w-0 flex-1 rounded-md border border-line-strong px-1.5 text-[13px] text-ink outline-none focus:border-brand"
          />
        </div>
      ) : (
        <button
          onClick={() => setAddingItem(true)}
          className="flex h-7 cursor-pointer items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink-soft"
        >
          <Plus size={13} />
          Add item
        </button>
      )}
    </div>
  )
}

/* ---------------- Relationship dialog ---------------- */

function RadioRow({
  checked,
  label,
  onSelect,
}: {
  checked: boolean
  label: string
  onSelect: () => void
}) {
  return (
    <button onClick={onSelect} className="flex h-7 w-full cursor-pointer items-center gap-2.5 text-left">
      <span
        className={`h-4 w-4 shrink-0 rounded-full ${
          checked ? 'border-[5px] border-brand-deep' : 'border border-line-strong'
        }`}
      />
      <span className="text-[13px] text-ink">{label}</span>
    </button>
  )
}

function RelationshipDialog({ pos, onClose }: { pos: PopoverPos; onClose: () => void }) {
  const notify = useAppStore((s) => s.notify)
  const [name, setName] = useState('')
  const [relatedTo, setRelatedTo] = useState<'workspace' | 'list'>('list')
  const [rollup, setRollup] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // No blocking backdrop: outside clicks close the dialog AND land on the page,
  // matching the video (clicking "Create checklist" closes it and creates one).
  useEffect(() => {
    const onDown = (e: globalThis.MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const canCreate = name.trim().length > 0

  return (
    <div
      ref={ref}
      className="animate-pop-in fixed z-50 w-[320px] rounded-xl border border-line bg-white p-4 shadow-xl"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => comingSoon(notify, 'Relationship types')}
          className="flex cursor-pointer items-center gap-1 text-[15px] font-semibold text-ink"
        >
          Relationship
          <ChevronDown size={14} className="text-ink-faint" />
        </button>
        <button onClick={onClose} className={ICON_BTN}>
          <X size={15} />
        </button>
      </div>
      <label className="mb-1 block text-[13px] font-semibold text-ink">
        Relationship name<span className="text-danger">*</span>
      </label>
      <div className="relative mb-3">
        <Link2 size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint" />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="h-9 w-full rounded-md border border-line-strong pr-2 pl-8 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>
      <div className="mb-1 text-[13px] font-semibold text-ink">Related to</div>
      <RadioRow
        checked={relatedTo === 'workspace'}
        label="any task in your Workspace"
        onSelect={() => setRelatedTo('workspace')}
      />
      <RadioRow
        checked={relatedTo === 'list'}
        label="tasks from a specific List"
        onSelect={() => setRelatedTo('list')}
      />
      <div className="mt-2 mb-1 text-[13px] font-semibold text-ink">
        Related List<span className="text-danger">*</span>
      </div>
      <button
        onClick={() => comingSoon(notify, 'List selection')}
        className="mb-3 flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-line-strong px-2.5 text-[13px] text-ink-soft hover:bg-panel"
      >
        Select List...
        <ChevronDown size={14} className="text-ink-faint" />
      </button>
      <div className="mb-3 flex items-center gap-2.5">
        <button
          onClick={() => setRollup((v) => !v)}
          className={`h-[18px] w-8 shrink-0 cursor-pointer rounded-full p-[2px] transition-colors ${
            rollup ? 'bg-brand' : 'bg-line-strong'
          }`}
        >
          <span
            className={`block h-[14px] w-[14px] rounded-full bg-white shadow transition-transform ${
              rollup ? 'translate-x-[14px]' : ''
            }`}
          />
        </button>
        <span className="text-[13px] text-ink">Create rollup fields from related List</span>
      </div>
      <div className="-mx-4 mb-3 border-t border-line" />
      <button
        onClick={() => comingSoon(notify, 'Relationship settings')}
        className="mb-3 flex w-full cursor-pointer items-center justify-between text-[13px] text-ink hover:text-brand"
      >
        More settings and permissions
        <ChevronRight size={14} className="text-ink-faint" />
      </button>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-8 cursor-pointer rounded-md border border-line-strong px-3 text-[13px] font-medium text-ink hover:bg-panel"
        >
          Cancel
        </button>
        <button
          disabled={!canCreate}
          onClick={() => {
            comingSoon(notify, 'Custom relationships')
            onClose()
          }}
          className={`h-8 rounded-md px-3.5 text-[13px] font-medium text-white ${
            canCreate ? 'cursor-pointer bg-brand hover:bg-brand-deep' : 'cursor-default bg-brand/50'
          }`}
        >
          Create
        </button>
      </div>
    </div>
  )
}

/* ---------------- Field type row ---------------- */

function FieldTypeRow({ label, onPick }: { label: string; onPick: () => void }) {
  const Icon = FIELD_TYPE_ICONS[label] ?? Type
  const ai = AI_GLYPHS.has(label)
  return (
    <button
      onClick={onPick}
      className="flex h-7 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left hover:ring-1 hover:ring-line-strong hover:ring-inset"
    >
      <Icon size={15} className={`shrink-0 ${ai ? 'text-brand' : 'text-ink-faint'}`} />
      <span className="truncate text-[13px] text-[#35353b]">{label}</span>
    </button>
  )
}

/* ---------------- Main component ---------------- */

export function TaskActionRows({ task }: { task: Task }) {
  const tasks = useAppStore((s) => s.tasks)
  const notify = useAppStore((s) => s.notify)
  const addChecklist = useAppStore((s) => s.addChecklist)

  const subtasks = subtasksOf(tasks, task.id)
  const checklists = task.checklists ?? []

  const [fieldsMenu, setFieldsMenu] = useState<PopoverPos | null>(null)
  const [typesMenu, setTypesMenu] = useState<PopoverPos | null>(null)
  const [typeQuery, setTypeQuery] = useState('')
  const fieldsAnchor = useRef<DOMRect | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [relateMenu, setRelateMenu] = useState<PopoverPos | null>(null)
  const [relDialogPos, setRelDialogPos] = useState<PopoverPos | null>(null)
  const relateAnchor = useRef<DOMRect | null>(null)
  const [attachMenu, setAttachMenu] = useState<PopoverPos | null>(null)
  const [checklistsCollapsed, setChecklistsCollapsed] = useState(false)

  // Auto-focus the title of a checklist created via "Create checklist"/"+ Add checklist".
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const prevChecklistCount = useRef(checklists.length)
  const wantChecklistFocus = useRef(false)
  useEffect(() => {
    if (checklists.length > prevChecklistCount.current && wantChecklistFocus.current) {
      setEditingChecklistId(checklists[checklists.length - 1].id)
      wantChecklistFocus.current = false
    }
    prevChecklistCount.current = checklists.length
  }, [checklists])

  const createChecklist = () => {
    wantChecklistFocus.current = true
    addChecklist(task.id)
  }

  const openFieldsMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    fieldsAnchor.current = r
    setFieldsMenu({
      top: Math.max(10, r.top - 88),
      left: Math.max(8, Math.min(r.left, window.innerWidth - 258)),
    })
  }
  const openTypesMenu = () => {
    setFieldsMenu(null)
    const r = fieldsAnchor.current
    if (!r) return
    setTypeQuery('')
    setTypesMenu({
      top: Math.max(12, r.top - 484),
      left: Math.max(8, Math.min(r.left, window.innerWidth - 272)),
    })
  }
  const openRelateMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    // The video dismisses the inline subtask composer when this row is clicked (sec 42)
    setComposerOpen(false)
    const r = e.currentTarget.getBoundingClientRect()
    relateAnchor.current = r
    const height = 180
    const top =
      r.bottom + height + 10 > window.innerHeight ? Math.max(10, r.top - height - 4) : r.bottom + 4
    setRelateMenu({ top, left: Math.max(8, Math.min(r.left, window.innerWidth - 258)) })
  }
  const openRelDialog = () => {
    setRelateMenu(null)
    const r = relateAnchor.current
    if (!r) return
    setRelDialogPos({
      top: Math.max(80, Math.min(r.top - 300, window.innerHeight - 500)),
      left: Math.max(8, Math.min(r.left, window.innerWidth - 328)),
    })
  }
  const openAttachMenu = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const width = 200
    const height = 236
    const left = Math.max(8, Math.min(r.right - 24, window.innerWidth - width - 8))
    const top = r.top - height - 4 > 10 ? r.top - height - 4 : r.bottom + 4
    setAttachMenu({ top, left })
  }

  const tq = typeQuery.trim().toLowerCase()
  const aiTypes = AI_FIELD_TYPES.filter((t) => !tq || t.toLowerCase().includes(tq))
  const allTypes = ALL_FIELD_TYPES.filter((t) => !tq || t.toLowerCase().includes(tq))
  const pickType = () => {
    setTypesMenu(null)
    comingSoon(notify, 'Custom fields')
  }
  const relateSoon = () => {
    setRelateMenu(null)
    comingSoon(notify, 'Relationships')
  }

  return (
    <div className="pb-3">
      {/* Add fields */}
      <ActionRow
        icon={SquarePen}
        label="Add fields"
        active={Boolean(fieldsMenu || typesMenu)}
        onClick={openFieldsMenu}
      />

      {/* Add subtask (row / inline composer) — the row disappears once subtasks exist */}
      {subtasks.length === 0 &&
        (composerOpen ? (
          <div className="animate-fade-in py-1.5">
            <div className="mb-1.5 flex h-7 items-center justify-between px-2">
              <span className="flex items-center gap-1.5">
                <ChevronDown size={14} className="text-ink-faint" />
                <span className="text-[13px] font-semibold text-ink">Add subtask</span>
              </span>
              <SubtaskControls onAdd={() => setComposerOpen(true)} />
            </div>
            <SubtaskComposer taskId={task.id} onCancel={() => setComposerOpen(false)} />
          </div>
        ) : (
          <ActionRow icon={Network} label="Add subtask" onClick={() => setComposerOpen(true)}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                comingSoon(notify, 'Suggest subtasks')
              }}
              className="hidden shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-brand group-hover:flex hover:bg-brand/10"
            >
              <Sparkles size={13} />
              Suggest
            </button>
          </ActionRow>
        ))}

      {/* Subtasks table */}
      {subtasks.length > 0 && (
        <SubtasksSection
          task={task}
          subtasks={subtasks}
          composerOpen={composerOpen}
          setComposerOpen={setComposerOpen}
        />
      )}

      {/* Relate items */}
      <ActionRow
        icon={Link2}
        label="Relate items or add dependencies"
        active={Boolean(relateMenu || relDialogPos)}
        onClick={openRelateMenu}
      />

      {/* Checklists */}
      {checklists.length > 0 ? (
        <div className="px-2 py-1.5">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setChecklistsCollapsed((v) => !v)}
                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover"
              >
                {checklistsCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
              <span className="text-[14px] font-semibold text-ink">Checklists</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => comingSoon(notify, 'Expanded view')} className={ICON_BTN}>
                <Maximize2 size={13} />
              </button>
              <button onClick={createChecklist} className={ICON_BTN}>
                <Plus size={14} />
              </button>
            </div>
          </div>
          {!checklistsCollapsed && (
            <div className="animate-fade-in">
              {checklists.map((cl) => (
                <ChecklistCard
                  key={cl.id}
                  taskId={task.id}
                  checklist={cl}
                  editing={editingChecklistId === cl.id}
                  onStartEdit={() => setEditingChecklistId(cl.id)}
                  onDoneEdit={() => setEditingChecklistId(null)}
                />
              ))}
              <button
                onClick={createChecklist}
                className="mt-1.5 ml-6 flex h-7 cursor-pointer items-center gap-1.5 text-[13px] text-ink-faint hover:text-ink-soft"
              >
                <Plus size={13} />
                Add checklist
              </button>
            </div>
          )}
        </div>
      ) : (
        <ActionRow icon={ListChecks} label="Create checklist" onClick={createChecklist} />
      )}

      {/* Attach file */}
      <ActionRow
        icon={Paperclip}
        label="Attach file"
        active={Boolean(attachMenu)}
        onClick={openAttachMenu}
      >
        <span
          className={`h-6 w-6 items-center justify-center rounded-md text-ink-faint ${
            attachMenu ? 'flex' : 'hidden group-hover:flex'
          }`}
        >
          <Plus size={15} />
        </span>
      </ActionRow>

      {/* ---- Add fields: 2-item menu ---- */}
      {fieldsMenu && (
        <Popover pos={fieldsMenu} width={250} onClose={() => setFieldsMenu(null)}>
          <PopoverItem onClick={openTypesMenu}>
            <Plus size={15} className="shrink-0 text-ink-faint" />
            Create a field
          </PopoverItem>
          <PopoverItem
            onClick={() => {
              setFieldsMenu(null)
              comingSoon(notify, 'Workspace fields')
            }}
          >
            <Globe size={15} className="shrink-0 text-ink-faint" />
            Add field from Workspace
          </PopoverItem>
        </Popover>
      )}

      {/* ---- Create a field: searchable 32-type popover ---- */}
      {typesMenu && (
        <Popover pos={typesMenu} width={264} onClose={() => setTypesMenu(null)}>
          <div className="relative p-0.5 pb-1">
            <Search
              size={13}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
            />
            <input
              autoFocus
              value={typeQuery}
              onChange={(e) => setTypeQuery(e.target.value)}
              placeholder="Search..."
              className="h-[30px] w-full rounded-md border border-line-strong pr-2 pl-7 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto pb-0.5">
            {aiTypes.length > 0 && (
              <>
                <div className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-ink-faint">
                  AI Fields
                </div>
                {aiTypes.map((t) => (
                  <FieldTypeRow key={`ai-${t}`} label={t} onPick={pickType} />
                ))}
              </>
            )}
            {allTypes.length > 0 && (
              <>
                <div className="px-2 pt-1.5 pb-0.5 text-[11px] font-medium text-ink-faint">All</div>
                {allTypes.map((t) => (
                  <FieldTypeRow key={`all-${t}`} label={t} onPick={pickType} />
                ))}
              </>
            )}
          </div>
        </Popover>
      )}

      {/* ---- Relate items popover ---- */}
      {relateMenu && (
        <Popover pos={relateMenu} width={250} onClose={() => setRelateMenu(null)}>
          <div className="mb-1 rounded-lg border border-line">
            <PopoverItem onClick={relateSoon}>
              <Link2 size={15} className="shrink-0 text-ink-faint" />
              Relate a Task or Doc
            </PopoverItem>
          </div>
          <PopoverItem onClick={relateSoon}>
            <CircleMinus size={15} fill="#d8354f" className="shrink-0 text-white" />
            This task blocks...
          </PopoverItem>
          <PopoverItem onClick={relateSoon}>
            <TriangleAlert size={15} className="shrink-0 text-[#e8a33d]" />
            This task is blocked by...
          </PopoverItem>
          <div className="my-1 border-t border-line" />
          <PopoverItem onClick={openRelDialog}>
            <Plus size={15} className="shrink-0 text-ink-faint" />
            New custom relationship
          </PopoverItem>
        </Popover>
      )}

      {/* ---- Relationship dialog ---- */}
      {relDialogPos && (
        <RelationshipDialog pos={relDialogPos} onClose={() => setRelDialogPos(null)} />
      )}

      {/* ---- Attach file menu ---- */}
      {attachMenu && (
        <Popover pos={attachMenu} width={200} onClose={() => setAttachMenu(null)}>
          {ATTACH_ITEMS.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setAttachMenu(null)
                comingSoon(notify, it.label)
              }}
              className="flex h-[30px] w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[13px] text-ink hover:bg-hover"
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
            </button>
          ))}
        </Popover>
      )}
    </div>
  )
}
