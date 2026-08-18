import { ecosystems } from "@/data";

/**
 * The ZK Knowledge Graph's data model (Phase 4).
 *
 * Ecosystem nodes and their language edges are *derived* straight from the
 * curated `Ecosystem` records (`ecosystems[].languages` is already a clean,
 * atomic array). VM and proof-system families, and the shared-library layer,
 * are *hand-authored*: the curated `vm`/`proofSystem` fields are free prose
 * ("zk-STARK + SNARK (Plonky2)", "zkEVM (Type 3 → 2)", …) written for human
 * reading, not clean identifiers — canonicalizing them by hand is what turns
 * "every ecosystem has its own unique-looking VM string" into the real,
 * shared families (four ecosystems' VMs really are all "zkEVM"; five
 * ecosystems' proof systems really do share STARK/FRI underneath) that make
 * this a *knowledge* graph instead of a re-skinned ecosystem list.
 */

export type GraphNodeKind =
  | "ecosystem"
  | "language"
  | "vm"
  | "proofSystem"
  | "library";

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  /** Ecosystem nodes only — links back to the curated record + its detail page. */
  slug?: string;
  /** Short human-readable gloss, shown on hover/selection. */
  description?: string;
}

export type GraphEdgeKind =
  | "language" // ecosystem --writes-in--> language
  | "vm" // ecosystem --runs-on--> vm family
  | "proofSystem" // ecosystem --secured-by--> proof-system family
  | "library" // ecosystem --built-with--> shared library
  | "pipeline" // language/library --compiles-to/proven-by--> library
  | "implements"; // library --implements--> proof-system family

export interface GraphEdge {
  source: string;
  target: string;
  kind: GraphEdgeKind;
}

export interface EcosystemGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const ecoId = (slug: string) => `ecosystem:${slug}`;
const langId = (name: string) => `language:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const vmId = (name: string) => `vm:${name}`;
const proofId = (name: string) => `proofSystem:${name}`;
const libId = (name: string) => `library:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/** One curated string sometimes conflates a language with the framework it's
 * paired with — split those out so the language node stays atomic and the
 * framework becomes its own library node + edge. */
const LANGUAGE_ALIASES: Record<string, string> = {
  "TypeScript (o1js)": "TypeScript",
};

// ---- VM families (hand-authored) ------------------------------------------

const VM_FAMILIES: { id: string; label: string; description: string }[] = [
  { id: "cairo-vm", label: "Cairo VM", description: "Native provable VM executing Cairo bytecode." },
  { id: "zkevm", label: "zkEVM", description: "EVM-equivalent execution environment, proven in ZK." },
  { id: "risc-v-zkvm", label: "RISC-V zkVM", description: "General-purpose zkVM executing standard RISC-V." },
  { id: "aleo-vm", label: "AleoVM", description: "snarkVM-based VM for private Aleo programs." },
  { id: "aztec-vm", label: "Aztec VM", description: "Combined private + public execution environment." },
  { id: "mina-zkapps", label: "Mina zkApps", description: "Account-model VM for o1js zkApps." },
];

/** Ecosystem slug -> raw VM-family ids (same ids the `/primitives` glossary
 * uses), for cross-linking a curated `vm` fact to its glossary entry. */
export const ECOSYSTEM_VM: Record<string, string[]> = {
  starknet: ["cairo-vm"],
  linea: ["zkevm"],
  "polygon-zkevm": ["zkevm"],
  scroll: ["zkevm"],
  zksync: ["zkevm"],
  "risc-zero": ["risc-v-zkvm"],
  sp1: ["risc-v-zkvm"],
  aleo: ["aleo-vm"],
  aztec: ["aztec-vm"],
  mina: ["mina-zkapps"],
};

// ---- Proof-system families (hand-authored) --------------------------------

const PROOF_SYSTEMS: { id: string; label: string; description: string }[] = [
  { id: "stark", label: "STARK", description: "Transparent, post-quantum-secure proof system." },
  { id: "fri", label: "FRI", description: "Fast Reed-Solomon IOP — the commitment scheme underlying most STARK-family provers." },
  { id: "plonk", label: "PLONK", description: "Universal SNARK with a single trusted setup, many variants." },
  { id: "groth16", label: "Groth16", description: "Compact, circuit-specific SNARK, popular as a final-step wrapper." },
  { id: "halo2", label: "Halo2", description: "PLONKish proof system with no trusted setup, via IPA/KZG commitments." },
  { id: "snark", label: "SNARK (other)", description: "A zk-SNARK construction not otherwise named above." },
];

/** Ecosystem slug -> raw proof-system ids (same ids the `/primitives`
 * glossary uses), for cross-linking a curated `proofSystem` fact. */
