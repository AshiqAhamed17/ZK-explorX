import type { Status } from "@/data/schema";
import { Badge } from "@/components/ui/badge";

const MAP: Record<Status, { label: string; variant: "success" | "warning" | "danger" }> = {
  mainnet: { label: "Mainnet", variant: "success" },
  testnet: { label: "Testnet", variant: "warning" },
  devnet: { label: "Devnet", variant: "danger" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = MAP[status];
  return (
    <Badge variant={variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
