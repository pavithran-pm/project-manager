import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AtSign,
  ChevronDown,
  CircleCheckBig,
  CircleDot,
  Ellipsis,
  Folder,
  Hash,
  Inbox,
  ListTodo,
  Lock,
  Plus,
  Reply,
  Shapes,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'
import { comingSoon, unreadCountForTab, useAppStore } from '../../lib/store'
import type { FolderItem, Space, SpaceFolder } from '../../lib/types'
import { Avatar } from '../ui/Avatar'
import { CountBadge } from '../ui/CountBadge'
import { CreateMenu } from '../sidebar/CreateMenu'
import { CreateSpaceModal } from '../sidebar/CreateSpaceModal'

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

/** Collapsible section with a normal-case header; starts expanded. */
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
        className="mt-4 mb-1 flex cursor-pointer items-center px-2 text-[12px] font-semibold text-ink-soft select-none"
      >
        <span>{label}</span>
        {trailing}
      </div>
      {open && <div className="flex flex-col gap-px">{children}</div>}
    </div>
  )
}

/** 16px yellow rounded square with a white zap — whiteboard rows. */
function WhiteboardIcon() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#fbb62b]">
      <Zap className="h-2.5 w-2.5 fill-white text-white" />
    </span>
  )
}

/** Sprint / whiteboard / list row (folder items and space-level items). */
function FolderItemRow({ spaceId, item }: { spaceId: string; item: FolderItem }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const route =
    item.icon === 'whiteboard' ? `/whiteboard/${item.id}` : `/space/${spaceId}/list/${item.id}`
  const active = pathname === route || pathname.startsWith(`${route}/`)

  const icon =
    item.icon === 'sprint' ? (
      <CircleDot className="h-4 w-4 shrink-0 text-[#1f9d61]" />
    ) : item.icon === 'whiteboard' ? (
      <WhiteboardIcon />
    ) : (
      <ListTodo className="h-4 w-4 shrink-0 text-ink-soft" />
    )

  return (
    <Row active={active} onClick={() => navigate(route)}>
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

/** Folder inside a space; collapsible, starts expanded; click navigates to its Overview. */
function FolderBlock({ spaceId, folder }: { spaceId: string; folder: SpaceFolder }) {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const addSprintToFolder = useAppStore((s) => s.addSprintToFolder)
  const route = `/space/${spaceId}/folder/${folder.id}`
  const active = pathname === route || pathname.startsWith(`${route}/`)

  return (
    <div>
      <Row
        active={active}
        onClick={() => {
          setOpen((o) => !o)
          navigate(route)
        }}
      >
        <Folder className="h-4 w-4 shrink-0 text-ink-soft" />
        <span className="truncate">{folder.name}</span>
      </Row>
      {open && (
        <div className="flex flex-col gap-px pl-4">
          {folder.items.map((item) => (
            <FolderItemRow key={item.id} spaceId={spaceId} item={item} />
          ))}
          <Row muted onClick={() => addSprintToFolder(spaceId, folder.id)}>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Create Sprint</span>
          </Row>
        </div>
      )}
    </div>
  )
}

/** Space row + nested folders and space-level items; collapsible, starts expanded. */
function SpaceBlock({ space }: { space: Space }) {
  const [open, setOpen] = useState(true)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 288)),
    })
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o)
        }}
        className="group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-[13.5px] text-ink select-none hover:bg-hover"
      >
        <Avatar initials={space.abbr} color={space.color} size={20} rounded="md" />
        <span className="truncate font-medium">{space.name}</span>
        {space.isPrivate && <Lock className="h-3 w-3 shrink-0 text-ink-faint" />}
        <button
          type="button"
          aria-label={`${space.name} settings`}
          onClick={(e) => {
            e.stopPropagation()
            comingSoon(useAppStore.getState().notify, 'The Space settings menu')
          }}
          className="ml-auto flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-hover"
        >
          <Ellipsis className="h-3.5 w-3.5 text-ink-soft" />
        </button>
        <button
          type="button"
          aria-label={`Add to ${space.name}`}
          onClick={openMenu}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5 text-ink-soft" />
        </button>
      </div>

      {menuPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuPos(null)} />
          <div className="fixed z-50" style={{ top: menuPos.top, left: menuPos.left }}>
            <CreateMenu spaceId={space.id} onClose={() => setMenuPos(null)} />
          </div>
        </>
      )}

      {open && (
        <div className="flex flex-col gap-px pl-4">
          {space.folders.map((folder) => (
            <FolderBlock key={folder.id} spaceId={space.id} folder={folder} />
          ))}
          {space.items.map((item) => (
            <FolderItemRow key={item.id} spaceId={space.id} item={item} />
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
  const openCreateSpace = useAppStore((s) => s.openCreateSpace)
  const notify = useAppStore((s) => s.notify)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const soon = (what: string) => () => comingSoon(notify, what)

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
            onClick={soon('Quick create')}
            className="flex cursor-pointer items-center px-1 py-0.5 hover:bg-hover"
          >
            <Plus className="h-3.5 w-3.5 text-ink-soft" />
          </button>
          <button
            type="button"
            aria-label="Create options"
            onClick={soon('The create menu')}
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
          <Row active={pathname === '/home'} onClick={() => navigate('/home')}>
            <Inbox className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Inbox</span>
            {primaryUnread > 0 && (
              <span className="ml-auto flex shrink-0 items-center">
                <CountBadge value={primaryUnread} variant="red" />
              </span>
            )}
          </Row>
          <Row onClick={soon('The Replies screen')}>
            <Reply className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Replies</span>
          </Row>
          <Row onClick={soon('The Assigned Comments screen')}>
            <AtSign className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Assigned Comments</span>
          </Row>
          <Row onClick={soon('The My Tasks screen')}>
            <CircleCheckBig className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">My Tasks</span>
          </Row>
          <Row onClick={soon('The expanded Home menu')}>
            <Ellipsis className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">More</span>
          </Row>
        </nav>

        {/* AI Chats */}
        <Section label="AI Chats">
          <Row muted onClick={soon('AI Chats')}>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">Ask, Build, Create</span>
          </Row>
        </Section>

        {/* Channels */}
        <Section label="Channels">
          {channels.map((channel) => (
            <Row key={channel.id} onClick={soon(`The #${channel.name} channel`)}>
              {channel.iconStyle === 'filled' ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#3d434d]">
                  <Hash className="h-2.5 w-2.5 text-white" />
                </span>
              ) : (
                <Hash className="h-4 w-4 shrink-0 text-ink-soft" />
              )}
              <span className="truncate">
                {channel.name}
                {channel.suffix && <span className="text-ink-faint"> - {channel.suffix}</span>}
              </span>
            </Row>
          ))}
          <Row muted onClick={soon('Channel creation')}>
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
              <Row key={id} onClick={soon(`Direct messages with ${user.name}`)}>
                <Avatar initials={user.initials} color={user.color} size={20} />
                <span className="truncate">{user.name}</span>
              </Row>
            )
          })}
          <Row muted onClick={soon('New direct messages')}>
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
              onClick={(e) => {
                e.stopPropagation()
                openCreateSpace()
              }}
              className="ml-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          <Row onClick={soon('The Everything view')}>
            <Shapes className="h-4 w-4 shrink-0 text-brand" />
            <span className="truncate">
              All Tasks
              <span className="text-ink-faint"> - {workspaceName}</span>
            </span>
          </Row>
          {spaces.map((space) => (
            <SpaceBlock key={space.id} space={space} />
          ))}
          <Row muted onClick={openCreateSpace}>
            <Plus className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">New Space</span>
          </Row>
        </Section>
      </div>

      {/* Pinned footer */}
      <div className="shrink-0 border-t border-line p-2">
        <button
          type="button"
          onClick={soon('Sidebar customization')}
          className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line bg-white text-[13px] text-ink-soft shadow-sm hover:bg-hover"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Customize Sidebar</span>
        </button>
      </div>

      <CreateSpaceModal />
    </aside>
  )
}
