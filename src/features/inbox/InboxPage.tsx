import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Check, CheckCheck, Inbox, ListFilter, Settings } from 'lucide-react'
import { Popover, PopoverItem, popoverPosFor } from '../../components/ui/Popover'
import type { PopoverPos } from '../../components/ui/Popover'
import {
  comingSoon,
  groupNotifications,
  notificationsForTab,
  useAppStore,
} from '../../lib/store'
import { PromoBanner } from './PromoBanner'
import { InboxTabs } from './InboxTabs'
import { NotificationRow } from './NotificationRow'

export function InboxPage() {
  const notifications = useAppStore((s) => s.notifications)
  const activeTab = useAppStore((s) => s.activeTab)
  const clearAll = useAppStore((s) => s.clearAll)
  const inboxUnreadOnly = useAppStore((s) => s.inboxUnreadOnly)
  const toggleInboxUnreadOnly = useAppStore((s) => s.toggleInboxUnreadOnly)
  const notify = useAppStore((s) => s.notify)

  const [filterPos, setFilterPos] = useState<PopoverPos | null>(null)

  const visible = notificationsForTab(notifications, activeTab).filter(
    (n) => !inboxUnreadOnly || !n.read,
  )
  const groups = groupNotifications(visible)

  const openFilter = (e: MouseEvent<HTMLButtonElement>) =>
    setFilterPos(popoverPosFor(e.currentTarget, 220))

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <PromoBanner />
      <InboxTabs />

      {/* Toolbar */}
      <div className="flex shrink-0 items-center px-4 py-2.5">
        <button
          type="button"
          onClick={openFilter}
          className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-[13px] hover:bg-hover ${
            inboxUnreadOnly
              ? 'border-brand text-brand-deep'
              : 'border-line-strong text-ink-soft'
          }`}
        >
          <ListFilter className="h-3.5 w-3.5" />
          Filter
          {inboxUnreadOnly && <span className="font-semibold">· 1</span>}
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title="Notification settings"
            onClick={() => comingSoon(notify, 'Notification settings')}
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

      {filterPos && (
        <Popover pos={filterPos} width={220} onClose={() => setFilterPos(null)}>
          <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">
            Filter notifications
          </div>
          <PopoverItem
            selected={inboxUnreadOnly}
            onClick={() => {
              toggleInboxUnreadOnly()
              setFilterPos(null)
            }}
          >
            <span>Unread only</span>
            {inboxUnreadOnly && <Check className="ml-auto h-3.5 w-3.5 text-brand" />}
          </PopoverItem>
        </Popover>
      )}

      {/* Notification list */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-8">
        {groups.length === 0 ? (
          <div className="animate-fade-in flex flex-1 flex-col items-center pt-24">
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
