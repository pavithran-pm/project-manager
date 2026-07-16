import { Navigate, useParams } from 'react-router-dom'
import { findFolder, useAppStore } from '../../lib/store'
import type { SpaceView } from '../../lib/types'
import { ComingSoonPanel } from './ComingSoonPanel'
import { ListView } from './ListView'
import { OverviewTab } from './OverviewTab'
import { SpaceHeader } from './SpaceHeader'

export function FolderPage() {
  const { spaceId, folderId, view } = useParams()
  const spaces = useAppStore((s) => s.spaces)

  const found = folderId ? findFolder(spaces, folderId) : undefined
  if (!spaceId || !folderId || !found) return <Navigate to="/home" replace />

  const activeView = (view ?? 'overview') as SpaceView

  let content
  if (activeView === 'overview') {
    content = <OverviewTab folderId={folderId} />
  } else if (activeView === 'list') {
    content = (
      <ListView
        listIds={found.folder.items.filter((i) => i.icon !== 'whiteboard').map((i) => i.id)}
      />
    )
  } else {
    content = <ComingSoonPanel view={activeView} />
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <SpaceHeader spaceId={spaceId} folderId={folderId} activeView={activeView} />
      {content}
    </main>
  )
}
