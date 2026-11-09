// Browser-side Supabase REST adapter.
//
// The client bundle intentionally avoids importing `@supabase/supabase-js`.
// Production server work uses Supabase from Netlify Functions; this file only
// provides the small auth surface used by login, onboarding, dashboard and
// settings. Sessions persist in localStorage (with an in-memory fallback for
// sandboxed contexts that block storage) and refresh automatically.

type AuthSession = {
  access_token: string;
  refresh_token?: string;
  /** unix seconds */
  expires_at?: number;
  user?: { email?: string };
};

const STORAGE_KEY = "mq.auth.session";
let memorySession: AuthSession | null = null;

function saveSession(sess: AuthSession | null) {
  memorySession = sess;
  try {
    if (sess) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: memory only
  }
}

function loadSession(): AuthSession | null {
  if (memorySession) return memorySession;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) memorySession = JSON.parse(raw) as AuthSession;
  } catch {
    // ignore
  }
  return memorySession;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: { email?: string };
};

function toSession(t: TokenResponse): AuthSession | null {
  if (!t?.access_token) return null;
  return {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: t.expires_at ?? (t.expires_in ? Math.floor(Date.now() / 1000) + t.expires_in : undefined),
    user: { email: t.user?.email },
  };
}

type AuthResult<T = unknown> = { data: T; error: null } | { data: null; error: Error };

export type LightweightSupabaseClient = {
  auth: {
    getSession(): Promise<{ data: { session: AuthSession | null }; error: null }>;
    signInWithOtp(args: {
      email: string;
      options?: { emailRedirectTo?: string };
    }): Promise<AuthResult>;
    signInWithPassword(args: { email: string; password: string }): Promise<AuthResult>;
    signOut(): Promise<void>;
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
        // 1. Magic-link / email-confirm redirect: token arrives in the URL.
        const fromUrl = readSessionFromUrl();
        if (fromUrl) {
          saveSession(fromUrl);
          stripTokenFromUrl();
          return { data: { session: fromUrl }, error: null };
        }
        // 2. Stored session, refreshed if it expires within 60s.
        let sess = loadSession();
        if (sess?.expires_at && sess.expires_at - 60 < Date.now() / 1000) {
          if (sess.refresh_token) {
            const r = await authFetch<TokenResponse>("/token?grant_type=refresh_token", {
              refresh_token: sess.refresh_token,
            });
            sess = r.data ? toSession(r.data) : null;
          } else {
            sess = null;
          }
          saveSession(sess);
        }
        return { data: { session: sess }, error: null };
      },
      async signOut() {
        const sess = loadSession();
        saveSession(null);
        if (sess) {
          await fetch(`${url}/auth/v1/logout`, {
            method: "POST",
            headers: { apikey: key, Authorization: `Bearer ${sess.access_token}` },
          }).catch(() => undefined);
        }
      },
      signInWithOtp({ email, options }) {
        return authFetch("/otp", {
          email,
          create_user: true,
          options: { email_redirect_to: options?.emailRedirectTo },
        });
      },
      async signInWithPassword({ email, password }) {
        const r = await authFetch<TokenResponse>("/token?grant_type=password", { email, password });
        if (r.data) saveSession(toSession(r.data));
        return r;
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
  const href = window.location.href;
  const i = href.indexOf("access_token=");
  if (i < 0) return null;
  const params = new URLSearchParams(href.slice(i).replace(/#/g, "&"));
  const accessToken = params.get("access_token");
  if (!accessToken) return null;
  const expiresIn = Number(params.get("expires_in") || 0);
  const expiresAt = Number(params.get("expires_at") || 0);
  let email: string | undefined = params.get("email") ?? undefined;
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    email = email ?? payload.email;
  } catch {
    // ignore
  }
  return {
    access_token: accessToken,
    refresh_token: params.get("refresh_token") ?? undefined,
    expires_at: expiresAt || (expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined),
    user: { email },
  };
}

function stripTokenFromUrl() {
  try {
    const href = window.location.href;
    const i = href.indexOf("access_token=");
    if (i < 0) return;
    // Keep the route part (e.g. /#/dashboard), drop the token fragment.
    let clean = href.slice(0, i).replace(/[#&?]+$/, "");
    if (!clean.includes("#/")) clean = clean.replace(/#?$/, "#/dashboard");
    window.history.replaceState(null, "", clean);
  } catch {
    // ignore
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
