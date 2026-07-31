"use client";

import { Binary, Check, Cpu, Loader2, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import type { ProveStage } from "@/lib/circuits/proof";
import { cn } from "@/lib/utils";

/** The proving pipeline, in the order the worker reports it. `initializing-
 *  backend` only fires the first time (the WASM backend is cached after), so
 *  on later proofs it simply resolves to "done" the moment proving starts. */
const STEPS: {
  stage: ProveStage;
  label: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    stage: "executing-circuit",
    label: "Execute circuit",
    detail: "Compute the witness from your inputs",
    icon: Binary,
  },
  {
    stage: "initializing-backend",
    label: "Initialize prover",
    detail: "Load the Barretenberg proving backend (WASM)",
    icon: Cpu,
  },
  {
    stage: "generating-proof",
    label: "Generate proof",
    detail: "Produce the UltraHonk zero-knowledge proof",
    icon: ShieldCheck,
  },
];

export function ProofWorkerStatus({
  current,
  proved,
}: {
  current: ProveStage | null;
  proved: boolean;
}) {
  const currentIndex = current ? STEPS.findIndex((s) => s.stage === current) : -1;

  return (
    <ol className="flex flex-col gap-1">
      {STEPS.map((step, i) => {
        const done = proved || (currentIndex >= 0 && i < currentIndex);
        const active = !proved && i === currentIndex;
        const Icon = step.icon;
        return (
          <li key={step.stage} className="flex items-start gap-3 rounded-lg px-2 py-2">
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                done && "border-success/40 bg-success/15 text-success",
                active && "border-primary/40 bg-primary/15 text-primary",
                !done && !active && "border-border text-muted-foreground/50",
              )}
            >
              {done ? (
                <Check className="size-3.5" />
              ) : active ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Icon className="size-3.5" />
              )}
            </span>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </div>
              <div className="text-xs text-muted-foreground">{step.detail}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
