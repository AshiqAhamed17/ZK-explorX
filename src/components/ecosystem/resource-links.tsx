import {
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  MessageCircle,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Links } from "@/data/schema";
import { GitHubIcon, XIcon } from "@/components/brand-icons";

const RESOURCES: {
  key: keyof Links;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { key: "website", label: "Website", icon: Globe },
  { key: "docs", label: "Documentation", icon: BookOpen },
  { key: "github", label: "GitHub", icon: GitHubIcon },
  { key: "explorer", label: "Explorer", icon: Search },
  { key: "whitepaper", label: "Whitepaper", icon: FileText },
  { key: "blog", label: "Blog", icon: Newspaper },
  { key: "discord", label: "Discord", icon: MessageCircle },
  { key: "twitter", label: "Twitter / X", icon: XIcon },
  { key: "forum", label: "Forum", icon: Users },
];

export function ResourceLinks({ links }: { links: Links }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {RESOURCES.map(({ key, label, icon: Icon }) => {
        const href = links[key];
        if (!href) return null;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
          >
            <Icon className="size-4 text-muted-foreground" />
            <span className="flex-1 truncate">{label}</span>
            <ExternalLink className="size-3.5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
          </a>
        );
      })}
    </div>
  );
}
