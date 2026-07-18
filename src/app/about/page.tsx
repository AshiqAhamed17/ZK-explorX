import type { Metadata } from "next";
import Link from "next/link";
import {
  HEALTH_COMPONENT_LABELS,
  HEALTH_WEIGHTS,
  type HealthComponentKey,
} from "@/lib/health";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How ZK-explorX curates data and computes the Ecosystem Health Score — data tiers, sources, and the transparent scoring formula.",
};

const COMPONENT_DETAIL: Record<HealthComponentKey, string> = {
  activity: "Commits over the last 90 days and total contributors across core repositories.",
  momentum: "Number of releases in the last 90 days and how recently the latest release shipped.",
  community: "GitHub stars and contributor count — a proxy for mindshare and participation.",
  maintenance: "Recency of the latest push and open-issue load relative to repository count.",
  breadth: "How many core repositories and notable projects make up the ecosystem.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p className="mt-3 text-muted-foreground">
        ZK-explorX ranks Zero-Knowledge ecosystems by how healthy their
        developer communities are — not by token price or market cap. Here is
        exactly how the data and scores are produced.
      </p>

      <Section title="Where the data comes from">
        <p>Every ecosystem combines three tiers of data:</p>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <span className="font-medium text-foreground">Curated.</span>{" "}
            Slow-changing facts — architecture, proof system, VM, languages,
            token, foundation, and official links — are hand-authored and
            validated against a strict schema.
          </li>
          <li>
            <span className="font-medium text-foreground">Live.</span>{" "}
            Quantitative signals — stars, forks, commits, contributors,
            releases, and issues — are fetched from the GitHub REST API across
            each ecosystem&apos;s core repositories and cached for six hours.
          </li>
          <li>
            <span className="font-medium text-foreground">Adoption.</span>{" "}
            Total value locked for rollups comes live from DefiLlama, cached the
            same way. It is tracked as a separate dimension — never folded into
            the developer health score.
          </li>
          <li>
            <span className="font-medium text-foreground">Computed.</span>{" "}
            The Health Score and the cohort-relative Adoption score are derived
            from the live signals at request time.
          </li>
        </ul>
      </Section>

      <Section title="The Ecosystem Health Score">
        <p>
          Each ecosystem receives a 0–100 score. Every component is normalized{" "}
          <em>relative to the tracked set</em> (on a log scale for skewed count
          metrics), so the score answers &ldquo;how does this ecosystem compare
          to its ZK peers today.&rdquo; The components and weights:
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {(Object.keys(HEALTH_WEIGHTS) as HealthComponentKey[]).map((key) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-foreground">
                  {HEALTH_COMPONENT_LABELS[key]}
                </div>
                <div className="mt-0.5 text-xs">{COMPONENT_DETAIL[key]}</div>
              </div>
              <div className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                {Math.round(HEALTH_WEIGHTS[key] * 100)}%
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Honest limitations">
        <ul className="flex flex-col gap-2">
          <li>
            Scores are <span className="font-medium text-foreground">relative</span>,
            not absolute — a rising tide across all ecosystems will not inflate
            everyone&apos;s number.
          </li>
          <li>
            GitHub activity is a strong but imperfect proxy for ecosystem
            health; closed-source work and off-GitHub development are invisible.
          </li>
          <li>
            The weekly commit-activity chart depends on a GitHub statistics
            endpoint that occasionally needs a moment to compute; it fills in on
            a later refresh.
          </li>
          <li>
            Curated facts reflect the maintainer&apos;s best understanding and
            may lag major protocol changes.
          </li>
        </ul>
      </Section>

      <Section title="Why Adoption is separate">
        <p>
          A rollup with high TVL is not automatically &ldquo;healthier&rdquo;
          than a zkVM or privacy network with none — TVL simply doesn&apos;t
          apply to every design. So Adoption is scored only within the cohort of
          ecosystems that actually have on-chain value, and shown alongside the
          health score rather than blended into it. The premise holds: developer
          health is ranked on developer signals.
        </p>
      </Section>

      <Section title="Roadmap">
        <p>
          Shipped so far: the health leaderboard, per-ecosystem dashboards, a
          project explorer, live TVL and adoption, and side-by-side compare.
          Planned next: historical health/star trends backed by a datastore,
          full-text search, and an interactive ecosystem knowledge graph.
        </p>
      </Section>

      <div className="mt-10 border-t border-border pt-6">
        <Link href="/ecosystems" className="text-sm text-primary hover:underline">
          ← Back to ecosystems
        </Link>
      </div>
    </div>
  );
}
