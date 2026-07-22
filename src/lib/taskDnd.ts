/**
 * Shared drag state for task drag-and-drop across List, Board and Folder-list views.
 *
 * The ids of the task(s) currently being dragged are held at module scope so any
 * drop target can read them synchronously mid-drag — a dragstart never re-renders
 * the potential targets, so their handlers must consult this live value rather than
 * a stale render-time closure. Only one view is ever visible at a time, so a single
 * shared binding is sufficient (and lets selection-aware drags work everywhere).
 */
let draggedIds: string[] = []

export function beginTaskDrag(ids: string[]) {
  draggedIds = ids
}

export function endTaskDrag() {
  draggedIds = []
}

export function getDraggedTaskIds() {
  return draggedIds
}

export function isDraggingTasks() {
  return draggedIds.length > 0
}
