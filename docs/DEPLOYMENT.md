# Deployment Guide

This guide walks through deploying **Kurigram Nursery Registry** to production.

> For build instructions, see [`BUILD_GUIDE.md`](../BUILD_GUIDE.md).
> For the data model, see [`DATA_SCHEMA.md`](./DATA_SCHEMA.md).

---

## Table of Contents

- [Option A: Vercel (Recommended)](#option-a-vercel-recommended)
- [Option B: Self-Host with Bun + Caddy](#option-b-self-host-with-bun--caddy)
- [Option C: Docker](#option-c-docker)
- [Option D: Static Export (Limited)](#option-d-static-export-limited)
- [Environment Variables Reference](#environment-variables-reference)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Option A: Vercel (Recommended)

Vercel is the native deployment target for Next.js and offers the simplest path to production.

### Step 1 — Push to GitHub

Ensure your repository is pushed to GitHub. The canonical repository is:
```
https://github.com/moniruzjaman/kurigram_nursery_registry
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Sign in with GitHub.
3. Click **Import Project** → select the `kurigram_nursery_registry` repository.

### Step 3 — Configure Build Settings

Vercel auto-detects Next.js from `vercel.json`. Confirm the following:

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `next build` |
| Install command | `npm install` |
| Output directory | `.next` |

These are pre-configured in [`vercel.json`](../vercel.json):

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### Step 4 — Set Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Name | Value | Required |
|------|-------|----------|
| `DATABASE_URL` | Your Vercel Postgres connection string | Only if using Prisma |

> **Note:** The default deployment serves `src/lib/nursery-data.json` via the `/api` route and does **not** require a database. Set `DATABASE_URL` only if you plan to extend the Prisma schema and persist user-generated data.

### Step 5 — Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Build the project (`next build`)
3. Deploy to a global CDN
4. Provide a `*.vercel.app` URL

### Step 6 — Custom Domain (optional)

1. In Vercel, go to **Settings → Domains**.
2. Add your custom domain (e.g., `nursery.kurigram.gov.bd`).
3. Follow Vercel's DNS instructions to point your domain to Vercel.
4. HTTPS is provisioned automatically via Let's Encrypt.

### Step 7 — (Optional) Enable Vercel Postgres

If you need persistent storage:

1. In Vercel, go to **Storage → Create Database → Postgres**.
2. Name it `kurigram-nursery-db`.
3. Once created, Vercel auto-injects `DATABASE_URL` and related env vars.
4. Update `prisma/schema.prisma` to use `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Run the migration locally with the Vercel Postgres connection string:
   ```bash
   bun run db:generate
   bun run db:push
   ```
6. Commit the updated `schema.prisma` and redeploy.

---

## Option B: Self-Host with Bun + Caddy

Useful for on-premises deployments, government servers, or environments where Vercel is not available.

### Step 1 — Provision a server

- **OS:** Ubuntu 22.04 LTS or newer
- **RAM:** 1 GB minimum (the app is lightweight)
- **Disk:** 10 GB minimum
- **Ports:** 80 (HTTP), 443 (HTTPS), 22 (SSH)

### Step 2 — Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version   # 1.3.x or newer
```

### Step 3 — Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### Step 4 — Clone & build the app

```bash
cd /var/www
sudo git clone https://github.com/moniruzjaman/kurigram_nursery_registry.git
sudo chown -R $USER:$USER kurigram_nursery_registry
cd kurigram_nursery_registry
bun install --frozen-lockfile
bun run build
```

### Step 5 — Run the app as a systemd service

Create `/etc/systemd/system/kurigram-nursery.service`:

```ini
[Unit]
Description=Kurigram Nursery Registry (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kurigram_nursery_registry
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/home/www-data/.bun/bin/bun /var/www/kurigram_nursery_registry/.next/standalone/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kurigram-nursery
sudo systemctl start kurigram-nursery
sudo systemctl status kurigram-nursery
```

### Step 6 — Configure Caddy

Edit `/etc/caddy/Caddyfile` (or replace with the project's [`Caddyfile`](../Caddyfile)):

```caddy
nursery.example.gov.bd {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Caddy will automatically provision an HTTPS certificate via Let's Encrypt.

---

## Option C: Docker

Useful for containerized environments (Kubernetes, ECS, Nomad).

### Step 1 — Create a `Dockerfile`

The project does not ship a Dockerfile, but the following works with the standalone build output:

```dockerfile
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.3-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

### Step 2 — Build the image

```bash
docker build -t kurigram-nursery-registry:latest .
```

### Step 3 — Run the container

```bash
docker run -d \
  --name kurigram-nursery \
  -p 3000:3000 \
  --restart unless-stopped \
  kurigram-nursery-registry:latest
```

### Step 4 — Verify

```bash
curl http://localhost:3000/api | head -20
```

### Optional — Docker Compose

```yaml
version: '3.9'
services:
  web:
    image: kurigram-nursery-registry:latest
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      # - DATABASE_URL=postgresql://user:pass@db:5432/nursery
  # db:
  #   image: postgres:16-alpine
  #   environment:
  #     POSTGRES_USER: user
  #     POSTGRES_PASSWORD: pass
  #     POSTGRES_DB: nursery
  #   volumes:
  #     - pgdata:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"
# volumes:
#   pgdata:
```

---

## Option D: Static Export (Limited)

The app is **not** designed for static export because:

- The `/api` route serves the dataset dynamically (though the data is static, the route itself requires a server).
- The frontend uses `'use client'` for interactivity.

If you need a fully static version (e.g., for offline field use), use the **pre-built PWA bundle** in [`download/`](../download/):

- `download/bangladesh_nursery_pwa.html` — a single-file Progressive Web App with the dataset embedded.
- `download/seed_data.json` — seed data for offline use.

Open the HTML file directly in a browser, or host it on any static file server (nginx, GitHub Pages, S3).

---

## Environment Variables Reference

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `DATABASE_URL` | `file:./custom.db` | Only for Prisma usage | Prisma connection string. SQLite file path for local, Postgres URL for production. |
| `NODE_ENV` | `development` | Yes (set to `production` in prod) | Node environment. |
| `PORT` | `3000` | No | Port the standalone server listens on. |
| `NEXT_TELEMETRY_DISABLED` | unset | No | Set to `1` to disable Next.js telemetry. |

No API keys, no third-party service credentials — the project is intentionally zero-cost.

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] **Homepage loads:** visit the deployed URL — the dashboard should show 137 nurseries.
- [ ] **API responds:** `curl https://your-domain/api | head -20` returns valid JSON.
- [ ] **Filters work:** search for an upazila (e.g., `উলিপুর`) and confirm the list narrows.
- [ ] **Map view renders:** switch to the Map tab — OpenStreetMap should load with nursery pins.
- [ ] **Detail dialog opens:** click any nursery row — a dialog should appear with full inventory.
- [ ] **Mobile responsive:** open on a phone or narrow the browser — the layout should adapt.
- [ ] **HTTPS works:** confirm the lock icon is present in the browser address bar.
- [ ] **Logs are clean:** check Vercel function logs or `journalctl -u kurigram-nursery` for errors.
- [ ] **Dataset integrity:** total nurseries = 137, total plants ≈ 1.18M (visible in dashboard stats).

---

## Troubleshooting

### Build fails on Vercel

- Ensure `vercel.json` matches the project (it should — committed in repo).
- Check that `package.json` has no platform-specific dependency issues.
- If `sharp` fails to install, add `"sharp": "^0.34.3"` to `optionalDependencies` (already present in `dependencies`).

### `/api` returns 500

- Locally: check that `src/lib/nursery-data.json` exists and is valid JSON.
- On Vercel: check function logs. The route is in `src/app/api/route.ts` and imports the JSON statically — it should always work.

### Map view is blank

- OpenStreetMap tile servers may be blocked by your network. Allow `*.tile.openstreetmap.org` in your firewall.
- If you're in a region where OSM is censored, consider switching to an alternative tile provider in `src/app/page.tsx`.

### Prisma connection errors (Postgres)

- Verify `DATABASE_URL` is set in the environment.
- Ensure the Postgres server allows connections from your deployment IP.
- Run `bun run db:push` with the same `DATABASE_URL` to create tables.

### Caddy returns 502 Bad Gateway

- Ensure the systemd service is running: `sudo systemctl status kurigram-nursery`.
- Check that port 3000 is listening: `curl http://localhost:3000/api`.
- Review Caddy logs: `sudo journalctl -u caddy -f`.

### Performance issues

- The `/api` route returns the entire dataset (~450 KB) in one request. This is fine for 137 nurseries, but if the dataset grows significantly, consider:
  - Implementing pagination on `/api`
  - Moving to server-side filtering with query parameters
  - Using Vercel Edge Config or KV for caching

---

## Backup & Recovery

### Dataset backup

The dataset is version-controlled in `src/lib/nursery-data.json`. Git history provides full audit trail — no separate backup needed.

### Database backup (if using Prisma)

**SQLite:**
```bash
cp db/custom.db backups/custom-$(date +%Y%m%d).db
```

**Postgres:**
```bash
pg_dump "$DATABASE_URL" > backups/nursery-$(date +%Y%m%d).sql
```

Schedule via cron for daily backups.

---

## Security Notes

- **No secrets in code:** The project intentionally uses no API keys, no third-party credentials.
- **HTTPS enforced:** Both Vercel and Caddy terminate TLS automatically.
- **`.env` is gitignored:** Never commit environment files. (If you fork, ensure your `.env` stays local.)
- **Read-only by default:** The `/api` route only serves data — there are no write endpoints in the default deployment.
- **PII considerations:** The dataset contains owner names and mobile numbers. If you redeploy with updated data, ensure you have consent to publish this information.
