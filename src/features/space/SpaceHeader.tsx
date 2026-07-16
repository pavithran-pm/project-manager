import type { SpaceView } from '../../lib/types'

export interface SpaceHeaderProps {
  spaceId: string
  folderId?: string
  listId?: string
  activeView: SpaceView
}

export function SpaceHeader(_props: SpaceHeaderProps) {
  return <div className="shrink-0 border-b border-line bg-white" />
}
