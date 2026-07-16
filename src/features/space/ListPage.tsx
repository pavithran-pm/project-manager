import { Navigate, useParams } from 'react-router-dom'
import { findListItem, useAppStore } from '../../lib/store'
import type { SpaceView } from '../../lib/types'
import { ComingSoonPanel } from './ComingSoonPanel'
import { ListView } from './ListView'
import { SpaceHeader } from './SpaceHeader'

export function ListPage() {
  const { spaceId, listId, view } = useParams()
  const spaces = useAppStore((s) => s.spaces)

  const found = listId ? findListItem(spaces, listId) : undefined
  if (!spaceId || !listId || !found) return <Navigate to="/home" replace />

  const activeView = (view ?? 'list') as SpaceView

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <SpaceHeader spaceId={spaceId} listId={listId} activeView={activeView} />
      {activeView === 'list' ? (
        <ListView listIds={[listId]} />
      ) : (
        <ComingSoonPanel view={activeView} />
      )}
    </main>
  )
}
