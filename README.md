# Kurigram Nursery Registry

> A GIS & Inventory Management System for Plant Nurseries in Kurigram District, Bangladesh.
> Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **shadcn/ui**, and **Prisma**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Deploy-black.svg)](https://vercel.com/)

---

## Overview

**Kurigram Nursery Registry** is a full-stack web application that catalogues **137 plant nurseries** across **9 upazilas** of Kurigram District in the Rangpur Division of Bangladesh. It was built for the **Department of Agricultural Extension (DAE), Kurigram** to replace spreadsheet-based record-keeping with a fast, searchable, map-enabled registry.

The application consolidates two upstream Excel sources — a cleaned inventory dataset (1,381 plant-level rows) and an expanded nursery directory (204 entries) — into a single merged JSON store of 137 deduplicated nurseries, each enriched with:

- Owner name, nursery name, address, mobile number
- GPS coordinates (latitude / longitude) with validation status
- Detailed plant inventory by category (Fruit / Forest / Medicinal), age group, and quantity (seedlings + grafts)
- Verification status and field priority flags
- Direct Google Maps link and one-tap call action

### Key Metrics

| Metric | Value |
|--------|-------|
| Total nurseries indexed | **137** |
| Upazilas covered | **9** |
| Nurseries with mobile number | **101 / 137** (74%) |
| Nurseries with valid GPS | **90 / 137** (66%) |
| Total plants (seedlings + grafts) | **1,179,360** |
| Total seedlings | **817,184** |
| Total grafts | **353,990** |

---

## Features

### Dashboard & Analytics
- **Live stats panel** — total nurseries, mobile coverage, GPS coverage, total plants, seedlings, and grafts
- **Upazila-wise summary grid** — count, plant totals, mobile and GPS coverage per upazila, with click-to-filter
- **Inventory breakdown** by category (Fruit ফলদ, Forest বনজ, Medicinal ঔষধি) with category-specific icons

### Search & Filtering
- **Full-text search** across owner name, nursery name, address, mobile number, and upazila
- **Multi-dimensional filters**: upazila, plant category, has-mobile, has-GPS
- **Sort options**: registry serial, owner name, plant count (asc/desc), upazila

### Views
- **List View** — paginated cards with expandable inventory details per nursery
- **Map View** — OpenStreetMap embed showing nursery locations with direct Google Maps links
- **Detail Dialog** — full nursery profile with inventory table, contact actions, GPS status

### UX & Design
- Built with **shadcn/ui** components and **Tailwind CSS 4** for a clean, accessible, mobile-responsive interface
- **Green / earth-tone theme** appropriate for an agricultural registry
- **Bengali (Bangla) language** preserved for owner names, addresses, and verification notes
- Dark-mode ready via `next-themes`

### Performance
- **Next.js 16** App Router with React Server Components where possible
- **Standalone output** build (`output: "standalone"`) for minimal Docker/server footprint
- **Static JSON dataset** served via a single API route — no per-query database hit in the default deployment
- **Prisma + SQLite** for environments that need persistent CRUD storage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, standalone output) |
| UI Runtime | **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + `tw-animate-css` |
| Components | **shadcn/ui** (new-york style, Radix UI primitives) |
| Icons | **lucide-react** |
| State | **Zustand**, **@tanstack/react-query**, React hooks |
| Tables | **@tanstack/react-table** |
| Charts | **Recharts** |
| Forms | **react-hook-form** + **zod** |
| Database | **Prisma 6** + **SQLite** (default) / PostgreSQL (Vercel) |
| Auth | **NextAuth.js** |
| i18n | **next-intl** |
| Markdown editor | **@mdxeditor/editor** |
| AI SDK | **z-ai-web-dev-sdk** |
| Hosting | **Vercel** (preferred) — also self-hostable via Node/Bun + Caddy |

See [`package.json`](package.json) for the full dependency list.

---

## Project Structure

