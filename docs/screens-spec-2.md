# Screens spec — round 2

Transcribed from four new screenshots of the real ClickUp app: (a) a zoomed
sidebar, (b) the "Create a Space" modal, (c) the space "Create" menu, (d) the
MVP - MSM folder **Overview** page, (e) a sprint **List** view with status
groups. Same ground rules as `docs/home-screen-spec.md` (read that first —
tokens, primitives, row recipes all still apply).

Data layer already updated: `src/lib/types.ts` (Task, TaskStatus, SpaceView,
Space.items, Channel.iconStyle, FolderItemIcon now 'sprint' | 'whiteboard' |
'list'), `src/lib/seed.ts` (tasks, taskStatuses, statusOrder, docs, MSM
space-level items), `src/lib/store.ts` (createSpaceOpen/openCreateSpace/
closeCreateSpace/createSpace/addListToSpace + selectors tasksForLists,
groupTasksByStatus, listStats, findListItem, findFolder).

Routes (already wired in App.tsx — do not edit App.tsx):
- `/space/:spaceId/folder/:folderId/:view?` → FolderPage (default view: overview)
- `/space/:spaceId/list/:listId/:view?` → ListPage (default view: list)

---

## A. Sidebar v2 — `src/components/layout/Sidebar.tsx` (+ two new files `src/components/sidebar/CreateSpaceModal.tsx`, `src/components/sidebar/CreateMenu.tsx`)

Corrections to the existing implementation (verified against reference):

1. Section headers are NOT uppercase. Render exactly `AI Chats`, `Channels`,
   `Direct Messages`, `Spaces` in `text-[12px] font-semibold text-ink-soft`
   (normal case, no tracking).
2. Sprint icon: green `CircleDot` (lucide), `text-[#1f9d61]`, not gray Target.
3. `whiteboard` icon (replaces old 'board'): a 16px rounded-[4px] square with
   `bg-[#fbb62b]` containing a white `Zap` icon (10px, `fill-white`); used by
   "Sprint 1 Retro Board" and the space-level "Sprint 1 : Retro board" rows.
4. `list` icon: `ListChecks`-style — use lucide `ListTodo` or `ListChecks`,
   `text-ink-soft`.
5. Sprint 4's pill badge is PINK now (CountBadge 'dark' variant already
   recolored #d6336c) — no change needed beyond using variant 'dark'.
6. Channel with `iconStyle: 'filled'` (General): hash inside a 16px
   rounded-[4px] `bg-[#3d434d]` square, white `Hash` 10px. Others: plain Hash.

New content/behavior:

7. Space-level items: render `space.items` (List, Backlog, the two retro
   whiteboards) AFTER the folders, indented at the same level as folders
   (`pl-4` from space root). Counts: plain gray (List 1, Backlog 47).
8. After all spaces, row `New Space` with leading `Plus`, `text-ink-soft` —
   clicking calls `openCreateSpace()`.
9. Pinned footer at the very bottom of the sidebar (below the scroll area,
   `p-2 border-t border-line`): centered full-width button
   `rounded-lg border border-line bg-white shadow-sm h-8 text-[13px]
   text-ink-soft flex items-center justify-center gap-1.5 hover:bg-hover`
   with `SlidersHorizontal` icon 14px, label `Customize Sidebar`.
10. Navigation wiring (use `useNavigate` or `NavLink`):
    - Folder row (MVP - MSM) → `/space/{spaceId}/folder/{folderId}` ;
      clicking still toggles expansion — make the chevron/name area navigate
      AND expand (navigate on click is fine).
    - Sprint/list items (folder items AND space items with icon 'sprint' or
      'list') → `/space/{spaceId}/list/{itemId}`. Whiteboard items don't navigate.
    - Active route highlighting (bg-active-row) for the matching item row;
      Inbox row only highlights on `/home` (use `useLocation`).
11. The Spaces section header `+` button AND the trailing `+` on the space row:
    - Spaces header `+` → `openCreateSpace()`.
    - Space row `+` → opens the CreateMenu popover anchored to that button
      (local state; render popover absolutely positioned; close on outside
      click via a fixed inset-0 transparent backdrop, and on Escape).
12. The MSM space row shows `...` (Ellipsis) ghost button next to the `+` on
    hover only (`opacity-0 group-hover:opacity-100`).

### CreateSpaceModal — `src/components/sidebar/CreateSpaceModal.tsx`, export `CreateSpaceModal`, no props

