# Zo Trips Prototype

A full-stack content management prototype for the Zo Trips landing page. A content team can curate and arrange trip listings through an admin panel; changes reflect immediately on the consumer-facing page without a deploy.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`) |
| Database | SQLite via LibSQL (`dev.db`) |
| ORM | Prisma 7 with `@prisma/adapter-libsql` |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| State | React Context + `useReducer` (shared store across all routes) |
| Fonts | Figtree (body), Kalam (featured card titles), Rubik (featured card meta) — loaded via Google Fonts CDN in `globals.css` |

---

## Getting started

```bash
# Install dependencies
npm install

# Push the Prisma schema to the local SQLite file
npm run db:push

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

- Consumer page → `http://localhost:3000/zo-trips`
- Admin panel → `http://localhost:3000/admin/landing-page`

---

## Routes

| Path | Type | Description |
|---|---|---|
| `/zo-trips` | Server (dynamic) | Consumer-facing landing page |
| `/zo-trips/list/[slug]` | Server (dynamic) | All-trips detail page for a curated list |
| `/admin/landing-page` | Client | Admin CMS for the landing page |
| `/api/lists` | API | GET all lists · POST create list |
| `/api/lists/[id]` | API | PUT update list · DELETE delete list |
| `/api/lists/[id]/trips` | API | POST add trip to list |
| `/api/lists/[id]/trips/[tripId]` | API | DELETE remove trip from list |
| `/api/lists/[id]/trips/reorder` | API | PUT bulk-update trip positions |
| `/api/lists/reorder` | API | PUT bulk-update list display order |
| `/api/trips` | API | GET seed trip catalogue |

---

## Data model

Defined in `prisma/schema.prisma`. Two tables, SQLite.

### `CuratedList`

Represents a named grouping of trips that appears as a section on the landing page.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | Auto-increment |
| `type` | String | `"manual"` or `"automatic"` |
| `title` | String | Display title |
| `slug` | String (unique) | URL key, e.g. `weekend-escapes` |
| `rule` | String? | Automatic list rule, e.g. `seats_left_below` |
| `rule_parameter` | String? | Rule threshold, e.g. `"6"` |
| `enabled` | Boolean | Whether the list is active |
| `display_order` | Int | Position in the landing page sequence |
| `status` | String | `"live"` · `"draft"` · `"hidden"` |
| `published_at` | DateTime? | Set on first publish |
| `last_reviewed_at` | DateTime? | Used for stale-content warnings (>30 days since review) |

### `CuratedListTrip`

A trip entry inside a list. Denormalised — trip data is copied in at the time of adding, so the landing page never depends on an external trips service.

| Column | Type | Notes |
|---|---|---|
| `id` | Int (PK) | Auto-increment |
| `list_id` | Int (FK) | Parent list, cascades on delete |
| `trip_id` | String | Identifier from the trips catalogue |
| `trip_name` | String | |
| `trip_image` | String | Unsplash URL |
| `trip_tag` | String? | Category, e.g. `"Himalayan"` |
| `trip_duration` | String | e.g. `"7N/8D"` |
| `trip_price` | Int | Price in INR |
| `trip_sold_out` | Boolean | |
| `seats_left` | Int? | Drives urgency label on trip card |
| `next_batch` | String? | Next departure date string |
| `position` | Int | Display order within the list |

---

## Shared state (`lib/pageStore.tsx`)

A React Context + `useReducer` store mounted in the root layout. It persists across all client-side navigations between admin and consumer pages in the same tab.

**State shape**

```ts
{
  lists:    ListWithTrips[] | null   // null = not yet seeded from server
  trending: TrendingDest[]           // 10 destinations, editable in admin
  featured: FeaturedTrip[]           // Featured Experiences trips
}
```

**Actions**

| Action | Effect |
|---|---|
| `SET_LISTS` | Replace the full list array (called after any admin write) |
| `REORDER_LISTS` | Replace array with a reordered version |
| `SET_TRENDING` | Replace trending destinations |
| `SET_FEATURED` | Replace featured experiences trips |

**Persistence across page loads**

- `lists` — seeded from the server component prop on first mount; re-fetched after every admin mutation via `fetchLists()`.
- `trending` — in-memory only; resets to `DEFAULT_TRENDING` on hard refresh.
- `featured` — written to `localStorage` (`zo-featured`) on every `SET_FEATURED` dispatch; read back and re-dispatched on mount. Survives new tabs, refreshes, and direct URL navigation.

