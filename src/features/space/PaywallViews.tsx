import { useState } from 'react'
import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { comingSoon, useAppStore } from '../../lib/store'

const BUSINESS_FEATURES = [
  'Unlimited Activity View',
  'Unlimited Mind Maps',
  'Export Lists & Views',
  'Export Gantt Charts',
  'Required Custom Fields',
  'Work-in-Progress Limits',
  'Default views',
  'Private views',
  'Protect views',
  'Additional Free Guests',
]

const UNLIMITED_FEATURES = [
  'Unlimited Storage',
  'Unlimited Folders and Spaces',
  'Unlimited Custom Fields',
  'Unlimited Goals',
  'Unlimited Portfolios',
  'Permissions',
  '5 Guests + 2 extra per paid user',
  'Advanced Reporting',
  'Google Drive, Dropbox, OneDrive/SharePoint & Box',
]

/** Shared upgrade modal shell. */
function UpgradeModal({
  intro,
  heading,
  featureName,
  featureBlurb,
  plan,
  price,
  leadFeature,
  features,
  onClose,
}: {
  intro: string
  heading: string
  featureName: string
  featureBlurb: string
  plan: string
  price: string
  leadFeature: string
  features: string[]
  onClose: () => void
}) {
  const notify = useAppStore((s) => s.notify)
  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6">
      <div className="animate-pop-in relative flex w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/5 text-ink-soft hover:bg-black/10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left feature panel */}
        <div className="hidden w-[52%] flex-col gap-4 bg-panel p-8 md:flex">
          <div className="text-[12.5px] text-ink-faint">{intro}</div>
          <h2 className="text-[22px] leading-tight font-bold text-ink text-balance">{heading}</h2>
          <div className="text-[15px] font-semibold text-ink">{featureName}</div>
          <p className="text-[13px] leading-relaxed text-ink-soft">{featureBlurb}</p>
          <div className="mt-2 flex-1 rounded-xl border border-line bg-white p-4 shadow-inner">
            <div className="space-y-2">
              {[70, 90, 55, 80, 45].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-sm bg-line-strong" />
                  <span className="h-2.5 rounded-full bg-line" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
          <ul className="space-y-1.5 text-[12.5px] text-ink-soft">
            <li>Manage and visualize workloads over days or months by time, tasks, points, or custom metrics.</li>
            <li>Adjust team or individual capacities, and easily reassign tasks using drag-and-drop.</li>
            <li>Proactively identify and prevent potential burnouts early while accurately forecasting resourcing needs.</li>
          </ul>
        </div>

        {/* Right pricing panel */}
        <div className="relative flex flex-1 flex-col gap-3 p-8">
          <span className="absolute -top-3 right-6 flex h-16 w-16 rotate-12 items-center justify-center rounded-full bg-brand/10 text-center text-[9px] leading-tight font-semibold text-brand-deep">
            100% Money back Guarantee
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-ink">{plan}</span>
            <span className="rounded-full bg-[#e7f6ec] px-2 py-0.5 text-[11px] font-semibold text-[#27ae60]">
              Popular
            </span>
          </div>
          <div className="text-[13px] text-ink-soft">{leadFeature} and much more</div>
          <div className="flex items-end gap-1.5">
            <span className="text-[44px] leading-none font-bold text-ink">{price}</span>
            <span className="pb-1.5 text-[12.5px] leading-tight text-ink-soft">
              member
              <br />
              per month
            </span>
          </div>
          <button
            type="button"
            onClick={() => comingSoon(notify, 'Upgrading the plan')}
            className="h-10 cursor-pointer rounded-lg bg-brand text-[14px] font-medium text-white hover:bg-brand-deep"
          >
            Contact your admin
          </button>
          <ul className="mt-1 space-y-1.5">
            <li className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Check className="h-3.5 w-3.5 text-[#27ae60]" />
              {leadFeature}
            </li>
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#27ae60]" />
                {f}
              </li>
            ))}
            <li className="flex items-center gap-2 text-[12.5px] text-ink-soft">
              <span className="w-3.5 text-center text-[#27ae60]">+</span>
              much more...
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/** Expired-usage empty state behind the modal. */
function ExpiredState({
  title,
  learnMore,
  buttonLabel,
  children,
}: {
  title: string
  learnMore: string
  buttonLabel: string
  children?: ReactNode
}) {
  const notify = useAppStore((s) => s.notify)
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white p-8">
      <div className="flex h-40 w-72 items-center justify-center rounded-xl border border-line bg-panel">
        <div className="space-y-2">
          {[80, 60, 90, 50].map((w, i) => (
            <div key={i} className="h-2.5 rounded-full bg-line" style={{ width: `${w * 2}px` }} />
          ))}
        </div>
      </div>
      <div className="text-[20px] font-bold text-ink">{title}</div>
      <button
        type="button"
        onClick={() => comingSoon(notify, 'Learn more')}
        className="cursor-pointer text-[13px] text-brand-deep underline"
      >
        {learnMore}
      </button>
      <button
        type="button"
        onClick={() => comingSoon(notify, 'Contacting your admin')}
        className="h-9 cursor-pointer rounded-lg bg-[#1f2233] px-4 text-[13.5px] font-medium text-white hover:bg-black"
      >
        {buttonLabel}
      </button>
      {children}
    </div>
  )
}