Rendered by Sidebar (always mounted; returns null unless `createSpaceOpen`).
- Overlay: `fixed inset-0 z-50 bg-black/40 flex items-center justify-center`.
  Click overlay (not panel) → `closeCreateSpace()`. Escape key closes too.
- Panel: `w-[560px] max-w-[92vw] rounded-xl bg-white shadow-2xl`, `p-6`
  relative. Close: absolute top-4 right-4, 28px circle `bg-panel hover:bg-hover`
  with `X` 14px.
- Title: `Create a Space`, `text-[17px] font-semibold text-ink`.
- Subtitle: `A Space represents teams, departments, or groups, each with its
  own Lists, workflows, and settings.` `text-[13px] text-ink-soft mt-1`.
- Label `Icon & name` — `text-[12.5px] font-semibold text-ink mt-5 mb-1.5`.
- Row: 38px square `rounded-lg border border-line-strong bg-panel` centered
  letter = first letter (uppercased) of the name input, or `S` when empty,
  `text-[15px] font-semibold text-ink-soft`; then text input `flex-1 h-10
  rounded-lg border-2 border-ink px-3 text-[14px] outline-none
  placeholder:text-ink-faint` (the reference shows a bold dark focus border),
  placeholder `e.g. Marketing, Engineering, HR`, autoFocus.
- Label `Description` + ` (optional)` in `text-ink-faint font-normal` —
  same label style, mt-4. Input: `w-full h-9 rounded-lg border border-line-strong
  px-3 text-[13.5px] outline-none focus:border-ink`.
- Row mt-5, flex items-center: `UserRound` icon 15px text-ink-soft +
  `Default permission` `text-[13.5px] text-ink` + `Info` icon 13px
  text-ink-faint; right (ml-auto): bordered dropdown button `Full edit` +
  `ChevronDown` (`h-7 rounded-md border border-line-strong px-2 text-[12.5px]`).
- Row mt-5: left column: `Make Private` `text-[13.5px] font-medium text-ink`,
  below it `Only you and invited members have access` `text-[12.5px]
  text-ink-soft`; right (ml-auto): a toggle switch — `w-9 h-5 rounded-full`
  track (`bg-line-strong` off / `bg-brand` on) with a white 16px knob that
  translates; toggles local state.
- Footer: `-mx-6 -mb-6 mt-6 px-6 py-4 border-t border-line bg-panel
  rounded-b-xl flex items-center justify-between`:
  - `Use Templates` — `text-[13.5px] text-ink-soft hover:text-ink` button.
  - `Continue` — `h-9 rounded-lg bg-[#1f2228] px-5 text-[13.5px] font-medium
    text-white hover:bg-black disabled:opacity-40`, disabled when name empty;
    on click `createSpace(name, description, isPrivate)` (store closes the
    modal) then reset local fields.

### CreateMenu — `src/components/sidebar/CreateMenu.tsx`, export `CreateMenu`, props `{ spaceId: string; onClose: () => void }`

Popover panel: `absolute z-50 w-[280px] rounded-xl border border-line bg-white
p-1.5 shadow-xl` (Sidebar positions it). Tiny header `Create` in
`px-2.5 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-faint`.

Item recipe: full-width flex gap-2.5 rounded-lg px-2.5 py-2 hover:bg-hover
text-left; icon 16px; name `text-[13.5px] text-ink`; optional description
below name `text-[11.5px] text-ink-faint`.

Items in order:
1. `List` / desc `Track tasks, projects, people & more` — `ListTodo` icon
   `text-[#6e56cf]`. onClick: `addListToSpace(spaceId)` then `onClose()`.
2. `Folder` / `Group Lists, Docs & more` — `Folder` icon `text-ink-soft`.
3. `Sprint Folder` / `Organize your Sprints` — `FolderKanban` icon `text-ink-soft`.
--- divider (`my-1 border-t border-line`) ---
4. `Doc` — `FileText` icon `text-[#2e9ded]` (no description)
5. `Dashboard` — `LayoutDashboard` icon `text-[#d6336c]`
6. `Whiteboard` — the yellow Zap square (same as sidebar whiteboard icon)
7. `Form` — `ClipboardList` icon `text-[#8a5fe8]`
--- divider ---
8. `Imports` — `ArrowDownToLine` icon `text-ink-soft`, trailing (ml-auto)
   `ChevronRight` 14px `text-ink-faint`
9. `Templates` — `LayoutTemplate` icon `text-ink-soft`
Items 2-9 just `onClose()` on click.

---

