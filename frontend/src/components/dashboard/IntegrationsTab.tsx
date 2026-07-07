import { useState } from 'react'
import {
  Zap,
  Workflow,
  Code2,
  CheckCircle2,
  XCircle,
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Play,
  Power,
  PowerOff,
} from 'lucide-react'
import { sampleLeadPayload, mockNotificationSettings } from '../../data/mockNotifications'

// ── Types ───────────────────────────────────────────
interface CRMConnection {
  id: string
  name: string
  description: string
  icon: React.ElementType
  connected: boolean
  color: string
}

const crmConnections: CRMConnection[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    description:
      'Connect to 5,000+ apps via Zapier. Push leads to your CRM, spreadsheet, or notification system.',
    icon: Zap,
    connected: true,
    color: '#FF4A00',
  },
  {
    id: 'n8n',
    name: 'n8n',
    description:
      'Self-hosted workflow automation. Perfect for contractors who want full control over their data.',
    icon: Workflow,
    connected: false,
    color: '#EA4B71',
  },
  {
    id: 'custom_webhook',
    name: 'Custom Webhook',
    description:
      'Send lead data to any endpoint. Perfect for custom CRMs or proprietary systems.',
    icon: Code2,
    connected: false,
    color: '#2563EB',
  },
]

// ── Component ───────────────────────────────────────
export default function IntegrationsTab() {
  const [webhookUrl, setWebhookUrl] = useState(mockNotificationSettings.webhook_url)
  const [webhookActive, setWebhookActive] = useState(true)
  const [sendOnEveryLead, setSendOnEveryLead] = useState(true)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [lastSent, setLastSent] = useState('Last sent: 2 hours ago')

  function handleCopyPayload() {
    navigator.clipboard?.writeText(JSON.stringify(sampleLeadPayload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleTestWebhook() {
    setShowTestModal(true)
    setLastSent('Last sent: Just now')
  }

  function openConnectModal(id: string) {
    setShowConnectModal(id)
  }

  return (
    <div className="max-w-[960px] space-y-8">
      {/* ── Webhook Configuration ── */}
      <Section
        title="Webhook Configuration"
        description="Send lead data to external systems in real-time."
      >
        <div className="space-y-5">
          {/* URL input */}
          <Field label="Webhook URL">
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/.../"
                className="flex-1 px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE] placeholder:text-[#94A3B8]"
              />
              <button
                onClick={handleTestWebhook}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors"
              >
                <Play size={14} />
                Test Webhook
              </button>
            </div>
          </Field>

          {/* Toggles row */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <ToggleOption
              label="Send on every lead"
              checked={sendOnEveryLead}
              onChange={() => setSendOnEveryLead(true)}
            />
            <ToggleOption
              label="Send only on booked appointments"
              checked={!sendOnEveryLead}
              onChange={() => setSendOnEveryLead(false)}
            />
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between bg-[#F8FAFC] rounded-[10px] p-4 border border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWebhookActive(!webhookActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  webhookActive
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : 'bg-[#F1F5F9] text-[#64748B]'
                }`}
              >
                {webhookActive ? (
                  <>
                    <Power size={12} />
                    Active
                  </>
                ) : (
                  <>
                    <PowerOff size={12} />
                    Inactive
                  </>
                )}
              </button>
              <span className="text-xs text-[#94A3B8]">{lastSent}</span>
            </div>
            {webhookActive ? (
              <span className="flex items-center gap-1 text-xs font-medium text-[#15803D]">
                <CheckCircle2 size={14} />
                Ready to receive
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-[#94A3B8]">
                <XCircle size={14} />
                Paused
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── CRM Platform Cards ── */}
      <Section
        title="CRM Connections"
        description="Connect your favorite tools to automatically sync leads."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crmConnections.map((crm) => (
            <CRMPlatformCard
              key={crm.id}
              crm={crm}
              onConnect={() => openConnectModal(crm.id)}
            />
          ))}
        </div>
      </Section>

      {/* ── Test Webhook Modal ── */}
      {showTestModal && (
        <Modal onClose={() => setShowTestModal(false)} title="Test Webhook Payload">
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">
              Here is a preview of the JSON payload that will be sent to your webhook URL:
            </p>
            <div className="relative">
              <pre className="bg-[#0F172A] text-[#E2E8F0] rounded-[10px] p-4 text-xs overflow-auto max-h-[400px] leading-relaxed">
                {JSON.stringify(sampleLeadPayload, null, 2)}
              </pre>
              <button
                onClick={handleCopyPayload}
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-[6px] transition-colors"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#94A3B8]">
                This payload is sent via HTTP POST with{' '}
                <code className="bg-[#F1F5F9] px-1 py-0.5 rounded text-[#334155]">
                  Content-Type: application/json
                </code>
              </span>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Connect Modal ── */}
      {showConnectModal && (
        <ConnectModal
          crmId={showConnectModal}
          onClose={() => setShowConnectModal(null)}
        />
      )}
    </div>
  )
}

// ── CRM Platform Card ───────────────────────────────
function CRMPlatformCard({
  crm,
  onConnect,
}: {
  crm: CRMConnection
  onConnect: () => void
}) {
  const Icon = crm.icon
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: `${crm.color}15` }}
        >
          <Icon size={20} style={{ color: crm.color }} />
        </div>
        <StatusBadge connected={crm.connected} />
      </div>
      <h4 className="text-sm font-semibold text-[#0F172A] mb-1">{crm.name}</h4>
      <p className="text-xs text-[#64748B] leading-relaxed mb-4 flex-1">
        {crm.description}
      </p>
      <button
        onClick={onConnect}
        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-[6px] text-xs font-semibold transition-colors ${
          crm.connected
            ? 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            : 'bg-[#2563EB] text-white hover:bg-[#1A3A6B]'
        }`}
      >
        {crm.connected ? (
          <>
            <RefreshCw size={12} />
            Reconfigure
          </>
        ) : (
          <>
            <ExternalLink size={12} />
            {crm.id === 'custom_webhook' ? 'Configure' : 'Connect'}
          </>
        )}
      </button>
    </div>
  )
}

// ── Status Badge ────────────────────────────────────
function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        connected
          ? 'bg-[#DCFCE7] text-[#15803D]'
          : 'bg-[#F1F5F9] text-[#64748B]'
      }`}
    >
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  )
}

// ── Toggle Option (radio-style) ─────────────────────
function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(true)}
      className="flex items-center gap-2 text-sm text-[#334155]"
    >
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          checked ? 'border-[#2563EB]' : 'border-[#CBD5E1]'
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
      </span>
      {label}
    </button>
  )
}

// ── Connect Modal ───────────────────────────────────
function ConnectModal({ crmId, onClose }: { crmId: string; onClose: () => void }) {
  const titles: Record<string, string> = {
    zapier: 'Connect Zapier',
    n8n: 'Connect n8n',
    custom_webhook: 'Configure Custom Webhook',
  }

  const instructions: Record<string, React.ReactNode> = {
    zapier: (
      <div className="space-y-3 text-sm text-[#334155]">
        <p>Follow these steps to connect via Zapier:</p>
        <ol className="list-decimal list-inside space-y-2 text-[#64748B]">
          <li>
            Copy your webhook URL from the{' '}
            <strong className="text-[#334155]">Webhook Configuration</strong>{' '}
            section above.
          </li>
          <li>
            In Zapier, create a new Zap with{' '}
            <strong className="text-[#334155]">Webhooks by Zapier</strong> as
            the trigger.
          </li>
          <li>
            Choose <strong className="text-[#334155]">Catch Hook</strong> and
            paste your webhook URL into Measured Quote.
          </li>
          <li>
            Add an action step to push leads to your CRM (HubSpot, Salesforce,
            Pipedrive, etc.).
          </li>
        </ol>
        <div className="bg-[#F8FAFC] rounded-[8px] p-3 border border-[#E2E8F0] text-xs text-[#94A3B8]">
          <Zap size={14} className="inline mr-1 text-[#FF4A00]" />
          Zapier supports 5,000+ apps including Salesforce, HubSpot, Google
          Sheets, Slack, and more.
        </div>
      </div>
    ),
    n8n: (
      <div className="space-y-3 text-sm text-[#334155]">
        <p>Follow these steps to connect via n8n:</p>
        <ol className="list-decimal list-inside space-y-2 text-[#64748B]">
          <li>
            Copy your webhook URL from the{' '}
            <strong className="text-[#334155]">Webhook Configuration</strong>{' '}
            section above.
          </li>
          <li>
            In your n8n editor, add a{' '}
            <strong className="text-[#334155]">Webhook node</strong> as the
            trigger.
          </li>
          <li>
            Set the HTTP method to{' '}
            <strong className="text-[#334155]">POST</strong> and paste the
            URL into Measured Quote.
          </li>
          <li>
            Add downstream nodes to process leads (HTTP Request, Set, Code,
            etc.).
          </li>
        </ol>
        <div className="bg-[#F8FAFC] rounded-[8px] p-3 border border-[#E2E8F0] text-xs text-[#94A3B8]">
          <Workflow size={14} className="inline mr-1 text-[#EA4B71]" />
          n8n is perfect for self-hosted automation with full data control.
        </div>
      </div>
    ),
    custom_webhook: (
      <div className="space-y-3 text-sm text-[#334155]">
        <p>Configure any endpoint to receive lead data:</p>
        <ol className="list-decimal list-inside space-y-2 text-[#64748B]">
          <li>
            Enter your endpoint URL in the{' '}
            <strong className="text-[#334155]">Webhook URL</strong> field
            above.
          </li>
          <li>
            Your endpoint must accept{' '}
            <strong className="text-[#334155]">POST</strong> requests with{' '}
            <code className="bg-[#F1F5F9] px-1 rounded text-[#334155]">
              application/json
            </code>{' '}
            body.
          </li>
          <li>
            Toggle the webhook to{' '}
            <strong className="text-[#334155]">Active</strong> to start
            receiving payloads.
          </li>
          <li>
            Click <strong className="text-[#334155]">Test Webhook</strong> to
            verify your endpoint receives the payload.
          </li>
        </ol>
        <div className="bg-[#F8FAFC] rounded-[8px] p-3 border border-[#E2E8F0] text-xs text-[#94A3B8]">
          <Code2 size={14} className="inline mr-1 text-[#2563EB]" />
          Use this for proprietary CRMs, internal dashboards, or custom
          notification systems.
        </div>
      </div>
    ),
  }

  return (
    <Modal onClose={onClose} title={titles[crmId] || 'Connect'}>
      <div className="space-y-4">
        {instructions[crmId]}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal wrapper ───────────────────────────────────
function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[640px] max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Section wrapper ─────────────────────────────────
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
      {description && (
        <p className="text-xs text-[#94A3B8] mb-4">{description}</p>
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


