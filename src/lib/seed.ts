import type {
  AppNotification,
  Channel,
  DocItem,
  Space,
  Task,
  TaskStatus,
  User,
} from './types'

export const WORKSPACE_NAME = 'Techjays'

export const users: Record<string, User> = {
  pavithran: { id: 'pavithran', name: 'Pavithran', initials: 'PR', color: '#7b68ee' },
  arun: { id: 'arun', name: 'Arun RK', initials: 'AR', color: '#0f7f70' },
  abdulRahuman: { id: 'abdulRahuman', name: 'Abdul Rahuman M', initials: 'A', color: '#d63f47' },
  abirami: { id: 'abirami', name: 'Abirami Balasubramanian', initials: 'A', color: '#e0484f' },
  abdullah: { id: 'abdullah', name: 'Abdullah Al Mamun', initials: 'A', color: '#e8703a' },
  abinaya: { id: 'abinaya', name: 'Abinaya Suresh', initials: 'A', color: '#ef8b3a' },
  anamul: { id: 'anamul', name: 'Anamul Hasan', initials: 'AH', color: '#a04545' },
  azad: { id: 'azad', name: 'azad.vt@techjays.com', initials: 'A', color: '#8a6fe8' },
}

export const currentUserId = 'pavithran'

export const dmUserIds = ['abdulRahuman', 'abirami', 'abdullah', 'abinaya']

export const channels: Channel[] = [
  { id: 'welcome', name: 'Welcome' },
  { id: 'general', name: 'General', suffix: 'Techjays', iconStyle: 'filled' },
]

export const spaces: Space[] = [
  {
    id: 'msm',
    name: 'MSM',
    abbr: 'M',
    color: '#7b68ee',
    isPrivate: true,
    folders: [
      {
        id: 'mvp-msm',
        name: 'MVP - MSM',
        items: [
          { id: 'sprint1', name: 'Sprint 1 (24/11 - 15/12)', icon: 'sprint', count: 1 },
          { id: 'sprint2', name: 'Sprint 2 (16/12 - 7/1)', icon: 'sprint', count: 12 },
          { id: 'sprint3', name: 'Sprint 3 (12/1 - 1/2)', icon: 'sprint', count: 14 },
          { id: 'retro1', name: 'Sprint 1 Retro Board', icon: 'whiteboard' },
          { id: 'sprint4', name: 'Sprint 4 (2/2 - 22/2)', icon: 'sprint', count: 35, countStyle: 'pill' },
        ],
      },
    ],
    items: [
      { id: 'list1', name: 'List', icon: 'list', count: 1 },
      { id: 'backlog', name: 'Backlog', icon: 'list', count: 47 },
      { id: 'retro-wb-1', name: 'Sprint 1 : Retro board', icon: 'whiteboard' },
      { id: 'retro-wb-2', name: 'Sprint 1 : Retro board', icon: 'whiteboard' },
    ],
  },
]

export const docs: DocItem[] = [
  {
    id: 'doc1',
    name: 'Post-Migration Updates (Access ...',
    location: 'Post-Migration Updates (Access...)',
  },
]

// ---- Task statuses (ordered as they appear in the list view) ----

export const taskStatuses: Record<string, TaskStatus> = {
  devCompleted: { id: 'devCompleted', label: 'DEV COMPLETED', color: '#87902e' },
  holdForInfo: { id: 'holdForInfo', label: 'HOLD FOR INFORMATION', color: '#d8354f' },
  qaInProgress: { id: 'qaInProgress', label: 'QA IN PROGRESS', color: '#e8871e' },
  inProgress: { id: 'inProgress', label: 'IN PROGRESS', color: '#4194f6' },
  toDo: { id: 'toDo', label: 'TO DO', color: '#87909e' },
  complete: { id: 'complete', label: 'COMPLETE', color: '#27ae60' },
}

/** Render order of status groups in list views */
export const statusOrder = [
  'devCompleted',
  'holdForInfo',
  'qaInProgress',
  'inProgress',
  'toDo',
  'complete',
]

// ---- Tasks ----

let taskSeq = 0
function task(listId: string, statusId: string, name: string, extra: Partial<Task> = {}): Task {
  taskSeq += 1
  return { id: `t${taskSeq}`, listId, statusId, name, ...extra }
}