## B. SpaceHeader + pages — `src/features/space/SpaceHeader.tsx`, `FolderPage.tsx`, `ListPage.tsx`, `OverviewTab.tsx`

KEEP the existing exported signatures (SpaceHeaderProps unchanged;
FolderPage/ListPage take no props and read `useParams()`).

### SpaceHeader (breadcrumb + view tabs), props `{ spaceId, folderId?, listId?, activeView }`

Two stacked rows, white bg, each `border-b border-line`, shrink-0.

**Row 1 — breadcrumb bar** (`h-12 px-4 flex items-center gap-1`):
- Space chip: `Avatar` 18px rounded="md" (space abbr/color) + space name
  `text-[13px] font-medium text-ink` + `Lock` 11px text-ink-faint if private —
  as one hover:bg-hover rounded-md px-1.5 py-1 button; navigates nowhere.
- Separator `/` `text-ink-faint text-[13px] mx-0.5`.
- If folder context: `FolderOpen` icon 15px text-ink-soft + folder name
  `text-[13.5px] font-semibold text-ink` + `ChevronDown` 13px text-ink-faint
  in a hover button.
- If list context (ListPage): additionally ` / ` + green `CircleDot` 14px +
  list name `text-[13.5px] font-semibold text-ink`.
- Trailing after breadcrumb: `Star` icon 14px `text-ink-faint` ghost button.
- Right side (ml-auto, flex gap-1 items-center):
  - Ghost buttons 28px: `Video` with tiny `ChevronDown`, `Zap`.
  - `Brain²` button: `Brain` icon 15px `text-[#b15de8]` + text `Brain` +
    `<sup>2</sup>`, `text-[13px] text-ink`, hover:bg-hover rounded-md px-2 h-7.
  - Vertical divider `h-5 w-px bg-line mx-1`.
  - `Share` button: `UserRoundPlus` icon 14px + `Share`,
    `h-7 rounded-md border border-line-strong px-2.5 text-[13px] text-ink
    flex items-center gap-1.5 hover:bg-hover`.

**Row 2 — view tabs** (`h-10 px-4 flex items-center gap-0.5`):
- Leading muted button `Add Channel` (`text-[13px] text-ink-soft px-2 h-7
  rounded-md hover:bg-hover`) followed by a vertical divider (`h-4 w-px
  bg-line mx-1.5`).
- Tabs, each a `NavLink`-style button navigating to the same page with the
  view segment swapped (`/space/{spaceId}/folder/{folderId}/{view}` or
  `/space/{spaceId}/list/{listId}/{view}`): flex items-center gap-1.5 px-2.5
  h-full relative `text-[13px]`.
  - FolderPage tab set: `overview, list, board, timeline, workload, table,
    sprint-reporting`; ListPage tab set: same minus `overview`.
  - Tab icon + label + color (icon 14px):
    - Overview: `SquareChartGantt` text-ink-soft
    - List: `List` `text-[#4a80f5]`
    - Board: `SquareKanban` `text-[#4a80f5]`
    - Timeline: `ChartNoAxesGantt` `text-[#e8871e]`
    - Workload: `CircleGauge` `text-[#12b76a]`
    - Table: `Table` `text-[#0aa5a5]`
    - Sprint Reporting: `ChartLine` `text-[#e8871e]`
  - Active tab: label `font-semibold text-ink` + absolute bottom `h-[2px]`
    full-width `bg-ink` bar. Inactive: `text-ink-soft`.
- After tabs: divider then `+ View` button (`Plus` 13px + `View`,
  text-[13px] text-ink-soft, hover:bg-hover rounded-md px-2 h-7).

### FolderPage

Reads `useParams()` (spaceId, folderId, view — default `'overview'`). Uses
`findFolder(spaces, folderId)`; unknown → `<Navigate to="/home" replace />`.
Renders `SpaceHeader` + content by view:
- `overview` → `<OverviewTab folderId={folderId} />`
- `list` → `<ListView listIds={folder.items.filter(i => i.icon !== 'whiteboard').map(i => i.id)} />`
- anything else → `<ComingSoonPanel view={view} />` (exists at
  `src/features/space/ComingSoonPanel.tsx`)

### ListPage

Same pattern with `findListItem`; default view `'list'`;
`list` → `<ListView listIds={[listId]} />`; others → ComingSoonPanel.

### OverviewTab — `{ folderId: string }`

Scrollable (`flex-1 overflow-y-auto`) with `bg-white`. Content:

