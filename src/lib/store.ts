import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppNotification,
  Channel,
  DocItem,
  FolderItem,
  Space,
  SpaceFolder,
  TabId,
  Task,
  TaskPriority,
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

export interface Toast {
  id: number
  message: string
}

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
  searchOpen: boolean
  inboxUnreadOnly: boolean
  favorites: string[]
  toasts: Toast[]

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
  addFolderToSpace: (spaceId: string, kind: 'folder' | 'sprintFolder') => void
  addSprintToFolder: (spaceId: string, folderId: string) => void
  setSearchOpen: (open: boolean) => void
  toggleInboxUnreadOnly: () => void
  toggleFavorite: (id: string) => void
  notify: (message: string) => void
  dismissToast: (id: number) => void

  setTaskStatus: (taskId: string, statusId: string) => void
  setTaskAssignee: (taskId: string, userId: string | undefined) => void
  setTaskDueDate: (taskId: string, isoDate: string | undefined) => void
  setTaskPriority: (taskId: string, priority: TaskPriority | undefined) => void
  setTaskEstimate: (taskId: string, hours: number | undefined) => void
  addTask: (listId: string, statusId: string, name: string) => void
}

const SPACE_COLORS = ['#2ea44f', '#e8871e', '#d6336c', '#4194f6', '#0f7f70', '#7b68ee']

const partializeState = (s: AppState) => ({
  notifications: s.notifications,
  tasks: s.tasks,
  spaces: s.spaces,
  favorites: s.favorites,
  bannerDismissed: s.bannerDismissed,
  inboxUnreadOnly: s.inboxUnreadOnly,
})
type PersistedState = ReturnType<typeof partializeState>

let toastSeq = 0
let idSeq = 0
const freshId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++idSeq}`

function patchTask(tasks: Task[], taskId: string, patch: Partial<Task>) {
  return tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      searchOpen: false,
      inboxUnreadOnly: false,
      favorites: [],
      toasts: [],

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
            effectiveTab(n) === s.activeTab
              ? { ...n, cleared: true, later: false, read: true }
              : n,
          ),
        })),
      openCreateSpace: () => set({ createSpaceOpen: true }),
      closeCreateSpace: () => set({ createSpaceOpen: false }),
      createSpace: (name, _description, isPrivate) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          const space: Space = {
            id: freshId('space'),
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
                    { id: freshId('list'), name: 'List', icon: 'list' as const },
                  ],
                }
              : sp,
          ),
        })),
      addFolderToSpace: (spaceId, kind) =>
        set((s) => ({
          spaces: s.spaces.map((sp) => {
            if (sp.id !== spaceId) return sp
            const folder: SpaceFolder =
              kind === 'folder'
                ? { id: freshId('folder'), name: 'Folder', items: [] }
                : {
                    id: freshId('sprints'),
                    name: 'Sprints',
                    items: [
                      { id: freshId('sprint'), name: 'Sprint 1', icon: 'sprint' as const },
                    ],
                  }
            return { ...sp, folders: [...sp.folders, folder] }
          }),
        })),
      addSprintToFolder: (spaceId, folderId) =>
        set((s) => ({
          spaces: s.spaces.map((sp) =>
            sp.id === spaceId
              ? {
                  ...sp,
                  folders: sp.folders.map((f) => {
                    if (f.id !== folderId) return f
                    const sprintCount = f.items.filter((i) => i.icon === 'sprint').length
                    return {
                      ...f,
                      items: [
                        ...f.items,
                        {
                          id: freshId('sprint'),
                          name: `Sprint ${sprintCount + 1}`,
                          icon: 'sprint' as const,
                        },
                      ],
                    }
                  }),
                }
              : sp,
          ),
        })),
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleInboxUnreadOnly: () => set((s) => ({ inboxUnreadOnly: !s.inboxUnreadOnly })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      notify: (message) =>
        set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      setTaskStatus: (taskId, statusId) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { statusId }) })),
      setTaskAssignee: (taskId, userId) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { assigneeId: userId }) })),
      setTaskDueDate: (taskId, isoDate) =>
        set((s) => ({
          tasks: patchTask(
            s.tasks,
            taskId,
            isoDate
              ? { dueDate: formatDueDate(isoDate), dueOverdue: isOverdue(isoDate) }
              : { dueDate: undefined, dueOverdue: undefined },
          ),
        })),
      setTaskPriority: (taskId, priority) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { priority }) })),
      setTaskEstimate: (taskId, hours) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { estimateHours: hours }) })),
      addTask: (listId, statusId, name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          return {
            tasks: [...s.tasks, { id: freshId('task'), listId, statusId, name: trimmed }],
          }
        }),
    }),
    {
      name: 'pm-tracker-store',
      version: 1,
      partialize: partializeState,
      // Older persisted shapes are discarded so new seed data ships cleanly.
      migrate: (persisted, version) =>
        (version === 1 ? persisted : {}) as PersistedState,
    },
  ),
)

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

// ---- Task selectors & helpers ----

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

/** "2026-02-12" → "2/12/26" (ClickUp-style short date). */
export function formatDueDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`
}

export function isOverdue(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: '#d8354f' },
  high: { label: 'High', color: '#e8a33d' },
  normal: { label: 'Normal', color: '#4a80f5' },
  low: { label: 'Low', color: '#87909e' },
}

/** Standard toast for affordances whose full screen isn't replicated yet. */
export function comingSoon(notify: (m: string) => void, what: string) {
  notify(`${what} is next on the build list — share a screenshot of it to replicate it.`)
}

export type { FolderItem, TaskPriority }