export const tasks: Task[] = [
  // Sprint 4 (2/2 - 22/2) — transcribed from the reference screenshot
  task('sprint4', 'devCompleted', 'Dashboard - Fast Moving Items (Widget)', {
    subtaskCount: 2, hasDescription: true, estimateHours: 6,
  }),
  task('sprint4', 'devCompleted', 'Dashboard - Fast Moving Items Detailed Page', {
    subtaskCount: 3, hasDescription: true, estimateHours: 8,
  }),
  task('sprint4', 'holdForInfo', 'Microsoft Account Setup', {
    subtaskCount: 1, estimateHours: 12,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Header', {
    subtaskCount: 2, hasDescription: true, dueDate: '12/5/25', dueOverdue: true, estimateHours: 8,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Sales History', {
    subtaskCount: 3, hasDescription: true, dueDate: '12/8/25', dueOverdue: true, estimateHours: 18,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Quote History', {
    subtaskCount: 2, hasDescription: true, dueDate: '12/9/25', dueOverdue: true, estimateHours: 18,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Purchase History', {
    subtaskCount: 2, hasDescription: true, dueDate: '12/9/25', dueOverdue: true, estimateHours: 18,
  }),
  task('sprint4', 'qaInProgress', 'Product details page - Inventory Forecast Trend Chart', {
    subtaskCount: 2, hasDescription: true, estimateHours: 16,
  }),
  task('sprint4', 'qaInProgress', 'Product details page - Pricing History Chart', {
    subtaskCount: 2, hasDescription: true, estimateHours: 8,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Stock Status Overview and Location Distribution', {
    subtaskCount: 2, hasDescription: true, estimateHours: 8,
  }),
  task('sprint4', 'qaInProgress', 'Product Details page - Warehouse Location Distribution', {
    subtaskCount: 2, estimateHours: 8,
  }),
  task('sprint4', 'qaInProgress', 'Product details page - Reserved Stock Handling', {
    subtaskCount: 1, estimateHours: 12,
  }),

  // Earlier sprints — representative content so navigation feels real
  task('sprint1', 'complete', 'Login & Authentication Flow', {
    subtaskCount: 4, hasDescription: true, assigneeId: 'abdulRahuman', estimateHours: 16,
  }),
  task('sprint2', 'complete', 'Inventory Sync Service', {
    subtaskCount: 3, hasDescription: true, assigneeId: 'abirami', estimateHours: 24,
  }),
  task('sprint2', 'complete', 'Warehouse Master Data Screens', {
    subtaskCount: 2, assigneeId: 'abdullah', estimateHours: 12,
  }),
  task('sprint2', 'inProgress', 'Purchase Order Import', {
    subtaskCount: 2, hasDescription: true, assigneeId: 'abinaya', estimateHours: 10,
  }),
  task('sprint2', 'toDo', 'Email Notification Templates', { estimateHours: 6 }),
  task('sprint3', 'complete', 'Dashboard - Stock Ageing Widget', {
    subtaskCount: 2, hasDescription: true, assigneeId: 'anamul', estimateHours: 8,
  }),
  task('sprint3', 'inProgress', 'Dashboard - Slow Moving Items', {
    subtaskCount: 3, hasDescription: true, assigneeId: 'abirami', dueDate: '1/28/26', estimateHours: 14,
  }),
  task('sprint3', 'toDo', 'Ask AI - Email Knowledge Source', {
    subtaskCount: 1, estimateHours: 12,
  }),
  task('list1', 'toDo', 'MSM go-live checklist', { hasDescription: true, estimateHours: 4 }),
  task('backlog', 'toDo', 'Multi-currency support', { estimateHours: 24 }),
  task('backlog', 'toDo', 'Role-based access control', { subtaskCount: 5, estimateHours: 32 }),
  task('backlog', 'toDo', 'Audit log viewer', { estimateHours: 12 }),
  task('backlog', 'toDo', 'Bulk CSV export', { estimateHours: 8 }),
]

