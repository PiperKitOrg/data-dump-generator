# Piper Data Dump Generator

Generate realistic database schemas with relationships, constraints, and production-like seed data, then export clean PostgreSQL, MySQL, SQLite, and MongoDB dumps in minutes.

Built by Adam - The Developer from Piper.

## What This Project Does

- Runs entirely in the browser (no backend required)
- Generates schema + relationship graph + ordered insert plan
- Produces deterministic data from a seed value
- Exports downloadable dump files for:
  - PostgreSQL (`.sql`)
  - MySQL (`.sql`)
  - SQLite (`.sql`)
  - MongoDB (`.js`)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI Tooltip
- Vitest (smoke tests)

## Local Development

### Requirements

- Node.js `>= 20.9.0` (required by Next.js 16)
- npm

### Install

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Tests

```bash
npm run test
```

## How To Use

1. **Setup**: choose preset/config + seed + rows.
2. **Review**: inspect generated schema and insert order.
3. **Export**: download the target dialect dump file.

## Project Structure

```text
app/                      # Next.js app router pages + metadata routes
src/core/                 # Schema/data generation + dependency resolver
src/exporters/            # Dialect exporters
src/ui/                   # UI sections/components
src/constants/            # Grouped constants and templates
src/utils/                # Shared helpers (seeded RNG, download)
```

## SEO / Site Metadata

SEO and site metadata are configured in:

- `app/layout.tsx` (title, description, OpenGraph, Twitter, icons, manifest)
- `app/robots.ts`
- `app/sitemap.ts`

Optional env for canonical/hosted URL:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```