1. Gray hint banner (`bg-panel border-b border-line px-4 py-2 flex
   items-center justify-center gap-1 text-[13px] text-ink-soft relative`):
   `Get the most out of your Overview! Add, reorder, and resize cards to
   customize this page` + `Get Started` as `underline text-ink` button. `X`
   ghost close at right (local state hide).
2. Toolbar row (px-6 py-3 flex items-center justify-end gap-2):
   - `RefreshCw` 13px + `Loading...` `text-[12px] text-ink-faint` group.
   - Pill `Auto refresh: On` (`Clock` 12px, `h-7 rounded-full border
     border-line-strong px-2.5 text-[12.5px] text-ink-soft`).
   - Ghost icons: `ListFilter`, `Settings` (16px).
   - `+ Card` dark button: `h-7 rounded-md bg-[#1f2228] px-3 text-[13px]
     font-medium text-white flex items-center gap-1` with `Plus` 13px.
3. Card grid (`px-6 pb-8 grid grid-cols-3 gap-5`, second row via col-span):
   Card recipe: `rounded-xl border border-line bg-white p-4 shadow-xs`,
   title `text-[14px] font-semibold text-ink mb-3`.
   - **Recent** (col 1): rows for the folder's non-whiteboard items reversed
     (Sprint 3, Sprint 2, Sprint 1): `List` icon 14px text-ink-soft +
     item name `text-[13px] text-ink hover:underline cursor-pointer`
     (navigate to its list route) + ` • in {folder.name}` `text-[12px]
     text-ink-faint`. Row height ~32px.
   - **Docs** (col 2): rows from `docs` in store: `FileText` icon 14px
     `text-ink-soft` + name `text-[13px] text-ink` + ` • in {location}`
     `text-[12px] text-ink-faint truncate`.
   - **Bookmarks** (col 3): centered empty state: 44px circle border
     border-line-strong with `Bookmark` 18px text-ink-faint and a tiny `+`
     bubble at its corner; text `Bookmarks make it easy to save ClickUp items
     or any URL from around the web.` `text-[12.5px] text-ink-soft
     text-center max-w-[220px]`; button `Add Bookmark` (`h-8 rounded-md
     bg-[#1f2228] text-white px-3 text-[13px] font-medium`).
   - **Resources** (row 2, `col-span-2` — wait, reference shows Resources ~55%
     and Burndown ~45%: use `grid-cols-5` wrapper? Simplest: second grid row
     is its own `grid grid-cols-2 gap-5` — two half-width cards, close enough):
     title `Resources`; body: `min-h-[220px] rounded-lg bg-panel/60 border
     border-line flex flex-col items-center justify-center gap-1 text-[13px]
     text-ink-soft`: `Upload` icon 16px + `Drop files here or` + `attach`
     underlined link-style.
   - **Current Sprint Burndown**: title; centered column: a small inline SVG
     mock burndown chart inside a `rounded-lg border border-line p-3
     shadow-xs w-[220px]` (draw: two light purple bars + a descending line +
     dots, keep it abstract, colors `#c9bff7`/`#7b68ee`/`#d6dae1`); below:
     `Feature limited on current plan` `text-[12px] text-ink-faint mt-4`;
     `Upgrade to Business to unlock this card` `text-[13.5px] font-semibold
     text-ink mt-1`.

---

## C. ListView — `src/features/space/ListView.tsx`, export `ListView({ listIds }: { listIds: string[] })`

You may add sibling helper files under `src/features/space/` prefixed `List`
(e.g. `ListTaskRow.tsx`) — only `ListView` is imported elsewhere.

Data: `const tasks = tasksForLists(useAppStore(s => s.tasks), listIds)`,
`groupTasksByStatus(tasks, taskStatuses)`, `listStats(tasks)`,
`users` for assignee avatars. Scroll container `flex-1 overflow-y-auto bg-white`.

1. **Pink banner** (only when `stats.unfinished > 0`): full-width strip
   `bg-[#fdeef3] px-4 py-1.5 text-center text-[12.5px] text-ink`:
   `This sprint has {stats.unfinished} ` + `unfinished tasks` underlined.
2. **Summary cards** row (`px-6 pt-4 pb-2 flex gap-4`): three cards
   `w-[300px] rounded-xl border border-line bg-white px-4 py-3 flex
   items-center gap-3`:
   - icon tile 34px `rounded-lg` colored bg + white/colored icon:
     - Backlog: `bg-[#e7f6ec]`, `CircleCheck` 18px `text-[#27ae60]`
     - Assigned: `bg-[#fdf3e7]`, `CircleUserRound` 18px `text-[#e8871e]`
     - Effort: `bg-[#fdf3e7]`, `Hourglass` 18px `text-[#e8871e]`
   - text column: title `text-[13.5px] font-semibold text-ink` (`Backlog`,
     `Assigned`, `Effort`); sub `text-[12.5px] text-ink-soft`
     (`{stats.total} tasks added`, `{stats.missingAssignee} tasks missing
     assignee`, `{stats.missingEffort} tasks missing effort`).
