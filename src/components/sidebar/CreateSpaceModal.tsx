import { useEffect, useState } from 'react'
import { ChevronDown, Info, UserRound, X } from 'lucide-react'
import { useAppStore } from '../../lib/store'

/** "Create a Space" dialog. Always mounted by Sidebar; renders nothing until opened. */
export function CreateSpaceModal() {
  const open = useAppStore((s) => s.createSpaceOpen)
  const closeCreateSpace = useAppStore((s) => s.closeCreateSpace)
  const createSpace = useAppStore((s) => s.createSpace)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateSpace()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeCreateSpace])

  if (!open) return null

  const letter = name.trim() ? name.trim().charAt(0).toUpperCase() : 'S'

  const submit = () => {
    createSpace(name, description, isPrivate)
    setName('')
    setDescription('')
    setIsPrivate(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCreateSpace()
      }}
    >
      <div className="relative w-[560px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={closeCreateSpace}
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
        >
          <X className="h-3.5 w-3.5 text-ink-soft" />
        </button>

        <h2 className="text-[17px] font-semibold text-ink">Create a Space</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          A Space represents teams, departments, or groups, each with its own Lists, workflows, and
          settings.
        </p>

        <div className="mt-5 mb-1.5 text-[12.5px] font-semibold text-ink">Icon & name</div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-line-strong bg-panel text-[15px] font-semibold text-ink-soft">
            {letter}
          </span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing, Engineering, HR"
            className="h-10 flex-1 rounded-lg border-2 border-ink px-3 text-[14px] outline-none placeholder:text-ink-faint"
          />
        </div>

        <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-ink">
          Description <span className="font-normal text-ink-faint">(optional)</span>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-9 w-full rounded-lg border border-line-strong px-3 text-[13.5px] outline-none focus:border-ink"
        />

        <div className="mt-5 flex items-center gap-1.5">
          <UserRound className="h-[15px] w-[15px] shrink-0 text-ink-soft" />
          <span className="text-[13.5px] text-ink">Default permission</span>
          <Info className="h-[13px] w-[13px] shrink-0 text-ink-faint" />
          <button
            type="button"
            className="ml-auto flex h-7 cursor-pointer items-center gap-1 rounded-md border border-line-strong px-2 text-[12.5px] text-ink hover:bg-hover"
          >
            Full edit
            <ChevronDown className="h-3 w-3 text-ink-faint" />
          </button>
        </div>

        <div className="mt-5 flex items-center">
          <div>
            <div className="text-[13.5px] font-medium text-ink">Make Private</div>
            <div className="text-[12.5px] text-ink-soft">
              Only you and invited members have access
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPrivate}
            aria-label="Make Private"
            onClick={() => setIsPrivate((p) => !p)}
            className={`ml-auto h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors ${
              isPrivate ? 'bg-brand' : 'bg-line-strong'
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                isPrivate ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
          <button
            type="button"
            className="cursor-pointer text-[13.5px] text-ink-soft hover:text-ink"
          >
            Use Templates
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={submit}
            className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
