# Push to GitHub manually (fix username/token error)

GitHub no longer accepts your account password for `git push`. You use a **Personal Access Token** instead (or SSH). Follow one of these.

---

## Option A: Personal Access Token (simplest)

### 1. Create a token on GitHub

1. Open: **https://github.com/settings/tokens**
2. Click **Generate new token** → **Generate new token (classic)**.
3. Name it something like `CheapRam push`.
4. Expiration: 90 days (or No expiration if you prefer).
5. Under **Scopes**, check **repo** (full control of private repositories).
6. Click **Generate token**.
7. **Copy the token right away** (you won’t see it again). It looks like `ghp_xxxxxxxxxxxx`.

### 2. Create the repo on GitHub (if you haven’t)

1. Go to **https://github.com/new**
2. Repository name: `cheapram`
3. Public, no README.
4. Click **Create repository**.

### 3. Push from your computer

In Terminal (replace `YOUR_GITHUB_USERNAME` with your real username):

```bash
cd /Users/shah/Downloads/CheapRam
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cheapram.git
git push -u origin main
```

When it asks:

- **Username:** your GitHub username  
- **Password:** paste the **token** (not your GitHub password)

After that, the code will be on GitHub.

---

## Option B: SSH key (no password each time)

### 1. Check for an existing key

```bash
ls -la ~/.ssh
```

If you see `id_ed25519.pub` or `id_rsa.pub`, you already have a key. Skip to step 3.

### 2. Create a new key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519 -N ""
```

### 3. Add the key to GitHub

1. Show the public key:  
   `cat ~/.ssh/id_ed25519.pub`  
   (or `cat ~/.ssh/id_rsa.pub` if that’s what you have)
2. Copy the whole line.
3. Go to **https://github.com/settings/keys**
4. **New SSH key** → paste → **Add SSH key**.

### 4. Use SSH when you push

Create the repo at **https://github.com/new** (name: `cheapram`), then:

```bash
cd /Users/shah/Downloads/CheapRam
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/cheapram.git
git push -u origin main
```

No password prompt if SSH is set up correctly.

---

## If you already added the wrong remote

Remove it and add the right one:

```bash
cd /Users/shah/Downloads/CheapRam
git remote remove origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cheapram.git
git push -u origin main
```

Use your real GitHub username in the URL.
