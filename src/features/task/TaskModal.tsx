import { useAppStore } from '../../lib/store'

export function TaskModal() {
  const selectedTaskId = useAppStore((s) => s.selectedTaskId)
  if (!selectedTaskId) return null
  return null
}
