# Video spec — Backlog walkthrough & Task Detail modal (round 3)

Source: a 4-minute screen recording of the real ClickUp desktop app, transcribed
frame-by-frame into `docs/video-digest-summaries.md` (per-20s chunk summaries,
UI anatomy, transition timeline) and `docs/video-digest-data.md` (verbatim text
per second). **Those two files are the authoritative pixel/text reference — grep
them liberally.** This spec defines architecture, contracts, data, and behavior.
Ground rules from `docs/home-screen-spec.md` still apply (tokens, primitives).

## Colors sampled from the actual video pixels (canonical)

- Status pill/icon colors: use `TaskStatus.color` from the store everywhere
  (pill bg, row status icon, dropdown icon). Key sampled values:
  HOLD FOR INFORMATION `#b01830`, READY FOR DEV `#20b0c8`,
  BA IN PROGRESS `#3e5474`, QA COMPLETE `#6098a0`, TO DO = outline style
  (white bg, `border-line-strong`, `text-ink-soft`, dashed-circle glyph).
- Tag chips (list rows + modal): light bg + colored text, rounded, h-[18px],
  11px: `spt`/`msm` = bg `#e3f2fe` text `#0898f8`; `pending` = bg `#ece8fd`
  text `#7b68ee`.
- Group pill anatomy: `h-[22px] rounded-[4px] px-2` white 11px bold uppercase
  text + leading 12px glyph (clock for active-group statuses, dashed circle for
  TO DO, raised-hand/target for HOLD FOR INFORMATION, check for QA COMPLETE).
  TO DO pill is OUTLINE (gray border/text on white).
- Toolbar primary button `+ Task`: brand purple (existing `brand` token),
  split button with `▾` segment.

## Data layer (ALREADY WRITTEN — read `src/lib/types.ts`, `src/lib/seed.ts`, `src/lib/store.ts`)

Highlights agents must use:
- `taskStatuses` registry: id → { label, color, group: 'not-started'|'active'|'done'|'closed', style?: 'outline' }, plus `statusOrder`.
- `workspaceTags`: tag id → { label, bg, text }.
- `Task` extended: `tags?: string[]`, `parentId?`, `codeId?` (e.g. `#86d1gzq48`),
  `createdLabel?`, `description?: DocBlock[]`, `sprintPoints?`, `checklists?`,
  `activity?: ActivityEntry[]` (entries + comments), `loadDelayed?: boolean`.
