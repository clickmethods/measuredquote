import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CheckCircle2,
  Clock,
  Webhook,
  Zap,
  CircleDot,
  RefreshCw,
  Loader2,
  XCircle,
  Save,
} from "lucide-react";
import { SiHubspot, SiZapier } from "react-icons/si";

type ApiIntegration = {
  id: number;
  provider: string;
  displayName: string;
  category: "crm" | "automation" | "webhook";
  enabled: boolean;
  endpoint: string;
  secretMasked: string;
  hasSecret: boolean;
  authHeaderMasked: string;
  events: string[];
  lastStatus: string;
  lastStatusCode: number | null;
  lastTestedAt: number | null;
  lastDeliveredAt: number | null;
};

type Delivery = {
  id: number;
  integrationId: number | null;
  provider: string;
  eventType: string;
  endpoint: string;
  status: "success" | "failure" | "skipped";
  statusCode: number | null;
  responseSnippet: string;
  attempt: number;
  durationMs: number;
  createdAt: number;
};

const BRAND_COLORS: Record<string, string> = {
  gohighlevel: "#3b82f6",
  followupboss: "#0ea5e9",
  hubspot: "#f97316",
  zapier: "#f97316",
  n8n: "#10b981",
};

const BLURBS: Record<string, string> = {
  gohighlevel: "Push leads into your GHL pipeline. Auto-create contact, attach pipeline value, tag by trade.",
  followupboss: "Add lead as a Contact with smart list assignment. FUB action plan triggers automatically.",
  hubspot: "Create or update a HubSpot Contact + Deal. Lifecycle = lead.",
  zapier: "Trigger any Zap when a lead lands. Slack, Sheets, Notion, 5,000+ apps.",
  n8n: "Self-hosted automation. Drop the raw JSON into n8n, Make, or your own backend.",
};

