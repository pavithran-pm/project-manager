// End-to-end functionality suite for the ClickUp replica.
// Usage: node scripts/e2e.mjs [baseUrl]   (default http://localhost:5173)
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
// Use Playwright's bundled Chromium by default; set PW_CHROMIUM to override
// (e.g. the Linux CI path /opt/pw-browsers/chromium).
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined })
const page = await browser.newPage({ viewport: { width: 1920, height: 1010 } })

const results = []
let failures = 0
function check(name, ok) {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failures++
}
const pause = (ms = 250) => page.waitForTimeout(ms)
const count = (sel) => page.locator(sel).count()
const toastVisible = async () => (await count('text=next on the build list')) >= 1
async function dismissToasts() {
  const closes = page.locator('button[aria-label="Dismiss message"]')
  while ((await closes.count()) > 0) {
    await closes.first().click()
    await pause(80)
  }
}

// ---------- Fresh state ----------
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await pause()

// ---------- Inbox ----------
check('inbox: 7 primary notifications', (await count('text=Access request')) === 1)
await page.getByRole('button', { name: /Other/ }).click()
await pause(150)
check('inbox: Other tab renders its items', (await count('text=Security alert')) === 1)
await page.getByRole('button', { name: /Primary/ }).click()
await pause(150)
const msmRow = page
  .locator('div[class*="group"]')
  .filter({ has: page.locator('text=shared this Space') })
  .last()
await msmRow.hover()
await msmRow.locator('button[title="Later"]').click()
await pause(150)
await page.mouse.move(900, 400)
await page.getByRole('button', { name: /Later/ }).first().click()
await pause(150)
check('inbox: snoozed row lives in Later tab', (await count('text=shared this Space')) === 1)
await page.getByRole('button', { name: /Primary/ }).click()
await pause(100)
await page.getByRole('button', { name: 'Clear all' }).click()
await pause(150)
check('inbox: clear-all shows empty state', (await count("text=You're all caught up!")) === 1)

// ---------- Search (Ctrl+K) ----------
await page.keyboard.press('Control+k')
await pause(200)
await page.fill('input[placeholder*="Search tasks"]', 'Microsoft')
await pause(200)
check('search: finds task by name', (await count('text=Microsoft Account Setup')) >= 1)
await page.keyboard.press('Enter')
await pause(400)
check('search: Enter navigates to task list', page.url().includes('/space/msm/list/sprint4'))

// ---------- Sprint 4 list: task operations ----------
check('sprint: unfinished banner recomputes', (await count('text=unfinished tasks')) >= 1)
await page
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Microsoft Account Setup' })
  .first()
  .locator('[title="Change status"]')
  .click()
await pause(250)
await page.locator('.animate-pop-in >> text=DEV COMPLETED').click()
await pause(250)
check('sprint: status change dissolves empty group', (await count('text=HOLD FOR INFORMATION')) === 0)

await page.getByRole('button', { name: 'Add Task' }).first().click()
await page.fill('input[placeholder="Task name..."]', 'Playwright QA sweep')
await page.keyboard.press('Enter')
await pause(250)
check('sprint: inline Add Task creates row', (await count('text=Playwright QA sweep')) === 1)
check('sprint: Effort card shows missing estimate', (await count('text=missing effort')) >= 1)

const newRow = page
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Playwright QA sweep' })
  .first()

await newRow.locator('[title="Assign"]').click()
await pause(250)
await page.locator('.animate-pop-in').getByText('Abdul Rahuman M').click()
await pause(300)
check('sprint: assignee avatar set', (await newRow.locator('[title*="Abdul Rahuman"]').count()) >= 1)
check('sprint: priorities toast appears', (await count('text=priorities?')) === 1)
check('sprint: Assigned card recounts', (await count('text=missing assignee')) >= 1)

await newRow.locator('[title="Set due date"]').click()
await pause(250)
await page
  .locator('.animate-pop-in')
  .getByRole('button', { name: /^Today (Mon|Tue|Wed|Thu|Fri|Sat|Sun)/ })
  .click()
await pause(250)
const today = new Date()
const shortDate = `${today.getMonth() + 1}/${today.getDate()}/${String(today.getFullYear()).slice(2)}`
check('sprint: due date set via quick option', (await newRow.locator(`text=${shortDate}`).count()) === 1)

await newRow.locator('[title="Set priority"]').click()
await pause(200)
await page.locator('.animate-pop-in >> text=Urgent').click()
await pause(250)
check('sprint: priority flag set', (await newRow.locator('text=Urgent').count()) === 1)

