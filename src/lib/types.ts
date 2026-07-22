export type TabId = 'primary' | 'other' | 'later' | 'cleared'

export interface User {
  id: string
  name: string
  initials: string
  color: string
  deactivated?: boolean
}

export interface Channel {
  id: string
  name: string
  /** Muted suffix rendered after the name, e.g. "- Techjays" */
  suffix?: string
  /** 'filled' renders a dark filled square behind the hash (like #General) */
  iconStyle?: 'filled'
}

export type FolderItemIcon = 'sprint' | 'whiteboard' | 'list'

export interface FolderItem {
  id: string
  name: string
  icon: FolderItemIcon
  count?: number
  /** 'pill' renders a filled pink pill (like Sprint 4's "35"), 'plain' a bare number */
  countStyle?: 'plain' | 'pill'
  /** Sprint header meta shown on sprint cards and the sprint list breadcrumb */
  sprintMeta?: {
    done?: boolean
    range: string
    notEst: number
    descriptionTitle?: string
    descriptionText?: string
  }
}

export interface SpaceFolder {
  id: string
  name: string
  items: FolderItem[]
}

export interface Space {
  id: string
  name: string
  abbr: string
  color: string
  isPrivate: boolean
  folders: SpaceFolder[]
  /** Direct children of the space, rendered after its folders (lists, whiteboards) */
  items: FolderItem[]
}

export type SegmentStyle = 'normal' | 'bold' | 'link' | 'mention' | 'code' | 'boldItalic'

export interface RichSegment {
  text: string
  style?: SegmentStyle
}

export type NotifIcon =
  | { kind: 'space' }
  | { kind: 'access' }
  | { kind: 'status'; color: string }
  | { kind: 'clock'; color: string }
  | { kind: 'channel' }

export type NotifAvatar =
  | { kind: 'user'; userId: string }
  | { kind: 'dot'; color: string }

export interface AppNotification {
  id: string
  tab: 'primary' | 'other'
  group: string
  icon: NotifIcon
  title: string
  titleIcon?: 'share'
  avatar?: NotifAvatar
  preview: RichSegment[]
  attachment?: { label: string }
  count: number
  timeLabel: string
  read: boolean
  cleared: boolean
  later: boolean
}

// ---- Tasks & views ----

export type StatusGroup = 'not-started' | 'active' | 'done' | 'closed'

export interface TaskStatus {
  id: string
  label: string
  /** Canonical color used for pill bg, row status icon, and dropdown glyph */
  color: string
  group: StatusGroup
  /** 'outline' renders a white pill with gray border/text (TO DO style) */
  style?: 'outline'
  /** Table view renders this status as an outline pill (colored icon/text) */
  tableStyle?: 'outline'
}

export interface WorkspaceTag {
  id: string
  label: string
  bg: string
  text: string
  /** 'filled' = solid bg + white text (board/sprint chips); 'soft' = tinted bg */
  chip?: 'filled' | 'soft'
}

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'

export type DocBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'sub'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'numbered'; items: string[] }

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
}

export type ActivityEntry =
  | {
      kind: 'event'
      id: string
      /** Plain text; an optional blue link segment is appended after it */
      text: string
      link?: string
      timeLabel: string
      /** Collapsed under a "Show more" toggle */
      hidden?: boolean
    }
  | {
      kind: 'comment'
      id: string
      userId: string
      timeLabel: string
      /** "@Name" substrings render as purple mentions */
      body: string
    }

export interface Task {
  id: string
  /** FolderItem id of the sprint/list this task lives in */
  listId: string
  name: string
  statusId: string
  /** Set for subtasks — id of the parent task (same listId) */
  parentId?: string
  subtaskCount?: number
  hasDescription?: boolean
  assigneeIds?: string[]
  /** e.g. "12/5/25" or "11/28/25 4:00 pm" */
  dueDate?: string
  dueOverdue?: boolean
  /** Green completed-date styling (board/table) */
  dueDone?: boolean
  attachmentCount?: number
  /** Renders a small embedded attachment-preview block on board cards */
  imagePreview?: boolean
  priority?: TaskPriority
  estimateHours?: number
  tags?: string[]
  /** ClickUp-style public id, e.g. "#86d1gzq48" */
  codeId?: string
  /** e.g. "Jan 8" or "Nov 20 2025" */
  createdLabel?: string
  description?: DocBlock[]
  sprintPoints?: number
  checklists?: Checklist[]
  activity?: ActivityEntry[]
  /** Stagger some field values into the second load pass (like the video) */
  loadDelayed?: boolean
}

export interface DocItem {
  id: string
  name: string
  location: string
}

export type SpaceView =
  | 'overview'
  | 'list'
  | 'board'
  | 'timeline'
  | 'workload'
  | 'table'
  | 'sprint-reporting'
