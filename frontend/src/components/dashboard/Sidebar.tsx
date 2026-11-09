import { Inbox, DollarSign, Settings, Code, BarChart3, LogOut, Menu, X, Zap, Bell } from 'lucide-react'
import { useState } from 'react'
import { useSession } from '../../lib/tenant'
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'

export type TabId = 'leads' | 'pricing' | 'settings' | 'embed' | 'analytics' | 'integrations' | 'notifications'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const navItems: { id: TabId; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'leads', label: 'Leads Inbox', icon: Inbox },
  { id: 'pricing', label: 'Pricing Editor', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Tenant Settings', icon: Settings },
  { id: 'integrations', label: 'Integrations', icon: Zap },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'embed', label: 'Embed Code', icon: Code },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const session = useSession()
  const tenant = 'tenant' in session ? session.tenant : null
  const tenantName = tenant?.name ?? 'Your company'
  const tenantEmail =
    session.mode === 'ready' ? session.userEmail : tenant?.contact_email ?? ''
  const initials =
    tenantName
      .replace(/\(.*?\)/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'MQ'

  async function signOut() {
    if (isSupabaseConfigured()) {
      const client = await getSupabase()
      await client?.auth.signOut()
    }
    window.location.hash = '#/login'
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="py-5 px-6 flex-shrink-0">
        <div className="flex items-center text-xl font-bold tracking-tight">
          <img src="/logo.svg" alt="" className="h-6 w-6 mr-2 inline-block brightness-0 invert" />
          <span className="text-white font-medium">Measured </span>
          <span className="text-white font-bold">Quote</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setMobileOpen(false)
              }}
              className={
                'flex items-center gap-3 py-2.5 px-4 rounded-[10px] text-sm font-medium transition-all duration-200 text-left relative ' +
                (isActive
                  ? 'bg-[#1A3A6B] text-white border-l-[3px] border-[#22C55E]'
                  : 'text-white/70 hover:bg-white/10 border-l-[3px] border-transparent')
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}


      </nav>

      {/* User info */}
      <div className="px-4 py-4 mt-auto flex-shrink-0 border-t border-[#142C4D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{tenantName}</p>
            <p className="text-white/50 text-xs truncate">{tenantEmail}</p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="text-white/40 hover:text-white/70 transition-colors p-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0B1D3A] text-white shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={
          'lg:hidden fixed top-0 left-0 h-full w-[260px] bg-[#0B1D3A] z-40 flex flex-col transition-transform duration-300 ease-out ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] bg-[#0B1D3A] z-40 flex-col">
        {sidebarContent}
      </aside>
    </>
  )
}
