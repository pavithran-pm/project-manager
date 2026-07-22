# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **pixel-faithful ClickUp replica** ("Project Manager") for the Techjays workspace, rebuilt
**screen by screen from screenshots and screen recordings of the real ClickUp app**. Fidelity is
the point: colors are sampled from actual video pixels, and unbuilt features intentionally show a
"coming soon" toast rather than being stubbed silently. There is no backend — everything is seeded
client data persisted to `localStorage`.

**Stack:** React 19 + TypeScript 7 (strict) · Vite 8 · Tailwind CSS v4 (`@theme` tokens in `src/index.css`) ·
zustand 5 (state) · react-router-dom 7 · lucide-react (icons). No backend, no linter, no unit-test runner.

## Commands

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173 (BrowserRouter, clean URLs)
npm run build     # tsc -b (typecheck, strict) THEN vite build → dist/
npm run preview   # preview the production build
```

There is **no linter and no unit-test runner**. The type checker (`tsc -b`, strict mode) is the only
static gate, and it runs as part of `npm run build` — run `npm run build` to verify a change typechecks.

`run.bat` (Windows) / `run.sh` (macOS/Linux) are one-click launchers that install deps on first run,
start the dev server, and open the browser.

### End-to-end tests (Playwright)

```bash
npm run dev                    # in one terminal
node scripts/e2e.mjs [baseUrl] # ~45 functional checks (default http://localhost:5173)
node scripts/screenshot.mjs [url] [outfile]   # full-page screenshot for visual review
```

⚠️ Both scripts hardcode `executablePath: '/opt/pw-browsers/chromium'` (a Linux path). On Windows/macOS
you must edit that line (or remove it to use Playwright's bundled browser) before they will run.

The e2e suite asserts against **CSS class names** (`.animate-pop-in`, `.pm-shimmer`), **`title`/`aria-label`
attributes**, and **visible text** — renaming the animation utilities in `index.css`, changing a11y labels, or
altering seed strings will break tests. Treat those as part of the contract.

### Single-file "artifact" build (not wired to an npm script)

```bash
vite build --mode artifact          # → dist-artifact/index.html, fully self-contained (JS/CSS/fonts inlined)
node scripts/make-artifact.mjs [out] # → body-only fragment for hosts that supply their own <html>
```

Artifact mode sets `VITE_HASH_ROUTER=1` so routing works on static hosts with no history fallback (see below).

## Architecture

**Everything routes through one zustand store.** `src/lib/` is the domain core — read all three files
before changing behavior:

- **`src/lib/types.ts`** — the entire domain model (Task, Space, SpaceFolder, FolderItem, TaskStatus,
  AppNotification, ActivityEntry, etc.). Comments on fields describe how each renders.
- **`src/lib/seed.ts`** — the initial workspace (spaces, sprints/lists, ~47 tasks, users, notifications,
  docs, the 19-status registry, tags). **This is where you change workspace content**, not components.
- **`src/lib/store.ts`** — the single `useAppStore` (zustand + `persist`) plus **all derived-state helpers**.

### The store is also the selector library

`store.ts` exports pure functions that are the **canonical way to derive views** — do not reimplement
this logic in components: `notificationsForTab`, `unreadCountForTab`, `groupNotifications`, `effectiveTab`,
`tasksForLists`, `subtasksOf`, `groupTasksByStatus`, `listStats`, `findListItem`, `findFolder`,
`formatDueDate`, `isOverdue`, plus the `PRIORITY_META` map and the `comingSoon(notify, what)` toast helper.

All mutations are immutable (map/spread) and mint IDs via `freshId(prefix)`.

### Persistence & the migration trap

`persist` writes to `localStorage` key **`pm-tracker-store`**, currently **`version: 2`**. Only a subset of
state is persisted (`partialize`: notifications, tasks, spaces, favorites, bannerDismissed, inboxUnreadOnly,
groupCollapse) — everything else (open modals, active tab, sidebar state) is ephemeral and re-seeds each load.

The `migrate` function **discards any persisted state whose version ≠ 2** (`version === 2 ? persisted : {}`),
so old shapes cleanly fall back to fresh seed data. **When you change the shape of persisted seed data, bump
`version` AND update the `migrate` check** — otherwise either stale localStorage wins or all saved user state is
silently wiped. During testing, `localStorage.clear()` (or removing that key) resets to seed.

### Routing & layout

`App.tsx` owns all routes and the layout shell: a persistent `TopBar` + `IconRail`, a per-route `Sidebar`,
and the routed `main`. **Overlays are store-driven, not route-driven** — `SearchModal`, `TaskModal`,
`NewTaskModal`, `CustomizeViewPanel`, and `ToastHost` are mounted once at the App root and shown based on store
flags (`selectedTaskId`, `newTaskFor`, `searchOpen`, `customizeViewOpen`). To open a task from anywhere, call
`openTask(id)` — never navigate.

**Router type is chosen at build time**: `import.meta.env.VITE_HASH_ROUTER === '1'` → `HashRouter` (artifact
build), else `BrowserRouter` (dev/prod). Space/list/folder views share a `:view?` route segment
(`list` | `board` | `table` | `timeline` | `workload` | `sprint-reporting`); `ListPage`/`FolderPage`
switch on it, and un-purchased views (`timeline`, `workload`, `sprint-reporting`) render deliberate paywall
screens.

### Source layout

- `src/components/ui/` — shared primitives: `Avatar`, `CountBadge`, `Popover`, `SearchModal`, `ToastHost`
- `src/components/layout/` — `TopBar`, `IconRail`, `Sidebar`
- `src/components/sidebar/` — `CreateMenu`, `CreateSpaceModal`
- `src/features/{inbox,space,task,whiteboard,ai,placeholder}/` — one folder per screen area

## Conventions

- **Styling is Tailwind v4 utilities with design tokens in `src/index.css`** (`@theme`). Use the semantic
  tokens (`text-ink`, `text-ink-soft`, `bg-panel`, `bg-hover`, `border-line`, `text-brand`, `bg-danger`, …)
  for the ClickUp palette rather than raw hex. Custom animation utilities live here too:
  `animate-pop-in`, `animate-fade-in`, `animate-rise-in`, and the `pm-shimmer` loading skeleton — reused
  everywhere and asserted by the e2e tests.
- **All field editors are `Popover`s.** Use `Popover` + `popoverPosFor(el, width)` + `PopoverItem` from
  `components/ui/Popover.tsx` (backdrop-click + Escape to close, viewport clamping, pop-in animation).
  The status/date/assignee/priority/estimate/tag pickers follow this pattern.
- **Deliberate loading skeletons.** Screens re-create ClickUp's staggered loads (`pm-shimmer` bars, and
  `Task.loadDelayed` to stagger some field values into a second pass) to match the reference recordings.
- **Unbuilt affordances call `comingSoon(notify, …)`** to toast a pointer at the build list. New placeholder
  screens go through `features/placeholder/PlaceholderPage.tsx`. Check the README status table before assuming
  a screen exists.
- **Notifications** carry an origin `tab` but `cleared`/`later` override it — always resolve the current tab
  with `effectiveTab(n)`.
- **Tasks vs subtasks**: subtasks are ordinary `Task`s with a `parentId` (same `listId`). Statuses are a
  registry keyed by id with a canonical `statusOrder`; `groupTasksByStatus` orders by it and omits empty groups.

## Reference material

`docs/` holds the source-of-truth for fidelity work: frame-by-frame video digests
(`video-digest-*.md`, `video2-digest-*.md`), build specs derived from them (`video-spec-3.md`, `video-spec-5.md`,
`screens-spec-2.md`), and the home-screen pixel spec (`home-screen-spec.md`). **The workflow for a new screen is:
capture a screenshot/recording → transcribe it to a spec in `docs/` → build against that spec.** The README's
status table tracks which screens are built vs. placeholder.

> Note: the README says the dev server is on port 5173 and `npm install && npm run dev` — accurate. It does not
> document the artifact build or the `/opt/pw-browsers/chromium` caveat; both are covered above.
