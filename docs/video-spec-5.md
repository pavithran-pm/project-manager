# Video spec 5 — Space Overview, Board, Table, New Task, Customize View, Brain²

Source digests (authoritative, grep them): `docs/video2-digest-summaries.md`
(per-chunk anatomy + transitions) and `docs/video2-digest-data.md` (verbatim
frame text). Prior rules in docs/home-screen-spec.md and video-spec-3.md apply
(tokens, primitives, comingSoon toasts for unbuilt affordances).

## Already wired by the coordinator (do NOT redo)
Routes: `/space/:spaceId` → SpaceOverviewPage; `/ai` → BrainPage; FolderPage
maps list→FolderListView, board→BoardView, table→TableView, timeline/workload→
ViewPaywall, sprint-reporting→SprintReportingUpsell (ListPage same minus
overview). Store: `sidebarCollapsed/toggleSidebar` (Sidebar hides, IconRail
shows »), `newTaskFor/openNewTask/closeNewTask`, `customizeViewOpen/
setCustomizeViewOpen`. Types: Task.dueDone/attachmentCount/imagePreview,
FolderItem.sprintMeta, WorkspaceTag.chip, TaskStatus.tableStyle. Seed:
statuses + `boardOrder` + tags (msm/bug/clientFeedback filled). SpaceHeader:
sprint meta chips + sprint1 doc tab. NewTaskModal/TaskModal mounted globally.

## Fleet assignments (own ONLY your files; stubs exist with exact contracts)

