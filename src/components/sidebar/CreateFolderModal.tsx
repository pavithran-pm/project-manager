import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, CircleDashed, X } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'
import type { Space } from '../../lib/types'

/**
 * "Create Folder" dialog. Always mounted at the App root; renders nothing until opened.
 * Description and Make-private are cosmetic (SpaceFolder has no such fields) — they mirror
 * the real dialog's controls but intentionally don't persist.
 */
export function CreateFolderModal() {
  const createFolderFor = useAppStore((s) => s.createFolderFor)
  const closeCreateFolder = useAppStore((s) => s.closeCreateFolder)
  const createFolder = useAppStore((s) => s.createFolder)
  const spaces = useAppStore((s) => s.spaces)
  const notify = useAppStore((s) => s.notify)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (!createFolderFor) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateFolder()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [createFolderFor, closeCreateFolder])

  // Reset local fields whenever the dialog is (re)opened.
  useEffect(() => {
    if (createFolderFor) {
      setName('')
      setDescription('')
      setIsPrivate(false)
    }
  }, [createFolderFor])

  if (!createFolderFor) return null

  const space: Space | undefined = spaces.find((s) => s.id === createFolderFor)

  const submit = () => {
    if (!name.trim()) return
    createFolder(createFolderFor, name.trim())
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCreateFolder()
      }}
    >
      <div className="animate-pop-in relative w-[560px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={closeCreateFolder}
          className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
        >
          <X className="h-3.5 w-3.5 text-ink-soft" />
        </button>

        <h2 className="text-[17px] font-semibold text-ink">Create Folder</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          Use Folders to organize your Lists, Docs, and more.
        </p>

        <div className="mt-5 mb-1.5 text-[12.5px] font-semibold text-ink">Name</div>
        <div className="relative">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Project, Client, Team"
            className="h-10 w-full rounded-lg border-2 border-ink pr-10 pl-3 text-[14px] outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            aria-label="Folder icon"
            onClick={() => comingSoon(notify, 'Folder icon')}
            className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover"
          >
            <CircleDashed className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-ink">Description</div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us a bit about your Folder (optional)"
          className="h-9 w-full rounded-lg border border-line-strong px-3 text-[13.5px] outline-none focus:border-ink placeholder:text-ink-faint"
        />

        <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-ink">Select a Location</div>
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Change location')}
          className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-line-strong px-3 text-left hover:bg-hover"
        >
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
            style={{ backgroundColor: space?.color ?? '#7b68ee' }}
          >
            {space?.abbr ?? space?.name.charAt(0).toUpperCase() ?? 'S'}
          </span>
          <span className="flex-1 truncate text-[13.5px] text-ink">{space?.name ?? 'Space'}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        </button>

        <div className="mt-5 mb-2 text-[12.5px] font-semibold text-ink">Settings</div>
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Statuses')}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-line-strong px-3 py-2.5 text-left hover:bg-hover"
        >
          <CircleDashed className="h-5 w-5 shrink-0 text-ink-soft" />
          <div className="flex-1">
            <div className="text-[13.5px] font-medium text-ink">Statuses</div>
            <div className="text-[12px] text-ink-soft">Use Space statuses</div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
        </button>

        <div className="mt-5 flex items-center">
          <div>
            <div className="text-[13.5px] font-medium text-ink">Make private</div>
            <div className="text-[12.5px] text-ink-soft">
              Only you and invited members have access
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPrivate}
            aria-label="Make private"
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
            onClick={() => comingSoon(notify, 'Folder templates')}
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
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
