import { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  Mail,
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  MapPin,
  Phone,
  Globe,
  CheckCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Percent,
  Package,
} from 'lucide-react'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { mockLeads, type Lead } from '../../data/mockLeads'
import { tradeNames } from '../../data/mockSettings'

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: 'bg-[#DBEAFE]', text: 'text-[#1A3A6B]', border: 'border-[#BFDBFE]', label: 'New' },
  contacted: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#FDE68A]', label: 'Contacted' },
  quoted: { bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]', label: 'Quoted' },
  booked: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]', label: 'Booked' },
  closed: { bg: 'bg-[#F1F5F9]', text: 'text-[#64748B]', border: 'border-[#E2E8F0]', label: 'Closed' },
}

const PAGE_SIZE = 10

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function relativeTime(dateStr: string): string {
  const now = new Date()
  const d = parseISO(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return format(d, 'MMM d')
}

export default function LeadsTab() {
  const [search, setSearch] = useState('')
  const [tradeFilter, setTradeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    let data = [...mockLeads]

    if (search) {
      const s = search.toLowerCase()
      data = data.filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          l.email.toLowerCase().includes(s) ||
          l.address.toLowerCase().includes(s)
      )
    }
    if (tradeFilter !== 'all') data = data.filter((l) => l.trade_type === tradeFilter)
    if (statusFilter !== 'all') data = data.filter((l) => l.status === statusFilter)
    if (langFilter !== 'all') data = data.filter((l) => l.language === langFilter)
    if (dateFilter !== 'all') {
      const now = new Date()
      const days =
        dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : dateFilter === '90days' ? 90 : 365
      const cutoff = subDays(now, days)
      data = data.filter((l) => isAfter(parseISO(l.created_at), cutoff))
    }

    data.sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField === 'trade_type') cmp = a.trade_type.localeCompare(b.trade_type)
      else if (sortField === 'low_price') cmp = a.low_price - b.low_price
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })

    return data
  }, [search, tradeFilter, statusFilter, dateFilter, langFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Stats
  const now = new Date()
  const weekAgo = subDays(now, 7)
  const totalLeads = filtered.length
  const newThisWeek = filtered.filter((l) => isAfter(parseISO(l.created_at), weekAgo)).length
  const bookedLeads = filtered.filter((l) => l.status === 'booked' || l.status === 'closed')
  const conversionRate = totalLeads > 0 ? Math.round((bookedLeads.length / totalLeads) * 100) : 0
  const avgProject = totalLeads > 0 ? Math.round(filtered.reduce((s, l) => s + (l.low_price + l.high_price) / 2, 0) / totalLeads) : 0

  // Chart data - leads per day for last 7 days
  const chartData = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i)
      const label = format(d, 'MMM d')
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = filtered.filter((l) => format(parseISO(l.created_at), 'yyyy-MM-dd') === dateStr).length
      days.push({ date: dateStr, label, count })
    }
    return days
  }, [filtered])

  function toggleSort(field: string) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function openDrawer(lead: Lead) {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={String(totalLeads)} trend="+12%" trendUp color="#2563EB" icon={Users} />
        <StatCard label="New This Week" value={String(newThisWeek)} trend="+3 vs last" trendUp color="#16A34A" icon={BarChart3} />
        <StatCard label="Avg. Project Value" value={formatCurrency(avgProject)} trend="+$1,200" trendUp color="#D97706" icon={DollarSign} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} trend="+4%" trendUp color="#16A34A" icon={Percent} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
        <h3 className="text-base font-semibold text-[#0F172A] mb-4">Leads Over Time</h3>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                formatter={(value: number) => [`${value} leads`, 'Count']}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search name, email, address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-4 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm w-[280px] focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] placeholder:text-[#94A3B8]"
          />
        </div>

        <select
          value={tradeFilter}
          onChange={(e) => { setTradeFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#3B82F6] text-[#334155]"
        >
          <option value="all">All Trades</option>
          <option value="concrete">Concrete</option>
          <option value="asphalt">Asphalt</option>
          <option value="landscape">Landscape</option>
          <option value="deck">Deck</option>
          <option value="roof">Roofing</option>
          <option value="fence">Fence</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#3B82F6] text-[#334155]"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="booked">Booked</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#3B82F6] text-[#334155]"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="90days">Last 90 Days</option>
        </select>

        <select
          value={langFilter}
          onChange={(e) => { setLangFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#3B82F6] text-[#334155]"
        >
          <option value="all">All Languages</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </select>

        <button className="ml-auto flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] rounded-[6px] transition-colors border border-[#E2E8F0]">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-[#CBD5E1]" />
                </th>
                <th
                  className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider cursor-pointer hover:text-[#334155]"
                  onClick={() => toggleSort('name')}
                >
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider">Project</th>
                <th className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider">Address</th>
                <th className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider">Measurement</th>
                <th
                  className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider cursor-pointer hover:text-[#334155]"
                  onClick={() => toggleSort('low_price')}
                >
                  <span className="flex items-center gap-1">Estimate <ArrowUpDown size={12} /></span>
                </th>
                <th
                  className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider cursor-pointer hover:text-[#334155]"
                  onClick={() => toggleSort('status')}
                >
                  <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
                </th>
                <th
                  className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider cursor-pointer hover:text-[#334155]"
                  onClick={() => toggleSort('created_at')}
                >
                  <span className="flex items-center gap-1">Date <ArrowUpDown size={12} /></span>
                </th>
                <th className="py-3 px-4 text-left font-medium text-[#64748B] text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((lead) => {
                const st = statusConfig[lead.status]
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() => openDrawer(lead)}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-[#CBD5E1]" />
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#0F172A] text-sm">{lead.name}</p>
                      <p className="text-xs text-[#94A3B8]">{lead.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text} border ${st.border}`}>
                        {tradeNames[lead.trade_type]}
                      </span>
                      <p className="text-xs text-[#64748B] mt-1">
                        {lead.measurement_value.toLocaleString()} {lead.measurement_unit}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-[#475569] text-xs max-w-[200px] truncate">{lead.address}</td>
                    <td className="py-3 px-4 text-[#334155] font-medium text-xs font-mono">
                      {lead.measurement_value.toLocaleString()} {lead.measurement_unit}
                    </td>
                    <td className="py-3 px-4 text-[#2563EB] font-medium text-xs font-mono">
                      {formatCurrency(lead.low_price)} – {formatCurrency(lead.high_price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text} border ${st.border}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-xs">{relativeTime(lead.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDrawer(lead) }}
                          className="p-1.5 rounded-md hover:bg-[#DBEAFE] text-[#475569] hover:text-[#2563EB] transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-1.5 rounded-md hover:bg-[#DBEAFE] text-[#475569] hover:text-[#2563EB] transition-colors"
                          title="Email"
                        >
                          <Mail size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#475569] hover:text-[#94A3B8] transition-colors"
                          title="Archive"
                        >
                          <Archive size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#64748B]">
            Showing {filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={
                  'w-8 h-8 rounded-md text-xs font-medium transition-colors ' +
                  (p === page ? 'bg-[#2563EB] text-white' : 'text-[#475569] hover:bg-[#F1F5F9]')
                }
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {drawerOpen && selectedLead && (
        <LeadDetailDrawer lead={selectedLead} onClose={() => setDrawerOpen(false)} />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  trend,
  trendUp,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  trend: string
  trendUp: boolean
  color: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: color + '15' }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${trendUp ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </span>
      </div>
      <p className="text-[28px] font-bold font-mono leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[#64748B] mt-1.5">{label}</p>
    </div>
  )
}

function LeadDetailDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const st = statusConfig[lead.status]
  const avgPrice = (lead.low_price + lead.high_price) / 2
  const [notes, setNotes] = useState('')

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-50 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">{lead.name}</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Lead #{lead.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <X size={20} className="text-[#475569]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${st.bg} ${st.text} border ${st.border}`}>
              {st.label}
            </span>
            <span className="text-xs text-[#94A3B8] flex items-center gap-1">
              <Globe size={12} />
              {lead.language === 'en' ? 'English' : 'Spanish'}
            </span>
          </div>

          {/* Contact Info */}
          <Section title="Contact Info">
            <div className="space-y-3">
              <InfoRow label="Email" value={lead.email} copyable />
              <InfoRow label="Phone" value={lead.phone} copyable />
            </div>
          </Section>

          {/* Project Details */}
          <Section title="Project Details">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B] w-24">Trade</span>
                <span className="text-sm font-medium text-[#0F172A]">{tradeNames[lead.trade_type]}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#94A3B8] mt-0.5" />
                <span className="text-sm text-[#475569]">{lead.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B] w-24">Area</span>
                <span className="text-lg font-semibold font-mono text-[#0F172A]">
                  {lead.measurement_value.toLocaleString()} {lead.measurement_unit === 'sqft' ? 'sq ft' : 'linear ft'}
                </span>
              </div>
            </div>
          </Section>

          {/* Estimate Summary */}
          <Section title="Estimate Summary">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-1.5">Selected Materials</p>
                {lead.selected_materials.map((mat) => (
                  <div key={mat} className="flex items-center gap-2 text-sm text-[#334155] py-1">
                    <CheckCircle size={14} className="text-[#22C55E]" />
                    {mat}
                  </div>
                ))}
              </div>
              {lead.selected_addons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#64748B] mb-1.5">Add-ons</p>
                  {lead.selected_addons.map((add) => (
                    <div key={add} className="flex items-center gap-2 text-sm text-[#334155] py-1">
                      <Package size={14} className="text-[#3B82F6]" />
                      {add}
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-[#F8FAFC] rounded-[10px] p-4 mt-3">
                <p className="text-xs text-[#64748B] mb-1">Subtotal</p>
                <p className="text-base font-mono font-semibold text-[#0F172A]">{formatCurrency(avgPrice)}</p>
                <div className="border-t border-[#E2E8F0] my-2" />
                <p className="text-xs text-[#64748B] mb-1.5">Estimate Range</p>
                <p className="text-[24px] font-bold font-mono text-[#2563EB] leading-tight">
                  {formatCurrency(lead.low_price)} – {formatCurrency(lead.high_price)}
                </p>
              </div>
            </div>
          </Section>

          {/* Status Timeline */}
          <Section title="Status Timeline">
            <div className="flex items-center gap-0">
              {(['new', 'contacted', 'quoted', 'booked', 'closed'] as const).map((s, i) => {
                const isActive = ['new', 'contacted', 'quoted', 'booked', 'closed'].indexOf(lead.status) >= i
                return (
                  <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive ? 'bg-[#2563EB] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium capitalize ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}>
                        {s}
                      </span>
                    </div>
                    {i < 4 && (
                      <div className={`w-6 h-[2px] mx-0.5 ${isActive ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Notes */}
          <Section title="Internal Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] placeholder:text-[#94A3B8] resize-none h-24"
            />
            <button className="mt-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors">
              Save Note
            </button>
          </Section>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors">
              <Phone size={15} />
              Mark as Contacted
            </button>
            <button
              onClick={() => window.open(`mailto:${lead.email}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-[1.5px] border-[#2563EB] text-[#2563EB] text-sm font-medium rounded-[6px] hover:bg-[#EFF6FF] transition-colors"
            >
              <Mail size={15} />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[#0F172A] mb-3">{title}</h4>
      {children}
    </div>
  )
}

function InfoRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[#64748B] w-16">{label}</span>
      <span className="text-sm text-[#334155] flex-1">{value}</span>
      {copyable && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#2563EB] transition-colors"
          title="Copy"
        >
          {copied ? <CheckCircle size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  )
}
