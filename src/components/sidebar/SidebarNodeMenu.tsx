import { useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  Archive,
  ArrowDownToLine,
  ChevronRight,
  CircleDot,
  Copy,
  CornerUpRight,
  Ellipsis,
  Link2,
  Palette,
  Pencil,
  PencilRuler,
  Plus,
  Star,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

export type SidebarNodeKind = 'space' | 'folder' | 'item'

export interface SidebarNodeTarget {
  kind: SidebarNodeKind
  id: string
  name: string
  /** App path to the node, used by "Copy link". */
  link: string
  /** For folder items — a sprint folder / list distinction changes a couple of labels. */
  isSprintFolder?: boolean
}

function Item({
  icon,
  label,
  trailing,
  danger,
  onClick,
}: {
  icon: ReactNode
  label: string
  trailing?: ReactNode
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] hover:bg-hover ${
        danger ? 'text-danger' : 'text-ink'
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing && <span className="ml-auto flex shrink-0 items-center">{trailing}</span>}
    </button>
  )
}

const chevron = <ChevronRight className="h-3.5 w-3.5 text-ink-faint" />

/**
 * ClickUp-style right-click / "..." menu for a sidebar node (Space, Folder, Sprint
 * Folder, or List/Sprint). Favorite / Rename / Copy link / Duplicate / Delete are wired
 * to real store mutations; the remaining config affordances toast the build pointer.
 * The Sidebar anchors/positions this and owns the backdrop + the rename & delete flows.
 */
export function SidebarNodeMenu({
  target,
  pos,
  onClose,
  onRename,
  onRequestDelete,
}: {
  target: SidebarNodeTarget
  pos: { top: number; left: number }
  onClose: () => void
  onRename: () => void
  onRequestDelete: () => void
}) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const duplicateFolder = useAppStore((s) => s.duplicateFolder)
  const duplicateFolderItem = useAppStore((s) => s.duplicateFolderItem)
  const openStatuses = useAppStore((s) => s.openStatuses)
  const notify = useAppStore((s) => s.notify)
  const isFavorite = useAppStore((s) => s.favorites.includes(target.id))

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const soon = (what: string) => () => {
    comingSoon(notify, what)
    onClose()
  }

  const copyLink = () => {
    const url = `${window.location.origin}${target.link}`
    try {
      navigator.clipboard?.writeText(url)
    } catch {
      /* clipboard may be unavailable; the toast still confirms intent */
    }
    notify('Link copied to clipboard')
    onClose()
  }

  const duplicate = () => {
    if (target.kind === 'folder') duplicateFolder(target.id)
    else if (target.kind === 'item') duplicateFolderItem(target.id)
    else comingSoon(notify, 'Duplicating a Space')
    onClose()
  }

  const isSpace = target.kind === 'space'
  const colorLabel = target.kind === 'item' ? 'Color & Icon' : 'Folder color'

  return (
    <div
      className="animate-pop-in fixed z-50 w-[248px] rounded-xl border border-line bg-white p-1.5 shadow-xl"
      style={{ top: pos.top, left: pos.left }}
      role="menu"
    >
      <Item
        icon={<Star className={`h-4 w-4 ${isFavorite ? 'fill-[#f5c518] text-[#f5c518]' : 'text-ink-soft'}`} />}
        label={isFavorite ? 'Unfavorite' : 'Favorite'}
        trailing={chevron}
        onClick={() => {
          toggleFavorite(target.id)
          onClose()
        }}
      />
      <Item icon={<Pencil className="h-4 w-4 text-ink-soft" />} label="Rename" onClick={onRename} />
      <Item icon={<Link2 className="h-4 w-4 text-ink-soft" />} label="Copy link" onClick={copyLink} />

      <div className="my-1 border-t border-line" />

      <Item
        icon={<Plus className="h-4 w-4 text-ink-soft" />}
        label="Create new"
        trailing={chevron}
        onClick={soon('Create-new submenu')}
      />
      <Item
        icon={<Palette className="h-4 w-4 text-ink-soft" />}
        label={colorLabel}
        trailing={chevron}
        onClick={soon(colorLabel)}
      />
      <Item icon={<Zap className="h-4 w-4 text-ink-soft" />} label="Automations" onClick={soon('Automations')} />
      {!isSpace && (
        <>
          <Item
            icon={<PencilRuler className="h-4 w-4 text-ink-soft" />}
            label="Custom Fields"
            onClick={soon('Custom Fields')}
          />
          <Item
            icon={<CircleDot className="h-4 w-4 text-ink-soft" />}
            label="Task statuses"
            onClick={() => {
              openStatuses()
              onClose()
            }}
          />
          <Item
            icon={<Ellipsis className="h-4 w-4 text-ink-soft" />}
            label="More"
            trailing={chevron}
            onClick={soon('More folder options')}
          />
          <Item
            icon={<ArrowDownToLine className="h-4 w-4 text-ink-soft" />}
            label="Imports"
            trailing={chevron}
            onClick={soon('Imports')}
          />
          <Item
            icon={<PencilRuler className="h-4 w-4 text-ink-soft" />}
            label="Templates"
            onClick={soon('Templates')}
          />

          <div className="my-1 border-t border-line" />

          <Item
            icon={<CornerUpRight className="h-4 w-4 text-ink-soft" />}
            label="Move"
            trailing={chevron}
            onClick={soon('Move')}
          />
          <Item icon={<Copy className="h-4 w-4 text-ink-soft" />} label="Duplicate" onClick={duplicate} />
          <Item icon={<Archive className="h-4 w-4 text-ink-soft" />} label="Archive" onClick={soon('Archive')} />
        </>
      )}
      {isSpace && <div className="my-1 border-t border-line" />}
      <Item
        icon={<Trash2 className="h-4 w-4 text-danger" />}
        label="Delete"
        danger
        onClick={() => {
          onRequestDelete()
          onClose()
        }}
      />

      <div className="my-1 border-t border-line" />
      <button
        type="button"
        onClick={soon('Sharing & Permissions')}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1f2228] px-2.5 py-2 text-[13px] font-medium text-white hover:bg-black"
      >
        <Users className="h-3.5 w-3.5" />
        Sharing &amp; Permissions
      </button>
    </div>
  )
}

/** Red destructive-confirm dialog matching ClickUp's "Delete: {name}" modal. */
export function ConfirmDeleteDialog({
  title,
  body,
  onCancel,
  onConfirm,
}: {
  title: string
  body: string
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="animate-pop-in w-[380px] max-w-[92vw] rounded-xl bg-white p-5 text-center shadow-2xl">
        <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#fdecec]">
          <Trash2 className="h-[18px] w-[18px] text-danger" />
        </span>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 flex-1 cursor-pointer rounded-lg border border-line-strong text-[13.5px] font-medium text-ink hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 flex-1 cursor-pointer rounded-lg bg-danger text-[13.5px] font-medium text-white hover:brightness-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