Shared imports allowed: src/lib/*, src/components/ui/*, TaskFieldPopovers
(StatusDropdown/AssigneePicker/DatePickerPopover/TagPicker with
{task,pos,onClose}), PRIORITY_META, comingSoon. Strict TS.

### seed-data → src/lib/seed.ts ONLY
Rebuild the sprint/list task data to match the video exactly:
- ADD users: kanish 'Kanish', nithishkumar 'Nithishkumar Krishnamoorthy',
  golam 'Golam Kibria', arjun 'Arjun', shanmugaraj 'shanmugaraj' (lowercase),
  md 'Md', lavanya 'Lavanya' — initials/colors per digest avatar hues (S green,
  N purple, M charcoal, A red-orange, L purple, K teal, G blue).
- REPLACE all `task('sprint1'|'sprint2'|'sprint3'|'sprint4'|'list1', ...)`
  entries with the video dataset: totals MUST be sprint1=1, sprint2=12,
  sprint3=14, sprint4=35 top-level tasks (62 total; list1 keeps its 1
  qaComplete task). Mine digest2-data.md: [57s][58s][64s][65s] table rows
  (names+assignees+status+due+priority), [24s]-[31s] folder-list groups
  (subtaskCounts, tags msm/clientFeedback/bug, priorities High/Low/Urgent,
  attachments, red vs plain dates), [36s]-[46s] board columns. Status counts
  across the folder must equal: toDo 1, readyForDev 7, devInProgress 3,
  readyForQa 12, qaInProgress 9, holdForInfo 1, devCompleted 2, qaComplete 3,
  readyForBaReviewInQa 12, baReviewComplete 12. dueDone: true for
  BA REVIEW COMPLETE green dates; dueOverdue for red ones. Multi-assignee via
  assigneeIds arrays (order matters: 'Kanish, shanmugaraj' → [kanish,
  shanmugaraj]). Sprint distribution: sprint1 = Sprint 1- Defects set? NO —
  sprint1's single task per sidebar count is the one in READY FOR BA REVIEW
  IN QA per its list view; digest chunk 18-34 shows per-sprint groups — follow
  it (Sprint 2 = BA REVIEW COMPLETE 12; Sprint 3 = READY FOR BA REVIEW IN QA
  11 + QA COMPLETE 3; Sprint 4 = DEV COMPLETED 2 + HOLD 1 + QA IN PROGRESS 9 +
  READY FOR QA 12 + READY FOR DEV 7 + TO DO 1 + devInProgress 3 =35). Add
  sprintMeta to the four sprint FolderItems (Sprint 1: done, 'Nov 24 - Dec 15',
  notEst 1, descriptionTitle 'Figma Link', descriptionText 'Data upload,
  Sales, Purchase and Quotes screens'; Sprint 4: done, 'Feb 2-22', notEst 14;
  mine ranges for 2/3). Keep backlog/notifications/docs/statuses untouched.
  Keep subtask seeding for Dashboard - Inventory Health Status (backlog).

### board → src/features/space/BoardView.tsx
Columns for EVERY status in `boardOrder` (empty ones too, counts, hover ⋯/+),
horizontal scroll, column tints (devInProgress pale yellow, reopen/notABug
pale pink), pill styles per digest [36s-46s]; cards: title, desc icon,
ghost/real avatar stacks, red/green due chips, filled tag pills, 'N subtasks'
row (▸ on hover), paperclip+count, imagePreview gray block; hover
quick-actions ✓⊕✎⋯ (✓ sets qaComplete via setTaskStatus, ⋯ opens TaskRowMenu,
⊕/✎ comingSoon); card click → openTask; + Add Task per column (inline input →
addTask(listIds[0], statusId, name)); trailing '+ Add group' (comingSoon).
Skeleton state ~600ms on mount.

### table → src/features/space/TableView.tsx
Renders ListToolbar (import) with its own local viewDirty. Numbered rows over
all listIds' tasks in listId-then-seed order; sticky header Name/Assignee/
Status/Due date/Priority/+; status pills: filled (white text) vs
tableStyle==='outline' (white bg, colored icon+text); done-group rows get
green check-circle name icon, active get colored clock, holdForInfo dark dot;
assignee stacks + comma-joined first names (≤2 assignees show names, 3+
avatars only); row hover: number→checkbox+grip, name ⤢ expand button (→
openTask), row click name → openTask; Assignee header hover sort chevrons
(click sorts asc/desc by first assignee name — real); Name/Assignee divider
drag = REAL column resize (pointer events, min 240px, max 640px; on first
resize set viewDirty → Save view appears); onboarding popover on first mount
('Explore what's new in Table view!' / 'Let us show you around.' / '1 of 3' /
Get started → dismiss, X dismiss; sessionStorage so it shows once per
session); '+' add-column header → comingSoon; bottom '+' add row → inline
addTask into toDo. Skeleton: header first, rows pop in ~500ms.

### create-modal → src/features/task/NewTaskModal.tsx + src/features/space/ListToolbar.tsx (REWRITE)
NewTaskModal (global, opens for store.newTaskFor): centered 636px card, tabs
Task/Doc/Reminder/Whiteboard/Dashboard (underline switch, X + pop-out);
Task tab: location pills (sprint name ⌄ + 'Task ⌄' via comingSoon), name
input placeholder "Task Name or type '/' for commands", description area
('Add description, or write with AI' → textarea, collapses to '+ Add
description' when name focused per video), chip row: status chip (cycles via
StatusDropdown-like mini popover or comingSoon — use real StatusDropdown on a
DRAFT: keep local draft state {name,desc,statusId,assigneeIds,dueIso,
priority,tags}), Assignee chip → local people popover (Me/Arun RK/+ Create
Agent rows per digest [78s]), Due date chip → reuse date-quick logic (build
local mini date popover w/ quick options + calendar; simpler: reuse
DatePickerPopover pattern locally), Priority chip → Urgent/High/Normal/Low/
Clear, Tags chip → workspace tag list toggles, '…' chip → menu Time Estimate/
Sprint Points/Dependencies/Subtasks/Checklist (comingSoon each); 'Fields' +
'+ Create new field' (comingSoon); footer: Templates (wand), paperclip, bell
'1', 'Create Task ⌄' purple → addTask(newTaskFor, draft.statusId||'toDo',
name) then apply draft fields via store setters, close, toast 'Task created'.
Doc tab: My Docs ⌄, 'Name this Doc...', Start writing / Write with AI rows,
'Add new' Table/Column/ClickUp List rows, Private toggle, Create Doc
(comingSoon on create). Reminder: name + Today/For me/Notify me chips +
Create Reminder (comingSoon). Whiteboard/Dashboard: location ⌄ + name +
Private + Create X (whiteboard create → real addListToSpace? NO — comingSoon).
ListToolbar rewrite: keep left cluster + Save view + icons; '+ Task' button →
openNewTask(listId ?? 'backlog'); hover tooltip 'Add a Task to this location'
(dark tooltip); ⌄ segment → Create dropdown (search 'Find type…', types Task/
Milestone/Bug/Epic/Feedback/Form Response, divider, '+ Task from another
List' › with LEFT flyout: search + 'Recent' 6 real tasks from store (status
dot + name + avatar stack; click → openTask) + 'Browse tasks' link, 'Pin a
Template', 'Apply a template'); funnel tooltip 'Quickly filter your tasks';
gear → setCustomizeViewOpen(true) + tooltip 'Customize your view settings'.

### space-overview → src/features/space/SpaceOverviewPage.tsx + src/features/inbox/NotificationDetail.tsx + src/features/inbox/InboxPage.tsx (integrate detail)
SpaceOverviewPage: PromoBanner; header row (space chip+name+lock+⌄+☆ favorite
toggle + filter-lines icon; right: call ⌄/controller/lightning/Brain²/'Share ·
2' via comingSoon); tabs Add Channel|Overview(active)|List|Board|Timeline|
Workload|Table|+View — non-overview tabs comingSoon; hint banner + toolbar
(Loading… fades to Auto refresh pill after ~800ms, funnel/gear/+Card
comingSoon); cards grid: Recent (rows = Backlog, MVP - MSM →folder route,
List, then sprints by recency Sprint 3/4/1/2 with '• in MVP - MSM'; click
navigates), Docs (doc row → comingSoon), Bookmarks empty state; full-width
Folders card (tile 'MVP - MSM' → navigate folder overview); Lists card (tiles
List + Backlog → navigate). Card hover chrome: drag handle + outlined title +
⤢/+/… (comingSoon). Skeleton-first ~700ms.
InboxPage: clicking a NotificationRow now ALSO sets local selected id and
renders <NotificationDetail notification onBack> INSTEAD of the list (keep
markRead); NotificationDetail: header back arrow + title area (icon + name) +
right icons (mail/globe/star comingSoon) + dark '✓ Clear' button
(clearNotification + back); body card: avatar + rich preview segments + 'Jul
16 at 12:49 pm'-style timestamp (derive '{timeLabel} at 12:49 pm' literal ok);
skeleton flash on open. Keep all existing inbox behaviors/tests intact
(tabs, clear all, filter, hover actions still work from the list).

### panels → src/features/space/CustomizeViewPanel.tsx + src/features/space/PaywallViews.tsx + src/features/ai/BrainPage.tsx
CustomizeViewPanel (reads customizeViewOpen; render right-docked 316px full-
height panel with animate-fade-in, X closes): name input 'List' w/ glyph;
toggle rows (Show empty statuses ON, Wrap text ON, Show task locations, Show
subtask parent names, Show closed tasks — local state, real toggle visuals);
'More options ›'; rows Fields '6 shown', Filter 'None', Group 'Status',
Subtasks 'Collapsed', Templates › (click → popover Apply/Save as/Update
existing template); toggles Autosave for me/Pin view/Private view/Protect
view/Set as default view (OFF); rows Copy link to view (clipboard+toast),
Favorite ›, Export view, Sharing & Permissions (comingSoon). Mount it in
ListPage/FolderPage? NO — render inside CustomizeViewPanel as fixed right
overlay (z-40) so no page edits needed.
PaywallViews: ViewPaywall({view}) = expired state behind (illustration block,
'Your 100 {Timeline|Workload} uses have expired.', 'Learn more…' link, dark
'Contact admin' btn → comingSoon) + auto-open modal on mount (dim overlay,
'You have run out of trial usage for {X} Views.', 'Upgrade to Business to get
unlimited {X} Views', left feature panel w/ gray screenshot block + 3 bullets
verbatim [48s], right: Business + Popular badge, $19 member per month,
'Contact your admin' purple btn, checklist verbatim, '100% Money back
Guarantee' round badge; X closes). SprintReportingUpsell: page ('Free Forever
Plans are limited to 100 uses of Dashboards' + 'To remove all limits, upgrade
to Unlimited' + Learn more + dark 'Upgrade Plan') + auto modal ($10 Unlimited
variant, checklist verbatim [54s]).
BrainPage: onboarding modal on first visit (sessionStorage): 'Your company's
Brain' heading, dark 'Personalize Brain²' pill (comingSoon), 'Skip for now'
closes; page: soft radial glow, Brain² wordmark + pinwheel, Ask/Agents
segmented toggle (Agents → comingSoon), prompt card (rotating placeholder
5s interval between the two verbatim strings, ⊕/Skills/Max ⌄/mic buttons
comingSoon; Enter → toast 'Brain² responses are next on the build list…'),
4 suggestion cards skeleton→content (Dashboard Status/Draft Documentation/
Find Overdue/Sprint Update + gray sublines), footer 'Meet Brain² New' promo.

### folder-list → src/features/space/FolderListView.tsx
Sprint-cards layout for folder list tab: light gray canvas; per sprint (order
sprint1..4) a white rounded-xl card: tiny 'MSM / MVP - MSM' breadcrumb, header
(⌄ caret, bold name, ⋯ comingSoon, green BadgeCheck+'Done' when
sprintMeta.done, 📅 range, hourglass '-', ⚠ 'N not est' amber); Sprint 1 extra
description block (blue underlined 'Figma Link' + text from sprintMeta);
status groups within the sprint (statusOrder, skip empty), rows: status icon
(status color; green check circle for done-group), name (→ openTask), ⑂N
subtask badge, desc icon, paperclip, tag chips (filled style), avatar stack
(24px ring overlap), red due date / green when dueDone, priority label
colored (Urgent red/High amber/Low gray); '+ Add Task' per group (inline
input → addTask(sprintId, statusId, name)); group collapse local per card.