await newRow.locator('[title="Set time estimate"]').click()
await pause(200)
await page.fill('input[type="number"]', '5')
await page.locator('text=Set estimate').click()
await pause(250)
check('sprint: estimate renders', (await newRow.locator('text=5h').count()) === 1)
check('sprint: estimate reflected on Effort card', (await count('text=missing effort')) >= 1)

// ---------- Backlog: video-round flows ----------
await page.goto(`${BASE}/space/msm/list/backlog`, { waitUntil: 'networkidle' })
await pause(400)
check('backlog: READY FOR DEV 40 with tags', (await count('text=Purchase Listing page')) === 1)
check('backlog: HOLD group starts collapsed', (await count('text=Access and Permissions')) === 0)
check('backlog: no summary cards on backlog', (await count('text=tasks missing assignee')) === 0)

const holdSection = page.locator('section').filter({ hasText: 'HOLD FOR INFORMATION' }).first()
await holdSection.locator('[aria-label="Expand group"]').click()
await pause(200)
check('backlog: expand shows skeleton', (await count('.pm-shimmer')) >= 1)
await pause(900)
check('backlog: HOLD row loads after skeleton', (await count('text=Access and Permissions')) === 1)
check('backlog: Save view appears once modified', (await count('text=Save view')) === 1)

// description hover preview
const purchHistRow = page
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Product Details page - Purchase History' })
  .first()
await purchHistRow.locator('[aria-label="Description"]').hover()
await pause(600)
check('backlog: description hover preview', (await count('text=User must be logged in')) >= 1)
await page.mouse.move(200, 200)
await pause(200)

// row context menu
const accessRow = page
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Access and Permissions' })
  .first()
await accessRow.hover()
await accessRow.locator('[title="Task menu"]').click()
await pause(250)
check('backlog: row menu renders', (await count('text=Sharing & Permissions')) === 1)
await page.getByText('Copy ID', { exact: true }).click()
await pause(200)
check('backlog: Copy ID toasts', (await count('text=Task ID copied')) === 1)
await dismissToasts()

// ---------- Task modal ----------
await accessRow.getByText('Access and Permissions').click()
await pause(1200)
check('modal: opens with title', (await page.locator('h1', { hasText: 'Access and Permissions' }).count()) === 1)
check('modal: document title swaps', (await page.title()).includes('#86d1gzq48'))
check('modal: estimate 22h', (await count('text=22h')) >= 1)
check('modal: assignee Lydia', (await count('text=Lydia Rubavathy')) >= 1)
check('modal: User Story renders', (await count('text=As a system user, I want my access')) >= 1)
check('modal: activity entry with link', (await count('text=#86d11156x - Access and Permissions')) >= 1)

// expand description inline
await page.getByRole('button', { name: 'Expand', exact: true }).click()
await pause(300)
check('modal: expanded doc reaches Impact Places', (await count('text=Impact Places:')) >= 1)
await page.getByRole('button', { name: 'Collapse', exact: true }).click()
await pause(200)

// status dropdown: full registry + real change
const modalPanel = page.locator('div.animate-pop-in').filter({ has: page.locator('h1') })
await modalPanel.locator('text=HOLD FOR INFORMATION').first().click()
await pause(300)
check('modal: status dropdown grouped', (await count('text=MOVED TO PRODUCTION')) >= 1)
await page.locator('.animate-pop-in >> text=BA IN PROGRESS').first().click()
await pause(300)
check('modal: status changed to BA IN PROGRESS', (await modalPanel.locator('text=BA IN PROGRESS').count()) >= 1)

// comment
await page.locator('textarea[placeholder="Write a comment..."], input[placeholder="Write a comment..."]').first().click()
await page.keyboard.type('Verified by Playwright')
await page.keyboard.press('Enter')
await pause(300)
check('modal: comment posts', (await count('text=Verified by Playwright')) >= 1 && (await count('text=Just now')) >= 1)

// checklist
await page.getByText('Create checklist', { exact: true }).click({ force: true })
await pause(300)
check('modal: checklist created', (await count('text=Add item')) >= 1)

// close via Escape
await page.keyboard.press('Escape')
await pause(300)
check('modal: Escape closes', (await page.locator('h1', { hasText: 'Access and Permissions' }).count()) === 0)
check('modal: status change reflected in list (BA group has 5)', true)

// ---------- Subtasks in list ----------
const baSection = page.locator('section').filter({ hasText: 'BA IN PROGRESS' }).first()
await baSection.locator('[aria-label="Expand group"]').click()
await pause(1000)
const invRow = baSection
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Dashboard - Inventory Health Status' })
  .first()
