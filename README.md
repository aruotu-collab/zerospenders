# ZeroSpenders

**Before you pay, check FREE.**

Live intelligence board for £0 opportunities — free samples, days out, food, trials, courses, creator drops and brand campaigns.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Neon Postgres + Prisma
- Auth.js (email/password, Member / Creator / Brand roles)

## Run locally

```bash
npm install
cp .env.example .env   # or use existing .env.local
npm run db:setup
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or 3000).

## Scripts

- `npm run db:push` — sync Prisma schema to Neon
- `npm run db:seed` — seed signals, drops, pulse metrics
- `npm run db:setup` — push + seed

## What’s included

- LIVE intelligence homepage backed by Postgres
- Category boards, signal detail, near-me, creators, brands
- Auth + dashboard with real claims / watches / cancel reminders
- `/api/signals` and Auth.js `/api/auth/*`