- Subtasks are Tasks with `parentId` set (same `listId`).
- Backlog tasks live in `listId: 'backlog'`; the video's exact 47 tasks are
  seeded (40 READY FOR DEV incl. all Dashboard rows, 4 BA IN PROGRESS,
  2 TO DO, 1 HOLD FOR INFORMATION = "Access and Permissions" with full
  description document, checklist and activity; "Dashboard - Inventory Health
  Status" has 10 subtasks + comment activity). `list1` has 1 QA COMPLETE task.
- Store additions: `selectedTaskId` + `openTask(id)` / `closeTask()`;
  `groupCollapse` per list with `toggleGroup(listId, statusId)` (persisted);
  `setTaskTags`, `addSubtask`, `addChecklist`, `addChecklistItem`,
  `addComment`; selector `subtasksOf(tasks, parentId)`;
  `expandedDescription` UI state for the full-page doc view.
- Group loading skeletons: groups expand with a ~700ms skeleton state
  (see Behaviors) — purely presentational, use local state.

## File ownership map (each agent owns ONLY its files)

```
src/features/task/TaskModal.tsx        (A) modal shell, header, sticky mini-header, fields grid, description
src/features/task/TaskDescription.tsx  (A) doc renderer + Expand/Collapse + full-page view
src/features/task/TaskFieldPopovers.tsx(B) StatusDropdown, DatePicker, TimeTrack, AssigneePicker, TagPicker
src/features/task/TaskActionRows.tsx   (B) Add fields (+field-type popover), Add subtask composer,
                                           Relate items (popover+Relationship dialog), Checklists, Attach file menu
src/features/task/ActivityPanel.tsx    (C) activity feed, comment cards, composer, panel header
src/features/space/ListView.tsx        (D) Backlog-style list v2 (rewrite)
src/features/space/ListToolbar.tsx     (D) Status pill / Save view / icons / + Task row
src/features/space/TaskRowMenu.tsx     (D) row "…" context menu with flyout submenus
src/features/whiteboard/WhiteboardPage.tsx (E) whiteboard canvas page
```
Shared code everyone may IMPORT but not modify: `src/lib/*`,
`src/components/ui/*` (Avatar, CountBadge, Popover/PopoverItem/popoverPosFor,
ToastHost via store.notify, SearchModal), existing layout components.
`App.tsx` / `SpaceHeader.tsx` / stubs wiring is handled by the coordinator.

### Contracts (stubs already exist with these exact signatures)

- `TaskModal()` — no props; renders `null` unless `selectedTaskId` set; mounted
  globally (already wired in App.tsx). Imports TaskDescription, TaskFieldPopovers,
  TaskActionRows, ActivityPanel.
- `TaskDescription({ task }: { task: Task })`
- `ActivityPanel({ task }: { task: Task })`
- `StatusDropdown/DatePickerPopover/TimeTrackPopover/AssigneePicker/TagPicker`
  — all exported from TaskFieldPopovers.tsx with props
  `{ task: Task; pos: PopoverPos; onClose: () => void }`.
- `TaskActionRows({ task }: { task: Task })`
- `ListView({ listIds }: { listIds: string[] })` (unchanged export)
- `ListToolbar({ saveViewVisible }: { saveViewVisible: boolean })`
- `TaskRowMenu({ task, pos, onClose }: { task: Task; pos: PopoverPos; onClose: () => void })`
- `WhiteboardPage()` — route `/whiteboard/:itemId` (already in App.tsx).

## Behaviors (the video's exact flow — verify each against the digests)

### Backlog list (D)
1. Groups render in status order with ONLY statuses present in the list's tasks.
   Collapse state from store; HOLD starts collapsed, READY FOR DEV expanded,
   BA IN PROGRESS + TO DO collapsed (seeded defaults for backlog).
2. Expanding a group: chevron rotates, tooltip "Collapse group"/"Expand group",
   then ~700ms skeleton rows (gray circle + rounded bar, widths varied) before
   real rows fade in. Collapsing is instant.
3. Row anatomy: status icon (status color), name, ≡ description icon (only if
   task has description), subtask-count chip (branch icon + n) when subtasks
   exist, tag chips, hover-revealed: left 6-dot grip + checkbox + ▸ expand
   chevron (chevron only when subtasks exist), "+"/pencil after chips, "…" at
   row end. Assignee cell: dashed person ghost OR overlapping 24px avatars
   (2px white ring). Due/Priority ghosts as before.
4. ▸ on a parent row expands indented subtask rows beneath it.
5. Clicking a row name calls `openTask(task.id)` (modal opens).
6. Clicking the ≡ icon shows the description hover-preview popover (white card
   rendering the first heading + bullets of the description).
7. Row "…" opens TaskRowMenu: segmented header "Copy link | Copy ID | New tab",
   items (Rename, Duplicate, Move to, Add to ▸, Convert to ▸, Templates ▸,
   Remind me in Inbox ▸, Favorite ▸, Relationships ▸, Task Type ▸, Send email
   to task, Merge, Archive, Delete red) with LEFT-side flyout submenus
   (contents verbatim in digest chunks 77-114): Relationships, Reminder
   (quick times + Jul 2026 calendar), Favorite (Sidebar/Top/Bottom thumbnails),
   Add to, Convert to (List/Subtask), Templates (ArenaCX PRD/PRD/Task Template
   + Apply/Save/Update), Task Type (search + 9 types, Task ✓). Flyouts open on
   hover, fade in/out (animate-pop-in). Footer: full-width dark button
   "Sharing & Permissions". Copy link/Copy ID actually copy to clipboard +
   toast "Link copied"/"ID copied".
8. Assignee cell click: AssigneePicker (search input, sections Assignees/People/
   Agents, rows Me/Arun RK, "Invite people via email", "+ Create Agent",
   footer "✦ Assign with AI"). Picking a person assigns (store) and shows toast
   "Add this task to Arun RK's priorities?" with "Don't ask again" /
   "Add to priorities" buttons (auto-dismiss ~6s) — use the toast system but
   render this one with the two buttons (extend ToastHost? No — build this
   specific toast inside ListView as a fixed bottom-left card; both buttons
   just dismiss).
9. Sticky on scroll: expanded group's pill row and its column header stick
   under the toolbar while its rows scroll (position: sticky, two stacked
   levels, white bg).
10. Toolbar (ListToolbar): left "Status" grouping pill (lavender bg, layers
    icon) + subtasks icon + columns icon; right: "Save view" bordered split
    button (VISIBLE only after the user modifies the view — collapse/expand of
    any group flips a local `viewDirty` flag passed as saveViewVisible),
    funnel, circled-check, people, blue "P" avatar chip, magnifier, gear,
    brand "+ Task ▾" split button. All no-op buttons → `comingSoon` toast.
11. The Backlog list's tab set (SpaceHeader handles: coordinator wires a
    `variant` where List pages show tabs: Add Channel | Board | Timeline |
    Workload | Table | List(active, LAST position) | + View).