const base = { read: false, cleared: false, later: false } as const

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    tab: 'primary',
    group: 'Today',
    icon: { kind: 'space' },
    title: 'MSM',
    titleIcon: 'share',
    preview: [
      { text: 'Arun RK ' },
      { text: 'shared this Space', style: 'link' },
      { text: ' with you' },
    ],
    count: 1,
    timeLabel: '12:49 PM',
    ...base,
  },
  {
    id: 'n2',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'access' },
    title: 'Access request',
    avatar: { kind: 'user', userId: 'azad' },
    preview: [{ text: 'azad.vt@techjays.com requested access to Workspace: Techjays' }],
    count: 1,
    timeLabel: 'Jan 22',
    ...base,
  },
  {
    id: 'n3',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'status', color: '#2ea44f' },
    title: 'Private task',
    avatar: { kind: 'dot', color: '#3b5bfd' },
    preview: [
      { text: 'Retest Status: Issue resolved ✅ ' },
      { text: "Cowboyslogistics Cowboy's Logistics", style: 'bold' },
    ],
    attachment: { label: 'image.png' },
    count: 11,
    timeLabel: 'Jan 20',
    ...base,
  },
  {
    id: 'n4',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'status', color: '#e0202f' },
    title: 'Private task',
    avatar: { kind: 'dot', color: '#3b5bfd' },
    preview: [
      { text: '@Santhiya', style: 'mention' },
      { text: ' \\ ' },
      { text: '@Anamul Hasan', style: 'mention' },
      {
        text: " global Ask AI has knowledge from emails as well - you can see the email IDs, so it's not hallucinating.",
      },
    ],
    count: 5,
    timeLabel: 'Jan 20',
    ...base,
  },
  {
    id: 'n5',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'status', color: '#3d434d' },
    title: 'Private task',
    avatar: { kind: 'user', userId: 'anamul' },
    preview: [
      {
        text: "It's not currently possible without any complicated integration. So, moving it for no fix needed.",
      },
    ],
    count: 4,
    timeLabel: 'Jan 20',
    ...base,
  },
  {
    id: 'n6',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'clock', color: '#ef8c00' },
    title: 'Product Details page - Stock Status Overview and Location Details',
    avatar: { kind: 'dot', color: '#3b5bfd' },
    preview: [
      {
        text: 'Notes:  •  The formula for the below are yet to be provided:   •  Stockout Date   •  Reorder Date Reserved should not be added to the UI until further notice',
      },
    ],
    count: 23,
    timeLabel: 'Jan 20',
    ...base,
  },
  {
    id: 'n7',
    tab: 'primary',
    group: 'January',
    icon: { kind: 'clock', color: '#ef8c00' },
    title: 'Product details page - Inventory Forecast Trend Chart',
    avatar: { kind: 'dot', color: '#3b5bfd' },
    preview: [
      { text: '@Kanish', style: 'mention' },
      { text: '  ' },
      { text: '@shanmugaraj', style: 'mention' },
      { text: '  ' },
      { text: 'UPDATE!', style: 'boldItalic' },
      { text: ' Changed 12-Month Forecast to 6-Month Forecast Avg Updated formula: ' },
      { text: 'Sum of forecasted inventory', style: 'code' },
    ],
    count: 29,
    timeLabel: 'Jan 20',
    ...base,
  },
  // ---- "Other" tab (7 unread) ----
  {
    id: 'o1',
    tab: 'other',
    group: 'January',
    icon: { kind: 'channel' },
    title: 'Welcome',
    avatar: { kind: 'user', userId: 'arun' },
    preview: [
      { text: 'Arun RK ' },
      { text: 'posted in', style: 'link' },
      { text: ' #Welcome: Welcome to the Techjays workspace 👋' },
    ],
    count: 1,
    timeLabel: 'Jan 19',
    ...base,
  },
  {
    id: 'o2',
    tab: 'other',
    group: 'January',
    icon: { kind: 'channel' },
    title: 'General',
    avatar: { kind: 'user', userId: 'abirami' },
    preview: [{ text: 'Standup reminder: post your updates before 10:30 AM' }],
    count: 3,
    timeLabel: 'Jan 19',
    ...base,
  },
  {
    id: 'o3',
    tab: 'other',
    group: 'January',
    icon: { kind: 'status', color: '#8a6fe8' },
    title: 'Private task',
    avatar: { kind: 'dot', color: '#3b5bfd' },
    preview: [
      { text: 'Status changed: ' },
      { text: 'IN PROGRESS', style: 'bold' },
      { text: ' → ' },
      { text: 'REVIEW', style: 'bold' },
    ],
    count: 2,
    timeLabel: 'Jan 18',
    ...base,
  },
  {
    id: 'o4',
    tab: 'other',
    group: 'January',
    icon: { kind: 'space' },
    title: 'MSM',
    preview: [
      { text: 'Sprint 4 (2/2 - 22/2) ' },
      { text: 'was added to', style: 'link' },
      { text: ' MVP - MSM' },
    ],
    count: 1,
    timeLabel: 'Jan 17',
    ...base,
  },
  {
    id: 'o5',
    tab: 'other',
    group: 'January',
    icon: { kind: 'clock', color: '#ef8c00' },
    title: 'Private task',
    avatar: { kind: 'user', userId: 'abdullah' },
    preview: [{ text: 'Due date changed to Feb 12' }],
    count: 1,
    timeLabel: 'Jan 16',
    ...base,
  },
  {
    id: 'o6',
    tab: 'other',
    group: 'January',
    icon: { kind: 'channel' },
    title: 'General',
    avatar: { kind: 'user', userId: 'abinaya' },
    preview: [
      { text: 'Abinaya Suresh attached ' },
      { text: 'Q1-roadmap.pdf', style: 'bold' },
    ],
    attachment: { label: 'Q1-roadmap.pdf' },
    count: 1,
    timeLabel: 'Jan 15',
    ...base,
  },
  {
    id: 'o7',
    tab: 'other',
    group: 'January',
    icon: { kind: 'access' },
    title: 'Security alert',
    preview: [{ text: 'New login to your account from Chrome on Windows' }],
    count: 1,
    timeLabel: 'Jan 15',
    ...base,
  },
]