---

## Consumer page (`/zo-trips`)

Built in `components/ZoTripsPage.tsx`. The server component (`app/zo-trips/page.tsx`) fetches only `live` lists from the DB and passes them as `serverLists`. The client component seeds the store on first mount, then reads exclusively from the store — so admin changes made in another tab reflect without a page reload once the store is updated.

**Page sections (top to bottom)**

1. Sticky header — logo, search bar, user/login buttons, sub-nav brand chips
2. Announcement banner — gradient strip linking to Zo Selections
3. Spotlight card — Grand Prix 2026 hero banner
4. Hero tagline + search
5. Trending Destinations — horizontal scroll strip of destination thumbnails (editable in admin)
6. **Featured Experiences** — horizontal scroll row of portrait cards (hidden entirely when no trips are configured)
7. Filter bar — filter pills + sort button
8. **Curated list rows** — one section per live list; horizontal scroll with 5 cards visible, prev/next arrows scrolling exactly one page at a time, "See all N trips →" link

**Trip card urgency labels** — one per card maximum, evaluated in priority order:

| Priority | Condition | Label | Colour |
|---|---|---|---|
| 1 | `seats_left` is 1–5 | `ONLY N SPOTS LEFT` | amber-500 |
| 2 | `filling_fast` flag | `FILLING FAST` | amber-500 |
| 3 | Active early-bird discount | `EARLY BIRD N% OFF` | green-600 |
| — | None of the above / sold out | *(empty)* | — |

The `h-4` urgency row is always rendered in the DOM so all cards stay the same height regardless of label presence.

---

## Admin panel (`/admin/landing-page`)

Three tabs, all writing through the REST API and updating the shared store on success.

### Overview tab

Four metric cards (live lists, draft lists, total trips, stale lists >30 days), then the full page structure as an ordered list:

| Row | Type | Behaviour |
|---|---|---|
| 1–4 | Fixed | Announcement bar, Navigation, Hero banner, Brand bar + Search — never draggable |
| 5 | Fixed + Edit | Trending Destinations — opens `TrendingModal` to reorder/add/remove destinations |
| 6 | Fixed + Edit | Featured Experiences — status badge shows **Live** or **Empty**; opens `FeaturedExperiencesModal` |
| 7+ | Draggable | One row per curated list — drag to reorder; saves immediately to DB |

### Manual lists tab

Create, edit, delete, and reorder manual curated lists.

Each card shows the title, status badge, stale-content warning, a trip thumbnail strip (first 5), an inline status dropdown, edit and delete buttons.

**`CreateListModal`** uses a split panel:
- Left — suggestion chips for quick setup, title / slug / status fields, draggable trip-order list
- Right — trip picker with text search + tag filter chips, card grid with checkbox selection

Saving calls the relevant `POST`/`PUT` endpoints, then calls the trips `POST` endpoint for newly added trips and the trips reorder `PUT` for final positions.

### Automatic lists tab

Four configurable templates that describe rule-based lists:

| Template | Rule | Default parameter |
|---|---|---|
| Leaving Soon | `next_batch_within_days` | 14 days |
| Filling Fast | `seats_left_below` | 6 seats |
| Newly Added | `added_within_days` | 30 days |
| Budget Picks | `price_below` | ₹20,000 |

