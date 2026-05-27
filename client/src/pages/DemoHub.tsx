import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRADE_LIST } from "@/lib/trades";
import { TradeIcon } from "@/components/TradeIcon";
import { ArrowRight, Headphones, Sparkles } from "lucide-react";

const SHAPE_BY_TRADE: Record<string, string> = {
  concrete: "M50 30 L150 35 L160 75 L40 70 Z",
  asphalt: "M30 35 L170 25 L175 80 L25 78 Z",
  landscape: "M40 20 L160 30 L170 70 L100 85 L30 65 Z",
  decks: "M60 25 L140 25 L150 75 L50 75 Z",
  roofing: "M40 30 L100 15 L160 30 L160 80 L40 80 Z",
  fencing: "",
};

export default function DemoHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Demo hub</Badge>
        <h1 className="font-display text-3xl mt-4 text-foreground">Try every estimator. No login required.</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          These are the live homeowner-facing widgets your customers see. Each one is fully clickable —
          draw the area, swap materials, watch the range update.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6" data-testid="grid-demo-cards">
        {TRADE_LIST.map((t) => (
          <Link
            key={t.id}
            href={`/demo/${t.id}`}
            className="group block rounded-xl border border-border bg-card overflow-hidden hover-elevate active-elevate-2"
            data-testid={`card-demo-${t.id}`}
          >
              <div className="relative h-32 overflow-hidden">
                <div className="absolute inset-0 satellite-bg" />
                <svg className="absolute inset-0" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 100">
                  {t.unit === "lf" ? (
                    <path
                      d="M20 70 L60 45 L110 55 L170 30"
                      stroke="hsl(84 70% 55%)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d={SHAPE_BY_TRADE[t.id]}
                      fill="hsl(84 70% 50% / 0.25)"
                      stroke="hsl(84 70% 55%)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                <Badge className="absolute top-3 left-3 bg-foreground/80 text-background backdrop-blur font-mono text-[10px] uppercase">
                  {t.unit === "sqft" ? "Area" : "Linear ft"}
                </Badge>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-foreground">
                    <TradeIcon trade={t.id} className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-display text-lg text-foreground">{t.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 min-h-[2.5rem]">{t.tagline}</p>
                <div className="mt-4 inline-flex items-center text-sm text-foreground/80 group-hover:text-accent font-medium">
                  Try estimator <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
          </Link>
        ))}

        {/* AI Receptionist clickable demo */}
        <Link
          href="/demo/ai-receptionist"
          className="group block rounded-xl border border-border bg-card overflow-hidden hover-elevate active-elevate-2"
          data-testid="card-demo-ai-receptionist"
        >
          <div className="relative h-32 overflow-hidden grid place-items-center">
            <div className="absolute inset-0 bg-foreground" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <Headphones className="h-10 w-10 text-accent relative z-10" />
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-mono text-[10px] uppercase">
              <Sparkles className="h-3 w-3 mr-1" /> New demo
            </Badge>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-foreground">
                <Headphones className="h-4.5 w-4.5" />
              </div>
              <span className="font-display text-lg text-foreground">AI Receptionist</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 min-h-[2.5rem]">
              24/7 voice agent that answers missed calls and books site visits. No microphone needed.
            </p>
            <div className="mt-4 inline-flex items-center text-sm text-foreground/80 group-hover:text-accent font-medium">
              Try simulated call <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 mb-10">
        <Card className="p-6 border-border bg-card flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-foreground">See it from the contractor side</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Every estimate you complete here lands in the contractor dashboard. Open it in another tab and watch
              leads stack up in real time.
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90" data-testid="link-demo-to-dashboard">
            Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Card>
      </div>

      <SiteFooter />
    </div>
  );
}
