# Project Manager — ClickUp-style tracker

A ClickUp replica being rebuilt screen by screen from screenshots of the real
app, for tracking team projects (Techjays workspace).

## Stack

- React 19 + TypeScript (strict)
- Vite
- Tailwind CSS v4 (design tokens in `src/index.css`)
- zustand (app state), lucide-react (icons), react-router-dom (screens)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Screens

| Screen | Status | Notes |
| --- | --- | --- |
| Home / Inbox | ✅ Built | Tabs, clear/later/mark-read, live unread badges |
| Backlog list (from video) | ✅ Built | 47 seeded tasks, 19-status registry, group expand skeletons, sticky headers, tag chips, subtask rows, row context menu + 7 flyouts, description hover preview |
| Task detail modal (from video) | ✅ Built | Fields grid + status/date/assignee/tag/time-track popovers, rich description with Expand/full-page view, subtask composer + table, checklists, attach/relationship menus, Activity feed + comments, loading skeletons, Esc/close tooltips |
| Whiteboard | ✅ Built | Dot grid, tool bar, zoom, working sticky notes |
| Folder Overview | ✅ Built | Cards, skeleton loads, navigation |
| Sprint List view | ✅ Built | Summary cards, estimates, all cell popovers |
| Create a Space / Create menu | ✅ Built | Really create spaces/lists/folders/sprints |
| Board / Timeline / Workload / Table / Sprint Reporting | 🔜 Placeholder | share a recording to build next |
| Planner / AI / Teams / Dashboards | 🔜 Placeholder | |

The 4-minute reference recording is transcribed frame-by-frame in
`docs/video-digest-*.md`; `docs/video-spec-3.md` is the build spec derived
from it (colors sampled from the actual video pixels).

## Structure

```
src/
  lib/            types, seed data (workspace content), zustand store
  components/
    ui/           shared primitives (Avatar, CountBadge)
    layout/       TopBar, IconRail, Sidebar
  features/
    inbox/        Home screen (Inbox) — tabs, notification list, banner
    placeholder/  stub page for screens not built yet
docs/
  home-screen-spec.md   pixel spec transcribed from the reference screenshot
```

Seed data lives in `src/lib/seed.ts` — swap it there to change workspace
content (spaces, sprints, notifications, people). All mutations (created
tasks/spaces, assignments, statuses, favorites) persist to localStorage.

## Working functionality

- Inbox: tabs, clear/snooze/mark-read, unread-only filter, live badges
- Tasks: create inline, change status (moves groups), assign, due dates
  (overdue coloring), priorities, time estimates — all via popovers; summary
  cards recompute live
- Task drag-and-drop: reorder within a status group, drag across groups
  (changes status) and across sprints/lists (changes list), in List, Board and
  folder-List views + Backlog; multi-select with checkboxes (shift-click for a
  range) drags several tasks together
- Sidebar: create Space (modal) / Folder / Sprint Folder / List / Sprint,
  navigate everywhere, favorites star; expand/collapse spaces & folders and
  drag to reorder items / move them between folder and space level
- Global search: Ctrl+K, results across tasks/sprints/lists/docs, Enter to open
- Anything whose screen isn't replicated yet responds with a toast pointing at
  the build list

## Testing

```bash
npm run dev            # in one terminal
node scripts/e2e.mjs   # 45 end-to-end Playwright checks
```
