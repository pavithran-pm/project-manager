import { Construction } from 'lucide-react'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-white">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel">
        <Construction className="h-7 w-7 text-ink-faint" />
      </span>
      <h1 className="text-lg font-semibold text-ink">{title}</h1>
      <p className="max-w-sm text-center text-sm text-ink-soft">
        This screen is next on the build list. Share a screenshot of it and it will be replicated
        here, one screen at a time.
      </p>
    </main>
  )
}
