import {
  Brain,
  ChartLine,
  ChartNoAxesGantt,
  ChevronDown,
  CircleDot,
  CircleGauge,
  FolderOpen,
  List,
  Lock,
  Plus,
  SquareChartGantt,
  SquareKanban,
  Star,
  Table,
  UserRoundPlus,
  Video,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/ui/Avatar'
import { findFolder, findListItem, useAppStore } from '../../lib/store'
import type { SpaceView } from '../../lib/types'

export interface SpaceHeaderProps {
  spaceId: string
  folderId?: string
  listId?: string
  activeView: SpaceView
}

interface TabDef {
  view: SpaceView
  label: string
  icon: LucideIcon
  iconClass: string
}

const TABS: TabDef[] = [
  { view: 'overview', label: 'Overview', icon: SquareChartGantt, iconClass: 'text-ink-soft' },
  { view: 'list', label: 'List', icon: List, iconClass: 'text-[#4a80f5]' },
  { view: 'board', label: 'Board', icon: SquareKanban, iconClass: 'text-[#4a80f5]' },
  { view: 'timeline', label: 'Timeline', icon: ChartNoAxesGantt, iconClass: 'text-[#e8871e]' },
  { view: 'workload', label: 'Workload', icon: CircleGauge, iconClass: 'text-[#12b76a]' },
  { view: 'table', label: 'Table', icon: Table, iconClass: 'text-[#0aa5a5]' },
  { view: 'sprint-reporting', label: 'Sprint Reporting', icon: ChartLine, iconClass: 'text-[#e8871e]' },
]

export function SpaceHeader({ spaceId, folderId, listId, activeView }: SpaceHeaderProps) {
  const spaces = useAppStore((s) => s.spaces)
  const navigate = useNavigate()

  const folderCtx = folderId ? findFolder(spaces, folderId) : undefined
  const listCtx = listId ? findListItem(spaces, listId) : undefined
  const space = spaces.find((sp) => sp.id === spaceId) ?? folderCtx?.space ?? listCtx?.space
  const folder = folderCtx?.folder ?? listCtx?.folder
  const listItem = listCtx?.item

  if (!space) return null

  const tabs = listId ? TABS.filter((t) => t.view !== 'overview') : TABS
  const pathFor = (view: SpaceView) =>
    listId
      ? `/space/${spaceId}/list/${listId}/${view}`
      : `/space/${spaceId}/folder/${folderId}/${view}`

  return (
    <div className="shrink-0 bg-white">
      {/* Row 1 — breadcrumb bar */}
      <div className="flex h-12 items-center gap-1 border-b border-line px-4">
        <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover">
          <Avatar initials={space.abbr} color={space.color} size={18} rounded="md" />
          <span className="text-[13px] font-medium text-ink">{space.name}</span>
          {space.isPrivate && <Lock className="h-[11px] w-[11px] text-ink-faint" />}
        </button>
        <span className="mx-0.5 text-[13px] text-ink-faint">/</span>
        {folder && (
          <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover">
            <FolderOpen className="h-[15px] w-[15px] text-ink-soft" />
            <span className="text-[13.5px] font-semibold text-ink">{folder.name}</span>
            <ChevronDown className="h-[13px] w-[13px] text-ink-faint" />
          </button>
        )}
        {listItem && (
          <>
            {folder && <span className="mx-0.5 text-[13px] text-ink-faint">/</span>}
            <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover">
              <CircleDot className="h-3.5 w-3.5 text-[#1f9d61]" />
              <span className="text-[13.5px] font-semibold text-ink">{listItem.name}</span>
            </button>
          </>
        )}
        <button className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover">
          <Star className="h-3.5 w-3.5 text-ink-faint" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button className="flex h-7 cursor-pointer items-center gap-0.5 rounded-md px-1.5 hover:bg-hover">
            <Video className="h-4 w-4 text-ink-soft" />
            <ChevronDown className="h-3 w-3 text-ink-faint" />
          </button>
          <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-hover">
            <Zap className="h-4 w-4 text-ink-soft" />
          </button>
          <button className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-ink hover:bg-hover">
            <Brain className="h-[15px] w-[15px] text-[#b15de8]" />
            <span>
              Brain<sup>2</sup>
            </span>
          </button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-ink hover:bg-hover">
            <UserRoundPlus className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Row 2 — view tabs */}
      <div className="flex h-10 items-center gap-0.5 border-b border-line px-4">
        <button className="h-7 cursor-pointer rounded-md px-2 text-[13px] text-ink-soft hover:bg-hover">
          Add Channel
        </button>
        <span className="mx-1.5 h-4 w-px bg-line" />
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = tab.view === activeView
          return (
            <button
              key={tab.view}
              onClick={() => navigate(pathFor(tab.view))}
              className="relative flex h-full cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] hover:bg-hover"
            >
              <Icon className={`h-3.5 w-3.5 ${tab.iconClass}`} />
              <span className={active ? 'font-semibold text-ink' : 'text-ink-soft'}>
                {tab.label}
              </span>
              {active && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />}
            </button>
          )
        })}
        <span className="mx-1.5 h-4 w-px bg-line" />
        <button className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[13px] text-ink-soft hover:bg-hover">
          <Plus className="h-[13px] w-[13px]" />
          View
        </button>
      </div>
    </div>
  )
}
