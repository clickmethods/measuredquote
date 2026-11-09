// Fetch real leads from /api/leads (Supabase-backed Netlify function) when a
// session exists; fall back to mock data in demo mode so the dashboard always
// renders. Maps the API's snake_case lead rows onto the UI's Lead type, and
// exposes updateLead() which persists status / notes via PATCH /api/leads/:id
// (demo mode updates local state only).

import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockLeads, type Lead, type LeadNote } from '@/data/mockLeads';

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
  updated_at?: string;
  last_activity_at?: string;
  notes?: unknown;
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

// DB statuses: new | contacted | scheduled | quoted | won | lost
// UI statuses: new | contacted | quoted | booked | closed (+ outcome)
function mapStatus(db: string): { status: Lead['status']; outcome?: Lead['outcome'] } {
  switch (db) {
    case 'contacted':
      return { status: 'contacted' };
    case 'quoted':
      return { status: 'quoted' };
    case 'scheduled':
      return { status: 'booked' };
    case 'won':
      return { status: 'closed', outcome: 'won' };
    case 'lost':
      return { status: 'closed', outcome: 'lost' };
    default:
      return { status: 'new' };
  }
}

export type DbLeadStatus = 'new' | 'contacted' | 'scheduled' | 'quoted' | 'won' | 'lost';

function toDbStatus(ui: Lead['status'], outcome?: Lead['outcome']): DbLeadStatus {
  if (outcome) return outcome;
  if (ui === 'booked') return 'scheduled';
  if (ui === 'closed') return 'won';
  return ui;
}

function mapNotes(raw: unknown): LeadNote[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((n): n is { text: unknown; at?: unknown; source?: unknown } => typeof n === 'object' && n !== null && 'text' in n)
    .map((n) => ({
      text: String(n.text),
      at: typeof n.at === 'string' ? n.at : new Date().toISOString(),
      source: n.source === 'voice' ? 'voice' : 'typed',
    }));
}

function mapLead(l: ApiLead): Lead {
  const { status, outcome } = mapStatus(l.status);
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    address: l.address,
    trade_type: tradeMap[l.trade] ?? 'concrete',
    measurement_value: Number(l.measurement),
    measurement_unit: l.measurement_unit,
    selected_materials: [l.material].filter(Boolean),
    selected_addons: Array.isArray(l.addons)
      ? l.addons.map((a) => (typeof a === 'object' && a !== null && 'id' in a ? String((a as { id: unknown }).id) : String(a)))
      : [],
    low_price: Number(l.low_estimate),
    high_price: Number(l.high_estimate),
    status,
    outcome,
    created_at: l.created_at,
    last_activity_at: l.last_activity_at ?? l.updated_at ?? l.created_at,
    notes: mapNotes(l.notes),
    language: l.language === 'es' ? 'es' : 'en',
    source_url: l.source_url,
  };
}

async function getToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const client = await getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface LeadPatch {
  status?: Lead['status'];
  outcome?: Lead['outcome'];
  note?: string;
  noteSource?: 'typed' | 'voice';
}

export interface UseLeadsResult {
  leads: Lead[];
  live: boolean;
  loading: boolean;
  /** "Now" for time-based logic: real clock when live, anchored to the demo dataset otherwise */
  now: Date;
  updateLead: (id: string, patch: LeadPatch) => Promise<{ ok: boolean; error?: string }>;
}

// Demo leads are dated late May 2025; anchor demo-mode time there so the
// follow-up queue and relative timestamps look like a real working week.
export const DEMO_NOW = new Date('2025-05-27T15:00:00Z');

export function useLeads(): UseLeadsResult {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
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

  const updateLead = useCallback(
    async (id: string, patch: LeadPatch) => {
      const applyLocal = (l: Lead): Lead => {
        if (l.id !== id) return l;
        const next: Lead = { ...l, last_activity_at: new Date().toISOString() };
        if (patch.outcome) {
          next.status = 'closed';
          next.outcome = patch.outcome;
        } else if (patch.status) {
          next.status = patch.status;
        }
        if (patch.note) {
          next.notes = [
            ...(l.notes ?? []),
            { text: patch.note, at: new Date().toISOString(), source: patch.noteSource ?? 'typed' },
          ];
        }
        return next;
      };

      if (!live) {
        setLeads((prev) => prev.map(applyLocal));
        return { ok: true };
      }

      try {
        const token = await getToken();
        if (!token) return { ok: false, error: 'Session expired. Sign in again.' };
        const body: Record<string, string> = {};
        if (patch.status || patch.outcome) body.status = toDbStatus(patch.status ?? 'closed', patch.outcome);
        if (patch.note) {
          body.note = patch.note;
          body.note_source = patch.noteSource ?? 'typed';
        }
        const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) return { ok: false, error: `Save failed (${res.status})` };
        const row = (await res.json()) as ApiLead;
        setLeads((prev) => prev.map((l) => (l.id === id ? mapLead(row) : l)));
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error. Try again.' };
      }
    },
    [live],
  );

  return { leads, live, loading, now: live ? new Date() : DEMO_NOW, updateLead };
}
