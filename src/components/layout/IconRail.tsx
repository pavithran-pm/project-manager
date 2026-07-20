import {
  CalendarDays,
  House,
  LayoutDashboard,
  LayoutGrid,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { CountBadge } from '../ui/CountBadge'
import { unreadCountForTab, useAppStore } from '../../lib/store'

const items = [
  { label: 'Home', to: '/home', icon: House },
  { label: 'Planner', to: '/planner', icon: CalendarDays },
  { label: 'AI', to: '/ai', icon: Sparkles },
  { label: 'Teams', to: '/teams', icon: UsersRound },
  { label: 'Dashboard', to: '/dashboards', icon: LayoutDashboard },
  { label: 'More', to: '/more', icon: LayoutGrid },
] as const

export function IconRail() {
  const notifications = useAppStore((s) => s.notifications)
  const homeUnread = unreadCountForTab(notifications, 'primary')
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-0.5 border-r border-line bg-white py-1.5">
      {sidebarCollapsed && (
        <button
          type="button"
          aria-label="Expand sidebar"
          onClick={toggleSidebar}
          className="mb-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex w-12 cursor-pointer flex-col items-center gap-0.5 rounded-md py-1.5 hover:bg-hover ${
              isActive ? 'font-medium text-brand-deep' : 'text-ink-soft'
            }`
          }
        >
          <span className="relative">
            <Icon className="h-5 w-5" />
            {label === 'Home' && homeUnread > 0 && (
              <span className="absolute -top-1.5 -right-2">
                <CountBadge value={homeUnread} variant="red" />
              </span>
            )}
          </span>
          <span className="text-[10px]">{label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/more"
        className="mt-auto flex w-12 cursor-pointer flex-col items-center gap-0.5 rounded-md py-1.5 text-ink-soft hover:bg-hover"
      >
        <UserRoundPlus className="h-5 w-5" />
        <span className="text-[10px]">Invite</span>
      </NavLink>
    </nav>
  )
}
