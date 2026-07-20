import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Hash,
  Image,
  MailCheck,
  Medal,
  Rocket,
  Share2,
  Star,
} from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'
import type { AppNotification, NotifIcon, SegmentStyle } from '../../lib/types'

const SEGMENT_CLASS: Record<SegmentStyle, string> = {
  normal: '',
  bold: 'font-semibold text-ink',
  link: 'text-[#5b6ee8]',
  mention: 'font-medium text-[#7057e0]',
  code: 'rounded bg-[#f3f4f6] px-1 py-px font-mono text-[11.5px] text-[#d8354f]',
  boldItalic: 'font-semibold italic text-ink',
}

function TitleGlyph({ icon }: { icon: NotifIcon }) {
  switch (icon.kind) {
    case 'space':
      return <Rocket className="h-4 w-4 shrink-0 text-ink-soft" />
    case 'access':
      return <Medal className="h-4 w-4 shrink-0 text-[#e8a33d]" />
    case 'status':
      return (
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border-[3.5px]"
          style={{ borderColor: icon.color }}
        />
      )
    case 'clock':
      return <Clock className="h-4 w-4 shrink-0" style={{ color: icon.color }} />
    case 'channel':
      return <Hash className="h-4 w-4 shrink-0 text-ink-soft" />
  }
}

/** Icon button with the shared dark tooltip treatment. */
function TipButton({
  tip,
  onClick,
  children,
}: {
  tip: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/tip relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
    >
      {children}
      <span className="animate-fade-in pointer-events-none absolute top-full left-1/2 z-[70] mt-1.5 hidden -translate-x-1/2 rounded-md bg-[#26262b] px-2 py-1 text-[12px] whitespace-nowrap text-white shadow-lg group-hover/tip:block">
        {tip}
      </span>
    </button>
  )
}

export function NotificationDetail({
  notification,
  onBack,
}: {
  notification: AppNotification
  onBack: () => void
}) {
  const users = useAppStore((s) => s.users)
  const spaces = useAppStore((s) => s.spaces)
  const clearNotification = useAppStore((s) => s.clearNotification)
  const notify = useAppStore((s) => s.notify)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [notification.id])

  const soon = (what: string) => () => comingSoon(notify, what)
  const space = spaces.find((sp) => sp.name === notification.title)
  const avatarUser =
    notification.avatar?.kind === 'user' ? users[notification.avatar.userId] : undefined
  // "Jul 16 at 12:49 pm"-style timestamp derived from the row's time label.
  const timestamp = notification.timeLabel.includes(':')
    ? `Jul 16 at ${notification.timeLabel.toLowerCase()}`
    : `${notification.timeLabel} at 12:49 pm`

  return (
    <div className="animate-fade-in flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-[54px] shrink-0 items-center gap-2 border-b border-line px-4">
        <button
          type="button"
          title="Back"
          onClick={onBack}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {space ? (
          <Avatar initials={space.abbr} color={space.color} size={20} rounded="md" />
        ) : (
          <TitleGlyph icon={notification.icon} />
        )}
        <span className="min-w-0 truncate text-[15px] font-semibold text-ink">
          {notification.title}
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <TipButton tip="Email me about this" onClick={soon('Email notifications')}>
            <MailCheck className="h-4 w-4" />
          </TipButton>
          <TipButton tip="Browser notifications" onClick={soon('Browser notifications')}>
            <Globe className="h-4 w-4" />
          </TipButton>
          <TipButton tip="Add to Favorites" onClick={soon('Favorites')}>
            <Star className="h-3.5 w-3.5" />
          </TipButton>
          <button
            type="button"
            onClick={() => {
              clearNotification(notification.id)
              onBack()
            }}
            className="ml-1 flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-[#1f2233] px-3 text-[13px] font-medium text-white hover:bg-black"
          >
            <Check className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-3 overflow-y-auto px-6 py-5">
        {/* Stacked prev/next mini-buttons in the left gutter */}
        <div className="flex shrink-0 flex-col gap-1 pt-0.5">
          <button
            type="button"
            title="Previous notification"
            onClick={soon('Notification navigation')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-line text-ink-soft hover:bg-hover"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Next notification"
            onClick={soon('Notification navigation')}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-line text-ink-soft hover:bg-hover"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-14 items-center gap-3 rounded-lg border border-line px-4">
              <span className="pm-shimmer h-5 w-5 shrink-0 rounded-full" />
              <span className="pm-shimmer h-3.5 w-[260px] max-w-[55%]" />
              <span className="pm-shimmer ml-auto h-3.5 w-[110px] shrink-0" />
            </div>
          ) : (
            <div className="animate-fade-in flex min-h-14 items-center gap-3 rounded-lg border border-line px-4 py-2.5">
              {avatarUser ? (
                <Avatar
                  initials={avatarUser.initials}
                  color={avatarUser.color}
                  size={20}
                  title={avatarUser.name}
                />
              ) : notification.avatar?.kind === 'dot' ? (
                <span
                  className="h-5 w-5 shrink-0 rounded-full"
                  style={{ backgroundColor: notification.avatar.color }}
                />
              ) : (
                <Share2 className="h-4 w-4 shrink-0 text-ink-faint" />
              )}
              <span className="min-w-0 flex-1 text-[13px] leading-5 text-ink-soft">
                {notification.preview.map((seg, i) => (
                  <span key={i} className={SEGMENT_CLASS[seg.style ?? 'normal']}>
                    {seg.text}
                  </span>
                ))}
                {notification.attachment && (
                  <span className="ml-1.5 inline-flex items-center gap-1 rounded border border-line-strong px-1.5 py-px align-middle text-[11.5px] text-ink-soft">
                    <Image className="h-3 w-3" />
                    {notification.attachment.label}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[13px] text-ink-faint">{timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