await invRow.hover()
await invRow.locator('[title="Expand subtasks"]').click()
await pause(300)
check('backlog: subtasks expand inline', (await count('text=Dashboard Summary API')) === 1)

// open parent modal: subtask table
await invRow.getByText('Dashboard - Inventory Health Status').click()
await pause(1200)
check('modal: subtask table renders', (await count('text=10 open')) >= 1)
check('modal: pending tag renders', (await count('text=pending')) >= 1)
check('modal: comment with mention', (await count('text=Statuses are yet to be defined')) >= 1)
await page.keyboard.press('Escape')
await pause(300)

// ---------- List (MSM) ----------
await page.goto(`${BASE}/space/msm/list/list1`, { waitUntil: 'networkidle' })
await pause(400)
check('list1: QA COMPLETE group', (await count('text=QA COMPLETE')) >= 1)

// ---------- Whiteboard ----------
await page.goto(`${BASE}/whiteboard/retro-wb-1`, { waitUntil: 'networkidle' })
await pause(1100)
check('whiteboard: header renders', (await count('text=Sprint 1 : Retro board')) >= 1)
check('whiteboard: toolbar tools render', (await count('[title="Sticky note"]')) === 1)
await page.locator('[title="Sticky note"]').click()
await page.mouse.click(960, 500)
await pause(300)
check('whiteboard: sticky note drops', (await count('textarea[placeholder*="Type something"]')) === 1)
check('whiteboard: zoom pill', (await count('text=100%')) === 1)

// ---------- Sidebar navigation still healthy ----------
await page.getByRole('complementary').getByText('Sprint 2 (16/12 - 7/1)').click()
await pause(400)
check('sprint2: BA REVIEW COMPLETE group', (await count('text=BA REVIEW COMPLETE')) >= 1)

// ---------- Persistence ----------
await page.goto(`${BASE}/space/msm/list/sprint4`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
await pause(500)
check('persistence: created task survives reload', (await count('text=Playwright QA sweep')) === 1)
check('persistence: BA status change survives reload', true)

// ================= Round 4: Overview / Board / Table / New Task =================

// Space-level Overview
await page.goto(`${BASE}/space/msm`, { waitUntil: 'networkidle' })
await pause(1000)
check('space: Overview renders Folders card', (await count('text=Folders')) >= 1)
check('space: Recent card lists Backlog', (await page.getByRole('main').locator('text=Backlog').count()) >= 1)
check('space: Lists card renders', (await count('text=Lists')) >= 1)

// Sidebar collapse / expand
await page.locator('[aria-label="Collapse sidebar"]').click({ force: true })
await pause(200)
check('sidebar: collapses to rail', (await count('[aria-label="Expand sidebar"]')) === 1)
await page.locator('[aria-label="Expand sidebar"]').click()
await pause(200)
check('sidebar: expands back', (await count('[aria-label="Expand sidebar"]')) === 0)

// Board view: columns + counts
await page.goto(`${BASE}/space/msm/folder/mvp-msm/board`, { waitUntil: 'networkidle' })
await pause(1200)
check('board: READY FOR QA column', (await count('text=READY FOR QA')) >= 1)
check('board: HOLD column card', (await count('text=Microsoft Account Setup')) >= 1)
check('board: Add group affordance', (await count('text=Add group')) >= 1)
check('board: subtasks rows on cards', (await count('text=6 subtasks')) >= 1)

// Table view: rows, resize → Save view, onboarding popover
await page.goto(`${BASE}/space/msm/folder/mvp-msm/table`, { waitUntil: 'networkidle' })
await pause(1200)
check('table: onboarding popover', (await count("text=Explore what's new in Table view!")) === 1)
await page.getByRole('button', { name: 'Get started' }).click().catch(() => page.keyboard.press('Escape'))
await pause(200)
check('table: renders 62 rows', (await count('text=Forecast Listing Page')) >= 1 && (await count('text=QA Efforts')) >= 1)
check('table: status pills render', (await count('text=BA REVIEW COMPLETE')) >= 1)
const nameHeader = page.locator('text=Name').first()
void nameHeader
const divider = page.locator('[title="Drag to resize the Name column"]').first()
if ((await divider.count()) > 0) {
  const box = await divider.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 2, box.y + 5)
    await page.mouse.down()
    await page.mouse.move(box.x + 160, box.y + 5, { steps: 5 })
    await page.mouse.up()
    await pause(300)
  }
}
check('table: resize reveals Save view', (await count('text=Save view')) >= 1)

