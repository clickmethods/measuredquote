// Browser-side Supabase client (PRODUCTION mode only).
//
// In the current prototype the dashboard talks to the Express API; Supabase
// is OFF by default. When you add the right env vars at build time, this
// client comes online and the production code paths under
// `client/src/lib/productionMode.ts` start using it.
//
// Required Vite env vars (must be prefixed with `VITE_` to be exposed to
// the browser bundle):
//
//   VITE_SUPABASE_URL              -> https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY         -> the public "anon" key (a.k.a.
//                                     "publishable" key in newer dashboards).
//
// The service-role key MUST NEVER appear in client code or env vars
// prefixed with VITE_. It only lives in Netlify Functions.

import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let loadAttempted = false;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns a memoized Supabase browser client, or `null` if the required
 * env vars are missing. The client is loaded lazily via dynamic import so
 * builds without Supabase env vars don't pull the SDK into the initial JS
 * bundle.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (cached) return cached;
  if (loadAttempted) return null;
  loadAttempted = true;

  if (!isSupabaseConfigured()) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    cached = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: false, // Sandboxed iframe blocks localStorage.
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
    return cached;
  } catch {
    return null;
  }
}

export type ProductionStatus = {
  supabaseConfigured: boolean;
  supabaseUrl?: string;
  appUrl?: string;
  appDomain?: string;
  stripePublishableConfigured: boolean;
  domainConfigured: boolean;
  mapsConfigured: boolean;
  embedHost?: string;
};

/** Snapshot used by the Production Settings UI for the health checklist. */
export function getProductionStatus(): ProductionStatus {
  const appUrl = import.meta.env.VITE_APP_URL as string | undefined;
  let appDomain: string | undefined;
  try {
    if (appUrl) appDomain = new URL(appUrl).host;
  } catch {
    appDomain = undefined;
  }
  return {
    supabaseConfigured: isSupabaseConfigured(),
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    appUrl,
    appDomain,
    stripePublishableConfigured: Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
    domainConfigured: Boolean(appUrl && !/netlify\.app$/i.test(appDomain || "")),
    mapsConfigured: Boolean(import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY),
    embedHost: (import.meta.env.VITE_EMBED_HOST as string | undefined) ?? appDomain,
  };
}
