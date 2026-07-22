# Home screen (Inbox) — design spec

Pixel-level spec transcribed from a screenshot of the real ClickUp desktop app
(workspace "Techjays"). The goal is a faithful visual + functional replica built
with React 19 + TypeScript + Tailwind CSS v4 + lucide-react + zustand.

## Ground rules for implementers

- Read `src/lib/types.ts`, `src/lib/seed.ts`, `src/lib/store.ts` first — all data
  comes from the zustand store (`useAppStore`), never hardcode workspace content
  inside components (UI-chrome labels like "Inbox", "Filter", "Clear all" are fine).
- Shared primitives exist: `src/components/ui/Avatar.tsx` and
  `src/components/ui/CountBadge.tsx` — use them, don't reinvent.
- Design tokens are defined in `src/index.css` via Tailwind `@theme`. Available
  utility color names: `brand`, `brand-deep`, `ink`, `ink-soft`, `ink-faint`,
  `line`, `line-strong`, `panel`, `hover`, `active-row`, `danger`
  (e.g. `text-ink-soft`, `bg-panel`, `border-line`, `bg-hover`).
- Base font size is 14px, font is Inter. Densities are tight, ClickUp-like:
  rows are 32px tall in the sidebar, ~46px in the inbox list.
- Icons: lucide-react, default stroke width; sidebar/topbar icons render at
  16px (`h-4 w-4`), icon-rail icons at 20px (`h-5 w-5`).
- Every interactive element must have a `cursor-pointer` hover state
  (`hover:bg-hover` for ghost buttons/rows) and rounded corners (`rounded-md`
  for rows/buttons unless stated otherwise).
- Buttons that do nothing yet should still look/hover right (plain `<button>`).
- Do NOT modify files owned by other components: `App.tsx`, `main.tsx`,
  `index.css`, `src/lib/*`, `src/components/ui/*`.

