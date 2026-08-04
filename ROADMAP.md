# Roadmap

What exists today, and ideas for what could come next. Nothing here is
committed to — it's a punch list to pick from, not a promise.

## Priorities

Ordered by what actually matters for daily use:

1. **Plant information** — knowing what each plant needs, without typing it in
2. **Schedule + reminders** — what to do, when, for what's actually planted
3. Note-taking and history — useful, but the least important of the three

## What's built (v1)

- **Plantenlijst (144 species)** — a built-in catalogue of common Belgian
  garden vegetables, herbs, fruit and flowers. Search what you bought, tap it,
  and it lands in your Naslag fully filled in: sun, water, soil, spacing,
  sowing/planting/harvest calendar, care intervals with written instructions,
  common problems, and companion planting. No manual entry, no API key, works
  offline. Source of truth is `src/lib/catalog.ts`.
- **Naslag**: your plant encyclopedia — the species you actually grow, grouped
  by category, with "nu zaaien" / "nu oogsten" badges for the current month.
  Everything stays editable after adding, and you can still hand-write a
  species the catalogue doesn't cover.
- **Vandaag**: overdue / due today / coming up, with one-tap "Klaar", a "Hoe?"
  toggle showing the care instructions, and "alles in één keer" shortcuts when
  several plants need the same thing.
- **Noteren**: log one activity (water, feed, prune, harvest, repot) across
  several plants at once, pre-selecting whichever plants are actually due.
- **Mijn planten**: the plants you're growing, each with its own history and
  schedule; archiving keeps history without cluttering Vandaag.
- **Reminders**: push notifications (Android, and iPhone if added to the home
  screen) plus an optional daily email whose recipient is set in-app under
  Instellingen — both driven by one `/api/cron/reminders` endpoint.
- Installable as a PWA with icons and manifest. Dutch UI throughout.
- Starts with 5 species installed (sunflower, tomato, chives, parsley, basil);
  the other 139 are one tap away.

## Near-term, low-effort

- **Grow the catalogue.** 144 species covers most of a Belgian kitchen garden
  and flower bed, but there are still gaps: more fruit trees and soft fruit,
  houseplants, and less common vegetables. Adding an entry is one object in
  `src/lib/catalog.ts` — no migration, no UI work.
- **Add a plant straight from the catalogue.** Right now picking a species
  adds it to Naslag, then you add the actual plant in a second step. A
  "voeg ook toe aan mijn tuin" checkbox in the picker would collapse that
  into one action.
- **Fill gaps with an AI lookup (optional).** For a plant not in the
  catalogue, the app could call Claude to draft the entry and show it for
  review before saving. Needs an Anthropic API key and costs a cent or two
  per plant — worth revisiting only if the catalogue turns out to be missing
  things you actually buy.

- **Photos on log entries.** "This is what the tomato looked like on the day
  it got blight" is exactly the kind of thing worth keeping. Needs image
  upload + storage (Vercel Blob or similar) — a few hours of work.
- **Weather-aware watering.** Skip or push back a watering reminder after
  real rainfall. Needs a weather API (e.g. Open-Meteo, free, no key) keyed to
  your postcode.
- **Undo for "Klaar".** Right now undoing a mis-tap means finding the log
  entry in history and hitting "Wissen" — a toast with a 5-second "Ongedaan
  maken" button would be friendlier.
- **Search/filter in Naslag** once there are more than a handful of species.
- **Quantities on logs** — "2 L water", "half handful of fertilizer granules"
  — for people who like to track exact amounts.

## Medium-effort

- **Multi-user / shared household.** Right now anyone with the link can do
  anything — fine for two people, but there's no login, so "who watered
  this" isn't tracked. Adding lightweight auth (e.g. a shared PIN, or proper
  accounts) would enable per-person history and let each phone manage its
  own push subscription explicitly rather than implicitly by device.
- **Custom schedules per plant, not just per species.** Today, "water every
  2 days" is set once for all tomatoes. A particular pot in full sun might
  need water more often than one in the shade — worth an optional per-plant
  override.
- **Seasonal reminders from the encyclopedia calendar.** "Time to sow
  peterselie indoors" as its own notification, independent of the
  already-planted-things schedule — closes the loop from "what to grow" to
  "what's growing."
- **Bulk actions beyond logging** — archive several plants at once, or
  duplicate a plant record (e.g. "3 basil plants on the same windowsill").

## Bigger swings

- **A "garden map."** A simple visual layout (rows, pots, raised beds) you
  place plants onto, instead of a flat list — much easier to scan at a
  glance once there are 20+ plants.
- **Yield tracking.** Log harvest *amounts* (not just "harvested") and chart
  them over a season — satisfying, and useful for planning next year.
- **Offline support.** The app currently needs a live connection to the
  database for every page. A local-first cache (e.g. via IndexedDB) would
  let the Vandaag list still work from a shed with no signal, syncing once
  back in range.
- **Native app wrapper.** If the PWA ever feels limiting, the same backend
  could sit behind a thin React Native or Capacitor shell for a "real" app
  store presence — but the PWA should be tried for a full season first.

## Known rough edges

- `npm audit` reports 3 high-severity advisories, all inside Next.js's own
  transitive dependencies (`postcss`, `sharp`). npm's suggested "fix" is
  downgrading Next.js to v9 — six years old — which would be far worse than
  the advisories themselves. Worth revisiting next time Next.js ships a
  patch release, not by force-downgrading.
- The Postgres driver logs a harmless SSL-mode deprecation warning on every
  connection (`sslmode=require` will change meaning in a future major
  version of `pg`). Cosmetic today; the fix is switching the connection
  string to `sslmode=verify-full` once that's confirmed compatible with
  Neon's certificates.
- `vercel.json`'s cron schedule (`0 7 * * *`) is in UTC, not Brussels time —
  it fires at 8:00 or 9:00 local depending on daylight saving. Fine for a
  loose "morning" reminder; adjust the hour if you want it pinned exactly.