```
kurigram_nursery_registry/
├── prisma/
│   └── schema.prisma                # Prisma schema (User, Post models — extendable)
├── public/
│   ├── logo.svg                     # App logo
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api/route.ts             # GET /api → returns nursery dataset as JSON
│   │   ├── globals.css              # Tailwind 4 theme tokens (CSS variables)
│   │   ├── layout.tsx               # Root layout, metadata, Toaster mount
│   │   └── page.tsx                 # Main SPA: dashboard, filters, list/map views
│   ├── components/
│   │   └── ui/                      # shadcn/ui components (60+ primitives)
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts                    # Prisma client singleton
│       ├── utils.ts                 # cn() helper
│       └── nursery-data.json        # Merged dataset (137 nurseries, ~14.5k lines)
├── upload/                          # Source Excel files + intermediate JSON
│   ├── Kurigram_Nursery_Cleaned_Data (2).xlsx
│   ├── Kurigram_Plant_Nurseries_Expanded_Directory (1).xlsx
│   ├── merged_nursery_data.json
│   └── nursery_data.json
├── download/                        # Pre-built PWA bundle for offline field use
│   ├── bangladesh_nursery_pwa.html
│   ├── favicon.png
│   └── seed_data.json
├── examples/websocket/              # Reference WebSocket examples
├── .github/workflows/pylint.yml     # CI for Python helper scripts
├── prisma/schema.prisma
├── next.config.ts                   # standalone output, TS ignore on build
├── tailwind.config.ts
├── tsconfig.json
├── components.json                  # shadcn/ui config
├── vercel.json                      # Vercel build settings
├── Caddyfile                        # Reverse-proxy config for self-hosting
├── BUILD_GUIDE.md                   # Build & deployment instructions
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20` (or **Bun** `>= 1.3` — recommended, the project ships a `bun.lock`)
- **Python 3.10+** (only if you want to run the helper scripts under `skills/`)

### 1. Clone

```bash
git clone https://github.com/moniruzjaman/kurigram_nursery_registry.git
cd kurigram_nursery_registry
```

### 2. Install dependencies

