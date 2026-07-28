import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { comingSoon, useAppStore } from '../../lib/store'
import {
  CLICKAPPS,
  SPACE_ICON_COLORS,
  SPACE_VIEWS,
  type SpacePreset,
} from './space-wizard/contract'
import { BasicsStep } from './space-wizard/BasicsStep'
import { WorkflowStep } from './space-wizard/WorkflowStep'
import { ViewsPanel } from './space-wizard/ViewsPanel'
import { ClickAppsPanel } from './space-wizard/ClickAppsPanel'
import { StatusesPanel } from './space-wizard/StatusesPanel'

type View = 'basics' | 'workflow' | 'views' | 'clickapps' | 'statuses'

const defaultViews = (): Record<string, boolean> =>
  Object.fromEntries(SPACE_VIEWS.map((v) => [v.key, Boolean(v.defaultOn || v.required)]))
const defaultClickApps = (): Record<string, boolean> =>
  Object.fromEntries(CLICKAPPS.map((c) => [c.key, Boolean(c.defaultOn)]))

/**
 * "Create a Space" wizard. Always mounted by Sidebar; renders nothing until opened.
 * Owns ALL selection state + store wiring; each step/panel is a pure presentational
 * component (see space-wizard/contract.ts). Views/ClickApps/Statuses are local sub-views
 * (not separate store flags), Back-navigable to the workflow step.
 *
 * Honest scope: creating a Space applies the name, icon color, and private flag. The
 * preset, default-views toggles, ClickApps grid, and statuses are faithful UI that don't
 * change app behavior (there's no per-Space view/status/ClickApp system to persist into).
 */
export function CreateSpaceModal() {
  const open = useAppStore((s) => s.createSpaceOpen)
  const closeCreateSpace = useAppStore((s) => s.closeCreateSpace)
  const createSpace = useAppStore((s) => s.createSpace)
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const notify = useAppStore((s) => s.notify)

  const members = useMemo(
    () =>
      Object.values(users)
        .filter((u) => !u.deactivated)
        .map((u) => ({ id: u.id, name: u.name, initials: u.initials, color: u.color })),
    [users],
  )

  const [view, setView] = useState<View>('basics')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(SPACE_ICON_COLORS[0])
  const [isPrivate, setIsPrivate] = useState(false)
  const [shareWith, setShareWith] = useState<string[]>([])
  const [preset, setPreset] = useState<SpacePreset>('project')
  const [viewsEnabled, setViewsEnabled] = useState<Record<string, boolean>>(defaultViews)
  const [clickAppsEnabled, setClickAppsEnabled] = useState<Record<string, boolean>>(defaultClickApps)

  // Reset the whole wizard each time it (re)opens — it stays mounted.
  // useLayoutEffect commits the reset before paint, so no stale frame flashes.
  useLayoutEffect(() => {
    if (!open) return
    setView('basics')
    setName('')
    setDescription('')
    setColor(SPACE_ICON_COLORS[0])
    setIsPrivate(false)
    setShareWith([])
    setPreset('project')
    setViewsEnabled(defaultViews())
    setClickAppsEnabled(defaultClickApps())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateSpace()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeCreateSpace])

  if (!open) return null

  // Turning a Space private auto-includes the creator ("Me"), matching ClickUp.
  const handlePrivate = (v: boolean) => {
    setIsPrivate(v)
    setShareWith((cur) => (v ? (cur.length ? cur : [currentUserId]) : []))
  }
  const toggleShare = (id: string) =>
    setShareWith((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  const toggleView = (key: string) => {
    const def = SPACE_VIEWS.find((v) => v.key === key)
    if (def?.required) return
    setViewsEnabled((cur) => ({ ...cur, [key]: !cur[key] }))
  }
  const toggleClickApp = (key: string) => {
    const def = CLICKAPPS.find((c) => c.key === key)
    if (def?.gated) return
    setClickAppsEnabled((cur) => ({ ...cur, [key]: !cur[key] }))
  }
  const turnOffAllClickApps = () =>
    setClickAppsEnabled(() =>
      Object.fromEntries(CLICKAPPS.map((c) => [c.key, false])),
    )

  const create = () => {
    createSpace(name.trim() || 'New Space', description, isPrivate, color)
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCreateSpace()
      }}
    >
      {view === 'basics' && (
        <BasicsStep
          name={name}
          onName={setName}
          description={description}
          onDescription={setDescription}
          color={color}
          onColor={setColor}
          isPrivate={isPrivate}
          onPrivate={handlePrivate}
          shareWith={shareWith}
          onToggleShare={toggleShare}
          members={members}
          currentUserId={currentUserId}
          onNext={() => setView('workflow')}
          onClose={closeCreateSpace}
          onUseTemplates={() => comingSoon(notify, 'Space templates')}
        />
      )}
      {view === 'workflow' && (
        <WorkflowStep
          preset={preset}
          onPreset={setPreset}
          onOpenViews={() => setView('views')}
          onOpenStatuses={() => setView('statuses')}
          onOpenClickApps={() => setView('clickapps')}
          onBack={() => setView('basics')}
          onCreate={create}
          onClose={closeCreateSpace}
        />
      )}
      {view === 'views' && (
        <ViewsPanel
          enabled={viewsEnabled}
          onToggle={toggleView}
          onBack={() => setView('workflow')}
          onClose={closeCreateSpace}
          onDone={() => setView('workflow')}
        />
      )}
      {view === 'clickapps' && (
        <ClickAppsPanel
          enabled={clickAppsEnabled}
          onToggle={toggleClickApp}
          onTurnOffAll={turnOffAllClickApps}
          onBack={() => setView('workflow')}
          onClose={closeCreateSpace}
          onDone={() => setView('workflow')}
        />
      )}
      {view === 'statuses' && (
        <StatusesPanel
          preset={preset}
          onBack={() => setView('workflow')}
          onClose={closeCreateSpace}
          onDone={() => setView('workflow')}
        />
      )}
    </div>
  )
}
