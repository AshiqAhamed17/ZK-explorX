# ZK-explorX — V2 Task List

Companion to `NewPlan.md`. Each task is scoped to roughly **one commit**. Check items off as you go — `- [ ]` → `- [x]`. Suggested commit messages are given; adjust wording as needed, but keep commits at this granularity (small enough to review, big enough to be meaningful on their own).

Do the phases roughly in order — later phases assume earlier ones exist (e.g. Phase 2 wires into the Phase 1 contracts; Phase 3's cron reuses Phase 0's CI to catch breakage). Within a phase, tasks are ordered by dependency.

---

## Phase 0 — CI safety net

Stand this up *before* touching WASM/wallet bundling, so the risky phases are caught by CI immediately rather than at the next Vercel deploy.

- [x] **0.1** Add `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, `npm test`, `npm run build` on push and PR to `main`.
  _Commit: "Add CI: lint, test, and build on push/PR"_
- [x] **0.2** Add a CI status badge to `README.md`.
  _Commit: "Add CI badge to README"_

---

## Phase 1 — ZK Proof Lab (flagship)

- [x] **1.1** Install Noir toolchain locally (`nargo`, via the official Noir installer — not npm) and scaffold `circuits/range_proof/` (`Nargo.toml` + `src/main.nr`) implementing "prove a private value lies in a public range without revealing the value." Compile with `nargo compile`; commit the circuit source **and** the compiled ACIR artifact. Document the local `nargo` install requirement in `README.md`.
  _Commit: "Add range-proof Noir circuit"_
- [x] **1.2** Install pinned npm deps: `@noir-lang/noir_js@1.0.0-beta.25`, `@noir-lang/acvm_js@1.0.0-beta.25`, `@noir-lang/noirc_abi@1.0.0-beta.25`, `@aztec/bb.js@5.1.0` (exact versions, no ranges).
  _Commit: "Add Noir/Barretenberg proving dependencies"_
- [x] **1.3** Resolve Turbopack + WASM bundling for these packages in `next.config.ts` (try `outputFileTracingIncludes` first). Prove it works with a minimal throwaway test page that loads and instantiates the WASM. Document the `--webpack` fallback in `README.md` in case Turbopack regresses later.
  _Verified empirically with a real headless-Chromium (Playwright) run against both `npm run dev` and a production `npm run build && npm start` — full prove+verify round-trip succeeds with zero console errors and zero failed asset requests. **No `next.config.ts` change was needed**; Turbopack in Next 16.2.12 already emits and resolves the `noirc_abi`/`acvm_js` WASM correctly. No commit needed for this task (no code changed) — leaving the `--webpack` fallback documented in NewPlan.md's risk list in case a future Next/Turbopack upgrade regresses this."_
- [x] **1.4** Build `src/lib/circuits/proof.ts` — a thin wrapper around `noir_js.execute()` + `bb.js`'s `UltraHonkBackend` for generating and client-side-verifying a proof, given the compiled circuit artifact.
  _Commit: "Add Noir/Barretenberg proof generation wrapper"_
- [x] **1.5** Build `src/workers/prove.worker.ts` running that wrapper off the main thread; define the worker's message protocol (input → progress updates → proof result / error).
  _Commit: "Move proof generation into a Web Worker"_
  _Also added `src/lib/circuits/use-prove-worker.ts`, a React hook wrapping the worker in a promise-based API — needed for 1.6 to actually consume the worker from the UI. Verified end-to-end with a real headless-Chromium run: prove → verify round-trip succeeds via the worker with zero console errors._
- [ ] **1.6** Build the `/proof-lab` page + `ProofForm`/`ProofWorkerStatus` components: enter a private value, generate a proof, show progress, display the resulting proof + public inputs, and a "verify client-side" button (instant, no wallet).
  _Commit: "Add ZK Proof Lab page with client-side proving and verification"_
- [ ] **1.7** Generate the Solidity verifier via `bb write_solidity_verifier`; commit `contracts/Verifier.sol` (generated, not hand-edited).
  _Commit: "Generate Solidity verifier contract"_
- [ ] **1.8** Write `contracts/ProofRegistry.sol` — wraps the verifier, exposes `submitProof(proof, publicInputs)`, emits `ProofVerified(address indexed prover, bytes32 proofHash, uint256 timestamp)` on success. Add local compilation/testing setup (Foundry or a minimal Hardhat config — whichever is lighter to add).
  _Commit: "Add ProofRegistry contract wrapping the verifier"_
- [ ] **1.9** Write `contracts/script/Deploy.ts` (viem-based) to deploy both contracts to Sepolia using a throwaway funded key from `.env.local` (never committed). Run it once; record the deployed addresses + ABI in `src/lib/contracts/verifier.ts`. Document the deploy process and key-hygiene rules in `README.md`.
  _Commit: "Deploy Verifier + ProofRegistry to Sepolia"_

---

## Phase 2 — Wallet integration

- [ ] **2.1** Install pinned deps: `wagmi@2.8.8`, `viem@2.55.10`, `@tanstack/react-query@^5`, `@rainbow-me/rainbowkit@2.2.11`. Obtain a `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and document it in `.env.example`.
  _Commit: "Add wagmi/viem/RainbowKit wallet dependencies"_
