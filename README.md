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
| Planner | 🔜 Placeholder | share a screenshot to build next |
| AI | 🔜 Placeholder | |
| Teams | 🔜 Placeholder | |
| Dashboards | 🔜 Placeholder | |

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
