# ZK-explorX — V2 Plan: "Protocol/ZK Engineer" Edition

## Context

**Where the project stands:** V1 shipped a polished, infra-free ZK ecosystem explorer — 10 ecosystems, live GitHub metrics, a transparent health score, TVL/adoption via DefiLlama, a project explorer, and a compare tool. It's a strong **data aggregation and frontend** portfolio piece.

**The gap:** the project is named ZK-explorX, but it contains zero lines of actual ZK code, zero blockchain interaction, and zero persistence. For a hiring manager on a **protocol/ZK engineering** team, that's the difference between "someone who reads about ZK" and "someone who builds with ZK." V2 closes that gap.

**Decisions locked in (2026-07-19):**
- **Target audience for this plan:** protocol/ZK engineering roles specifically (not general frontend).
- **Add real on-chain interaction** (wallet connect, contract read/write).
- **Add a real, hands-on ZK proof demo** (an actual circuit, not just data about circuits).
- **Timeline:** long-term, ambitious scope is acceptable — this plan is the full roadmap, executed in phases.

**Guiding principle:** every addition below is chosen because it demonstrates a specific skill an interviewer would probe for — not because "more features" is inherently better. See the mapping table below.

---

## Strategic thesis — what each feature proves

| Feature | Skill it demonstrates | Why it matters for this audience |
|---|---|---|
| **ZK Proof Lab** | Circuit design, ZK cryptography tooling (Noir/Barretenberg), WASM/browser engineering | The single highest-signal addition — proves you can *build* ZK systems, not just index news about them |
| **On-chain wallet + verifier contract** | dApp fundamentals: wallet UX, contract reads/writes, EVM deployment | Table stakes for any web3 engineering role; currently entirely missing |
| **Historical data (Neon + Drizzle + Cron)** | Data engineering: schema design, scheduled jobs, real persistence vs. read-through caching | Shows you can design and operate a system over time, not just render an API response |
| **Knowledge Graph** | Domain modeling of the ZK stack's actual dependency architecture | Visually memorable "flagship" piece; demonstrates you understand *how the pieces fit together*, e.g. Aztec → Noir → ACVM → Barretenberg |
| **Command-K Search** | Frontend polish, information architecture | Expected of a serious product; cheap, high perceived-quality return |
| **CI + testing** | Engineering discipline | Signals you ship safely, not just fast |
| **Primitives & Glossary content** | Genuine domain fluency | Cheap to write, hard to fake — read closely by technical interviewers |
| **README as case study** | Communication — the actual first thing anyone reads | Often the single highest-leverage item on this whole list |

---

## Technical research findings (verified 2026-07-19, not stale training knowledge)

