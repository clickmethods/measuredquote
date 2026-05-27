import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Mic,
  Image as ImageIcon,
  CreditCard,
  Sparkles,
  PhoneCall,
  ArrowRight,
  FileImage,
  Wand2,
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  blurb: string;
  status: "preview" | "beta" | "live";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
};

const TOOLS: Tool[] = [
  {
    id: "ai-receptionist",
    name: "AI Receptionist",
    blurb: "Answer every missed call. Capture caller name, project type, urgency, and push the lead to your inbox.",
    status: "beta",
    icon: PhoneCall,
    href: "/demo/ai-receptionist",
  },
  {
    id: "voice-estimate",
    name: "Voice-to-Estimate",
    blurb: "Talk into your phone while you walk the job. Returns a structured estimate with materials, labor, and add-ons.",
    status: "preview",
    icon: Mic,
  },
  {
    id: "takeoff",
    name: "Photo / Blueprint Takeoff",
    blurb: "Upload a photo or plan PDF. AI auto-measures roofs, decks, and slabs to seed your estimate.",
    status: "preview",
    icon: FileImage,
  },
  {
    id: "stripe",
    name: "Stripe Deposits",
    blurb: "Branded payment portal for deposits, progress, and final payments — synced to your contract.",
    status: "preview",
    icon: CreditCard,
  },
  {
    id: "content-studio",
    name: "Content Studio",
    blurb: "Generate trade-specific ads, social posts, and seasonal email blasts from a single brief.",
    status: "preview",
    icon: Wand2,
  },
  {
    id: "gallery",
    name: "Before & After Gallery",
    blurb: "Auto-build a portfolio from completed jobs. Drop photos in, get SEO-ready case study pages out.",
    status: "preview",
    icon: ImageIcon,
  },
];

export function LabsTab() {
  return (
    <div className="space-y-5">
      <Card className="p-5 border-border bg-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40 text-foreground">
              <Sparkles className="h-3 w-3 mr-1 text-accent" /> Labs
            </Badge>
            <h3 className="font-display text-lg mt-3">Roadmap & previews</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Tools in active development. Click through for clickable previews. We unlock these for paid tenants as they ship.
            </p>
          </div>
          <Badge className="bg-accent text-accent-foreground font-mono text-[10px] uppercase">Q1 → Q3 roadmap</Badge>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const statusMap = {
    live: "bg-emerald-500/15 border-emerald-500/40",
    beta: "bg-accent/15 border-accent/40",
    preview: "bg-muted text-muted-foreground border-border",
  } as const;
  const inner = (
    <Card
      className="p-5 border-border bg-card hover-elevate h-full flex flex-col"
      data-testid={`labs-card-${tool.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-md bg-foreground text-background flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${statusMap[tool.status]}`}>
          {tool.status}
        </Badge>
      </div>
      <h4 className="font-display text-base text-foreground mt-4">{tool.name}</h4>
      <p className="text-sm text-muted-foreground mt-1 flex-1">{tool.blurb}</p>
      <div className="mt-4 text-xs font-medium text-foreground/80 flex items-center gap-1.5">
        {tool.href ? (
          <>
            Open preview <ArrowRight className="h-3 w-3" />
          </>
        ) : (
          <span className="text-muted-foreground">Roadmap · not yet active</span>
        )}
      </div>
    </Card>
  );

  if (tool.href) {
    return (
      <Link href={tool.href} className="block h-full" data-testid={`labs-link-${tool.id}`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
