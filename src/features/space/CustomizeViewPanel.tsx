import { useAppStore } from '../../lib/store'

export function CustomizeViewPanel() {
  const open = useAppStore((s) => s.customizeViewOpen)
  if (!open) return null
  return null
}
