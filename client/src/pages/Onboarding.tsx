// First-run tenant onboarding flow.
//
// Reached after a brand-new Supabase user lands on /dashboard without an
// associated tenant row. Collects the minimum info needed to provision the
// `tenants` row + the calling user's `tenant_members` row as `owner`. After
// success we navigate to the dashboard.
//
// In demo mode (Supabase unconfigured) the form still renders so the
// experience can be reviewed, but submission falls back to in-memory state.

import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { patchDemoTenant } from "@/lib/tenant";
import { useToast } from "@/hooks/use-toast";
import { TRADE_LIST } from "@/lib/trades";
import { AlertTriangle, Check, Sparkles } from "lucide-react";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [brandColor, setBrandColor] = useState("#ea580c");
  const [logoUrl, setLogoUrl] = useState("");
  const [trades, setTrades] = useState<string[]>(["concrete"]);
  const [widgetDomain, setWidgetDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = !isSupabaseConfigured();

  function toggleTrade(id: string) {
    setTrades((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }
    setBusy(true);
    try {
      if (demo) {
        patchDemoTenant({
          name,
          website: website || null,
          contact_email: contactEmail || null,
          brand_color: brandColor,
          logo_url: logoUrl || null,
          trades,
          widget_domain: widgetDomain || null,
        });
        toast({ title: "Demo tenant updated", description: "Settings stored locally for this session." });
        navigate("/dashboard");
        return;
      }

      const client = await getSupabase();
      if (!client) throw new Error("Supabase client unavailable");
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("not signed in");

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          website,
          contact_email: contactEmail,
          brand_color: brandColor,
          logo_url: logoUrl,
          trades,
          widget_domain: widgetDomain,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      toast({ title: "Tenant created", description: "You can now configure integrations and your widget." });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Logo size={32} />
          <div>
            <div className="text-base font-semibold">Set up your contractor profile</div>
            <p className="text-sm text-muted-foreground">
              Takes 60 seconds. You can change everything later from Settings.
            </p>
          </div>
        </div>

        {demo && (
          <div
            className="mb-5 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"
            data-testid="alert-onboarding-demo"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              Supabase isn’t configured, so changes save to this browser session
              only. Set <code className="rounded bg-amber-500/20 px-1">VITE_SUPABASE_URL</code> +
              <code className="rounded bg-amber-500/20 px-1 ml-1">VITE_SUPABASE_ANON_KEY</code>
              to persist for real.
            </div>
          </div>
        )}

        <form onSubmit={submit} className="grid gap-5" data-testid="form-onboarding">
          <Card className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Company name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ortiz Concrete"
                  required
                  data-testid="input-tenant-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://ortizconcrete.com"
                  data-testid="input-tenant-website"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs">Contact email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sales@ortizconcrete.com"
                  data-testid="input-tenant-contact"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="widgetDomain" className="text-xs">Widget domain (optional)</Label>
                <Input
                  id="widgetDomain"
                  value={widgetDomain}
                  onChange={(e) => setWidgetDomain(e.target.value)}
                  placeholder="ortizconcrete.com"
                  data-testid="input-tenant-widget-domain"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5">
            <div>
              <div className="text-sm font-semibold">Brand</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Used on the embed widget, PDF proposals, and email footers.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="brandColor" className="text-xs">Brand color</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="brandColor"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                    data-testid="input-tenant-brand-color"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#ea580c"
                    data-testid="input-tenant-brand-color-hex"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="logoUrl" className="text-xs">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://cdn.example.com/logo.png"
                  data-testid="input-tenant-logo-url"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <div className="text-sm font-semibold">Trades you quote</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick at least one. Determines which estimator templates the widget exposes.
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {TRADE_LIST.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 hover-elevate"
                  data-testid={`trade-toggle-${t.id}`}
                >
                  <Checkbox
                    checked={trades.includes(t.id)}
                    onCheckedChange={() => toggleTrade(t.id)}
                  />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
          </Card>

          {error && (
            <div
              className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300"
              data-testid="text-onboarding-error"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" />
              We'll provision a tenant ID, widget secret, and starter integrations.
            </p>
            <Button type="submit" disabled={busy} data-testid="button-onboarding-submit">
              {busy ? "Creating…" : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Create tenant
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
