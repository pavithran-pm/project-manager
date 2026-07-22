import { Navigate, useParams } from 'react-router-dom'
import { findFolder, useAppStore } from '../../lib/store'
import type { SpaceView } from '../../lib/types'
import { PromoBanner } from '../inbox/PromoBanner'
import { ComingSoonPanel } from './ComingSoonPanel'
import { BoardView } from './BoardView'
import { FolderListView } from './FolderListView'
import { OverviewTab } from './OverviewTab'
import { SpaceHeader } from './SpaceHeader'
import { SprintReportingUpsell, ViewPaywall } from './PaywallViews'
import { TableView } from './TableView'

export function FolderPage() {
  const { spaceId, folderId, view } = useParams()
  const spaces = useAppStore((s) => s.spaces)

  const found = folderId ? findFolder(spaces, folderId) : undefined
  if (!spaceId || !folderId || !found) return <Navigate to="/home" replace />

  const activeView = (view ?? 'overview') as SpaceView

  const listIds = found.folder.items.filter((i) => i.icon !== 'whiteboard').map((i) => i.id)
  let content
  if (activeView === 'overview') {
    content = <OverviewTab folderId={folderId} />
  } else if (activeView === 'list') {
    content = <FolderListView folderId={folderId} />
  } else if (activeView === 'board') {
    content = <BoardView listIds={listIds} />
  } else if (activeView === 'table') {
    content = <TableView listIds={listIds} />
  } else if (activeView === 'timeline' || activeView === 'workload') {
    content = <ViewPaywall view={activeView} />
  } else if (activeView === 'sprint-reporting') {
    content = <SprintReportingUpsell />
  } else {
    content = <ComingSoonPanel view={activeView} />
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <PromoBanner />
      <SpaceHeader spaceId={spaceId} folderId={folderId} activeView={activeView} />
      {content}
    </main>
  )
}