3. **Status groups** (`px-6 pt-4 flex flex-col gap-6 pb-10`), per group:
   - Header row (flex items-center gap-2 mb-1):
     - Collapse chevron `ChevronDown` 14px text-ink-faint (toggles group,
       rotate -90 when collapsed).
     - Status pill: `rounded-[5px] px-2 py-[3px] flex items-center gap-1.5`,
       inline bg `status.color`, white content: a 10px `CircleDot`-style ring
       (use `Circle` 10px with `fill-white/20`) + label `text-[11px]
       font-bold tracking-wide text-white`.
     - Count `text-[12.5px] text-ink-faint`.
     - Hover-only (`opacity-0 group-hover/header:opacity-100`): `Ellipsis`
       and `Plus` ghost 22px buttons.
   - **Column header row** (flex, text-[11.5px] text-ink-faint, px-2 h-7
     items-center, border-b border-line):
     `Name` (flex-1) | `Assignee` w-24 | `Due date` w-24 | `Priority` w-24 |
     `Time estimate` w-28 | trailing `Plus` ghost icon 14px w-8.
   - **Task rows** (per task): `group/row flex items-center px-2 h-9
     border-b border-line hover:bg-panel text-[13.5px]`:
     - Name cell (flex-1 min-w-0 flex items-center gap-2):
       `ChevronRight` 12px text-ink-faint opacity-0 group-hover/row:opacity-100;
       status disc: `Circle` 13px with inline `color: status.color` and
       `fill: status.color` at 15% — simplest: a 13px ring `border-[2.5px]`
       rounded-full with borderColor status.color;
       task name `text-ink truncate`;
       if subtaskCount: chip `flex items-center gap-0.5 rounded border
       border-line-strong px-1 text-[11px] text-ink-soft` with `GitBranch`
       (or `Link2`) 10px rotated look — use `Network` 10px;
       if hasDescription: `AlignLeft` 12px text-ink-faint.
     - Assignee w-24: if assigneeId → `Avatar` 22px; else ghost dashed
       circle button 22px (`border border-dashed border-line-strong` with
       `UserRound` 12px text-ink-faint).
     - Due date w-24: if dueDate → `text-[12.5px]`, `text-[#d8354f]` when
       dueOverdue else text-ink-soft; else ghost `CalendarPlus` 14px
       text-ink-faint icon button.
     - Priority w-24: `Flag` 14px text-ink-faint ghost (outline only).
     - Time estimate w-28: if estimateHours → `Hourglass` 12px text-ink-faint
       + `{n}h` text-[12.5px] text-ink-soft; else empty.
     - Trailing w-8: empty.
   - **Add Task row**: `flex items-center gap-1.5 px-2 h-8 text-[13px]
     text-ink-faint hover:text-ink cursor-pointer` with `Plus` 13px +
     `Add Task`.

Group collapse is local state per status id (all expanded initially).

---

## Acceptance checklist (round 2)

- [ ] Sidebar: normal-case section labels, green sprint icons, yellow zap
      whiteboards, pink 35 pill, filled #General icon, Backlog 47, two retro
      whiteboard rows, New Space row, Customize Sidebar footer.
- [ ] Clicking MVP - MSM opens the folder Overview page; view tabs switch
      (Overview/List work; Board etc. show coming-soon panel).
- [ ] Clicking Sprint 4 in the sidebar opens its List view: pink unfinished
      banner, 3 summary cards, DEV COMPLETED (2) / HOLD FOR INFORMATION (1) /
      QA IN PROGRESS (9) groups with correct names, red overdue dates
      (12/5/25, 12/8/25, 12/9/25 ×2), subtask chips, estimates (6h 8h 12h 18h…).
- [ ] Spaces + / New Space opens the Create a Space modal; typing a name
      updates the letter preview; Continue adds the space to the sidebar and
      closes; toggle + Escape + overlay click all behave.
- [ ] Space row + opens the Create menu; "List" actually appends a List item
      to that space; menu closes on outside click/Escape.
- [ ] Everything typechecks (`npx tsc -b`).
