import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  CircleDot,
  Ellipsis,
  Folder,
  Inbox,
  ListTodo,
  Lock,
  Plus,
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
import { ConfirmDeleteDialog, SidebarNodeMenu } from '../sidebar/SidebarNodeMenu'
import type { SidebarNodeTarget } from '../sidebar/SidebarNodeMenu'

/**
 * Which sidebar node is currently being dragged. Kept at module scope (not React
 * state) so drop handlers can read it synchronously during a drag — a dragstart on
 * one row never re-renders the potential drop targets, so those handlers must consult
 * this live value rather than a stale render-time closure.
 */
type DragPayload =
  | { kind: 'item'; id: string }
  | { kind: 'folder'; id: string }
  | { kind: 'space'; id: string }
let dragPayload: DragPayload | null = null

/** Inline row-rename editor: commits on Enter/blur, reverts on Escape. */
function RenameInput({
  initial,
  onCommit,
}: {
  initial: string
  onCommit: (value: string) => void
}) {
  const [val, setVal] = useState(initial)
  return (
    <input
      autoFocus
      value={val}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setVal(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter') onCommit(val)
        else if (e.key === 'Escape') onCommit(initial)
      }}
      onBlur={() => onCommit(val)}
      className="h-6 min-w-0 flex-1 rounded border border-brand bg-white px-1.5 text-[13.5px] text-ink outline-none"
    />
  )
}

/** Hover-revealed "..." trigger shared by folder / list / space rows. */
function NodeMenuButton({
  label,
  onClick,
}: {
  label: string
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-hover"
    >
      <Ellipsis className="h-3.5 w-3.5 text-ink-soft" />
    </button>
  )
}

/**
 * Context-menu + inline-rename + delete-confirm state for one sidebar node. Returns
 * openers (cursor for right-click, button for the "..."), the live `renaming` flag,
 * and an `overlay` element (menu + confirm dialog) to render inside the row.
 */
function useNodeMenu(opts: {
  target: SidebarNodeTarget
  confirmTitle: string
  confirmBody: string
  onConfirmDelete: () => void
}) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const openAtCursor = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuPos({
      top: Math.min(e.clientY, window.innerHeight - 440),
      left: Math.min(e.clientX, window.innerWidth - 256),
    })
  }
  const openAtButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    setMenuPos({
      top: Math.min(r.bottom + 4, window.innerHeight - 440),
      left: Math.max(8, Math.min(r.left - 210, window.innerWidth - 256)),
    })
  }

  const overlay = (
    <>
      {menuPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuPos(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              setMenuPos(null)
            }}
          />
          <SidebarNodeMenu
            target={opts.target}
            pos={menuPos}
            onClose={() => setMenuPos(null)}
            onRename={() => {
              setMenuPos(null)
              setRenaming(true)
            }}
            onRequestDelete={() => setConfirming(true)}
          />
        </>
      )}
      {confirming && (
        <ConfirmDeleteDialog
          title={opts.confirmTitle}
          body={opts.confirmBody}
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            opts.onConfirmDelete()
          }}
        />
      )}
    </>
  )

  return { openAtCursor, openAtButton, renaming, setRenaming, overlay }
}

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

/** Expand/collapse caret shown at the left of every expandable tree row. */
function Caret({
  open,
  onToggle,
  label,
}: {
  open: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-ink-faint hover:bg-hover hover:text-ink-soft"
    >
      <ChevronRight
        className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
      />
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
      <div className="mt-4 mb-1 flex items-center gap-1 px-1 text-[12px] font-semibold text-ink-soft select-none">
        <Caret open={open} onToggle={() => setOpen((o) => !o)} label={label} />
        <span
          role="button"
          tabIndex={0}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o)
          }}
          className="cursor-pointer"
        >
          {label}
        </span>
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

/**
 * Sprint / whiteboard / list row (folder items and space-level items).
 * Draggable, and a drop target that inserts a dragged item *before* it.
 */