## Overall layout (App.tsx already wires this — do not edit it)

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar (h-12, full width, bg-white, border-b border-line)    │
├────┬─────────────┬───────────────────────────────────────────┤
│Icon│  Sidebar    │  Main content (InboxPage)                 │
│Rail│  w-[264px]  │  flex-1, bg-white                         │
│w-14│  bg-panel   │                                           │
└────┴─────────────┴───────────────────────────────────────────┘
```

---

## 1. TopBar — `src/components/layout/TopBar.tsx`, export `TopBar`, no props

Full-width `header`, `h-12`, white bg, `border-b border-line`, horizontal flex,
`px-2.5`, three zones:

**Left zone (flex items-center gap-1):**
- Workspace switcher button: rounded-md hover:bg-hover px-1.5 py-1, contains:
  - Workspace avatar: 22px, rounded-md, purple→violet gradient
    (`bg-gradient-to-br from-[#7b68ee] to-[#a05fe8]`), white bold letter "T"
    (derive first letter from `workspaceName` in store).
  - Name `Techjays` (from store), `text-sm font-semibold text-ink`.
  - `ChevronDown` 14px `text-ink-faint`.
- Icon ghost button with `Calendar` icon (16px, `text-ink-soft`), size ~28px
  square, rounded-md, hover:bg-hover.

**Center zone (absolutely centered or flex-1 with justify-center):**
- A single pill (`h-8`, `rounded-full`, `border border-line-strong`,
  `bg-panel`, hover slightly darker) about 420px wide, containing two segments
  separated by a vertical divider (`border-l border-line-strong`):
  1. Search segment (grows): `Search` icon 14px `text-ink-faint`, text
     `Search` in `text-ink-faint text-[13px]`, right-aligned kbd hint
     `Ctrl+K` in `text-[11px] text-ink-faint`.
  2. AI segment (shrink-0, px-3): text `AI Chats` `text-[13px] text-ink` +
     `Sparkles` icon 14px with `text-[#b15de8]` (colorful accent).

**Right zone (flex items-center gap-1):**
- Ghost icon buttons (28px square, rounded-md, hover:bg-hover, icons 16px
  `text-ink-soft`): `CircleCheckBig`, `Video`, `Mic`.
- Current user avatar: use `Avatar` primitive, 26px, initials/color of
  `users[currentUserId]` from store, `presence` dot on.

## 2. IconRail — `src/components/layout/IconRail.tsx`, export `IconRail`, no props

Vertical `nav`, `w-14 shrink-0`, white bg, `border-r border-line`, flex column,
items centered, `py-1.5`, `gap-0.5`. Bottom section pinned with `mt-auto`.

Each item is a `NavLink` (react-router-dom) to its route, rendered as a column:
icon (20px) above a `text-[10px]` label, `text-ink-soft`, rounded-md, width
~48px, `py-1.5`, hover:bg-hover. Active route (`isActive`): icon+label
`text-brand-deep`, `font-medium`.

Items (top → bottom), route + lucide icon:
1. `Home` → `/home`, icon `House`. This item ALSO shows a notification badge:
   red `CountBadge variant="red"` with the PRIMARY tab unread count from the
   store (`unreadCountForTab(notifications, 'primary')`), absolutely positioned
   top-right of the icon (only when count > 0).
2. `Planner` → `/planner`, icon `CalendarDays`
3. `AI` → `/ai`, icon `Sparkles`
4. `Teams` → `/teams`, icon `UsersRound`
5. `Dashboard` → `/dashboards`, icon `LayoutDashboard`
6. `More` → `/more`, icon `LayoutGrid`

Pinned at bottom (mt-auto): `Invite` → `/more` styled like the others, icon
`UserRoundPlus` (plain button is fine — no active state).

## 3. Sidebar — `src/components/layout/Sidebar.tsx`, export `Sidebar`, no props

`aside`, `w-[264px] shrink-0`, `bg-panel`, `border-r border-line`, flex column.
Header fixed, rest scrolls (`overflow-y-auto`, `px-2 pb-4`).

**Header row** (px-3.5, h-12, flex items-center justify-between):
- `Home` — `text-[15px] font-semibold text-ink`.
- Right: split button ~ two joined segments in a `rounded-md border border-line-strong bg-white` :
  `Plus` icon 14px segment + thin divider + `ChevronDown` 12px segment, each
  px-1 py-0.5 hover:bg-hover.

**Row recipe** (used everywhere below): `h-8`, `rounded-md`, `px-2`, flex
items-center `gap-2`, `text-[13.5px] text-ink`, hover:bg-hover, cursor-pointer.
Leading icon 16px `text-ink-soft`. Trailing content (counts) pushed right with
`ml-auto`.

**Nav group** (top, no section header):
- `Inbox` — icon `Inbox`. ACTIVE state: `bg-active-row font-medium`. Trailing:
  `CountBadge variant="red"` with primary unread count from store (hide at 0).
- `Replies` — icon `Reply`
- `Assigned Comments` — icon `AtSign`
- `My Tasks` — icon `CircleCheckBig`
- `More` — icon `Ellipsis`

**Section header recipe:** `text-[11px] font-semibold uppercase tracking-wide
text-ink-faint`, mt-4 mb-1, px-2, flex — some have a trailing icon-button on
the right (see Spaces).

- Section `AI Chats`:
  - Row: `Ask, Build, Create` with leading `Plus` icon — style the row text
    `text-ink-soft`.

- Section `Channels`:
  - Row per channel from store: leading `Hash` icon, channel `name`; if
    `suffix` present render ` - {suffix}` in `text-ink-faint`.
  - Row `Add Channel` with leading `Plus`, `text-ink-soft`.

- Section `Direct Messages`:
  - Row per user id in `dmUserIds`: `Avatar` primitive 20px (initials+color
    from `users`), then name (truncate).
  - Row `New message` with leading `Plus`, `text-ink-soft`.

- Section `Spaces` (header has a trailing `Plus` ghost icon-button aligned right):
  - Special row `All Tasks`: leading icon — a 16px colorful four-petal shape;
    approximate with `Shapes` or `Asterisk` lucide icon wrapped in
    `text-brand`; label `All Tasks` + ` - Techjays` suffix in `text-ink-faint`
    (workspace name from store).
  - For each space in store (only "MSM" exists):
    - Space row: `Avatar` primitive 20px `rounded="md"` (abbr + color), name
      `font-medium`, then `Lock` icon 12px `text-ink-faint` when `isPrivate`,
      trailing (ml-auto) `Plus` ghost icon 14px.
    - The space is EXPANDED by default. Nested content indents with `pl-4`.
    - Folder row (per folder): leading `Folder` icon (or `FolderOpen`), name.
      Expanded by default; its items indent another `pl-4`.
    - Folder item rows (per `FolderItem`), leading icon by `item.icon`:
      - `sprint` → `Target` icon (circle-dot look) `text-ink-soft`
      - `board` → `Presentation` icon with `text-[#e8a33d]` (the retro board is orange)
      - `list` → `List` icon `text-ink-soft`
      Name truncates (`truncate`) — long sprint names must ellipsize.
      Trailing (ml-auto): if `countStyle === 'pill'` → `CountBadge
      variant="dark"`; else if `count` → `CountBadge variant="plain"`.
    - After the folder items: row `Create Sprint` with leading `Plus`,
      `text-ink-soft`.

Collapsible behavior: clicking a section header, the space row, or the folder
row toggles its children (local `useState`; everything starts expanded).
Chevron rotation not required.

## 4. InboxPage — `src/features/inbox/InboxPage.tsx`, export `InboxPage`, no props

`main`, `flex min-w-0 flex-1 flex-col bg-white`. You may create sibling files
in `src/features/inbox/` (e.g. `PromoBanner.tsx`, `InboxTabs.tsx`,
`NotificationRow.tsx`) — keep `InboxPage` the only export App.tsx needs.

### 4a. Promo banner (top strip)

Render unless `bannerDismissed` (store). Full-width strip, `h-9` (min-h to be
safe), gradient bg `bg-gradient-to-r from-[#fdeef3] via-[#fbf0f7] to-[#f3effc]`,
centered `text-[13px] text-ink`:

> Think Brain² won't impress you? Hand it one task. **Fine, prove me wrong →**

- "Brain²" = word `Brain` + `<sup>2</sup>`.
- `Fine, prove me wrong →` is a `font-medium underline` link-styled button.
- Right edge: `X` icon ghost button (16px) — on click calls `dismissBanner()`.

### 4b. Tabs row

`h-[54px]`, `border-b border-line`, flex. Four tabs, each a button:
`px-6`, full height, flex items-center gap-2.5, separated by `border-r
border-line` hairlines on the first two tabs' right side (subtle vertical
dividers as in ClickUp).

