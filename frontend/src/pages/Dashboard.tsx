import { useState } from 'react'
import Sidebar, { type TabId } from '../components/dashboard/Sidebar'
import LeadsTab from '../components/dashboard/LeadsTab'
import PricingTab from '../components/dashboard/PricingTab'
import SettingsTab from '../components/dashboard/SettingsTab'
import EmbedTab from '../components/dashboard/EmbedTab'
import AnalyticsTab from '../components/dashboard/AnalyticsTab'
import IntegrationsTab from '../components/dashboard/IntegrationsTab'
import NotificationsTab from '../components/dashboard/NotificationsTab'

const tabTitles: Record<TabId, string> = {
  leads: 'Leads Inbox',
  pricing: 'Pricing Editor',
  analytics: 'Analytics',
  settings: 'Tenant Settings',
  embed: 'Embed Code',
  integrations: 'Integrations',
  notifications: 'Notifications',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('leads')

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-[100dvh]">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-[8px] border-b border-[#E2E8F0] px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-1">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-[#334155] font-medium">{tabTitles[activeTab]}</span>
              </nav>
              <h1 className="text-xl lg:text-2xl font-bold text-[#0F172A]">{tabTitles[activeTab]}</h1>
            </div>
            {activeTab === 'leads' && (
              <div className="flex items-center gap-2">
                <span className="bg-[#DCFCE7] text-[#15803D] text-xs font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                  Live
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 lg:px-8 py-6">
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'pricing' && <PricingTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'embed' && <EmbedTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </main>
    </div>
  )
}
