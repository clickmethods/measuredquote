import { useState, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  MousePointerClick,
  Users,
  Map,
  FileText,
  CalendarCheck,
  Percent,
  User,
  Eye,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import {
  funnelData,
  leadsOverTime,
  leadsOverTime7D,
  leadsOverTime90D,
  leadsByTrade,
  leadsByLanguage,
  conversionMetrics,
  recentActivity,
  analyticsSummary,
} from '../../data/mockAnalytics'

type TimeRange = '7d' | '30d' | '90d'

/* ─── helpers ─── */
const formatNumber = (n: number) => n.toLocaleString()

/* ─── Summary Stat Card ─── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{label}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <TrendingUp size={13} className="text-[#22C55E]" />
        <span className="text-xs font-medium text-[#22C55E]">{sub}</span>
        <span className="text-xs text-[#94A3B8] ml-0.5">vs last month</span>
      </div>
    </div>
  )
}

/* ─── Funnel Tooltip ─── */
function FunnelTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  const idx = funnelData.findIndex((d) => d.step === data.step)
  const prevCount = idx > 0 ? funnelData[idx - 1].count : data.count
  const conversion = idx > 0 ? ((data.count / prevCount) * 100).toFixed(1) : '100.0'
  const dropoff = idx > 0 ? (100 - parseFloat(conversion)).toFixed(1) : '0.0'

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 min-w-[180px]">
      <p className="text-sm font-semibold text-[#0F172A]">{data.step}</p>
      <p className="text-lg font-bold text-[#2563EB] mt-0.5">{data.count.toLocaleString()}</p>
      {idx > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-[#E2E8F0] space-y-0.5">
          <p className="text-xs text-[#22C55E] font-medium">Conversion: {conversion}%</p>
          <p className="text-xs text-[#EF4444]">Drop-off: {dropoff}%</p>
        </div>
      )}
    </div>
  )
}

/* ─── Custom Funnel Bar Label ─── */
function FunnelBarLabel(props: any) {
  const { x, y, width, height, value, index } = props
  const idx = index as number
  const prevCount = idx > 0 ? funnelData[idx - 1].count : value
  const conversion = idx > 0 ? ((value / prevCount) * 100).toFixed(1) : '100.0'
  const dropoff = idx > 0 ? (100 - parseFloat(conversion)).toFixed(1) : null

  return (
    <g>
      <text x={x + width + 10} y={y + height / 2} dy={4} fill="#0F172A" fontSize={13} fontWeight={600}>
        {value.toLocaleString()}
      </text>
      {dropoff && parseFloat(dropoff) > 0 && (
        <text x={x + width + 10} y={y + height / 2 + 16} dy={4} fill="#EF4444" fontSize={11}>
          -{dropoff}%
        </text>
      )}
    </g>
  )
}

/* ─── Activity Icon ─── */
function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    lead: { icon: User, bg: 'bg-[#DBEAFE]', color: 'text-[#2563EB]' },
    booked: { icon: CalendarCheck, bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]' },
    viewed: { icon: Eye, bg: 'bg-[#FEF3C7]', color: 'text-[#D97706]' },
  }
  const cfg = map[type] || map.lead
  const Icon = cfg.icon
  return (
    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={15} className={cfg.color} />
    </div>
  )
}

