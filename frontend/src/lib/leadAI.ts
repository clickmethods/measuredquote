// Lead-desk intelligence for the contractor dashboard.
//
// Everything here is deterministic and explainable: rules over the
// contractor's own lead data, no external model calls. That keeps it free,
// instant, private, and honest for the pilot. Each function is shaped so an
// LLM call can replace the template later without touching the UI.

import type { Lead } from '@/data/mockLeads';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export const TRADE_LABELS: Record<Lead['trade_type'], string> = {
  concrete: 'concrete',
  asphalt: 'paving',
  landscape: 'landscaping',
  deck: 'deck',
  roof: 'roofing',
  fence: 'fence',
};

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const hoursBetween = (from: Date, to: Date) => (to.getTime() - from.getTime()) / 36e5;

function firstName(lead: Lead): string {
  return lead.name.trim().split(/\s+/)[0] || 'there';
}

function cityFrom(address: string): string | null {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 2] : parts.length === 2 ? parts[1].replace(/\s*\d{5}.*/, '') : null;
}

function zipFrom(address: string): string | null {
  const m = address.match(/\b(\d{5})(?:-\d{4})?\b(?!.*\b\d{5}\b)/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// 1. Follow-up queue + drafts
// ---------------------------------------------------------------------------

export const FOLLOW_UP_THRESHOLD_HOURS = 48;

export function lastActivity(lead: Lead): Date {
  return new Date(lead.last_activity_at ?? lead.created_at);
}

export function hoursSilent(lead: Lead, now: Date): number {
  return Math.max(0, hoursBetween(lastActivity(lead), now));
}

/** Open lead with no activity for 48h+ */
export function needsFollowUp(lead: Lead, now: Date): boolean {
  if (lead.status === 'booked' || lead.status === 'closed' || lead.outcome) return false;
  return hoursSilent(lead, now) >= FOLLOW_UP_THRESHOLD_HOURS;
}

export interface FollowUpDraft {
  sms: string;
  emailSubject: string;
  emailBody: string;
  reason: string;
  daysSilent: number;
}

export function buildFollowUpDraft(lead: Lead, companyName: string, now: Date): FollowUpDraft {
  const days = Math.max(1, Math.round(hoursSilent(lead, now) / 24));
  const name = firstName(lead);
  const trade = TRADE_LABELS[lead.trade_type];
  const range = `${money(lead.low_price)}–${money(lead.high_price)}`;
  const city = cityFrom(lead.address);
  const where = city ? ` in ${city}` : '';
  const company = companyName.replace(/\s*\(demo\)\s*/i, '').trim() || 'our team';

  if (lead.language === 'es') {
    return {
      daysSilent: days,
      reason: `Sin actividad por ${days} dia(s) desde que recibio su estimado.`,
      sms:
        `Hola ${name}, le escribe ${company}. Su estimado para el proyecto${where} fue de ${range}. ` +
        `¿Le gustaria que pasemos esta semana a confirmar medidas y precio final? Responda SI y lo agendamos.`,
      emailSubject: `Su estimado de ${range} — siguientes pasos`,
      emailBody:
        `Hola ${name},\n\nGracias por usar nuestra calculadora en linea. Su estimado para el proyecto${where} fue de ${range}.\n\n` +
        `El siguiente paso es una visita rapida para confirmar medidas y darle un precio final por escrito. ` +
        `¿Que dia le funciona esta semana?\n\nSaludos,\n${company}`,
    };
  }

  return {
    daysSilent: days,
    reason: `No activity for ${days} day${days === 1 ? '' : 's'} since they got their estimate.`,
    sms:
      `Hi ${name}, it's ${company}. Your ${trade} estimate${where} came in at ${range}. ` +
      `Want us to stop by this week to confirm measurements and lock in a final price? Reply YES and we'll get you on the calendar.`,
    emailSubject: `Your ${range} ${trade} estimate — next steps`,
    emailBody:
      `Hi ${name},\n\nThanks for using our online estimator. Your ${trade} project${where} came in at ${range}.\n\n` +
      `Next step is a quick site visit to confirm measurements and give you a final written price. ` +
      `What day works for you this week?\n\nThanks,\n${company}`,
  };
}

// ---------------------------------------------------------------------------
// 2. Quote risk (contractor-facing confidence score)
// ---------------------------------------------------------------------------

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskFactor {
  label: string;
  detail: string;
  impact: 'up' | 'down' | 'neutral';
}

export interface QuoteRisk {
  confidence: number; // 35–96
  level: RiskLevel; // risk that the final price moves materially
  factors: RiskFactor[];
}

// Typical residential project sizes, in the units each trade measures.
const TYPICAL_SIZE: Record<Lead['trade_type'], [number, number]> = {
  concrete: [300, 2500],
  asphalt: [400, 4000],
  landscape: [150, 3000],
  deck: [120, 800],
  roof: [1000, 4500],
  fence: [50, 450],
};

// How well a satellite drawing predicts the final price, by trade.
const MEASURE_FIDELITY: Record<Lead['trade_type'], { score: number; note: string }> = {
  fence: { score: 8, note: 'Fence lines measure cleanly from satellite.' },
  asphalt: { score: 6, note: 'Driveway outlines are clear from satellite.' },
  concrete: { score: 0, note: 'Slab thickness, base prep and access are not visible from satellite.' },
  landscape: { score: -2, note: 'Grade, drainage and access drive hardscape cost and are not visible from satellite.' },
  deck: { score: -6, note: 'Deck height, stairs and railing are not visible from satellite.' },
  roof: { score: -6, note: 'Pitch and layers are estimated; verify on site.' },
};

export function computeQuoteRisk(lead: Lead): QuoteRisk {
  const factors: RiskFactor[] = [];
  let score = 70;

  const [min, max] = TYPICAL_SIZE[lead.trade_type];
  const size = lead.measurement_value;
  const unit = lead.measurement_unit === 'lf' ? 'linear ft' : 'sq ft';
  if (size >= min && size <= max) {
    score += 10;
    factors.push({ label: 'Typical size', detail: `${size.toLocaleString()} ${unit} is a normal residential ${TRADE_LABELS[lead.trade_type]} job.`, impact: 'up' });
  } else {
    score -= 15;
    factors.push({
      label: size < min ? 'Unusually small' : 'Unusually large',
      detail: `${size.toLocaleString()} ${unit} is outside the usual ${min.toLocaleString()}–${max.toLocaleString()} range. Check the drawing before you call.`,
      impact: 'down',
    });
  }

  const fid = MEASURE_FIDELITY[lead.trade_type];
  score += fid.score;
  factors.push({ label: 'Measurement method', detail: fid.note, impact: fid.score > 0 ? 'up' : fid.score < 0 ? 'down' : 'neutral' });

  const mid = (lead.low_price + lead.high_price) / 2 || 1;
  const spread = Math.round(((lead.high_price - lead.low_price) / mid) * 100);
  if (spread <= 20) {
    score += 6;
    factors.push({ label: 'Tight range', detail: `Low/high spread is ${spread}%, so the price is predictable.`, impact: 'up' });
  } else if (spread <= 40) {
    factors.push({ label: 'Normal range', detail: `Low/high spread is ${spread}%.`, impact: 'neutral' });
  } else {
    score -= 10;
    factors.push({ label: 'Wide range', detail: `Low/high spread is ${spread}%. Set expectations early.`, impact: 'down' });
  }

  if (lead.selected_addons.length > 0) {
    score += 4;
    factors.push({ label: 'Detailed scope', detail: `${lead.selected_addons.length} add-on(s) selected, so less guesswork.`, impact: 'up' });
  }

  const confidence = Math.max(35, Math.min(96, Math.round(score)));
  const level: RiskLevel = confidence >= 80 ? 'low' : confidence >= 62 ? 'medium' : 'high';
  return { confidence, level, factors };
}

// ---------------------------------------------------------------------------
// 3. Voice / free-text → structured site note
// ---------------------------------------------------------------------------

export function structureSiteNote(transcript: string): string {
  const t = transcript.toLowerCase();
  const parts: string[] = [];

  const gate = t.match(/(\d+|one|two|three|four)\s*(walk |drive |double )?gates?/);
  if (gate) parts.push(`Gates: ${gate[1]}${gate[2] ? ` (${gate[2].trim()})` : ''}`);

  const ft = t.match(/(\d{2,5})\s*(linear feet|linear foot|feet|foot|ft|lf)\b/);
  if (ft) parts.push(`Confirmed length: ~${ft[1]} ft`);

  const sq = t.match(/(\d{2,5})\s*(square feet|square foot|sq ?ft|sqft)/);
  if (sq) parts.push(`Confirmed area: ~${sq[1]} sq ft`);

  const flags: [RegExp, string][] = [
    [/slope|sloped|hill|grade/, 'Terrain: sloped or uneven grade'],
    [/tree|root|stump/, 'Obstruction: trees or roots'],
    [/hoa|homeowners association/, 'HOA approval needed'],
    [/permit/, 'Permit required'],
    [/survey|property line|neighbor/, 'Property line / neighbor to confirm'],
    [/sprinkler|irrigation/, 'Irrigation lines on site'],
    [/dog|pet/, 'Pets on site'],
    [/tear ?out|demo|remove|removal/, 'Tear-out / removal needed'],
    [/access|narrow|gate width|tight/, 'Limited equipment access'],
    [/drain|water|pooling/, 'Drainage concern'],
  ];
  for (const [re, label] of flags) if (re.test(t)) parts.push(label);

  const clean = transcript.trim().replace(/\s+/g, ' ');
  if (parts.length === 0) return `Site note: ${clean}`;
  return `${parts.join(' · ')}\nTranscript: ${clean}`;
}

// ---------------------------------------------------------------------------
// 4. Insights from the contractor's own leads
// ---------------------------------------------------------------------------

export interface Insight {
  id: string;
  impact: 'positive' | 'warning' | 'info';
  title: string;
  detail: string;
}

export interface InsightReport {
  enoughData: boolean;
  summary: string;
  insights: Insight[];
  closeRateByMaterial: { material: string; won: number; decided: number; rate: number }[];
  topZips: { zip: string; count: number }[];
}

export function computeInsights(leads: Lead[], now: Date): InsightReport {
  const weekAgo = new Date(now.getTime() - 7 * 864e5);
  const thisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo);
  const won = leads.filter((l) => l.outcome === 'won');
  const lost = leads.filter((l) => l.outcome === 'lost');
  const decided = won.length + lost.length;
  const stale = leads.filter((l) => needsFollowUp(l, now));
  const open = leads.filter((l) => !l.outcome && l.status !== 'closed');
  const pipeline = open.reduce((s, l) => s + (l.low_price + l.high_price) / 2, 0);

  const byMat = new Map<string, { won: number; decided: number }>();
  for (const l of [...won, ...lost]) {
    const m = l.selected_materials[0] || 'Unspecified';
    const cur = byMat.get(m) ?? { won: 0, decided: 0 };
    cur.decided += 1;
    if (l.outcome === 'won') cur.won += 1;
    byMat.set(m, cur);
  }
  const closeRateByMaterial = [...byMat.entries()]
    .map(([material, v]) => ({ material, ...v, rate: Math.round((v.won / v.decided) * 100) }))
    .sort((a, b) => b.decided - a.decided)
    .slice(0, 5);

  const zipCounts = new Map<string, number>();
  for (const l of leads) {
    const z = zipFrom(l.address);
    if (z) zipCounts.set(z, (zipCounts.get(z) ?? 0) + 1);
  }
  const topZips = [...zipCounts.entries()]
    .map(([zip, count]) => ({ zip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const insights: Insight[] = [];
  if (stale.length > 0) {
    const atStake = stale.reduce((s, l) => s + (l.low_price + l.high_price) / 2, 0);
    insights.push({
      id: 'stale',
      impact: 'warning',
      title: `${stale.length} lead${stale.length === 1 ? '' : 's'} gone quiet (${money(atStake)} in estimates)`,
      detail: 'No activity for 48+ hours. Drafted follow-ups are waiting in the Leads tab.',
    });
  }
  if (decided >= 3) {
    const rate = Math.round((won.length / decided) * 100);
    insights.push({
      id: 'close',
      impact: rate >= 30 ? 'positive' : 'info',
      title: `Close rate ${rate}% (${won.length} won of ${decided} decided)`,
      detail: closeRateByMaterial[0]
        ? `Most decided jobs: ${closeRateByMaterial[0].material} at ${closeRateByMaterial[0].rate}% close rate.`
        : 'Mark more leads Won or Lost to see which materials close best.',
    });
  } else {
    insights.push({
      id: 'close',
      impact: 'info',
      title: 'Mark leads Won or Lost',
      detail: 'Once 3+ leads have an outcome, this shows your close rate by material.',
    });
  }
  const es = leads.filter((l) => l.language === 'es').length;
  if (leads.length >= 5 && es / leads.length >= 0.15) {
    insights.push({
      id: 'es',
      impact: 'info',
      title: `${Math.round((es / leads.length) * 100)}% of leads prefer Spanish`,
      detail: 'Follow-up drafts for these leads are written in Spanish automatically.',
    });
  }
  if (topZips[0] && topZips[0].count >= 2) {
    insights.push({
      id: 'zip',
      impact: 'positive',
      title: `Top ZIP: ${topZips[0].zip} (${topZips[0].count} leads)`,
      detail: 'Worth a yard sign or a local Facebook post there.',
    });
  }

  const enoughData = leads.length >= 3;
  const summary = enoughData
    ? `${thisWeek.length} new lead${thisWeek.length === 1 ? '' : 's'} in the last 7 days. ` +
      `${open.length} open with ${money(pipeline)} in estimated work. ` +
      (stale.length ? `${stale.length} need${stale.length === 1 ? 's' : ''} a follow-up today.` : 'Nothing has gone quiet.')
    : 'Insights appear once you have a few leads. Embed the widget on your site to start collecting them.';

  return { enoughData, summary, insights, closeRateByMaterial, topZips };
}

// ---------------------------------------------------------------------------
// 5. Homeowner-facing project summary (results screen + PDF)
// ---------------------------------------------------------------------------

export interface SummaryInput {
  tradeName: string;
  materialName: string;
  measurement: number;
  measurementUnit: string; // e.g. 'sq ft' | 'linear ft'
  addons: string[];
  lowPrice: number;
  highPrice: number;
  address: string;
}

export function generateProjectSummary(i: SummaryInput): string {
  const addons = i.addons.length ? `, plus ${i.addons.join(', ').toLowerCase()}` : '';
  const where = i.address ? ` at ${i.address}` : '';
  return (
    `Based on the area you outlined on the satellite map, your ${i.tradeName.toLowerCase()} project${where} ` +
    `covers about ${Math.round(i.measurement).toLocaleString()} ${i.measurementUnit}. ` +
    `With ${i.materialName}${addons}, the estimated range is ${money(i.lowPrice)} to ${money(i.highPrice)}. ` +
    `This is a ballpark based on typical site conditions. A short site visit confirms measurements, ` +
    `access and prep, and turns this into a final written price.`
  );
}