export const ECOSYSTEM_PROOF_SYSTEM: Record<string, string[]> = {
  starknet: ["stark", "fri"],
  zksync: ["plonk", "stark", "fri"],
  aztec: ["plonk"],
  mina: ["plonk"],
  linea: ["snark"],
  aleo: ["snark"],
  "polygon-zkevm": ["stark", "fri", "snark"],
  "risc-zero": ["stark", "fri", "groth16"],
  sp1: ["stark", "fri", "snark"],
  scroll: ["halo2"],
};

// ---- Shared libraries (hand-authored) --------------------------------------

const LIBRARIES: { id: string; label: string; description: string }[] = [
  { id: "acvm", label: "ACVM", description: "Noir's Abstract Circuit VM — the intermediate representation Noir compiles to." },
  { id: "barretenberg", label: "Barretenberg", description: "Aztec Labs' PLONK/UltraHonk proving backend; also powers this app's own ZK Proof Lab." },
  { id: "gnark", label: "gnark", description: "Go zk-SNARK toolkit (ConsenSys) used by Linea's prover." },
  { id: "plonky2", label: "Plonky2", description: "Polygon's fast recursive STARK/SNARK hybrid prover." },
  { id: "plonky3", label: "Plonky3", description: "Succinct's modular STARK proving toolkit powering SP1." },
  { id: "boojum", label: "Boojum", description: "ZKsync's in-house STARK-based prover." },
  { id: "snarkvm", label: "snarkVM", description: "Aleo's proving stack (Varuna/Marlin arguments)." },
  { id: "o1js", label: "o1js", description: "TypeScript framework for Mina zkApps and general-purpose circuits." },
];

const ECOSYSTEM_LIBRARY: Record<string, string[]> = {
  aztec: ["acvm", "barretenberg"],
  linea: ["gnark"],
  "polygon-zkevm": ["plonky2"],
  sp1: ["plonky3"],
  zksync: ["boojum"],
  aleo: ["snarkvm"],
  mina: ["o1js"],
};

/** language/library -> library "compiles to / proven by" pipeline edges. */
const PIPELINE_EDGES: { from: string; fromKind: "language" | "library"; to: string }[] = [
  { from: "Noir", fromKind: "language", to: "acvm" },
  { from: "acvm", fromKind: "library", to: "barretenberg" },
];

/** library -> proof-system "implements" edges. */
const IMPLEMENTS_EDGES: [library: string, proofSystem: string][] = [
  ["barretenberg", "plonk"],
  ["gnark", "snark"],
  ["plonky2", "fri"],
  ["plonky3", "fri"],
  ["boojum", "fri"],
  ["snarkvm", "snark"],
];

function buildGraph(): EcosystemGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenLanguages = new Set<string>();

  for (const e of ecosystems) {
    nodes.push({ id: ecoId(e.slug), kind: "ecosystem", label: e.name, slug: e.slug, description: e.tagline });

    for (const rawLang of e.languages) {
      const name = LANGUAGE_ALIASES[rawLang] ?? rawLang;
      if (!seenLanguages.has(name)) {
        seenLanguages.add(name);
        nodes.push({ id: langId(name), kind: "language", label: name });
      }
      edges.push({ source: ecoId(e.slug), target: langId(name), kind: "language" });
    }

    for (const vm of ECOSYSTEM_VM[e.slug] ?? []) {
      edges.push({ source: ecoId(e.slug), target: vmId(vm), kind: "vm" });
    }
    for (const ps of ECOSYSTEM_PROOF_SYSTEM[e.slug] ?? []) {
      edges.push({ source: ecoId(e.slug), target: proofId(ps), kind: "proofSystem" });
    }
    for (const lib of ECOSYSTEM_LIBRARY[e.slug] ?? []) {
      edges.push({ source: ecoId(e.slug), target: libId(lib), kind: "library" });
    }
  }

  for (const vm of VM_FAMILIES) {
    nodes.push({ id: vmId(vm.id), kind: "vm", label: vm.label, description: vm.description });
  }
  for (const ps of PROOF_SYSTEMS) {
    nodes.push({ id: proofId(ps.id), kind: "proofSystem", label: ps.label, description: ps.description });
  }
  for (const lib of LIBRARIES) {
    nodes.push({ id: libId(lib.id), kind: "library", label: lib.label, description: lib.description });
  }

  for (const p of PIPELINE_EDGES) {
    const source = p.fromKind === "language" ? langId(p.from) : libId(p.from);
    edges.push({ source, target: libId(p.to), kind: "pipeline" });
  }
  for (const [lib, ps] of IMPLEMENTS_EDGES) {
    edges.push({ source: libId(lib), target: proofId(ps), kind: "implements" });
  }

  return { nodes, edges };
}

export const ecosystemGraph: EcosystemGraph = buildGraph();
