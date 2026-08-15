import type { Metadata } from "next";
import { EcosystemGraph } from "@/components/graph/ecosystem-graph";

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description:
    "The ZK ecosystem as a graph — how ecosystems share languages, VMs, proof systems, and proving libraries.",
};

export default function GraphPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Knowledge Graph
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every ecosystem, and the languages, virtual machines, proof systems, and
        shared proving libraries connecting them. Drag to pan, scroll to zoom,
        click an ecosystem to open its page.
      </p>

      <div className="mt-8">
        <EcosystemGraph />
      </div>
    </div>
  );
}