function FolderItemRow({
  location,
  item,
}: {
  location: { spaceId: string; folderId?: string }
  item: FolderItem
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const moveFolderItem = useAppStore((s) => s.moveFolderItem)
  const renameFolderItem = useAppStore((s) => s.renameFolderItem)
  const deleteFolderItem = useAppStore((s) => s.deleteFolderItem)
  const [over, setOver] = useState(false)
  const [dragging, setDragging] = useState(false)
  const route =
    item.icon === 'whiteboard' ? `/whiteboard/${item.id}` : `/space/${location.spaceId}/list/${item.id}`
  const active = pathname === route || pathname.startsWith(`${route}/`)
  const kindLabel = item.icon === 'sprint' ? 'Sprint' : item.icon === 'whiteboard' ? 'Whiteboard' : 'List'
  const menu = useNodeMenu({
    target: { kind: 'item', id: item.id, name: item.name, link: route },
    confirmTitle: `Delete: ${item.name}`,
    confirmBody: `All tasks within this ${kindLabel} will be deleted. This can't be undone.`,
    onConfirmDelete: () => deleteFolderItem(item.id),
  })

  const icon =
    item.icon === 'sprint' ? (
      <CircleDot className="h-4 w-4 shrink-0 text-[#1f9d61]" />
    ) : item.icon === 'whiteboard' ? (
      <WhiteboardIcon />
    ) : (
      <ListTodo className="h-4 w-4 shrink-0 text-ink-soft" />
    )

  return (
    <div
      className="relative"
      draggable={!menu.renaming}
      onContextMenu={menu.openAtCursor}
      onDragStart={(e) => {
        dragPayload = { kind: 'item', id: item.id }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', item.id)
        setDragging(true)
      }}
      onDragEnd={() => {
        dragPayload = null
        setDragging(false)
      }}
      onDragOver={(e) => {
        if (dragPayload?.kind === 'item' && dragPayload.id !== item.id) {
          e.preventDefault()
          e.stopPropagation()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        if (dragPayload?.kind === 'item' && dragPayload.id !== item.id) {
          e.preventDefault()
          e.stopPropagation()
          moveFolderItem(dragPayload.id, {
            spaceId: location.spaceId,
            folderId: location.folderId,
            beforeItemId: item.id,
          })
        }
        setOver(false)
      }}
    >
      {over && (
        <div className="pointer-events-none absolute inset-x-2 -top-px z-10 h-0.5 rounded-full bg-brand" />
      )}
      <div className={dragging ? 'opacity-40' : ''}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => !menu.renaming && navigate(route)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !menu.renaming) navigate(route)
          }}
          className={`group flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[13.5px] text-ink select-none ${
            active ? 'bg-active-row font-medium' : 'hover:bg-hover'
          }`}
        >
          {icon}
          {menu.renaming ? (
            <RenameInput
              initial={item.name}
              onCommit={(v) => {
                renameFolderItem(item.id, v)
                menu.setRenaming(false)
              }}
            />
          ) : (
            <>
              <span className="truncate">{item.name}</span>
              <span className="ml-auto flex shrink-0 items-center gap-0.5">
                <NodeMenuButton label={`${item.name} options`} onClick={menu.openAtButton} />
                {item.count !== undefined && (
                  <CountBadge value={item.count} variant={item.countStyle === 'pill' ? 'dark' : 'plain'} />
                )}
              </span>
            </>
          )}
        </div>
      </div>
      {menu.overlay}
    </div>
  )
}

/**
 * Folder inside a space; collapsible, starts expanded. Caret toggles; the row body
 * navigates to the folder Overview. Accepts dropped items (moves them into the folder)
 * and dropped folders (reorders before it), and is itself draggable.
 */
