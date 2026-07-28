# ZK-explorX

[![CI](https://github.com/AshiqAhamed17/ZK-explorX/actions/workflows/ci.yml/badge.svg)](https://github.com/AshiqAhamed17/ZK-explorX/actions/workflows/ci.yml)

**The Zero-Knowledge ecosystem explorer — ranked by developer health, not token price.**

ZK-explorX is a knowledge platform for exploring the ZK ecosystem (ZKsync, Starknet, Scroll, Polygon zkEVM, Linea, Aztec, Aleo, Mina, RISC Zero, SP1). It combines **curated protocol research** with **live GitHub developer activity** to answer the questions that actually matter to developers, researchers, and investors: which ecosystems are healthy, actively built, and worth your time?

## Features

- **Ecosystem Health Leaderboard** — every tracked ecosystem ranked by a transparent, weighted 0–100 health score.
- **Rich ecosystem pages** — curated architecture, proof system, VM, and language facts alongside live GitHub metrics (stars, commits, contributors, releases, issues), a weekly commit-activity chart, and a per-component score breakdown.
- **Filterable directory** — browse by category (rollup, zkVM, privacy, ZK L1).
- **Transparent methodology** — the scoring formula and its limitations are documented in-app at `/about`.
- Dark-first, responsive UI.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + a small in-repo component set
- **Recharts** for charts
- **Zod** for curated-data validation
- **Vitest** for unit tests
- Live data via the **GitHub REST API**, cached with Next.js ISR (6h)

## Getting started

```bash
npm install
cp .env.example .env.local   # then add a GITHUB_TOKEN (see below)
npm run dev                  # http://localhost:3000
```

### GitHub token (required for live data)

Live developer metrics come from the GitHub API. Without a token you're limited to 60 requests/hour (anonymous), which is not enough to populate all ecosystems — pages will render but show degraded/partial data. Create a read-only token at <https://github.com/settings/tokens> (no scopes needed for public repos) and put it in `.env.local`:

```
GITHUB_TOKEN=ghp_xxx
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also typechecks) |
| `npm test` | Run the Vitest unit suite (health score + data validation) |
| `npm run data:validate` | Validate all curated ecosystem data against the Zod schema |
| `npm run lint` | ESLint |

## How it's organized

```
src/
├── app/                     # routes: /, /ecosystems, /ecosystems/[slug], /about
├── components/
│   ├── ui/                  # Badge, Card primitives
│   ├── charts/              # Sparkline, CommitActivityChart (Recharts)
│   └── ecosystem/           # HealthRing, Leaderboard, EcosystemCard, ...
├── data/
│   ├── schema.ts            # Zod schema — single source of truth for types
│   ├── index.ts             # loads + validates all ecosystems on import
│   └── ecosystems/          # one curated file per ecosystem
├── lib/
│   ├── github.ts            # GitHub REST client + per-ecosystem aggregation
│   ├── health.ts            # pure, unit-tested health-score engine
│   └── ecosystems.ts        # joins curated data + live metrics + scores
└── types/metrics.ts         # shared live-metrics shape
```

## The Health Score

A 0–100 score computed from five weighted components — Developer Activity (30%), Momentum (20%), Community (20%), Maintenance (15%), Breadth (15%) — each normalized *relative to the tracked set*. See [`src/lib/health.ts`](src/lib/health.ts) and the in-app methodology page at `/about`.

## Deployment

Deploys to Vercel with zero config. Set `GITHUB_TOKEN` as an environment variable in the Vercel project settings.

## Roadmap

MVP (this repo) → project explorer, historical trend charts (DB-backed), TVL/adoption metrics, full-text search, and an interactive ecosystem knowledge graph.
