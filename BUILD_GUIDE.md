# Kurigram Nursery Registry — Build & Deployment Guide

This guide covers building, deploying, and operating the **Kurigram Nursery Registry** web application (Next.js 16 + React 19 + Prisma).

> For an architectural overview, see [`README.md`](README.md).
> For step-by-step cloud deployment, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 1. Prerequisites

| Tool | Version | Required for |
|------|---------|---------------|
| **Node.js** | `>= 20.x` | Running `npm` scripts |
| **Bun** | `>= 1.3.x` (recommended) | Matches committed `bun.lock`; faster install |
| **Git** | any modern | Cloning / contributing |
| **Python** | `>= 3.10` | Only for `skills/` helper scripts and the pylint CI workflow |

Verify Bun:

```bash
bun --version
# 1.3.x or newer
```

Verify Node:

```bash
node --version
# v20.x or newer
```

---

## 2. Project Setup

### 2.1 Clone

```bash
git clone https://github.com/moniruzjaman/kurigram_nursery_registry.git
cd kurigram_nursery_registry
```

### 2.2 Install dependencies

```bash
# Recommended (uses committed bun.lock)
bun install

# Or with npm
npm install
```

### 2.3 Configure environment

```bash
cp .env.example .env
```

Default contents of `.env.example`:

```bash
# Database (Prisma — SQLite for local, PostgreSQL for Vercel)
DATABASE_URL="file:./custom.db"

# Optional: Vercel Postgres
# DATABASE_URL="postgres://user:password@host:5432/dbname"
```

For local development the SQLite default works out of the box — no further configuration needed.

### 2.4 (Optional) Initialize Prisma database

The default deployment serves the bundled static dataset (`src/lib/nursery-data.json`) and does not require Prisma. If you intend to extend the schema and persist user-generated data, initialize the DB:

```bash
bun run db:generate    # Generate Prisma client from schema.prisma
bun run db:push        # Create SQLite tables (file:./db/custom.db)
```

---

## 3. Development Server

```bash
bun run dev
# → http://localhost:3000
```

The dev script tees output to `dev.log` for debugging. Hot reload is enabled by default.

### Verify the API

```bash
curl http://localhost:3000/api | head -50
```

You should see JSON starting with `[{ "registry_serial": 1, "owner": "মোঃ নুর বক্ত আলী", ... }]`.

---

## 4. Production Build

The Next.js config (`next.config.ts`) is set to `output: "standalone"`, which produces a self-contained server bundle in `.next/standalone/` with only the required `node_modules`.

### 4.1 Build

```bash
bun run build
# Or: npm run build
```

Output:

```
.next/
├── standalone/        # Self-contained server (server.js + minimal node_modules)
│   └── server.js
├── static/            # Static assets (must be copied next to standalone)
└── ...
```

### 4.2 Run the production server

```bash
bun run start
# → NODE_ENV=production bun .next/standalone/server.js
```

Listens on port 3000 by default. Override with `PORT=3001 bun run start`.

### 4.3 Health check

```bash
curl http://localhost:3000
curl http://localhost:3000/api
```

---

## 5. Deployment Options

### Option A — Vercel (recommended)

Vercel is the native deployment target for Next.js.

1. Push the repo to GitHub (already done if you forked).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js. Confirm the settings:
   - **Framework preset:** Next.js
   - **Build command:** `next build` (auto-detected from `vercel.json`)
   - **Install command:** `npm install` (auto-detected from `vercel.json`)
   - **Output directory:** `.next`
4. Add environment variable:
   - `DATABASE_URL` — your Vercel Postgres connection string, or omit to use the bundled JSON dataset
5. Click **Deploy**.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for Vercel Postgres setup and migration steps.

### Option B — Self-host with Bun + Caddy

A reference [`Caddyfile`](Caddyfile) is included that reverse-proxies port 81 → localhost:3000 with HTTPS via Let's Encrypt.

