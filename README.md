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
| Home / Inbox | ✅ Built | Tabs (Primary/Other/Later/Cleared), clear/later/mark-read actions, live unread badges, sidebar with Spaces → Folder → Sprints tree |
| Folder Overview | ✅ Built | Breadcrumb + view tabs, Recent/Docs/Bookmarks/Resources/Burndown cards |
| Sprint List view | ✅ Built | Status groups (colored pills), summary cards, subtask chips, overdue dates, estimates, collapse |
| Create a Space | ✅ Built | Modal with live letter preview — actually adds the space |
| Create menu | ✅ Built | List/Folder/Sprint Folder/Doc/… popover — "List" actually adds one |
| Board / Timeline / Workload / Table / Sprint Reporting | 🔜 Placeholder | share a screenshot to build next |
| Planner / AI / Teams / Dashboards | 🔜 Placeholder | |

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
- Sidebar: create Space (modal) / Folder / Sprint Folder / List / Sprint,
  navigate everywhere, favorites star
- Global search: Ctrl+K, results across tasks/sprints/lists/docs, Enter to open
- Anything whose screen isn't replicated yet responds with a toast pointing at
  the build list

## Testing

```bash
npm run dev            # in one terminal
node scripts/e2e.mjs   # 45 end-to-end Playwright checks
```