### Task modal (A)
1. Opens via store.selectedTaskId. Backdrop `bg-black/35` fade-in; panel spans
   ~`inset-x-[150px] inset-y-[56px]` (min margins, max-w none), rounded-xl,
   animate-pop-in (scale .97→1). Description + activity load skeleton-first:
   ~500ms gray bars, then content (local timers; `loadDelayed` tasks stagger
   fields too: estimate/tags appear with content pass).
2. Window/document title swaps to `<task name> | <codeId>` while open (set
   `document.title`, restore on close).
3. Header: prev/next chevrons (navigate tasks within same list group order —
   wire actually), breadcrumb space chip + list name + "+" + pop-out, right:
   "Created {createdLabel}", Brain² chip, Share, "…", star (favorite toggle,
   reuse favorites store), layout icon → hover popover with Modal/Full
   screen/Sidebar thumbnails (Modal selected), X (tooltip "Close window Esc";
   Escape closes; backdrop click closes).
4. Row 2: "Task ▾" type pill (opens Task Type popover — reuse the 9-type list
   from TaskRowMenu via its own popover implementation in B's TaskActionRows?
   No: type pill popover lives in A, simple list, current ✓), focus icon,
   subtask badge (link glyph + count) when subtasks exist. If task has
   `parentId`: line "Subtask of ⭘ {parent name}" (click → openTask(parent)).
5. Title H1; below it the Ask-Brain banner: lavender rounded strip
   "✨ Ask Brain² for a presentation, document or prototype" (3 purple words),
   X hides it (local).
6. Fields grid (2 cols): Status (pill + "▸" next-status square + "✓" complete
   square — next-status advances within statusOrder group sequence; ✓ sets
   MOVED TO PRODUCTION... actually sets QA COMPLETE? Use last 'closed' status;
   hover turns check green), Dates (click → DatePickerPopover), Time estimate,
   Track time ("▶ Start" → TimeTrackPopover), Assignees (click →
   AssigneePicker), Priority (reuse PRIORITY_META popover pattern inline),
   Sprint points, Tags (chips + click → TagPicker). Empty fields show "Empty";
   hovering the grid reveals "Collapse empty fields" link (collapses rows
   whose value is empty; link then reads "Show empty fields").
7. Sticky mini-header: when the H1 scrolls out of the modal's scroll container,
   a thin bar appears at modal top: status ring + task name (14px) + assignee
   avatar right. (IntersectionObserver or scrollTop threshold.)
8. Status pill click → StatusDropdown (B).
9. Fields → popovers per B's exports. All changes write to the store and are
   visible in the list behind the modal.

