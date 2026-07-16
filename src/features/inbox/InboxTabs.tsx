import { Activity, CheckCheck, Clock, Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TabId } from '../../lib/types'
import { unreadCountForTab, useAppStore } from '../../lib/store'

interface TabDef {
  id: TabId
  label: string
  icon: LucideIcon
  /** Primary/Other get the two-line treatment with an unread sublabel */
  twoLine: boolean
  /** Hairline divider on the right edge (first two tabs) */
  divider: boolean
}

const TABS: TabDef[] = [
  { id: 'primary', label: 'Primary', icon: Inbox, twoLine: true, divider: true },
  { id: 'other', label: 'Other', icon: Activity, twoLine: true, divider: true },
  { id: 'later', label: 'Later', icon: Clock, twoLine: false, divider: false },
  { id: 'cleared', label: 'Cleared', icon: CheckCheck, twoLine: false, divider: false },
]

export function InboxTabs() {
  const notifications = useAppStore((s) => s.notifications)
  const activeTab = useAppStore((s) => s.activeTab)
  const setActiveTab = useAppStore((s) => s.setActiveTab)

  return (
    <div className="flex h-[54px] shrink-0 border-b border-line">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const unread = unreadCountForTab(notifications, tab.id)
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex h-full cursor-pointer items-center gap-2.5 px-6 hover:bg-hover ${
              tab.divider ? 'border-r border-line' : ''
            }`}
          >
            <Icon className="h-4 w-4 text-ink-soft" />
            {tab.twoLine ? (
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[13.5px] font-semibold text-ink">{tab.label}</span>
                {unread > 0 && (
                  <span className="text-[11.5px] text-ink-faint">{unread} unread</span>
                )}
              </span>
            ) : (
              <span className="text-[13.5px] font-medium text-ink-soft">{tab.label}</span>
            )}
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 ${
                active ? 'bg-ink' : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