const VIEW_META = {
  timeline: {
    label: 'Timeline',
    blurb:
      "Effortlessly track and manage your team's entire timeline from one interactive and visual view.",
    learnMore: 'Learn more about Timeline views',
  },
  workload: {
    label: 'Workload',
    blurb:
      "Effortlessly track and manage your team's entire workload from one interactive and visual view.",
    learnMore: 'Learn more about Workload charts',
  },
} as const

export function ViewPaywall({ view }: { view: 'timeline' | 'workload' }) {
  const meta = VIEW_META[view]
  const [modalOpen, setModalOpen] = useState(true)
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ExpiredState
        title={`Your 100 ${meta.label} uses have expired.`}
        learnMore={meta.learnMore}
        buttonLabel="Contact admin"
      />
      {modalOpen && (
        <UpgradeModal
          intro={`You have run out of trial usage for ${meta.label} Views.`}
          heading={`Upgrade to Business to get unlimited ${meta.label} Views`}
          featureName={`${meta.label} Views`}
          featureBlurb={meta.blurb}
          plan="Business"
          price="$19"
          leadFeature={`${meta.label} Views`}
          features={BUSINESS_FEATURES}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

export function SprintReportingUpsell() {
  const [modalOpen, setModalOpen] = useState(true)
  const notify = useAppStore((s) => s.notify)
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white p-8">
        <div className="flex h-44 w-80 items-center justify-center rounded-xl border border-line bg-panel">
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-32 rounded-lg bg-line" />
            ))}
          </div>
        </div>
        <div className="text-[20px] font-bold text-ink">
          Free Forever Plans are limited to 100 uses of Dashboards
        </div>
        <div className="text-[13px] text-ink-soft">To remove all limits, upgrade to Unlimited</div>
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Learn more')}
          className="cursor-pointer text-[13px] text-brand-deep underline"
        >
          Learn more about Dashboard Views
        </button>
        <button
          type="button"
          onClick={() => comingSoon(notify, 'Upgrading the plan')}
          className="h-9 cursor-pointer rounded-lg bg-[#1f2233] px-4 text-[13.5px] font-medium text-white hover:bg-black"
        >
          Upgrade Plan
        </button>
      </div>
      {modalOpen && (
        <UpgradeModal
          intro="You have run out of trial usage for Dashboards."
          heading="Upgrade to Unlimited to get unlimited Dashboards"
          featureName="Dashboards"
          featureBlurb="Build reporting dashboards to track progress, workload, and velocity across your Spaces."
          plan="Unlimited"
          price="$10"
          leadFeature="Dashboards"
          features={UNLIMITED_FEATURES}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
