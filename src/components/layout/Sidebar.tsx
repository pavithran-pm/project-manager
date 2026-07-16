import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AtSign,
  ChevronDown,
  CircleCheckBig,
  Ellipsis,
  Folder,
  Hash,
  Inbox,
  List,
  Lock,
  Plus,
  Presentation,
  Reply,
  Shapes,
  Target,
} from 'lucide-react'
import { unreadCountForTab, useAppStore } from '../../lib/store'
import type { FolderItem, Space, SpaceFolder } from '../../lib/types'
import { Avatar } from '../ui/Avatar'
import { CountBadge } from '../ui/CountBadge'

/** Standard sidebar row: h-8, rounded, hover, 13.5px text. */
function Row({
  active,
  muted,
  onClick,
  children,
}: {
  active?: boolean
  muted?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[13.5px] ${
        muted ? 'text-ink-soft' : 'text-ink'
      } ${active ? 'bg-active-row font-medium' : 'hover:bg-hover'}`}
    >
      {children}
    </button>
  )
}

/** Collapsible section with an uppercase header; starts expanded. */
function Section({
  label,
  trailing,
  children,
}: {
  label: string
  trailing?: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o)
        }}
        className="mt-4 mb-1 flex cursor-pointer items-center px-2 text-[11px] font-semibold tracking-wide text-ink-faint uppercase select-none"
      >
        <span>{label}</span>
        {trailing}
      </div>
      {open && <div className="flex flex-col gap-px">{children}</div>}
    </div>
  )
}

function FolderItemRow({ item }: { item: FolderItem }) {
  const icon =
    item.icon === 'sprint' ? (
      <Target className="h-4 w-4 shrink-0 text-ink-soft" />
    ) : item.icon === 'whiteboard' ? (
      <Presentation className="h-4 w-4 shrink-0 text-[#e8a33d]" />
    ) : (
      <List className="h-4 w-4 shrink-0 text-ink-soft" />
    )
  return (
    <Row>
      {icon}
      <span className="truncate">{item.name}</span>
      {item.count !== undefined && (
        <span className="ml-auto flex shrink-0 items-center">
          <CountBadge value={item.count} variant={item.countStyle === 'pill' ? 'dark' : 'plain'} />
        </span>
      )}
    </Row>
  )
}

/** Folder inside a space; collapsible, starts expanded. */
function FolderBlock({ folder }: { folder: SpaceFolder }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <Row onClick={() => setOpen((o) => !o)}>
        <Folder className="h-4 w-4 shrink-0 text-ink-soft" />
        <span className="truncate">{folder.name}</span>
      </Row>
      {open && (
        <div className="flex flex-col gap-px pl-4">
          {folder.items.map((item) => (
            <FolderItemRow key={item.id} item={item} />
          ))}
          <Row muted>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Create Sprint</span>
          </Row>
        </div>
      )}
    </div>
  )
}

/** Space row + nested folders; collapsible, starts expanded. */
function SpaceBlock({ space }: { space: Space }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o)
        }}
        className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-[13.5px] text-ink select-none hover:bg-hover"
      >
        <Avatar initials={space.abbr} color={space.color} size={20} rounded="md" />
        <span className="truncate font-medium">{space.name}</span>
        {space.isPrivate && <Lock className="h-3 w-3 shrink-0 text-ink-faint" />}
        <button
          type="button"
          aria-label={`Add to ${space.name}`}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5 text-ink-soft" />
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-px pl-4">
          {space.folders.map((folder) => (
            <FolderBlock key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const workspaceName = useAppStore((s) => s.workspaceName)
  const users = useAppStore((s) => s.users)
  const dmUserIds = useAppStore((s) => s.dmUserIds)
  const channels = useAppStore((s) => s.channels)
  const spaces = useAppStore((s) => s.spaces)
  const notifications = useAppStore((s) => s.notifications)

  const primaryUnread = unreadCountForTab(notifications, 'primary')

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-line bg-panel">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between px-3.5">
        <span className="text-[15px] font-semibold text-ink">Home</span>
        <div className="flex items-stretch overflow-hidden rounded-md border border-line-strong bg-white">
          <button
            type="button"
            aria-label="Create"
            className="flex cursor-pointer items-center px-1 py-0.5 hover:bg-hover"
          >
            <Plus className="h-3.5 w-3.5 text-ink-soft" />
          </button>
          <button
            type="button"
            aria-label="Create options"
            className="flex cursor-pointer items-center border-l border-line-strong px-1 py-0.5 hover:bg-hover"
          >
            <ChevronDown className="h-3 w-3 text-ink-soft" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {/* Nav group */}
        <nav className="flex flex-col gap-px">
          <Row active>
            <Inbox className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Inbox</span>
            {primaryUnread > 0 && (
              <span className="ml-auto flex shrink-0 items-center">
                <CountBadge value={primaryUnread} variant="red" />
              </span>
            )}
          </Row>
          <Row>
            <Reply className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Replies</span>
          </Row>
          <Row>
            <AtSign className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Assigned Comments</span>
          </Row>
          <Row>
            <CircleCheckBig className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">My Tasks</span>
          </Row>
          <Row>
            <Ellipsis className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">More</span>
          </Row>
        </nav>

        {/* AI Chats */}
        <Section label="AI Chats">
          <Row muted>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Ask, Build, Create</span>
          </Row>
        </Section>

        {/* Channels */}
        <Section label="Channels">
          {channels.map((channel) => (
            <Row key={channel.id}>
              <Hash className="h-4 w-4 shrink-0 text-ink-soft" />
              <span className="truncate">
                {channel.name}
                {channel.suffix && <span className="text-ink-faint"> - {channel.suffix}</span>}
              </span>
            </Row>
          ))}
          <Row muted>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Add Channel</span>
          </Row>
        </Section>

        {/* Direct Messages */}
        <Section label="Direct Messages">
          {dmUserIds.map((id) => {
            const user = users[id]
            if (!user) return null
            return (
              <Row key={id}>
                <Avatar initials={user.initials} color={user.color} size={20} />
                <span className="truncate">{user.name}</span>
              </Row>
            )
          })}
          <Row muted>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">New message</span>
          </Row>
        </Section>

        {/* Spaces */}
        <Section
          label="Spaces"
          trailing={
            <button
              type="button"
              aria-label="Add Space"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          <Row>
            <Shapes className="h-4 w-4 shrink-0 text-brand" />
            <span className="truncate">
              All Tasks
              <span className="text-ink-faint"> - {workspaceName}</span>
            </span>
          </Row>
          {spaces.map((space) => (
            <SpaceBlock key={space.id} space={space} />
          ))}
        </Section>
      </div>
    </aside>
  )
}
