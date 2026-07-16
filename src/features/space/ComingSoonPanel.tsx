import { Construction } from 'lucide-react'

export function ComingSoonPanel({ view }: { view: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-white">
      <Construction className="h-8 w-8 text-line-strong" />
      <div className="text-[15px] font-semibold text-ink capitalize">{view.replace('-', ' ')}</div>
      <p className="text-[13px] text-ink-soft">
        This view is next on the build list — share a screenshot of it to replicate it.
      </p>
    </div>
  )
}
