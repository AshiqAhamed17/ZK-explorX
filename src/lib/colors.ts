/**
 * Per-ecosystem color identity — the signature of the "Proof Terminal" design.
 *
 * Each ecosystem owns ONE hue used consistently everywhere it appears (leaderboard
 * dot, sparkline, radar line, project tag, compare series) — the way Dune colors a
 * query's series. Hues come from the dataviz skill's validated categorical palette
 * (10 slots, CVD-checked with scripts/validate_palette.js against our surfaces:
 * dark all-pass on #111214; light all-pass on #ffffff). Do not hand-pick new hues
 * without re-running that validator.
 *
 * Colors are exposed to the DOM as CSS custom properties (`--eco-<slug>`, defined
 * per theme in globals.css) so light/dark swap in one place and SVG/Recharts can
 * consume them as `var(--eco-<slug>)`. The raw hex maps here are for the few places
 * that need a literal value (tests, non-CSS contexts).
 */

export interface EcoColor {
  light: string;
  dark: string;
}

export const ECOSYSTEM_COLORS: Record<string, EcoColor> = {
  zksync: { light: "#2a78d6", dark: "#3987e5" }, // blue
  aleo: { light: "#1baf7a", dark: "#199e70" }, // aqua
  scroll: { light: "#eda100", dark: "#c98500" }, // yellow
  "risc-zero": { light: "#008300", dark: "#008300" }, // green
  "polygon-zkevm": { light: "#4a3aa7", dark: "#9085e9" }, // violet
  mina: { light: "#e34948", dark: "#e66767" }, // red
  aztec: { light: "#e87ba4", dark: "#d55181" }, // magenta
  starknet: { light: "#eb6834", dark: "#d95926" }, // orange
  linea: { light: "#0e8fa0", dark: "#0f93a6" }, // cyan
  sp1: { light: "#5f8f10", dark: "#6a9a00" }, // lime
};

const FALLBACK: EcoColor = { light: "#52514e", dark: "#9BA0A6" };

/** CSS reference for an ecosystem's identity color (theme-aware via globals.css). */
export function ecoVar(slug: string): string {
  return ECOSYSTEM_COLORS[slug] ? `var(--eco-${slug})` : "var(--muted-foreground)";
}

/** A translucent wash of an ecosystem's color (e.g. area-chart fills, chips). */
export function ecoWash(slug: string, pct = 14): string {
  return `color-mix(in srgb, ${ecoVar(slug)} ${pct}%, transparent)`;
}

/** Literal hex for a given theme — for tests / non-CSS contexts. */
export function ecoHex(slug: string, mode: "light" | "dark" = "dark"): string {
  return (ECOSYSTEM_COLORS[slug] ?? FALLBACK)[mode];
}

/** The `[--eco-*]` declarations for one theme, injected into globals.css. */
export function ecoCssBlock(mode: "light" | "dark"): string {
  return Object.entries(ECOSYSTEM_COLORS)
    .map(([slug, c]) => `  --eco-${slug}: ${c[mode]};`)
    .join("\n");
}
