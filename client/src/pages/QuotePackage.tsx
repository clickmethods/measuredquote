import { useEffect, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { TradeIcon } from "@/components/TradeIcon";
import { API_BASE } from "@/lib/queryClient";
import { TRADES } from "@/lib/trades";
import type { Lead } from "@shared/schema";
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  Download,
  Mail,
  MapPin,
  Phone,
  Printer,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";

/**
 * Quote / Proposal package — printable, contractor-branded follow-up asset.
 * Reachable from the dashboard lead detail (Generate PDF) and the demo-saved screen.
 * Print-friendly via window.print() so no PDF library is required.
 */
export default function QuotePackage() {
  const [, params] = useRoute("/quote/:id");
  const id = params?.id ? Number(params.id) : null;
  const { data: leads = [], isLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const lead = useMemo(() => leads.find((l) => l.id === id) ?? null, [leads, id]);

  useEffect(() => {
    const prev = document.title;
    if (lead) document.title = `Estimate #${String(lead.id).padStart(4, "0")} — MeasuredQuote`;
    return () => {
      document.title = prev;
    };
  }, [lead]);

  if (isLoading) {
    return <FullPageMsg>Loading estimate…</FullPageMsg>;
  }
  if (!lead) {
    return (
      <FullPageMsg>
        <div>Estimate not found.</div>
        <Link href="/dashboard" className="underline text-accent text-sm mt-2 inline-block" data-testid="link-quote-back">
          Back to dashboard
        </Link>
      </FullPageMsg>
    );
  }

  const trade = TRADES[lead.trade as keyof typeof TRADES];
  const addons: string[] = JSON.parse(lead.addonsJson);
  const lineItems: { label: string; amount: number }[] = JSON.parse(lead.lineItemsJson);
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
  const created = new Date(lead.createdAt);
  const validUntil = new Date(lead.createdAt + 1000 * 60 * 60 * 24 * 30);

  return (
    <div className="bg-secondary/40 min-h-screen print:bg-white">
      {/* Toolbar — hidden on print */}
      <div className="print:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" data-testid="link-quote-toolbar-back">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              data-testid="button-quote-print"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
              data-testid="button-quote-download"
            >
              <a
                href={`${API_BASE}/api/leads/${lead.id}/proposal.pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download PDF
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Page */}
      <div className="max-w-4xl mx-auto px-6 py-10 print:p-0 print:py-2">
        <Card className="bg-card border-border shadow-xl print:shadow-none print:border-0 overflow-hidden">
          {/* Header band */}
          <div className="bg-foreground text-background px-8 py-7 flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Logo />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-background/70 mt-3">
                Project estimate · prepared by Ortiz Concrete
              </div>
              <h1 className="font-display text-2xl mt-1">
                Estimate #{String(lead.id).padStart(4, "0")}
              </h1>
            </div>
            <div className="text-right text-xs font-mono text-background/80 space-y-1">
              <div>Issued · {created.toLocaleDateString()}</div>
              <div>Valid through · {validUntil.toLocaleDateString()}</div>
              <div>Prepared in · {(lead.language || "en").toUpperCase()}</div>
            </div>
          </div>

          <div className="p-8 print:p-6 space-y-7">
            {/* Parties */}
            <section className="grid md:grid-cols-2 gap-5">
              <Block title="Prepared for">
                <div className="font-display text-lg text-foreground" data-testid="text-quote-customer">{lead.name}</div>
                <div className="text-sm text-foreground/80 mt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {lead.email}
                </div>
                <div className="text-sm text-foreground/80 mt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lead.phone}
                </div>
                <div className="text-sm text-foreground/80 mt-1 flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {lead.address}
                </div>
              </Block>
              <Block title="Prepared by">
                <div className="font-display text-lg text-foreground">Ortiz Concrete</div>
                <div className="text-sm text-foreground/80 mt-1">License #PL-19238 · CA</div>
                <div className="text-sm text-foreground/80 mt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> sales@ortizconcrete.com
                </div>
                <div className="text-sm text-foreground/80 mt-1 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> +1 (720) 555-0134
                </div>
              </Block>
            </section>

            {/* Project summary */}
            <section className="rounded-lg border border-border bg-secondary/40 p-5">
              <div className="text-xs uppercase font-mono tracking-wider text-muted-foreground">Project scope</div>
              <div className="mt-2 grid md:grid-cols-3 gap-4">
                <SummaryStat
                  icon={<TradeIcon trade={lead.trade as any} className="h-4 w-4" />}
                  label="Trade"
                  value={trade.name}
                />
                <SummaryStat
                  icon={<Ruler className="h-4 w-4" />}
                  label="Measurement"
                  value={`${lead.measurement.toLocaleString()} ${lead.measurementUnit === "sqft" ? "sq ft" : "linear ft"}`}
                />
                <SummaryStat
                  icon={<Wrench className="h-4 w-4" />}
                  label="Material / finish"
                  value={lead.material}
                />
              </div>
            </section>

            {/* Estimate range — hero */}
            <section className="rounded-xl border border-accent/40 bg-accent/10 p-6">
              <div className="text-xs uppercase font-mono tracking-wider text-foreground/70">Estimated investment range</div>
              <div className="font-display text-4xl text-foreground mt-2" data-testid="text-quote-range">
                ${lead.lowEstimate.toLocaleString()}{" "}
                <span className="text-foreground/40 text-2xl">–</span>{" "}
                ${lead.highEstimate.toLocaleString()}
              </div>
              <div className="text-xs text-foreground/70 mt-2">
                Midpoint ${Math.round((lead.lowEstimate + lead.highEstimate) / 2).toLocaleString()}.
                Final price confirmed after on-site walkthrough.
              </div>
            </section>

            {/* Line items */}
            <section>
              <h2 className="font-display text-lg text-foreground">Line items</h2>
              <div className="mt-3 border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-mono">
                    <tr>
                      <th className="text-left px-4 py-2.5 tracking-wider">Description</th>
                      <th className="text-right px-4 py-2.5 tracking-wider w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((li, i) => (
                      <tr key={i} className="border-t border-border" data-testid={`row-quote-line-${i}`}>
                        <td className="px-4 py-3 text-foreground/90">{li.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-foreground">${li.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-secondary/40">
                      <td className="px-4 py-3 font-medium text-foreground">Subtotal (pre-margin)</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">${subtotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {addons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {addons.map((a, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">{a}</Badge>
                  ))}
                </div>
              )}
            </section>

            {/* Assumptions & exclusions */}
            <section className="grid md:grid-cols-2 gap-5">
              <Block title="Assumptions">
                <ul className="text-sm space-y-1.5 text-foreground/85">
                  <Li>Standard site access from the street, with no slope greater than 5°.</Li>
                  <Li>Existing surface in serviceable condition unless tear-out add-on is selected.</Li>
                  <Li>Single mobilization; weather windows of 3+ consecutive dry days.</Li>
                  <Li>Markup includes overhead, insurance, and a one-year workmanship warranty.</Li>
                </ul>
              </Block>
              <Block title="Exclusions">
                <ul className="text-sm space-y-1.5 text-foreground/85">
                  <Li>Permits, drainage redesign, or structural engineering.</Li>
                  <Li>Hidden utilities or buried obstructions discovered during excavation.</Li>
                  <Li>Landscape restoration outside the marked work area.</Li>
                  <Li>HOA review and design approval timelines.</Li>
                </ul>
              </Block>
            </section>

            {/* Next steps */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-display text-lg text-foreground">Next steps</h2>
              <div className="mt-4 grid md:grid-cols-3 gap-3">
                <NextStep n={1} title="Confirm site visit" body="Pick a 30-min on-site window for measurement verification and material walkthrough." icon={<CalendarCheck className="h-4 w-4" />} />
                <NextStep n={2} title="Lock the scope" body="We finalize material, finishes, and add-ons. Issue a fixed-price contract." icon={<Check className="h-4 w-4" />} />
                <NextStep n={3} title="Schedule install" body="10% deposit reserves the calendar. Final payment due on substantial completion." icon={<ShieldCheck className="h-4 w-4" />} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-quote-book">
                  <CalendarCheck className="h-4 w-4 mr-1.5" /> Book site visit
                </Button>
                <Button variant="outline" data-testid="button-quote-callback">
                  <Phone className="h-4 w-4 mr-1.5" /> Request a callback
                </Button>
              </div>
            </section>

            {/* Footer */}
            <section className="pt-5 border-t border-border text-[11px] text-muted-foreground font-mono uppercase tracking-wider flex flex-wrap items-center justify-between gap-3">
              <span>Prepared with MeasuredQuote · measuredquote.com</span>
              <span>Estimate #{String(lead.id).padStart(4, "0")} · {created.toLocaleString()}</span>
            </section>
          </div>
        </Card>
      </div>

      {/* Print rules */}
      <style>{`
        @media print {
          @page { size: Letter; margin: 0.4in; }
          body { background: white !important; }
          .shadow-xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function FullPageMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-muted-foreground p-8">
      {children}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase font-mono tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-card border border-border text-foreground/80 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function NextStep({ n, title, body, icon }: { n: number; title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <span className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center font-mono text-xs">0{n}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <div className="font-display text-sm text-foreground mt-3">{title}</div>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
