import { useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowDownToLine,
  ChevronRight,
  ClipboardList,
  FileText,
  Folder,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  ListTodo,
  Zap,
} from 'lucide-react'
import { useAppStore } from '../../lib/store'

interface CreateMenuProps {
  spaceId: string
  onClose: () => void
}

/** 16px yellow rounded square with a white zap — same glyph as sidebar whiteboards. */
function WhiteboardSquare() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#fbb62b]">
      <Zap className="h-2.5 w-2.5 fill-white text-white" />
    </span>
  )
}

function MenuItem({
  icon,
  name,
  description,
  trailing,
  onClick,
}: {
  icon: ReactNode
  name: string
  description?: string
  trailing?: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-hover"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] text-ink">{name}</span>
        {description && (
          <span className="block truncate text-[11.5px] text-ink-faint">{description}</span>
        )}
      </span>
      {trailing && <span className="ml-auto flex shrink-0 items-center">{trailing}</span>}
    </button>
  )
}

/** Space "+" popover — the panel only; Sidebar anchors/positions it and owns the backdrop. */
export function CreateMenu({ spaceId, onClose }: CreateMenuProps) {
  const addListToSpace = useAppStore((s) => s.addListToSpace)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="absolute z-50 w-[280px] rounded-xl border border-line bg-white p-1.5 shadow-xl">
      <div className="px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint">Create</div>
      <MenuItem
        icon={<ListTodo className="h-4 w-4 text-[#6e56cf]" />}
        name="List"
        description="Track tasks, projects, people & more"
        onClick={() => {
          addListToSpace(spaceId)
          onClose()
        }}
      />
      <MenuItem
        icon={<Folder className="h-4 w-4 text-ink-soft" />}
        name="Folder"
        description="Group Lists, Docs & more"
        onClick={onClose}
      />
      <MenuItem
        icon={<FolderKanban className="h-4 w-4 text-ink-soft" />}
        name="Sprint Folder"
        description="Organize your Sprints"
        onClick={onClose}
      />
      <div className="my-1 border-t border-line" />
      <MenuItem icon={<FileText className="h-4 w-4 text-[#2e9ded]" />} name="Doc" onClick={onClose} />
      <MenuItem
        icon={<LayoutDashboard className="h-4 w-4 text-[#d6336c]" />}
        name="Dashboard"
        onClick={onClose}
      />
      <MenuItem icon={<WhiteboardSquare />} name="Whiteboard" onClick={onClose} />
      <MenuItem
        icon={<ClipboardList className="h-4 w-4 text-[#8a5fe8]" />}
        name="Form"
        onClick={onClose}
      />
      <div className="my-1 border-t border-line" />
      <MenuItem
        icon={<ArrowDownToLine className="h-4 w-4 text-ink-soft" />}
        name="Imports"
        trailing={<ChevronRight className="h-3.5 w-3.5 text-ink-faint" />}
        onClick={onClose}
      />
      <MenuItem
        icon={<LayoutTemplate className="h-4 w-4 text-ink-soft" />}
        name="Templates"
        onClick={onClose}
      />
    </div>
  )
}
