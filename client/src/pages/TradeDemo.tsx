import { Link, useRoute } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EstimatorWidget } from "@/components/EstimatorWidget";
import { TRADES, type Trade } from "@/lib/trades";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronRight, Check, Star } from "lucide-react";

const FAQS: Record<Trade["id"], { q: string; a: string }[]> = {
  concrete: [
    { q: "Is the estimate guaranteed?", a: "No — this is a ballpark range. The contractor will confirm a firm price after a quick on-site visit and final scope review." },
    { q: "What if I want stamped concrete plus a stain?", a: "Pick the stamped concrete material and add the premium sealant option. The contractor will add staining options during the site visit." },
    { q: "Does the price include permits?", a: "Permits, drainage, and grading are quoted on-site since they vary by city and lot conditions." },
  ],
  asphalt: [
    { q: "Standard or heavy-duty asphalt?", a: "Pick standard 2-inch hot mix for cars and standard residential use. Choose heavy-duty 3-inch for RVs, trucks, or boat trailers." },
    { q: "Do you sealcoat new asphalt right away?", a: "No. Fresh asphalt needs 6–12 months of cure time before its first sealcoat." },
    { q: "How long until I can drive on it?", a: "Light vehicle traffic in 24–48 hours. Heavy vehicles in 7–14 days depending on weather." },
  ],
  landscape: [
    { q: "Do you handle sod and pavers in the same job?", a: "Yes. Get a separate estimate for each surface area, or call us and we'll combine the scope." },
    { q: "What is topsoil prep?", a: "We grade the site, amend the soil with compost, and level it before laying sod or pavers — critical for long-term root health." },
    { q: "Do you remove the old lawn?", a: "Yes, add the 'Old lawn removal' option. We sod-cut, haul away, and prep before installing the new surface." },
  ],
  decks: [
    { q: "Composite or wood?", a: "Composite is more expensive upfront but has near-zero maintenance and a 25-year warranty. Wood is cheaper but needs annual staining and sealing." },
    { q: "Is the railing included?", a: "Pressure-treated railing is included in the per-square-foot rate. Aluminum or cable railing is an add-on line item." },
    { q: "Permits and footings?", a: "Footing design and permit fees vary by city. Confirmed on-site." },
  ],
  roofing: [
    { q: "Architectural vs. luxury shingles?", a: "Architectural shingles are the dimensional standard with a 30-year warranty. Luxury shingles have a designer profile and 50-year warranty." },
    { q: "Do I need a tear-off?", a: "Most jurisdictions allow one layer of overlay if existing shingles are in good shape. We recommend tear-off for new flashing and full inspection." },
    { q: "Why ridge vent?", a: "Continuous ridge venting paired with soffit intakes can reduce attic temps by 15-25°F and extends shingle life significantly." },
  ],
  fencing: [
    { q: "Cedar vs. vinyl?", a: "Cedar weathers beautifully and is budget-friendly. Vinyl is maintenance-free with a 25-year color warranty but has a higher upfront cost." },
    { q: "Will you call 811 / utility locate?", a: "Yes — utility locates are included in the price. We won't dig until all utilities are marked." },
    { q: "How tall is the privacy fence?", a: "Standard is 6 feet. Many cities cap front-yard fences at 4 feet — your contractor will confirm code." },
  ],
};

const FEATURES: Record<Trade["id"], string[]> = {
  concrete: ["Square-foot pricing", "Stamped, exposed, broom finishes", "Wire mesh & sealant add-ons", "Tear-out of existing slab"],
  asphalt: ["Standard 2\" or heavy-duty 3\"", "Sealcoating & crack sealing", "Surface tear-out option", "Line striping for lots"],
  landscape: ["Sod, pavers, and mulch beds", "3 sod varieties", "Natural stone & brick pavers", "Topsoil prep & lawn removal"],
  decks: ["Pressure-treated to Ipe", "Composite Trex/TimberTech", "Aluminum railing add-on", "Step + post lighting"],
  roofing: ["Asphalt to standing seam", "Tear-off & ice shield", "Ridge vent add-on", "Luxury shingle option"],
  fencing: ["Pressure-treated, cedar, vinyl", "Walk gate & double drive gate", "Linear-foot pricing", "Utility locate included"],
};

export default function TradeDemo() {
  const [, params] = useRoute("/demo/:tradeId");
  const tradeId = params?.tradeId as Trade["id"] | undefined;
  const trade = tradeId ? TRADES[tradeId] : null;

  if (!trade) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="font-display text-2xl">Estimator not found</h1>
          <Link href="/demo" className="text-accent underline mt-4 inline-block">Back to demo hub</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 pt-6 text-sm text-muted-foreground flex items-center gap-1">
        <Link href="/" className="hover:text-foreground" data-testid="link-breadcrumb-home">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/demo" className="hover:text-foreground" data-testid="link-breadcrumb-demo">Demos</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{trade.name}</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-2 gap-10 items-start">
        {/* Left: marketing column */}
        <div>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40">
            Live demo · {trade.unit === "sqft" ? "Area" : "Linear"} estimator
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl mt-4 leading-tight text-foreground">
            {trade.name} estimates,{" "}
            <span className="font-serif-display italic text-muted-foreground">measured from the satellite.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md">{trade.tagline}</p>

          <div className="mt-8 space-y-3">
            {FEATURES[trade.id].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground/85">{f}</span>
              </div>
            ))}
          </div>

          {/* Price-driver cards */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {trade.materials.slice(0, 4).map((m) => (
              <Card key={m.id} className="p-3 border-border bg-card">
                <div className="text-xs uppercase font-mono tracking-wider text-muted-foreground">{m.label}</div>
                <div className="font-display text-lg text-foreground mt-1 font-mono">${m.rate}<span className="text-sm text-muted-foreground">/{trade.unit === "sqft" ? "sqft" : "lf"}</span></div>
              </Card>
            ))}
          </div>

          {/* Testimonial */}
          <Card className="mt-8 p-5 border-border bg-secondary/40">
            <div className="flex items-center gap-1 text-accent">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <blockquote className="font-serif-display italic text-foreground mt-3 text-lg leading-snug">
              "Before MeasuredQuote I'd give a quote per visit. Now every visit is a job that's already 80% sold."
            </blockquote>
            <div className="mt-3 text-xs text-muted-foreground font-mono">
              — {TESTIMONIALS[trade.id].name}, {TESTIMONIALS[trade.id].company}
            </div>
          </Card>
        </div>

        {/* Right: widget */}
        <div className="lg:sticky lg:top-20">
          <EstimatorWidget trade={trade} />
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <h2 className="font-display text-2xl text-foreground">Frequently asked</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {FAQS[trade.id].map((f, i) => (
            <Card key={i} className="p-5 border-border bg-card" data-testid={`card-faq-${i}`}>
              <div className="font-medium text-foreground text-sm">{f.q}</div>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </Card>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

const TESTIMONIALS: Record<Trade["id"], { name: string; company: string }> = {
  concrete: { name: "Kelly Ortiz", company: "Ortiz Concrete, Pleasanton CA" },
  asphalt: { name: "Mike Pereira", company: "Bay Paving Pros, Redwood City CA" },
  landscape: { name: "Sarah Quan", company: "GreenLeaf Landscapes, Oakland CA" },
  decks: { name: "Brian Walsh", company: "Vineyard Decks, Napa CA" },
  roofing: { name: "Carlos Mendez", company: "Summit Roofing Co, Walnut Creek CA" },
  fencing: { name: "Trevor Lin", company: "NorCal Fence, San Jose CA" },
};
