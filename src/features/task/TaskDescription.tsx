import { useState } from 'react'
import { create } from 'zustand'
import { ChevronDown, ChevronUp, GripVertical, History, Maximize2, Minimize2 } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'
import type { DocBlock, Task } from '../../lib/types'

interface DocViewState {
  /** Task whose description is open in the full-page doc view (null = normal modal). */
  expandedTaskId: string | null
  openFullDoc: (taskId: string) => void
  closeFullDoc: () => void
}

/**
 * Tiny cross-file UI store: TaskModal reads this to swap its body for the
 * full-page document view when the expand icon here is clicked.
 */
export const useDocView = create<DocViewState>((set) => ({
  expandedTaskId: null,
  openFullDoc: (taskId) => set({ expandedTaskId: taskId }),
  closeFullDoc: () => set({ expandedTaskId: null }),
}))

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case 'h2':
      return <h2 className="mt-5 mb-2 text-[20px] font-bold text-ink first:mt-0">{block.text}</h2>
    case 'sub':
      return <div className="mt-3 mb-1 text-[15px] font-bold text-ink">{block.text}</div>
    case 'p':
      return <p className="my-1 text-[15px] leading-[1.65] text-[#35373c]">{block.text}</p>
    case 'bullets':
      return (
        <ul className="my-1.5 flex list-disc flex-col gap-1 pl-6 marker:text-[#35373c]">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] leading-[1.55] text-[#35373c]">
              {item}
            </li>
          ))}
        </ul>
      )
    case 'numbered':
      return (
        <ol className="my-1.5 flex list-decimal flex-col gap-1 pl-6 marker:text-[#35373c]">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] leading-[1.55] text-[#35373c]">
              {item}
            </li>
          ))}
        </ol>
      )
  }
}

/** Document block list; `withHandles` adds the hover-revealed 6-dot drag handle per block. */
function DocBlocks({ blocks, withHandles = false }: { blocks: DocBlock[]; withHandles?: boolean }) {
  const notify = useAppStore((s) => s.notify)
  if (!withHandles) {
    return (
      <div>
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    )
  }
  return (
    <div>
      {blocks.map((block, i) => (
        <div key={i} className="group/block relative">
          <button
            type="button"
            aria-label="Drag block"
            onClick={() => comingSoon(notify, 'Block drag & drop')}
            className="absolute top-1.5 -left-8 flex h-6 w-5 cursor-grab items-center justify-center rounded-md opacity-0 group-hover/block:opacity-100 hover:bg-hover"
          >
            <GripVertical className="h-4 w-4 text-ink-faint" />
          </button>
          <Block block={block} />
        </div>
      ))}
    </div>
  )
}

/**
 * Full-page document view — rendered by TaskModal in place of the fields +
 * activity layout while `useDocView.expandedTaskId` matches the open task.
 * The Close row scrolls away with the content (not sticky), like the video.
 */
export function TaskDocFullPage({ task }: { task: Task }) {
  const closeFullDoc = useDocView((s) => s.closeFullDoc)
  return (
    <div className="animate-fade-in min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-16 pb-24 xl:px-28">
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={closeFullDoc}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-ink-soft hover:bg-hover hover:text-ink"
          >
            Close
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <h1 className="mt-8 mb-7 text-[30px] leading-tight font-bold text-ink">{task.name}</h1>
        <DocBlocks blocks={task.description ?? []} withHandles />
      </div>
    </div>
  )
}

export function TaskDescription({ task }: { task: Task }) {
  const notify = useAppStore((s) => s.notify)
  const openFullDoc = useDocView((s) => s.openFullDoc)
  const [expanded, setExpanded] = useState(false)
  const blocks = task.description ?? []

  if (blocks.length === 0) {
    return (
      <button
        type="button"
        onClick={() => comingSoon(notify, 'The description editor')}
        className="mt-1 block w-full cursor-text py-1 text-left text-[15px] text-ink-faint hover:text-ink-soft"
      >
        Add description, or write with AI
      </button>
    )
  }

  const ExpandIcon = expanded ? ChevronUp : ChevronDown

  return (
    <div className="group/doc relative">
      <div className={expanded ? undefined : 'relative max-h-[340px] overflow-hidden'}>
        <DocBlocks blocks={blocks} />
        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {/* Expand/Collapse chip row; history + full-page icons reveal on doc hover */}
      <div className="relative -mt-1 flex h-9 items-center justify-center">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-md border border-line-strong bg-white px-2.5 text-[12.5px] text-ink-soft shadow-sm hover:bg-hover hover:text-ink"
        >
          <ExpandIcon className="h-3.5 w-3.5" />
          {expanded ? 'Collapse' : 'Expand'}
        </button>
        <div className="absolute right-0 hidden items-center gap-0.5 group-hover/doc:flex">
          <button
            type="button"
            title="Description history"
            onClick={() => comingSoon(notify, 'Description history')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <History className="h-4 w-4 text-ink-faint" />
          </button>
          <button
            type="button"
            title="Expand description"
            onClick={() => openFullDoc(task.id)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <Maximize2 className="h-4 w-4 text-ink-faint" />
          </button>
        </div>
      </div>
    </div>
  )
}
