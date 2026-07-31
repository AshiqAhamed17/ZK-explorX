"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Sparkles, Loader2 } from "lucide-react";
import type { RangeProofInput } from "@/lib/circuits/proof";
import { cn } from "@/lib/utils";

/**
 * Collects the private value and the public [min, max] range, then hands a
 * validated `RangeProofInput` up to the page to prove. The private value is
 * masked by default (and never leaves the browser) to make the "this is
 * secret" contract tangible.
 */

function parseU64(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}

export function ProofForm({
  onGenerate,
  busy,
}: {
  onGenerate: (input: RangeProofInput) => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("25");
  const [min, setMin] = useState("18");
  const [max, setMax] = useState("120");
  const [reveal, setReveal] = useState(false);

  const parsed = {
    value: parseU64(value),
    min: parseU64(min),
    max: parseU64(max),
  };
  const rangeValid = parsed.min !== null && parsed.max !== null && parsed.min <= parsed.max;
  const allValid = parsed.value !== null && rangeValid;

  function submit() {
    if (!allValid || busy) return;
    onGenerate({ value: parsed.value!, min: parsed.min!, max: parsed.max! });
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Private input */}
      <div>
        <label htmlFor="pl-value" className="flex items-center gap-1.5 text-sm font-medium">
          <Lock className="size-3.5 text-primary" />
          Secret value
          <span className="font-data ml-auto text-[10px] uppercase tracking-wider text-primary">
            private
          </span>
        </label>
        <div className="mt-1.5 flex items-center rounded-lg border border-input bg-card focus-within:border-primary/50">
          <input
            id="pl-value"
            inputMode="numeric"
            type={reveal ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={busy}
            className="font-data w-full bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60"
            placeholder="e.g. your age"
            aria-invalid={parsed.value === null}
          />
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="px-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={reveal ? "Hide value" : "Reveal value"}
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Stays on your device. It is never sent anywhere and never appears in the proof.
        </p>
      </div>

      {/* Public range */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: "pl-min", label: "Min", val: min, set: setMin, ok: parsed.min !== null },
            { id: "pl-max", label: "Max", val: max, set: setMax, ok: parsed.max !== null },
          ] as const
        ).map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="flex items-center gap-1.5 text-sm font-medium">
              {f.label}
              <span className="font-data ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                public
              </span>
            </label>
            <input
              id={f.id}
              inputMode="numeric"
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              disabled={busy}
              aria-invalid={!f.ok}
              className={cn(
                "font-data mt-1.5 w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50 disabled:opacity-60",
                f.ok ? "border-input" : "border-danger/50",
              )}
            />
          </div>
        ))}
      </div>

      {!rangeValid && parsed.min !== null && parsed.max !== null ? (
        <p className="text-xs text-danger">Min must be less than or equal to Max.</p>
      ) : null}

      <button
        type="submit"
        disabled={!allValid || busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Proving…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            Generate proof
          </>
        )}
      </button>
    </form>
  );
}