### TaskDescription (A)
- Renders `DocBlock[]`: h2 headings, paragraphs, bullet lists, numbered lists,
  bold sub-heads. Collapsed: max-h ~340px with white gradient fade + centered
  "⌄ Expand" pill; expanded inline: full content + "^ Collapse" pill; hover
  shows history-clock + expand icons right of the chip row.
- The expand icon opens the FULL-PAGE view: replaces modal content (fields +
  activity hidden) with a wide document canvas: big H1, "Close" +
  inward-arrows button top-right, blocks hover-reveal a 6-dot drag handle;
  Close returns to normal modal.

### Field popovers (B) — exact contents in digest chunks 172-228
- StatusDropdown: search input, grouped list (Not started / Active / Done /
  Closed) from the store registry, status glyph colored, current ✓, Done rows
  show extra gray check at right, click sets status (task moves groups in the
  list behind), scrollable (max-h ~360px).
- DatePickerPopover: Start date / Due date / Duration inputs (focusable),
  left quick options (Today Fri, Later 2:47 pm, Tomorrow Sat, This weekend Sat,
  Next week Mon, Next weekend 25 Jul, 2 weeks 31 Jul, 4 weeks 14 Aug),
  "Set Recurring ▸", right calendar "July 2026" grid with today (17) filled
  brand circle + "Today" + ˄˅ steppers, footer toggle (on) "Skip non-working
  days". Clicking a calendar day sets the focused field (Due by default) via
  store `setTaskDueDate`; quick options set relative dates for real.
- TimeTrackPopover: rows "Time on all tasks 0h" / "Without Subtasks 0h",
  input "Enter time (ex: 3h 20m) or start timer" with magenta play button,
  rows: timer "Fri, Jul 17" + "12:47 pm – 12:47 pm", "Notes", "Add tags",
  footer "$" dashed circle + "Save". Save with a parsed "3h" style value sets
  estimateHours? NO — track time is separate; just close + toast "Time
  tracking saved" if input non-empty, else close.
- AssigneePicker: as described in Backlog behavior 8 (shared component).
- TagPicker: search/create input, workspace tags with colored chips and
  checkmarks; toggling writes `setTaskTags`.

### Action rows (B)
- "Add fields" → small popover "+ Create a field" / "Add field from Workspace";
  "Create a field" → the searchable field-type popover: sections "AI Fields"
  (Summary, Custom Text, Custom Dropdown) and "All" with the full 32-type list
  (verbatim in digest chunk 20-38), searchable filter, scrollable; clicking a
  type → toast "Custom fields are next on the build list…".
- "Add subtask" (hover reveals ✦ Suggest) → inline composer: header row
  (Sort ⇅, expand, ✦ Suggest, +), input "Task Name or type '/' for commands",
  right icon strip (template, wand, person, calendar, flag, tag — each with
  dark tooltips "Set Due Date"/"Assign"/"Set priority"/"Edit tags"), Cancel /
  "Save ↵" (purple). Save creates a real subtask (store.addSubtask) which
  appears in the Subtasks table.
- Subtasks section (render when subtasks exist): "▾ Subtasks" + "{n} open" +
  mini progress bar; own table Name | Assignee | Priority | ⊕ with rows
  (dashed-ring icon, ghost assignee/flag); row name click → openTask(subtask).
  Hover header reveals Sort/expand/Suggest/+.
- "Relate items or add dependencies" → popover (Relate a Task or Doc /
  This task blocks... / This task is blocked by... / + New custom
  relationship); the last opens the Relationship dialog (name input*,
  "Related to" radios, "Select List..." select, rollup toggle, "More settings
  and permissions", Cancel/Create — Create disabled until name; Create →
  toast + close).
- "Create checklist" → adds a checklist (store), renders Checklists section:
  bordered card, editable title (auto-focus, Enter commits), "+ Add item"
  (inline input; Enter adds item with checkbox; checking toggles), assign icon,
  "+ Add checklist" below.
- "Attach file" → hover reveals "+"; click opens attach menu (Upload file /
  New Document / Dropbox / OneDrive/SharePoint / Box / Google Drive /
  New Google Doc) — items toast.

