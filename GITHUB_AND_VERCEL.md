# Push to GitHub and deploy on Vercel

**You need Turso for Vercel.** Vercel is serverless and doesn’t save files, so the app uses Turso as the database when you set the env vars. No Turso = no persistent data on Vercel.

---

## 1. Create the repo on GitHub

1. Open [github.com/new](https://github.com/new).
2. Repository name: e.g. `cheapram`.
3. Public, no README (you already have one).
4. Click **Create repository**.

---

## 2. Push this project from your machine

In a terminal (in the CheapRam folder):

```bash
cd /Users/shah/Downloads/CheapRam
git init
git add .
git commit -m "Initial commit: CheapRam"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cheapram.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` and `cheapram` with your GitHub username and repo name.

---

## 3. Create Turso DB and get URL + token

1. Sign up: [turso.tech](https://turso.tech)
2. Install CLI: `curl -sSfL https://get.turso.tech/install.sh | bash`
3. Login: `turso auth login`
4. Create DB: `turso db create cheapram --region iad`
5. Get URL: `turso db show cheapram --url`
6. Create token: `turso db tokens create cheapram` (copy the token once)
7. Push schema:  
   `TURSO_DATABASE_URL="<paste-url>" TURSO_AUTH_TOKEN="<paste-token>" npx drizzle-kit push`
8. (Optional) Seed:  
   `TURSO_DATABASE_URL="<url>" TURSO_AUTH_TOKEN="<token>" npm run refresh-feeds`

---

## 4. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. **Add New…** → **Project**.
3. **Import** the `cheapram` repo (or the one you created).
4. Leave **Build Command** as `npm run build`, **Output Directory** default.
5. In **Environment Variables** add:

   - **Name:** `TURSO_DATABASE_URL`  
     **Value:** your Turso URL (e.g. `libsql://cheapram-xxx.turso.io`)

   - **Name:** `TURSO_AUTH_TOKEN`  
     **Value:** your Turso token

6. Click **Deploy**.

When the build finishes, Vercel will show your live link (e.g. `https://cheapram-xxx.vercel.app`). That’s your site; the app will use Turso for data.

---

## 5. (Optional) Set the real site URL

After the first deploy:

1. In Vercel → your project → **Settings** → **Environment Variables**.
2. Add **`NEXT_PUBLIC_APP_URL`** = `https://your-actual-vercel-url.vercel.app`.
3. **Redeploy** so sitemap and metadata use the correct URL.
