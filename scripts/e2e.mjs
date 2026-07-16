// End-to-end functionality suite for the ClickUp replica.
// Usage: node scripts/e2e.mjs [baseUrl]   (default http://localhost:5173)
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5173'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
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
  // Toasts auto-dismiss in 4s; close them proactively to keep the screen clean.
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
// hover first row to reveal quick actions, snooze it to Later
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

// mark one read by clicking, then Unread-only filter hides it
await page.locator('text=Access request').first().click()
await pause(100)
await page.getByRole('button', { name: /^Filter/ }).click()
await pause(150)
await page.locator('text=Unread only').click()
await pause(150)
check('inbox: unread-only filter hides read row', (await count('text=Access request')) === 0)
await page.getByRole('button', { name: /Filter · 1/ }).click()
await pause(100)
await page.locator('text=Unread only').click()
await pause(150)

await page.getByRole('button', { name: 'Clear all' }).click()
await pause(150)
check('inbox: clear-all shows empty state', (await count("text=You're all caught up!")) === 1)
await page.getByRole('button', { name: /Cleared/ }).click()
await pause(150)
check('inbox: cleared items in Cleared tab', (await count('text=Access request')) === 1)

// settings → toast
await page.locator('[title="Notification settings"]').click()
await pause(150)
check('inbox: settings shows coming-soon toast', await toastVisible())
await dismissToasts()

// banner dismiss
check('inbox: promo banner visible', (await count('text=prove me wrong')) === 1)
await page.locator('button[title="Dismiss"]').first().click()
await pause(100)
check('inbox: promo banner dismisses', (await count('text=prove me wrong')) === 0)

// ---------- Search (Ctrl+K) ----------
await page.keyboard.press('Control+k')
await pause(200)
check('search: Ctrl+K opens modal', (await count('input[placeholder*="Search tasks"]')) === 1)
await page.fill('input[placeholder*="Search tasks"]', 'Microsoft')
await pause(200)
check('search: finds task by name', (await count('text=Microsoft Account Setup')) >= 1)
await page.keyboard.press('Enter')
await pause(300)
check('search: Enter navigates to task list', page.url().includes('/space/msm/list/sprint4'))

// ---------- List view: full task operations on Sprint 4 ----------
check('list: HOLD FOR INFORMATION group present', (await count('text=HOLD FOR INFORMATION')) === 1)

// status change moves task between groups
await page
  .locator('div', { hasText: /^Microsoft Account Setup/ })
  .last()
  .locator('[title="Change status"]')
  .click()
await pause(200)
check('list: status popover animates in', (await count('.animate-pop-in')) >= 1)
await page.locator('.animate-pop-in >> text=DEV COMPLETED').click()
await pause(250)
check('list: status change dissolves empty group', (await count('text=HOLD FOR INFORMATION')) === 0)

// add a task inline
await page.getByRole('button', { name: 'Add Task' }).first().click()
await page.fill('input[placeholder="Task name..."]', 'Playwright QA sweep')
await page.keyboard.press('Enter')
await pause(250)
check('list: inline Add Task creates row', (await count('text=Playwright QA sweep')) === 1)
check('list: Backlog card recounts', (await count('text=13 tasks added')) === 1)
check('list: Effort card shows missing estimate', (await count('text=1 tasks missing effort')) === 1)

const newRow = page
  .locator('div[class*="group/row"]')
  .filter({ hasText: 'Playwright QA sweep' })
  .first()

// assign via popover
await newRow.locator('[title="Assign"]').click()
await pause(200)
await page.locator('.animate-pop-in >> text=Abdul Rahuman M').click()
await pause(250)
check('list: assignee avatar set', (await newRow.locator('[title*="Abdul Rahuman"]').count()) >= 1)
check('list: Assigned card recounts', (await count('text=12 tasks missing assignee')) === 1)

// due date via popover
await newRow.locator('[title="Set due date"]').click()
await pause(200)
await page.fill('input[type="date"]', '2026-08-01')
await page.locator('text=Set date').click()
await pause(250)
check('list: due date renders', (await newRow.locator('text=8/1/26').count()) === 1)

// priority via popover
await newRow.locator('[title="Set priority"]').click()
await pause(200)
await page.locator('.animate-pop-in >> text=Urgent').click()
await pause(250)
check('list: priority flag set', (await newRow.locator('text=Urgent').count()) === 1)

// estimate via popover
await newRow.locator('[title="Set time estimate"]').click()
await pause(200)
await page.fill('input[type="number"]', '5')
await page.locator('text=Set estimate').click()
await pause(250)
check('list: estimate renders', (await newRow.locator('text=5h').count()) === 1)
check('list: Effort card back to zero missing', (await count('text=0 tasks missing effort')) === 1)

