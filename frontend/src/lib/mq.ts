// ═══════════════════════════════════════════════════════════════
// MeasuredQuote platform bridge
// Embed params, lead submission, and postMessage protocol that
// matches /widget/v1/widget.js (source: "measuredquote") and the
// Netlify function contract in netlify/functions/leads.ts.
// ═══════════════════════════════════════════════════════════════

export interface EmbedContext {
  isEmbed: boolean;
  tenant: string | null;
  trade: string | null;
  lang: string | null;
  /** Signed widget token: `<tenant_id>.<token_id>.<hmac>` (see netlify/lib/auth.ts). */
  token: string | null;
  theme: string | null;
}

/** Parse embed params from the hash-route query (#/embed?tenant=...&t=...). */
export function getEmbedContext(): EmbedContext {
  const hash = window.location.hash || '';
  const qIdx = hash.indexOf('?');
  const params = new URLSearchParams(qIdx >= 0 ? hash.slice(qIdx + 1) : '');
  return {
    isEmbed: hash.startsWith('#/embed'),
    tenant: params.get('tenant'),
    trade: params.get('trade'),
    lang: params.get('lang'),
    token: params.get('t'),
    theme: params.get('theme'),
  };
}

function post(msg: Record<string, unknown>) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ source: 'measuredquote', ...msg }, '*');
  }
}

export function notifyResize(height: number) {
  post({ type: 'resize', height });
}

export function notifyLeadCreated(lead: Record<string, unknown>) {
  post({ type: 'lead.created', lead });
}

// ── Lead submission ──
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

/** Matches LeadInput in netlify/functions/leads.ts (snake_case, prices required). */
export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  language?: string;
  trade: string;
  measurement: number;
  measurement_unit: 'sqft' | 'lf';
  material: string;
  addons?: unknown[];
  low_estimate: number;
  high_estimate: number;
  line_items?: unknown[];
  geometry?: unknown;
  source_url?: string;
}

/**
 * POST the lead to /.netlify/functions/leads. Auth is the signed widget
 * token (x-measuredquote-widget-token) minted per tenant by the dashboard.
 * Fire-and-forget safe: failures are logged, never block the homeowner.
 */
export async function submitLead(payload: LeadInput, widgetToken: string | null): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (widgetToken) headers['x-measuredquote-widget-token'] = widgetToken;
    const res = await fetch(`${API_BASE}/.netlify/functions/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`leads endpoint ${res.status}`);
    notifyLeadCreated({
      name: payload.name,
      trade: payload.trade,
      measurement: payload.measurement,
      low_estimate: payload.low_estimate,
      high_estimate: payload.high_estimate,
    });
    return true;
  } catch (err) {
    console.warn('[MeasuredQuote] lead submission failed:', err);
    return false;
  }
}
