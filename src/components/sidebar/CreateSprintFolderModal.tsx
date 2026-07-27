import { useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Info,
  Ruler,
  SquarePen,
  Timer,
  X,
  Zap,
} from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

type View = 'main' | 'automations' | 'settings'
type Effort = 'Sprint points' | 'Time Estimate'

/** Reusable toggle switch matching the house pattern (CreateSpaceModal). */
function Toggle({
  on,
  onToggle,
  label,
  disabled,
}: {
  on: boolean
  onToggle: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors ${
        disabled ? 'opacity-50' : ''
      } ${on ? 'bg-brand' : 'bg-line-strong'}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/** Gray "Business" plan pill shown next to gated automations. */
function BusinessPill() {
  return (
    <span className="rounded bg-line px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
      Business
    </span>
  )
}

/** Tiny inline number input rendered mid-sentence in the automations copy. */
function InlineNumber({
  value,
  onChange,
  label,
  disabled,
}: {
  value: number
  onChange?: (v: number) => void
  label: string
  disabled?: boolean
}) {
  return (
    <input
      type="number"
      min={1}
      aria-label={label}
      value={value}
      readOnly={disabled}
      onChange={(e) => onChange?.(Math.max(1, Number(e.target.value) || 1))}
      className={`mx-1 h-6 w-9 rounded border border-line-strong text-center text-[12px] text-ink outline-none focus:border-ink ${
        disabled ? 'opacity-50' : ''
      }`}
    />
  )
}

/** "Create Sprint folder" wizard. Always mounted; renders nothing until opened. */
export function CreateSprintFolderModal() {
  const spaceId = useAppStore((s) => s.createSprintFolderFor)
  const closeCreateSprintFolder = useAppStore((s) => s.closeCreateSprintFolder)
  const createSprintFolder = useAppStore((s) => s.createSprintFolder)
  const notify = useAppStore((s) => s.notify)

  const [view, setView] = useState<View>('main')

  // Main view local state
  const [folderName, setFolderName] = useState('')
  const [effort, setEffort] = useState<Effort>('Sprint points')
  const [effortOpen, setEffortOpen] = useState(false)
  const effortRef = useRef<HTMLDivElement>(null)

  // Automations local state — only the ungated "Mark Sprint as done" is interactive;
  // the three Business-plan automations are gated (disabled + comingSoon), matching the
  // app's deliberate-paywall convention for Business features.
  const [autoMarkDone, setAutoMarkDone] = useState(true)

  // Settings local state
  const [sprintName, setSprintName] = useState('')
  const [duration, setDuration] = useState(2)
  const [dateFormat, setDateFormat] = useState('MM/DD')
  const [timezone, setTimezone] = useState('(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi')
  const [startDay, setStartDay] = useState('Monday')
  const [startTime, setStartTime] = useState('12:00 am')
  const [nonWorkingDays, setNonWorkingDays] = useState('Sunday, Saturday')
  const [lockForecast, setLockForecast] = useState(false)
  const [autoDashboard, setAutoDashboard] = useState(true)

  const open = spaceId != null

  // Reset wizard + all fields whenever the modal (re)opens — the component
  // stays mounted, so without this the last view/inputs would linger.
  useEffect(() => {
    if (!open) return
    setView('main')
    setFolderName('')
    setEffort('Sprint points')
    setEffortOpen(false)
    setAutoMarkDone(true)
    setSprintName('')
    setDuration(2)
    setDateFormat('MM/DD')
    setTimezone('(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi')
    setStartDay('Monday')
    setStartTime('12:00 am')
    setNonWorkingDays('Sunday, Saturday')
    setLockForecast(false)
    setAutoDashboard(true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateSprintFolder()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeCreateSprintFolder])

  // Dismiss the Measure-of-effort dropdown on any click outside it.
  useEffect(() => {
    if (!effortOpen) return
    const onDown = (e: MouseEvent) => {
      if (effortRef.current && !effortRef.current.contains(e.target as Node)) setEffortOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [effortOpen])

  if (spaceId == null) return null

  const create = () => {
    createSprintFolder(spaceId, folderName.trim() || 'Sprint Folder', 1)
  }

  const panelWidth = view === 'settings' ? 'w-[640px]' : 'w-[560px]'

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCreateSprintFolder()
      }}
    >
      <div
        className={`animate-pop-in relative ${panelWidth} max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={closeCreateSprintFolder}
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
        >
          <X className="h-3.5 w-3.5 text-ink-soft" />
        </button>

        {view === 'main' && (
          <>
            <h2 className="text-[17px] font-semibold text-ink">Create Sprint folder</h2>
            <p className="mt-1 pr-6 text-[13px] text-ink-soft">
              Sprint folders help keep your Sprints organized and let you manage Sprint-specific
              settings.
            </p>

            <div className="mt-5 mb-1.5 text-[12.5px] font-semibold text-ink">Folder Name</div>
            <input
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Sprint Folder (1)"
              className="h-10 w-full rounded-lg border border-line-strong px-3 text-[14px] outline-none placeholder:text-ink-faint focus:border-ink"
            />

            <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-ink">Measure of effort</div>
            <div className="relative" ref={effortRef}>
              <button
                type="button"
                onClick={() => setEffortOpen((o) => !o)}
                className="flex h-10 w-full items-center justify-between rounded-lg border border-line-strong px-3 text-[14px] text-ink hover:bg-hover"
              >
                <span className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-ink-faint" />
                  {effort}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-ink-faint transition-transform ${
                    effortOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {effortOpen && (
                <div className="animate-pop-in absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-white py-1 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setEffort('Sprint points')
                      setEffortOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] text-ink hover:bg-hover"
                  >
                    <Ruler className="h-4 w-4 text-ink-faint" />
                    <span className="flex-1">Sprint points</span>
                    {effort === 'Sprint points' && <Check className="h-4 w-4 text-ink" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEffort('Time Estimate')
                      setEffortOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] text-ink hover:bg-hover"
                  >
                    <Timer className="h-4 w-4 text-ink-faint" />
                    <span className="flex-1">Time Estimate</span>
                    {effort === 'Time Estimate' && <Check className="h-4 w-4 text-ink" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEffortOpen(false)
                      comingSoon(notify, 'Custom Field measure of effort')
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13.5px] text-ink hover:bg-hover"
                  >
                    <SquarePen className="h-4 w-4 text-ink-faint" />
                    <span className="flex flex-1 items-center gap-1">
                      Custom Field
                      <Info className="h-3 w-3 text-ink-faint" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-faint" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 mb-2 text-[12.5px] font-semibold text-ink">Settings</div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setView('automations')}
                className="flex w-full items-center gap-3 rounded-lg border border-line-strong px-3 py-2.5 text-left hover:bg-hover"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel">
                  <Zap className="h-4 w-4 text-[#f5a623]" fill="#f5a623" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-ink">Automate Sprints</span>
                  <span className="block truncate text-[12.5px] text-ink-soft">
                    When Sprint ends then Mark Sprint as done, + 3 more…
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </button>

              <button
                type="button"
                onClick={() => setView('settings')}
                className="flex w-full items-center gap-3 rounded-lg border border-line-strong px-3 py-2.5 text-left hover:bg-hover"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel">
                  <CirclePlay className="h-4 w-4 text-brand" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-ink">Sprint settings</span>
                  <span className="block truncate text-[12.5px] text-ink-soft">
                    Format, Timezone, Start date, Start time, + 1 more…
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </button>
            </div>

            <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
              <button
                type="button"
                onClick={() => comingSoon(notify, 'Learn more about Sprints')}
                className="flex cursor-pointer items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <Info className="h-3.5 w-3.5" />
                Learn more about Sprints
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCreateSprintFolder}
                  className="h-9 cursor-pointer rounded-lg px-4 text-[13.5px] font-medium text-ink-soft hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setView('automations')}
                  className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'automations' && (
          <>
            <h2 className="text-[17px] font-semibold text-ink">Automations</h2>
            <p className="mt-1 pr-6 text-[13px] text-ink-soft">
              Automate creating new sprints, moving spillover tasks, and keep your sprint folder
              clean with auto archive.
            </p>

            <div className="mt-5 space-y-2.5">
              {/* Row 1 */}
              <div className="flex items-start gap-3 rounded-lg border border-line-strong px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink">
                    When <span className="font-semibold">Sprint ends</span> then{' '}
                    <span className="font-semibold">Mark Sprint as done</span>
                  </div>
                  <div className="mt-1 text-[12.5px] text-ink-soft">
                    If a Sprint isn't manually marked done, mark it as done on the Sprint end date.
                  </div>
                </div>
                <Toggle
                  on={autoMarkDone}
                  onToggle={() => setAutoMarkDone((v) => !v)}
                  label="Mark Sprint as done"
                />
              </div>

              {/* Row 2 */}
              <div className="flex items-start gap-3 rounded-lg border border-line-strong px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink">
                    When <span className="font-semibold">Sprint is done</span> then{' '}
                    <span className="font-semibold">Create new Sprint</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center text-[12.5px] text-ink-soft">
                    Always create the next
                    <InlineNumber value={1} disabled label="Number of sprints to create" />
                    sprint(s) if they aren't already created.
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <BusinessPill />
                  <Toggle
                    on={false}
                    disabled
                    onToggle={() => comingSoon(notify, 'Business automations')}
                    label="Create new Sprint"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-start gap-3 rounded-lg border border-line-strong px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink">
                    When <span className="font-semibold">Sprint is done</span> then{' '}
                    <span className="font-semibold">Move incomplete tasks to next Sprint</span>
                  </div>
                  <div className="mt-1 text-[12.5px] text-ink-soft">
                    This will create a new Sprint if it doesn't already exist.
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <BusinessPill />
                  <Toggle
                    on={false}
                    disabled
                    onToggle={() => comingSoon(notify, 'Business automations')}
                    label="Move incomplete tasks to next Sprint"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex items-start gap-3 rounded-lg border border-line-strong px-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] text-ink">
                    When <span className="font-semibold">Sprint is done</span> then{' '}
                    <span className="font-semibold">Auto Archive old sprints</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center text-[12.5px] text-ink-soft">
                    Sprints before the most recent
                    <InlineNumber value={3} disabled label="Number of sprints to keep" />
                    Sprints will be automatically archived.
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <BusinessPill />
                  <Toggle
                    on={false}
                    disabled
                    onToggle={() => comingSoon(notify, 'Business automations')}
                    label="Auto Archive old sprints"
                  />
                </div>
              </div>
            </div>

            <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
              <button
                type="button"
                onClick={() => setView('main')}
                className="h-9 cursor-pointer rounded-lg border border-line-strong px-4 text-[13.5px] font-medium text-ink hover:bg-hover"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCreateSprintFolder}
                  className="h-9 cursor-pointer rounded-lg px-4 text-[13.5px] font-medium text-ink-soft hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={create}
                  className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black"
                >
                  Create
                </button>
              </div>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-[17px] font-semibold text-ink">Sprint settings</h2>

            <div className="mt-5 mb-1.5 text-[12.5px] font-semibold text-ink">Sprint name</div>
            <input
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="Sprint {INDEX} ({START_DATE} - {END_DATE})"
              className="h-10 w-full rounded-lg border border-line-strong px-3 text-[14px] outline-none placeholder:text-ink-faint focus:border-ink"
            />

            <div className="mt-4 mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-ink">
              Default template
              <Info className="h-3 w-3 text-ink-faint" />
            </div>
            <button
              type="button"
              onClick={() => comingSoon(notify, 'Sprint templates')}
              className="h-9 cursor-pointer rounded-lg border border-line-strong px-3 text-[13.5px] font-medium text-ink hover:bg-hover"
            >
              + Add a template
            </button>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Duration (weeks)</div>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                  className="h-9 w-full rounded-lg border border-line-strong px-3 text-[13.5px] text-ink outline-none focus:border-ink"
                />
              </div>
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Date format</div>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                >
                  <option>MM/DD</option>
                  <option>DD/MM</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Timezone</div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                >
                  <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                  <option>(GMT+00:00) UTC</option>
                  <option>(GMT-05:00) Eastern Time</option>
                  <option>(GMT-08:00) Pacific Time</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Sprint start day</div>
                <select
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </div>
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Start time</div>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                >
                  <option>12:00 am</option>
                  <option>6:00 am</option>
                  <option>9:00 am</option>
                  <option>12:00 pm</option>
                </select>
              </div>
              <div>
                <div className="mb-1.5 text-[12.5px] font-semibold text-ink">Non-working days</div>
                <select
                  value={nonWorkingDays}
                  onChange={(e) => setNonWorkingDays(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-line-strong bg-white px-2.5 text-[13.5px] text-ink outline-none focus:border-ink"
                >
                  <option>Sunday, Saturday</option>
                  <option>Sunday</option>
                  <option>Saturday</option>
                  <option>None</option>
                </select>
              </div>
            </div>

            <div className="mt-5 mb-2 text-[12.5px] font-semibold text-ink">Advanced settings</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex-1 text-[13.5px] text-ink">
                  Lock forecast for each Sprint on start day and start time
                </span>
                <Toggle
                  on={lockForecast}
                  onToggle={() => setLockForecast((v) => !v)}
                  label="Lock forecast for each Sprint"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-1 text-[13.5px] text-ink">
                  Automatically create a Dashboard view for each Sprint
                </span>
                <Toggle
                  on={autoDashboard}
                  onToggle={() => setAutoDashboard((v) => !v)}
                  label="Automatically create a Dashboard view"
                />
              </div>
            </div>

            <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
              <button
                type="button"
                onClick={() => setView('main')}
                className="h-9 cursor-pointer rounded-lg border border-line-strong px-4 text-[13.5px] font-medium text-ink hover:bg-hover"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCreateSprintFolder}
                  className="h-9 cursor-pointer rounded-lg px-4 text-[13.5px] font-medium text-ink-soft hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setView('main')}
                  className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
