import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  Brain,
  ChevronUp,
  CircleCheck,
  Ellipsis,
  Frame,
  Hand,
  Image,
  LayoutTemplate,
  Maximize2,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pen,
  Play,
  Plus,
  Square,
  Star,
  StickyNote,
  Type,
  UserRoundPlus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'

interface Note {
  id: number
  x: number
  y: number
  text: string
}

type ToolId = 'V' | 'H' | 'task' | 'D' | 'R' | 'A' | 'N' | 'T' | 'F'

const TOOLS: { id: ToolId; key: string; label: string; icon: LucideIcon }[] = [
  { id: 'V', key: 'V', label: 'Select', icon: MousePointer2 },
  { id: 'H', key: 'H', label: 'Hand', icon: Hand },
  { id: 'D', key: 'D', label: 'Pen', icon: Pen },
  { id: 'R', key: 'R', label: 'Shape', icon: Square },
  { id: 'A', key: 'A', label: 'Arrow', icon: MoveUpRight },
  { id: 'N', key: 'N', label: 'Sticky note', icon: StickyNote },
  { id: 'T', key: 'T', label: 'Text', icon: Type },
  { id: 'F', key: 'F', label: 'Frame', icon: Frame },
]

/** Whiteboard icon: yellow rounded square with a zap-ish glyph (sidebar style). */
function BoardIcon() {
  return (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#fbb62b]">
      <Pen className="h-2.5 w-2.5 text-white" />
    </span>
  )
}

