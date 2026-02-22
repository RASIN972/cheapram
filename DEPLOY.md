# Deploy CheapRam on Vercel (free)

Vercel’s serverless environment doesn’t keep a local SQLite file, so the app uses **Turso** (free tier) when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set. Follow these steps to get your live link.

---

## 1. Push your code to GitHub

```bash
cd /Users/shah/Downloads/CheapRam
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on [GitHub](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Create a Turso database (free)

1. Sign up at [turso.tech](https://turso.tech).
2. Install the CLI: `curl -sSfL https://get.turso.tech/install.sh | bash`
3. Log in: `turso auth login`
4. Create a DB: `turso db create cheapram --region iad` (or pick a [region](https://turso.tech/docs/reference/db-regions) near you)
5. Get credentials:
   - **URL**: `turso db show cheapram --url`
   - **Token**: `turso db tokens create cheapram` (copy it once; it won’t be shown again)

---

## 3. Apply the schema to Turso

From your project directory:

```bash
export TURSO_DATABASE_URL="libsql://cheapram-YOUR_USER.turso.io"
export TURSO_AUTH_TOKEN="your-token-here"
npx drizzle-kit push
```

Use the real URL from step 2. This creates the tables in Turso.

---

## 4. Seed data (optional)

To have demo data on first deploy, run the refresh script once with Turso env set:

```bash
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
npm run refresh-feeds
```

---

## 5. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New Project** → import your GitHub repo (e.g. CheapRam).
3. Leave **Build Command** as `npm run build` and **Output Directory** as default.
4. In **Environment Variables**, add:

   | Name                 | Value                    |
   |----------------------|--------------------------|
   | `TURSO_DATABASE_URL` | Your Turso DB URL         |
   | `TURSO_AUTH_TOKEN`   | Your Turso auth token     |
   | `NEXT_PUBLIC_APP_URL`| `https://your-project.vercel.app` (optional; set after first deploy, then redeploy) |

5. Click **Deploy**. When it finishes, you’ll get a link like `https://cheapram-xxx.vercel.app`.

---

## 6. (Optional) Secure the cron and set your real URL

- In Vercel → Project → **Settings** → **Environment Variables**, add:
  - `CRON_SECRET` = a long random string (e.g. from `openssl rand -hex 32`).
- In **Settings** → **Environment Variables**, set `NEXT_PUBLIC_APP_URL` to your real URL (e.g. `https://cheapram-xxx.vercel.app`) and redeploy so the sitemap and metadata use it.

The repo includes a **Vercel Cron** that hits `/api/cron/refresh` daily (6:00 UTC) to refresh product data. Vercel Cron is available on the Pro plan; on the free plan you can call that URL from an external cron (e.g. [cron-job.org](https://cron-job.org)) with header `Authorization: Bearer YOUR_CRON_SECRET`.

---

## Next steps after you have the link

1. **Google**: Add the site in [Google Search Console](https://search.google.com/search-console), verify with the HTML tag, set `GOOGLE_SITE_VERIFICATION` in Vercel env, and submit `https://your-site.com/sitemap.xml`.
2. **Affiliates**: Sign up for [Newegg](https://www.newegg.com) and [Amazon Associates](https://affiliate-program.amazon.com), get your feed URL and PA-API keys, then add `NEWEGG_FEED_URL`, `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_TAG` (and optionally `NEWEGG_AFFILIATE_ID`, `AMAZON_REGION`) in Vercel. Redeploy so the cron uses them.
3. **Custom domain**: In Vercel → **Settings** → **Domains**, add your domain and follow the DNS steps.
