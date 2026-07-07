import { useState } from 'react'
import { Save, CheckCircle, Upload } from 'lucide-react'
import { mockSettings } from '../../data/mockSettings'

const colorSwatches = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Teal', value: '#0D9488' },
]

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export default function SettingsTab() {
  const [settings, setSettings] = useState(() => ({ ...mockSettings }))
  const [savedToast, setSavedToast] = useState(false)

  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  return (
    <div className="max-w-[640px] mx-auto space-y-8">
      {/* Company Profile */}
      <Section title="Company Profile" description="Your branding appears on the widget and emails.">
        <div className="space-y-4">
          <Field label="Company Name">
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => update('company_name', e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
            />
          </Field>

          <Field label="Logo">
            <div className="border-2 border-dashed border-[#CBD5E1] rounded-[16px] h-[120px] flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-12 object-contain" />
              ) : (
                <>
                  <Upload size={20} className="text-[#94A3B8]" />
                  <span className="text-xs text-[#64748B]">Upload your logo (PNG, JPG, max 2MB)</span>
                </>
              )}
            </div>
            <input
              type="text"
              value={settings.logo_url}
              onChange={(e) => update('logo_url', e.target.value)}
              placeholder="Or enter logo URL"
              className="w-full mt-2 px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] placeholder:text-[#94A3B8]"
            />
          </Field>

          <Field label="Primary Color">
            <div className="flex flex-wrap gap-3">
              {colorSwatches.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update('primary_color', c.value)}
                  className={`group flex flex-col items-center gap-1.5 transition-transform ${settings.primary_color === c.value ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-[3px] transition-colors ${settings.primary_color === c.value ? 'border-[#0F172A]' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }}
                  />
                  <span className={`text-[10px] font-medium ${settings.primary_color === c.value ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Business Phone">
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
            />
          </Field>
        </div>
      </Section>

      {/* Notification Settings */}
      <Section title="Notification Settings" description="Configure how you receive lead alerts.">
        <div className="space-y-4">
          <Field label="Notification Email">
            <input
              type="email"
              value={settings.notification_email}
              onChange={(e) => update('notification_email', e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
            />
          </Field>

          <Field label="Webhook URL">
            <input
              type="url"
              value={settings.webhook_url}
              onChange={(e) => update('webhook_url', e.target.value)}
              placeholder="https://your-app.com/webhook"
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] placeholder:text-[#94A3B8]"
            />
          </Field>

          <div className="space-y-3 pt-2">
            <Toggle
              label="Email Alerts"
              description="Receive an email for each new lead"
              checked={settings.email_alerts}
              onChange={(v) => update('email_alerts', v)}
            />
            <Toggle
              label="Daily Digest"
              description="Send me a daily summary of all leads"
              checked={settings.daily_digest}
              onChange={(v) => update('daily_digest', v)}
            />
            <Toggle
              label="SMS Notifications"
              description="Get text alerts for new leads"
              checked={settings.sms_notifications}
              onChange={(v) => update('sms_notifications', v)}
            />
            <Toggle
              label="Webhook Pushes"
              description="Send lead data to your webhook URL"
              checked={settings.webhook_pushes}
              onChange={(v) => update('webhook_pushes', v)}
            />
          </div>

          {settings.sms_notifications && (
            <Field label="SMS Phone Number">
              <input
                type="tel"
                value={settings.sms_phone}
                onChange={(e) => update('sms_phone', e.target.value)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
              />
            </Field>
          )}
        </div>
      </Section>

      {/* Widget Defaults */}
      <Section title="Widget Defaults" description="Default settings for your embedded widget.">
        <div className="space-y-4">
          <Field label="Widget Title">
            <input
              type="text"
              value={settings.widget_title}
              onChange={(e) => update('widget_title', e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
            />
          </Field>

          <Field label="Intro Message">
            <textarea
              value={settings.widget_intro}
              onChange={(e) => update('widget_intro', e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] resize-none"
            />
            <p className="text-xs text-[#94A3B8] mt-1">{settings.widget_intro.length}/200 characters</p>
          </Field>

          <Field label="Default Language">
            <select
              value={settings.default_language}
              onChange={(e) => update('default_language', e.target.value as 'en' | 'es')}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </Field>

          <Field label="Timezone">
            <select
              value={settings.timezone}
              onChange={(e) => update('timezone', e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>

          <div className="space-y-3 pt-2">
            <Toggle
              label="Require Phone Number"
              description="Make phone number mandatory in the widget"
              checked={settings.require_phone}
              onChange={(v) => update('require_phone', v)}
            />
            <Toggle
              label="Show Estimate Range"
              description="Display price range on results page"
              checked={settings.show_estimate_range}
              onChange={(v) => update('show_estimate_range', v)}
            />
          </div>
        </div>
      </Section>

      {/* Plan & Billing */}
      <Section title="Plan & Billing" description="Your current subscription details.">
        <div className="bg-[#EFF6FF] rounded-[10px] p-4 border border-[#BFDBFE]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#0F172A]">Current Plan</span>
            <span className="bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full">Contractor Pro</span>
          </div>
          <p className="text-xs text-[#64748B] mb-3">Unlimited leads, all trades, priority support</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
              <div className="bg-[#2563EB] h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <span className="text-xs font-medium text-[#334155]">34 of 50 leads</span>
          </div>
        </div>
      </Section>

      {/* Save Button */}
      <div className="sticky bottom-4 bg-white rounded-[12px] border border-[#E2E8F0] shadow-lg p-4 flex items-center justify-between">
        {savedToast ? (
          <span className="text-sm font-medium text-[#16A34A] flex items-center gap-1.5">
            <CheckCircle size={16} />
            Settings saved successfully
          </span>
        ) : (
          <span className="text-xs text-[#94A3B8]">Changes are saved locally</span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Save size={16} />
          Save Settings
        </button>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#94A3B8] mb-4">{description}</p>}
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#334155] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

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
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'}`}
      >
        <div
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}
