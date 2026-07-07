import { useState } from 'react'
import {
  Save,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Globe,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import {
  mockNotificationSettings,
  mockWebhookDeliveries,
  mockEmailTemplates,
  mockSMSTemplate,
} from '../../data/mockNotifications'
import { mockSettings } from '../../data/mockSettings'

export default function NotificationsTab() {
  const [settings, setSettings] = useState(() => ({ ...mockNotificationSettings }))
  const [savedToast, setSavedToast] = useState(false)
  const [testToast, setTestToast] = useState<string | null>(null)

  // Email preview states
  const [showContractorPreview, setShowContractorPreview] = useState(false)
  const [showHomeownerPreview, setShowHomeownerPreview] = useState(false)

  // SMS preview state
  const [showSMSPreview, setShowSMSPreview] = useState(false)
  const [smsPhone, setSmsPhone] = useState(mockSettings.sms_phone)

  // Deliveries state
  const [deliveries, setDeliveries] = useState(() => [...mockWebhookDeliveries])

  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  function showTestMessage(msg: string) {
    setTestToast(msg)
    setTimeout(() => setTestToast(null), 3000)
  }

  function handleRetryDelivery(id: string) {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: '200 OK' as const, status_code: 200 } : d
      )
    )
  }

  const contractorTemplate = mockEmailTemplates.find(
    (t) => t.id === 'tpl_contractor_alert'
  )!
  const homeownerTemplate = mockEmailTemplates.find(
    (t) => t.id === 'tpl_homeowner_confirmation'
  )!

  return (
    <div className="max-w-[800px] space-y-8">
      {/* ── Email Notifications ── */}
      <Section
        title="Email Notifications"
        description="Configure email alerts and confirmations."
        icon={<Mail size={18} className="text-[#2563EB]" />}
      >
        <div className="space-y-4">
          <Toggle
            label="Send lead alert email to contractor"
            description="Receive an email for each new lead with full details and estimate"
            checked={settings.email_alerts}
            onChange={(v) => update('email_alerts', v)}
          />
          <div className="border-t border-[#F1F5F9]" />
          <Toggle
            label="Send estimate confirmation to homeowner"
            description="Automatically send a thank-you email with the estimate range"
            checked={settings.email_confirmation_homeowner}
            onChange={(v) => update('email_confirmation_homeowner', v)}
          />
          <div className="border-t border-[#F1F5F9]" />
          <Toggle
            label="Send daily lead digest"
            description="Get a daily summary of all leads received"
            checked={settings.daily_digest}
            onChange={(v) => update('daily_digest', v)}
          />

          {/* ── Email Template Previews ── */}
          <div className="pt-4 space-y-3">
            {/* Contractor Alert Preview */}
            <CollapsiblePreview
              title="Preview: Contractor Lead Alert"
              open={showContractorPreview}
              onToggle={() => setShowContractorPreview(!showContractorPreview)}
            >
              <iframe
                title="Contractor Email Preview"
                srcDoc={contractorTemplate.body_html}
                className="w-full h-[360px] border-0 rounded-[8px]"
              />
            </CollapsiblePreview>

            {/* Homeowner Confirmation Preview */}
            <CollapsiblePreview
              title="Preview: Homeowner Confirmation"
              open={showHomeownerPreview}
              onToggle={() => setShowHomeownerPreview(!showHomeownerPreview)}
            >
              <iframe
                title="Homeowner Email Preview"
                srcDoc={homeownerTemplate.body_html}
                className="w-full h-[380px] border-0 rounded-[8px]"
              />
            </CollapsiblePreview>
          </div>

          <button
            onClick={() =>
              showTestMessage(
                `Test email sent to ${mockSettings.notification_email}`
              )
            }
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F1F5F9] text-[#334155] text-sm font-medium rounded-[6px] hover:bg-[#E2E8F0] transition-colors mt-2"
          >
            <Send size={14} />
            Send Test Email
          </button>
        </div>
      </Section>

      {/* ── SMS Notifications ── */}
      <Section
        title="SMS Notifications"
        description="Get text message alerts for new leads."
        icon={<MessageSquare size={18} className="text-[#16A34A]" />}
      >
        <div className="space-y-4">
          <Toggle
            label="Send SMS lead alert to contractor"
            description="Receive a text message for each new lead"
            checked={settings.sms_alerts}
            onChange={(v) => update('sms_alerts', v)}
          />

          {settings.sms_alerts && (
            <div className="pl-0 space-y-3">
              <Field label="SMS Phone Number">
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                />
              </Field>

              {/* SMS Template Preview */}
              <CollapsiblePreview
                title="Preview: SMS Lead Alert"
                open={showSMSPreview}
                onToggle={() => setShowSMSPreview(!showSMSPreview)}
              >
                <div className="bg-[#DCFCE7] rounded-[12px] rounded-tl-[4px] p-3 max-w-[320px]">
                  <p className="text-sm text-[#0F172A] leading-relaxed">
                    New lead: John Smith | Concrete | $14,200-$17,800 | 123
                    Main St, Los Angeles, CA 90210
                  </p>
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">
                  Template: {mockSMSTemplate.body}
                </p>
              </CollapsiblePreview>
            </div>
          )}

          <button
            onClick={() =>
              showTestMessage(
                `Test SMS sent to ${smsPhone || mockSettings.sms_phone}`
              )
            }
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F1F5F9] text-[#334155] text-sm font-medium rounded-[6px] hover:bg-[#E2E8F0] transition-colors"
          >
            <Send size={14} />
            Send Test SMS
          </button>
        </div>
      </Section>

      {/* ── Webhook Notifications ── */}
      <Section
        title="Webhook Deliveries"
        description="Track recent webhook payloads and retry failures."
        icon={<Globe size={18} className="text-[#9333EA]" />}
      >
        <div className="space-y-4">
          <Toggle
            label="Push leads via webhook"
            description="Send lead data to the configured webhook URL"
            checked={settings.webhook_pushes}
            onChange={(v) => update('webhook_pushes', v)}
          />

          {settings.webhook_url && (
            <div className="bg-[#F8FAFC] rounded-[8px] p-3 border border-[#E2E8F0] flex items-center gap-2">
              <Globe size={14} className="text-[#94A3B8]" />
              <span className="text-xs text-[#94A3B8] mr-1">Webhook URL:</span>
              <span className="text-xs text-[#334155] font-medium truncate">
                {settings.webhook_url}
              </span>
            </div>
          )}

          {/* Recent Deliveries Table */}
          <div className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
            <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#334155]">
                Recent Deliveries
              </h4>
              <span className="text-[10px] text-[#94A3B8]">
                Last 24 hours
              </span>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {deliveries.map((d) => (
                <DeliveryRow
                  key={d.id}
                  delivery={d}
                  onRetry={() => handleRetryDelivery(d.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Save Bar ── */}
      <div className="sticky bottom-4 bg-white rounded-[12px] border border-[#E2E8F0] shadow-lg p-4 flex items-center justify-between">
        {savedToast ? (
          <span className="text-sm font-medium text-[#16A34A] flex items-center gap-1.5">
            <CheckCircle size={16} />
            Notification settings saved successfully
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8]">
            Changes are saved locally
          </span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Save size={16} />
          Save Notification Settings
        </button>
      </div>

      {/* ── Test Toast ── */}
      {testToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-sm px-4 py-3 rounded-[10px] shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} className="text-[#22C55E]" />
          {testToast}
        </div>
      )}
    </div>
  )
}

// ── Delivery Row ────────────────────────────────────
function DeliveryRow({
  delivery,
  onRetry,
}: {
  delivery: import('../../data/mockNotifications').WebhookDelivery
  onRetry: () => void
}) {
  const isSuccess = delivery.status === '200 OK'
  const time = new Date(delivery.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0F172A] truncate">
            {delivery.lead_name}
          </span>
          <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">
            {delivery.trade}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#94A3B8] mt-0.5">
          <Clock size={10} />
          {time}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-medium ${
            isSuccess ? 'text-[#15803D]' : 'text-[#DC2626]'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={14} />
          ) : (
            <XCircle size={14} />
          )}
          {delivery.status}
        </span>
        {!isSuccess && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-[6px] hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#2563EB] transition-colors"
            title="Retry"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Collapsible Preview ─────────────────────────────
function CollapsiblePreview({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-left"
      >
        <span className="text-xs font-semibold text-[#334155]">{title}</span>
        {open ? (
          <ChevronUp size={14} className="text-[#94A3B8]" />
        ) : (
          <ChevronDown size={14} className="text-[#94A3B8]" />
        )}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  )
}

// ── Section wrapper (with icon) ─────────────────────
function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-[#94A3B8] mb-4 ml-0">{description}</p>
      )}
      {children}
    </div>
  )
}

// ── Field wrapper ───────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Toggle component ────────────────────────────────
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-[#334155]">{label}</p>
        <p className="text-xs text-[#94A3B8]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
        }`}
      >
        <div
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
