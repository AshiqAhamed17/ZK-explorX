import { describe, expect, it } from "vitest";
import { scoreAdoption } from "./adoption";
import type { TvlData } from "@/types/metrics";

const tvl = (current: number): TvlData => ({ current, history: [{ date: 1, tvl: current }] });

describe("scoreAdoption", () => {
  it("returns an empty map when no ecosystem has TVL", () => {
    expect(scoreAdoption([{ slug: "a" }, { slug: "b" }])).toEqual({});
  });

  it("scores only TVL-bearing ecosystems, 0..100, highest = 100", () => {
    const out = scoreAdoption([
      { slug: "big", tvl: tvl(200_000_000) },
      { slug: "small", tvl: tvl(1_000_000) },
      { slug: "none" },
    ]);
    expect(out.none).toBeUndefined();
    expect(out.big).toBe(100);
    expect(out.small).toBeGreaterThanOrEqual(0);
    expect(out.big).toBeGreaterThan(out.small);
  });

  it("ignores zero/negative TVL", () => {
    const out = scoreAdoption([{ slug: "z", tvl: tvl(0) }, { slug: "p", tvl: tvl(5_000_000) }]);
    expect(out.z).toBeUndefined();
    expect(out.p).toBe(100);
  });
});