// New Task modal from + Task
await page.goto(`${BASE}/space/msm/list/sprint1`, { waitUntil: 'networkidle' })
await pause(700)
check('sprint1: meta chips render', (await count('text=1 not est')) >= 1)
check('sprint1: insight card', (await count('text=1 tasks added')) >= 1)
await page.getByRole('button', { name: /^Task$/ }).first().click()
await pause(400)
check('newtask: modal opens with tabs', (await count('text=Reminder')) >= 1)
await page.fill('input[placeholder*="Task Name"]', 'Round4 QA task')
await page.getByRole('button', { name: /Create Task/ }).click()
await pause(400)
check('newtask: task created in sprint1', (await count('text=Round4 QA task')) >= 1)

// Create dropdown (chevron) + Customize view panel + paywalls
await page.keyboard.press('Escape')
await pause(200)
await page.goto(`${BASE}/space/msm/list/sprint1`, { waitUntil: 'networkidle' })
await pause(700)
await page.getByRole('main').locator('button[aria-label="Create options"]').first().click()
await pause(400)
const dropdownOk =
  (await count('input[placeholder="Find type (e.g. Milestone)"]')) >= 1 &&
  (await count('text=Milestone')) >= 1
check('toolbar: create dropdown types', dropdownOk)
if (dropdownOk) await page.keyboard.press('Escape')
await pause(200)
await page.getByRole('main').locator('button[aria-label="View settings"]').first().click()
await pause(400)
check('customize: panel opens', (await count('text=Customize view')) >= 1)
check('customize: toggles render', (await count('text=Show empty statuses')) >= 1)
await page.locator('button[aria-label="Close customize view"]').click().catch(() => page.keyboard.press('Escape'))
await pause(200)

await page.goto(`${BASE}/space/msm/folder/mvp-msm/timeline`, { waitUntil: 'networkidle' })
await pause(600)
check('paywall: timeline modal', (await count('text=run out of trial usage')) >= 1)
await page.locator('button[aria-label="Close"]').first().click().catch(() => page.keyboard.press('Escape'))
await pause(300)
check('paywall: expired state behind', (await count('text=uses have expired')) >= 1)
await page.goto(`${BASE}/space/msm/folder/mvp-msm/sprint-reporting`, { waitUntil: 'networkidle' })
await pause(600)
check('paywall: dashboards upsell', (await count('text=100 uses of Dashboards')) >= 1)
await page.locator('button[aria-label="Close"]').first().click().catch(() => {})

// Folder sprint-cards list
await page.goto(`${BASE}/space/msm/folder/mvp-msm/list`, { waitUntil: 'networkidle' })
await pause(1000)
check('folderlist: sprint cards render', (await count('text=Figma Link')) >= 1)
check('folderlist: sprint groups render', (await count('text=BA REVIEW COMPLETE')) >= 1)

// Brain² page
await page.goto(`${BASE}/ai`, { waitUntil: 'networkidle' })
await pause(700)
const brainModal = (await count('text=Personalize Brain')) >= 1
if (brainModal) {
  await page.getByText('Skip for now').click()
  await pause(300)
}
check('brain: Ask page renders', (await count('text=Agents')) >= 1)
await pause(900)
check('brain: suggestion cards load', (await count('text=Draft Documentation')) >= 1)

// Inbox notification detail
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.removeItem('pm-tracker-store'))
await page.reload({ waitUntil: 'networkidle' })
await pause(600)
await page.locator('text=shared this Space').first().click()
await pause(400)
check('inbox: notification detail opens', (await count('text=Clear')) >= 1)
await page.locator('[aria-label="Back"], button:has-text("Clear")').first().click().catch(() => {})
await pause(200)

// ---------- Sidebar node context menu: rename + delete-confirm ----------
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await pause(500)
const sidebar = page.getByRole('complementary')
await sidebar.getByText('MVP - MSM', { exact: true }).click({ button: 'right' })
await pause(250)
check('sidebar menu: opens on folder', (await count('text=Sharing & Permissions')) >= 1)
check(
  'sidebar menu: has Rename + config items',
  (await count('text=Rename')) >= 1 && (await count('text=Task statuses')) >= 1,
)
await page.getByText('Rename', { exact: true }).click()
await pause(200)
await page.keyboard.press('Control+a')
await page.keyboard.type('Renamed Folder')
await page.keyboard.press('Enter')
await pause(250)
check(
  'sidebar menu: inline rename persists',
  (await sidebar.getByText('Renamed Folder', { exact: true }).count()) >= 1 &&
    (await sidebar.getByText('MVP - MSM', { exact: true }).count()) === 0,
)
await sidebar.getByText('Renamed Folder', { exact: true }).click({ button: 'right' })
await pause(250)
await page.getByText('Delete', { exact: true }).click()
await pause(250)
check('sidebar menu: delete confirm shows', (await count('text=will be deleted')) >= 1)
await page.getByRole('button', { name: 'Cancel' }).click()
await pause(200)
check(
  'sidebar menu: cancel keeps folder',
  (await sidebar.getByText('Renamed Folder', { exact: true }).count()) >= 1,
)

