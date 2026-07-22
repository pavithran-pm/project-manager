import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import {
  AtSign,
  Bell,
  Brain,
  ChevronDown,
  CircleCheck,
  Ellipsis,
  ListFilter,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  SmilePlus,
  ThumbsUp,
  UserRoundCheck,
  Video,
  WandSparkles,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'
import type { ActivityEntry, Task, User } from '../../lib/types'

type EventEntry = Extract<ActivityEntry, { kind: 'event' }>
type CommentEntry = Extract<ActivityEntry, { kind: 'comment' }>

/** Feed rendering plan: entries interleaved with collapsed "Show more" runs. */
type FeedNode =
  | { kind: 'entry'; entry: ActivityEntry; revealed?: boolean }
  | { kind: 'more'; key: string; entries: EventEntry[] }

const LINK_BLUE = '#5b7ff0'
const SKELETON: { width?: string; height: number; full?: boolean }[] = [
  { width: '84%', height: 12 },
  { width: '56%', height: 12 },
  { height: 68, full: true },
  { width: '68%', height: 12 },
]

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Event text with known member names darkened; the rest stays gray. */
function withNames(text: string, nameRe: RegExp | null): ReactNode {
  if (!nameRe) return text
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(nameRe)) {
    const at = m.index ?? 0
    if (at > last) out.push(<span key={`t${i++}`}>{text.slice(last, at)}</span>)
    out.push(
      <span key={`n${i++}`} className="font-medium text-ink">
        {m[0]}
      </span>,
    )
    last = at + m[0].length
  }
  if (last === 0) return text
  if (last < text.length) out.push(<span key={`t${i++}`}>{text.slice(last)}</span>)
  return out
}

/** Comment body with purple "@Name" mentions. */
function withMentions(text: string, mentionRe: RegExp | null): ReactNode {
  if (!mentionRe) return text
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(mentionRe)) {
    const at = m.index ?? 0
    if (at > last) out.push(<span key={`t${i++}`}>{text.slice(last, at)}</span>)
    out.push(
      <span key={`m${i++}`} className="font-medium text-brand">
        {m[0]}
      </span>,
    )
    last = at + m[0].length
  }
  if (last === 0) return text
  if (last < text.length) out.push(<span key={`t${i++}`}>{text.slice(last)}</span>)
  return out
}

/** Gray feed event: bullet, text (+ optional blue task link), right-aligned time. */
function EventRow({
  entry,
  nameRe,
  revealed,
  onLink,
}: {
  entry: EventEntry
  nameRe: RegExp | null
  revealed?: boolean
  onLink: () => void
}) {
  return (
    <div className={`flex items-start gap-2.5 py-[5px] ${revealed ? 'animate-fade-in' : ''}`}>
      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
      <span className="min-w-0 flex-1 text-[13px] leading-[19px] text-ink-soft">
        {withNames(entry.text, nameRe)}
        {entry.link && (
          <>
            {' '}
            <button
              type="button"
              onClick={onLink}
              className="cursor-pointer text-left break-words hover:underline"
              style={{ color: LINK_BLUE }}
            >
              {entry.link}
            </button>
          </>
        )}
      </span>
      <span className="shrink-0 pl-2 text-right text-[12px] leading-[19px] whitespace-nowrap text-ink-faint">
        {entry.timeLabel}
      </span>
    </div>
  )
}

