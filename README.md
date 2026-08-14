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

### Noir toolchain (only needed if you're editing the ZK circuit)

The ZK Proof Lab's circuit (`circuits/range_proof/`) is written in [Noir](https://noir-lang.org) and compiled with `nargo`, a separate Rust-based CLI — **not an npm package**. The compiled artifact (`circuits/range_proof/target/range_proof.json`) is committed to the repo, so **running the app, building it, or deploying to Vercel never requires `nargo`** — only the JS proving libraries (`noir_js`/`bb.js`) are needed at runtime, and those are plain npm packages.

You only need `nargo` if you're changing the circuit itself:

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
noirup -v 1.0.0-beta.25   # pin to match this repo's noir_js/acvm_js/noirc_abi versions
cd circuits/range_proof
nargo test                 # run the circuit's unit tests
nargo compile               # regenerate target/range_proof.json after any changes
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also typechecks) |
| `npm test` | Run the Vitest unit suite (health score + data validation) |
| `npm run data:validate` | Validate all curated ecosystem data against the Zod schema |
| `npm run lint` | ESLint |
| `npm run deploy:sepolia` | Deploy the ZK Proof Lab contracts to Sepolia (see below) |

## How it's organized

```
circuits/
└── range_proof/             # Noir circuit: proves a private value is in a public range
    ├── Nargo.toml
    ├── src/main.nr
    └── target/range_proof.json   # compiled ACIR artifact, committed (no nargo needed at build time)
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

## ZK Proof Lab — on-chain verification

The Proof Lab generates a real zero-knowledge proof **in your browser** (a Noir
range-proof circuit, proven with Barretenberg's UltraHonk via WebAssembly in a
Web Worker) and verifies it **on-chain** on Ethereum Sepolia.

**Live contracts (Sepolia):**

| Contract | Address |
|---|---|
| `ProofRegistry` | [`0x43d72f44622E6De811C626760004bA621ee474a9`](https://sepolia.etherscan.io/address/0x43d72f44622E6De811C626760004bA621ee474a9) |
| `HonkVerifier` | [`0xca1B13809576a4103Ce306027fDB327ef577b382`](https://sepolia.etherscan.io/address/0xca1B13809576a4103Ce306027fDB327ef577b382) |

`submitProof(proof, publicInputs)` verifies the proof through the generated
UltraHonk verifier and, on success, emits `ProofVerified` — a real state-changing
transaction ([example](https://sepolia.etherscan.io/tx/0x1a4ac7f46e65fb771d2f9f2e845b15abb3195d6afac1945feb960a255587fad3)).
Addresses and ABIs live in [`src/lib/contracts/verifier.ts`](src/lib/contracts/verifier.ts);
the full deploy record is in [`contracts/deployments/sepolia.json`](contracts/deployments/sepolia.json).

### Redeploying the contracts

You don't need to — they're already deployed. To deploy your own copy:

1. Create a **throwaway** wallet and fund it with Sepolia faucet ETH. Never use
   a real/mainnet key.
2. Put the key in `.env.local` (which is gitignored — **never commit a key**):
   ```
   PRIVATE_KEY=0x...        # throwaway deployer, testnet ETH only
   PUBLIC_KEY=0x...         # its address (cross-checked by the script)
   SEPOLIA_RPC_URL=...      # optional; defaults to a public RPC
   ```
3. Build the contracts and deploy:
   ```bash
   forge build                 # needs Foundry (see contracts/README.md)
   npm run deploy:sepolia
   ```
   The script deploys the verifier's libraries (`RelationsLib`,
   `ZKTranscriptLib`), links and deploys `HonkVerifier`, then deploys
   `ProofRegistry` wired to it — printing the addresses and Etherscan links.
4. Copy the new addresses into `src/lib/contracts/verifier.ts`.

## Deployment

Deploys to Vercel with zero config. Set `GITHUB_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, and `CRON_SECRET` as environment variables in the Vercel project settings (see `.env.example` for what each one is for).

### Historical snapshots (cron)

`vercel.json` registers a daily cron (`0 3 * * *`, UTC) hitting `/api/cron/snapshot`, which persists that day's health score + key metrics for every ecosystem to Postgres (`ecosystem_snapshots`) — the data source for the "health over time" charts. The route is a no-op if it's re-run for a date that already has rows, and it 401s unless called with `Authorization: Bearer $CRON_SECRET`, which Vercel sets automatically from the env var of the same name.

## Roadmap

MVP (this repo) → project explorer, historical trend charts (DB-backed), TVL/adoption metrics, full-text search, and an interactive ecosystem knowledge graph.
