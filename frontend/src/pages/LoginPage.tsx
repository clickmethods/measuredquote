// Sign-in / sign-up page (Supabase Auth) — ported from client/ to the
// merged frontend. Magic link by default, password toggle available.
// Demo mode (no Supabase env) redirects straight to the dashboard.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, AlertTriangle, Check } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type Mode = 'magic' | 'password';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const demo = !isSupabaseConfigured();

  useEffect(() => {
    if (demo) {
      const t = setTimeout(() => navigate('/dashboard'), 1200);
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
      if (!client) throw new Error('Supabase client unavailable');

      if (mode === 'magic') {
        const { error: e1 } = await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin + '/#/dashboard' },
        });
        if (e1) throw e1;
        setSuccess('Check your email for the sign-in link.');
      } else {
        const { error: signInErr } = await client.auth.signInWithPassword({ email, password });
        if (signInErr) {
          const { error: signUpErr } = await client.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + '/#/onboarding' },
          });
          if (signUpErr) throw signUpErr;
          setSuccess('Account created. Check your email to confirm, then sign in.');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[24px] border border-[#E2E8F0] shadow-xl p-8">
        <div className="mb-6">
          <div className="text-lg font-bold text-[#0F172A]">Sign in to MeasuredQuote</div>
          <div className="text-sm text-[#64748B] mt-1">Manage leads, integrations, and your widget.</div>
        </div>

        {demo ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              Supabase isn't configured. This deployment runs in <strong>demo mode</strong> — redirecting to the dashboard…
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#0F172A]">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            {mode === 'password' && (
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-[#0F172A]">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <p className="text-[11px] text-[#64748B]">Minimum 8 characters.</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-700">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors"
            >
              {mode === 'magic' ? (
                <><Mail className="h-3.5 w-3.5" />{busy ? 'Sending…' : 'Email me a sign-in link'}</>
              ) : (
                <><KeyRound className="h-3.5 w-3.5" />{busy ? 'Working…' : 'Sign in / create account'}</>
              )}
            </button>

            <div className="border-t border-[#E2E8F0] pt-3 text-center text-xs text-[#64748B]">
              {mode === 'magic' ? (
                <button type="button" className="rounded-md px-2 py-1 hover:bg-[#F1F5F9]" onClick={() => setMode('password')}>
                  Use a password instead
                </button>
              ) : (
                <button type="button" className="rounded-md px-2 py-1 hover:bg-[#F1F5F9]" onClick={() => setMode('magic')}>
                  Use a magic link instead
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
