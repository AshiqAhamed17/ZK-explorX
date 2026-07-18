import Link from "next/link";
import { GitHubIcon } from "@/components/brand-icons";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/ecosystems", label: "Ecosystems" },
  { href: "/about", label: "Methodology" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <span className="text-sm font-bold">Z</span>
          </span>
          <span className="text-sm font-semibold tracking-tight">
            ZK-explor<span className="text-primary">X</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <GitHubIcon className="size-4" />
          </a>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