function FolderBlock({ spaceId, folder }: { spaceId: string; folder: SpaceFolder }) {
  const [open, setOpen] = useState(true)
  const [hint, setHint] = useState<'into' | 'before' | null>(null)
  const [dragging, setDragging] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const addSprintToFolder = useAppStore((s) => s.addSprintToFolder)
  const moveFolderItem = useAppStore((s) => s.moveFolderItem)
  const moveFolder = useAppStore((s) => s.moveFolder)
  const renameFolder = useAppStore((s) => s.renameFolder)
  const deleteFolder = useAppStore((s) => s.deleteFolder)
  const route = `/space/${spaceId}/folder/${folder.id}`
  const active = pathname === route || pathname.startsWith(`${route}/`)
  const isSprintFolder = folder.items.some((i) => i.icon === 'sprint')
  const menu = useNodeMenu({
    target: { kind: 'folder', id: folder.id, name: folder.name, link: route, isSprintFolder },
    confirmTitle: `Delete: ${folder.name}`,
    confirmBody:
      'All tasks and templates within this Folder will be deleted. Additionally, automations will become inactive.',
    onConfirmDelete: () => deleteFolder(folder.id),
  })

  return (
    <div>
      <div
        className="relative"
        draggable={!menu.renaming}
        onContextMenu={menu.openAtCursor}
        onDragStart={(e) => {
          dragPayload = { kind: 'folder', id: folder.id }
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', folder.id)
          setDragging(true)
        }}
        onDragEnd={() => {
          dragPayload = null
          setDragging(false)
        }}
        onDragOver={(e) => {
          if (dragPayload?.kind === 'item') {
            e.preventDefault()
            e.stopPropagation()
            setHint('into')
          } else if (dragPayload?.kind === 'folder' && dragPayload.id !== folder.id) {
            e.preventDefault()
            e.stopPropagation()
            setHint('before')
          }
        }}
        onDragLeave={() => setHint(null)}
        onDrop={(e) => {
          if (dragPayload?.kind === 'item') {
            e.preventDefault()
            e.stopPropagation()
            moveFolderItem(dragPayload.id, { spaceId, folderId: folder.id })
            setOpen(true)
          } else if (dragPayload?.kind === 'folder' && dragPayload.id !== folder.id) {
            e.preventDefault()
            e.stopPropagation()
            moveFolder(dragPayload.id, { spaceId, beforeFolderId: folder.id })
          }
          setHint(null)
        }}
      >
        {hint === 'before' && (
          <div className="pointer-events-none absolute inset-x-2 -top-px z-10 h-0.5 rounded-full bg-brand" />
        )}
        <div
          className={`${dragging ? 'opacity-40' : ''} ${
            hint === 'into' ? 'rounded-md ring-1 ring-brand ring-inset' : ''
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => !menu.renaming && navigate(route)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !menu.renaming) navigate(route)
            }}
            className={`group flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-left text-[13.5px] text-ink select-none ${
              active ? 'bg-active-row font-medium' : 'hover:bg-hover'
            }`}
          >
            <Caret open={open} onToggle={() => setOpen((o) => !o)} label={folder.name} />
            <Folder className="h-4 w-4 shrink-0 text-ink-soft" />
            {menu.renaming ? (
              <RenameInput
                initial={folder.name}
                onCommit={(v) => {
                  renameFolder(folder.id, v)
                  menu.setRenaming(false)
                }}
              />
            ) : (
              <>
                <span className="flex-1 truncate">{folder.name}</span>
                <NodeMenuButton label={`${folder.name} options`} onClick={menu.openAtButton} />
              </>
            )}
          </div>
        </div>
      </div>
      {menu.overlay}
      {open && (
        <div className="flex flex-col gap-px pl-4">
          {folder.items.map((item) => (
            <FolderItemRow key={item.id} location={{ spaceId, folderId: folder.id }} item={item} />
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

/**
 * Space row + nested folders and space-level items; collapsible, starts expanded.
 * Caret toggles; the row body navigates to the space Overview. Draggable (reorders
 * spaces), and its space-level item list is a drop zone that moves items to top level.
 */
function SpaceBlock({ space }: { space: Space }) {
  const [open, setOpen] = useState(true)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [hint, setHint] = useState<'before' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [itemsOver, setItemsOver] = useState(false)
  const navigate = useNavigate()
  const moveFolderItem = useAppStore((s) => s.moveFolderItem)
  const moveSpace = useAppStore((s) => s.moveSpace)
  const renameSpace = useAppStore((s) => s.renameSpace)
  const deleteSpace = useAppStore((s) => s.deleteSpace)
  const menu = useNodeMenu({
    target: { kind: 'space', id: space.id, name: space.name, link: `/space/${space.id}` },
    confirmTitle: `Delete: ${space.name}`,
    confirmBody:
      "All Folders, Lists, and tasks within this Space will be deleted. This can't be undone.",
    onConfirmDelete: () => deleteSpace(space.id),
  })

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 288)),
    })
  }

  return (
    <div
      className="relative"
      draggable
      onDragStart={(e) => {
        dragPayload = { kind: 'space', id: space.id }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', space.id)
        setDragging(true)
      }}
      onDragEnd={() => {
        dragPayload = null
        setDragging(false)
      }}
      onDragOver={(e) => {
        if (dragPayload?.kind === 'space' && dragPayload.id !== space.id) {
          e.preventDefault()
          setHint('before')
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHint(null)
      }}
      onDrop={(e) => {
        if (dragPayload?.kind === 'space' && dragPayload.id !== space.id) {
          e.preventDefault()
          moveSpace(dragPayload.id, space.id)
        }
        setHint(null)
      }}
    >
      {hint === 'before' && (
        <div className="pointer-events-none absolute inset-x-2 -top-px z-10 h-0.5 rounded-full bg-brand" />
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !menu.renaming && navigate(`/space/${space.id}`)}
        onContextMenu={menu.openAtCursor}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !menu.renaming) navigate(`/space/${space.id}`)
        }}
        className={`group flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-[13.5px] text-ink select-none ${
          dragging ? 'opacity-40' : ''
        } hover:bg-hover`}
      >
        <Caret open={open} onToggle={() => setOpen((o) => !o)} label={space.name} />
        <Avatar initials={space.abbr} color={space.color} size={20} rounded="md" />
        {menu.renaming ? (
          <RenameInput
            initial={space.name}
            onCommit={(v) => {
              renameSpace(space.id, v)
              menu.setRenaming(false)
            }}
          />
        ) : (
          <>
            <span className="truncate font-medium">{space.name}</span>
            {space.isPrivate && <Lock className="h-3 w-3 shrink-0 text-ink-faint" />}
            <button
              type="button"
              aria-label={`${space.name} settings`}
              onClick={menu.openAtButton}
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
          </>
        )}
      </div>

      {menuPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuPos(null)} />
          <div className="fixed z-50" style={{ top: menuPos.top, left: menuPos.left }}>
            <CreateMenu spaceId={space.id} onClose={() => setMenuPos(null)} />
          </div>
        </>
      )}
      {menu.overlay}

      {open && (
        <div className="flex flex-col gap-px pl-4">
          {space.folders.map((folder) => (
            <FolderBlock key={folder.id} spaceId={space.id} folder={folder} />
          ))}
          <div
            onDragOver={(e) => {
              if (dragPayload?.kind === 'item') {
                e.preventDefault()
                setItemsOver(true)
              }
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setItemsOver(false)
            }}
            onDrop={(e) => {
              if (dragPayload?.kind === 'item') {
                e.preventDefault()
                moveFolderItem(dragPayload.id, { spaceId: space.id })
              }
              setItemsOver(false)
            }}
            className={`flex flex-col gap-px rounded-md ${itemsOver ? 'bg-hover' : ''}`}
          >
            {space.items.map((item) => (
              <FolderItemRow key={item.id} location={{ spaceId: space.id }} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const workspaceName = useAppStore((s) => s.workspaceName)
  const spaces = useAppStore((s) => s.spaces)
  const notifications = useAppStore((s) => s.notifications)
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const openCreateSpace = useAppStore((s) => s.openCreateSpace)
  const notify = useAppStore((s) => s.notify)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const soon = (what: string) => () => comingSoon(notify, what)

  const primaryUnread = unreadCountForTab(notifications, 'primary')

  if (sidebarCollapsed) return null

  return (
    <aside className="group/sb flex w-[264px] shrink-0 flex-col border-r border-line bg-panel">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between px-3.5">
        <span className="text-[15px] font-semibold text-ink">Home</span>
        <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={toggleSidebar}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft opacity-0 transition-opacity group-hover/sb:opacity-100 hover:bg-hover"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
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
        </nav>

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
