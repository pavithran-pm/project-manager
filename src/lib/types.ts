export type TabId = 'primary' | 'other' | 'later' | 'cleared'

export interface User {
  id: string
  name: string
  initials: string
  color: string
}

export interface Channel {
  id: string
  name: string
  /** Muted suffix rendered after the name, e.g. "- Techjays" */
  suffix?: string
}

export type FolderItemIcon = 'sprint' | 'board' | 'list'

export interface FolderItem {
  id: string
  name: string
  icon: FolderItemIcon
  count?: number
  /** 'pill' renders a dark filled pill (like Sprint 4's "35"), 'plain' a bare number */
  countStyle?: 'plain' | 'pill'
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
}

export type SegmentStyle = 'normal' | 'bold' | 'link' | 'mention' | 'code' | 'boldItalic'

export interface RichSegment {
  text: string
  style?: SegmentStyle
}

export type NotifIcon =
  | { kind: 'space' } // rocket, for "Space shared with you"
  | { kind: 'access' } // gold medal, for access requests
  | { kind: 'status'; color: string } // task status ring
  | { kind: 'clock'; color: string } // due-date / reminder clock
  | { kind: 'channel' } // channel hash

export type NotifAvatar =
  | { kind: 'user'; userId: string }
  | { kind: 'dot'; color: string }

export interface AppNotification {
  id: string
  /** Which inbox tab the notification originally belongs to */
  tab: 'primary' | 'other'
  /** Date group header it renders under, e.g. "Today" or "January" */
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