Tab contents (icon 16px):
1. `Primary` — icon `Inbox`. Two-line: title `text-[13.5px] font-semibold
   text-ink` and, when its unread count > 0, sublabel `{n} unread` in
   `text-[11.5px] text-ink-faint`.
2. `Other` — icon `Activity`. Same two-line treatment.
3. `Later` — icon `Clock`. Single line title, `font-medium text-ink-soft`.
4. `Cleared` — icon `CheckCheck`. Single line, `font-medium text-ink-soft`.

Active tab: a `2px` bottom border in `bg-ink` (dark, not purple) — implement as
an absolutely-positioned bottom bar inside the relative tab; inactive tabs get
transparent. Unread sublabel counts come from `unreadCountForTab` per tab.
Clicking calls `setActiveTab`.

### 4c. Toolbar row

Flex row, `px-4 py-2.5`, items-center:
- Left: `Filter` button — `rounded-md border border-line-strong` px-2.5 h-7,
  flex gap-1.5, `ListFilter` icon 14px, `text-[13px] text-ink-soft`, hover:bg-hover.
- Right (ml-auto, flex gap-1):
  - Ghost icon button `Settings` 16px `text-ink-soft`.
  - `Clear all` button — same outline style as Filter, `CheckCheck` icon 14px +
    text `Clear all`. On click: `clearAll()`.

