import { create } from 'zustand'
import type {
  AppNotification,
  Channel,
  DocItem,
  FolderItem,
  Space,
  SpaceFolder,
  TabId,
  Task,
  TaskStatus,
  User,
} from './types'
import {
  channels as seedChannels,
  currentUserId,
  dmUserIds,
  docs as seedDocs,
  notifications as seedNotifications,
  spaces as seedSpaces,
  statusOrder,
  taskStatuses as seedStatuses,
  tasks as seedTasks,
  users as seedUsers,
  WORKSPACE_NAME,
} from './seed'

interface AppState {
  workspaceName: string
  users: Record<string, User>
  currentUserId: string
  dmUserIds: string[]
  channels: Channel[]
  spaces: Space[]
  docs: DocItem[]
  tasks: Task[]
  taskStatuses: Record<string, TaskStatus>
  notifications: AppNotification[]
  activeTab: TabId
  bannerDismissed: boolean
  createSpaceOpen: boolean

  setActiveTab: (tab: TabId) => void
  dismissBanner: () => void
  markRead: (id: string) => void
  clearNotification: (id: string) => void
  moveToLater: (id: string) => void
  clearAll: () => void
  openCreateSpace: () => void
  closeCreateSpace: () => void
  createSpace: (name: string, description: string, isPrivate: boolean) => void
  addListToSpace: (spaceId: string) => void
}

const SPACE_COLORS = ['#2ea44f', '#e8871e', '#d6336c', '#4194f6', '#0f7f70', '#7b68ee']

export const useAppStore = create<AppState>((set) => ({
  workspaceName: WORKSPACE_NAME,
  users: seedUsers,
  currentUserId,
  dmUserIds,
  channels: seedChannels,
  spaces: seedSpaces,
  docs: seedDocs,
  tasks: seedTasks,
  taskStatuses: seedStatuses,
  notifications: seedNotifications,
  activeTab: 'primary',
  bannerDismissed: false,
  createSpaceOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  dismissBanner: () => set({ bannerDismissed: true }),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  clearNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, cleared: true, later: false, read: true } : n,
      ),
    })),
  moveToLater: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, later: true, read: true } : n,
      ),
    })),
  clearAll: () =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        effectiveTab(n) === s.activeTab ? { ...n, cleared: true, later: false, read: true } : n,
      ),
    })),
  openCreateSpace: () => set({ createSpaceOpen: true }),
  closeCreateSpace: () => set({ createSpaceOpen: false }),
  createSpace: (name, _description, isPrivate) =>
    set((s) => {
      const trimmed = name.trim()
      if (!trimmed) return s
      const id = `space-${s.spaces.length + 1}-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      const space: Space = {
        id,
        name: trimmed,
        abbr: trimmed.charAt(0).toUpperCase(),
        color: SPACE_COLORS[s.spaces.length % SPACE_COLORS.length],
        isPrivate,
        folders: [],
        items: [],
      }
      return { spaces: [...s.spaces, space], createSpaceOpen: false }
    }),
  addListToSpace: (spaceId) =>
    set((s) => ({
      spaces: s.spaces.map((sp) =>
        sp.id === spaceId
          ? {
              ...sp,
              items: [
                ...sp.items,
                { id: `${spaceId}-list-${sp.items.length + 1}`, name: 'List', icon: 'list' as const },
              ],
            }
          : sp,
      ),
    })),
}))

/** Which tab a notification currently lives in (cleared/later override its origin). */
export function effectiveTab(n: AppNotification): TabId {
  if (n.cleared) return 'cleared'
  if (n.later) return 'later'
  return n.tab
}

export function notificationsForTab(notifications: AppNotification[], tab: TabId) {
  return notifications.filter((n) => effectiveTab(n) === tab)
}

export function unreadCountForTab(notifications: AppNotification[], tab: TabId) {
  return notifications.filter((n) => effectiveTab(n) === tab && !n.read).length
}

/** Group notifications preserving seed order of group labels ("Today", "January", ...). */
export function groupNotifications(list: AppNotification[]) {
  const groups: { label: string; items: AppNotification[] }[] = []
  for (const n of list) {
    const g = groups.find((x) => x.label === n.group)
    if (g) g.items.push(n)
    else groups.push({ label: n.group, items: [n] })
  }
  return groups
}

// ---- Task selectors ----

export function tasksForLists(tasks: Task[], listIds: string[]) {
  return tasks.filter((t) => listIds.includes(t.listId))
}

/** Group tasks by status, ordered by the canonical statusOrder; empty groups omitted. */
export function groupTasksByStatus(tasks: Task[], statuses: Record<string, TaskStatus>) {
  return statusOrder
    .map((statusId) => ({
      status: statuses[statusId],
      items: tasks.filter((t) => t.statusId === statusId),
    }))
    .filter((g) => g.items.length > 0)
}

/** Rollup numbers for a list view's summary cards and banner. */
export function listStats(tasks: Task[]) {
  return {
    total: tasks.length,
    unfinished: tasks.filter((t) => t.statusId !== 'complete' && t.statusId !== 'devCompleted')
      .length,
    missingAssignee: tasks.filter((t) => !t.assigneeId).length,
    missingEffort: tasks.filter((t) => t.estimateHours === undefined).length,
  }
}

/** Locate a folder-or-space item by id for breadcrumbs/navigation. */
export function findListItem(spaces: Space[], listId: string) {
  for (const space of spaces) {
    for (const folder of space.folders) {
      const item = folder.items.find((i) => i.id === listId)
      if (item) return { space, folder, item }
    }
    const item = space.items.find((i) => i.id === listId)
    if (item) return { space, folder: undefined as SpaceFolder | undefined, item }
  }
  return undefined
}

/** Locate a folder by id. */
export function findFolder(spaces: Space[], folderId: string) {
  for (const space of spaces) {
    const folder = space.folders.find((f) => f.id === folderId)
    if (folder) return { space, folder }
  }
  return undefined
}

export type { FolderItem }
