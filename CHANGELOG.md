# Changelog

All notable changes to **Kurigram Nursery Registry** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive `README.md` describing the actual Next.js 16 / React 19 architecture
- `BUILD_GUIDE.md` rewritten for Next.js standalone build, Vercel, Caddy, and Docker
- `CONTRIBUTING.md` with development setup, coding standards, and PR workflow
- `CODE_OF_CONDUCT.md` based on the Contributor Covenant v2.1
- `LICENSE` (MIT) file
- `docs/DATA_SCHEMA.md` documenting the nursery data model
- `docs/DEPLOYMENT.md` with step-by-step Vercel and self-host instructions
- GitHub issue templates (bug report, feature request) and PR template
- Security best-practice: untracked `.env` from git (was previously committed)

### Changed
- `.metadata` file corrected from "Flutter project" to "Next.js project"
- README badges added for License, Next.js, TypeScript, and Vercel

### Removed
- Outdated Flutter-specific content from `README.md` and `BUILD_GUIDE.md`

---

## [1.0.0] — 2025-07-23

### Added
- **Next.js 16** application with App Router and standalone output
- **React 19** + **TypeScript 5** codebase
- **Tailwind CSS 4** + **shadcn/ui** (new-york style) component library
- Single-page application with dashboard, advanced filtering, list/map views
- `GET /api` endpoint serving the merged nursery dataset as JSON
- **137 nurseries** indexed across **9 upazilas** of Kurigram District
- **101 nurseries** with mobile numbers, **90** with valid GPS coordinates
- **1,179,360 plants** catalogued (817,184 seedlings + 353,990 grafts + remainder)
- Upazila-wise summary grid with click-to-filter
- Full-text search across owner, nursery name, address, mobile, upazila
- Sort by registry serial, owner name, plant count (asc/desc), upazila
- OpenStreetMap embed for map view
- Bengali (Bangla) language preserved for owner names, addresses, and verification notes
- **Prisma 6** schema (`User`, `Post`) with SQLite default — extendable to PostgreSQL
- **Recharts**, **@tanstack/react-table**, **@tanstack/react-query** integrated for future analytics
- **NextAuth.js**, **next-intl**, **next-themes** wired up for auth / i18n / dark mode
- **z-ai-web-dev-sdk** for optional AI-powered features
- Reference `Caddyfile` for self-hosting with HTTPS
- `vercel.json` with build/install/output config
- GitHub Actions workflow for pylint on Python helper scripts
- ESLint config extending `eslint-config-next` (TypeScript + core-web-vitals)
- Source Excel files and intermediate JSON preserved in `upload/`
- Pre-built PWA bundle in `download/` for offline field use
- WebSocket examples in `examples/websocket/`

### Data Pipeline
- Parsed **1,381 rows** of plant-level inventory from `Kurigram_Nursery_Cleaned_Data (2).xlsx`
- Extracted **137 unique nurseries** using `owner + upazila` dedup key
- Extracted mobile numbers from text column via regex `01[3-9]\d{8}`
- Cross-referenced with **204 registry entries** in `Kurigram_Plant_Nurseries_Expanded_Directory (1).xlsx`
- Matched **119 registry entries** to inventory; added **18 inventory-only nurseries**
- Backfilled missing mobile numbers and GPS coordinates from whichever source had the better value
- Tagged each entry with `priority` flags (জরুরি / মোবাইল নেই / সম্পন্ন)
- Saved merged dataset to `src/lib/nursery-data.json` (~14.5k lines, ~450 KB)

---

## Versioning Policy

- **Major** (`x.0.0`) — breaking API or data-schema changes
- **Minor** (`0.x.0`) — new features, backward-compatible
- **Patch** (`0.0.x`) — bug fixes, documentation, dependency bumps

---

## Link conventions

- `[Unreleased]`: work not yet released
- `[1.0.0]`: first tagged release

[Unreleased]: https://github.com/moniruzjaman/kurigram_nursery_registry/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/moniruzjaman/kurigram_nursery_registry/releases/tag/v1.0.0
