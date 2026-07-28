import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityEntry,
  AppNotification,
  Channel,
  Checklist,
  DocItem,
  FolderItem,
  Space,
  SpaceFolder,
  StatusGroup,
  TabId,
  Task,
  TaskPriority,
  TaskStatus,
  User,
  WorkspaceTag,
} from './types'
import {
  channels as seedChannels,
  currentUserId,
  defaultGroupCollapse,
  dmUserIds,
  docs as seedDocs,
  notifications as seedNotifications,
  spaces as seedSpaces,
  statusOrder,
  taskStatuses as seedStatuses,
  tasks as seedTasks,
  users as seedUsers,
  WORKSPACE_NAME,
  workspaceTags as seedTags,
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
  workspaceTags: Record<string, WorkspaceTag>
  notifications: AppNotification[]
  activeTab: TabId
  bannerDismissed: boolean
  createSpaceOpen: boolean
  searchOpen: boolean
  inboxUnreadOnly: boolean
  favorites: string[]
  toasts: Toast[]
  /** listId → collapsed statusIds */
  groupCollapse: Record<string, string[]>
  /** Task open in the global task modal */
  selectedTaskId: string | null
  /** Sidebar collapsed to the thin icon rail */
  sidebarCollapsed: boolean
  /** listId the New Task modal was opened for (null = closed) */
  newTaskFor: string | null
  /** Customize-view side panel open */
  customizeViewOpen: boolean
  /** spaceId the Create Sprint Folder wizard is open for (null = closed) */
  createSprintFolderFor: string | null
  /** spaceId the Create Folder modal is open for (null = closed) */
  createFolderFor: string | null
  /** Task statuses editor open */
  statusesOpen: boolean
  /** Ephemeral multi-select for bulk drag / actions in list & board views. */
  selectedTaskIds: string[]
  /** Anchor for shift-click range selection. */
  lastSelectedTaskId: string | null

  setActiveTab: (tab: TabId) => void
  dismissBanner: () => void
  markRead: (id: string) => void
  clearNotification: (id: string) => void
  moveToLater: (id: string) => void
  clearAll: () => void
  openCreateSpace: () => void
  closeCreateSpace: () => void
  createSpace: (name: string, description: string, isPrivate: boolean, color?: string) => void
  addListToSpace: (spaceId: string) => void
  addFolderToSpace: (spaceId: string, kind: 'folder' | 'sprintFolder') => void
  addSprintToFolder: (spaceId: string, folderId: string) => void
  /** Reorder / move a folder item (sprint, list, whiteboard) within or across containers. */
  moveFolderItem: (
    itemId: string,
    target: { spaceId: string; folderId?: string; beforeItemId?: string },
  ) => void
  /** Reorder a folder within its space (dropping before `beforeFolderId`, else append). */
  moveFolder: (folderId: string, target: { spaceId: string; beforeFolderId?: string }) => void
  /** Reorder a space (dropping before `beforeSpaceId`, else append). */
  moveSpace: (spaceId: string, beforeSpaceId?: string) => void
  /** Rename a space / folder / folder-item (list, sprint, whiteboard). */
  renameSpace: (spaceId: string, name: string) => void
  renameFolder: (folderId: string, name: string) => void
  renameFolderItem: (itemId: string, name: string) => void
  /** Delete a space / folder / folder-item, cascading to its tasks & favorites. */
  deleteSpace: (spaceId: string) => void
  deleteFolder: (folderId: string) => void
  deleteFolderItem: (itemId: string) => void
  /** Duplicate a folder / folder-item next to the original (fresh ids, no tasks copied). */
  duplicateFolder: (folderId: string) => void
  duplicateFolderItem: (itemId: string) => void
  setSearchOpen: (open: boolean) => void
  toggleInboxUnreadOnly: () => void
  toggleFavorite: (id: string) => void
  notify: (message: string) => void
  dismissToast: (id: number) => void
  toggleGroup: (listId: string, statusId: string) => void
  openTask: (taskId: string) => void
  closeTask: () => void
  toggleSidebar: () => void
  openNewTask: (listId: string) => void
  closeNewTask: () => void
  setCustomizeViewOpen: (open: boolean) => void
  openCreateSprintFolder: (spaceId: string) => void
  closeCreateSprintFolder: () => void
  /** Create a Sprint Folder with `sprintCount` sprints named "Sprint 1..N". */
  createSprintFolder: (spaceId: string, name: string, sprintCount: number) => void
  openCreateFolder: (spaceId: string) => void
  closeCreateFolder: () => void
  createFolder: (spaceId: string, name: string) => void
  openStatuses: () => void
  closeStatuses: () => void
  /** Add / rename / recolor a status in the global registry (Task statuses editor). */
  addTaskStatus: (group: StatusGroup, label: string, color: string) => void
  renameTaskStatus: (statusId: string, label: string) => void
  setTaskStatusColor: (statusId: string, color: string) => void

  setTaskStatus: (taskId: string, statusId: string) => void
  /** Move one or more tasks to a list+status, optionally reordering before a task. */
  moveTasks: (
    taskIds: string[],
    target: { listId: string; statusId: string; beforeTaskId?: string },
  ) => void
  toggleTaskSelected: (id: string) => void
  selectTaskRange: (id: string, orderedIds: string[]) => void
  clearTaskSelection: () => void
  toggleTaskAssignee: (taskId: string, userId: string) => void
  clearTaskAssignees: (taskId: string) => void
  setTaskDueDate: (taskId: string, isoDate: string | undefined) => void
  setTaskPriority: (taskId: string, priority: TaskPriority | undefined) => void
  setTaskEstimate: (taskId: string, hours: number | undefined) => void
  setTaskTags: (taskId: string, tags: string[]) => void
  addTask: (listId: string, statusId: string, name: string) => void
  addSubtask: (parentId: string, name: string) => void
  addChecklist: (taskId: string) => void
  renameChecklist: (taskId: string, checklistId: string, title: string) => void
  addChecklistItem: (taskId: string, checklistId: string, text: string) => void
  toggleChecklistItem: (taskId: string, checklistId: string, itemId: string) => void
  addComment: (taskId: string, body: string) => void
}

