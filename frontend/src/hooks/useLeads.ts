// Fetch real leads from /api/leads (Supabase-backed Netlify function) when a
// session exists; fall back to mock data in demo mode so the dashboard always
// renders. Maps the API's snake_case lead rows onto the UI's Lead type.

import { useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockLeads, type Lead } from '@/data/mockLeads';

interface ApiLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  trade: string;
  measurement: number;
  measurement_unit: 'sqft' | 'lf';
  material: string;
  addons: unknown[];
  low_estimate: number;
  high_estimate: number;
  status: string;
  created_at: string;
  language: string;
  source_url: string;
}

const tradeMap: Record<string, Lead['trade_type']> = {
  concrete: 'concrete',
  asphalt: 'asphalt',
  landscape: 'landscape',
  decks: 'deck',
  roofing: 'roof',
  fencing: 'fence',
  'temp-fence': 'fence',
};

function mapLead(l: ApiLead): Lead {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    address: l.address,
    trade_type: tradeMap[l.trade] ?? 'concrete',
    measurement_value: l.measurement,
    measurement_unit: l.measurement_unit,
    selected_materials: [l.material].filter(Boolean),
    selected_addons: Array.isArray(l.addons)
      ? l.addons.map((a) => (typeof a === 'object' && a !== null && 'id' in a ? String((a as { id: unknown }).id) : String(a)))
      : [],
    low_price: l.low_estimate,
    high_price: l.high_estimate,
    status: (['new', 'contacted', 'quoted', 'booked', 'closed'].includes(l.status) ? l.status : 'new') as Lead['status'],
    created_at: l.created_at,
    language: l.language === 'es' ? 'es' : 'en',
    source_url: l.source_url,
  };
}

export function useLeads(): { leads: Lead[]; live: boolean; loading: boolean } {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isSupabaseConfigured()) return;
        const client = await getSupabase();
        if (!client) return;
        const { data } = await client.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch('/api/leads', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const rows = (await res.json()) as ApiLead[];
        if (!cancelled && Array.isArray(rows)) {
          setLeads(rows.map(mapLead));
          setLive(true);
        }
      } catch {
        // demo fallback already in place
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { leads, live, loading };
}
