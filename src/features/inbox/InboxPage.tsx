import { CheckCheck, Inbox, ListFilter, Settings } from 'lucide-react'
import { groupNotifications, notificationsForTab, useAppStore } from '../../lib/store'
import { PromoBanner } from './PromoBanner'
import { InboxTabs } from './InboxTabs'
import { NotificationRow } from './NotificationRow'

export function InboxPage() {
  const notifications = useAppStore((s) => s.notifications)
  const activeTab = useAppStore((s) => s.activeTab)
  const clearAll = useAppStore((s) => s.clearAll)

  const groups = groupNotifications(notificationsForTab(notifications, activeTab))

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <PromoBanner />
      <InboxTabs />

      {/* Toolbar */}
      <div className="flex shrink-0 items-center px-4 py-2.5">
        <button
          type="button"
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-ink-soft hover:bg-hover"
        >
          <ListFilter className="h-3.5 w-3.5" />
          Filter
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title="Settings"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-ink-soft hover:bg-hover"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Clear all
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8">
        {groups.length === 0 ? (
          <div className="flex flex-1 flex-col items-center pt-24">
            <Inbox className="h-10 w-10 text-line-strong" />
            <div className="mt-3 text-[15px] font-semibold text-ink">
              You&apos;re all caught up!
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">
              New notifications will appear here.
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="px-2 pt-4 pb-1.5 text-[13px] font-semibold text-ink">
                {group.label}
              </div>
              {group.items.map((n) => (
                <NotificationRow key={n.id} notification={n} />
              ))}
            </div>
          ))
        )}
      </div>
    </main>
  )
}
