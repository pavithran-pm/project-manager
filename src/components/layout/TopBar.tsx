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
import { useAppStore } from '../../lib/store'

function GhostIconButton({ icon: Icon, title }: { icon: typeof Calendar; title: string }) {
  return (
    <button
      type="button"
      title={title}
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
  const currentUser = users[currentUserId]

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-line bg-white px-2.5">
      {/* Left zone */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover"
        >
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#7b68ee] to-[#a05fe8] text-[12px] font-bold text-white">
            {workspaceName.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-ink">{workspaceName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        <GhostIconButton icon={Calendar} title="Calendar" />
      </div>

      {/* Center zone */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-2">
        <button
          type="button"
          className="flex h-8 w-[420px] max-w-full cursor-pointer items-center rounded-full border border-line-strong bg-panel hover:bg-hover"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
            <span className="truncate text-[13px] text-ink-faint">Search</span>
            <span className="shrink-0 text-[11px] text-ink-faint">Ctrl+K</span>
          </span>
          <span className="flex h-full shrink-0 items-center gap-1.5 border-l border-line-strong px-3">
            <span className="text-[13px] text-ink">AI Chats</span>
            <Sparkles className="h-3.5 w-3.5 text-[#b15de8]" />
          </span>
        </button>
      </div>

      {/* Right zone */}
      <div className="flex items-center gap-1">
        <GhostIconButton icon={CircleCheckBig} title="Tasks" />
        <GhostIconButton icon={Video} title="Record" />
        <GhostIconButton icon={Mic} title="Voice" />
        <Avatar
          initials={currentUser.initials}
          color={currentUser.color}
          size={26}
          presence
          title={currentUser.name}
        />
      </div>
    </header>
  )
}
