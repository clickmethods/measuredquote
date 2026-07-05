// Browser-side Supabase REST adapter.
//
// The preview iframe disallows browser persistence APIs. To keep MeasuredQuote
// deployable in that environment, the client bundle intentionally avoids
// importing `@supabase/supabase-js`. Production server work still uses Supabase
// from Netlify Functions; this file only provides the small auth surface used by
// the login, onboarding, and settings screens.

type AuthSession = {
  access_token: string;
  refresh_token?: string;
  user?: { email?: string };
};

type AuthResult<T = unknown> = { data: T; error: null } | { data: null; error: Error };

export type LightweightSupabaseClient = {
  auth: {
    getSession(): Promise<{ data: { session: AuthSession | null }; error: null }>;
    signInWithOtp(args: {
      email: string;
      options?: { emailRedirectTo?: string };
    }): Promise<AuthResult>;
    signInWithPassword(args: { email: string; password: string }): Promise<AuthResult>;
    signUp(args: {
      email: string;
      password: string;
      options?: { emailRedirectTo?: string };
    }): Promise<AuthResult>;
  };
};

let cached: LightweightSupabaseClient | null = null;

const supabaseUrl = () => import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && anonKey());
}

export async function getSupabase(): Promise<LightweightSupabaseClient | null> {
  if (cached) return cached;
  if (!isSupabaseConfigured()) return null;

  const url = supabaseUrl()!;
  const key = anonKey()!;

  async function authFetch<T>(path: string, body: unknown): Promise<AuthResult<T>> {
    try {
      const res = await fetch(`${url}/auth/v1${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.msg || json?.message || json?.error_description || `HTTP ${res.status}`);
      }
      return { data: json as T, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  cached = {
    auth: {
      async getSession() {
        return { data: { session: readSessionFromUrl() }, error: null };
      },
      signInWithOtp({ email, options }) {
        return authFetch("/otp", {
          email,
          create_user: true,
          options: { email_redirect_to: options?.emailRedirectTo },
        });
      },
      signInWithPassword({ email, password }) {
        return authFetch("/token?grant_type=password", { email, password });
      },
      signUp({ email, password, options }) {
        return authFetch("/signup", {
          email,
          password,
          options: { email_redirect_to: options?.emailRedirectTo },
        });
      },
    },
  };

  return cached;
}

function readSessionFromUrl(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const fragment = window.location.hash.includes("access_token=")
    ? window.location.hash.split("?")[0]
    : "";
  const params = new URLSearchParams(fragment.replace(/^#\/?/, "").replace(/^#/, ""));
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  return {
    access_token: accessToken,
    refresh_token: params.get("refresh_token") ?? undefined,
    user: { email: params.get("email") ?? undefined },
  };
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
    supabaseUrl: supabaseUrl(),
    appUrl,
    appDomain,
    stripePublishableConfigured: Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY),
    domainConfigured: Boolean(appUrl && !/netlify\.app$/i.test(appDomain || "")),
    mapsConfigured: Boolean(import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY),
    embedHost: (import.meta.env.VITE_EMBED_HOST as string | undefined) ?? appDomain,
  };
}