### ZK toolchain: Noir + Barretenberg (bb.js) — chosen over Circom + snarkjs
- **Why:** UltraHonk (Barretenberg's current default proving system) needs **no per-circuit trusted-setup ceremony** — a meaningful DX and correctness win over Groth16. It's also thematically on-brand: Aztec/Noir is already a covered ecosystem in this app.
- **Exact versions to pin (no `^`/`~` ranges — these are beta, a minor bump can break the API):** `@noir-lang/noir_js@1.0.0-beta.25`, `@noir-lang/acvm_js@1.0.0-beta.25`, `@noir-lang/noirc_abi@1.0.0-beta.25`, `@aztec/bb.js@5.1.0`.
- **Critical architectural detail:** `nargo` (the Noir compiler) is a **separate Rust-toolchain CLI, not an npm package**. Vercel's build environment does not have it. Circuit compilation happens **locally, at dev time** (`nargo compile`), and the compiled ACIR artifact is **committed to the repo**. Only `noir_js` + `bb.js` (pure npm/WASM) are needed at build/runtime — this is exactly the class of mistake that broke the last Vercel deploy, so it's called out explicitly here.
- **Known bundler risk:** Turbopack (Next 16's default) does not yet reliably resolve the `new URL("x.wasm", import.meta.url)` pattern these WASM loaders use (open issue, vercel/next.js#75430). Mitigation, in order: (1) `outputFileTracingIncludes` in `next.config.ts` to force-include the `.wasm` file; (2) fetch the `.wasm` binary manually and pass it via the library's instantiate option; (3) escape hatch — `next build --webpack` (Next 16 still supports this explicitly) if Turbopack keeps fighting.
- **Solidity verifier:** one command, `bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol` — deployable to any EVM chain, including Sepolia.

### Wallet integration: wagmi + viem + RainbowKit
- **Showstopper avoided:** wagmi's `latest` tag is v3, but **every** wallet-UI library (RainbowKit, ConnectKit) still hard-pins `wagmi: 2.x` in peer deps, with no shipped v3 support. **Do not install wagmi v3.**
- **Exact versions:** `wagmi@2.8.8`, `viem@2.55.10`, `@tanstack/react-query@^5`, `@rainbow-me/rainbowkit@2.2.11`.
- **SSR pattern for the App Router (current, confirmed):** `createConfig({ ssr: true, storage: createStorage({ storage: cookieStorage }) })`; a `"use client"` provider boundary (`WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider`) accepting an `initialState` prop; the **root layout stays a server component** — it just reads `headers()`, calls `cookieToInitialState(config, cookieHeader)`, and passes it down. This is the only change to the existing layout; every other page stays server-rendered as-is.
- **RPC reads:** a public/default RPC is sufficient for this project's traffic (block number, gas price, contract reads) — no paid provider required.

### Historical data: Neon Postgres + Drizzle ORM + Vercel Cron
- **Neon** (via the Vercel Marketplace integration — Vercel Postgres itself was sunset; Neon is the current native path), free tier: 0.5 GB storage, 100 compute-hours/month, scale-to-zero — trivially sufficient for ~10 rows/day.
- **Drizzle**, not Prisma: use the `neon-http` driver (`drizzle-orm/neon-http` + `@neondatabase/serverless`) — **stateless HTTP, no persistent connection pool**, which is what makes this safe on Vercel's serverless functions without connection-limit issues. Prisma would need an added proxy (Accelerate) for the same safety.
- **Vercel Cron**, Hobby/free tier: capped at **once per day**, fired within a 1-hour window — this maps exactly onto the "daily snapshot" need, no workaround required.

---

## Flagship feature spec: the ZK Proof Lab (on-chain + ZK demo, unified)

Rather than building "a wallet feature" and "a ZK demo" as two separate things, they're combined into one walkthrough-able story — this is the single most important design decision in this plan:

> **Connect a wallet → enter a private input in the browser → generate a real ZK proof client-side → submit it on-chain → see your own transaction verified on Sepolia Etherscan.**

**Circuit:** a small, legible Noir circuit — *prove you hold a value inside a range (e.g. "age ≥ 18") without revealing the value itself* (a commitment + range-check). Simple enough to explain in an interview in two minutes, product-flavored enough to be memorable (more so than a bare hash-preimage demo).

**Contracts:**
- `contracts/Verifier.sol` — generated by `bb write_solidity_verifier`, not hand-written.
- `contracts/ProofRegistry.sol` — a small hand-written wrapper: `submitProof(proof, publicInputs)` calls the verifier, and on success emits `ProofVerified(address indexed prover, bytes32 proofHash, uint256 timestamp)`. This turns "verify a proof" from a free `view` call into a **real state-changing transaction** — the part that actually requires a connected wallet and costs (testnet) gas, making the on-chain-interaction story genuine rather than cosmetic.

**Client architecture:** proof generation runs in a **Web Worker** (`src/workers/prove.worker.ts`), wrapping `noir_js.execute()` + `bb.js`'s `UltraHonkBackend.generateProof()`, so the UI thread never blocks. Client-side verification (instant, no wallet needed) is offered as a "try it" step before the on-chain submission.

---

## Architecture additions (touch map)

```
circuits/
  range_proof/             # Noir circuit source (Nargo.toml, src/main.nr) — compiled locally, artifact committed
contracts/
  Verifier.sol              # generated via `bb write_solidity_verifier`
  ProofRegistry.sol          # hand-written wrapper, emits ProofVerified
  script/Deploy.ts           # one-time Sepolia deploy script (viem)
db/
  schema.ts                  # Drizzle schema: ecosystem_snapshots
  index.ts                   # Neon + Drizzle client (neon-http)
  migrations/
src/
  app/
    providers.tsx             # "use client" boundary: Wagmi + RainbowKit + QueryClient
    proof-lab/page.tsx         # the flagship demo page
    graph/page.tsx              # Knowledge Graph
    primitives/page.tsx          # glossary / domain-depth content
    api/cron/snapshot/route.ts    # daily metrics snapshot (CRON_SECRET-gated)
  components/
    proof-lab/                 # ProofForm, ProofWorkerStatus, VerifyOnChainButton, EtherscanLink
    wallet/                     # ConnectWalletButton (RainbowKit, restyled to match Proof Terminal)
    graph/                       # EcosystemGraph (react-flow), GraphLegend
    search/                       # CommandPalette (⌘K)
    charts/history-line-chart.tsx  # feeds off Drizzle-backed historical rows
  workers/
    prove.worker.ts
  lib/
    wagmi/config.ts
    contracts/verifier.ts        # deployed address + ABI (public, safe to commit)
    circuits/proof.ts             # noir_js/bb.js wrapper consumed by the worker
    metrics/snapshot.ts            # extracted, shared by both live render and the cron job
vercel.json                     # cron schedule registration
next.config.ts                  # updated: WASM handling for bb.js/noir_js
.github/workflows/ci.yml        # lint + test + build on push/PR
```

**Reused as-is:** `getRankedEcosystems`, the health/adoption engines, `ecoVar`/the identity-color system, `Badge`/chart components, the existing GitHub/DefiLlama fetch+ISR+retry pattern (mirrored for the new snapshot job).

---

## Environment & secrets

| Var | Where | Notes |
|---|---|---|
| `GITHUB_TOKEN` | Vercel + `.env.local` | existing |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Vercel + `.env.local` | free, from WalletConnect Cloud |
| `SEPOLIA_RPC_URL` | `.env.local` only (deploy script) | a public RPC is fine; app itself can use viem's default |
| `DEPLOYER_PRIVATE_KEY` | **local-only, never Vercel, never committed** | a **fresh, throwaway wallet holding only faucet testnet ETH** — used once to run the deploy script, then discard. Only the resulting **contract address** (public, safe) is checked in. |
| `DATABASE_URL` | Vercel + `.env.local` | Neon connection string |
| `CRON_SECRET` | Vercel only | authenticates the cron route via `Authorization: Bearer` |

---

## Risks & mitigations

- **Noir/bb.js beta API churn** → pin exact versions (no ranges); don't bulk-update this stack without re-checking.
- **Turbopack + WASM bundling** → documented workaround order above; `--webpack` is an explicit, supported escape hatch in Next 16, not a hack.
- **wagmi v3 trap** → pin `wagmi@2.8.8` exactly; re-verify peer deps before ever touching this stack again.
- **`nargo` isn't available on Vercel** → compile locally, commit the ACIR artifact; Vercel only ever installs npm packages.
- **Secrets hygiene for the deployer key** → throwaway wallet, testnet-only funds, key never stored beyond the one-time local deploy.
- **Vercel Hobby cron = daily only** → this is exactly the cadence needed; not a real constraint.
- **Historical charts start with one data point** → ship an honest "collecting history…" empty state until enough days accumulate; do not fabricate backdated data.
- **CI regressions in risky new code** → stand up CI *before* touching WASM/wallet bundling (Phase 0), so breakage is caught immediately, not at the next deploy.

---

## Roadmap (phases — see TASKS.md for the exact commit-sized breakdown)

1. **Phase 0 — CI safety net.** Lint/test/build on every push, before touching anything bundler-sensitive.
2. **Phase 1 — ZK Proof Lab.** Circuit, worker, UI, verifier + registry contracts, Sepolia deploy. *(The highest-signal, highest-risk phase — done first, while context is freshest.)*
3. **Phase 2 — Wallet integration.** wagmi/viem/RainbowKit provider tree, connect button, wire the Proof Lab's on-chain submission through it.
4. **Phase 3 — Historical data.** Neon + Drizzle + daily cron snapshot; real trend charts.
5. **Phase 4 — Knowledge Graph.** The original plan.md flagship feature, finally built.
6. **Phase 5 — Search.** Command-K palette across ecosystems/projects.
7. **Phase 6 — Content depth.** Primitives & Glossary page; cross-link ecosystem facts into it.
8. **Phase 7 — Packaging.** README as a case study, e2e smoke tests, perf/accessibility pass, demo materials.

## Success criteria / verification

- The Proof Lab demo runs end-to-end on the deployed site: generate a proof in-browser, connect a wallet, submit, and the resulting transaction is visible and verifiable on Sepolia Etherscan.
- `npm run build` succeeds on Vercel with zero manual intervention (the exact failure mode from the last incident does not recur).
- Historical trend charts show real, growing data a week after Phase 3 ships.
- The Knowledge Graph and Search are reachable from the navbar and work on mobile.
- `README.md` reads as a case study a recruiter can understand in under a minute, linking directly to the live Proof Lab.
- CI is green on every merge to `main`.

## Open decisions (revisit during build)
- Exact circuit shape for the range proof (age ≥ 18 vs. a more generic "value in range [a,b]") — lean toward the more generic version, framed with an age example in the UI copy.
- react-flow vs. a hand-rolled d3-force graph for the Knowledge Graph — lean react-flow for control and React idiom fit.
- Whether the "on-chain pulse" read-only widget (Phase 2, optional stretch) is worth the extra surface area — low priority, cut first if time runs short.