- [ ] **2.2** Build `src/lib/wagmi/config.ts` (`createConfig` with `ssr: true` + cookie storage) and `src/app/providers.tsx` (the `"use client"` boundary: `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`). Wire into the root layout via `cookieToInitialState`, per the researched SSR pattern — the layout stays a server component.
  _Commit: "Add wagmi/RainbowKit provider tree with SSR support"_
- [ ] **2.3** Add a `ConnectWalletButton` (RainbowKit's `ConnectButton`, restyled to match the Proof Terminal design tokens) to the navbar.
  _Commit: "Add wallet connect button to navbar"_
- [ ] **2.4** Wire the Proof Lab's on-chain step: a "Submit on Sepolia" button that requires a connected wallet, calls `ProofRegistry.submitProof` via `useWriteContract`, and shows pending/confirmed states with a link to the transaction on Sepolia Etherscan.
  _Commit: "Wire Proof Lab submission to the on-chain ProofRegistry"_
- [ ] **2.5** (Optional/stretch) Add a small "on-chain pulse" read-only widget elsewhere in the app (e.g. latest Sepolia block number via a public RPC read) to demonstrate contract reads outside the proof flow. Cut first if time is short.
  _Commit: "Add on-chain pulse widget"_

---

## Phase 3 — Historical data & trends

- [ ] **3.1** Provision Neon Postgres via the Vercel Marketplace integration; add `DATABASE_URL` to Vercel + `.env.local`. Install `drizzle-orm`, `@neondatabase/serverless`, dev-dep `drizzle-kit`.
  _Commit: "Add Neon Postgres + Drizzle ORM setup"_
- [ ] **3.2** Define `db/schema.ts` (`ecosystem_snapshots`: slug, date, health score + component breakdown, key GitHub metrics, TVL) and `db/index.ts` (the `neon-http` Drizzle client). Generate and run the initial migration.
  _Commit: "Add ecosystem_snapshots schema and initial migration"_
- [ ] **3.3** Extract `src/lib/metrics/snapshot.ts` — a shared function computing "today's metrics for every ecosystem," refactored out of the existing `getRankedEcosystems` pathway so both the live page render and the future cron job use one code path.
  _Commit: "Extract shared snapshot-computation function"_
- [ ] **3.4** Build `src/app/api/cron/snapshot/route.ts` — a `GET` handler gated by `CRON_SECRET`, calling the shared function and upserting one row per ecosystem/day (`onConflictDoNothing` on slug+date).
  _Commit: "Add daily snapshot cron route"_
- [ ] **3.5** Register the schedule in `vercel.json` (`0 3 * * *` or similar) and document `CRON_SECRET` in `.env.example`/`README.md`.
  _Commit: "Register daily snapshot cron schedule"_
- [ ] **3.6** Build `src/components/charts/history-line-chart.tsx` and slot a "Health over time" panel into the ecosystem detail page, backed by a Drizzle query. Ship an honest "collecting history…" empty state for ecosystems with fewer than ~5 days of data — do not fabricate backdated points.
  _Commit: "Add historical health trend chart to ecosystem detail page"_

---

## Phase 4 — Knowledge Graph

- [ ] **4.1** Install `reactflow` (or current equivalent package name). Define `src/data/graph.ts`: nodes (ecosystems, languages, VMs, proof systems, key shared libraries like Noir/ACVM/Barretenberg) and edges, derived from existing curated ecosystem data plus new hand-authored cross-ecosystem relationships.
  _Commit: "Add knowledge graph data model"_
- [ ] **4.2** Build the `/graph` route + `EcosystemGraph` component: pan/zoom, nodes colored via the existing `ecoVar` identity-color system, click-through to ecosystem/project pages.
  _Commit: "Add interactive knowledge graph page"_
- [ ] **4.3** Add a `GraphLegend`/filter control (filter by node type) and a "focus mode" that dims unrelated nodes on click.
  _Commit: "Add graph filtering and focus mode"_
- [ ] **4.4** Add a "Graph" link to the navbar.
  _Commit: "Add graph link to navbar"_

---

## Phase 5 — Search

- [ ] **5.1** Build a lightweight client-side search index over ecosystems + projects (+ graph nodes if useful) with a simple fuzzy scorer or a small library (e.g. `fuse.js`).
  _Commit: "Add client-side search index"_
- [ ] **5.2** Build the `CommandPalette` component (⌘K-triggered modal, keyboard-navigable, styled to match Proof Terminal) and wire a global keyboard listener in the root layout.
  _Commit: "Add command-K search palette"_
- [ ] **5.3** Wire result selection to navigation; add a visible search trigger in the navbar for discoverability.
  _Commit: "Wire search palette navigation and navbar trigger"_

---

## Phase 6 — Content depth

- [ ] **6.1** Write the `/primitives` (or `/learn`) page: a compact glossary of proof systems (SNARK/STARK/PLONK/Groth16/FRI), VM types, and key terms.
  _Commit: "Add primitives and glossary reference page"_
- [ ] **6.2** Cross-link ecosystem detail pages' "Proof System"/"VM" facts to their glossary entries.
  _Commit: "Cross-link ecosystem facts to the glossary"_
- [ ] **6.3** (Optional) Write a short "How the Proof Lab works" explainer walking through circuit → witness → proof → verification, linking theory to the live demo.
  _Commit: "Add Proof Lab explainer page"_

---

## Phase 7 — Packaging

- [ ] **7.1** Rewrite `README.md` as a case study: problem statement, architecture overview, feature highlights with links to the live Proof Lab/Compare/Graph, tech stack, "why I built this," screenshots/GIF placeholders.
  _Commit: "Rewrite README as a project case study"_
- [ ] **7.2** Add Playwright (or similar) e2e smoke tests for the highest-value flows: leaderboard loads, an ecosystem page opens, the compare tool works, the Proof Lab page loads without console errors. Keep full in-browser proof generation out of CI (slow/heavy) — smoke-test the page shell only.
  _Commit: "Add e2e smoke tests for core flows"_
- [ ] **7.3** Run a Lighthouse + accessibility pass across the new pages (`/proof-lab`, `/graph`, `/primitives`, `/compare`); fix any high-severity findings.
  _Commit: "Accessibility and performance pass on new pages"_
- [ ] **7.4** Record a short demo GIF/video of the Proof Lab flow; add it to the README.
  _Commit: "Add Proof Lab demo GIF to README"_

---

## Tracking

| Phase | Status |
|---|---|
| 0 — CI safety net | ✅ Done |
| 1 — ZK Proof Lab | ☐ Not started |
| 2 — Wallet integration | ☐ Not started |
| 3 — Historical data | ☐ Not started |
| 4 — Knowledge Graph | ☐ Not started |
| 5 — Search | ☐ Not started |
| 6 — Content depth | ☐ Not started |
| 7 — Packaging | ☐ Not started |
