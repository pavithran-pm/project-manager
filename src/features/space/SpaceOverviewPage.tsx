import { useEffect, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  AlignJustify,
  Bookmark,
  Brain,
  CalendarDays,
  ChartNoAxesGantt,
  ChevronDown,
  CircleGauge,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  Gamepad2,
  GripVertical,
  Link2,
  List,
  ListFilter,
  Lock,
  Maximize2,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Settings,
  SquareChartGantt,
  SquareKanban,
  Star,
  Table,
  UserRoundPlus,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'
import { PromoBanner } from '../inbox/PromoBanner'

interface ViewTabDef {
  label: string
  icon: LucideIcon
  iconClass: string
}

const VIEW_TABS: ViewTabDef[] = [
  { label: 'Overview', icon: SquareChartGantt, iconClass: 'text-ink-soft' },
  { label: 'List', icon: List, iconClass: 'text-[#4a80f5]' },
  { label: 'Board', icon: SquareKanban, iconClass: 'text-[#4a80f5]' },
  { label: 'Timeline', icon: ChartNoAxesGantt, iconClass: 'text-[#e8871e]' },
  { label: 'Workload', icon: CircleGauge, iconClass: 'text-[#12b76a]' },
  { label: 'Table', icon: Table, iconClass: 'text-[#0aa5a5]' },
]

/** Recency order the sprint rows appear in the Recent card (per the video). */
const SPRINT_RECENCY = ['sprint3', 'sprint4', 'sprint1', 'sprint2']

const ICON_BTN =
  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover'

/** Icon button with the shared dark tooltip treatment. */
function TipButton({
  tip,
  onClick,
  className = ICON_BTN,
  children,
}: {
  tip: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className={`group/tip relative ${className}`}>
      {children}
      <span className="animate-fade-in pointer-events-none absolute top-full left-1/2 z-[70] mt-1.5 hidden -translate-x-1/2 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-lg group-hover/tip:block">
        {tip}
      </span>
    </button>
  )
}

/** White overview card with the hover chrome (drag handle, outlined title, ⤢ / + / …). */
function OverviewCard({
  title,
  soon,
  className = '',
  children,
}: {
  title: string
  soon: (what: string) => () => void
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={`group relative rounded-xl border border-line bg-white p-4 shadow-xs ${className}`}
    >
      <button
        type="button"
        title="Reorder card"
        onClick={soon('Card rearranging')}
        className="absolute top-[18px] left-0.5 hidden h-6 w-4 cursor-grab items-center justify-center text-ink-faint group-hover:flex hover:text-ink-soft"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="mb-2.5 flex h-7 items-center">
        <button
          type="button"
          onClick={soon('Card renaming')}
          className="-ml-1.5 cursor-pointer rounded-md border border-transparent px-1.5 py-0.5 text-[14px] font-semibold text-ink group-hover:border-line-strong"
        >
          {title}
        </button>
        <div className="ml-auto hidden items-center gap-0.5 group-hover:flex">
          <button
            type="button"
            title="Expand card"
            onClick={soon('Card expand')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Add"
            onClick={soon('Card quick add')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Card settings"
            onClick={soon('The card menu')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      {children}
    </section>
  )
}

function SkeletonCard({ lines, className = '' }: { lines: number; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-white p-4 shadow-xs ${className}`}>
      <div className="pm-shimmer mb-4 h-4 w-28" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="pm-shimmer h-3.5" style={{ width: `${86 - ((i * 13) % 40)}%` }} />
        ))}
      </div>
    </div>
  )
}

interface RecentRow {
  key: string
  name: string
  icon: 'list' | 'folder'
  parent: string
  /** Purple-tinted parent name (sprint rows in the video) */
  tint?: boolean
  to: string
}

export function SpaceOverviewPage() {
  const { spaceId } = useParams()
  const spaces = useAppStore((s) => s.spaces)
  const docs = useAppStore((s) => s.docs)
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const notify = useAppStore((s) => s.notify)
  const navigate = useNavigate()

  const [cardsLoading, setCardsLoading] = useState(true)
  const [toolbarLoading, setToolbarLoading] = useState(true)
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    const t1 = setTimeout(() => setCardsLoading(false), 700)
    const t2 = setTimeout(() => setToolbarLoading(false), 800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const space = spaces.find((sp) => sp.id === spaceId)
  if (!space) return <Navigate to="/home" replace />

  const soon = (what: string) => () => comingSoon(notify, what)
  const isFavorite = favorites.includes(space.id)

  const copyLink = (path: string) => {
    void navigator.clipboard?.writeText(`${window.location.origin}${path}`).catch(() => undefined)
    notify('Link copied to clipboard')
  }

  // ---- Recent card rows (video order: Backlog, MVP - MSM, List, sprints 3/4/1/2) ----
  const folder = space.folders[0]
  const recentRows: RecentRow[] = []
  const backlog = space.items.find((i) => i.id === 'backlog') ?? space.items.find((i) => i.name === 'Backlog')
  if (backlog)
    recentRows.push({
      key: backlog.id,
      name: backlog.name,
      icon: 'list',
      parent: space.name,
      to: `/space/${space.id}/list/${backlog.id}`,
    })
  if (folder)
    recentRows.push({
      key: folder.id,
      name: folder.name,
      icon: 'folder',
      parent: space.name,
      to: `/space/${space.id}/folder/${folder.id}`,
    })
  const list1 = space.items.find((i) => i.id === 'list1') ?? space.items.find((i) => i.name === 'List')
  if (list1)
    recentRows.push({
      key: list1.id,
      name: list1.name,
      icon: 'list',
      parent: space.name,
      to: `/space/${space.id}/list/${list1.id}`,
    })
  if (folder) {
    const rank = (id: string) => {
      const ix = SPRINT_RECENCY.indexOf(id)
      return ix === -1 ? SPRINT_RECENCY.length : ix
    }
    const sprints = folder.items
      .filter((i) => i.icon === 'sprint')
      .slice()
      .sort((a, b) => rank(a.id) - rank(b.id))
    for (const sprint of sprints)
      recentRows.push({
        key: sprint.id,
        name: sprint.name,
        icon: 'list',
        parent: folder.name,
        tint: true,
        to: `/space/${space.id}/list/${sprint.id}`,
      })
  }

  const listTiles = space.items.filter((i) => i.icon === 'list')

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <PromoBanner />

      {/* ---- Space header row ---- */}
      <div className="group/head flex h-12 shrink-0 items-center gap-0.5 border-b border-line px-4">
        <button
          type="button"
          onClick={soon('The Space menu')}
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-hover"
        >
          <Avatar initials={space.abbr} color={space.color} size={20} rounded="md" />
          <span className="text-[15px] font-semibold text-ink">{space.name}</span>
          {space.isPrivate && <Lock className="h-3 w-3 text-ink-faint" />}
          <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        </button>
        <button
          type="button"
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          onClick={() => toggleFavorite(space.id)}
          className={ICON_BTN}
        >
          <Star
            className={`h-3.5 w-3.5 ${isFavorite ? 'text-[#e8a33d]' : 'text-ink-faint'}`}
            fill={isFavorite ? '#e8a33d' : 'none'}
          />
        </button>
        <button
          type="button"
          title="Space description"
          onClick={soon('The Space description')}
          className={ICON_BTN}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
        {/* Hover-revealed quick actions (people / flag / calendar) */}
        <span className="hidden items-center gap-0.5 group-hover/head:flex">
          <button
            type="button"
            title="Add people"
            onClick={soon('Space members')}
            className={ICON_BTN}
          >
            <UserRoundPlus className="h-4 w-4" />
          </button>
          <button type="button" title="Goals" onClick={soon('Space goals')} className={ICON_BTN}>
            <Flag className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Calendar"
            onClick={soon('The Space calendar')}
            className={ICON_BTN}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </span>

        <div className="ml-auto flex items-center gap-1">
          <TipButton
            tip="Start a call"
            onClick={soon('Calls')}
            className="flex h-7 cursor-pointer items-center gap-0.5 rounded-md px-1.5 text-ink-soft hover:bg-hover"
          >
            <Phone className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 text-ink-faint" />
          </TipButton>
          <TipButton tip="Controls" onClick={soon('Controls')}>
            <Gamepad2 className="h-4 w-4" />
          </TipButton>
          <TipButton tip="Automations" onClick={soon('Automations')}>
            <Zap className="h-4 w-4" />
          </TipButton>
          <button
            type="button"
            onClick={soon('Brain² AI')}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] text-ink hover:bg-hover"
          >
            <Brain className="h-[15px] w-[15px] text-[#b15de8]" />
            <span>
              Brain<sup>2</sup>
            </span>
          </button>
          <span className="mx-1 h-5 w-px bg-line" />
          <button
            type="button"
            onClick={soon('Sharing')}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-[13px] text-ink hover:bg-hover"
          >
            <Lock className="h-3 w-3 text-ink-faint" />
            Share
            <span className="text-ink-faint">· 2</span>
          </button>
        </div>
      </div>

      {/* ---- View tabs ---- */}
      <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-line px-4">
        <button
          type="button"
          onClick={soon('Channel creation')}
          className="h-7 cursor-pointer rounded-md px-2 text-[13px] text-ink-soft hover:bg-hover"
        >
          Add Channel
        </button>
        <span className="mx-1.5 h-4 w-px bg-line" />
        {VIEW_TABS.map((tab) => {
          const Icon = tab.icon
          const active = tab.label === 'Overview'
          return (
            <button
              key={tab.label}
              type="button"
              onClick={
                active ? () => navigate(`/space/${space.id}`) : soon(`The space ${tab.label} view`)
              }
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
        <button
          type="button"
          onClick={soon('Custom views')}
          className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[13px] text-ink-soft hover:bg-hover"
        >
          <Plus className="h-[13px] w-[13px]" />
          View
        </button>
      </div>

      {/* ---- Scrollable canvas ---- */}
      <div className="flex-1 overflow-y-auto bg-panel/60">
        {/* Hint banner */}
        {hintVisible && (
          <div className="relative flex items-center justify-center gap-1 border-b border-line bg-hover/70 px-10 py-2 text-[13px] text-ink-soft">
            <span className="truncate">
              Get the most out of your Overview! Add, reorder, and resize cards to customize this
              page
            </span>
            <button
              type="button"
              onClick={soon('Overview customization')}
              className="cursor-pointer whitespace-nowrap text-ink underline"
            >
              Get Started
            </button>
            <button
              type="button"
              title="Dismiss"
              onClick={() => setHintVisible(false)}
              className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
            >
              <X className="h-3.5 w-3.5 text-ink-soft" />
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2 px-6 py-3">
          {toolbarLoading ? (
            <div className="flex h-7 items-center gap-1.5 text-[12px] text-ink-faint">
              <RefreshCw className="h-[13px] w-[13px] animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={soon('Auto-refresh settings')}
              className="animate-fade-in flex h-7 cursor-pointer items-center gap-1.5 rounded-full bg-[#eee9ff] px-2.5 text-[12.5px] font-medium text-brand-deep hover:bg-[#e3dbfd]"
            >
              <Clock className="h-3 w-3" />
              Auto refresh: On
            </button>
          )}
          <TipButton tip="Filter cards" onClick={soon('Overview filters')}>
            <ListFilter className="h-4 w-4" />
          </TipButton>
          <TipButton tip="Overview settings" onClick={soon('Overview settings')}>
            <Settings className="h-4 w-4" />
          </TipButton>
          <button
            type="button"
            onClick={soon('Custom cards')}
            className="flex h-7 cursor-pointer items-center gap-1 rounded-md bg-[#3e2fa0] px-3 text-[13px] font-medium text-white hover:bg-[#33278c]"
          >
            <Plus className="h-[13px] w-[13px]" />
            Card
          </button>
        </div>

        {/* Cards */}
        <div className="px-6 pb-8">
          {cardsLoading ? (
            <div className="animate-fade-in">
              <div className="grid grid-cols-3 gap-4">
                <SkeletonCard lines={7} />
                <SkeletonCard lines={1} />
                <SkeletonCard lines={4} />
              </div>
              <SkeletonCard lines={1} className="mt-4" />
              <SkeletonCard lines={1} className="mt-4" />
            </div>
          ) : (
            <div className="animate-rise-in">
              <div className="grid grid-cols-3 gap-4">
                <OverviewCard title="Recent" soon={soon}>
                  {recentRows.map((row) => {
                    const Icon = row.icon === 'folder' ? FolderOpen : List
                    return (
                      <div
                        key={row.key}
                        onClick={() => navigate(row.to)}
                        className="group/row -mx-1.5 flex h-8 cursor-pointer items-center gap-2 rounded-md px-1.5 hover:bg-hover"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
                        <span className="truncate text-[13px] text-ink">{row.name}</span>
                        <span className="shrink-0 text-[12px] text-ink-faint">
                          • in{' '}
                          <span className={row.tint ? 'text-brand' : ''}>{row.parent}</span>
                        </span>
                        <span className="ml-auto hidden shrink-0 items-center gap-0.5 group-hover/row:flex">
                          <button
                            type="button"
                            title="Open"
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation()
                              navigate(row.to)
                            }}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-active-row"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Copy link"
                            onClick={(e: MouseEvent) => {
                              e.stopPropagation()
                              copyLink(row.to)
                            }}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-active-row"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                    )
                  })}
                </OverviewCard>

                <OverviewCard title="Docs" soon={soon}>
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex h-8 min-w-0 items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#2e9ded]" />
                      <button
                        type="button"
                        onClick={soon('The Docs screen')}
                        className="cursor-pointer truncate text-[13px] text-ink hover:underline"
                      >
                        {doc.name}
                      </button>
                      <span className="truncate text-[12px] text-ink-faint">
                        • in {doc.location}
                      </span>
                    </div>
                  ))}
                </OverviewCard>

                <OverviewCard title="Bookmarks" soon={soon}>
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
                      type="button"
                      onClick={soon('Bookmarks')}
                      className="h-8 cursor-pointer rounded-md bg-[#3e2fa0] px-3 text-[13px] font-medium text-white hover:bg-[#33278c]"
                    >
                      Add Bookmark
                    </button>
                  </div>
                </OverviewCard>
              </div>

              <OverviewCard title="Folders" soon={soon} className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {space.folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => navigate(`/space/${space.id}/folder/${f.id}`)}
                      className="flex h-11 w-[347px] max-w-full cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 hover:bg-hover"
                    >
                      <FolderOpen className="h-4 w-4 shrink-0 text-ink-soft" />
                      <span className="truncate text-[14px] text-ink">{f.name}</span>
                    </button>
                  ))}
                </div>
              </OverviewCard>

              <OverviewCard title="Lists" soon={soon} className="mt-4">
                <div className="flex flex-wrap gap-3">
                  {listTiles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/space/${space.id}/list/${item.id}`)}
                      className="flex h-11 w-[347px] max-w-full cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 hover:bg-hover"
                    >
                      <List className="h-4 w-4 shrink-0 text-ink-soft" />
                      <span className="truncate text-[14px] text-ink">{item.name}</span>
                    </button>
                  ))}
                </div>
              </OverviewCard>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