const SPACE_COLORS = ['#2ea44f', '#e8871e', '#d6336c', '#4194f6', '#0f7f70', '#7b68ee']

const partializeState = (s: AppState) => ({
  notifications: s.notifications,
  tasks: s.tasks,
  spaces: s.spaces,
  taskStatuses: s.taskStatuses,
  favorites: s.favorites,
  bannerDismissed: s.bannerDismissed,
  inboxUnreadOnly: s.inboxUnreadOnly,
  groupCollapse: s.groupCollapse,
})
type PersistedState = ReturnType<typeof partializeState>

let toastSeq = 0
let idSeq = 0
const freshId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++idSeq}`

function patchTask(tasks: Task[], taskId: string, patch: Partial<Task>) {
  return tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
}

/** Insert `el` before the entry with `beforeId` (append when absent/undefined). */
function insertBefore<T extends { id: string }>(arr: T[], el: T, beforeId?: string): T[] {
  if (!beforeId) return [...arr, el]
  const idx = arr.findIndex((x) => x.id === beforeId)
  if (idx < 0) return [...arr, el]
  return [...arr.slice(0, idx), el, ...arr.slice(idx)]
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
      workspaceTags: seedTags,
      notifications: seedNotifications,
      activeTab: 'primary',
      bannerDismissed: false,
      createSpaceOpen: false,
      searchOpen: false,
      inboxUnreadOnly: false,
      favorites: [],
      toasts: [],
      groupCollapse: defaultGroupCollapse,
      selectedTaskId: null,
      sidebarCollapsed: false,
      newTaskFor: null,
      customizeViewOpen: false,
      createSprintFolderFor: null,
      createFolderFor: null,
      statusesOpen: false,
      selectedTaskIds: [],
      lastSelectedTaskId: null,

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
      createSpace: (name, _description, isPrivate, color) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          const space: Space = {
            id: freshId('space'),
            name: trimmed,
            abbr: trimmed.charAt(0).toUpperCase(),
            color: color ?? SPACE_COLORS[s.spaces.length % SPACE_COLORS.length],
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
                  items: [...sp.items, { id: freshId('list'), name: 'List', icon: 'list' as const }],
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
                    items: [{ id: freshId('sprint'), name: 'Sprint 1', icon: 'sprint' as const }],
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
      moveFolderItem: (itemId, target) =>
        set((s) => {
          // 1. Detach the item from wherever it currently lives.
          let moved: FolderItem | undefined
          const detached = s.spaces.map((sp) => ({
            ...sp,
            folders: sp.folders.map((f) => {
              const found = f.items.find((i) => i.id === itemId)
              if (!found) return f
              moved = found
              return { ...f, items: f.items.filter((i) => i.id !== itemId) }
            }),
            items: (() => {
              const found = sp.items.find((i) => i.id === itemId)
              if (!found) return sp.items
              moved = found
              return sp.items.filter((i) => i.id !== itemId)
            })(),
          }))
          if (!moved) return s
          if (target.beforeItemId === itemId) return s
          // 2. Insert it into the target container.
          const item = moved
          const spaces = detached.map((sp) => {
            if (sp.id !== target.spaceId) return sp
            if (target.folderId) {
              return {
                ...sp,
                folders: sp.folders.map((f) =>
                  f.id === target.folderId
                    ? { ...f, items: insertBefore(f.items, item, target.beforeItemId) }
                    : f,
                ),
              }
            }
            return { ...sp, items: insertBefore(sp.items, item, target.beforeItemId) }
          })
          return { spaces }
        }),
      moveFolder: (folderId, target) =>
        set((s) => {
          let moved: SpaceFolder | undefined
          const detached = s.spaces.map((sp) => {
            const found = sp.folders.find((f) => f.id === folderId)
            if (!found) return sp
            moved = found
            return { ...sp, folders: sp.folders.filter((f) => f.id !== folderId) }
          })
          if (!moved || target.beforeFolderId === folderId) return s
          const folder = moved
          const spaces = detached.map((sp) =>
            sp.id === target.spaceId
              ? { ...sp, folders: insertBefore(sp.folders, folder, target.beforeFolderId) }
              : sp,
          )
          return { spaces }
        }),
      moveSpace: (spaceId, beforeSpaceId) =>
        set((s) => {
          if (beforeSpaceId === spaceId) return s
          const moved = s.spaces.find((sp) => sp.id === spaceId)
          if (!moved) return s
          const rest = s.spaces.filter((sp) => sp.id !== spaceId)
          return { spaces: insertBefore(rest, moved, beforeSpaceId) }
        }),
      renameSpace: (spaceId, name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          return {
            spaces: s.spaces.map((sp) =>
              sp.id === spaceId ? { ...sp, name: trimmed, abbr: trimmed.charAt(0).toUpperCase() } : sp,
            ),
          }
        }),
      renameFolder: (folderId, name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          return {
            spaces: s.spaces.map((sp) => ({
              ...sp,
              folders: sp.folders.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f)),
            })),
          }
        }),
      renameFolderItem: (itemId, name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          const rename = (items: FolderItem[]) =>
            items.map((i) => (i.id === itemId ? { ...i, name: trimmed } : i))
          return {
            spaces: s.spaces.map((sp) => ({
              ...sp,
              folders: sp.folders.map((f) => ({ ...f, items: rename(f.items) })),
              items: rename(sp.items),
            })),
          }
        }),
      deleteSpace: (spaceId) =>
        set((s) => {
          const sp = s.spaces.find((x) => x.id === spaceId)
          if (!sp) return s
          const listIds = new Set<string>([
            ...sp.items.map((i) => i.id),
            ...sp.folders.flatMap((f) => f.items.map((i) => i.id)),
          ])
          return {
            spaces: s.spaces.filter((x) => x.id !== spaceId),
            tasks: s.tasks.filter((t) => !listIds.has(t.listId)),
            favorites: s.favorites.filter((f) => f !== spaceId && !listIds.has(f)),
          }
        }),
      deleteFolder: (folderId) =>
        set((s) => {
          const found = findFolder(s.spaces, folderId)
          if (!found) return s
          const listIds = new Set(found.folder.items.map((i) => i.id))
          return {
            spaces: s.spaces.map((sp) => ({
              ...sp,
              folders: sp.folders.filter((f) => f.id !== folderId),
            })),
            tasks: s.tasks.filter((t) => !listIds.has(t.listId)),
            favorites: s.favorites.filter((f) => f !== folderId && !listIds.has(f)),
          }
        }),
      deleteFolderItem: (itemId) =>
        set((s) => ({
          spaces: s.spaces.map((sp) => ({
            ...sp,
            folders: sp.folders.map((f) => ({ ...f, items: f.items.filter((i) => i.id !== itemId) })),
            items: sp.items.filter((i) => i.id !== itemId),
          })),
          tasks: s.tasks.filter((t) => t.listId !== itemId),
          favorites: s.favorites.filter((f) => f !== itemId),
        })),
      duplicateFolder: (folderId) =>
        set((s) => {
          let done = false
          const spaces = s.spaces.map((sp) => {
            const idx = sp.folders.findIndex((f) => f.id === folderId)
            if (idx < 0) return sp
            const orig = sp.folders[idx]
            const dup: SpaceFolder = {
              ...orig,
              id: freshId('folder'),
              items: orig.items.map((i) => ({ ...i, id: freshId(i.icon) })),
            }
            done = true
            return {
              ...sp,
              folders: [...sp.folders.slice(0, idx + 1), dup, ...sp.folders.slice(idx + 1)],
            }
          })
          return done ? { spaces } : s
        }),
      duplicateFolderItem: (itemId) =>
        set((s) => {
          let done = false
          const clone = (items: FolderItem[]) => {
            const idx = items.findIndex((i) => i.id === itemId)
            if (idx < 0) return items
            const orig = items[idx]
            done = true
            const dup: FolderItem = { ...orig, id: freshId(orig.icon) }
            return [...items.slice(0, idx + 1), dup, ...items.slice(idx + 1)]
          }
          const spaces = s.spaces.map((sp) => {
            const folders = sp.folders.map((f) => {
              if (done) return f
              const items = clone(f.items)
              return items === f.items ? f : { ...f, items }
            })
            if (done) return { ...sp, folders }
            const items = clone(sp.items)
            return items === sp.items ? { ...sp, folders } : { ...sp, folders, items }
          })
          return done ? { spaces } : s
        }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleInboxUnreadOnly: () => set((s) => ({ inboxUnreadOnly: !s.inboxUnreadOnly })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      notify: (message) => set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message }] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      toggleGroup: (listId, statusId) =>
        set((s) => {
          const cur = s.groupCollapse[listId] ?? []
          return {
            groupCollapse: {
              ...s.groupCollapse,
              [listId]: cur.includes(statusId)
                ? cur.filter((x) => x !== statusId)
                : [...cur, statusId],
            },
          }
        }),
      openTask: (taskId) => set({ selectedTaskId: taskId }),
      closeTask: () => set({ selectedTaskId: null }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openNewTask: (listId) => set({ newTaskFor: listId }),
      closeNewTask: () => set({ newTaskFor: null }),
      setCustomizeViewOpen: (open) => set({ customizeViewOpen: open }),
      openCreateSprintFolder: (spaceId) => set({ createSprintFolderFor: spaceId }),
      closeCreateSprintFolder: () => set({ createSprintFolderFor: null }),
      createSprintFolder: (spaceId, name, sprintCount) =>
        set((s) => {
          const trimmed = name.trim() || 'Sprint Folder'
          const n = Math.max(1, Math.min(Math.floor(sprintCount) || 1, 24))
          const items: FolderItem[] = Array.from({ length: n }, (_, i) => ({
            id: freshId('sprint'),
            name: `Sprint ${i + 1}`,
            icon: 'sprint' as const,
          }))
          const folder: SpaceFolder = { id: freshId('sprints'), name: trimmed, items }
          return {
            spaces: s.spaces.map((sp) =>
              sp.id === spaceId ? { ...sp, folders: [...sp.folders, folder] } : sp,
            ),
            createSprintFolderFor: null,
          }
        }),
      openCreateFolder: (spaceId) => set({ createFolderFor: spaceId }),
      closeCreateFolder: () => set({ createFolderFor: null }),
      createFolder: (spaceId, name) =>
        set((s) => {
          const trimmed = name.trim() || 'Folder'
          const folder: SpaceFolder = { id: freshId('folder'), name: trimmed, items: [] }
          return {
            spaces: s.spaces.map((sp) =>
              sp.id === spaceId ? { ...sp, folders: [...sp.folders, folder] } : sp,
            ),
            createFolderFor: null,
          }
        }),
      openStatuses: () => set({ statusesOpen: true }),
      closeStatuses: () => set({ statusesOpen: false }),
      addTaskStatus: (group, label, color) =>
        set((s) => {
          const trimmed = label.trim()
          if (!trimmed) return s
          const id = freshId('status')
          return { taskStatuses: { ...s.taskStatuses, [id]: { id, label: trimmed, color, group } } }
        }),
      renameTaskStatus: (statusId, label) =>
        set((s) => {
          const trimmed = label.trim()
          const cur = s.taskStatuses[statusId]
          if (!cur || !trimmed) return s
          return { taskStatuses: { ...s.taskStatuses, [statusId]: { ...cur, label: trimmed } } }
        }),
      setTaskStatusColor: (statusId, color) =>
        set((s) => {
          const cur = s.taskStatuses[statusId]
          if (!cur) return s
          return { taskStatuses: { ...s.taskStatuses, [statusId]: { ...cur, color } } }
        }),

      setTaskStatus: (taskId, statusId) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { statusId }) })),
      moveTasks: (taskIds, target) =>
        set((s) => {
          const idSet = new Set(taskIds)
          // Reassign list+status; keep the moved tasks in their existing relative order.
          const moved = s.tasks
            .filter((t) => idSet.has(t.id))
            .map((t) => ({ ...t, listId: target.listId, statusId: target.statusId }))
          if (!moved.length) return s
          const rest = s.tasks.filter((t) => !idSet.has(t.id))
          let insertAt = rest.length
          if (target.beforeTaskId && !idSet.has(target.beforeTaskId)) {
            const idx = rest.findIndex((t) => t.id === target.beforeTaskId)
            if (idx >= 0) insertAt = idx
          }
          return { tasks: [...rest.slice(0, insertAt), ...moved, ...rest.slice(insertAt)] }
        }),
      toggleTaskSelected: (id) =>
        set((s) => ({
          selectedTaskIds: s.selectedTaskIds.includes(id)
            ? s.selectedTaskIds.filter((x) => x !== id)
            : [...s.selectedTaskIds, id],
          lastSelectedTaskId: id,
        })),
      selectTaskRange: (id, orderedIds) =>
        set((s) => {
          const a = s.lastSelectedTaskId ? orderedIds.indexOf(s.lastSelectedTaskId) : -1
          const b = orderedIds.indexOf(id)
          if (a < 0 || b < 0) {
            return {
              selectedTaskIds: s.selectedTaskIds.includes(id)
                ? s.selectedTaskIds
                : [...s.selectedTaskIds, id],
              lastSelectedTaskId: id,
            }
          }
          const [lo, hi] = a < b ? [a, b] : [b, a]
          const range = orderedIds.slice(lo, hi + 1)
          return {
            selectedTaskIds: Array.from(new Set([...s.selectedTaskIds, ...range])),
            lastSelectedTaskId: id,
          }
        }),
      clearTaskSelection: () => set({ selectedTaskIds: [], lastSelectedTaskId: null }),
      toggleTaskAssignee: (taskId, userId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t
            const cur = t.assigneeIds ?? []
            return {
              ...t,
              assigneeIds: cur.includes(userId)
                ? cur.filter((u) => u !== userId)
                : [...cur, userId],
            }
          }),
        })),
      clearTaskAssignees: (taskId) =>
        set((s) => ({ tasks: patchTask(s.tasks, taskId, { assigneeIds: [] }) })),
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
      setTaskTags: (taskId, tags) => set((s) => ({ tasks: patchTask(s.tasks, taskId, { tags }) })),
      addTask: (listId, statusId, name) =>
        set((s) => {
          const trimmed = name.trim()
          if (!trimmed) return s
          return {
            tasks: [...s.tasks, { id: freshId('task'), listId, statusId, name: trimmed }],
          }
        }),
      addSubtask: (parentId, name) =>
        set((s) => {
          const parent = s.tasks.find((t) => t.id === parentId)
          const trimmed = name.trim()
          if (!parent || !trimmed) return s
          return {
            tasks: [
              ...s.tasks.map((t) =>
                t.id === parentId ? { ...t, subtaskCount: (t.subtaskCount ?? 0) + 1 } : t,
              ),
              {
                id: freshId('task'),
                listId: parent.listId,
                statusId: 'toDo',
                name: trimmed,
                parentId,
              },
            ],
          }
        }),
      addChecklist: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklists: [
                    ...(t.checklists ?? []),
                    { id: freshId('cl'), title: 'Checklist', items: [] } as Checklist,
                  ],
                }
              : t,
          ),
        })),
      renameChecklist: (taskId, checklistId, title) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklists: (t.checklists ?? []).map((c) =>
                    c.id === checklistId ? { ...c, title: title.trim() || c.title } : c,
                  ),
                }
              : t,
          ),
        })),
      addChecklistItem: (taskId, checklistId, text) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklists: (t.checklists ?? []).map((c) =>
                    c.id === checklistId && text.trim()
                      ? {
                          ...c,
                          items: [...c.items, { id: freshId('cli'), text: text.trim(), done: false }],
                        }
                      : c,
                  ),
                }
              : t,
          ),
        })),
      toggleChecklistItem: (taskId, checklistId, itemId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklists: (t.checklists ?? []).map((c) =>
                    c.id === checklistId
                      ? {
                          ...c,
                          items: c.items.map((i) =>
                            i.id === itemId ? { ...i, done: !i.done } : i,
                          ),
                        }
                      : c,
                  ),
                }
              : t,
          ),
        })),
      addComment: (taskId, body) =>
        set((s) => {
          const trimmed = body.trim()
          if (!trimmed) return s
          const entry: ActivityEntry = {
            kind: 'comment',
            id: freshId('cm'),
            userId: s.currentUserId,
            timeLabel: 'Just now',
            body: trimmed,
          }
          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, activity: [...(t.activity ?? []), entry] } : t,
            ),
          }
        }),
    }),
    {
      name: 'pm-tracker-store',
      version: 2,
      partialize: partializeState,
      // Older persisted shapes are discarded so new seed data ships cleanly.
      migrate: (persisted, version) => (version === 2 ? persisted : {}) as PersistedState,
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

/** Top-level (non-subtask) tasks for the given lists. */
export function tasksForLists(tasks: Task[], listIds: string[]) {
  return tasks.filter((t) => listIds.includes(t.listId) && !t.parentId)
}

export function subtasksOf(tasks: Task[], parentId: string) {
  return tasks.filter((t) => t.parentId === parentId)
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

/** All statuses grouped into the 4 ClickUp status groups (for the Statuses editor). */
export function statusesByGroup(statuses: Record<string, TaskStatus>) {
  const groups: StatusGroup[] = ['not-started', 'active', 'done', 'closed']
  const ordered = statusOrder.map((id) => statuses[id]).filter(Boolean) as TaskStatus[]
  const extras = Object.values(statuses).filter((st) => !statusOrder.includes(st.id))
  const all = [...ordered, ...extras]
  return groups.map((group) => ({ group, statuses: all.filter((st) => st.group === group) }))
}

/** Rollup numbers for a list view's summary cards and banner. */
export function listStats(tasks: Task[], statuses: Record<string, TaskStatus>) {
  const finished = (t: Task) => {
    const g = statuses[t.statusId]?.group
    return g === 'done' || g === 'closed'
  }
  return {
    total: tasks.length,
    unfinished: tasks.filter((t) => !finished(t)).length,
    missingAssignee: tasks.filter((t) => !t.assigneeIds?.length).length,
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
