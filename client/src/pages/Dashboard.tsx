import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { IntegrationsTab } from "@/components/dashboard/IntegrationsTab";
import { AutomationTab } from "@/components/dashboard/AutomationTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { LabsTab } from "@/components/dashboard/LabsTab";
import { ProductionTab } from "@/components/dashboard/ProductionTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";
import { TRADES, TRADE_LIST } from "@/lib/trades";
import { TradeIcon } from "@/components/TradeIcon";
import {
  Inbox,
  CheckCircle2,
  Copy,
  Filter,
  Mail,
  Phone,
  TrendingUp,
  Settings,
  Code2,
  Globe2,
  MapPin,
  MessageSquare,
  Ruler,
  Send,
  Star,
  Webhook,
  Zap,
  BarChart3,
  Sparkles,
  FileText,
  ServerCog,
  Building2,
} from "lucide-react";

const STATUSES = ["new", "contacted", "scheduled", "quoted", "won", "lost"] as const;
type Status = (typeof STATUSES)[number];

export default function Dashboard() {
  const { data: leads = [], isLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [tradeFilter, setTradeFilter] = useState<"all" | string>("all");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (tradeFilter !== "all" && l.trade !== tradeFilter) return false;
      return true;
    });
  }, [leads, statusFilter, tradeFilter]);

  const selected = useMemo(() => leads.find((l) => l.id === selectedId) ?? filtered[0] ?? null, [leads, filtered, selectedId]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">Contractor dashboard</Badge>
            <h1 className="font-display text-2xl mt-3 text-foreground">Ortiz Concrete · Pleasanton, CA</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All leads from your MeasuredQuote widget, in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-dashboard-export">Export CSV</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-dashboard-share">
              Share widget link
            </Button>
          </div>
        </div>
      </div>

      <Metrics leads={leads} />

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <Tabs defaultValue="leads">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="leads" data-testid="tab-leads"><Inbox className="h-4 w-4 mr-1.5" /> Leads</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics"><BarChart3 className="h-4 w-4 mr-1.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations"><Webhook className="h-4 w-4 mr-1.5" /> Integrations</TabsTrigger>
            <TabsTrigger value="automation" data-testid="tab-automation"><Send className="h-4 w-4 mr-1.5" /> Automation</TabsTrigger>
            <TabsTrigger value="embed" data-testid="tab-embed"><Code2 className="h-4 w-4 mr-1.5" /> Embed</TabsTrigger>
            <TabsTrigger value="pricing" data-testid="tab-pricing"><Settings className="h-4 w-4 mr-1.5" /> Pricing</TabsTrigger>
            <TabsTrigger value="labs" data-testid="tab-labs"><Sparkles className="h-4 w-4 mr-1.5" /> Labs</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings"><Building2 className="h-4 w-4 mr-1.5" /> Settings</TabsTrigger>
            <TabsTrigger value="production" data-testid="tab-production"><ServerCog className="h-4 w-4 mr-1.5" /> Production</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-5">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
              {/* Inbox */}
              <Card className="border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{filtered.length} of {leads.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                      <SelectTrigger className="h-8 w-32 text-xs" data-testid="select-status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{labelFor(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={tradeFilter} onValueChange={(v) => setTradeFilter(v as any)}>
                      <SelectTrigger className="h-8 w-32 text-xs" data-testid="select-trade-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All trades</SelectItem>
                        {TRADE_LIST.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="max-h-[640px] overflow-auto divide-y divide-border">
                  {isLoading && <SkeletonRows />}
                  {!isLoading && filtered.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No leads match these filters.
                    </div>
                  )}
                  {filtered.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedId(l.id)}
                      data-testid={`row-lead-${l.id}`}
                      className={
                        "w-full text-left px-4 py-3 hover-elevate flex items-center gap-3 " +
                        (selected?.id === l.id ? "bg-accent/10" : "")
                      }
                    >
                      <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-foreground/80 shrink-0">
                        <TradeIcon trade={l.trade as any} className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm text-foreground truncate">{l.name}</span>
                          <StatusPill status={l.status as Status} />
                        </div>
                        <div className="text-xs text-muted-foreground truncate font-mono">
                          {TRADES[l.trade as keyof typeof TRADES].name} · {l.measurement.toLocaleString()} {l.measurementUnit === "sqft" ? "sqft" : "lf"} · ${l.lowEstimate.toLocaleString()}–${l.highEstimate.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground shrink-0">{timeAgo(l.createdAt)}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Detail */}
              <LeadDetail lead={selected} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-5">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="integrations" className="mt-5">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="automation" className="mt-5">
            <AutomationTab />
          </TabsContent>

          <TabsContent value="embed" className="mt-5">
            <EmbedTab />
          </TabsContent>

          <TabsContent value="pricing" className="mt-5">
            <PricingTab />
          </TabsContent>

          <TabsContent value="labs" className="mt-5">
            <LabsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-5">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="production" className="mt-5">
            <ProductionTab />
          </TabsContent>
        </Tabs>
      </div>

      <SiteFooter />
    </div>
  );
}

/* ---------- Metrics ---------- */

function Metrics({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const pipeline = leads.reduce((s, l) => s + l.highEstimate, 0);
  const conversion = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard label="Total leads (30d)" value={String(totalLeads)} accent={<Inbox className="h-4 w-4" />} testid="metric-total" />
      <MetricCard label="New / unread" value={String(newLeads)} accent={<TrendingUp className="h-4 w-4" />} testid="metric-new" />
      <MetricCard label="Pipeline (high)" value={`$${(pipeline / 1000).toFixed(0)}K`} accent={<Star className="h-4 w-4" />} testid="metric-pipeline" />
      <MetricCard label="Win rate" value={`${conversion}%`} accent={<CheckCircle2 className="h-4 w-4" />} testid="metric-win" />
    </div>
  );
}

function MetricCard({ label, value, accent, testid }: { label: string; value: string; accent: React.ReactNode; testid: string }) {
  return (
    <Card className="p-4 border-border bg-card" data-testid={testid}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-wider font-mono">{label}</span>
        <span className="text-foreground/70">{accent}</span>
      </div>
      <div className="font-display text-2xl text-foreground mt-2">{value}</div>
    </Card>
  );
}

/* ---------- Lead routing tab ---------- */

function RoutingTab() {
  const routes = [
    {
      title: "Instant contractor SMS",
      detail: "New measured leads text the owner with name, phone, project type, range, and address.",
      status: "Active",
      icon: MessageSquare,
      destination: "+1 (720) 555-0134",
    },
    {
      title: "Sales inbox email",
      detail: "Full estimate summary and line items are sent to the sales inbox for quoting follow-up.",
      status: "Active",
      icon: Mail,
      destination: "sales@ortizconcrete.com",
    },
    {
      title: "GoHighLevel webhook",
      detail: "Creates or updates the contact, adds pipeline value, and tags the lead by trade.",
      status: "Ready",
      icon: Webhook,
      destination: "leadconnectorhq.com/hooks/abc123",
    },
  ];

  const sequence = [
    ["0 min", "Send homeowner confirmation", "Thanks them, repeats the range, and sets expectation for contractor follow-up."],
    ["2 min", "Notify contractor", "SMS + email with direct call link, scope, and estimate range."],
    ["1 hr", "If no status change", "Reminder to call while intent is hot."],
    ["24 hr", "Nurture homeowner", "Ask if they want a site visit and offer two appointment windows."],
  ];

  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-5">
      <Card className="p-5 border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg">Lead routing automations</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This is the sellable handoff: every estimate can become a CRM record, SMS alert, and booked follow-up.
            </p>
          </div>
          <Badge className="bg-accent text-accent-foreground font-mono text-[10px] uppercase">Demo mode</Badge>
        </div>
        <div className="mt-5 space-y-3">
          {routes.map((r) => (
            <div key={r.title} className="rounded-lg border border-border bg-secondary/30 p-4 flex gap-4">
              <div className="h-10 w-10 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
                <r.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-base text-foreground">{r.title}</h4>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase border-accent/40 bg-accent/10">{r.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.detail}</p>
                <div className="text-xs font-mono text-muted-foreground mt-2 truncate">{r.destination}</div>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-routing-connect">
          <Zap className="h-4 w-4 mr-2" /> Connect live routing
        </Button>
      </Card>

      <Card className="p-5 border-border bg-card">
        <h3 className="font-display text-lg">Follow-up sequence</h3>
        <p className="text-sm text-muted-foreground mt-1">
          A simple automation plan contractors understand in a sales demo.
        </p>
        <div className="mt-5 relative">
          <div className="absolute left-[3.85rem] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {sequence.map(([time, title, body]) => (
              <div key={time} className="grid grid-cols-[4.5rem_1fr] gap-4 relative">
                <div className="font-mono text-xs text-muted-foreground pt-1">{time}</div>
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Send className="h-3.5 w-3.5 text-accent" /> {title}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Lead detail ---------- */

function LeadDetail({ lead }: { lead: Lead | null }) {
  const { toast } = useToast();
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Status }) => {
      const r = await apiRequest("PATCH", `/api/leads/${id}/status`, { status });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Lead updated" });
    },
  });

  if (!lead) {
    return (
      <Card className="border-border bg-card p-10 text-center text-muted-foreground" data-testid="empty-detail">
        Select a lead from the inbox.
      </Card>
    );
  }

  const trade = TRADES[lead.trade as keyof typeof TRADES];
  const addons: string[] = JSON.parse(lead.addonsJson);
  const lineItems: { label: string; amount: number }[] = JSON.parse(lead.lineItemsJson);

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>#{String(lead.id).padStart(4, "0")}</span>
            <span>·</span>
            <span>{new Date(lead.createdAt).toLocaleString()}</span>
            <span>·</span>
            <span>via {lead.sourceUrl}</span>
          </div>
          <h3 className="font-display text-xl text-foreground mt-1" data-testid={`text-detail-name-${lead.id}`}>{lead.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-foreground/80">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-accent"><Mail className="h-3.5 w-3.5" /> {lead.email}</a>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-accent"><Phone className="h-3.5 w-3.5" /> {lead.phone}</a>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Globe2 className="h-3.5 w-3.5" /> {lead.language.toUpperCase()}</span>
          </div>
        </div>
        <Select value={lead.status} onValueChange={(v) => updateStatus.mutate({ id: lead.id, status: v as Status })}>
          <SelectTrigger className="w-40" data-testid={`select-status-${lead.id}`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{labelFor(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <DetailKPI icon={<TradeIcon trade={lead.trade as any} className="h-4 w-4" />} label="Trade" value={trade.name} />
          <DetailKPI icon={<Ruler className="h-4 w-4" />} label="Measurement" value={`${lead.measurement.toLocaleString()} ${lead.measurementUnit === "sqft" ? "sq ft" : "linear ft"}`} />
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Address</div>
          <div className="flex items-center gap-2 mt-1.5 text-foreground/90">
            <MapPin className="h-4 w-4 text-accent" />
            {lead.address}
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-foreground text-background p-4">
            <div className="text-[10px] uppercase font-mono tracking-wider text-background/70">Quoted range</div>
            <div className="font-display text-2xl mt-1" data-testid={`text-range-${lead.id}`}>
              ${lead.lowEstimate.toLocaleString()} <span className="text-background/60 text-lg">–</span> ${lead.highEstimate.toLocaleString()}
            </div>
            <div className="text-xs text-background/70 mt-1 font-mono">{lead.material}</div>
          </div>
          <div className="p-4 space-y-2">
            <div className="text-xs uppercase font-mono text-muted-foreground tracking-wider mb-2">Line items</div>
            {lineItems.map((li, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground/85">{li.label}</span>
                <span className="font-mono text-foreground">${li.amount.toLocaleString()}</span>
              </div>
            ))}
            {addons.length > 0 && (
              <div className="pt-3 border-t border-border mt-3">
                <div className="text-xs uppercase font-mono text-muted-foreground tracking-wider mb-2">Add-ons</div>
                <div className="flex flex-wrap gap-1.5">
                  {addons.map((a, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid={`button-action-call-${lead.id}`}>
            <Phone className="h-3.5 w-3.5 mr-1.5" /> Call now
          </Button>
          <Button size="sm" variant="outline" data-testid={`button-action-email-${lead.id}`}>
            <Mail className="h-3.5 w-3.5 mr-1.5" /> Send quote
          </Button>
          <Button size="sm" variant="outline" asChild data-testid={`button-action-pdf-${lead.id}`}>
            <Link href={`/quote/${lead.id}`}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Quote package
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DetailKPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
        <span className="text-foreground/70">{icon}</span>
        {label}
      </div>
      <div className="text-foreground mt-1 text-sm">{value}</div>
    </div>
  );
}

/* ---------- Embed code tab ---------- */

function EmbedTab() {
  const { toast } = useToast();
  const snippet = `<!-- MeasuredQuote widget — drop in <body> -->
<script async src="https://embed.measuredquote.com/v1/widget.js"
  data-tenant="ortiz-concrete"
  data-trade="concrete"
  data-primary="#9be036"
  data-cta="Get my instant estimate"></script>`;

  const iframe = `<iframe
  src="https://embed.measuredquote.com/v1/widget?tenant=ortiz-concrete&trade=concrete"
  width="100%" height="640" style="border:0" allow="geolocation"></iframe>`;

  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
      <Card className="p-5 border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Script tag</h3>
          <CopyButton text={snippet} label="Copy script" testid="button-copy-script" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">Drop this anywhere in the &lt;body&gt; of your site. Works on WordPress, Webflow, Wix, Squarespace, or custom HTML.</p>
        <pre className="mt-4 rounded-lg bg-foreground text-background p-4 text-xs font-mono overflow-auto" data-testid="text-embed-script">{snippet}</pre>

        <div className="flex items-center justify-between mt-8">
          <h3 className="font-display text-lg">Iframe</h3>
          <CopyButton text={iframe} label="Copy iframe" testid="button-copy-iframe" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">Use when the host platform restricts third-party scripts.</p>
        <pre className="mt-4 rounded-lg bg-foreground text-background p-4 text-xs font-mono overflow-auto">{iframe}</pre>
      </Card>

      <Card className="p-5 border-border bg-card">
        <h3 className="font-display text-lg">Widget configuration</h3>
        <p className="text-sm text-muted-foreground mt-1">Brand the widget and route leads to your inbox.</p>
        <div className="mt-5 space-y-4">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Brand color</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-9 w-9 rounded-md bg-accent border border-border" />
              <Input defaultValue="#9be036" className="font-mono text-sm" data-testid="input-brand-color" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">CTA text</Label>
            <Input defaultValue="Get my instant estimate" className="mt-1" data-testid="input-cta-text" />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Notification email</Label>
            <Input defaultValue="kelly@ortizconcrete.com" className="mt-1" data-testid="input-notify-email" />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">CRM webhook</Label>
            <Input defaultValue="https://services.leadconnectorhq.com/hooks/abc123" className="mt-1 font-mono text-xs" data-testid="input-webhook" />
          </div>
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90" data-testid="button-save-widget">
            Save widget settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

function CopyButton({ text, label, testid }: { text: string; label: string; testid: string }) {
  const { toast } = useToast();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast({ title: "Copied to clipboard" });
        } catch {
          toast({ title: "Copy failed", variant: "destructive" });
        }
      }}
      data-testid={testid}
    >
      <Copy className="h-3.5 w-3.5 mr-1.5" /> {label}
    </Button>
  );
}

/* ---------- Pricing tab ---------- */

function PricingTab() {
  const [markup, setMarkup] = useState(15);
  const [buffer, setBuffer] = useState(10);
  const [regional, setRegional] = useState(105);
  const trade = TRADES.concrete;

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
      <Card className="p-5 border-border bg-card">
        <h3 className="font-display text-lg">Pricing controls</h3>
        <p className="text-sm text-muted-foreground mt-1">Tune your widget without touching code. Changes apply to new estimates immediately.</p>

        <div className="mt-6 space-y-6">
          <Control label="Markup multiplier" value={`${markup}%`} v={markup} setV={setMarkup} min={0} max={40} step={1} testid="slider-markup" />
          <Control label="Range buffer (± of midpoint)" value={`${buffer}%`} v={buffer} setV={setBuffer} min={0} max={25} step={1} testid="slider-buffer" />
          <Control label="Regional multiplier" value={`${regional}%`} v={regional} setV={setRegional} min={70} max={150} step={1} testid="slider-regional" />
        </div>

        <div className="border-t border-border mt-8 pt-5">
          <h4 className="font-display text-sm uppercase tracking-wide text-muted-foreground">Concrete · material rates</h4>
          <div className="mt-3 space-y-2">
            {trade.materials.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-foreground">{m.label}</span>
                <Input defaultValue={`$${m.rate.toFixed(2)}`} className="w-24 font-mono text-sm" data-testid={`input-rate-${m.id}`} />
                <span className="text-xs font-mono text-muted-foreground">/sqft</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 border-border bg-secondary/30">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Preview · 600 sqft stamped</div>
        <div className="font-display text-3xl text-foreground mt-2" data-testid="text-pricing-preview">
          ${Math.round(600 * 14 * (regional / 100) * (1 + markup / 100) * (1 - buffer / 100)).toLocaleString()}{" "}
          <span className="text-muted-foreground text-xl">–</span>{" "}
          ${Math.round(600 * 14 * (regional / 100) * (1 + markup / 100) * (1 + buffer / 100)).toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Base ${(600 * 14).toLocaleString()} × regional {regional}% × markup {100 + markup}% ± buffer {buffer}%.
        </div>
        <div className="border-t border-border mt-6 pt-5">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Tip</div>
          <p className="text-sm text-muted-foreground mt-1">
            Most contractors run a 12–18% markup with a 10% buffer. Bump regional to 110-120% in metro
            markets, drop to 90% in lower-cost regions.
          </p>
        </div>
      </Card>
    </div>
  );
}

function Control({
  label,
  value,
  v,
  setV,
  min,
  max,
  step,
  testid,
}: {
  label: string;
  value: string;
  v: number;
  setV: (n: number) => void;
  min: number;
  max: number;
  step: number;
  testid: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-end">
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</Label>
        <span className="font-mono text-sm text-foreground">{value}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[v]} onValueChange={(n) => setV(n[0])} className="mt-2" data-testid={testid} />
    </div>
  );
}

/* ---------- Helpers ---------- */

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    new: "bg-accent/15 text-foreground border-accent/40",
    contacted: "bg-blue-500/10 text-foreground border-blue-500/30",
    scheduled: "bg-amber-500/10 text-foreground border-amber-500/30",
    quoted: "bg-purple-500/10 text-foreground border-purple-500/30",
    won: "bg-emerald-500/15 text-foreground border-emerald-500/40",
    lost: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={"font-mono text-[10px] uppercase tracking-wider " + map[status]}>
      {labelFor(status)}
    </Badge>
  );
}

function labelFor(s: Status) {
  return { new: "New", contacted: "Contacted", scheduled: "Scheduled", quoted: "Quoted", won: "Won", lost: "Lost" }[s];
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function SkeletonRows() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="h-9 w-9 rounded-md bg-secondary" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 bg-secondary rounded" />
            <div className="h-2 w-48 bg-secondary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
