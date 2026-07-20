import type {
  AppNotification,
  Channel,
  DocBlock,
  DocItem,
  Space,
  Task,
  TaskStatus,
  User,
  WorkspaceTag,
} from './types'

export const WORKSPACE_NAME = 'Techjays'

export const users: Record<string, User> = {
  pavithran: { id: 'pavithran', name: 'Pavithran', initials: 'PR', color: '#7b68ee' },
  arun: { id: 'arun', name: 'Arun RK', initials: 'AR', color: '#b0491b' },
  lydia: {
    id: 'lydia',
    name: 'Lydia Rubavathy',
    initials: 'LR',
    color: '#c2266b',
    deactivated: true,
  },
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

// ---- Status registry (full workspace set from the video's status dropdown) ----

export const taskStatuses: Record<string, TaskStatus> = {
  toDo: { id: 'toDo', label: 'TO DO', color: '#87909e', group: 'not-started', style: 'outline' },
  baInProgress: { id: 'baInProgress', label: 'BA IN PROGRESS', color: '#3e5474', group: 'active' },
  readyForDev: { id: 'readyForDev', label: 'READY FOR DEV', color: '#20b0c8', group: 'active' },
  devInProgress: { id: 'devInProgress', label: 'DEV IN PROGRESS', tableStyle: 'outline', color: '#2ba3d4', group: 'active' },
  readyForQa: { id: 'readyForQa', label: 'READY FOR QA', tableStyle: 'outline', color: '#d84f8f', group: 'active' },
  qaInProgress: { id: 'qaInProgress', label: 'QA IN PROGRESS', tableStyle: 'outline', color: '#e8871e', group: 'active' },
  readyForBaReview: { id: 'readyForBaReview', label: 'READY FOR BA REVIEW', color: '#8a5fe8', group: 'active' },
  baReviewInProgress: { id: 'baReviewInProgress', label: 'BA REVIEW IN PROGRESS', color: '#6f7cd0', group: 'active' },
  reopen: { id: 'reopen', label: 'REOPEN', color: '#d8354f', group: 'active' },
  notABug: { id: 'notABug', label: 'NOT A BUG', color: '#5b9dd9', group: 'active' },
  holdForInfo: { id: 'holdForInfo', label: 'HOLD FOR INFORMATION', color: '#b01830', group: 'active' },
  moveToNextSprint: { id: 'moveToNextSprint', label: 'MOVE TO NEXT SPRINT', color: '#b8860b', group: 'active' },
  noFixNeeded: { id: 'noFixNeeded', label: 'NO FIX NEEDED', color: '#64748b', group: 'active' },
  devCompleted: { id: 'devCompleted', label: 'DEV COMPLETED', color: '#87902e', group: 'active' },
  notReproduced: { id: 'notReproduced', label: 'NOT REPRODUCED', color: '#c026d3', group: 'active' },
  qaComplete: { id: 'qaComplete', label: 'QA COMPLETE', color: '#159a8f', group: 'done' },
  readyForBaReviewInQa: {
    id: 'readyForBaReviewInQa',
    label: 'READY FOR BA REVIEW IN QA',
    color: '#159a6b',
    group: 'done',
  },
  baReviewComplete: { id: 'baReviewComplete', label: 'BA REVIEW COMPLETE', color: '#27ae60', group: 'done' },
  readyForProduction: { id: 'readyForProduction', label: 'READY FOR PRODUCTION', color: '#16a34a', group: 'done' },
  movedToProduction: { id: 'movedToProduction', label: 'MOVED TO PRODUCTION', color: '#15803d', group: 'closed' },
}

/** Board column order — the workspace's canonical status pipeline */
export const boardOrder = [
  'toDo',
  'baInProgress',
  'readyForDev',
  'devInProgress',
  'readyForQa',
  'qaInProgress',
  'readyForBaReview',
  'baReviewInProgress',
  'reopen',
  'notABug',
  'holdForInfo',
  'moveToNextSprint',
  'noFixNeeded',
  'devCompleted',
  'notReproduced',
  'qaComplete',
  'readyForBaReviewInQa',
  'baReviewComplete',
  'readyForProduction',
  'movedToProduction',
]

/** Render order of status groups in list views and the status dropdown */
export const statusOrder = [
  'holdForInfo',
  'readyForDev',
  'baInProgress',
  'devInProgress',
  'readyForQa',
  'qaInProgress',
  'readyForBaReview',
  'baReviewInProgress',
  'reopen',
  'notABug',
  'moveToNextSprint',
  'noFixNeeded',
  'devCompleted',
  'notReproduced',
  'toDo',
  'qaComplete',
  'readyForBaReviewInQa',
  'baReviewComplete',
  'readyForProduction',
  'movedToProduction',
]

export const workspaceTags: Record<string, WorkspaceTag> = {
  spt: { id: 'spt', label: 'spt', bg: '#e3f2fe', text: '#0898f8' },
  msm: { id: 'msm', label: 'msm', bg: '#2ea52c', text: '#ffffff', chip: 'filled' },
  pending: { id: 'pending', label: 'pending', bg: '#ece8fd', text: '#7b68ee' },
  bug: { id: 'bug', label: 'bug', bg: '#27ae60', text: '#ffffff', chip: 'filled' },
  clientFeedback: {
    id: 'clientFeedback',
    label: 'client feedback',
    bg: '#0f7f70',
    text: '#ffffff',
    chip: 'filled',
  },
}

/** Which status groups start collapsed, per list (matches the video) */
export const defaultGroupCollapse: Record<string, string[]> = {
  backlog: ['holdForInfo', 'baInProgress', 'toDo'],
}

// ---- Tasks ----

let taskSeq = 0
function task(listId: string, statusId: string, name: string, extra: Partial<Task> = {}): Task {
  taskSeq += 1
  return { id: `t${taskSeq}`, listId, statusId, name, ...extra }
}

/** Light generic description so every backlog row's ≡ icon has a real preview. */
function entryConditionDoc(subject: string): DocBlock[] {
  return [
    { kind: 'h2', text: 'Entry Condition:' },
    {
      kind: 'bullets',
      items: [
        'User must be logged in with valid role permissions',
        `User navigates to the ${subject}`,
        'All data synced from Eniteo ERP',
      ],
    },
  ]
}

const READY_FOR_DEV_NAMES = [
  'Purchase Listing page',
  'Purchase Order Details page',
  'Sales Listing page',
  'Sales Order Details page',
  'Quote Listing page',
  'Quote Details page',
  'Inventory Listing Page',
  'User Sign In',
  'Log Out',
  'Vendor Listing page',
  'Vendor Details page',
  'Profile page',
  'Customer Details page',
  'User Management page',
  'Forecast Listing Page',
  'Product Details page - Header',
  'Product Details page - Purchase History',
  'Customer Listing page',
  'Product Details page - Quote History',
  'Product Details page - Sales History',
  'Product details page - Pricing History Chart',
  'Product details page - Excess Stock Alert',
  'Product details page - Reorder Alert',
  'Dashboard - Summary Cards (At top)',
  'Dashboard - Inventory Health Status',
  'Dashboard - Inventory by Category',
  'Dashboard - Critical Stock Items Widget',
  'Dashboard - Critical Stock Items Detailed Page',
  'Dashboard - Fast Moving Items (Widget)',
  'Dashboard - Fast Moving Items Detailed Page',
  'Dashboard - Slow Moving Items Widget',
  'Dashboard - Slow Moving Items Detailed Page',
  'Dashboard - Top Quoted Items Widget',
  'Dashboard - Top Quoted Items Detailed Page',
  'Dashboard - Top Customers Widget',
  'Dashboard - Top Customers Detailed Page',
  'Dashboard - Top Vendors Widget',
  'Dashboard - Top Vendors Detailed Page',
  'Dashboard - Inventory Value Trend Graph',
  'Dashboard - Demand vs Supply Graph',
]

const accessAndPermissionsDoc: DocBlock[] = [
  { kind: 'h2', text: 'User Story' },
  {
    kind: 'p',
    text: 'As a system user, I want my access and permissions to be determined by my assigned role, so that I can access only the features and actions appropriate to my responsibilities.',
  },
  { kind: 'h2', text: 'Entry Condition:' },
  {
    kind: 'bullets',
    items: [
      'User must be logged in with a valid Microsoft SSO account',
      'User must have an assigned role (Super Admin, Admin, or Viewer)',
      'User must not have "No Access" status',
    ],
  },
  { kind: 'h2', text: 'Acceptance Criteria:' },
  { kind: 'sub', text: 'Super Admin Role:' },
  {
    kind: 'bullets',
    items: [
      'Has access to all system modules including User Management',
      'Full access to: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor, User Management',
      'Can view, search, filter, sort, and export data from all modules',
      'Navigation menu displays all available modules',
      'User Management menu item visible and accessible',
    ],
  },
  { kind: 'sub', text: 'Admin Role:' },
  {
    kind: 'bullets',
    items: [
      'Has access to all operational modules except User Management',
      'Full access to: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor',
      'User Management menu item NOT visible in navigation',
      'Can view, search, filter, sort, and export data from all accessible modules',
      'Cannot access User Management page',
    ],
  },
  { kind: 'sub', text: 'Viewer Role:' },
  {
    kind: 'bullets',
    items: [
      'Has read-only access to operational modules',
      'User Management menu item NOT visible in navigation',
      'Can view only: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor',
      'Can search, filter, sort, and export data (read-only operations only)',
      'No data modification capabilities',
      'Cannot access User Management page',
    ],
  },
  { kind: 'sub', text: 'No Access Status:' },
  {
    kind: 'bullets',
    items: [
      'Cannot log in to the system',
      'Listed in User Management but blocked from authentication',
      'Receives error message when attempting to sign in',
    ],
  },
  { kind: 'h2', text: 'Scenarios:' },
  { kind: 'sub', text: 'Super Admin Access:' },
  {
    kind: 'numbered',
    items: [
      'Super Admin logs in via Microsoft SSO',
      'System validates Super Admin role',
      'Navigation menu displays all items: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor, User Management',
      'Super Admin can access any module from navigation',
      'Super Admin can view all data across all modules',
      'Super Admin can search, filter, sort, and export data from any module',
      'Super Admin can access User Management to manage other users',
    ],
  },
  { kind: 'sub', text: 'Admin Access:' },
  {
    kind: 'numbered',
    items: [
      'Admin logs in via Microsoft SSO',
      'System validates Admin role',
      'Navigation menu displays: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor',
      'User Management menu item not visible',
      'Admin can access any visible module from navigation',
      'Admin can view all data across accessible modules',
      'Admin can search, filter, sort, and export data from any accessible module',
      'If Admin attempts to access User Management URL directly, system denies access with error message',
    ],
  },
  { kind: 'sub', text: 'Viewer Access:' },
  {
    kind: 'numbered',
    items: [
      'Viewer logs in via Microsoft SSO',
      'System validates Viewer role',
      'Navigation menu displays: Dashboard, Forecast, Inventory, Sales, Purchase, Quote, Customer, Vendor',
      'User Management menu item not visible',
      'Viewer can access any visible module from navigation',
      'Viewer can only view, search, filter, sort, and export data',
      'No data modification capabilities available',
      'If Viewer attempts to access User Management URL directly, system denies access with error message',
    ],
  },
  { kind: 'sub', text: 'No Access User Login Attempt:' },
  {
    kind: 'numbered',
    items: [
      'User with "No Access" status attempts to sign in',
      'User completes Microsoft SSO authentication',
      'System checks user role/status',
      'System detects "No Access" status',
      'Error message displayed: "You do not have access to this system. Please contact your administrator"',
      'User redirected back to login page',
      'User cannot access any part of the system',
    ],
  },
  { kind: 'sub', text: 'Direct URL Access Attempt (Unauthorized):' },
  {
    kind: 'numbered',
    items: [
      'Admin or Viewer attempts to access restricted URL directly (e.g. typing User Management URL)',
      'System validates role permissions for the requested route',
      'Access denied message displayed',
      'User remains on their current page',
    ],
  },
  { kind: 'h2', text: 'Unhappy Path:' },
  {
    kind: 'bullets',
    items: [
      'No Access login attempt → Display: "You do not have access to this system. Please contact your administrator" and redirect to login',
      'Viewer attempts User Management access → Display: "Access Denied. You do not have permission to access this page"',
      'Admin attempts User Management access → Display: "Access Denied. You do not have permission to access this page"',
      'Direct URL access to restricted page → System blocks access and shows: "Access Denied. You do not have permission to access this page"',
      'Session expired during restricted access attempt → Redirect to login page',
      'Role changed during active session → Force logout and require re-authentication',
    ],
  },
  { kind: 'h2', text: 'Validations:' },
  {
    kind: 'bullets',
    items: [
      'User must have valid role assigned (Super Admin, Admin, Viewer)',
      'Navigation menu dynamically generated based on role',
      'Direct URL access to restricted pages blocked with authorization checks',
      'Role validation occurs on every page load and action',
      '"No Access" users cannot authenticate past login screen',
      'All API calls validate user permissions server-side',
    ],
  },
  { kind: 'h2', text: 'Messages:' },
  {
    kind: 'bullets',
    items: [
      'Access Denied (Page): "Access Denied. You do not have permission to access this page"',
      'No Access Status: "You do not have access to this system. Please contact your administrator"',
      'Session Expired: "Your session has expired. Please log in again"',
      'Role Changed: "Your access level has changed. Please log in again"',
    ],
  },
  { kind: 'h2', text: 'Additional Notes:' },
  {
    kind: 'bullets',
    items: [
      'All data sourced from Eniteo ERP integration (consistent across all roles)',
      "Navigation menu dynamically rendered based on user's assigned role",
      'Server-side validation enforces permissions for all actions',
      'Role changes require user to logout and login to take effect',
      'Export functionality available to all roles for accessible modules',
      'Search, filter, and sort functionality available to all roles',
    ],
  },
  { kind: 'h2', text: 'Impact Places:' },
  {
    kind: 'bullets',
    items: [
      'Navigation Menu (User Management visibility based on role)',
      'User Management Page (visible to Super Admin only)',
      'All viewing modules (accessible based on role with consistent view/export capabilities)',
      'Authentication flow (validates role and permissions)',
      'All page routes (authorization checks)',
    ],
  },
]

const inventoryHealthDoc: DocBlock[] = [
  { kind: 'h2', text: 'User Story:' },
  {
    kind: 'p',
    text: 'As a user, I want to view a donut chart visualization that displays the distribution of products across different inventory health statuses so that I can quickly identify stock issues and make informed decisions about inventory management.',
  },
  { kind: 'h2', text: 'Entry Condition:' },
  { kind: 'bullets', items: ['User navigates to the inventory dashboard'] },
]

const SUBTASK_NAMES = [
  'Dashboard Summary API',
  'Pie-chart API : Inventory Health',
  'Pie-chart API : Inventory by Category',
  'Critical Stock Items API',
  'Fast Moving API',
  'Slow Moving API',
  'Top Quoted Items',
  'Line Graph : Inventory Value Trend API',
  'Line Graph : Demand VS Supply API',
  'Top Vendors API',
]

function buildBacklog(): Task[] {
  const out: Task[] = []

  // HOLD FOR INFORMATION (1)
  out.push(
    task('backlog', 'holdForInfo', 'Access and Permissions', {
      tags: ['spt'],
      hasDescription: true,
      assigneeIds: ['lydia'],
      estimateHours: 22,
      codeId: '#86d1gzq48',
      createdLabel: 'Jan 8',
      description: accessAndPermissionsDoc,
      loadDelayed: true,
      activity: [
        {
          kind: 'event',
          id: 'a1',
          text: 'Lydia Rubavathy (deactivated) created this task by copying',
          link: '#86d11156x - Access and Permissions',
          timeLabel: 'Jan 8 at 5:49 pm',
        },
        {
          kind: 'event',
          id: 'a2',
          text: 'Lydia Rubavathy (deactivated) set time estimate to 22h',
          timeLabel: 'Jan 8 at 5:52 pm',
          hidden: true,
        },
        {
          kind: 'event',
          id: 'a3',
          text: 'Lydia Rubavathy (deactivated) added tag spt',
          timeLabel: 'Jan 8 at 6:01 pm',
          hidden: true,
        },
        {
          kind: 'event',
          id: 'a4',
          text: 'Lydia Rubavathy (deactivated) added follower: Lydia Rubavathy (deactivated)',
          timeLabel: 'Jan 8 at 6:47 pm',
        },
      ],
    }),
  )

  // READY FOR DEV (40)
  for (const name of READY_FOR_DEV_NAMES) {
    out.push(
      task('backlog', 'readyForDev', name, {
        tags: ['spt'],
        hasDescription: true,
        description:
          name === 'Product Details page - Purchase History'
            ? [
                { kind: 'h2', text: 'Entry Condition:' },
                {
                  kind: 'bullets',
                  items: [
                    'User must be logged in with valid role permissions',
                    'User navigates to the Product Details page',
                    'User selects the "Purchase History" tab',
                    'Purchase data synced from Eniteo ERP',
                  ],
                },
              ]
            : entryConditionDoc(name),
      }),
    )
  }

  // BA IN PROGRESS (4)
  const invHealth = task('backlog', 'baInProgress', 'Dashboard - Inventory Health Status', {
    tags: ['msm', 'pending'],
    hasDescription: true,
    assigneeIds: ['lydia'],
    subtaskCount: 10,
    codeId: '#86d10x5jx',
    createdLabel: 'Nov 20 2025',
    description: inventoryHealthDoc,
    loadDelayed: true,
    activity: [
      {
        kind: 'event',
        id: 'b1',
        text: 'Lydia Rubavathy (deactivated) created this task',
        timeLabel: 'Nov 20 2025 at 9:28 am',
      },
      {
        kind: 'event',
        id: 'b2',
        text: 'Lydia Rubavathy (deactivated) added subtask: Dashboard Summary API',
        timeLabel: 'Nov 21 2025 at 10:02 am',
        hidden: true,
      },
      {
        kind: 'comment',
        id: 'b3',
        userId: 'lydia',
        timeLabel: 'Dec 9 2025 at 3:00 pm',
        body: 'Statuses are yet to be defined @Lydia Rubavathy',
      },
      {
        kind: 'event',
        id: 'b4',
        text: 'Lydia Rubavathy (deactivated) added tag msm',
        timeLabel: 'Jan 9 at 5:27 pm',
      },
    ],
  })
  out.push(invHealth)
  out.push(
    task('backlog', 'baInProgress', 'Integration with Eniteo ERP', {
      tags: ['spt'],
      hasDescription: true,
      description: entryConditionDoc('Eniteo ERP integration settings'),
    }),
    task('backlog', 'baInProgress', 'Product Details page - Stock Status Overview and Location Distribution', {
      tags: ['spt'],
      hasDescription: true,
      description: entryConditionDoc('Product Details page'),
    }),
    task('backlog', 'baInProgress', 'Product details page - Inventory Forecast Trend Chart', {
      tags: ['spt'],
      hasDescription: true,
      assigneeIds: ['lydia'],
      description: entryConditionDoc('Product Details page'),
    }),
  )

  // Subtasks of Dashboard - Inventory Health Status
  for (const name of SUBTASK_NAMES) {
    out.push(task('backlog', 'toDo', name, { parentId: invHealth.id }))
  }

  // TO DO (2) — never expanded on screen in the recording
  out.push(
    task('backlog', 'toDo', 'Reports - Export to Excel', { tags: ['spt'] }),
    task('backlog', 'toDo', 'Notification Center', { tags: ['spt'] }),
  )

  return out
}

export const tasks: Task[] = [
  ...buildBacklog(),

  // Sprint 4 (2/2 - 22/2) — from the earlier reference screenshot
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

  // Earlier sprints
  task('sprint1', 'movedToProduction', 'Login & Authentication Flow', {
    subtaskCount: 4, hasDescription: true, assigneeIds: ['abdulRahuman'], estimateHours: 16,
  }),
  task('sprint2', 'movedToProduction', 'Inventory Sync Service', {
    subtaskCount: 3, hasDescription: true, assigneeIds: ['abirami'], estimateHours: 24,
  }),
  task('sprint2', 'movedToProduction', 'Warehouse Master Data Screens', {
    subtaskCount: 2, assigneeIds: ['abdullah'], estimateHours: 12,
  }),
  task('sprint2', 'devInProgress', 'Purchase Order Import', {
    subtaskCount: 2, hasDescription: true, assigneeIds: ['abinaya'], estimateHours: 10,
  }),
  task('sprint2', 'toDo', 'Email Notification Templates', { estimateHours: 6 }),
  task('sprint3', 'movedToProduction', 'Dashboard - Stock Ageing Widget', {
    subtaskCount: 2, hasDescription: true, assigneeIds: ['anamul'], estimateHours: 8,
  }),
  task('sprint3', 'devInProgress', 'Dashboard - Slow Moving Items', {
    subtaskCount: 3, hasDescription: true, assigneeIds: ['abirami'], dueDate: '1/28/26', estimateHours: 14,
  }),
  task('sprint3', 'toDo', 'Ask AI - Email Knowledge Source', {
    subtaskCount: 1, estimateHours: 12,
  }),

  // "List" under MSM — matches the video: QA COMPLETE (1) / TO DO (0)
  task('list1', 'qaComplete', 'MSM go-live checklist', { hasDescription: true, estimateHours: 4 }),
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
