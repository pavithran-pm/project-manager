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
content (spaces, sprints, notifications, people).