function ago(ms: number | null): string {
  if (!ms) return "never";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function IntegrationsTab() {
  const { toast } = useToast();
  const { data: integrations = [], isLoading } = useQuery<ApiIntegration[]>({
    queryKey: ["/api/integrations"],
  });
  const { data: deliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["/api/webhooks/deliveries"],
    refetchInterval: 4000,
  });

  const [activeId, setActiveId] = useState<number | null>(null);
  const active = useMemo(
    () => integrations.find((i) => i.id === activeId) ?? integrations[0] ?? null,
    [activeId, integrations],
  );

  useEffect(() => {
    if (active && activeId === null) setActiveId(active.id);
  }, [active, activeId]);

  // Local draft for endpoint/secret editing — copied from server on selection change.
  const [draftEndpoint, setDraftEndpoint] = useState("");
  const [draftSecret, setDraftSecret] = useState("");
  const [draftAuth, setDraftAuth] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    setDraftEndpoint(active.endpoint);
    setDraftSecret(""); // never display the real secret
    setDraftAuth("");
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function patchIntegration(id: number, body: Record<string, unknown>) {
    const res = await apiRequest("PATCH", `/api/integrations/${id}`, body);
    return res.json();
  }

  async function handleToggle(i: ApiIntegration) {
    setTogglingId(i.id);
    try {
      await patchIntegration(i.id, { enabled: !i.enabled });
      await queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
    } catch (err: any) {
      toast({ title: "Could not toggle", description: err?.message ?? "", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSave() {
    if (!active) return;
    setSavingId(active.id);
    try {
      const body: Record<string, unknown> = { endpoint: draftEndpoint };
      if (draftSecret) body.secret = draftSecret;
      if (draftAuth) body.authHeader = draftAuth;
      await patchIntegration(active.id, body);
      await queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setDraftSecret("");
      setDraftAuth("");
      toast({ title: "Saved", description: `${active.displayName} settings updated.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message ?? "", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  }

  async function handleTest() {
    if (!active) return;
    setTestingId(active.id);
    try {
      const res = await apiRequest("POST", `/api/integrations/${active.id}/test`, {});
      const result = await res.json();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/integrations"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/webhooks/deliveries"] }),
      ]);
      if (result.status === "success") {
        toast({ title: "Test delivered", description: `HTTP ${result.statusCode} in ${result.durationMs}ms` });
      } else if (result.status === "skipped") {
        toast({ title: "Test skipped", description: result.reason || "Endpoint blocked or empty" });
      } else {
        toast({
          title: "Test failed",
          description: result.responseSnippet?.slice(0, 120) || `HTTP ${result.statusCode ?? "?"}`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "Test error", description: err?.message ?? "", variant: "destructive" });
    } finally {
      setTestingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading integrations…
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
      <Card className="border-border bg-card overflow-hidden min-w-0">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg">Integrations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              CRMs, automation, and raw webhooks. Live deliveries logged.
            </p>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 border-accent/40"
          >
            Live
          </Badge>
        </div>
        <div className="divide-y divide-border" data-testid="list-integrations">
          {integrations.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setActiveId(i.id)}
              data-testid={`row-integration-${i.provider}`}
              className={
                "w-full text-left px-4 py-3 flex items-center gap-3 hover-elevate " +
                (active?.id === i.id ? "bg-accent/10" : "")
              }
            >
              <BrandSquare provider={i.provider} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">{i.displayName}</span>
                  <StatusPill enabled={i.enabled} last={i.lastStatus} />
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {BLURBS[i.provider] ?? i.endpoint ?? "Custom integration"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-5 min-w-0 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1">
        {active && (
          <Card
            className="p-5 border-border bg-card min-w-0 overflow-hidden"
            data-testid={`detail-integration-${active.provider}`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <BrandSquare provider={active.provider} size={44} />
                <div>
                  <h4 className="font-display text-lg">{active.displayName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {active.category} integration · last test {ago(active.lastTestedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs text-muted-foreground" htmlFor={`enable-${active.provider}`}>
                  Enabled
                </Label>
                <Switch
                  id={`enable-${active.provider}`}
                  checked={active.enabled}
                  disabled={togglingId === active.id}
                  onCheckedChange={() => handleToggle(active)}
                  data-testid={`switch-integration-${active.provider}`}
                />
              </div>
            </div>

            <p className="text-sm text-foreground/85 mt-4">
              {BLURBS[active.provider] ??
                "Custom webhook endpoint. Receives a JSON payload signed with HMAC-SHA256."}
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Endpoint / webhook URL
                </Label>
                <Input
                  value={draftEndpoint}
                  onChange={(e) => setDraftEndpoint(e.target.value)}
                  placeholder="https://hooks.example.com/…"
                  className="mt-1 font-mono text-xs"
                  data-testid={`input-endpoint-${active.provider}`}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Signing secret (optional)
                  </Label>
                  <Input
                    type="password"
                    placeholder={active.hasSecret ? active.secretMasked : "whsec_…"}
                    value={draftSecret}
                    onChange={(e) => setDraftSecret(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    data-testid={`input-secret-${active.provider}`}
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Auth header (optional)
                  </Label>
                  <Input
                    placeholder={active.authHeaderMasked === "set" ? "•••••••• (set)" : "Bearer …"}
                    value={draftAuth}
                    onChange={(e) => setDraftAuth(e.target.value)}
                    className="mt-1 font-mono text-xs"
                    data-testid={`input-auth-${active.provider}`}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-foreground text-background p-3 font-mono text-[11px] leading-relaxed overflow-auto">
                <div className="text-background/60">
                  POST {active.endpoint || "(set endpoint above)"}
                </div>
                <div className="text-background/60 mt-1">
                  x-measuredquote-event: lead.created
                  <br />
                  x-measuredquote-signature: v1=&lt;HMAC-SHA256&gt;
                </div>
                <div className="mt-2">
                  {`{`}
                  <br />
                  {`  "event": "lead.created",`}
                  <br />
                  {`  "integration": "${active.provider}",`}
                  <br />
                  {`  "lead": { "id": 1, "name": "Mara Patel", "trade": "roofing", "lowEstimate": 18900, ... }`}
                  <br />
                  {`}`}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={savingId === active.id}
                  data-testid={`button-save-${active.provider}`}
                >
                  {savingId === active.id ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleTest}
                  disabled={testingId === active.id}
                  data-testid={`button-test-webhook-${active.provider}`}
                >
                  {testingId === active.id ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Send test payload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid={`button-rotate-${active.provider}`}
                  onClick={() => setDraftSecret(`whsec_${Math.random().toString(36).slice(2, 14)}`)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Generate secret
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-display text-sm">Recent deliveries</h4>
            <span className="text-xs text-muted-foreground font-mono">
              {deliveries.length} logged
            </span>
          </div>
          <div className="divide-y divide-border max-h-72 overflow-auto" data-testid="list-deliveries">
            {deliveries.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                No deliveries yet. Create a lead or hit Send test payload.
              </div>
            )}
            {deliveries.slice(0, 25).map((d) => (
              <div
                key={d.id}
                className="px-4 py-2.5 flex items-center justify-between text-sm gap-3"
                data-testid={`row-delivery-${d.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <DeliveryDot status={d.status} />
                  <div className="min-w-0">
                    <div className="text-foreground truncate">
                      <span className="font-mono text-xs text-muted-foreground">{d.eventType}</span>{" "}
                      → {d.provider}
                    </div>
                    <div
                      className="text-[11px] text-muted-foreground font-mono truncate"
                      title={d.responseSnippet}
                    >
                      {d.statusCode ? `HTTP ${d.statusCode}` : ""} {d.responseSnippet || d.endpoint}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-mono shrink-0 text-right">
                  <div>{ago(d.createdAt)}</div>
                  <div className="text-[10px]">{d.durationMs}ms</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BrandSquare({ provider, size = 32 }: { provider: string; size?: number }) {
  const Icon = provider === "hubspot" ? SiHubspot : provider === "zapier" ? SiZapier : Webhook;
  const color = BRAND_COLORS[provider] ?? "#71717a";
  return (
    <div
      className="rounded-md flex items-center justify-center text-white shrink-0"
      style={{ background: color, width: size, height: size }}
      aria-hidden
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

function StatusPill({ enabled, last }: { enabled: boolean; last: string }) {
  if (!enabled) {
    return (
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-muted text-muted-foreground border-border">
        <CircleDot className="h-3 w-3 mr-1" /> Off
      </Badge>
    );
  }
  if (last === "failure") {
    return (
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-destructive/15 border-destructive/40 text-foreground">
        <XCircle className="h-3 w-3 mr-1" /> Failing
      </Badge>
    );
  }
  if (last === "success") {
    return (
      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-emerald-500/15 border-emerald-500/40 text-foreground">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-amber-500/15 border-amber-500/40 text-foreground">
      <Clock className="h-3 w-3 mr-1" /> Ready
    </Badge>
  );
}

function DeliveryDot({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  if (status === "failure") return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
  if (status === "skipped") return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
  return <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />;
}