```bash
# Recommended (matches committed lockfile)
bun install

# Or with npm
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — for local development, the default SQLite file works out of the box:

```bash
DATABASE_URL="file:./db/custom.db"
```

For Vercel / Postgres deployments, replace with a connection string (see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).

### 4. Initialize the database (optional — only if you use Prisma models)

```bash
bun run db:generate    # Generate Prisma client
bun run db:push        # Create SQLite tables
```

> **Note:** The default deployment serves the static `src/lib/nursery-data.json` dataset via `/api`, so Prisma is not required for read-only usage.

### 5. Run the dev server

```bash
bun run dev          # http://localhost:3000
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the dev server on port 3000 (with log tee to `dev.log`) |
| `bun run build` | Production build (Next.js standalone output) |
| `bun run start` | Run the standalone production server (`bun .next/standalone/server.js`) |
| `bun run lint` | Run ESLint (Next.js + TypeScript config) |
| `bun run db:push` | Push Prisma schema to the database |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate` | Create and apply a Prisma migration |
| `bun run db:reset` | Reset the database (destroys data) |

---

## API

### `GET /api`

Returns the full nursery dataset as JSON.

**Response:** `200 OK`

```json
[
  {
    "registry_serial": 1,
    "owner": "মোঃ নুর বক্ত আলী",
    "nursery_name_raw": "মোঃ নুর বক্ত আলী, তালুক কালোয়া",
    "address": "তালুক কালোয়া",
    "mobile": null,
    "upazila": "কুড়িগ্রাম সদর",
    "latitude": 25.560833,
    "longitude": 89.831111,
    "gps_status": "বৈধ ✓ (DMS)",
    "maps_link": "📍 ম্যাপ দেখুন",
    "fruit_seedlings": 0,
    "forest_seedlings": 0,
    "medicinal_seedlings": 0,
    "total_seedlings": 0,
    "main_variety": null,
    "verification": null,
    "priority": "মোবাইল নেই",
    "has_pivot_data": true,
    "pivot_inventory": [
      {
        "category": "Forest",
        "plant_name": "চায়না নিম",
        "age_group": "1-6 Months",
        "total": 0,
        "seedlings": 0,
        "grafts": 0
      }
    ],
    "pivot_total_plants": 4200,
    "pivot_total_seedlings": 3900,
    "pivot_total_grafts": 300,
    "region": "রংপুর",
    "district": "কুড়িগ্রাম"
  }
]
```

See [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) for the full schema reference.

---

## Data Sources

The merged dataset was built from two Excel files in [`upload/`](upload/):

1. **`Kurigram_Nursery_Cleaned_Data (2).xlsx`** — 1,381 rows of plant-level inventory across 137 unique nurseries. Owner names contained embedded mobile numbers that were extracted via regex.
2. **`Kurigram_Plant_Nurseries_Expanded_Directory (1).xlsx`** — 204 registry entries with GPS, mobile, verification, and seedling counts. The critical sheet is `nursery_registry`.

### Merge logic
- Deduplicated 137 unique nurseries from the cleaned inventory using `owner + upazila` as the key
- Matched 119 registry entries to the 137 inventory entries
- Added 18 inventory-only nurseries not present in the registry
- Backfilled missing mobile numbers and GPS coordinates from whichever source had the better value
- Tagged each entry with `priority` flags (e.g., `মোবাইল নেই` — no mobile, `জরুরি` — urgent follow-up)

The complete transformation log is in [`worklog.md`](worklog.md).

---

## Deployment

### Option A — Vercel (recommended)

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Vercel auto-detects Next.js — keep the default settings:
   - **Build command:** `next build`
   - **Install command:** `npm install`
   - **Output directory:** `.next`
4. Add environment variable `DATABASE_URL` (Vercel Postgres or your own)
5. Deploy

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for step-by-step instructions and Postgres migration.

### Option B — Self-host (Node/Bun + Caddy)

```bash
bun install
bun run build
bun run start   # serves on port 3000
```

A reference [`Caddyfile`](Caddyfile) is included for HTTPS reverse proxy on port 81.

### Option C — Docker

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
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

---

## Customization

### Change the dataset
Replace `src/lib/nursery-data.json` with your own merged dataset following the schema in [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md).

### Add new upazilas / categories
The frontend auto-discovers upazilas and categories from the data — no code changes needed.

### Change the theme
Edit the CSS variables in [`src/app/globals.css`](src/app/globals.css) (`:root` and `.dark` blocks) to override the green/earth-tone palette.

### Extend the Prisma schema
Edit [`prisma/schema.prisma`](prisma/schema.prisma), then:
```bash
bun run db:migrate --name your_change
bun run db:generate
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `bun install` fails | Try `npm install` instead — Bun lockfile may not match your platform |
| Blank page on `/` | Check that `/api` returns data (`curl http://localhost:3000/api`); verify `src/lib/nursery-data.json` exists |
| Build fails with TS errors | `next.config.ts` has `typescript.ignoreBuildErrors: true`, so most TS issues won't block builds — but check the console for runtime errors |
| Map doesn't load | The map view embeds OpenStreetMap via iframe; ensure your network allows OSM tile servers |
| Prisma `DATABASE_URL` error | Ensure `.env` exists and `DATABASE_URL` is set to a valid SQLite file path or Postgres URL |
| Port 3000 already in use | `bun run dev -- -p 3001` or edit the `dev` script in `package.json` |

---

## Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before opening a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `feat: add X`, `fix: Y`, `docs: Z`
4. Open a pull request against `main`

---

## License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE).

## Acknowledgements

- **Department of Agricultural Extension (DAE), Kurigram** — domain knowledge and field data
- The open-source community behind **Next.js**, **React**, **Tailwind CSS**, **shadcn/ui**, **Prisma**, and **OpenStreetMap**
- Field officers who collected the underlying nursery data across Kurigram's 9 upazilas

---

<p align="center">
  <em>Built for Kurigram District, Bangladesh — cataloguing 137 nurseries, 9 upazilas, and over 1.1 million plants.</em>
</p>
