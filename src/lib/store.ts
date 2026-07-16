import { create } from 'zustand'
import type { AppNotification, Channel, Space, TabId, User } from './types'
import {
  channels as seedChannels,
  currentUserId,
  dmUserIds,
  notifications as seedNotifications,
  spaces as seedSpaces,
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
  notifications: AppNotification[]
  activeTab: TabId
  bannerDismissed: boolean

  setActiveTab: (tab: TabId) => void
  dismissBanner: () => void
  markRead: (id: string) => void
  clearNotification: (id: string) => void
  moveToLater: (id: string) => void
  clearAll: () => void
}

export const useAppStore = create<AppState>((set) => ({
  workspaceName: WORKSPACE_NAME,
  users: seedUsers,
  currentUserId,
  dmUserIds,
  channels: seedChannels,
  spaces: seedSpaces,
  notifications: seedNotifications,
  activeTab: 'primary',
  bannerDismissed: false,

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
