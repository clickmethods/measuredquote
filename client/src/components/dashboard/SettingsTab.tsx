// Dashboard → Settings tab.
//
// Mirrors the Onboarding form but for an existing tenant. Loads via
// useSession() and PATCHes /api/tenants/me on save. In demo mode it falls
// back to in-memory state via patchDemoTenant().

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSession, tenantFromSession, patchDemoTenant, type TenantRecord } from "@/lib/tenant";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { TRADE_LIST } from "@/lib/trades";
import { Check, Save, ExternalLink, Globe, Mail, Palette, Building2 } from "lucide-react";

export function SettingsTab() {
  const session = useSession();
  const tenant = useMemo(() => tenantFromSession(session), [session]);
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<TenantRecord>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tenant) setForm(tenant);
  }, [tenant]);

  if (session.mode === "loading") {
    return (
      <Card className="p-6 text-sm text-muted-foreground" data-testid="card-settings-loading">
        Loading tenant…
      </Card>
    );
  }
  if (!tenant) {
    return (
      <Card className="p-6 text-sm text-muted-foreground" data-testid="card-settings-no-tenant">
        No tenant yet. Sign in and complete onboarding to configure settings.
      </Card>
    );
  }

  const trades = form.trades ?? [];
  function toggleTrade(id: string) {
    setForm((f) => {
      const cur = f.trades ?? [];
      return { ...f, trades: cur.includes(id) ? cur.filter((t) => t !== id) : [...cur, id] };
    });
  }

  async function save() {
    setBusy(true);
    try {
      if (!isSupabaseConfigured()) {
        patchDemoTenant(form);
        toast({ title: "Settings saved (demo)", description: "Persisted in this session only." });
        return;
      }
      const client = await getSupabase();
      if (!client) throw new Error("Supabase client unavailable");
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("not signed in");
      const res = await fetch("/api/tenants/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Settings saved" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5" data-testid="card-settings-summary">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{tenant.name}</div>
            <div className="text-xs text-muted-foreground">
              Tenant ID <code className="rounded bg-muted px-1">{tenant.id}</code>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" data-testid="badge-tenant-status">{tenant.status ?? "active"}</Badge>
            <Badge variant="outline" data-testid="badge-tenant-plan">{tenant.plan_status ?? "trialing"}</Badge>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-5" data-testid="card-settings-company">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Company</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="name"
            label="Company name"
            value={form.name ?? ""}
            onChange={(v) => setForm({ ...form, name: v })}
            testid="input-settings-name"
          />
          <Field
            id="website"
            label="Website"
            value={form.website ?? ""}
            onChange={(v) => setForm({ ...form, website: v })}
            testid="input-settings-website"
            icon={<Globe className="h-3.5 w-3.5" />}
          />
          <Field
            id="domain"
            label="Primary domain"
            value={form.domain ?? ""}
            onChange={(v) => setForm({ ...form, domain: v })}
            testid="input-settings-domain"
          />
          <Field
            id="widget_domain"
            label="Widget allowed domain"
            value={form.widget_domain ?? ""}
            onChange={(v) => setForm({ ...form, widget_domain: v })}
            testid="input-settings-widget-domain"
          />
          <Field
            id="contact_email"
            label="Contact email"
            value={form.contact_email ?? ""}
            onChange={(v) => setForm({ ...form, contact_email: v })}
            testid="input-settings-contact-email"
            icon={<Mail className="h-3.5 w-3.5" />}
            type="email"
          />
          <Field
            id="notification_email"
            label="Notification email"
            value={form.notification_email ?? ""}
            onChange={(v) => setForm({ ...form, notification_email: v })}
            testid="input-settings-notification-email"
            type="email"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5" data-testid="card-settings-brand">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Brand</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Brand color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.brand_color ?? "#ea580c"}
                onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                data-testid="input-settings-brand-color"
              />
              <Input
                value={form.brand_color ?? ""}
                onChange={(e) => setForm({ ...form, brand_color: e.target.value })}
                placeholder="#ea580c"
                data-testid="input-settings-brand-color-hex"
              />
            </div>
          </div>
          <Field
            id="logo_url"
            label="Logo URL"
            value={form.logo_url ?? ""}
            onChange={(v) => setForm({ ...form, logo_url: v })}
            testid="input-settings-logo-url"
            icon={<ExternalLink className="h-3.5 w-3.5" />}
          />
        </div>
      </Card>

      <Card className="space-y-4 p-5" data-testid="card-settings-trades">
        <div>
          <div className="text-sm font-semibold">Trades enabled</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Each enabled trade exposes its template inside the widget.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {TRADE_LIST.map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 hover-elevate"
              data-testid={`settings-trade-${t.id}`}
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

      <Separator />
      <div className="flex justify-end">
        <Button onClick={save} disabled={busy} data-testid="button-settings-save">
          {busy ? (
            "Saving…"
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  testid,
  icon,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  testid: string;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs">
        {icon} {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
      />
    </div>
  );
}