/** Bordered comment card: avatar, bold name (+ deactivated), body, reactions, Reply. */
function CommentCard({
  entry,
  user,
  mentionRe,
  soon,
}: {
  entry: CommentEntry
  user: User | undefined
  mentionRe: RegExp | null
  soon: (what: string) => () => void
}) {
  const name = user?.name ?? entry.userId
  return (
    <div className="animate-fade-in my-1.5 rounded-lg border border-line p-3">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar initials={user?.initials ?? '?'} color={user?.color ?? '#87909e'} size={26} title={name} />
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
          {name}
          {user?.deactivated && (
            <span className="font-normal text-ink-faint"> (deactivated)</span>
          )}
        </span>
        <span className="ml-auto shrink-0 pl-2 text-[12px] whitespace-nowrap text-ink-faint">
          {entry.timeLabel}
        </span>
      </div>
      <div className="pt-2 text-[14px] leading-[21px] break-words text-ink">
        {withMentions(entry.body, mentionRe)}
      </div>
      <div className="flex items-center gap-0.5 pt-2.5">
        <button
          type="button"
          title="React"
          aria-label="Thumbs up"
          onClick={soon('Reactions')}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
        >
          <ThumbsUp className="h-[15px] w-[15px]" />
        </button>
        <button
          type="button"
          title="Add reaction"
          aria-label="Add reaction"
          onClick={soon('Reactions')}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover hover:text-ink"
        >
          <SmilePlus className="h-[15px] w-[15px]" />
        </button>
        <button
          type="button"
          onClick={soon('Replies')}
          className="ml-auto cursor-pointer rounded-md px-1.5 py-0.5 text-[12.5px] text-ink-soft hover:bg-hover hover:text-ink"
        >
          Reply
        </button>
      </div>
    </div>
  )
}

