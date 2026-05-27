// Sign-in / sign-up page (Supabase Auth).
//
// Shown only when Supabase is configured (VITE_SUPABASE_URL +
// VITE_SUPABASE_ANON_KEY). In demo mode this page redirects straight to
// /dashboard since there is no real auth.
//
// Supports magic-link email and (when the user expands the toggle) email +
// password sign-in/sign-up. The Supabase project must have the matching
// providers enabled.

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Mail, KeyRound, AlertTriangle, Check } from "lucide-react";

type Mode = "magic" | "password";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const demo = !isSupabaseConfigured();

  useEffect(() => {
    if (demo) {
      // Demo deployments don't have auth; jump straight in.
      const t = setTimeout(() => navigate("/dashboard"), 1200);
      return () => clearTimeout(t);
    }
  }, [demo, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const client = await getSupabase();
      if (!client) throw new Error("Supabase client unavailable");

      if (mode === "magic") {
        const { error: e1 } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + "/#/dashboard",
          },
        });
        if (e1) throw e1;
        setSuccess("Check your email for the sign-in link.");
      } else {
        // Try sign-in first; if it fails because the user doesn't exist, fall
        // back to sign-up. Keeps the form to a single button.
        const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
        if (signInErr) {
          const { error: signUpErr } = await client.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + "/#/onboarding" },
          });
          if (signUpErr) throw signUpErr;
          setSuccess("Account created. Check your email to confirm, then sign in.");
        } else {
          navigate("/onboarding"); // /api/tenants/me will redirect to dashboard if a tenant exists
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-7" data-testid="card-login">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <div>
              <div className="text-sm font-semibold">Sign in to MeasuredQuote</div>
              <div className="text-xs text-muted-foreground">Manage leads, integrations, and your widget.</div>
            </div>
          </div>

          {demo ? (
            <div
              className="mt-5 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300"
              data-testid="alert-demo-mode"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                Supabase isn’t configured. This deployment runs in <strong>demo mode</strong> —
                redirecting you to the dashboard…
              </div>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={submit} data-testid="form-login">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              {mode === "password" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    data-testid="input-password"
                  />
                  <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
                </div>
              )}

              {error && (
                <div
                  className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300"
                  data-testid="text-login-error"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div
                  className="flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300"
                  data-testid="text-login-success"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy} data-testid="button-login-submit">
                {mode === "magic" ? (
                  <>
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    {busy ? "Sending…" : "Email me a sign-in link"}
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                    {busy ? "Working…" : "Sign in / create account"}
                  </>
                )}
              </Button>

              <Separator />
              <div className="text-center text-xs text-muted-foreground">
                {mode === "magic" ? (
                  <button
                    type="button"
                    className="hover-elevate active-elevate-2 rounded-md px-2 py-1"
                    onClick={() => setMode("password")}
                    data-testid="button-switch-password"
                  >
                    Use a password instead
                  </button>
                ) : (
                  <button
                    type="button"
                    className="hover-elevate active-elevate-2 rounded-md px-2 py-1"
                    onClick={() => setMode("magic")}
                    data-testid="button-switch-magic"
                  >
                    Use a magic link instead
                  </button>
                )}
              </div>
            </form>
          )}
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