/* ─── Conversion Metric Card ─── */
function ConversionCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
      <p className="text-xs text-[#64748B] mb-1.5">{label}</p>
      <p className="text-xl font-bold text-[#0F172A] mb-2">{value.toFixed(1)}%</p>
      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const timeRangeData: Record<TimeRange, typeof leadsOverTime> = {
    '7d': leadsOverTime7D,
    '30d': leadsOverTime,
    '90d': leadsOverTime90D,
  }

  const chartData = timeRangeData[timeRange]

  const formatXAxis = useCallback(
    (tick: string) => {
      const d = new Date(tick + 'T00:00:00')
      if (timeRange === '7d') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      if (timeRange === '90d') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    [timeRange]
  )

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* ── 1. Summary Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Widget Starts"
          value={formatNumber(analyticsSummary.totalWidgetStarts)}
          sub="+12%"
          icon={MousePointerClick}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#2563EB]"
        />
        <StatCard
          label="Leads Generated"
          value={formatNumber(analyticsSummary.totalLeadsGenerated)}
          sub="+8%"
          icon={Users}
          iconBg="bg-[#DBEAFE]"
          iconColor="text-[#3B82F6]"
        />
        <StatCard
          label="Map Drawings"
          value={formatNumber(analyticsSummary.totalMapDrawings)}
          sub="+15%"
          icon={Map}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#22C55E]"
        />
        <StatCard
          label="Estimates Viewed"
          value={formatNumber(analyticsSummary.totalEstimatesViewed)}
          sub="+5%"
          icon={FileText}
          iconBg="bg-[#DCFCE7]"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          label="Appointments Booked"
          value={formatNumber(analyticsSummary.totalAppointmentsBooked)}
          sub="+22%"
          icon={CalendarCheck}
          iconBg="bg-[#FEF3C7]"
          iconColor="text-[#D97706]"
        />
        <StatCard
          label="Conversion Rate"
          value={`${analyticsSummary.conversionRate}%`}
          sub="+1.2%"
          icon={Percent}
          iconBg="bg-[#FEE2E2]"
          iconColor="text-[#EF4444]"
        />
      </div>

      {/* ── 2. Widget Funnel Chart ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-[#0F172A]">Widget Funnel</h3>
            <p className="text-sm text-[#64748B] mt-0.5">Conversion flow from widget start to booking</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              Conversion
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              Drop-off
            </span>
          </div>
        </div>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
              barCategoryGap="12%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="step"
                width={110}
                tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<FunnelTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
                label={<FunnelBarLabel />}
                animationDuration={800}
              >
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 3. Two-column: Leads Over Time + Leads by Trade ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Over Time */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Leads Over Time</h3>
              <p className="text-sm text-[#64748B] mt-0.5">Daily lead generation trend</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F8FAFC] rounded-lg p-0.5 border border-[#E2E8F0]">
              {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ' +
                    (timeRange === range
                      ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                      : 'text-[#64748B] hover:text-[#0F172A]')
                  }
                >
                  {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = new Date(label + 'T00:00:00')
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3">
                        <p className="text-xs text-[#64748B] mb-0.5">
                          {d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-[#0F172A]">
                          {payload[0].value} leads
                        </p>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#leadsGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads by Trade */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#0F172A]">Leads by Trade</h3>
            <p className="text-sm text-[#64748B] mt-0.5">Lead distribution across service types</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByTrade} margin={{ top: 5, right: 5, left: -10, bottom: 5 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="trade"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC', radius: 8 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3 min-w-[140px]">
                        <p className="text-sm font-semibold text-[#0F172A]">{d.trade}</p>
                        <p className="text-lg font-bold mt-0.5" style={{ color: d.color }}>
                          {d.leads} leads
                        </p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="leads" radius={[8, 8, 0, 0]} animationDuration={800}>
                  {leadsByTrade.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Row: Language + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Language */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#0F172A]">Leads by Language</h3>
            <p className="text-sm text-[#64748B] mt-0.5">Language preference distribution</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByLanguage}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="leads"
                    animationDuration={800}
                    strokeWidth={0}
                  >
                    {leadsByLanguage.map((_entry, i) => (
                      <Cell key={i} fill={i === 0 ? '#2563EB' : '#22C55E'} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-3">
                          <p className="text-sm font-semibold text-[#0F172A]">{d.language}</p>
                          <p className="text-lg font-bold text-[#2563EB]">{d.leads} leads</p>
                          <p className="text-xs text-[#64748B]">{d.percentage}% of total</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text overlay */}
              <div className="relative -mt-[140px] flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#0F172A]">
                  {(leadsByLanguage[0].leads + leadsByLanguage[1].leads).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#64748B] uppercase tracking-wide">Total Leads</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-2">
            {leadsByLanguage.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: i === 0 ? '#2563EB' : '#22C55E' }}
                />
                <span className="text-sm text-[#334155] font-medium">{item.language}</span>
                <span className="text-sm text-[#64748B]">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#0F172A]">Recent Activity</h3>
              <p className="text-sm text-[#64748B] mt-0.5">Latest widget events</p>
            </div>
            <button className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-0.5">
              View All
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-0 max-h-[280px] overflow-y-auto pr-1">
            {recentActivity.map((evt, i) => (
              <div
                key={evt.id}
                className={
                  'flex items-start gap-3 py-3 ' +
                  (i < recentActivity.length - 1 ? 'border-b border-[#F1F5F9]' : '')
                }
              >
                <ActivityIcon type={evt.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#334155] leading-snug">{evt.message}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{evt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Conversion Metrics Summary ── */}
      <div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Funnel Conversion Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ConversionCard
            label="Widget Start to Lead"
            value={conversionMetrics.widgetStartToLead}
            color="#2563EB"
          />
          <ConversionCard
            label="Lead to Map Drawn"
            value={conversionMetrics.leadToMapDrawn}
            color="#3B82F6"
          />
          <ConversionCard
            label="Map to Result View"
            value={conversionMetrics.mapToResult}
            color="#22C55E"
          />
          <ConversionCard
            label="Result to Booked"
            value={conversionMetrics.resultToBooked}
            color="#F59E0B"
          />
        </div>
      </div>

      {/* ── Week-over-week highlight ── */}
      <div className="bg-gradient-to-r from-[#0B1D3A] to-[#1A3A6B] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <TrendingUp size={22} className="text-[#22C55E]" />
          </div>
          <div>
            <p className="text-white/70 text-sm">Week-over-Week Performance</p>
            <p className="text-xl font-bold mt-0.5">
              {analyticsSummary.leadsThisWeek} leads this week
              <span className="text-[#22C55E] text-sm font-medium ml-2">
                +{analyticsSummary.weekOverWeekChange}%
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-white/50 text-xs">This Week</p>
            <p className="font-bold text-lg">{analyticsSummary.leadsThisWeek}</p>
          </div>
          <ArrowRight size={16} className="text-white/30" />
          <div className="text-center">
            <p className="text-white/50 text-xs">Last Week</p>
            <p className="font-bold text-lg text-white/60">{analyticsSummary.leadsLastWeek}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