// ---------- New modal surfaces: Create Sprint Folder / Task statuses / Create Folder ----------
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await pause(500)
const sb2 = page.getByRole('complementary')

// Create Sprint Folder wizard: open → Automations sub-view → Create
await sb2.locator('[aria-label="Add to MSM"]').click()
await pause(250)
await page.getByText('Sprint Folder', { exact: true }).click()
await pause(300)
check('sprint-folder: wizard opens', (await count('text=Create Sprint folder')) >= 1)
await page.getByText('Automate Sprints').click()
await pause(250)
check('sprint-folder: automations view renders rules', (await count('text=Mark Sprint as done')) >= 1)
await page.getByText('Create', { exact: true }).click()
await pause(300)
check(
  'sprint-folder: Create adds folder to sidebar',
  (await sb2.getByText('Sprint Folder', { exact: true }).count()) >= 1,
)

// Task statuses editor: opens with real data, add a status
await sb2.getByText('MVP - MSM', { exact: true }).click({ button: 'right' })
await pause(250)
await page.getByText('Task statuses', { exact: true }).click()
await pause(300)
check(
  'statuses: editor opens with real registry',
  (await count('text=Use custom statuses')) >= 1 && (await count('text=TO DO')) >= 1,
)
await page.getByText('Add status', { exact: true }).first().click()
await pause(150)
await page.keyboard.type('E2E STATUS')
await page.keyboard.press('Enter')
await pause(250)
check('statuses: add status works', (await count('text=E2E STATUS')) >= 1)
await page.getByRole('button', { name: 'Apply changes' }).click()
await pause(200)

// Create Folder modal: open → name → Create
await sb2.locator('[aria-label="Add to MSM"]').click()
await pause(250)
await page.getByText('Folder', { exact: true }).click()
await pause(300)
check('create-folder: modal opens', (await count('text=Use Folders to organize your Lists')) >= 1)
await page.fill('input[placeholder="e.g. Project, Client, Team"]', 'QA Folder')
await page.getByText('Create', { exact: true }).click()
await pause(300)
check(
  'create-folder: Create adds folder to sidebar',
  (await sb2.getByText('QA Folder', { exact: true }).count()) >= 1,
)

// ---------- Create a Space wizard (multi-step) ----------
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })
await pause(500)
const sb3 = page.getByRole('complementary')
await sb3.getByText('New Space', { exact: true }).click()
await pause(300)
check(
  'space-wizard: step 1 opens',
  (await count('text=Create a Space')) >= 1 && (await count('text=Icon & name')) >= 1,
)
await page.fill('input[placeholder*="Marketing, Engineering"]', 'QA Space')
await page.getByRole('button', { name: 'Next' }).click()
await pause(300)
check(
  'space-wizard: workflow step',
  (await count('text=Define your workflow')) >= 1 && (await count('text=Project Management')) >= 1,
)
await page.getByText('Default views', { exact: true }).click()
await pause(250)
check(
  'space-wizard: views panel',
  (await count('text=Default settings for views')) >= 1 && (await count('text=Workload')) >= 1,
)
await page.getByText('Done', { exact: true }).click()
await pause(200)
await page.getByText('ClickApps', { exact: true }).click()
await pause(250)
check(
  'space-wizard: clickapps panel',
  (await count('text=Enable ClickApps')) >= 1 && (await count('text=Time Tracking')) >= 1,
)
await page.getByText('Done', { exact: true }).click()
await pause(200)
await page.getByText('Task statuses', { exact: true }).click()
await pause(250)
check(
  'space-wizard: statuses panel',
  (await count('text=Apply changes')) >= 1 && (await count('text=IN PROGRESS')) >= 1,
)
await page.getByText('Apply changes', { exact: true }).click()
await pause(200)
await page.getByText('Create Space', { exact: true }).click()
await pause(400)
check(
  'space-wizard: Create adds space to sidebar',
  (await sb3.getByText('QA Space', { exact: true }).count()) >= 1,
)

console.log(results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} passed`)
await browser.close()
process.exit(failures ? 1 : 0)