// task name click → coming-soon toast (task detail not yet replicated)
await page.locator('text=Playwright QA sweep').click()
await pause(150)
check('list: task detail toast', await toastVisible())
await dismissToasts()

// group collapse
const devGroupHeader = page.locator('section', { hasText: 'DEV COMPLETED' }).first()
await devGroupHeader.locator('[title="Collapse group"]').first().click()
await pause(150)
check('list: group collapses', (await count('text=Dashboard - Fast Moving Items (Widget)')) === 0)
await devGroupHeader.locator('[title="Expand group"]').first().click()
await pause(150)

// ---------- Header: favorite star + share toast ----------
await page.locator('[title="Add to Favorites"]').click()
await pause(150)
check('header: star toggles to favorite', (await count('[title="Remove from Favorites"]')) === 1)
await page.getByRole('button', { name: 'Share' }).click()
await pause(150)
check('header: Share shows toast', await toastVisible())
await dismissToasts()

// ---------- View tabs ----------
await page.getByRole('button', { name: 'Board', exact: true }).click()
await pause(250)
check('views: Board coming-soon panel', (await count('text=next on the build list')) >= 1)
await page.getByRole('button', { name: 'List', exact: true }).click()
await pause(250)

// ---------- Sidebar: create sprint / folder / sprint folder / space ----------
await page.getByText('Create Sprint', { exact: true }).click()
await pause(250)
check('sidebar: Create Sprint adds Sprint 5', (await count('text=Sprint 5')) === 1)

await page.getByLabel('Add to MSM').click()
await pause(200)
await page.locator('text=Group Lists, Docs & more').click()
await pause(250)
check('sidebar: Create menu adds Folder', (await page.getByText('Folder', { exact: true }).count()) >= 1)

await page.getByLabel('Add to MSM').click()
await pause(200)
await page.locator('text=Organize your Sprints').click()
await pause(250)
check('sidebar: Sprint Folder adds Sprints tree', (await page.getByText('Sprints', { exact: true }).count()) >= 1)

await page.getByLabel('Add to MSM').click()
await pause(200)
await page.locator('.animate-pop-in').getByText('Doc', { exact: true }).click()
await pause(150)
check('sidebar: Doc create shows toast', await toastVisible())
await dismissToasts()

// whiteboard rows toast instead of navigating
await page.getByText('Sprint 1 Retro Board', { exact: true }).click()
await pause(150)
check('sidebar: whiteboard row shows toast', await toastVisible())
await dismissToasts()

// Create a Space end-to-end
await page.getByText('New Space', { exact: true }).click()
await pause(200)
await page.getByPlaceholder('e.g. Marketing, Engineering, HR').fill('Design Team')
await page.getByRole('button', { name: 'Continue' }).click()
await pause(250)
check('sidebar: created space appears', (await count('text=Design Team')) === 1)

// coming-soon toasts on nav rows
await page.getByText('Replies', { exact: true }).click()
await pause(150)
check('sidebar: Replies shows toast', await toastVisible())
await dismissToasts()

// ---------- Overview cards ----------
await page.getByRole('complementary').getByText('MVP - MSM', { exact: true }).click()
await pause(300)
check('overview: renders cards', (await count('text=Current Sprint Burndown')) === 1)
await page.getByRole('button', { name: 'Add Bookmark' }).click()
await pause(150)
check('overview: Add Bookmark toast', await toastVisible())
await dismissToasts()
await page.locator('text=Sprint 3 (12/1 - 1/2)').last().click()
await pause(300)
check('overview: Recent row navigates', page.url().includes('/list/sprint3'))

// ---------- TopBar ----------
await page.locator('header >> text=Search').click()
await pause(200)
check('topbar: search bar opens modal', (await count('input[placeholder*="Search tasks"]')) === 1)
await page.keyboard.press('Escape')
await pause(150)
await page.locator('header >> text=AI Chats').click()
await pause(150)
check('topbar: AI Chats shows toast', await toastVisible())
await dismissToasts()

// ---------- Persistence across reload ----------
await page.goto(`${BASE}/space/msm/list/sprint4`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
await pause(400)
check('persistence: created task survives reload', (await count('text=Playwright QA sweep')) === 1)
check('persistence: assignee survives reload', (await count('text=12 tasks missing assignee')) === 1)
check('persistence: created space survives reload', (await count('text=Design Team')) === 1)
check('persistence: Sprint 5 survives reload', (await count('text=Sprint 5')) === 1)

console.log(results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} passed`)
await browser.close()
process.exit(failures ? 1 : 0)
