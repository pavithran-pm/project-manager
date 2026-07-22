import { Navigate, useParams } from 'react-router-dom'
import { findListItem, useAppStore } from '../../lib/store'
import type { SpaceView } from '../../lib/types'
import { PromoBanner } from '../inbox/PromoBanner'
import { BoardView } from './BoardView'
import { ComingSoonPanel } from './ComingSoonPanel'
import { ListView } from './ListView'
import { SpaceHeader } from './SpaceHeader'
import { SprintReportingUpsell, ViewPaywall } from './PaywallViews'
import { TableView } from './TableView'

export function ListPage() {
  const { spaceId, listId, view } = useParams()
  const spaces = useAppStore((s) => s.spaces)

  const found = listId ? findListItem(spaces, listId) : undefined
  if (!spaceId || !listId || !found) return <Navigate to="/home" replace />

  const activeView = (view ?? 'list') as SpaceView

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <PromoBanner />
      <SpaceHeader spaceId={spaceId} listId={listId} activeView={activeView} />
      {activeView === 'list' ? (
        <ListView listIds={[listId]} />
      ) : activeView === 'board' ? (
        <BoardView listIds={[listId]} />
      ) : activeView === 'table' ? (
        <TableView listIds={[listId]} />
      ) : activeView === 'timeline' || activeView === 'workload' ? (
        <ViewPaywall view={activeView} />
      ) : activeView === 'sprint-reporting' ? (
        <SprintReportingUpsell />
      ) : (
        <ComingSoonPanel view={activeView} />
      )}
    </main>
  )
}
