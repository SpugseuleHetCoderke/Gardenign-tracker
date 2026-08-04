@AGENTS.md

# Tuin — gardening tracker

A personal gardening app for one household in Belgium. Two people use it, on
phones. It answers "what needs doing in the garden today, and how do I do it",
and it holds the reference knowledge for the plants they grow.

Deployed on Vercel at `gardenign-tracker.vercel.app`, backed by one Neon
Postgres database. Pushing to `main` deploys automatically.

## Priorities, in order

The owner has stated these explicitly. Respect the ordering when trading off:

1. **Plant information** — knowing what a plant needs, *without typing it in*
2. **Schedule + reminders** — what to do when, for what's actually planted
3. Note-taking / history — useful, but the least important of the three

A change that makes adding a plant require more manual data entry is moving in
the wrong direction, even if it's technically cleaner.

## Language convention — this matters

- **All user-facing text is Dutch (Flemish).** Every label, button, message,
  error, and every word of plant advice.
- **Route segments are Dutch too**: `/planten`, `/soorten`, `/loggen`,
  `/instellingen`, `/soorten/toevoegen`, `/planten/[id]/bewerken`. There is no
  English route. Don't add one.
- **Code, identifiers, comments, and commit messages are English.**
- Species `slug`s are English (`courgette`, `rode-biet`) because they're
  stable keys; the `name` field is Dutch and is what users see.
- Dates format with `nl-BE` via `src/lib/format.ts`. Don't hand-roll date
  formatting.

## Architecture

### The schedule is derived, never stored

There is no "due date" column anywhere. A task's due date is always computed:

```
due = (date of last log of that activity, else plantedDate, else createdAt) + intervalDays
```

`src/lib/schedule-math.ts` holds that math as pure functions (no DB, unit
tested). `src/lib/care.ts` fetches from Postgres and calls into it. This is why
editing a care interval instantly changes every reminder, and why there is
nothing to keep in sync. **Do not add a stored due date.**

### The plant catalogue is the source of truth for plant data

`src/lib/catalog.ts` contains 144 plants (vegetables, herbs, fruit, flowers)
with full horticultural data for a Belgian climate. It is a **read-only
library, not database rows.**

- Picking an entry in the UI *copies* it into the `Species` table, so the
  user's Naslag means "the plants we actually grow" — not 144 things they don't.
- Because it's a copy, editing a species afterwards never touches the
  catalogue.
- `prisma/seed.ts` installs the five starter species by reading from the
  catalogue. It does not duplicate the data.
- **To add a plant to the catalogue**: add one object to the `CATALOG` array.
  No migration, no UI work, no schema change. `toSpeciesInput()` maps it to
  Prisma. This is the most common change requested — it's a one-file edit.

Month ranges in the catalogue are `[from, to]` tuples, 1-indexed (1 = January),
and may wrap the year (`[11, 2]` = November–February). `monthRange()` and
`monthInRange()` in `src/lib/format.ts` handle the wrap; don't reimplement it.

### The server-only / client-safe split — read this before importing

`src/lib/care.ts` imports `"server-only"`. If a client component imports it,
the build fails with a cryptic `Can't resolve 'dns'` error, because it drags the
Postgres driver into the browser bundle. This actually happened during
development.

| Import from | When |
|---|---|
| `@/lib/care` | Server components and server actions — DB queries |
| `@/lib/care-shared` | Client components — types, `ACTIVITY_LABELS`, `dueLabel()`, `plantLabel()` |
| `@/lib/species-labels` | Anywhere — plain lookup tables, no DB |
| `@/lib/format` | Anywhere — date/month formatting |

`src/lib/prisma.ts`, `care.ts`, `email.ts`, and `push.ts` are all
`server-only`. Client components (`"use client"`) must never import them.

### Mutations are Server Actions, not API routes

All writes live in `src/app/actions.ts` and are called directly from forms or
client components. The only API route is `src/app/api/cron/reminders/route.ts`,
which exists because an external scheduler (Vercel Cron) has to reach it over
HTTP; it's protected by a `CRON_SECRET` bearer token.

`saveEmailSettings` uses `useActionState` and **returns** errors rather than
throwing, so a typo'd email address shows an inline message instead of Next.js's
error page. Follow that pattern for anything user-facing.

### Routes

