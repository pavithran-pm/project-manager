import {
  ChevronDown,
  CircleCheck,
  Columns3,
  Filter,
  Layers2,
  Network,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { comingSoon, useAppStore } from '../../lib/store'

function IconBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
    >
      <Icon className="h-4 w-4 text-ink-soft" />
    </button>
  )
}

/**
 * Toolbar row under the view tabs: Status grouping pill + display icons on the
 * left; Save view (only once the view was modified), filter icons and the
 * brand "+ Task ▾" split button on the right.
 */
export function ListToolbar({
  saveViewVisible,
  listId,
}: {
  saveViewVisible: boolean
  listId?: string
}) {
  void listId
  const notify = useAppStore((s) => s.notify)
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const soon = (what: string) => () => comingSoon(notify, what)

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line bg-white px-4">
      {/* Left — grouping + display options */}
      <button
        onClick={soon('View grouping')}
        className="flex h-[26px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#eeeafb] px-2.5 text-[12.5px] font-medium text-[#5f48ea] hover:bg-[#e3dcf9]"
      >
        <Layers2 className="h-3.5 w-3.5" />
        Status
      </button>
      <IconBtn icon={Network} label="Subtasks" onClick={soon('Subtask display options')} />
      <IconBtn icon={Columns3} label="Columns" onClick={soon('Column settings')} />

      {/* Right — view actions */}
      <div className="ml-auto flex items-center gap-1">
        {saveViewVisible && (
          <div className="animate-fade-in mr-0.5 flex items-center">
            <button
              onClick={soon('Saving views')}
              className="h-7 cursor-pointer rounded-l-lg border border-line-strong px-2.5 text-[12.5px] font-medium text-ink hover:bg-hover"
            >
              Save view
            </button>
            <button
              title="Save view options"
              onClick={soon('Saving views')}
              className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-line-strong hover:bg-hover"
            >
              <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
            </button>
          </div>
        )}
        <IconBtn icon={Filter} label="Filter" onClick={soon('Filters')} />
        <IconBtn icon={CircleCheck} label="Show closed" onClick={soon('The closed-tasks toggle')} />
        <IconBtn icon={Users} label="Assignees" onClick={soon('The assignee filter')} />
        <button
          title="Me mode"
          onClick={soon('Me Mode')}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-hover"
        >
          <Avatar initials="P" color="#4a80f5" size={22} />
        </button>
        <IconBtn icon={Search} label="Search tasks" onClick={() => setSearchOpen(true)} />
        <IconBtn icon={Settings} label="View settings" onClick={soon('View settings')} />
        <div className="ml-1 flex items-center">
          <button
            onClick={soon('Task creation from the toolbar')}
            className="flex h-7 cursor-pointer items-center gap-1 rounded-l-lg bg-brand px-2.5 text-[13px] font-medium text-white hover:bg-brand-deep"
          >
            <Plus className="h-3.5 w-3.5" />
            Task
          </button>
          <button
            title="Task options"
            onClick={soon('Task templates')}
            className="flex h-7 w-6 cursor-pointer items-center justify-center rounded-r-lg border-l border-white/20 bg-brand hover:bg-brand-deep"
          >
            <ChevronDown className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
