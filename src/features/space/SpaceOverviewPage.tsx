import { useParams, Navigate } from 'react-router-dom'
import { useAppStore } from '../../lib/store'

export function SpaceOverviewPage() {
  const { spaceId } = useParams()
  const spaces = useAppStore((s) => s.spaces)
  const space = spaces.find((sp) => sp.id === spaceId)
  if (!space) return <Navigate to="/home" replace />
  return <main className="flex min-w-0 flex-1 flex-col bg-white" />
}
