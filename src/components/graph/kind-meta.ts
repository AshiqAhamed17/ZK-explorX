import { Code2, Cpu, Globe, Package, ShieldCheck } from "lucide-react";
import type { GraphNodeKind } from "@/data/graph";

/** Icon + label per node kind, shared by the node renderer and the legend. */
export const KIND_META: Record<GraphNodeKind, { label: string; icon: typeof Code2 }> = {
  ecosystem: { label: "Ecosystem", icon: Globe },
  language: { label: "Language", icon: Code2 },
  vm: { label: "VM", icon: Cpu },
  proofSystem: { label: "Proof System", icon: ShieldCheck },
  library: { label: "Library", icon: Package },
};

export const ALL_KINDS: GraphNodeKind[] = ["ecosystem", "language", "vm", "proofSystem", "library"];
