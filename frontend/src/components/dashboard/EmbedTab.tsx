import { useState } from 'react'
import { Copy, CheckCircle, ChevronDown, KeyRound, ExternalLink, AlertTriangle } from 'lucide-react'
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase'
import { useSession } from '../../lib/tenant'

// Values must match tradeConfigs ids (the iframe looks them up by id).
const TRADES: { id: string; label: string }[] = [
  { id: 'concrete', label: 'Concrete Driveway' },
  { id: 'asphalt', label: 'Asphalt Paving' },
  { id: 'landscape', label: 'Landscape & Hardscape' },
  { id: 'decks', label: 'Decks' },
  { id: 'roofing', label: 'Roofing' },
  { id: 'fencing', label: 'Fencing' },
  { id: 'temp-fence', label: 'Temp Fence Rental' },
]

const platformInstructions: { id: string; label: string; content: string }[] = [
  {
    id: 'wordpress',
    label: 'WordPress',
    content: 'Install a "Custom HTML" block in the Gutenberg editor (or use a plugin like "Insert Headers and Footers"). Paste the embed code into the HTML block on any page or post where you want the widget to appear.',
  },
  {
    id: 'webflow',
    label: 'Webflow',
    content: 'Add an "Embed" element from the Elements panel. Paste the embed code inside. Publish your site to see the widget live. Make sure custom code is allowed on your Webflow plan.',
  },
  {
    id: 'wix',
    label: 'Wix',
    content: 'From the Wix Editor, click the "+" button, choose "Embed" > "Embed a Widget". Click "Enter Code" and switch to "Code" mode. Paste the embed code and click "Apply".',
  },
  {
    id: 'squarespace',
    label: 'Squarespace',
    content: 'Add a "Code Block" (not the Embed block) to your page. Paste the embed code directly. Squarespace sometimes strips scripts in preview — publish the page to see the widget.',
  },
  {
    id: 'custom',
    label: 'Custom HTML',
    content: 'Paste the embed code just before the closing </body> tag of your HTML file. The script loads asynchronously and will not slow down your page.',
  },
]

async function mintWidgetToken(): Promise<{ token: string; tenantId: string } | { error: string }> {
  if (!isSupabaseConfigured()) return { error: 'Sign in to generate your embed code.' }
  const client = await getSupabase()
  const { data } = (await client?.auth.getSession()) ?? { data: { session: null } }
  const jwt = data.session?.access_token
  if (!jwt) return { error: 'Session expired. Sign in again.' }
  const res = await fetch('/api/widget/token', { method: 'POST', headers: { Authorization: `Bearer ${jwt}` } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { error: (body as { message?: string }).message ?? `Could not create token (${res.status})` }
  }
  const body = (await res.json()) as { token: string; tenant_id: string }
  return { token: body.token, tenantId: body.tenant_id }
}

export default function EmbedTab() {
  const session = useSession()
  const isLive = session.mode === 'ready'
  const [trade, setTrade] = useState('fencing')
  const [creds, setCreds] = useState<{ token: string; tenantId: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('wordpress')

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://measuredquote.netlify.app'
  const tenantId = creds?.tenantId ?? 'YOUR_TENANT_ID'
  const token = creds?.token ?? 'GENERATE_TOKEN_FIRST'

  const embedCode = `<div id="mq-estimator"></div>
<script
  src="${origin}/widget/v1/widget.js"
  data-mq-tenant="${tenantId}"
  data-mq-trade="${trade}"
  data-mq-token="${token}"
  data-mq-mount="#mq-estimator"
  async
></script>`

  const directLink = `${origin}/#/embed?tenant=${encodeURIComponent(tenantId)}&trade=${trade}&t=${encodeURIComponent(token)}`
  const previewLink = `${origin}/#/embed?trade=${trade}`

  async function generate() {
    setBusy(true)
    setError(null)
    const r = await mintWidgetToken()
    setBusy(false)
    if ('error' in r) setError(r.error)
    else setCreds(r)
  }

  async function copy(kind: 'code' | 'link') {
    await navigator.clipboard.writeText(kind === 'code' ? embedCode : directLink)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: setup */}
      <div className="space-y-6">
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">1. Pick the estimator</h3>
          <p className="text-xs text-[#64748B] mb-4">One snippet per trade. Put each on the matching service page.</p>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
          >
            {TRADES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">2. Generate your code</h3>
          <p className="text-xs text-[#64748B] mb-4">
            The code includes a signed token so leads from your site land in your inbox. Generating a new one does not break old snippets.
          </p>
          {isLive ? (
            <button
              onClick={generate}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors disabled:opacity-50"
            >
              <KeyRound size={15} />
              {busy ? 'Generating…' : creds ? 'Generate again' : 'Generate my embed code'}
            </button>
          ) : (
            <p className="text-sm text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              You're viewing the demo dashboard. Sign in and finish onboarding to get a working embed code.
            </p>
          )}
          {error && <p className="text-xs text-[#DC2626] mt-3">{error}</p>}
          {creds && <p className="text-xs text-[#15803D] mt-3">Ready. Copy the code on the right.</p>}
        </div>

        {/* Platform Instructions Accordion */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4">3. Paste it on your site</h3>
          <div className="space-y-2">
            {platformInstructions.map((platform) => (
              <div key={platform.id} className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
                <button
                  onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="text-sm font-medium text-[#334155]">{platform.label}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#94A3B8] transition-transform ${expandedPlatform === platform.id ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedPlatform === platform.id && (
                  <div className="px-4 pb-3 border-t border-[#F1F5F9]">
                    <p className="text-sm text-[#475569] pt-3 leading-relaxed">{platform.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: code + preview */}
      <div className="space-y-6">
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[#0F172A]">Embed code</h3>
            <button
              onClick={() => copy('code')}
              disabled={!creds}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[6px] transition-colors disabled:opacity-40 ${copied === 'code' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#2563EB] text-white hover:bg-[#1A3A6B]'}`}
            >
              {copied === 'code' ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied === 'code' ? 'Copied!' : 'Copy code'}
            </button>
          </div>
          <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs leading-relaxed rounded-[10px] p-4 overflow-x-auto whitespace-pre-wrap break-all">
            {embedCode}
          </pre>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[#0F172A]">Hosted link</h3>
            <button
              onClick={() => copy('link')}
              disabled={!creds}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[6px] border-[1.5px] transition-colors disabled:opacity-40 ${copied === 'link' ? 'border-[#16A34A] text-[#15803D]' : 'border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]'}`}
            >
              {copied === 'link' ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied === 'link' ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <p className="text-xs text-[#64748B] mb-2">No website? Use this link on Google Business Profile, Facebook, Nextdoor or in a text.</p>
          <p className="text-xs font-mono text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] px-3 py-2 break-all">{directLink}</p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[#0F172A]">Live preview</h3>
            <a href={previewLink} target="_blank" rel="noreferrer" className="text-xs text-[#2563EB] flex items-center gap-1 hover:underline">
              Open <ExternalLink size={12} />
            </a>
          </div>
          <iframe
            key={trade}
            src={previewLink}
            title="Estimator preview"
            className="w-full h-[640px] rounded-[12px] border border-[#E2E8F0]"
          />
          <p className="text-[11px] text-[#94A3B8] mt-2">Preview only. Leads submitted here are not saved.</p>
        </div>
      </div>
    </div>
  )
}
