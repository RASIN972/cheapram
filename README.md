# CheapRam

Find the cheapest RAM prices across US retailers. Compare DDR4 and DDR5 memory with optional coupons; monetized via affiliate links and ad placeholders.

## Setup

```bash
npm install
```

Create the database and seed demo data:

```bash
mkdir -p data
npm run refresh-feeds
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel (free)

Vercel doesn’t persist local files, so use **Turso** for the database. Step-by-step: **[DEPLOY.md](DEPLOY.md)**. After deploy you’ll get a link like `https://your-project.vercel.app`.

## Scripts

- `npm run dev` – Start dev server (Turbopack)
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run refresh-feeds` – Update products/prices from feeds (run daily via cron)
- `npm run db:studio` – Open Drizzle Studio to inspect/edit DB

## Publishing on Google

- **Sitemap & robots**: `src/app/sitemap.ts` and `src/app/robots.ts` expose `/sitemap.xml` and `/robots.txt`. Set `NEXT_PUBLIC_APP_URL` (or `VERCEL_URL` is used automatically) so links use your production domain.
- **Search Console**: After going live, add your site at [Google Search Console](https://search.google.com/search-console), verify via the HTML meta tag, then set `GOOGLE_SITE_VERIFICATION` in env and submit your sitemap URL (e.g. `https://yourdomain.com/sitemap.xml`).

## Data

- **Demo**: With no affiliate env set, the refresh script seeds 5 mock RAM listings so the site works out of the box.
- **Production**: When any real feed is configured (`NEWEGG_FEED_URL` or Amazon PA-API keys), mock data is **not** seeded; only real retailer data is shown.
- **Newegg**: Set `NEWEGG_FEED_URL` to the product feed URL from your Newegg affiliate dashboard (Memory/RAM). Optionally set `NEWEGG_AFFILIATE_ID`. Feed can be CSV or XML; the app parses and filters for RAM.
- **Amazon**: Set `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, and `AMAZON_TAG` (from [Amazon Associates](https://affiliate-program.amazon.com) and PA-API access). The app uses Product Advertising API 5.0 to search for RAM and ingest results.
- **Coupons**: Add rows to the `coupons` table (e.g. via DB Studio). The UI shows coupon codes when present.

## Monetization

- **Affiliate**: Every “Check price” link uses the product’s affiliate URL (from feeds or built with your tag). Disclosed in the footer.
- **Ads**: `AdSlot` components are placeholders; replace with your ad unit (e.g. AdSense) when approved.

## Env

Copy `.env.example` to `.env` and fill as needed.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Production URL for sitemap, robots, and metadata (e.g. `https://yourdomain.com`) |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification meta tag content |
| `DATABASE_PATH` | SQLite file path (default: `./data/cheapram.sqlite`) |
| `NEWEGG_FEED_URL` | Newegg affiliate product feed URL (CSV/XML) |
| `NEWEGG_AFFILIATE_ID` | Optional Newegg affiliate id for display |
| `AMAZON_ACCESS_KEY` | Amazon PA-API access key |
| `AMAZON_SECRET_KEY` | Amazon PA-API secret key |
| `AMAZON_TAG` | Amazon Associate tag (e.g. `yoursite-20`) |
| `AMAZON_REGION` | PA-API region (default: `us-east-1`) |