### ActivityPanel (C)
- Header "Activity" + magnifier / bell "0" / filter icons.
- Feed bottom-anchored, from `task.activity`: event entries (bullet + gray text
  with dark names, blue task-ref links, right-aligned timestamps), collapsed
  "Show more ▾" rows between entries (expand to reveal `hidden` entries),
  comment cards (bordered, avatar, bold name + "(deactivated)" suffix when
  flagged, timestamp, body with purple @mentions, thumbs-up + add-reaction,
  Reply). Skeleton-first load (~500ms).
- Composer: bordered input "Write a comment...", toolbar "+", "Comment ▾",
  icon row (Brain pinwheel, AI-pen, paperclip, @, person-check, emoji, video,
  check-circle), "…", mic, send (disabled until text; brand-colored when
  enabled). Sending calls store.addComment → appears as a comment card by
  "Pavithran" with timestamp "Just now"; also focus via clicking anywhere in
  the field.
- Right-edge icon rail between panes (part of A's shell): » collapse toggle
  (collapses the Activity panel entirely — panel width to 0, rail stays),
  comment bubble (active), refresh, grid.

### Whiteboard (E)
- Route `/whiteboard/:itemId`; sidebar whiteboard rows navigate here now
  (coordinator wires sidebar; E builds the page only).
- Loading: blank + 3 gray skeleton blocks ~800ms. Then: header strip (board
  icon + name + star toggle), right: avatar, Share button, "…", dark circular
  present button, fullscreen icon. Canvas: white with 20px dot grid
  (radial-gradient CSS), default cursor. Bottom-center floating toolbar
  (white rounded-xl shadow): tools with tiny shortcut letters above: V select
  (active dark square), H hand, ⇧T Task chip, D pen, R shape, A arrow,
  N sticky note, T text, F frame, image tile, template tile, Brain pinwheel,
  undo/redo (disabled). Bottom-left zoom pill: ^ − 100% +  (zoom actually
  scales the dot grid via CSS transform: 50-200%). Clicking N drops a yellow
  sticky note at canvas center (draggable via pointer events, text editable) —
  the one real tool; other tools select visually, canvas click with them →
  nothing. Sticky notes kept in local state.

## Animations (match the video)
- Modal/backdrop: fade + scale (animate-fade-in on backdrop, animate-pop-in on
  panel). Popovers/flyouts/menus: animate-pop-in; submenu swap = old fades as
  new pops (just re-mount with animation).
- Skeletons: `pm-shimmer` class — add to index.css (coordinator): gray bars
  with a moving highlight (respect reduced-motion: static gray).
- Group expand: rows container animates height via grid-template-rows trick or
  simple fade; skeleton phase covers the transition.
- Sticky headers appear without animation (position: sticky).
- Tooltips: dark rounded (#26262b), white 12px, fade in.

## Acceptance (round 3) — verified by Playwright + frame comparison
- Backlog renders exactly the video's groups/counts (1/40/4/2) and row set.
- Group expand shows skeleton then rows; sticky pill+columns while scrolling.
- Opening "Access and Permissions" shows the full modal matching sec 15-20:
  fields (22h, LR assignee, spt tag, HOLD pill), User Story + Entry Condition,
  Expand→full doc (all sections through Impact Places), Activity (2 entries +
  Show more), composer.
- Status dropdown lists all 19 statuses in 4 groups; changing status moves the
  task between groups live.
- Subtask add, checklist add, comment send, assignee pick (+priorities toast),
  date set via calendar, tag toggle all mutate real state.
- Row context menu + 7 flyouts render with verbatim contents; Copy link/ID
  copy to clipboard.
- "Dashboard - Inventory Health Status" opens with 10 subtasks table, msm +
  pending tags, comment "Statuses are yet to be defined @Lydia Rubavathy".
- Whiteboard loads with skeleton → dot grid + toolbar; sticky note tool works;
  zoom changes scale.
- Description hover-preview popover on ≡ icons.
- Esc closes modal; document.title mirrors the video's titles.