/** Icon button used in the composer toolbar (24px hit area). */
function ToolBtn({
  label,
  onClick,
  hide,
  children,
}: {
  label: string
  onClick: () => void
  /** Extra responsive classes so the strip collapses gracefully at narrow widths */
  hide?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink ${hide ?? ''}`}
    >
      {children}
    </button>
  )
}

/**
 * Right-hand Activity panel of the task modal: header, bottom-anchored feed
 * (events + Show more runs + comment cards) and the comment composer.
 */
export function ActivityPanel({ task }: { task: Task }) {
  const users = useAppStore((s) => s.users)
  const notify = useAppStore((s) => s.notify)
  const addComment = useAppStore((s) => s.addComment)

  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [draft, setDraft] = useState('')
  const feedRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const soon = (what: string) => () => comingSoon(notify, what)

  // Skeleton-first load; activity lands just after the description pass.
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 600)
    return () => clearTimeout(t)
  }, [])

  // Keep the feed pinned to its newest entries (initial load + new comments).
  const activityLen = task.activity?.length ?? 0
  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [loaded, activityLen])

  const sortedNames = useMemo(
    () =>
      Object.values(users)
        .map((u) => u.name)
        .sort((a, b) => b.length - a.length)
        .map(escapeRe),
    [users],
  )
  const nameRe = useMemo(
    () => (sortedNames.length ? new RegExp(sortedNames.join('|'), 'g') : null),
    [sortedNames],
  )
  const mentionRe = useMemo(
    () => new RegExp(`@(?:${[...sortedNames, '[\\w.-]+'].join('|')})`, 'g'),
    [sortedNames],
  )

  // Collapse consecutive hidden events into "Show more" rows until expanded.
  const nodes = useMemo<FeedNode[]>(() => {
    const out: FeedNode[] = []
    let run: EventEntry[] = []
    const flush = () => {
      if (run.length === 0) return
      const key = run[0].id
      if (expanded[key]) {
        for (const e of run) out.push({ kind: 'entry', entry: e, revealed: true })
      } else {
        out.push({ kind: 'more', key, entries: run })
      }
      run = []
    }
    for (const e of task.activity ?? []) {
      if (e.kind === 'event' && e.hidden) {
        run.push(e)
      } else {
        flush()
        out.push({ kind: 'entry', entry: e })
      }
    }
    flush()
    return out
  }, [task.activity, expanded])

  const canSend = draft.trim().length > 0
  const send = () => {
    if (!canSend) return
    addComment(task.id, draft)
    setDraft('')
    inputRef.current?.focus()
  }
  const onDraftKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      {/* ---- Panel header ---- */}
      <div className="flex h-12 shrink-0 items-center border-b border-line pr-2.5 pl-4">
        <span className="text-[15px] font-semibold text-ink">Activity</span>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            title="Search activity"
            aria-label="Search activity"
            onClick={soon('Activity search')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Notifications"
            aria-label="Notifications"
            onClick={soon('Activity notifications')}
            className="flex h-7 w-8 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink"
          >
            <span className="relative flex">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-[3px] -right-[6px] text-[9px] leading-none font-semibold">
                0
              </span>
            </span>
          </button>
          <button
            type="button"
            title="Filter activity"
            aria-label="Filter activity"
            onClick={soon('Activity filters')}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink"
          >
            <ListFilter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ---- Bottom-anchored feed ---- */}
      <div ref={feedRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        {loaded ? (
          <div className="animate-fade-in mt-auto flex flex-col pt-3 pb-2">
            {nodes.map((n) =>
              n.kind === 'more' ? (
                <button
                  key={`more-${n.key}`}
                  type="button"
                  onClick={() => setExpanded((m) => ({ ...m, [n.key]: true }))}
                  className="flex cursor-pointer items-center gap-1.5 self-start py-1.5 pr-2 text-[12.5px] text-ink-soft hover:text-ink"
                >
                  <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
                  Show more
                </button>
              ) : n.entry.kind === 'comment' ? (
                <CommentCard
                  key={n.entry.id}
                  entry={n.entry}
                  user={users[n.entry.userId]}
                  mentionRe={mentionRe}
                  soon={soon}
                />
              ) : (
                <EventRow
                  key={n.entry.id}
                  entry={n.entry}
                  nameRe={nameRe}
                  revealed={n.revealed}
                  onLink={soon('The linked task')}
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-auto flex flex-col gap-3.5 pt-3 pb-3">
            {SKELETON.map((s, i) => (
              <div
                key={i}
                className={`pm-shimmer ${s.full ? 'rounded-lg' : ''}`}
                style={{ width: s.width ?? '100%', height: s.height }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Comment composer ---- */}
      <div className="shrink-0 px-3.5 pt-1.5 pb-3.5">
        <div className="rounded-[10px] border border-line-strong focus-within:border-brand/60">
          <div
            className="cursor-text px-3 pt-2.5 pb-1"
            onClick={() => inputRef.current?.focus()}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              placeholder="Write a comment..."
              aria-label="Write a comment"
              className="block max-h-36 w-full resize-none field-sizing-content overflow-y-auto bg-transparent text-[14px] leading-[21px] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-2">
            <button
              type="button"
              title="Add"
              aria-label="Add to comment"
              onClick={soon('Comment attachments')}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft hover:bg-hover hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={soon('Comment types')}
              className="flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[12.5px] text-ink-soft hover:bg-hover hover:text-ink"
            >
              Comment
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="flex min-w-0 items-center gap-0.5 overflow-hidden">
              <ToolBtn label="Brain²" onClick={soon('Brain² for comments')}>
                <Brain className="h-4 w-4 text-[#b15de8]" />
              </ToolBtn>
              <ToolBtn label="Write with AI" onClick={soon('AI writing')}>
                <WandSparkles className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                label="Attach"
                onClick={soon('Comment attachments')}
                hide="max-[1250px]:hidden"
              >
                <Paperclip className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn label="Mention" onClick={soon('Mentions')} hide="max-[1250px]:hidden">
                <AtSign className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                label="Assign comment"
                onClick={soon('Comment assignment')}
                hide="max-[1450px]:hidden"
              >
                <UserRoundCheck className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn label="Emoji" onClick={soon('Emoji')} hide="max-[1450px]:hidden">
                <Smile className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                label="Record clip"
                onClick={soon('Clip recording')}
                hide="max-[1450px]:hidden"
              >
                <Video className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                label="Create task"
                onClick={soon('Tasks from comments')}
                hide="max-[1450px]:hidden"
              >
                <CircleCheck className="h-4 w-4" />
              </ToolBtn>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              <ToolBtn label="More" onClick={soon('More comment tools')}>
                <Ellipsis className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn label="Voice clip" onClick={soon('Voice clips')}>
                <Mic className="h-4 w-4" />
              </ToolBtn>
              <button
                type="button"
                title="Send comment"
                aria-label="Send comment"
                disabled={!canSend}
                onClick={send}
                className={`flex h-6 w-6 items-center justify-center rounded-md ${
                  canSend
                    ? 'cursor-pointer bg-brand text-white hover:bg-brand-deep'
                    : 'cursor-default text-ink-faint'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Send options"
                aria-label="Send options"
                onClick={soon('Send options')}
                className="flex h-6 w-4 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover hover:text-ink"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
