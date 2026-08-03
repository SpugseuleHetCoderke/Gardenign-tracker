# Roadmap

What exists today, and ideas for what could come next. Nothing here is
committed to — it's a punch list to pick from, not a promise.

## What's built (v1)

- **Vandaag**: overdue / due today / coming up, grouped by task, with
  one-tap "Klaar" and a "Hoe?" toggle showing the care instructions.
- **Noteren**: log one activity (water, feed, prune, harvest, repot) across
  several plants at once, pre-selecting whichever plants are actually due.
- **Mijn planten**: the plants you're actually growing, each with its own
  history and schedule; archiving keeps history without cluttering Vandaag.
- **Naslag**: an encyclopedia of plant *types* — sun, water, soil, spacing,
  sowing/planting/harvest calendar, common problems, companion planting —
  separate from the *individual plants* in your garden. Adding a new species
  here immediately makes it available everywhere else in the app.
- **Reminders**: push notifications (Android, and iPhone if added to the
  home screen) plus an optional daily email, both driven by one shared
  `/api/cron/reminders` endpoint.
- Seeded with 5 starter species — sunflower, tomato, chives, parsley, basil —
  written for a Belgian climate and garden. All text is editable from the
  app itself (Naslag → soort bewerken).

## Near-term, low-effort

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