function StickyNoteView({
  note,
  onMove,
  onEdit,
}: {
  note: Note
  onMove: (id: number, x: number, y: number) => void
  onEdit: (id: number, text: string) => void
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
    drag.current = { dx: e.clientX - note.x, dy: e.clientY - note.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return
    onMove(note.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy)
  }
  const onPointerUp = () => {
    drag.current = null
  }

  return (
    <div
      className="absolute flex h-[150px] w-[150px] cursor-grab flex-col rounded-sm bg-[#fff176] p-2 shadow-md active:cursor-grabbing"
      style={{ left: note.x, top: note.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <textarea
        value={note.text}
        onChange={(e) => onEdit(note.id, e.target.value)}
        placeholder="Type something…"
        className="h-full w-full resize-none bg-transparent text-[13px] text-[#4a3b00] outline-none placeholder:text-[#a08c2a]"
      />
    </div>
  )
}

export function WhiteboardPage() {
  const { itemId } = useParams()
  const spaces = useAppStore((s) => s.spaces)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const notify = useAppStore((s) => s.notify)

  const name =
    spaces
      .flatMap((sp) => [...sp.items, ...sp.folders.flatMap((f) => f.items)])
      .find((i) => i.id === itemId)?.name ?? 'Whiteboard'
  const me = users[currentUserId]
  const isFavorite = favorites.includes(itemId ?? '')

  const [loading, setLoading] = useState(true)
  const [tool, setTool] = useState<ToolId>('V')
  const [zoom, setZoom] = useState(100)
  const [notes, setNotes] = useState<Note[]>([])
  const noteSeq = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const soon = (what: string) => () => comingSoon(notify, what)

  const onCanvasClick = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (tool !== 'N') return
    if (e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    noteSeq.current += 1
    setNotes((n) => [
      ...n,
      { id: noteSeq.current, x: e.clientX - rect.left - 75, y: e.clientY - rect.top - 75, text: '' },
    ])
    setTool('V')
  }

  if (loading) {
    return (
      <main className="relative flex min-w-0 flex-1 flex-col bg-white p-8">
        <div className="pm-shimmer absolute top-10 left-10 h-28 w-64" />
        <div className="pm-shimmer absolute top-10 right-16 h-40 w-72" />
        <div className="pm-shimmer absolute bottom-24 left-16 h-32 w-56" />
      </main>
    )
  }

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Header strip */}
      <div className="animate-fade-in flex h-12 shrink-0 items-center gap-1.5 border-b border-line bg-white px-4">
        <BoardIcon />
        <span className="text-[14px] font-medium text-ink">{name}</span>
        <button
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          onClick={() => itemId && toggleFavorite(itemId)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Star
            className={`h-3.5 w-3.5 ${isFavorite ? 'text-[#e8a33d]' : 'text-ink-faint'}`}
            fill={isFavorite ? '#e8a33d' : 'none'}
          />
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          {me && <Avatar initials={me.initials} color={me.color} size={26} presence />}
          <button
            onClick={soon('Sharing')}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-ink hover:bg-hover"
          >
            <UserRoundPlus className="h-3.5 w-3.5" />
            Share
          </button>
          <button
            onClick={soon('Board options')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <Ellipsis className="h-4 w-4 text-ink-soft" />
          </button>
          <button
            title="Present"
            onClick={soon('Presenting')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#2b2f3a] hover:bg-black"
          >
            <Play className="h-3 w-3 text-white" fill="white" />
          </button>
          <button
            title="Fullscreen"
            onClick={soon('Fullscreen')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <Maximize2 className="h-4 w-4 text-ink-soft" />
          </button>
        </div>
      </div>

      {/* Dot-grid canvas */}
      <div
        className={`relative flex-1 overflow-hidden ${tool === 'N' ? 'cursor-crosshair' : tool === 'H' ? 'cursor-grab' : ''}`}
        style={{
          backgroundImage: 'radial-gradient(circle, #d9dce3 1px, transparent 1px)',
          backgroundSize: `${(20 * zoom) / 100}px ${(20 * zoom) / 100}px`,
        }}
        onPointerDown={onCanvasClick}
      >
        {notes.map((note) => (
          <StickyNoteView
            key={note.id}
            note={note}
            onMove={(id, x, y) =>
              setNotes((n) => n.map((m) => (m.id === id ? { ...m, x, y } : m)))
            }
            onEdit={(id, text) =>
              setNotes((n) => n.map((m) => (m.id === id ? { ...m, text } : m)))
            }
          />
        ))}
        {notes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-ink-faint">
            Select the sticky-note tool (N) and click anywhere to add a note
          </div>
        )}
      </div>

      {/* Zoom pill */}
      <div className="animate-rise-in absolute bottom-5 left-4 z-20 flex items-center gap-0.5 rounded-lg border border-line bg-white px-1 py-0.5 shadow-md">
        <button
          title="Collapse"
          onClick={soon('Zoom presets')}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <ChevronUp className="h-3.5 w-3.5 text-ink-soft" />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(50, z - 25))}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Minus className="h-3.5 w-3.5 text-ink-soft" />
        </button>
        <span className="w-10 text-center text-[12px] text-ink tabular-nums">{zoom}%</span>
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(200, z + 25))}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Plus className="h-3.5 w-3.5 text-ink-soft" />
        </button>
      </div>

      {/* Bottom toolbar */}
      <div className="animate-rise-in absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-end gap-1 rounded-xl border border-line bg-white px-2 py-1.5 shadow-xl">
        {TOOLS.slice(0, 2).map((t) => (
          <ToolButton key={t.id} tool={t} active={tool === t.id} onPick={() => setTool(t.id)} />
        ))}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-ink-faint">⇧T</span>
          <button
            onClick={soon('Task cards on whiteboards')}
            className="flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2 text-[12px] text-ink hover:bg-hover"
          >
            <CircleCheck className="h-4 w-4 text-brand" />
            Task
          </button>
        </div>
        {TOOLS.slice(2).map((t) => (
          <ToolButton key={t.id} tool={t} active={tool === t.id} onPick={() => setTool(t.id)} />
        ))}
        <span className="mx-1 h-8 w-px bg-line" />
        <button
          title="Image"
          onClick={soon('Images on whiteboards')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-hover"
        >
          <Image className="h-4.5 w-4.5 text-[#d6336c]" />
        </button>
        <button
          title="Templates"
          onClick={soon('Whiteboard templates')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-hover"
        >
          <LayoutTemplate className="h-4.5 w-4.5 text-[#2ba3d4]" />
        </button>
        <button
          title="Brain²"
          onClick={soon('Brain² on whiteboards')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-hover"
        >
          <Brain className="h-4.5 w-4.5 text-[#b15de8]" />
        </button>
        <span className="mx-1 h-8 w-px bg-line" />
        <div className="flex flex-col gap-0.5">
          <button aria-label="Undo" className="cursor-default text-[13px] text-line-strong">
            ↶
          </button>
          <button aria-label="Redo" className="cursor-default text-[13px] text-line-strong">
            ↷
          </button>
        </div>
      </div>
    </main>
  )
}

function ToolButton({
  tool,
  active,
  onPick,
}: {
  tool: { id: ToolId; key: string; label: string; icon: LucideIcon }
  active: boolean
  onPick: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-ink-faint">{tool.key}</span>
      <button
        title={tool.label}
        onClick={onPick}
        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg ${
          active ? 'bg-[#2b2f3a] text-white' : 'text-ink hover:bg-hover'
        }`}
      >
        <tool.icon className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}