| Route | Purpose |
|---|---|
| `/` | Vandaag — overdue / due today / coming up, one-tap "Klaar" |
| `/loggen` | Noteren — log one activity across many plants at once |
| `/planten` | Mijn planten — the plants being grown |
| `/planten/nieuw` | Add a plant (picks a species) |
| `/planten/[id]` | Plant detail: schedule, history, log form |
| `/planten/[id]/bewerken` | Edit / archive / delete a plant |
| `/soorten` | Naslag — the plant encyclopedia, grouped by category |
| `/soorten/toevoegen` | **Pick from the 96-plant catalogue** (primary way to add) |
| `/soorten/nieuw` | Hand-write a species the catalogue lacks (~20 fields) |
| `/soorten/[slug]` | Species detail: calendar, care, problems, companions |
| `/soorten/[slug]/bewerken` | Edit a species |
| `/instellingen` | Email reminder on/off + recipient address |
| `/handleiding` | Visual how-to-use guide, built from mockups of the other screens — linked from Instellingen. Static content, no DB reads. |

Every page that reads the schedule sets `export const dynamic = "force-dynamic"`
— the output depends on today's date and must never be cached at build time.

### Data model

| Model | Role |
|---|---|
| `Species` | A *kind* of plant (tomato). Reference data + encyclopedia content. |
| `CareRule` | One recurring task for a species: activity + interval + **written instructions**. Unique per (species, activity). |
| `PlantInstance` | An actual plant being grown. `active: false` = archived (keeps history, drops off the schedule). |
| `LogEntry` | Something that was done. The schedule derives entirely from these. |
| `PushSubscription` | One browser's Web Push registration. No login system, so one row per device. |
| `Settings` | Single fixed-id row (`"singleton"`) for app-wide preferences. |

`CareRule.instructions` is the *how* shown on the task card and in reminders.
It's the most valuable field in the schema — never leave it as a placeholder.

## Reminders

One endpoint (`/api/cron/reminders`) drives both channels, so they can't
disagree:

- **Web Push** (primary) — `src/lib/push.ts`, VAPID keys, service worker at
  `public/sw.js`. Prunes dead subscriptions on 404/410.
- **Email** (optional backup) — `src/lib/email.ts` via Resend. Recipient and
  on/off come from the `Settings` row, **not** from an env var, so they're
  changeable in-app without a redeploy.

`vercel.json` schedules the cron at `0 7 * * *` — that's **UTC**, so it fires
08:00 or 09:00 Brussels time depending on DST.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Runs `prisma generate` first — needed, the client is gitignored |
| `npm test` | Vitest unit tests (scheduling math, date logic). Fast, no DB. |
| `npm run test:e2e` | Playwright. **Hits the real database** — see hazards below. |
| `npm run db:seed` | Re-installs the 5 starter species from the catalogue. Safe to re-run; updates in place, never touches user plants or logs. |
| `npm run db:migrate` | `prisma migrate dev` — **destructive risk, see below** |
| `npm run db:studio` | Browse the DB in a GUI |
| `npm run reminders:send` | Send today's reminders now, from your machine |

After changing `prisma/schema.prisma`, run `npx prisma generate` before
typechecking — otherwise `tsc` reports missing enums/models that do exist.

## Hazards — read before running anything destructive

**There is one database, and it is production.** No separate dev database
exists. That makes three things risky:

1. **`npm run db:migrate` against production.** A bad migration takes the live
   app down. If schema changes are needed, say so and let the owner decide
   when to run it — don't run it unprompted, and never from a phone session.
2. **`npm run test:e2e` runs against the live DB.** `tests/e2e/helpers.ts`
   issues `DELETE FROM "PlantInstance"` / `"Species"` for rows whose name
   starts with `[e2e]`. Blast radius is limited to that prefix, but don't run
   the suite casually, and never widen that prefix filter.
3. **`npm run reminders:send` sends real notifications** to real devices and a
   real inbox. Not a dry run.

Unit tests (`npm test`) touch nothing and are always safe.

`.env` is gitignored and holds production credentials (Neon URL, VAPID private
key, Resend key, cron secret). Never commit it, never paste its contents into
chat or a PR description. `.env.example` documents the variables.

## Conventions

- **Tailwind with CSS custom properties** for theming (`src/app/globals.css`).
  Use the semantic tokens — `bg-surface`, `text-muted`, `border-border-soft`,
  `text-accent`, `text-overdue` — not raw colours. Light and dark both work;
  don't hard-code either.
- **Mobile-first.** Interactive targets get `min-h-11` (44px) minimum. The
  layout is capped at `max-w-lg` with a bottom nav. Assume a phone.
- **`git commit` identity**: this repo is configured to commit as
  `SpugseuleHetCoderke <311799315+SpugseuleHetCoderke@users.noreply.github.com>`.
  Vercel blocks deploys from commit authors it can't match to the GitHub
  account, so don't change it.
- Prefer editing `src/lib/catalog.ts` over adding schema fields when the
  request is "the app should know X about plants".
