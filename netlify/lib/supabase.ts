// Server-side Supabase client for Netlify Functions.
//
// IMPORTANT: This module is only safe to import from inside `netlify/functions/*`
// (i.e. server code). It uses the service-role key, which can bypass Row Level
// Security. NEVER import this from the browser bundle in `client/`.
//
// Env vars required:
//   - SUPABASE_URL                   (e.g. https://<project>.supabase.co)
//   - SUPABASE_SERVICE_ROLE_KEY      (server only, never exposed to client)
//
// In Netlify, set these under Site settings > Environment variables and mark
// them as "secret" so they aren't included in deploy logs.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase server client unavailable: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. " +
        "Set both in Netlify environment variables.",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application": "measuredquote-functions" } },
  });

  return cached;
}

// Convenience: scope all queries to a tenant id by setting a request-level
// header so RLS membership policies (see migration 001) can see the tenant.
// This is only meaningful when paired with a JWT that proves the user is a
// member of the tenant. For service-role calls we still pass tenant_id
// explicitly in `eq("tenant_id", ...)` filters as defense in depth.
export function getTenantScopedClient(jwt: string): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase tenant client unavailable: SUPABASE_URL/ANON_KEY missing in Netlify env.",
    );
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}
