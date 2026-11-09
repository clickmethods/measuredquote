import { useState } from 'react'
import { Gauge, ChevronDown, ChevronUp } from 'lucide-react'
import type { Lead } from '../../../data/mockLeads'
import { computeQuoteRisk } from '../../../lib/leadAI'

const LEVEL = {
  low: { label: 'Low risk', badge: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]', bar: '#16A34A', note: 'The instant price should hold up on site.' },
  medium: { label: 'Some risk', badge: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]', bar: '#2563EB', note: 'Expect small adjustments after the site visit.' },
  high: { label: 'High risk', badge: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', bar: '#F59E0B', note: 'Treat the instant price as a ballpark and confirm before quoting.' },
} as const

const IMPACT = { up: 'text-[#16A34A]', down: 'text-[#D97706]', neutral: 'text-[#64748B]' } as const

/** Contractor-only: how likely the instant price is to move after the site visit. */
export default function QuoteRiskCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const r = computeQuoteRisk(lead)
  const s = LEVEL[r.level]

  return (
    <div className="border border-[#E2E8F0] rounded-[12px] p-4 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <Gauge size={15} className="text-[#475569]" />
        <p className="text-sm font-semibold text-[#0F172A]">Price confidence</p>
        <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${s.badge}`}>
          {r.confidence}% · {s.label}
        </span>
      </div>
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, backgroundColor: s.bar }} />
      </div>
      <p className="text-xs text-[#64748B]">{s.note}</p>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        Why this score
      </button>
      {open && (
        <div className="mt-2 pt-2 border-t border-[#F1F5F9] space-y-2">
          {r.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs font-bold font-mono w-4 shrink-0 ${IMPACT[f.impact]}`}>
                {f.impact === 'up' ? '+' : f.impact === 'down' ? '−' : '•'}
              </span>
              <div>
                <p className="text-xs font-medium text-[#334155] leading-tight">{f.label}</p>
                <p className="text-[11px] text-[#94A3B8] leading-snug">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
