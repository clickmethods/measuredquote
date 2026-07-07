// First-run tenant onboarding — ported from client/ to the merged frontend.
// Collects the minimum info to provision the tenants row + owner membership
// via POST /api/tenants, then routes to the dashboard.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { patchDemoTenant } from '@/lib/tenant';
import { allTradeConfigs } from '@/data/tradeConfigs';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [brandColor, setBrandColor] = useState('#2563EB');
  const [logoUrl, setLogoUrl] = useState('');
  const [trades, setTrades] = useState<string[]>(['concrete']);
  const [widgetDomain, setWidgetDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = !isSupabaseConfigured();

  function toggleTrade(id: string) {
    setTrades((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Company name is required.');
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
        navigate('/dashboard');
        return;
      }

      const client = await getSupabase();
      if (!client) throw new Error('Supabase client unavailable');
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('not signed in');

      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed');
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]';
  const labelCls = 'text-xs font-medium text-[#0F172A]';

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold text-[#0F172A]">Set up your contractor profile</div>
            <p className="text-sm text-[#64748B]">Takes 60 seconds. You can change everything later from Settings.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-[24px] border border-[#E2E8F0] bg-white p-7 shadow-xl">
          {demo && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>Demo mode — changes are stored locally for this session only.</div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelCls}>Company name *</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Aspen Fence Company" required />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Website</label>
              <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://aspenfence.com" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Contact email</label>
              <input className={inputCls} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="leads@aspenfence.com" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Widget domain</label>
              <input className={inputCls} value={widgetDomain} onChange={(e) => setWidgetDomain(e.target.value)} placeholder="aspenfence.com" />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Brand color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-[#E2E8F0]" />
                <input className={inputCls} value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Logo URL</label>
              <input className={inputCls} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.png" />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Trades you offer</label>
            <div className="flex flex-wrap gap-2">
              {allTradeConfigs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTrade(t.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    trades.includes(t.id)
                      ? 'border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#94A3B8]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create my workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
