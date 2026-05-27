// Production Settings tab.
//
// This is the visible end of Phase 4: it shows the operator (a) where the
// current deployment sits on the path to a production stack, and (b) what
// they still need to do before going live. It deliberately reads as
// "deployment console" — not as in-app billing — because the existing
// Pricing tab already handles plan selection at the marketing level.
//
// All values come from `getProductionStatus()` (Vite env vars) plus a
// short, hand-curated checklist. No real secrets are ever rendered.

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  CloudCog,
  Database,
  CreditCard,
  Globe,
  ShieldCheck,
  Webhook,
  ExternalLink,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import { getProductionStatus } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  doc?: string;
};

function StatusPill({ done, label }: { done: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={
        done
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
      }
      data-testid={`badge-prod-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      {done ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Circle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}

function StackCard({
  icon: Icon,
  title,
  vendor,
  status,
  body,
  bullets,
  cta,
  testId,
}: {
  icon: typeof CloudCog;
  title: string;
  vendor: string;
  status: { done: boolean; label: string };
  body: string;
  bullets: string[];
  cta?: { label: string; href: string };
  testId: string;
}) {
  return (
    <Card className="p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">{title}</div>
              <span className="text-xs text-muted-foreground">{vendor}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
        <StatusPill done={status.done} label={status.label} />
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-4">
          <Button
            asChild
            size="sm"
            variant="outline"
            data-testid={`button-${testId}-cta`}
          >
            <a href={cta.href} target="_blank" rel="noreferrer">
              {cta.label}
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      )}
    </Card>
  );
}

export function ProductionTab() {
  const status = useMemo(() => getProductionStatus(), []);
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const checklist: ChecklistItem[] = [
    {
      id: "tenant",
      label: "Create production tenant",
      detail: "Insert a row into `tenants` for your contractor. Set slug, contact email, and brand color.",
      done: false,
      doc: "supabase/migrations/001_measuredquote_phase4.sql",
    },
    {
      id: "schema",
      label: "Run migration 001",
      detail: "Apply `supabase/migrations/001_measuredquote_phase4.sql` to your Supabase project.",
      done: false,
    },
    {
      id: "env",
      label: "Set Netlify environment variables",
      detail: "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, APP_URL — see `.env.example`.",
      done: status.supabaseConfigured,
    },
    {
      id: "supabase-client",
      label: "Expose Supabase to the browser",
      detail: "Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY at build time so the dashboard signs in via Supabase Auth.",
      done: status.supabaseConfigured,
    },
    {
      id: "stripe",
      label: "Connect Stripe Billing",
      detail: "Create Starter + Pro Prices in Stripe, copy ids into Netlify env, register the webhook endpoint at /api/stripe/webhook.",
      done: status.stripePublishableConfigured,
    },
    {
      id: "domain",
      label: "Point production domain",
      detail: status.appDomain
        ? `Detected APP_URL host: ${status.appDomain}. Provision the managed TLS certificate in Netlify.`
        : "Add app.measuredquote.com (or your domain) in Netlify and provision the managed TLS certificate.",
      done: status.domainConfigured,
    },
    {
      id: "maps",
      label: "Enable live Google Maps (optional)",
      detail: "Add a referrer-restricted browser key to VITE_GOOGLE_MAPS_BROWSER_KEY. Simulated map stays the default.",
      done: status.mapsConfigured,
    },
  ];

  const done = checklist.filter((c) => c.done).length;

  function copy(id: string, value: string) {
    navigator.clipboard?.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    toast({ title: "Copied", description: id });
  }

  return (
    <div className="space-y-6">
      {/* Header card --------------------------------------------------- */}
      <Card className="p-5" data-testid="card-prod-summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Production setup</div>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              MeasuredQuote is built to deploy on Netlify with Supabase for data
              and Stripe for billing. This tab shows what is configured today
              and what's needed before going live. Nothing here changes how the
              current demo behaves.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid="badge-prod-progress">
              {done} / {checklist.length} steps complete
            </Badge>
            {status.supabaseConfigured ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600" data-testid="badge-prod-mode">
                Production mode
              </Badge>
            ) : (
              <Badge variant="secondary" data-testid="badge-prod-mode">
                Demo mode
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Stack cards --------------------------------------------------- */}
      <div className="grid gap-4 md:grid-cols-2">
        <StackCard
          testId="card-prod-netlify"
          icon={CloudCog}
          title="Hosting"
          vendor="Netlify"
          status={{ done: false, label: "Configured in netlify.toml" }}
          body="Static SPA on Netlify's CDN; backend lives in Netlify Functions under /api/*."
          bullets={[
            "Build command: npm run build → dist/public",
            "Functions: netlify/functions (esbuild bundler)",
            "Stripe webhook timeout extended to 26s",
            "SPA fallback redirect for deep links",
          ]}
          cta={{ label: "Netlify Functions docs", href: "https://docs.netlify.com/functions/overview/" }}
        />

        <StackCard
          testId="card-prod-supabase"
          icon={Database}
          title="Database & Auth"
          vendor="Supabase"
          status={{
            done: status.supabaseConfigured,
            label: status.supabaseConfigured ? "Browser keys present" : "Browser keys missing",
          }}
          body="Postgres with Row Level Security, scoped by tenant_id. Auth handled by Supabase Auth."
          bullets={[
            "Tables: tenants, tenant_members, leads, integrations, webhook_deliveries, widget_events, subscriptions, audit_events",
            "Helper functions app.is_tenant_member() / app.tenant_role()",
            "Public widget inserts go through signed widget tokens",
            "Service-role key stays in Netlify Functions only",
          ]}
          cta={{ label: "Supabase RLS guide", href: "https://supabase.com/docs/guides/database/postgres/row-level-security" }}
        />

        <StackCard
          testId="card-prod-stripe"
          icon={CreditCard}
          title="Billing"
          vendor="Stripe"
          status={{
            done: status.stripePublishableConfigured,
            label: status.stripePublishableConfigured ? "Publishable key present" : "Stripe disabled",
          }}
          body="Subscription Checkout, Customer Portal, and webhook-driven plan sync."
          bullets={[
            "Functions: /api/stripe/checkout, /api/stripe/portal, /api/stripe/webhook",
            "Webhook verifies signature with STRIPE_WEBHOOK_SECRET",
            "Subscription state mirrored to public.subscriptions and tenants.plan_status",
            "Test mode keys recommended until production cutover",
          ]}
          cta={{ label: "Stripe Customer Portal", href: "https://docs.stripe.com/customer-management" }}
        />

        <StackCard
          testId="card-prod-webhooks"
          icon={Webhook}
          title="Outbound webhooks"
          vendor="MeasuredQuote"
          status={{ done: true, label: "Live in Phase 3" }}
          body="Signed HMAC-SHA256 delivery to GoHighLevel, Follow Up Boss, HubSpot, Zapier, n8n."
          bullets={[
            "Per-integration secret + WEBHOOK_SIGNING_PEPPER fallback",
            "Refuses loopback / private hosts",
            "Delivery log surfaced under Integrations tab",
            "Retry queue is a Phase 5 item (see requirements doc §8)",
          ]}
        />
      </div>

      {/* Checklist ----------------------------------------------------- */}
      <Card className="p-5" data-testid="card-prod-checklist">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Go-live checklist</div>
        </div>
        <Separator className="my-4" />
        <ul className="space-y-3">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-start gap-3" data-testid={`checklist-${c.id}`}>
              {c.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-sm text-muted-foreground">{c.detail}</div>
                {c.doc && (
                  <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">
                    {c.doc}
                  </code>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Widget embed snippet ----------------------------------------- */}
      <Card className="p-5" data-testid="card-prod-widget-embed">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Embed snippet</div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Drop this on any contractor site. The loader mounts a sandboxed
          iframe that talks to your Netlify Functions; replace <code className="rounded bg-muted px-1">ten_xxxx</code> with your real tenant id.
        </p>
        <pre
          className="mt-3 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono"
          data-testid="text-embed-snippet"
        >{`<script
  src="https://${status.embedHost ?? "embed.measuredquote.com"}/widget/v1/widget.js"
  data-mq-tenant="ten_xxxxxxxxxxxx"
  data-mq-trade="concrete"
  data-mq-language="en"
  data-mq-mount="#mq-estimator"
  async
></script>
<div id="mq-estimator"></div>`}</pre>
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          onClick={() =>
            copy(
              "embed-snippet",
              `<script\n  src="https://${status.embedHost ?? "embed.measuredquote.com"}/widget/v1/widget.js"\n  data-mq-tenant="ten_xxxxxxxxxxxx"\n  data-mq-trade="concrete"\n  data-mq-language="en"\n  data-mq-mount="#mq-estimator"\n  async\n></script>\n<div id="mq-estimator"></div>`,
            )
          }
          data-testid="button-copy-embed-snippet"
        >
          {copiedId === "embed-snippet" ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          Copy embed snippet
        </Button>
      </Card>

      {/* Custom domain + env vars ------------------------------------- */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5" data-testid="card-prod-domain">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Custom domain</div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your domain in Netlify → Site settings → Domain management. The
            recommended record set for an apex + www pair:
          </p>
          <div className="mt-3 space-y-2 text-xs">
            {[
              { type: "A", host: "@", value: "75.2.60.5" },
              { type: "CNAME", host: "www", value: "<site-name>.netlify.app" },
            ].map((r) => (
              <div
                key={r.type + r.host}
                className="flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-1.5 font-mono"
              >
                <span>
                  <span className="text-muted-foreground">{r.type}</span> {r.host}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => copy(`${r.type}-${r.host}`, r.value)}
                  data-testid={`button-copy-${r.type.toLowerCase()}-${r.host}`}
                >
                  {copiedId === `${r.type}-${r.host}` ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {r.value}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" data-testid="card-prod-envvars">
          <div className="flex items-center gap-2">
            <CloudCog className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Required environment variables</div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Set these under Site settings → Environment variables. Copy the
            list and paste into Netlify's bulk editor; values stay blank until
            you provide them.
          </p>
          <pre
            className="mt-3 max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs font-mono"
            data-testid="text-envvar-list"
          >{`SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
APP_URL=
WEBHOOK_SIGNING_PEPPER=
GOOGLE_MAPS_SERVER_KEY=`}</pre>
          <Button
            className="mt-3"
            size="sm"
            variant="outline"
            onClick={() =>
              copy(
                "envvars",
                `SUPABASE_URL=\nSUPABASE_SERVICE_ROLE_KEY=\nSUPABASE_ANON_KEY=\nSTRIPE_SECRET_KEY=\nSTRIPE_WEBHOOK_SECRET=\nSTRIPE_PRICE_STARTER=\nSTRIPE_PRICE_PRO=\nAPP_URL=\nWEBHOOK_SIGNING_PEPPER=\nGOOGLE_MAPS_SERVER_KEY=`,
              )
            }
            data-testid="button-copy-envvars"
          >
            {copiedId === "envvars" ? (
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            Copy variable list
          </Button>
        </Card>
      </div>
    </div>
  );
}
