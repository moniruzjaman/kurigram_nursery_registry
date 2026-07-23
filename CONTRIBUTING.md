# Contributing to Kurigram Nursery Registry

First off — **thank you** for taking the time to contribute! 🌱

This document describes how to set up the project locally, the conventions we follow, and the process for submitting changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Context](#project-context)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Data Updates](#data-updates)

---

## Code of Conduct

By participating in this project you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please be respectful, constructive, and inclusive in all interactions.

---

## Project Context

**Kurigram Nursery Registry** is a Next.js 16 web app that catalogs 137 plant nurseries across 9 upazilas of Kurigram District, Bangladesh. It was built for the Department of Agricultural Extension (DAE) to replace spreadsheet-based record-keeping.

Before contributing, please read the [README](README.md) to understand the architecture, data model, and use cases.

---

## Development Setup

### Prerequisites

- **Node.js** `>= 20` (or **Bun** `>= 1.3`)
- **Git**
- **Python 3.10+** (only if you work on `skills/` helper scripts)

### Steps

```bash
# 1. Fork & clone
git clone https://github.com/<your-username>/kurigram_nursery_registry.git
cd kurigram_nursery_registry

# 2. Add upstream remote
git remote add upstream https://github.com/moniruzjaman/kurigram_nursery_registry.git

# 3. Install dependencies (Bun recommended — matches committed lockfile)
bun install

# 4. Configure environment
cp .env.example .env
# Edit .env if you need a non-default DATABASE_URL

# 5. Start the dev server
bun run dev   # → http://localhost:3000
```

### Verify your setup

```bash
# Lint passes
bun run lint

# Build succeeds
bun run build

# API returns data
curl http://localhost:3000/api | head -20
```

---

## Project Structure

```
src/
├── app/
│   ├── api/route.ts         # GET /api → nursery dataset
│   ├── globals.css          # Tailwind 4 theme tokens
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main SPA page
├── components/ui/           # shadcn/ui primitives (do not edit by hand — use `npx shadcn@latest add <component>`)
├── hooks/                   # React hooks (use-toast, use-mobile)
└── lib/
    ├── db.ts                # Prisma client singleton
    ├── utils.ts             # cn() helper
    └── nursery-data.json    # The merged dataset (137 nurseries)

prisma/schema.prisma         # Prisma schema
upload/                      # Source Excel files + intermediate JSON
download/                    # Pre-built PWA bundle for offline field use
```

---

## Coding Standards

### TypeScript / React

- Use **TypeScript** for all new code (`.ts` / `.tsx`).
- Prefer **functional components** with hooks.
- Use the **`@/`** alias for imports (configured in `tsconfig.json`).
- Avoid `any` where a proper type is feasible — but the ESLint config allows it for pragmatic cases.
- Use **named exports** for components where possible.

### Styling

- Use **Tailwind CSS 4** utility classes directly in JSX.
- For reusable patterns, prefer `cva` (class-variance-authority) over custom CSS.
- Theme tokens are defined as CSS variables in `src/app/globals.css` — prefer `bg-primary`, `text-muted-foreground`, etc., over hard-coded colors.
- New shadcn/ui components should be added via the CLI: `npx shadcn@latest add <component>`.

### Data Layer

- The default deployment serves `src/lib/nursery-data.json` via `/api` — do **not** add server-side reads of the Excel files in `upload/`.
- If you need persistence, extend the Prisma schema (`prisma/schema.prisma`) and use the `db` client from `src/lib/db.ts`.

### File Naming

- React components: `PascalCase.tsx` (e.g., `NurseryCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `nursery-utils.ts`)
- JSON data files: `kebab-case.json`

### Bengali (Bangla) Text

- Preserve Bangla strings in the dataset (owner names, addresses, verification notes) as UTF-8.
- Do **not** transliterate Bangla to English unless explicitly requested.
- When adding new UI strings, prefer English labels with Bangla in parentheses where it aids field officers (e.g., `Fruit (ফলদ)`).

---

## Commit Message Convention

We follow a lightweight **Conventional Commits** style:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Allowed types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, whitespace, semicolons — no code logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD changes |
| `revert` | Reverting a previous commit |

### Examples

```
feat(map): add cluster markers for dense upazilas
fix(api): handle empty nursery inventory in /api response
docs: update BUILD_GUIDE with Docker instructions
chore(deps): bump next to 16.1.2
```

---

## Pull Request Process

1. **Sync with upstream** before starting work:
   ```bash
   git checkout main
   git pull upstream main
   ```
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature
   ```
3. **Make your changes** — keep commits atomic and well-described.
4. **Verify locally**:
   ```bash
   bun run lint
   bun run build
   bun run dev   # manual smoke test
   ```
5. **Push to your fork**:
   ```bash
   git push origin feat/your-feature
   ```
6. **Open a Pull Request** against `main` on the upstream repository.
   - Use the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
   - Link any related issues (`Closes #123`, `Refs #456`).
   - Describe **what** changed and **why**, not just **how**.
7. **Address review feedback** — push additional commits to the same branch (do not squash until merge).

### PR Review Criteria

Reviewers will check for:

- ✅ Lint passes (`bun run lint`)
- ✅ Build succeeds (`bun run build`)
- ✅ No regressions in the dashboard, filters, or list/map views
- ✅ Dataset integrity (if you modified `nursery-data.json`, totals must still reconcile)
- ✅ Documentation updated (if applicable)
- ✅ No secrets / `.env` files committed
- ✅ Commit messages follow the convention

---

## Reporting Bugs

Bugs are tracked as [GitHub Issues](https://github.com/moniruzjaman/kurigram_nursery_registry/issues).

Use the **Bug Report** template (`.github/ISSUE_TEMPLATE/bug_report.md`) and include:

- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Browser & OS
- Console errors
- Whether the issue is on the deployed Vercel instance or a local build

---

## Suggesting Enhancements

Enhancements are also tracked as GitHub Issues — use the **Feature Request** template.

Good enhancements:

- Align with the project's purpose (nursery registry for Kurigram District)
- Are scoped enough to be implemented in 1–3 PRs
- Don't introduce paid third-party dependencies (the project is intentionally zero-cost)

---

## Data Updates

If you want to update the underlying nursery dataset (e.g., add new nurseries, correct GPS coordinates, refresh mobile numbers):

1. Open an issue first describing what data you want to update and why.
2. The raw Excel sources live in `upload/` — replace them with updated versions if you have them.
3. Re-run the merge pipeline (the work is documented in [`worklog.md`](worklog.md)) to regenerate `src/lib/nursery-data.json`.
4. Open a PR with the updated JSON, the new Excel sources, and a summary of what changed.

> **Note:** The merge pipeline is currently a one-off script — contributions to formalize it as a reproducible Python/Node script are welcome.

---

## Questions?

- Open a [GitHub Issue](https://github.com/moniruzjaman/kurigram_nursery_registry/issues) with the `question` label
- Contact the maintainer: **moniruzjaman**

---

<p align="center">
  <em>Happy contributing! 🌳</em>
</p>