### 4d. Notification list

Scrollable (`flex-1 overflow-y-auto`, `px-4 pb-8`). Content from
`notificationsForTab(notifications, activeTab)` passed through
`groupNotifications`.

**Group header:** `text-[13px] font-semibold text-ink`, `pt-4 pb-1.5 px-2`
(e.g. `Today`, `January`).

**Row:** `group relative flex h-[46px] items-center gap-3 rounded-lg px-2
hover:bg-panel cursor-pointer`. On click: `markRead(id)`. Left → right:

1. **Leading icon** (18px area, shrink-0) by `icon.kind`:
   - `space` → `Rocket` 16px `text-ink-soft`
   - `access` → `Medal` 16px `text-[#e8a33d]` (gold)
   - `status` → a 14px status ring: `<span>` `h-3.5 w-3.5 rounded-full`
     with `border-[3.5px]` and `borderColor: icon.color` (inline style)
   - `clock` → `Clock` 16px, inline style `color: icon.color`
   - `channel` → `Hash` 16px `text-ink-soft`
2. **Title**: `text-[13.5px] text-ink truncate shrink-0 max-w-[340px]`,
   `font-semibold` when `!read`, `font-normal` when read.
3. If `titleIcon === 'share'`: `Share2` icon 13px `text-ink-faint`.
4. **Avatar** (if present, 18px): `kind:'user'` → `Avatar` primitive with that
   user's initials/color; `kind:'dot'` → plain filled circle `h-[18px] w-[18px]
   rounded-full` with inline bg `avatar.color`.
5. **Preview** (`flex-1 min-w-0`): single line, `truncate`, `text-[13px]
   text-ink-soft`. Render `RichSegment[]` inline by style:
   - `normal`/undefined → plain
   - `bold` → `font-semibold text-ink`
   - `link` → `text-[#5b6ee8]` (blue link)
   - `mention` → `text-[#7057e0] font-medium`
   - `code` → `rounded bg-[#f3f4f6] px-1 py-px font-mono text-[11.5px] text-[#d8354f]`
   - `boldItalic` → `font-semibold italic text-ink`
   If `attachment` present, append a chip after the text: inline-flex
   `rounded border border-line-strong px-1.5 py-px text-[11.5px] text-ink-soft`
   with a leading `Image` icon 12px.
6. **Right meta** (shrink-0, flex items-center gap-2.5, w fixed enough):
   - Hover-only quick actions (`hidden group-hover:flex`, gap-0.5):
     ghost icon buttons 24px — `Check` ("Clear", calls `clearNotification(id)`)
     and `Clock` ("Later", calls `moveToLater(id)`); add `title` attrs.
     Use `e.stopPropagation()`.
   - `CountBadge variant="outline"` with `count`.
   - Time label: `text-[12.5px] text-ink-faint w-14 text-right shrink-0`.

**Empty state** (any tab with no items): centered column (flex-1, pt-24),
`Inbox` icon 40px `text-line-strong`, title `You're all caught up!`
`text-[15px] font-semibold text-ink`, subtitle `New notifications will appear
here.` `text-[13px] text-ink-soft`.

---

## Functional acceptance checklist

- [ ] Tabs switch lists; Primary shows 7 rows (1 under Today, 6 under January), Other shows 7.
- [ ] Sidebar Inbox badge, icon-rail Home badge, and "7 unread" sublabels all
      derive from the store and update live.
- [ ] Hovering a row reveals Clear/Later actions; Clear moves it to Cleared tab,
      Later moves it to Later tab; counts update everywhere.
- [ ] "Clear all" empties the current tab into Cleared and shows the empty state.
- [ ] Promo banner X dismisses it.
- [ ] Clicking a row un-bolds its title (marks read) and decrements unread counts.
- [ ] Sidebar sections, the MSM space, and the MVP - MSM folder collapse/expand on click.
- [ ] Icon rail navigates between /home and placeholder routes; Home is active-highlighted on /home.
