import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duplicating conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatting: 1234 -> "1.2k", 1_500_000 -> "1.5M". */
export function formatCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Full number with thousands separators. */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en").format(n);
}

/** Compact USD, e.g. 1_234_567 -> "$1.2M". */
export function formatUsd(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  // Below 1000, "compact" notation doesn't abbreviate anyway, but different
  // Intl/ICU implementations (Node vs. browser) disagree on whether to show
  // a trailing ".0" for it ($289 vs $289.0) — an SSR/client hydration
  // mismatch. Sidestep the ambiguity: use plain whole-dollar formatting
  // below 1000, and only reach for compact notation where abbreviation
  // actually applies.
  if (Math.abs(n) < 1000) {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Relative "time ago" from an ISO date string. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.round((Date.now() - then) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs || unit === "minute") {
      return rtf.format(-Math.round(seconds / secs), unit);
    }
  }
  return "just now";
}
