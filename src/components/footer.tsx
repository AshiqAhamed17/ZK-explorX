import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          ZK-explor<span className="text-primary">X</span> — explore the
          Zero-Knowledge ecosystem by developer health.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/ecosystems" className="hover:text-foreground">
            Ecosystems
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Methodology
          </Link>
          <span className="text-muted-foreground">
            Live data via GitHub
          </span>
        </div>
      </div>
    </footer>
  );
}
