import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SatelliteMap } from "@/components/SatelliteMap";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Code2,
  Globe2,
  Inbox,
  LineChart,
  Map,
  MessageSquare,
  Phone,
  PlugZap,
  Ruler,
  Sparkles,
  Zap,
} from "lucide-react";
import { TRADE_LIST } from "@/lib/trades";
import { TradeIcon } from "@/components/TradeIcon";
import { RoiCalculator } from "@/components/RoiCalculator";

export default function Landing() {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40 text-foreground" data-testid="badge-hero">
                <Sparkles className="h-3 w-3 mr-1.5 text-accent" /> Lead-gen widget for contractors
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl mt-5 leading-[1.05] text-foreground">
                Turn website visitors into{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">measured leads</span>
                  <span className="absolute inset-x-0 -bottom-1 h-3 bg-accent/40 -z-0" />
                </span>{" "}
                in 60 seconds.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                MeasuredQuote drops onto any contractor site. Homeowners draw their driveway, roof, or fence
                on a satellite view, pick a finish, and get an instant range. You get a qualified lead with
                measurements, materials, and budget — before the first call.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/demo" data-testid="button-hero-cta">
                    Try the live demos <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard" data-testid="button-hero-dashboard">
                    See contractor dashboard
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-accent" />
                <span>No credit card</span>
                <Check className="h-3.5 w-3.5 text-accent" />
                <span>14-day free trial</span>
                <Check className="h-3.5 w-3.5 text-accent" />
                <span>Embed on any site</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 bg-accent/20 blur-2xl rounded-3xl" />
              <Card className="relative overflow-hidden border-border shadow-2xl">
                <div className="bg-foreground text-background px-5 py-3 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
                    Live preview
                  </span>
                  <span className="text-background/60">Concrete driveway</span>
                </div>
                <div className="p-4">
                  <SatelliteMap
                    mode="polygon"
                    target={612}
                    unit="sqft"
                    address="4821 Hawthorne Way, Pleasanton, CA"
                    seed={3}
                    className="h-64"
                  />
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <KPI label="Area" value="612 sqft" />
                    <KPI label="Material" value="Stamped" />
                    <KPI label="Range" value="$9.2K – $11.2K" highlight />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="border-y border-border bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatBlock big="3.4×" small="more qualified leads vs. plain contact forms" />
          <StatBlock big="47s" small="median time from start → estimate" />
          <StatBlock big="$0" small="ad spend per inbound estimate" />
          <StatBlock big="6 trades" small="Concrete · Asphalt · Decks · Roof · Fence · Landscape" />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">How it works</Badge>
          <h2 className="font-display text-3xl mt-4 text-foreground">
            Three steps. From visitor to scheduled site visit.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="p-6 border-border bg-card hover-elevate">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-foreground text-background flex items-center justify-center font-mono text-sm">
                  0{i + 1}
                </div>
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display text-lg mt-4 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trade coverage */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-xl">
              <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Trade coverage</Badge>
              <h2 className="font-display text-3xl mt-4 text-foreground">
                Six map-based estimators. One widget.
              </h2>
              <p className="text-muted-foreground mt-3">
                Each trade ships with built-in materials, add-ons, and unit logic. Override rates per
                tenant — by city, market, or season.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/demo" data-testid="button-trades-explore">
                Open the demo hub <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
            {TRADE_LIST.map((t) => (
              <Link
                href={`/demo/${t.id}`}
                key={t.id}
                className="block border border-border bg-card rounded-lg p-5 hover-elevate active-elevate-2 group"
                data-testid={`card-trade-${t.id}`}
              >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-md bg-foreground/5 flex items-center justify-center text-foreground/80">
                      <TradeIcon trade={t.id} className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      {t.unit === "sqft" ? "Area" : "Linear"}
                    </span>
                  </div>
                  <div className="font-display text-lg text-foreground mt-3">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.tagline}</div>
                <div className="mt-4 text-xs text-foreground/70 group-hover:text-accent inline-flex items-center font-medium">
                  Try estimator <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why contractors use it */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Why contractors switch</Badge>
        <h2 className="font-display text-3xl mt-4 text-foreground">Built for inbound, not chasing.</h2>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card">
              <div className="h-9 w-9 rounded-md bg-accent/15 text-accent-foreground flex items-center justify-center shrink-0">
                <b.icon className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <h3 className="font-display text-base text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ROI calculator */}
      <RoiCalculator />

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Pricing</Badge>
            <h2 className="font-display text-3xl mt-4 text-foreground">Pays for itself with one job.</h2>
            <p className="text-muted-foreground mt-3">
              Flat monthly fee, no per-lead surcharge. Start on the free 14-day trial, cancel anytime.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <Card
                key={p.name}
                className={
                  "p-6 border " +
                  (p.featured
                    ? "border-accent bg-accent/5 shadow-xl relative"
                    : "border-border bg-card")
                }
              >
                {p.featured && (
                  <Badge className="absolute -top-2.5 left-6 bg-accent text-accent-foreground font-mono text-[10px] uppercase">
                    Most popular
                  </Badge>
                )}
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl text-foreground">${p.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 min-h-[2.5rem]">{p.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-foreground/85">
                      <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    "w-full mt-6 " +
                    (p.featured
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-foreground text-background hover:bg-foreground/90")
                  }
                  asChild
                >
                  <Link href="/demo" data-testid={`button-plan-${p.name.toLowerCase().replace(/\s+/g, "-")}`}>Start free trial</Link>
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            All plans include lead webhooks, CRM forwarding, and the contractor dashboard. Custom-trade
            rate tables on Studio and above.
          </p>
        </div>
      </section>

      {/* Agency install offer */}
      <section id="install" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          <div>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40 text-foreground">
              <PlugZap className="h-3 w-3 mr-1.5 text-accent" /> Done-for-you install
            </Badge>
            <h2 className="font-display text-3xl mt-4 text-foreground">
              Sell it as a lead system, not another website form.
            </h2>
            <p className="text-muted-foreground mt-3">
              For agencies, MeasuredQuote becomes a productized add-on: install the estimator, tune the local rates,
              connect alerts, and hand the contractor a dashboard they can understand on day one.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/demo/concrete" data-testid="button-install-demo">
                  Walk through a client demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard" data-testid="button-install-dashboard">
                  Show the fulfillment view
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <div className="bg-foreground text-background px-5 py-3 font-mono text-xs uppercase tracking-wider">
              7-day launch checklist
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              {INSTALL_STEPS.map((s, i) => (
                <div key={s.title} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between">
                    <s.icon className="h-4 w-4 text-accent" />
                    <span className="font-mono text-[10px] text-muted-foreground">DAY {i + 1}</span>
                  </div>
                  <div className="font-display text-base text-foreground mt-3">{s.title}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center border-t border-border">
        <h2 className="font-display text-4xl text-foreground max-w-3xl mx-auto leading-tight">
          Stop sending site visits to tire-kickers.{" "}
          <span className="font-serif-display italic text-muted-foreground">
            Show up already measured.
          </span>
        </h2>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="/demo" data-testid="button-final-cta">
              Open the demo hub <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard" data-testid="button-final-dashboard">
              See dashboard preview
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={"rounded-md border border-border p-2 " + (highlight ? "bg-accent/15" : "bg-card")}>
      <div className="text-[10px] uppercase tracking-wide font-mono text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function StatBlock({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-foreground">{big}</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-[18ch]">{small}</div>
    </div>
  );
}

const STEPS = [
  {
    title: "Drop in the widget",
    body: "One script tag or iframe. Works on WordPress, Webflow, Wix, Squarespace, or custom HTML. Lives on your contact page or as a sticky button.",
    icon: Code2,
  },
  {
    title: "Homeowner self-serves",
    body: "They pick a language, outline the area on a satellite map, choose a material, and see a ballpark range — all without leaving your site.",
    icon: Map,
  },
  {
    title: "Lead lands in your inbox",
    body: "Name, phone, address, measurement, scope, and range. Pushed to email, SMS, your CRM, or any webhook.",
    icon: Inbox,
  },
];

const BENEFITS = [
  { title: "Pre-qualified, pre-measured", body: "Every lead arrives with a polygon area or fence linear footage, a chosen material, and a budget range. No more 'roughly how big is it?' phone tag.", icon: Ruler },
  { title: "Native multilingual", body: "English, Spanish, French, Portuguese. Auto-detect by browser, manual switch on the widget. Capture leads from neighborhoods your competitors can't.", icon: Globe2 },
  { title: "Tune your rates in seconds", body: "Override per-material rates, add-on prices, markup, and regional multipliers from the dashboard. No code, no support ticket.", icon: LineChart },
  { title: "Live AI receptionist (coming soon)", body: "Pair the estimator with a 24/7 voice agent that books visits from missed calls. Same dashboard, same lead inbox.", icon: Phone },
];

const INSTALL_STEPS = [
  { title: "Pick the trade", body: "Choose one niche for the contractor or activate all six estimators for multi-service shops.", icon: Ruler },
  { title: "Set local rates", body: "Adjust materials, add-ons, markup, and range buffer to match the market and close style.", icon: LineChart },
  { title: "Connect alerts", body: "Route new estimates to email, SMS, CRM, or a webhook for instant sales follow-up.", icon: MessageSquare },
  { title: "Embed and launch", body: "Drop the widget into WordPress, Webflow, Wix, Squarespace, or a custom landing page.", icon: Code2 },
  { title: "Review pipeline", body: "Use the dashboard to see ranges, scope, measurement, status, and booked follow-ups.", icon: Inbox },
  { title: "Optimize weekly", body: "Tune CTAs, add retargeting, and sell the contractor a bigger automation package.", icon: CalendarCheck },
];

const PLANS = [
  {
    name: "Solo",
    price: 89,
    blurb: "One trade, one site. Built for owner-operators.",
    features: ["1 estimator (any trade)", "Up to 50 leads/mo", "Email + SMS notifications", "Embed on 1 website"],
    featured: false,
  },
  {
    name: "Studio",
    price: 199,
    blurb: "All six trades, multiple sites, CRM forwarding.",
    features: [
      "All 6 trade estimators",
      "Unlimited leads",
      "Custom rate tables per material",
      "CRM webhook (GoHighLevel, HubSpot, Zapier)",
      "Embed on 5 websites",
    ],
    featured: true,
  },
  {
    name: "Multi-Brand",
    price: 449,
    blurb: "For agencies and franchise contractors.",
    features: [
      "Unlimited tenants",
      "White-label branding per tenant",
      "Regional rate multipliers",
      "Per-tenant lead routing",
      "Priority support",
    ],
    featured: false,
  },
];
