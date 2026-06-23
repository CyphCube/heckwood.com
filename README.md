# Heckwood

An app-like podcast aggregator: browse curated shows, follow favorites, and a
persistent player that keeps playing while you navigate and resumes every
episode where you left off.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Clerk (auth) ·
Cloudflare Pages + D1 (data). Show/episode data is fetched from RSS at build
time by `fetch-feeds.js` and bundled into the app.

## Local development

```bash
npm install
npm run dev          # fetches feeds, then starts Next on http://localhost:3000
```

`npm run dev`/`build` run `fetch-feeds.js` first, which writes
`data/podcasts/*.json` and the bundled `data/podcasts/_all.js`.

Without any Clerk/D1 configuration the app runs fine in **local-only mode** —
favorites and listening history are stored in the browser (localStorage). Add
Clerk + D1 to make them per-account and cross-device.

## Adding / removing shows

Edit the `SHOWS` array in `fetch-feeds.js`, then re-run `npm run feeds`.

## Auth — Clerk (Google + Facebook)

1. Create an app at <https://dashboard.clerk.com>.
2. Enable **Google** and **Facebook** under *User & Authentication → Social
   Connections*.
3. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```
4. Restart `npm run dev`. A **Sign in** button appears in the top bar; signed-in
   users get a Clerk account menu. (Apple sign-in can be added later — it needs
   a $99/yr Apple Developer membership.)

## Data — Cloudflare D1

```bash
npx wrangler login
npx wrangler d1 create heckwood-db          # paste the database_id into wrangler.toml
npm run db:migrate:local                     # apply migrations to the local D1
npm run db:migrate                           # apply migrations to the remote D1
```

The schema lives in `migrations/`. Favorites and history are keyed by the Clerk
user id; Clerk owns the identity, D1 owns the app data.

## Deploy — Cloudflare Pages

```bash
npm run pages:build     # fetch feeds → next build → next-on-pages bundle
npm run pages:deploy    # build + wrangler pages deploy
```

Or connect the repo in the Cloudflare dashboard with:

- **Build command:** `npm run pages:build`
- **Build output directory:** `.vercel/output/static`
- **Compatibility flag:** `nodejs_compat`
- **Bindings:** D1 database `DB` → `heckwood-db`
- **Environment variables:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

`npm run pages:dev` runs the built bundle locally against a local D1 binding.
