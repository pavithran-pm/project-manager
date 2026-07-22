import { Check, Clock, Hash, Image, Medal, Rocket, Share2 } from 'lucide-react'
import type { AppNotification, NotifIcon, SegmentStyle } from '../../lib/types'
import { useAppStore } from '../../lib/store'
import { Avatar } from '../../components/ui/Avatar'
import { CountBadge } from '../../components/ui/CountBadge'

const SEGMENT_CLASS: Record<SegmentStyle, string> = {
  normal: '',
  bold: 'font-semibold text-ink',
  link: 'text-[#5b6ee8]',
  mention: 'font-medium text-[#7057e0]',
  code: 'rounded bg-[#f3f4f6] px-1 py-px font-mono text-[11.5px] text-[#d8354f]',
  boldItalic: 'font-semibold italic text-ink',
}

function LeadingIcon({ icon }: { icon: NotifIcon }) {
  switch (icon.kind) {
    case 'space':
      return <Rocket className="h-4 w-4 text-ink-soft" />
    case 'access':
      return <Medal className="h-4 w-4 text-[#e8a33d]" />
    case 'status':
      return (
        <span
          className="h-3.5 w-3.5 rounded-full border-[3.5px]"
          style={{ borderColor: icon.color }}
        />
      )
    case 'clock':
      return <Clock className="h-4 w-4" style={{ color: icon.color }} />
    case 'channel':
      return <Hash className="h-4 w-4 text-ink-soft" />
  }
}

export function NotificationRow({
  notification: n,
  onOpen,
}: {
  notification: AppNotification
  onOpen?: (id: string) => void
}) {
  const users = useAppStore((s) => s.users)
  const markRead = useAppStore((s) => s.markRead)
  const clearNotification = useAppStore((s) => s.clearNotification)
  const moveToLater = useAppStore((s) => s.moveToLater)

  const avatarUser = n.avatar?.kind === 'user' ? users[n.avatar.userId] : undefined

  return (
    <div
      onClick={() => {
        markRead(n.id)
        onOpen?.(n.id)
      }}
      className="group relative flex h-[46px] cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-panel"
    >
      {/* Leading icon */}
      <span className="flex w-[18px] shrink-0 items-center justify-center">
        <LeadingIcon icon={n.icon} />
      </span>

      {/* Title */}
      <span
        className={`max-w-[340px] shrink-0 truncate text-[13.5px] text-ink ${
          n.read ? 'font-normal' : 'font-semibold'
        }`}
      >
        {n.title}
      </span>
      {n.titleIcon === 'share' && (
        <Share2 className="h-[13px] w-[13px] shrink-0 text-ink-faint" />
      )}

      {/* Avatar */}
      {avatarUser && (
        <Avatar
          initials={avatarUser.initials}
          color={avatarUser.color}
          size={18}
          title={avatarUser.name}
        />
      )}
      {n.avatar?.kind === 'dot' && (
        <span
          className="h-[18px] w-[18px] shrink-0 rounded-full"
          style={{ backgroundColor: n.avatar.color }}
        />
      )}

      {/* Preview */}
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
        {n.preview.map((seg, i) => (
          <span key={i} className={SEGMENT_CLASS[seg.style ?? 'normal']}>
            {seg.text}
          </span>
        ))}
        {n.attachment && (
          <span className="ml-1.5 inline-flex items-center gap-1 rounded border border-line-strong px-1.5 py-px align-middle text-[11.5px] text-ink-soft">
            <Image className="h-3 w-3" />
            {n.attachment.label}
          </span>
        )}
      </span>

      {/* Right meta */}
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="hidden gap-0.5 group-hover:flex">
          <button
            type="button"
            title="Clear"
            onClick={(e) => {
              e.stopPropagation()
              clearNotification(n.id)
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Later"
            onClick={(e) => {
              e.stopPropagation()
              moveToLater(n.id)
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
        </span>
        <CountBadge value={n.count} variant="outline" />
        <span className="w-14 shrink-0 text-right text-[12.5px] text-ink-faint">
          {n.timeLabel}
        </span>
      </span>
    </div>
  )
}
