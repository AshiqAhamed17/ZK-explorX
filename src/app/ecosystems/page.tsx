import type { Metadata } from "next";
import { getRankedEcosystems } from "@/lib/ecosystems";
import { EcosystemGrid } from "@/components/ecosystem/ecosystem-grid";

export const revalidate = 21600; // 6 hours

export const metadata: Metadata = {
  title: "Ecosystems",
  description:
    "Browse and filter Zero-Knowledge ecosystems — rollups, zkVMs, privacy networks, and ZK layer 1s — ranked by developer health.",
};

export default async function EcosystemsPage() {
  const ranked = await getRankedEcosystems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        ZK Ecosystems
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every ecosystem, ranked by a live developer-health score. Filter by
        category and click through for the full research dashboard.
      </p>

      <div className="mt-8">
        <EcosystemGrid ranked={ranked} />
      </div>
    </div>
  );
}
