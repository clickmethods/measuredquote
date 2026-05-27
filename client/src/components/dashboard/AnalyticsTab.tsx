import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRADES, TRADE_LIST } from "@/lib/trades";
import type { Lead, WidgetEvent } from "@shared/schema";
import { TradeIcon } from "@/components/TradeIcon";
import { ArrowUp, ArrowDown, Activity, BarChart3, Eye, MousePointerClick } from "lucide-react";

const FUNNEL = [
  { key: "starts", label: "Widget starts", value: 1284, last: 1102 },
  { key: "lead", label: "Lead form complete", value: 612, last: 503 },
  { key: "measure", label: "Measurement done", value: 471, last: 388 },
  { key: "result", label: "Result viewed", value: 412, last: 344 },
  { key: "booked", label: "Booked visit", value: 87, last: 64 },
];

const DAILY_LEADS = [
  4, 7, 6, 9, 8, 11, 13, 10, 14, 12, 16, 18, 17, 21, 19, 22, 24, 21, 27, 25, 29, 32, 28, 34, 31, 36, 38, 35, 41, 44,
];

const PIPELINE_BY_TRADE = [
  { trade: "concrete", leads: 38, pipeline: 412000 },
  { trade: "roofing", leads: 26, pipeline: 504000 },
  { trade: "decks", leads: 22, pipeline: 318000 },
  { trade: "fencing", leads: 31, pipeline: 198000 },
  { trade: "landscape", leads: 19, pipeline: 122000 },
  { trade: "asphalt", leads: 12, pipeline: 84000 },
];

type FunnelKey = "starts" | "lead" | "measure" | "result" | "booked";

const EVENT_TO_FUNNEL: Record<string, FunnelKey> = {
  widget_started: "starts",
  lead_form_completed: "lead",
  measurement_completed: "measure",
  estimate_viewed: "result",
  lead_submitted: "booked",
  lead_booked: "booked",
};

