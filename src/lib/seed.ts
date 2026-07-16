import type { AppNotification, Channel, Space, User } from './types'

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
  { id: 'general', name: 'General', suffix: 'Techjays' },
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
          { id: 'retro1', name: 'Sprint 1 Retro Board', icon: 'board' },
          { id: 'sprint4', name: 'Sprint 4 (2/2 - 22/2)', icon: 'sprint', count: 35, countStyle: 'pill' },
          { id: 'list1', name: 'List', icon: 'list', count: 1 },
        ],
      },
    ],
  },
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