Toggling a switch creates the list record (if it doesn't exist) or updates its `enabled` / `status` fields. Rule evaluation against the actual trip catalogue is not yet implemented server-side — that wiring is left for the real integration.

---

## Featured Experiences

A manually curated horizontal scroll section positioned immediately below Trending Destinations on the landing page. Hidden entirely (no DOM node) when no trips are saved.

**Card anatomy** (`components/FeaturedTripCard.tsx`):

```
┌──────────────────────────────────────┐
│ [category chip — top-left corner]    │  bg #202020, only bottom-right rounded
│   [36 × 36 trip thumbnail] [tag]     │  Rubik Medium 14px
│                                      │
│       (gradient overlay)             │  rgba(17,17,17) fade in/out
│                                      │
│        Trip Title                    │  Kalam Bold 24px
│        Jun 14, 2026                  │  Rubik Regular 14px
│        From ₹42,000/person           │  Rubik Regular 14px
└──────────────────────────────────────┘
```

Width: `288px` desktop · `80vw` mobile. Aspect ratio: `3/4`. Background image scales on hover (`group-hover:scale-105`).

**Admin flow** — `FeaturedExperiencesModal` (split panel: trip picker left, draggable ordered list right). Save dispatches `SET_FEATURED` to the store and writes to `localStorage`.

---

## List detail page (`/zo-trips/list/[slug]`)

Reached from the "See all N trips →" link on any curated list row.

- Sticky mini-header with ← Zo Trips back link and Zostel brand mark
- List title, subtitle, trip-count pill
- Full grid of all trips in the list (no horizontal scroll, standard 5-column grid)
- Returns 404 for unknown slugs or lists that are not `live`
- `<title>` set via `generateMetadata`

---

## File map

```
app/
  layout.tsx                          Root layout — mounts PageStoreProvider
  zo-trips/
    page.tsx                          Server component — fetches live lists
    list/[slug]/
      page.tsx                        List detail page
  admin/landing-page/
    page.tsx                          Admin CMS shell (tabs, sidebar, data fetch)
  api/
    trips/route.ts                    Static seed trip catalogue (12 trips)
    lists/route.ts                    GET all · POST create
    lists/[id]/route.ts               PUT update · DELETE delete
    lists/[id]/trips/route.ts         POST add trip to list
    lists/[id]/trips/[tripId]/route.ts  DELETE remove trip
    lists/[id]/trips/reorder/route.ts PUT bulk reorder trips in a list
    lists/reorder/route.ts            PUT bulk reorder lists on landing page

components/
  ZoTripsPage.tsx                     Consumer landing page (client component)
  TripCard.tsx                        Shared trip card + urgency label logic
  FeaturedTripCard.tsx                Featured Experiences portrait card
  admin/
    AdminOverview.tsx                 Overview tab
    AdminManualLists.tsx              Manual lists tab
    AdminAutoLists.tsx                Automatic lists tab
    CreateListModal.tsx               Create / edit list modal
    TrendingModal.tsx                 Edit trending destinations modal
    FeaturedExperiencesModal.tsx      Edit featured experiences modal

lib/
  pageStore.tsx                       Shared React context store + types
  prisma.ts                           Prisma client singleton

prisma/
  schema.prisma                       DB schema

app/globals.css                       Tailwind v4 @theme tokens, type scale, font imports
```

---

## Design tokens (`app/globals.css`)

All tokens are available as Tailwind utility classes (e.g. `bg-light-background-primary`, `text-dark-text-secondary`).

**Key colours**

| Token | Value | Usage |
|---|---|---|
| `light-background-primary` | `#ffffff` | Page background |
| `light-background-secondary` | `#f5f5f5` | Hover fills |
| `light-text-primary` | `#111111` | Primary text |
| `light-text-secondary` | `#3f3f3f` | Captions, subtitles |
| `light-brand-selections` | `#BF3158` | Brand accent — links, CTAs |
| `light-stroke-primary` | `#e2e2e4` | Borders, dividers |
| `dark-background-primary` | `#111111` | Dark surfaces (card overlays) |
| `dark-text-primary` | `#e8e8e8` | Text on dark surfaces |

**Type scale**

| Class | Size | Weight |
|---|---|---|
| `font-desktoptitle` | 2.5rem | 700 |
| `font-mobiletitle` | 1.75rem | 700 |
| `font-sectiontitle` | 1.25rem | 600 |
| `font-subtitle` | 1rem | 400 |
| `font-body` | 0.875rem | 400 |
| `font-bodyfocus` | 0.875rem | 600 |
| `font-caption` | 0.75rem | 400 |
| `font-bigbutton` | 1rem | 600 |
| `font-smallbutton` | 0.75rem | 600 |

---

## Known limitations / prototype scope

- **Trip catalogue is static.** `GET /api/trips` returns a hardcoded array of 12 trips. A real integration would query a trips microservice or database table.
- **Automatic list rules are not evaluated.** The `rule` and `rule_parameter` fields are stored but no server-side job applies them to populate the list's trips. Matching logic needs to be wired up for production.
- **Trending destinations do not persist across refreshes.** There is no DB table for them; they reset to the default 10 destinations on hard reload. Only `featured` uses `localStorage` for persistence.
- **No authentication.** The admin panel at `/admin/landing-page` is publicly accessible.
- **Images are Unsplash URLs.** They are not managed assets and include CDN query parameters.
