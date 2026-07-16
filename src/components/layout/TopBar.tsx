import {
  Calendar,
  ChevronDown,
  CircleCheckBig,
  Mic,
  Search,
  Sparkles,
  Video,
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'

function GhostIconButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Calendar
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
    >
      <Icon className="h-4 w-4 text-ink-soft" />
    </button>
  )
}

export function TopBar() {
  const workspaceName = useAppStore((s) => s.workspaceName)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const notify = useAppStore((s) => s.notify)
  const currentUser = users[currentUserId]

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-line bg-white px-2.5">
      {/* Left zone */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => comingSoon(notify, 'The workspace switcher')}
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover"
        >
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#7b68ee] to-[#a05fe8] text-[12px] font-bold text-white">
            {workspaceName.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-ink">{workspaceName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        <GhostIconButton
          icon={Calendar}
          title="Calendar"
          onClick={() => comingSoon(notify, 'The Calendar')}
        />
      </div>

      {/* Center zone */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-2">
        <div className="flex h-8 w-[420px] max-w-full items-center overflow-hidden rounded-full border border-line-strong bg-panel">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 hover:bg-hover"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            <span className="truncate text-[13px] text-ink-faint">Search</span>
            <span className="shrink-0 text-[11px] text-ink-faint">Ctrl+K</span>
          </button>
          <button
            type="button"
            onClick={() => comingSoon(notify, 'AI Chats')}
            className="flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-l border-line-strong px-3 hover:bg-hover"
          >
            <span className="text-[13px] text-ink">AI Chats</span>
            <Sparkles className="h-3.5 w-3.5 text-[#b15de8]" />
          </button>
        </div>
      </div>

      {/* Right zone */}
      <div className="flex items-center gap-1">
        <GhostIconButton
          icon={CircleCheckBig}
          title="Quick task"
          onClick={() => comingSoon(notify, 'Quick task creation')}
        />
        <GhostIconButton
          icon={Video}
          title="Record"
          onClick={() => comingSoon(notify, 'Clip recording')}
        />
        <GhostIconButton
          icon={Mic}
          title="Voice"
          onClick={() => comingSoon(notify, 'Voice notes')}
        />
        <button
          type="button"
          onClick={() => comingSoon(notify, 'The profile menu')}
          className="cursor-pointer rounded-full"
        >
          <Avatar
            initials={currentUser.initials}
            color={currentUser.color}
            size={26}
            presence
            title={currentUser.name}
          />
        </button>
      </div>
    </header>
  )
}
