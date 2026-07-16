import {
  Bookmark,
  Clock,
  FileText,
  List,
  ListFilter,
  Plus,
  RefreshCw,
  Settings,
  Upload,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { comingSoon, findFolder, useAppStore } from '../../lib/store'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
      <div className="mb-3 text-[14px] font-semibold text-ink">{title}</div>
      {children}
    </div>
  )
}

function BurndownChart() {
  return (
    <svg viewBox="0 0 196 110" className="h-auto w-full">
      {/* axes */}
      <line x1="10" y1="6" x2="10" y2="98" stroke="#d6dae1" strokeWidth="1.5" />
      <line x1="10" y1="98" x2="188" y2="98" stroke="#d6dae1" strokeWidth="1.5" />
      {/* bars */}
      <rect x="38" y="40" width="28" height="58" rx="3" fill="#c9bff7" />
      <rect x="106" y="60" width="28" height="38" rx="3" fill="#c9bff7" />
      {/* descending burndown line */}
      <polyline
        points="16,14 58,32 100,50 142,68 182,88"
        fill="none"
        stroke="#7b68ee"
        strokeWidth="2"
      />
      {[
        [16, 14],
        [58, 32],
        [100, 50],
        [142, 68],
        [182, 88],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#7b68ee" />
      ))}
    </svg>
  )
}

export function OverviewTab({ folderId }: { folderId: string }) {
  const spaces = useAppStore((s) => s.spaces)
  const docs = useAppStore((s) => s.docs)
  const notify = useAppStore((s) => s.notify)
  const [hintVisible, setHintVisible] = useState(true)
  const navigate = useNavigate()
  const soon = (what: string) => () => comingSoon(notify, what)

  const found = findFolder(spaces, folderId)
  if (!found) return null
  const { space, folder } = found

  const recent = folder.items.filter((i) => i.icon !== 'whiteboard').reverse()

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Hint banner */}
      {hintVisible && (
        <div className="relative flex items-center justify-center gap-1 border-b border-line bg-panel px-4 py-2 text-[13px] text-ink-soft">
          <span>
            Get the most out of your Overview! Add, reorder, and resize cards to customize this
            page
          </span>
          <button onClick={soon('Overview customization')} className="cursor-pointer text-ink underline">
            Get Started
          </button>
          <button
            onClick={() => setHintVisible(false)}
            className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
          >
            <X className="h-3.5 w-3.5 text-ink-soft" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 px-6 py-3">
        <div className="flex items-center gap-1 text-[12px] text-ink-faint">
          <RefreshCw className="h-[13px] w-[13px]" />
          <span>Loading...</span>
        </div>
        <button
          onClick={soon('Auto-refresh settings')}
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-2.5 text-[12.5px] text-ink-soft hover:bg-hover"
        >
          <Clock className="h-3 w-3" />
          Auto refresh: On
        </button>
        <button
          onClick={soon('Overview filters')}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <ListFilter className="h-4 w-4 text-ink-soft" />
        </button>
        <button
          onClick={soon('Overview settings')}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Settings className="h-4 w-4 text-ink-soft" />
        </button>
        <button
          onClick={soon('Custom cards')}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-md bg-[#1f2228] px-3 text-[13px] font-medium text-white hover:bg-black"
        >
          <Plus className="h-[13px] w-[13px]" />
          Card
        </button>
      </div>

      {/* Cards */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-3 gap-5">
          <Card title="Recent">
            {recent.map((item) => (
              <div key={item.id} className="flex h-8 items-center gap-2">
                <List className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
                <button
                  onClick={() => navigate(`/space/${space.id}/list/${item.id}`)}
                  className="cursor-pointer truncate text-[13px] text-ink hover:underline"
                >
                  {item.name}
                </button>
                <span className="shrink-0 text-[12px] text-ink-faint">• in {folder.name}</span>
              </div>
            ))}
          </Card>

          <Card title="Docs">
            {docs.map((doc) => (
              <div key={doc.id} className="flex h-8 items-center gap-2">
                <FileText className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
                <button
                  onClick={soon('The Docs screen')}
                  className="cursor-pointer truncate text-[13px] text-ink hover:underline"
                >
                  {doc.name}
                </button>
                <span className="truncate text-[12px] text-ink-faint">• in {doc.location}</span>
              </div>
            ))}
          </Card>

          <Card title="Bookmarks">
            <div className="flex flex-col items-center gap-3 py-3">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong">
                  <Bookmark className="h-[18px] w-[18px] text-ink-faint" />
                </div>
                <span className="absolute -right-1 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-line-strong bg-white">
                  <Plus className="h-2.5 w-2.5 text-ink-soft" />
                </span>
              </div>
              <p className="max-w-[220px] text-center text-[12.5px] text-ink-soft">
                Bookmarks make it easy to save ClickUp items or any URL from around the web.
              </p>
              <button
                onClick={soon('Bookmarks')}
                className="h-8 cursor-pointer rounded-md bg-[#1f2228] px-3 text-[13px] font-medium text-white hover:bg-black"
              >
                Add Bookmark
              </button>
            </div>
          </Card>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <Card title="Resources">
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-1 rounded-lg border border-line bg-panel/60 text-[13px] text-ink-soft">
              <Upload className="h-4 w-4" />
              <div>
                Drop files here or{' '}
                <button onClick={soon('File attachments')} className="cursor-pointer underline hover:text-ink">
                  attach
                </button>
              </div>
            </div>
          </Card>

          <Card title="Current Sprint Burndown">
            <div className="flex flex-col items-center">
              <div className="w-[220px] rounded-lg border border-line p-3 shadow-xs">
                <BurndownChart />
              </div>
              <div className="mt-4 text-[12px] text-ink-faint">
                Feature limited on current plan
              </div>
              <div className="mt-1 text-[13.5px] font-semibold text-ink">
                Upgrade to Business to unlock this card
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
