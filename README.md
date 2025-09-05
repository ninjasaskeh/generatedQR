# Gathering Attendance App (Next.js)

A simple attendance app to manage participants and mark check-ins using QR codes. Built with Next.js App Router, Drizzle ORM (Postgres/Neon), and Better Auth.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript, Tailwind CSS
- Drizzle ORM + Neon (serverless Postgres)
- Better Auth (email + password)
- Shadcn/ui, @tanstack/react-table

---

## Getting Started (Local)

Prerequisites:
- Node.js 18+ (or 20+)
- pnpm (recommended) or npm/yarn
- A Postgres database (Neon recommended)

1) Install dependencies
```bash
pnpm install
```

2) Configure environment variables
- Copy `.env.example` to `.env` and fill in values.
```bash
cp .env.example .env
```
- Required:
  - `DATABASE_URL` (Postgres connection string; Neon works great)
- Optional (only for first-time seeding user):
  - `ENABLE_SEED=1` (temporarily enable /api/seed)
  - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`

3) Run database migrations
- Point your `.env` to the DB you want to use locally and push the schema:
```bash
pnpm drizzle:push
```

4) Start the dev server
```bash
pnpm dev
```
Open http://localhost:3000

5) Create the first admin user (one-time)
- Option A: with the seed endpoint (quick)
  - Ensure `ENABLE_SEED=1` is present in `.env`
  - In another terminal:
    ```bash
    curl -X POST http://localhost:3000/api/seed \
      -H 'content-type: application/json' \
      -d '{"email":"admin@admin.com","password":"12345678","name":"Admin"}'
    ```
  - Remove `ENABLE_SEED` from `.env` after success
- Option B: change the Neon DATABASE_URL in your local `.env` to point to your production DB and run `pnpm drizzle:push` and then the seed against your deployed URL later (see Deploy section)

6) Login
- Visit /login and use the seeded credentials

---

## Project Commands
```bash
# dev server
pnpm dev

# build (Turbopack)
pnpm build

# start production server (after build)
pnpm start

# Drizzle migrations
pnpm drizzle:generate
pnpm drizzle:push

# Lint
pnpm lint
```

---

## Deploy on Vercel

1) Create a Neon Postgres database (or any Postgres) and copy its connection string.

2) Create a new Vercel project from this repo.

3) Set Environment Variables (Project Settings → Environment Variables)
- Required:
  - `DATABASE_URL` = your Neon connection string
- Optional (temporary for first user):
  - `ENABLE_SEED` = `1`
  - `SEED_ADMIN_EMAIL` (default: `admin@admin.com`)
  - `SEED_ADMIN_PASSWORD` (default: `12345678`)
  - `SEED_ADMIN_NAME` (default: `Admin`)

4) Prepare your database schema (production)
- The easiest/safest way is to run migrations from your machine pointing to the production DB:
```bash
# In your local clone, set DATABASE_URL to the production connection string
export DATABASE_URL="postgres://..."

pnpm drizzle:push
```
- Alternatively, you can create the schema on a staging DB and promote it later.

5) Deploy
- Push to your default branch; Vercel will build and deploy automatically.
- This repo is configured to allow remote images from `api.qrserver.com` for QR previews.
- The Better Auth client uses a relative base URL, so no extra host configuration is needed.

6) Seed the admin user (production, one-time)
- With `ENABLE_SEED=1` set in Vercel env, call the seed endpoint once (replace with your actual domain):
```bash
curl -X POST https://your-app.vercel.app/api/seed \
  -H 'content-type: application/json' \
  -d '{"email":"admin@admin.com","password":"12345678","name":"Admin"}'
```
- Remove `ENABLE_SEED` from Vercel env afterwards and redeploy (to disable the endpoint).

7) Login
- Go to https://your-app.vercel.app/login and sign in.

---

## Troubleshooting
- Build fails on images domain
  - Ensure `next.config.ts` includes `api.qrserver.com` in `images.remotePatterns` (already added in this repo).
- 401 Unauthorized on dashboard or API
  - Make sure you’ve logged in; cookies must be allowed by the browser.
- 500 on participants API / DB errors
  - Verify `DATABASE_URL` is correct and accessible from Vercel.
  - Confirm migrations were pushed to the same database your app uses.
- Camera scanning doesn’t start
  - Camera access requires HTTPS (Vercel uses HTTPS by default).
  - Some browsers don’t support `BarcodeDetector`; the UI falls back to manual token input.
  - Grant camera permissions and ensure adequate lighting.
- QR preview not visible
  - Vercel must allow the remote image host; this repo allows `api.qrserver.com` via `next.config.ts`.
- Auth client hitting localhost in production
  - Fixed: the client now uses a relative `baseURL` and works both locally and on Vercel.
- Turbopack build issues on Vercel
  - If you hit edge cases with Turbopack, change the build script to `next build` locally and redeploy.

---

## Security Notes
- Disable `ENABLE_SEED` after creating the first user.
- Keep your `DATABASE_URL` secret; don’t commit your `.env`.

---

## License
MIT
