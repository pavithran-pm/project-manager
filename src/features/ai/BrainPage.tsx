import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
  Bookmark,
  ChevronDown,
  CircleDashed,
  FileText,
  ListTodo,
  Mic,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

const PLACEHOLDERS = [
  "From quick questions to big projects, I'm here to help you get it done.",
  "Type your request: I'll search, answer, or build it for you.",
]

const SUGGESTIONS: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: TrendingUp, title: 'Dashboard Status', sub: 'Summarize sprint progress across MVP - MSM' },
  { icon: FileText, title: 'Draft Documentation', sub: 'Write release notes from completed tasks' },
  { icon: ListTodo, title: 'Find Overdue', sub: 'Show me everything past its due date' },
  { icon: CircleDashed, title: 'Sprint Update', sub: 'Prepare a stand-up summary for Sprint 4' },
]

export function BrainPage() {
  const notify = useAppStore((s) => s.notify)
  const [onboarding, setOnboarding] = useState(() => {
    return typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('pm-brain-onboarded')
  })
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<'ask' | 'agents'>('ask')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 5000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    document.title = 'ClickUp - New Chat | Techjays'
    return () => {
      document.title = 'Techjays Project Tracker'
    }
  }, [])

  const dismissOnboarding = () => {
    sessionStorage.setItem('pm-brain-onboarded', '1')
    setOnboarding(false)
  }
  const send = () => {
    if (!draft.trim()) return
    comingSoon(notify, 'Brain² responses')
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#f3e9ff] via-[#fbeef6]/40 to-transparent blur-2xl" />

      <div className="flex items-center justify-end px-5 py-3">
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Brain² memory')}
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-ink-soft hover:bg-hover"
        >
          <Bookmark className="h-3.5 w-3.5" />
          Memory
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center px-6 pt-10">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#b15de8]" />
          <span className="text-[34px] font-bold text-ink">
            Brain<sup className="text-[18px]">2</sup>
          </span>
        </div>

        {/* Ask / Agents toggle */}
        <div className="mb-6 flex items-center gap-1 rounded-full bg-panel p-1">
          <button
            type="button"
            onClick={() => setTab('ask')}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium ${
              tab === 'ask' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#b15de8]" />
            Ask
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('agents')
              comingSoon(notify, 'Brain² Agents')
            }}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium ${
              tab === 'agents' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Agents
          </button>
        </div>

        {/* Prompt card */}
        <div className="w-full max-w-[640px] rounded-2xl border border-line bg-white p-4 shadow-lg">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={PLACEHOLDERS[placeholderIdx]}
            rows={2}
            className="w-full resize-none bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              aria-label="Add"
              onClick={() => comingSoon(notify, 'Attachments')}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft hover:bg-hover"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => comingSoon(notify, 'Skills')}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-ink-soft hover:bg-hover"
            >
              <Shield className="h-3.5 w-3.5" />
              Skills
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => comingSoon(notify, 'Model selection')}
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[13px] text-ink-soft hover:bg-hover"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#b15de8]" />
                Max
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                aria-label="Voice"
                onClick={() => comingSoon(notify, 'Voice input')}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ink-soft hover:bg-hover"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion cards */}
        <div className="mt-6 grid w-full max-w-[640px] grid-cols-2 gap-3 sm:grid-cols-4">
          {!loaded
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pm-shimmer h-[76px] rounded-xl" />
              ))
            : SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => comingSoon(notify, 'Brain² suggestions')}
                  className="animate-fade-in flex cursor-pointer flex-col gap-1 rounded-xl border border-line bg-white p-3 text-left hover:border-line-strong hover:shadow-sm"
                >
                  <s.icon className="h-4 w-4 text-ink-soft" />
                  <span className="text-[13px] font-semibold text-ink">{s.title}</span>
                  <span className="truncate text-[12px] text-ink-faint">{s.sub}</span>
                </button>
              ))}
        </div>

        {/* Footer promo */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#2b2f3a] to-[#4a3b6b]">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-ink">Meet Brain²</span>
              <span className="rounded-full bg-[#e7f6ec] px-1.5 py-0.5 text-[10px] font-semibold text-[#27ae60]">
                New
              </span>
            </div>
            <div className="text-[12.5px] text-ink-soft">Way smarter, wildly more capable</div>
          </div>
        </div>
      </div>

      {/* Onboarding modal */}
      {onboarding && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6">
          <div className="animate-pop-in relative w-full max-w-[560px] rounded-2xl bg-white p-8 text-center shadow-2xl">
            <button
              type="button"
              aria-label="Close"
              onClick={dismissOnboarding}
              className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/5 text-ink-soft hover:bg-black/10"
            >
              ×
            </button>
            <div className="mb-4 flex justify-center">
              <Sparkles className="h-10 w-10 text-[#b15de8]" />
            </div>
            <h2 className="text-[24px] font-bold text-ink">Your company&apos;s Brain</h2>
            <p className="mt-2 text-[14px] text-ink-soft">
              Brain² knows your Spaces, tasks, and Docs — ask it anything.
            </p>
            <button
              type="button"
              onClick={() => {
                comingSoon(notify, 'Personalizing Brain²')
                dismissOnboarding()
              }}
              className="mt-6 h-11 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#2b2f3a] to-[#4a3b6b] text-[14px] font-medium text-white hover:opacity-90"
            >
              Personalize Brain²
            </button>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="mt-3 cursor-pointer text-[13px] text-ink-soft hover:text-ink"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