```bash
# On the server:
bun install --frozen-lockfile
bun run build
bun run start &            # listens on :3000

# In another shell:
sudo caddy run --config Caddyfile
```

The Caddyfile also handles dynamic port forwarding via `?XTransformPort=` query parameter (used by some preview environments).

### Option C — Docker

A minimal Dockerfile based on the standalone output:

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
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

Build and run:

```bash
docker build -t kurigram-nursery-registry .
docker run -p 3000:3000 kurigram-nursery-registry
```

---

## 6. Database Operations

The project ships with Prisma scripts in `package.json`:

| Script | Purpose |
|--------|---------|
| `bun run db:generate` | Regenerate Prisma client after editing `schema.prisma` |
| `bun run db:push` | Push schema changes to DB without creating a migration (good for dev) |
| `bun run db:migrate` | Create + apply a named migration (good for production) |
| `bun run db:reset` | Drop and recreate all tables (destroys data) |

### Switching from SQLite to PostgreSQL

1. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
   ```
2. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Re-generate and push:
   ```bash
   bun run db:generate
   bun run db:push
   ```

---

## 7. Linting & Code Quality

### ESLint (JavaScript / TypeScript)

```bash
bun run lint
```

The config (`eslint.config.mjs`) extends `eslint-config-next` and relaxes several strict rules (e.g., `no-explicit-any`, `no-unused-vars`) to keep the codebase pragmatic. Adjust as needed for your team's standards.

### Pylint (Python helper scripts)

A GitHub Actions workflow (`.github/workflows/pylint.yml`) lints all `*.py` files under `skills/` on every push/PR. To run locally:

```bash
pip install -r requirements.txt
pylint --rcfile=.pylintrc $(git ls-files '*.py')
```

---

## 8. Troubleshooting

| Problem | Solution |
|---------|----------|
| `bun install` fails on platform-specific deps (e.g., `sharp`) | Try `npm install`; ensure `python3` and `make` are installed for native build fallbacks |
| Build fails with TypeScript errors | `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so TS errors won't block builds. Check the browser console for runtime errors instead. |
| Blank page after deploy | Verify `/api` returns data. On Vercel, check the function logs. For self-host, ensure `src/lib/nursery-data.json` is bundled with the standalone output. |
| Map view shows blank iframe | OpenStreetMap tile servers may be blocked by your network/firewall. Allow `*.tile.openstreetmap.org`. |
| Prisma `Database connection error` | Check that `DATABASE_URL` is set in the environment, the SQLite file path is writable, or the Postgres URL is reachable from the runtime. |
| Port 3000 already in use | `PORT=3001 bun run dev` or `PORT=3001 bun run start` |
| `dev.log` growing unbounded | The dev script tees output to `dev.log`; rotate or delete it periodically. `dev.log` is in `.gitignore`. |
| Caddy reverse proxy returns 502 | Ensure `bun run start` is running and listening on port 3000 before starting Caddy. |

---

## 9. Security Checklist

Before deploying to production, verify:

- [ ] `.env` is **not** committed (it is in `.gitignore`)
- [ ] No API keys or secrets in source files
- [ ] `DATABASE_URL` uses strong credentials (for Postgres deployments)
- [ ] HTTPS is enforced (Caddy / Vercel handle this automatically)
- [ ] `next.config.ts` does not expose sensitive headers
- [ ] The `/api` route does not leak PII beyond what's in the public dataset

---

## 10. Backup & Recovery

### Dataset backup

The full registry lives in `src/lib/nursery-data.json` (~14.5k lines, ~450 KB). Commit changes to this file regularly — it is the single source of truth for the application.

### Database backup (Prisma / SQLite)

```bash
cp db/custom.db db/custom.backup.$(date +%Y%m%d).db
```

### Database backup (Postgres)

```bash
pg_dump "$DATABASE_URL" > backup.sql
```

---

**Build completed. Ready for field deployment in Kurigram.**
