import { useAppStore } from '../../lib/store'

export function NewTaskModal() {
  const newTaskFor = useAppStore((s) => s.newTaskFor)
  if (!newTaskFor) return null
  return null
}