export function AnalyticsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: events = [] } = useQuery<WidgetEvent[]>({
    queryKey: ["/api/events"],
    refetchInterval: 6000,
  });

  // Real-event counts by funnel stage (unique session per stage)
  const realFunnelCounts = useMemo(() => {
    const seen: Record<FunnelKey, Set<string>> = {
      starts: new Set(),
      lead: new Set(),
      measure: new Set(),
      result: new Set(),
      booked: new Set(),
    };
    for (const e of events) {
      const k = EVENT_TO_FUNNEL[e.eventType];
      if (!k) continue;
      seen[k].add(e.sessionId);
    }
    return {
      starts: seen.starts.size,
      lead: seen.lead.size,
      measure: seen.measure.size,
      result: seen.result.size,
      booked: seen.booked.size,
    } as Record<FunnelKey, number>;
  }, [events]);

  // Daily event counts (last 30 days) — counts widget_started per day
  const realDaily = useMemo(() => {
    const days = new Array(30).fill(0);
    const now = Date.now();
    for (const e of events) {
      if (e.eventType !== "widget_started") continue;
      const ageDays = Math.floor((now - e.createdAt) / (1000 * 60 * 60 * 24));
      if (ageDays >= 0 && ageDays < 30) days[29 - ageDays] += 1;
    }
    return days;
  }, [events]);

  const realPipelineByTrade = useMemo(() => {
    const map: Record<string, { leads: number; pipeline: number }> = {};
    for (const l of leads) {
      const k = l.trade;
      map[k] = map[k] ?? { leads: 0, pipeline: 0 };
      map[k].leads += 1;
      map[k].pipeline += l.highEstimate;
    }
    return TRADE_LIST.map((t) => ({
      trade: t.id,
      leads: (map[t.id]?.leads ?? 0),
      pipeline: (map[t.id]?.pipeline ?? 0),
    }));
  }, [leads]);

  // Merge mock + real
  const combined = useMemo(() => {
    return PIPELINE_BY_TRADE.map((m) => {
      const r = realPipelineByTrade.find((x) => x.trade === m.trade);
      return {
        trade: m.trade,
        leads: m.leads + (r?.leads ?? 0),
        pipeline: m.pipeline + (r?.pipeline ?? 0),
      };
    });
  }, [realPipelineByTrade]);

  // Blend mock baseline + real events into the funnel.
  const funnelBlended = useMemo(
    () =>
      FUNNEL.map((f) => ({
        ...f,
        value: f.value + (realFunnelCounts[f.key as FunnelKey] ?? 0),
        real: realFunnelCounts[f.key as FunnelKey] ?? 0,
      })),
    [realFunnelCounts],
  );

  // Blend daily: baseline mock + today's real starts on the trailing days.
  const dailyBlended = useMemo(
    () => DAILY_LEADS.map((v, i) => v + (realDaily[i] ?? 0)),
    [realDaily],
  );

  const maxPipeline = Math.max(...combined.map((c) => c.pipeline));
  const maxFunnel = funnelBlended[0].value;
  const maxDaily = Math.max(...dailyBlended);
  const todayLeads = dailyBlended[dailyBlended.length - 1];
  const yesterdayLeads = dailyBlended[dailyBlended.length - 2] || 1;
  const trend = ((todayLeads - yesterdayLeads) / yesterdayLeads) * 100;
  const totalPipeline = combined.reduce((s, c) => s + c.pipeline, 0);
  const totalLeads = combined.reduce((s, c) => s + c.leads, 0);
  const bookingRate = (funnelBlended[4].value / funnelBlended[0].value) * 100;
  const completionRate = (funnelBlended[3].value / funnelBlended[0].value) * 100;
  const realEventsTotal = events.length;

  return (
    <div className="space-y-5">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Pipeline (30d)" value={`$${(totalPipeline / 1000).toFixed(0)}K`} change="+18%" up testid="kpi-pipeline" icon={<BarChart3 className="h-4 w-4" />} />
        <KPI label="Booked visits" value={String(funnelBlended[4].value)} change="+36%" up testid="kpi-booked" icon={<Activity className="h-4 w-4" />} />
        <KPI label="Result → Booked" value={`${bookingRate.toFixed(1)}%`} change="+0.8 pp" up testid="kpi-conversion" icon={<MousePointerClick className="h-4 w-4" />} />
        <KPI label="Start → Result" value={`${completionRate.toFixed(1)}%`} change="+2.4 pp" up testid="kpi-completion" icon={<Eye className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
        {/* Funnel */}
        <Card className="p-5 border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg">Widget funnel</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 30 days. Conversions vs. previous period.</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40" data-testid="badge-events-count">
              {realEventsTotal > 0 ? `${realEventsTotal} live events` : "Demo data"}
            </Badge>
          </div>
          <div className="mt-5 space-y-3">
            {funnelBlended.map((step, i) => {
              const pct = (step.value / maxFunnel) * 100;
              const delta = ((step.value - step.last) / step.last) * 100;
              const stageRate = i === 0 ? 100 : (step.value / funnelBlended[i - 1].value) * 100;
              return (
                <div key={step.key} data-testid={`funnel-${step.key}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/90">{step.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-foreground tabular-nums">{step.value.toLocaleString()}</span>
                      <span className={"text-[11px] font-mono " + (delta >= 0 ? "text-emerald-600" : "text-destructive")}>
                        {delta >= 0 ? "+" : ""}{delta.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative mt-1.5 h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {i > 0 && (
                    <div className="text-[10px] font-mono text-muted-foreground mt-1 flex items-center justify-between">
                      <span>{stageRate.toFixed(1)}% of previous stage</span>
                      {step.real > 0 && (
                        <span className="text-accent" data-testid={`funnel-real-${step.key}`}>
                          +{step.real} live
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Trend sparkline */}
        <Card className="p-5 border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg">Daily leads</h3>
              <p className="text-xs text-muted-foreground mt-0.5">30-day rolling. Bars = leads created.</p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl text-foreground tabular-nums">{todayLeads}</div>
              <div className={"text-[11px] font-mono " + (trend >= 0 ? "text-emerald-600" : "text-destructive")}>
                {trend >= 0 ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                {Math.abs(trend).toFixed(0)}% vs yesterday
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-1 h-32" data-testid="chart-daily">
            {dailyBlended.map((v, i) => {
              const h = (v / maxDaily) * 100;
              const isLast = i === dailyBlended.length - 1;
              return (
                <div
                  key={i}
                  className={"flex-1 rounded-sm transition-all " + (isLast ? "bg-accent" : "bg-foreground/15 hover:bg-foreground/25")}
                  style={{ height: `${Math.max(h, 6)}%` }}
                  title={`Day ${i + 1}: ${v}`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>30d ago</span>
            <span>Today</span>
          </div>
        </Card>
      </div>

      {/* Pipeline by trade */}
      <Card className="p-5 border-border bg-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-lg">Pipeline by trade</h3>
            <p className="text-xs text-muted-foreground mt-0.5">High-estimate value across the {totalLeads} leads tracked this window.</p>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl tabular-nums">${(totalPipeline / 1000).toFixed(0)}K</div>
            <div className="text-[11px] font-mono text-muted-foreground">total pipeline</div>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {combined.map((row) => {
            const t = TRADES[row.trade as keyof typeof TRADES];
            const pct = (row.pipeline / maxPipeline) * 100;
            return (
              <div key={row.trade} className="grid grid-cols-[2rem_8rem_1fr_6rem] sm:grid-cols-[2rem_10rem_1fr_8rem] items-center gap-3" data-testid={`trade-row-${row.trade}`}>
                <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-foreground/80">
                  <TradeIcon trade={row.trade as any} className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium text-foreground truncate">{t.name}</div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-foreground rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-right tabular-nums">
                  <div className="text-sm font-mono text-foreground">${(row.pipeline / 1000).toFixed(0)}K</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{row.leads} leads</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function KPI({
  label,
  value,
  change,
  up,
  testid,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  up: boolean;
  testid: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4 border-border bg-card" data-testid={testid}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] uppercase tracking-wider font-mono">{label}</span>
        <span className="text-foreground/70">{icon}</span>
      </div>
      <div className="font-display text-2xl text-foreground mt-2 tabular-nums">{value}</div>
      <div className={"text-[11px] font-mono mt-1 " + (up ? "text-emerald-600" : "text-destructive")}>
        {up ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />} {change} vs prev
      </div>
    </Card>
  );
}
