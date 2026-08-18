import { z } from "zod";

/**
 * Curated glossary for the `/primitives` reference page (Phase 6). Same
 * validate-on-load discipline as the ecosystem data: a Zod schema is the
 * single source of truth for both the shape and the TypeScript type, so bad
 * data fails the build instead of shipping silently.
 */

export const GLOSSARY_CATEGORIES = ["proof-system", "vm", "concept"] as const;
export const GlossaryCategorySchema = z.enum(GLOSSARY_CATEGORIES);
export type GlossaryCategory = z.infer<typeof GlossaryCategorySchema>;

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  "proof-system": "Proof Systems",
  vm: "Virtual Machines",
  concept: "Key Terms",
};

export const GlossaryTermSchema = z.object({
  /** URL-safe anchor id, e.g. "stark" -> /primitives#stark. */
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
  term: z.string().min(1),
  category: GlossaryCategorySchema,
  definition: z.string().min(1),
  /** Matching node id in the Phase 4 knowledge graph, if any (cross-linking). */
  graphNodeId: z.string().optional(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

const raw: GlossaryTerm[] = [
  // --- Proof systems ---
  {
    id: "snark",
    term: "SNARK",
    category: "proof-system",
    definition:
      "Succinct Non-interactive ARgument of Knowledge — a broad family of zero-knowledge proof systems whose proofs are succinct (small and fast to verify, regardless of how large the underlying computation was) and non-interactive (the prover sends one proof; no back-and-forth with the verifier). Groth16, PLONK, and Halo2 are all SNARK constructions — they differ mainly in whether they need a trusted setup and how they represent computation.",
    graphNodeId: "proofSystem:snark",
  },
  {
    id: "stark",
    term: "STARK",
    category: "proof-system",
    definition:
      "Scalable Transparent ARgument of Knowledge — a proof system that needs no trusted setup (\"transparent\") and relies only on collision-resistant hash functions, making it plausibly secure even against quantum computers. STARKs trade larger proof sizes for that transparency and quantum resistance. Most STARK provers — Starknet, RISC Zero, SP1, ZKsync's Boojum — build on the FRI protocol underneath.",
    graphNodeId: "proofSystem:stark",
  },
  {
    id: "plonk",
    term: "PLONK",
    category: "proof-system",
    definition:
      "A universal SNARK construction: one trusted-setup ceremony works for any circuit up to a fixed size, instead of needing a fresh ceremony per circuit like Groth16. That flexibility made PLONK a popular base for faster later variants — UltraPLONK and UltraHonk (used by Aztec's Barretenberg) among them.",
    graphNodeId: "proofSystem:plonk",
  },
  {
    id: "groth16",
    term: "Groth16",
    category: "proof-system",
    definition:
      "An extremely compact, fast-to-verify SNARK — often the smallest proofs of any system — at the cost of needing a dedicated trusted-setup ceremony for every distinct circuit. Because of its small size, Groth16 is commonly used as a final \"wrapping\" step around a larger STARK proof (as RISC Zero does) to make on-chain verification cheaper.",
    graphNodeId: "proofSystem:groth16",
  },
  {
    id: "fri",
    term: "FRI",
    category: "proof-system",
    definition:
      "Fast Reed–Solomon Interactive oracle proof of proximity — the polynomial-commitment scheme underneath most STARK provers. FRI lets a prover convince a verifier that a function is close to a low-degree polynomial using only hashing, which is what gives STARKs their transparency and quantum resistance. Plonky2, Plonky3, and Boojum are all FRI-based proving toolkits.",
    graphNodeId: "proofSystem:fri",
  },
  {
    id: "halo2",
    term: "Halo2",
    category: "proof-system",
    definition:
      "A PLONKish proof system, originally built at Zcash and now maintained by the Privacy & Scaling Explorations team, that removes the need for a trusted setup by using a different polynomial commitment scheme. Scroll's zkEVM prover is built on Halo2.",
    graphNodeId: "proofSystem:halo2",
  },

  // --- Virtual machines ---
  {
    id: "zkevm",
    term: "zkEVM",
    category: "vm",
    definition:
      "A virtual machine that executes standard Ethereum bytecode while producing a validity proof of correct execution. zkEVMs differ in how closely they match real Ethereum — \"Type 1\" is fully equivalent at the consensus level, \"Type 2\" is EVM-equivalent (same bytecode, minor differences elsewhere), and \"Type 3\"/\"Type 4\" trade some compatibility for proving efficiency. Linea, Scroll, Polygon zkEVM, and ZKsync Era all run some flavor of zkEVM.",
    graphNodeId: "vm:zkevm",
  },
  {
    id: "cairo-vm",
    term: "Cairo VM",
    category: "vm",
    definition:
      "Starknet's native execution environment, built specifically to be efficient to prove rather than to match the EVM. Contracts are written in Cairo — a Rust-like language purpose-built for STARK-provable computation — instead of Solidity.",
    graphNodeId: "vm:cairo-vm",
  },
  {
    id: "risc-v-zkvm",
    term: "RISC-V zkVM",
    category: "vm",
    definition:
      "A general-purpose zkVM that proves execution of standard RISC-V machine code, meaning it can run ordinary Rust, C, or C++ programs (compiled to RISC-V) inside a proof without needing a domain-specific circuit language at all. RISC Zero and SP1 are the two leading RISC-V zkVMs.",
    graphNodeId: "vm:risc-v-zkvm",
  },

  // --- Key terms ---
  {
    id: "zero-knowledge",
    term: "Zero-Knowledge Proof",
    category: "concept",
    definition:
      "A cryptographic method letting a prover convince a verifier that a statement is true without revealing anything else about why it's true. In most production systems the \"zero-knowledge\" property is actually optional — rollups mainly use validity proofs for succinct verification (compressing a large computation into a small, fast-to-check proof), not for hiding data.",
  },
  {
    id: "trusted-setup",
    term: "Trusted Setup",
    category: "concept",
    definition:
      "A one-time ceremony that generates public parameters a proof system needs, using randomness that must be destroyed afterward (the \"toxic waste\"). If any participant retains that randomness, they could forge fake proofs. STARKs and Halo2 avoid this entirely (a \"transparent\" setup); Groth16 and PLONK require it — PLONK's is reusable across circuits, Groth16's is not.",
  },
  {
    id: "circuit",
    term: "Circuit / Arithmetization",
    category: "concept",
    definition:
      "Arithmetization is the process of expressing a computation as a system of polynomial equations a proof system can prove satisfiability of. The result — a \"circuit\" — is the provable equivalent of a program; compilers like Noir's or Cairo's translate ordinary-looking code down into this constraint representation.",
  },
  {
    id: "witness",
    term: "Witness",
    category: "concept",
    definition:
      "The private inputs to a circuit that make its constraints satisfied — the \"solution\" the prover knows and the proof attests to, without ever revealing the witness itself to the verifier.",
  },
  {
    id: "recursion",
    term: "Recursive Proving",
    category: "concept",
    definition:
      "Using one proof as an input to another proof, letting a prover verify many proofs inside a single new proof. This is how systems compress thousands of transactions into one final proof (Starknet's recursion, Mina's Pickles) or wrap a slow proof in a faster, smaller one (RISC Zero's Groth16 wrapper around its STARK).",
  },
  {
    id: "prover-verifier",
    term: "Prover / Verifier",
    category: "concept",
    definition:
      "The two roles in a proof system: the prover does the often-expensive work of generating a proof of correct execution, and the verifier checks that proof — a step that should be dramatically cheaper than redoing the original computation. That asymmetry is what lets a proof be checked on-chain for a fraction of the gas the original computation would have cost.",
  },
];

function loadGlossary(): GlossaryTerm[] {
  const parsed = raw.map((t) => {
    const result = GlossaryTermSchema.safeParse(t);
    if (!result.success) {
      throw new Error(`Invalid glossary term "${(t as { id?: string }).id ?? "<unknown>"}":\n${result.error.toString()}`);
    }
    return result.data;
  });

  const ids = new Set<string>();
  for (const t of parsed) {
    if (ids.has(t.id)) throw new Error(`Duplicate glossary term id: ${t.id}`);
    ids.add(t.id);
  }

  return parsed;
}

export const glossary: GlossaryTerm[] = loadGlossary();

export const glossaryByCategory: Record<GlossaryCategory, GlossaryTerm[]> = {
  "proof-system": glossary.filter((t) => t.category === "proof-system"),
  vm: glossary.filter((t) => t.category === "vm"),
  concept: glossary.filter((t) => t.category === "concept"),
};

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossary.find((t) => t.id === id);
}
