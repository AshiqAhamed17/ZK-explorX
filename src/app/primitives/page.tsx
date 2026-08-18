import type { Metadata } from "next";
import Link from "next/link";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABELS,
  glossaryByCategory,
} from "@/data/glossary";

export const metadata: Metadata = {
  title: "Primitives & Glossary",
  description:
    "A compact glossary of ZK proof systems, VM types, and key terms — SNARK, STARK, PLONK, Groth16, FRI, zkEVM, and more.",
};

export default function PrimitivesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Primitives &amp; Glossary
      </h1>
      <p className="mt-3 text-muted-foreground">
        The proof systems, virtual machines, and core cryptographic terms that
        show up across every ecosystem in this directory — explained once,
        here, and linked to from wherever they&apos;re used.
      </p>

      {GLOSSARY_CATEGORIES.map((category) => (
        <section key={category} className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {GLOSSARY_CATEGORY_LABELS[category]}
          </h2>
          <dl className="mt-4 flex flex-col gap-6">
            {glossaryByCategory[category].map((t) => (
              <div key={t.id} id={t.id} className="scroll-mt-20">
                <dt className="font-display text-base font-medium">{t.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div className="mt-10 border-t border-border pt-6">
        <Link href="/ecosystems" className="text-sm text-primary hover:underline">
          ← Back to ecosystems
        </Link>
      </div>
    </div>
  );
}
