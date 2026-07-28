import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Avatar } from '../../ui/Avatar'
import { SPACE_ICON_COLORS, type BasicsStepProps, type WizardMember } from './contract'

/**
 * Step 1 of the Create-a-Space wizard: icon + name, description, privacy, and
 * (when private) member sharing. PURE — all data via props, all changes via
 * callbacks. Local state only covers the two transient pickers (color swatches,
 * member dropdown) and the member search text.
 *
 * The wizard shell renders the backdrop and owns Escape/backdrop-click; this
 * component renders ONLY the white card.
 */
export function BasicsStep(props: BasicsStepProps) {
  const {
    name,
    onName,
    description,
    onDescription,
    color,
    onColor,
    isPrivate,
    onPrivate,
    shareWith,
    onToggleShare,
    members,
    currentUserId,
    onNext,
    onClose,
    onUseTemplates,
  } = props

  const [colorOpen, setColorOpen] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')

  const iconLetter = (name.trim().charAt(0) || 'S').toUpperCase()
  const canNext = name.trim().length > 0

  // Selected members, in the order they appear in `members` (stable chip order).
  const selectedMembers: WizardMember[] = members.filter((m) => shareWith.includes(m.id))

  const q = memberQuery.trim().toLowerCase()
  const filteredMembers: WizardMember[] = members.filter((m) => {
    const label = m.id === currentUserId ? 'me' : m.name.toLowerCase()
    return q === '' || label.includes(q) || m.name.toLowerCase().includes(q)
  })
  // Show the current user ("Me") first when present in the filtered list.
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (a.id === currentUserId) return -1
    if (b.id === currentUserId) return 1
    return 0
  })

  return (
    <div className="animate-pop-in relative w-[560px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-panel hover:bg-hover"
      >
        <X className="h-3.5 w-3.5 text-ink-soft" />
      </button>

      <h2 className="text-[17px] font-semibold text-ink">Create a Space</h2>
      <p className="mt-1 pr-6 text-[13px] leading-snug text-ink-soft">
        A Space represents teams, departments, or groups, each with its own Lists, workflows, and
        settings.
      </p>

      {/* Icon & name */}
      <div className="mt-5 mb-1.5 text-[12.5px] font-semibold text-ink">Icon &amp; name</div>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            type="button"
            aria-label="Space icon color"
            onClick={() => setColorOpen((o) => !o)}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[15px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {iconLetter}
          </button>

          {colorOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColorOpen(false)} />
              <div className="animate-pop-in absolute top-full left-0 z-20 mt-1.5 grid w-[184px] grid-cols-5 gap-2 rounded-lg border border-line bg-white p-2.5 shadow-2xl">
                {SPACE_ICON_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color ${c}`}
                    onClick={() => {
                      onColor(c)
                      setColorOpen(false)
                    }}
                    className={`h-7 w-7 cursor-pointer rounded-md transition-transform hover:scale-110 ${
                      c === color ? 'ring-2 ring-ink ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="e.g. Marketing, Engineering, HR"
          className="h-9 flex-1 rounded-lg border border-line-strong px-3 text-[14px] outline-none focus:border-ink placeholder:text-ink-faint"
        />
      </div>

      {/* Description */}
      <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-ink">
        Description <span className="font-normal text-ink-soft">(optional)</span>
      </div>
      <input
        value={description}
        onChange={(e) => onDescription(e.target.value)}
        className="h-9 w-full rounded-lg border border-line-strong px-3 text-[13.5px] outline-none focus:border-ink placeholder:text-ink-faint"
      />

      {/* Make Private */}
      <div className="mt-5 flex items-center">
        <div>
          <div className="text-[13.5px] font-medium text-ink">Make Private</div>
          <div className="text-[12.5px] text-ink-soft">Only you and invited members have access</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPrivate}
          aria-label="Make Private"
          onClick={() => onPrivate(!isPrivate)}
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

      {/* Share only with (private only) */}
      {isPrivate && (
        <div className="mt-4 flex items-center gap-3">
          <div className="text-[13.5px] font-medium text-ink">Share only with</div>
          <div className="relative flex items-center gap-1.5">
            {selectedMembers.map((m) => (
              <Avatar
                key={m.id}
                initials={m.initials}
                color={m.color}
                size={26}
                title={m.id === currentUserId ? 'Me' : m.name}
              />
            ))}

            <button
              type="button"
              aria-label="Add member"
              onClick={() => setMemberOpen((o) => !o)}
              className="flex h-[26px] w-[26px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong text-ink-faint hover:bg-hover"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>

            {memberOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMemberOpen(false)} />
                <div className="animate-pop-in absolute top-full left-0 z-20 mt-2 w-[240px] rounded-lg border border-line bg-white shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
                    <Search className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    <input
                      autoFocus
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search or enter email…"
                      className="w-full text-[13px] outline-none placeholder:text-ink-faint"
                    />
                  </div>
                  <div className="max-h-[220px] overflow-y-auto py-1">
                    {sortedMembers.length === 0 ? (
                      <div className="px-3 py-3 text-[12.5px] text-ink-faint">No members found</div>
                    ) : (
                      sortedMembers.map((m) => {
                        const isMe = m.id === currentUserId
                        const selected = shareWith.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onToggleShare(m.id)}
                            className={`flex w-full cursor-pointer items-center gap-2.5 px-3 py-1.5 text-left hover:bg-hover ${
                              selected ? 'bg-active-row' : ''
                            }`}
                          >
                            <Avatar initials={m.initials} color={m.color} size={24} />
                            <span
                              className={`truncate text-[13px] ${
                                isMe ? 'font-semibold text-ink' : 'text-ink'
                              }`}
                            >
                              {isMe ? 'Me' : m.name}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="-mx-6 -mb-6 mt-6 flex items-center justify-between rounded-b-xl border-t border-line bg-panel px-6 py-4">
        <button
          type="button"
          onClick={onUseTemplates}
          className="cursor-pointer text-[13.5px] text-ink-soft hover:text-ink"
        >
          Use Templates
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="h-9 cursor-pointer rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium text-white hover:bg-black disabled:cursor-default disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
