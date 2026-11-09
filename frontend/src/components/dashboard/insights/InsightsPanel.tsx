import { Sparkles, TrendingUp, TriangleAlert, Info, MapPin } from 'lucide-react'
import type { Lead } from '../../../data/mockLeads'
import { computeInsights } from '../../../lib/leadAI'

const IMPACT: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  positive: { icon: TrendingUp, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
  warning: { icon: TriangleAlert, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  info: { icon: Info, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10' },
}

/** Plain-English weekly summary computed from the contractor's own leads. */
export default function InsightsPanel({ leads, now, live }: { leads: Lead[]; now: Date; live: boolean }) {
  const r = computeInsights(leads, now)

  return (
    <div className="bg-gradient-to-br from-[#0B1D3A] to-[#1A3A6B] rounded-2xl p-6 text-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles size={19} className="text-[#FDE68A]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Lead insights</h3>
          <p className="text-xs text-white/60">
            {live ? 'From your leads, updated live' : 'Demo data. Sign in to see your own leads.'}
          </p>
        </div>
      </div>

      <p className="text-sm text-white/80 leading-relaxed mb-5">{r.summary}</p>

      {r.enoughData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {r.insights.map((ins) => {
              const cfg = IMPACT[ins.impact]
              const Icon = cfg.icon
              return (
                <div key={ins.id} className="flex items-start gap-3 bg-white/5 rounded-xl p-3.5">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight">{ins.title}</p>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">{ins.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-2.5">Close rate by material</p>
              {r.closeRateByMaterial.length === 0 ? (
                <p className="text-xs text-white/50">No Won/Lost outcomes yet.</p>
              ) : (
                <div className="space-y-2">
                  {r.closeRateByMaterial.map((m) => (
                    <div key={m.material}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/80 truncate pr-2">{m.material}</span>
                        <span className="text-white/60 font-mono">
                          {m.rate}% ({m.won}/{m.decided})
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${m.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {r.topZips.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/50 mb-2.5">Top ZIP codes</p>
                <div className="flex flex-wrap gap-2">
                  {r.topZips.map((z) => (
                    <span key={z.zip} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs">
                      <MapPin size={11} /> {z.zip} · {z.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
