// Tenant + auth helpers for the dashboard.
//
// Demo mode: Supabase env vars missing → we operate against the Express
// SQLite prototype with a hard-coded "demo tenant". The hook returns a synthetic
// tenant object so the UI can render Settings, Onboarding, etc. without
// crashing. Persistence stays local to this React tree.
//
// Production mode: Supabase env vars present → real auth via @supabase/supabase-js,
// real tenant fetch via /api/tenants/me.

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type TenantRecord = {
  id: string;
  name: string;
  slug?: string;
  website?: string | null;
  domain?: string | null;
  contact_email?: string | null;
  notification_email?: string | null;
  brand_color?: string | null;
  logo_url?: string | null;
  trades?: string[] | null;
  widget_domain?: string | null;
  status?: string;
  plan_status?: string;
};

export type SessionState =
  | { mode: "loading" }
  | { mode: "demo"; tenant: TenantRecord }
  | { mode: "anon" } // Supabase configured but no session
  | { mode: "no-tenant"; userEmail: string } // logged in, needs onboarding
  | { mode: "ready"; userEmail: string; tenant: TenantRecord; role: string };

const DEMO_TENANT: TenantRecord = {
  id: "demo-ortiz-concrete",
  name: "Ortiz Concrete (Demo)",
  slug: "demo-ortiz-concrete",
  contact_email: "sales@ortizconcrete.com",
  notification_email: "ops@ortizconcrete.com",
  brand_color: "#ea580c",
  trades: ["concrete"],
  status: "active",
  plan_status: "trialing",
  widget_domain: null,
};

let demoOverrides: Partial<TenantRecord> = {};

/** Allow Settings UI to mutate demo state without a backend. */
export function patchDemoTenant(patch: Partial<TenantRecord>) {
  demoOverrides = { ...demoOverrides, ...patch };
  // Notify any listening hooks
  demoListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

const demoListeners = new Set<() => void>();

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ mode: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured()) {
        const tick = () =>
          setState({ mode: "demo", tenant: { ...DEMO_TENANT, ...demoOverrides } });
        tick();
        demoListeners.add(tick);
        return;
      }
      const client = await getSupabase();
      if (!client || cancelled) {
        setState({ mode: "demo", tenant: { ...DEMO_TENANT, ...demoOverrides } });
        return;
      }
      try {
        const { data } = await client.auth.getSession();
        const session = data.session;
        if (!session) {
          setState({ mode: "anon" });
          return;
        }
        const res = await fetch("/api/tenants/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          setState({ mode: "no-tenant", userEmail: session.user?.email ?? "" });
          return;
        }
        const json = await res.json();
        if (!json?.tenant) {
          setState({ mode: "no-tenant", userEmail: session.user?.email ?? "" });
          return;
        }
        setState({
          mode: "ready",
          userEmail: session.user?.email ?? "",
          tenant: json.tenant,
          role: json.role ?? "owner",
        });
      } catch {
        // On any failure we fall back to demo so the UI still loads.
        setState({ mode: "demo", tenant: { ...DEMO_TENANT, ...demoOverrides } });
      }
    }

    load();
    return () => {
      cancelled = true;
      // Best-effort cleanup of demo listener.
    };
  }, []);

  return state;
}

/** Convenience: returns the active tenant or null. */
export function tenantFromSession(s: SessionState): TenantRecord | null {
  if (s.mode === "demo" || s.mode === "ready") return s.tenant;
  return null;
}
