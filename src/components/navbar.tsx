import Link from "next/link";
import { GitHubIcon } from "@/components/brand-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";

const NAV_LINKS = [
  { href: "/ecosystems", label: "Ecosystems" },
  { href: "/projects", label: "Projects" },
  { href: "/compare", label: "Compare" },
  { href: "/proof-lab", label: "Proof Lab" },
  { href: "/about", label: "Methodology" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25">
            <span className="font-display text-sm font-bold">Z</span>
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            ZK-explor<span className="text-primary">X</span>
          </span>
          <span className="font-data hidden text-[10px] uppercase tracking-widest text-muted-foreground/70 sm:inline">
            ·&nbsp; zk index
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="ml-1 hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <GitHubIcon className="size-4" />
          </a>
          <div className="ml-1">
            <ConnectWalletButton />
          </div>
          <div className="ml-1">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
