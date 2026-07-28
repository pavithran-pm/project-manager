// Shared contract for the "Create a Space" wizard.
// The wizard shell (CreateSpaceModal) owns all selection state and is the only
// store-connected piece; every step/panel below is a PURE presentational component
// that takes props in and calls callbacks out — no store access, so they compose
// cleanly and were built in parallel against this file.

export type SpacePreset = 'starter' | 'marketing' | 'project' | 'product'

export interface WizardMember {
  id: string
  name: string
  initials: string
  color: string
}

export interface PresetStatus {
  label: string
  color: string
  group: 'not-started' | 'active' | 'done' | 'closed'
}

export interface PresetConfig {
  key: SpacePreset
  label: string
  desc: string
  /** Comma-joined default view names, shown on the "Default views" row. */
  viewsSummary: string
  /** Comma-joined ClickApp names, shown on the "ClickApps" row. */
  clickAppsSummary: string
  /** Ordered default statuses, shown on the Task-statuses row and the Statuses panel. */
  statuses: PresetStatus[]
}

export const PRESETS: PresetConfig[] = [
  {
    key: 'starter',
    label: 'Starter',
    desc: 'For everyday tasks',
    viewsSummary: 'List, Board, Calendar',
    clickAppsSummary: 'Priority, Tags, Time Tracking',
    statuses: [
      { label: 'TO DO', color: '#87909e', group: 'not-started' },
      { label: 'IN PROGRESS', color: '#4194f6', group: 'active' },
      { label: 'COMPLETE', color: '#1f9d61', group: 'done' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing Teams',
    desc: 'Run effective campaigns',
    viewsSummary: 'List, Board, Calendar, Gantt',
    clickAppsSummary: 'Tags, Priority, Custom Fields, Time Tracking',
    statuses: [
      { label: 'TO DO', color: '#87909e', group: 'not-started' },
      { label: 'IN PROGRESS', color: '#4194f6', group: 'active' },
      { label: 'IN REVIEW', color: '#e8871e', group: 'active' },
      { label: 'APPROVED', color: '#1f9d61', group: 'done' },
      { label: 'CANCELLED', color: '#d6336c', group: 'closed' },
    ],
  },
  {
    key: 'project',
    label: 'Project Management',
    desc: 'Plan, manage, and execute projects',
    viewsSummary: 'List, Board, Calendar, Gantt, Team',
    clickAppsSummary: 'Tags, Time Estimates, Priority, Time Tracking, Incomplete Warning',
    statuses: [
      { label: 'TO DO', color: '#87909e', group: 'not-started' },
      { label: 'PLANNING', color: '#7b68ee', group: 'active' },
      { label: 'IN PROGRESS', color: '#4194f6', group: 'active' },
      { label: 'AT RISK', color: '#e8871e', group: 'active' },
      { label: 'UPDATE REQUIRED', color: '#d6336c', group: 'active' },
      { label: 'ON HOLD', color: '#87909e', group: 'active' },
      { label: 'COMPLETE', color: '#1f9d61', group: 'done' },
      { label: 'CANCELLED', color: '#d6336c', group: 'closed' },
    ],
  },
  {
    key: 'product',
    label: 'Product + Engineering',
    desc: 'Streamline your product lifecycle',
    viewsSummary: 'List, Board, Team, Calendar, Gantt',
    clickAppsSummary: 'Sprints, Tags, Priority, Time Estimates, Dependency Warning',
    statuses: [
      { label: 'TO DO', color: '#87909e', group: 'not-started' },
      { label: 'BACKLOG', color: '#d8354f', group: 'not-started' },
      { label: 'PLANNING', color: '#7b68ee', group: 'active' },
      { label: 'IN PROGRESS', color: '#4194f6', group: 'active' },
      { label: 'IN REVIEW', color: '#e8871e', group: 'active' },
      { label: 'COMPLETE', color: '#1f9d61', group: 'done' },
      { label: 'CANCELLED', color: '#d6336c', group: 'closed' },
    ],
  },
]

/** Icon-color swatches for the Space icon picker (Step 1). */
export const SPACE_ICON_COLORS = [
  '#7b68ee',
  '#4194f6',
  '#0f7f70',
  '#1f9d61',
  '#e8a33d',
  '#e8871e',
  '#d6336c',
  '#d8354f',
  '#8a5fe8',
  '#656f7d',
]

export interface SpaceViewDef {
  key: string
  label: string
  color: string
  required?: boolean
  defaultOn?: boolean
}

/** Views offered on the "Default settings for views" panel (frame: Required views). */
export const SPACE_VIEWS: SpaceViewDef[] = [
  { key: 'list', label: 'List', color: '#7b68ee', required: true, defaultOn: true },
  { key: 'board', label: 'Board', color: '#4194f6', defaultOn: true },
  { key: 'calendar', label: 'Calendar', color: '#e8871e', defaultOn: true },
  { key: 'map', label: 'Map', color: '#1f9d61' },
  { key: 'activity', label: 'Activity', color: '#d6336c' },
  { key: 'team', label: 'Team', color: '#8a5fe8', defaultOn: true },
  { key: 'gantt', label: 'Gantt', color: '#e8a33d', defaultOn: true },
  { key: 'mindmap', label: 'Mind Map', color: '#d8354f' },
  { key: 'table', label: 'Table', color: '#0f7f70' },
  { key: 'timeline', label: 'Timeline', color: '#4194f6' },
  { key: 'workload', label: 'Workload', color: '#1f9d61' },
]

export interface ClickAppDef {
  key: string
  label: string
  /** Gated/unavailable (rendered dimmed, non-interactive), like the reference. */
  gated?: boolean
  defaultOn?: boolean
}

/** ClickApps offered on the "Enable ClickApps" panel. */
export const CLICKAPPS: ClickAppDef[] = [
  { key: 'priority', label: 'Priority', defaultOn: true },
  { key: 'sprints', label: 'Sprints', gated: true },
  { key: 'email', label: 'Email', defaultOn: true },
  { key: 'tags', label: 'Tags', defaultOn: true },
  { key: 'customFields', label: 'Custom Fields', defaultOn: true },
  { key: 'multipleAssignees', label: 'Multiple Assignees', defaultOn: true },
  { key: 'timeTracking', label: 'Time Tracking', defaultOn: true },
  { key: 'timeEstimates', label: 'Time Estimates', defaultOn: true },
  { key: 'remapSubtaskDates', label: 'Remap Subtask Due Dates', gated: true },
  { key: 'wipLimits', label: 'Work in Progress Limits', gated: true },
  { key: 'sprintPoints', label: 'Sprint Points', gated: true },
  { key: 'incompleteWarning', label: 'Incomplete Warning', defaultOn: true },
  { key: 'dependencyWarning', label: 'Dependency Warning', defaultOn: true },
  { key: 'rescheduleDependencies', label: 'Reschedule Dependencies', defaultOn: true },
  { key: 'showStatusProgress', label: 'Show status progress', defaultOn: true },
]

// ---- Pure panel prop contracts ----

export interface BasicsStepProps {
  name: string
  onName: (v: string) => void
  description: string
  onDescription: (v: string) => void
  color: string
  onColor: (v: string) => void
  isPrivate: boolean
  onPrivate: (v: boolean) => void
  shareWith: string[]
  onToggleShare: (userId: string) => void
  members: WizardMember[]
  currentUserId: string
  onNext: () => void
  onClose: () => void
  onUseTemplates: () => void
}

export interface WorkflowStepProps {
  preset: SpacePreset
  onPreset: (p: SpacePreset) => void
  onOpenViews: () => void
  onOpenStatuses: () => void
  onOpenClickApps: () => void
  onBack: () => void
  onCreate: () => void
  onClose: () => void
}

export interface ViewsPanelProps {
  enabled: Record<string, boolean>
  onToggle: (key: string) => void
  onBack: () => void
  onClose: () => void
  onDone: () => void
}

export interface ClickAppsPanelProps {
  enabled: Record<string, boolean>
  onToggle: (key: string) => void
  onTurnOffAll: () => void
  onBack: () => void
  onClose: () => void
  onDone: () => void
}

export interface StatusesPanelProps {
  preset: SpacePreset
  onBack: () => void
  onClose: () => void
  onDone: () => void
}
