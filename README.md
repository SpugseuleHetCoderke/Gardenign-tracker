# Tuin 🌱

A gardening tracker for keeping track of what's planted and a schedule that
tells you what needs doing today and how to do it. Built for a household of
two, in Dutch.

The core idea: you shouldn't have to type in horticultural knowledge. The app
ships with a **catalogue of 96 common Belgian garden plants** — search what you
bought, tap it, and everything (sun, water, soil, sowing/harvest calendar, care
intervals with instructions, common problems, companion planting) is filled in
for you. From there the schedule builds itself.

See [ROADMAP.md](./ROADMAP.md) for what's built and what could come next.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Prisma + Postgres (Neon) ·
Resend (email) · Web Push (Android notifications) · Vitest + Playwright.

## Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — a free Postgres database from [neon.tech](https://neon.tech).
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — generate with
  `npx web-push generate-vapid-keys`, needed for push notifications.
- Everything else is optional (email backup, cron secret) — see the comments
  in `.env.example`.

Then:

```bash
npm run db:migrate   # creates the tables
npm run db:seed      # loads the 5 starter species (sunflower, tomato, chives, parsley, basil)
npm run dev           # http://localhost:3000
```

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run db:studio` | Browse/edit the database in a GUI |
| `npm run db:seed` | Re-apply the starter species (safe to re-run — updates in place, never touches your plants) |
| `npm run reminders:send` | Send today's push/email reminders right now, from your machine |
| `npm test` | Unit tests (scheduling math, date logic) |
| `npm run test:e2e` | End-to-end tests against a running dev server + real database |
| `npm run build` | Production build |

## Deploying

This is built for [Vercel](https://vercel.com) (zero-config for Next.js) plus
[Neon](https://neon.tech) for the database — both have workable free tiers.

1. Push this repo to GitHub.
2. Import it on [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env` to the Vercel project
   settings (Settings → Environment Variables).
4. Deploy. `vercel.json` already schedules the daily reminder job
   (`/api/cron/reminders`) via Vercel Cron — no extra setup needed once
   deployed on a plan that supports cron (the Hobby/free plan allows one
   cron job per day, which is exactly what this needs).
5. On the phone that should get notifications: open the deployed URL in
   Chrome, tap "Aanzetten" on the notifications banner, and (recommended)
   add the app to the home screen via the browser menu so it behaves like a
   real app.

## Project structure

- `src/app/` — pages (Vandaag, Noteren, Mijn planten, Naslag) and server
  actions (`actions.ts`).
- `src/lib/care.ts` / `schedule-math.ts` — the scheduling logic: when
  something is next due, derived from the last matching log entry. No
  "due date" is ever stored — it's always recomputed, so editing a care
  interval updates every reminder instantly.
- `src/lib/email.ts` / `push.ts` — the two reminder channels.
- `src/lib/catalog.ts` — **the plant catalogue**: 96 species with all their
  horticultural data. This is the single source of truth for plant info; the
  seed script and the "add from catalogue" action both read from it. Adding a
  plant is one object in the `CATALOG` array — no migration needed.
- `prisma/schema.prisma` — data model. `prisma/seed.ts` — installs the five
  starter species by copying them out of the catalogue.
- `tests/e2e/` — Playwright specs; `src/**/*.test.ts` — Vitest unit tests.
