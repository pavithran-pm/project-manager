import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleDot, FileText, Folder, ListTodo, Search, SquareCheckBig } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'
import { Avatar } from './Avatar'

interface Result {
  key: string
  icon: 'task' | 'sprint' | 'list' | 'folder' | 'doc'
  title: string
  context: string
  spaceColor?: string
  spaceAbbr?: string
  onOpen: () => void
}

const RESULT_ICONS: Record<Result['icon'], { icon: LucideIcon; className: string }> = {
  task: { icon: SquareCheckBig, className: 'text-ink-soft' },
  sprint: { icon: CircleDot, className: 'text-[#1f9d61]' },
  list: { icon: ListTodo, className: 'text-ink-soft' },
  folder: { icon: Folder, className: 'text-ink-soft' },
  doc: { icon: FileText, className: 'text-[#2e9ded]' },
}

export function SearchModal() {
  const open = useAppStore((s) => s.searchOpen)
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const spaces = useAppStore((s) => s.spaces)
  const tasks = useAppStore((s) => s.tasks)
  const docs = useAppStore((s) => s.docs)
  const notify = useAppStore((s) => s.notify)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global shortcut: Ctrl/Cmd+K toggles, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(!useAppStore.getState().searchOpen)
      } else if (e.key === 'Escape' && useAppStore.getState().searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlight(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: Result[] = []
    const close = () => setSearchOpen(false)

    for (const space of spaces) {
      const allItems = [
        ...space.folders.flatMap((f) => f.items.map((i) => ({ item: i, folder: f }))),
        ...space.items.map((i) => ({ item: i, folder: undefined })),
      ]
      for (const { item, folder } of allItems) {
        if (!item.name.toLowerCase().includes(q)) continue
        if (item.icon === 'whiteboard') continue
        out.push({
          key: `item-${item.id}`,
          icon: item.icon === 'sprint' ? 'sprint' : 'list',
          title: item.name,
          context: folder ? `${space.name} / ${folder.name}` : space.name,
          spaceColor: space.color,
          spaceAbbr: space.abbr,
          onOpen: () => {
            close()
            navigate(`/space/${space.id}/list/${item.id}`)
          },
        })
      }
      for (const folder of space.folders) {
        if (!folder.name.toLowerCase().includes(q)) continue
        out.push({
          key: `folder-${folder.id}`,
          icon: 'folder',
          title: folder.name,
          context: space.name,
          spaceColor: space.color,
          spaceAbbr: space.abbr,
          onOpen: () => {
            close()
            navigate(`/space/${space.id}/folder/${folder.id}`)
          },
        })
      }
    }

    for (const task of tasks) {
      if (!task.name.toLowerCase().includes(q)) continue
      const loc = findTaskLocation(spaces, task.listId)
      out.push({
        key: `task-${task.id}`,
        icon: 'task',
        title: task.name,
        context: loc?.label ?? 'Task',
        spaceColor: loc?.space.color,
        spaceAbbr: loc?.space.abbr,
        onOpen: () => {
          close()
          if (loc) navigate(`/space/${loc.space.id}/list/${task.listId}`)
        },
      })
    }

    for (const doc of docs) {
      if (!doc.name.toLowerCase().includes(q)) continue
      out.push({
        key: `doc-${doc.id}`,
        icon: 'doc',
        title: doc.name,
        context: doc.location,
        onOpen: () => {
          close()
          comingSoon(notify, 'The Docs screen')
        },
      })
    }

    return out.slice(0, 8)
  }, [query, spaces, tasks, docs, navigate, notify, setSearchOpen])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlight]) {
      results[highlight].onOpen()
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[60] flex justify-center bg-black/40 pt-[12vh]"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="animate-pop-in h-fit w-[640px] max-w-[92vw] overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlight(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search tasks, sprints, lists, docs..."
            className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="shrink-0 rounded border border-line-strong px-1.5 py-0.5 text-[10.5px] text-ink-faint">
            Esc
          </kbd>
        </div>

        {query.trim() === '' ? (
          <div className="px-4 py-6 text-center text-[13px] text-ink-soft">
            Start typing to search across {`Spaces, Sprints, tasks and Docs`}
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-ink-soft">
            No results for “{query.trim()}”
          </div>
        ) : (
          <div className="p-1.5">
            {results.map((r, i) => {
              const { icon: Icon, className } = RESULT_ICONS[r.icon]
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={r.onOpen}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left ${
                    i === highlight ? 'bg-hover' : ''
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${className}`} />
                  <span className="truncate text-[13.5px] text-ink">{r.title}</span>
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[12px] text-ink-faint">
                    {r.spaceAbbr && r.spaceColor && (
                      <Avatar initials={r.spaceAbbr} color={r.spaceColor} size={16} rounded="md" />
                    )}
                    {r.context}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function findTaskLocation(
  spaces: ReturnType<typeof useAppStore.getState>['spaces'],
  listId: string,
) {
  for (const space of spaces) {
    for (const folder of space.folders) {
      const item = folder.items.find((i) => i.id === listId)
      if (item) return { space, label: `${space.name} / ${item.name}` }
    }
    const item = space.items.find((i) => i.id === listId)
    if (item) return { space, label: `${space.name} / ${item.name}` }
  }
  return undefined
}
