import type { Metadata } from "next";
import { getRankedEcosystems } from "@/lib/ecosystems";
import { CompareTool } from "@/components/compare/compare-tool";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Compare Zero-Knowledge ecosystems side by side — health components, developer activity, and TVL trends.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const ranked = await getRankedEcosystems();
  const initialIds = (ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Compare ecosystems
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Put ZK networks side by side across developer health, activity, and
        on-chain adoption. Your selection is saved in the URL — copy it to share.
      </p>

      <div className="mt-8">
        <CompareTool ranked={ranked} initialIds={initialIds} />
      </div>
    </div>
  );
}
