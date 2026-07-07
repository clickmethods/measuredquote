import { useState } from 'react'
import { Copy, CheckCircle, ChevronDown } from 'lucide-react'
import { mockSettings } from '../../data/mockSettings'

const tradeLabels: Record<string, string> = {
  concrete: 'Concrete',
  asphalt: 'Asphalt',
  landscape: 'Landscape',
  deck: 'Deck',
  roof: 'Roofing',
  fence: 'Fence',
}

const tradeKeys = ['concrete', 'asphalt', 'landscape', 'deck', 'roof', 'fence'] as const

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
    content: 'Add a "Code Block" (not the Embed block) to your page. Paste the script tag directly. Squarespace sometimes strips scripts in preview — publish the page to see the widget.',
  },
  {
    id: 'custom',
    label: 'Custom HTML',
    content: 'Paste the embed code just before the closing </body> tag of your HTML file. The script loads asynchronously and will not slow down your page.',
  },
]

export default function EmbedTab() {
  const [selectedTrades, setSelectedTrades] = useState<string[]>([...tradeKeys])
  const [defaultTrade, setDefaultTrade] = useState('concrete')
  const [language, setLanguage] = useState('en')
  const [showBranding, setShowBranding] = useState(true)
  const [mode, setMode] = useState<'full' | 'simple'>('full')
  const [copied, setCopied] = useState(false)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('wordpress')

  function toggleTrade(trade: string) {
    setSelectedTrades((prev) => {
      const next = prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
      // Ensure at least one trade is selected
      if (next.length === 0) return prev
      return next
    })
  }

  const embedCode = `<script
  src="https://draw-to-quote.com/widget.js"
  data-tenant="YOUR_TENANT_ID"
  data-trades="${selectedTrades.join(',')}"
  data-lang="${language}"
  data-mode="${mode}"
  data-branding="${showBranding ? 'true' : 'false'}"
  data-color="${mockSettings.primary_color}"
></script>`

  const directLink = `https://draw-to-quote.com/go/YOUR_TENANT_ID?trades=${selectedTrades.join(',')}&lang=${language}`

  async function handleCopy() {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(directLink)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column — Configuration */}
      <div className="space-y-6">
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Widget Configuration</h3>

          {/* Trade selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#334155] mb-2">Which trades to include?</label>
            <div className="space-y-2">
              {tradeKeys.map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-3 py-2 px-3 rounded-[8px] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTrades.includes(key)}
                    onChange={() => toggleTrade(key)}
                    className="w-4 h-4 rounded border-[#CBD5E1] accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#334155]">{tradeLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Default trade */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Default Trade</label>
            <select
              value={defaultTrade}
              onChange={(e) => setDefaultTrade(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
            >
              {selectedTrades.map((t) => (
                <option key={t} value={t}>
                  {tradeLabels[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#334155] mb-1.5">Default Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="user">Let user choose</option>
            </select>
          </div>

          {/* Widget mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#334155] mb-2">Widget Mode</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 py-2 px-3 rounded-[8px] hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="widget-mode"
                  checked={mode === 'full'}
                  onChange={() => setMode('full')}
                  className="accent-[#2563EB]"
                />
                <div>
                  <p className="text-sm font-medium text-[#334155]">Full Flow</p>
                  <p className="text-xs text-[#94A3B8]">Complete 4-step estimator with map</p>
                </div>
              </label>
              <label className="flex items-center gap-3 py-2 px-3 rounded-[8px] hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="widget-mode"
                  checked={mode === 'simple'}
                  onChange={() => setMode('simple')}
                  className="accent-[#2563EB]"
                />
                <div>
                  <p className="text-sm font-medium text-[#334155]">Simple Form</p>
                  <p className="text-xs text-[#94A3B8]">Just lead capture, no map or estimate</p>
                </div>
              </label>
            </div>
          </div>

          {/* Show branding toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#334155]">Show Measured Quote Branding</p>
              <p className="text-xs text-[#94A3B8]">Small "Powered by" badge on widget</p>
            </div>
            <button
              onClick={() => setShowBranding(!showBranding)}
              className={`relative w-11 h-6 rounded-full transition-colors ${showBranding ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'}`}
            >
              <div
                className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${showBranding ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* Platform Instructions Accordion */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4">Installation Instructions</h3>
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

      {/* Right Column — Preview & Code */}
      <div className="space-y-6">
        {/* Live Preview */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4">Widget Preview</h3>
          <div className="flex justify-center">
            <div className="w-[360px] bg-white rounded-[24px] shadow-xl border border-[#E2E8F0] overflow-hidden">
              {/* Fake widget header */}
              <div className="h-1 bg-[#2563EB] w-1/4 rounded-full mt-0" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">Step 1 of 4</span>
                </div>
                <h4 className="text-lg font-bold text-[#0F172A] mb-1">{mockSettings.widget_title}</h4>
                <p className="text-xs text-[#64748B] mb-4">{mockSettings.widget_intro}</p>

                {/* Trade tabs */}
                <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                  {selectedTrades.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={`text-[10px] font-medium px-2.5 py-1.5 rounded-full whitespace-nowrap ${t === defaultTrade ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#475569]'}`}
                    >
                      {tradeLabels[t]}
                    </span>
                  ))}
                </div>

                {/* Fake form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#334155] block mb-1">Full Name</label>
                    <div className="h-9 border border-[#CBD5E1] rounded-[6px] bg-[#F8FAFC]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#334155] block mb-1">Email Address</label>
                    <div className="h-9 border border-[#CBD5E1] rounded-[6px] bg-[#F8FAFC]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#334155] block mb-1">Phone Number</label>
                    <div className="h-9 border border-[#CBD5E1] rounded-[6px] bg-[#F8FAFC]" />
                  </div>
                  <button className="w-full h-10 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] mt-2">
                    Get Started
                  </button>
                </div>

                {/* Branding badge */}
                {showBranding && (
                  <div className="text-center mt-4">
                    <span className="text-[9px] text-[#94A3B8]">Powered by Measured Quote</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code Block */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Embed Code</h3>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[6px] transition-colors ${copied ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#2563EB] text-white hover:bg-[#1A3A6B]'}`}
            >
              {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="bg-[#0F172A] rounded-[10px] p-4 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-[#93C5FD]">&lt;script</span>
                {'\n'}
                <span className="text-[#60A5FA]">  src</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;https://draw-to-quote.com/widget.js&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-tenant</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;YOUR_TENANT_ID&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-trades</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;{selectedTrades.join(',')}&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-lang</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;{language}&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-mode</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;{mode}&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-branding</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;{showBranding ? 'true' : 'false'}&quot;</span>
                {'\n'}
                <span className="text-[#60A5FA]">  data-color</span>
                <span className="text-white">=</span>
                <span className="text-[#22C55E]">&quot;{mockSettings.primary_color}&quot;</span>
                {'\n'}
                <span className="text-[#93C5FD]">&gt;&lt;/script&gt;</span>
              </code>
            </pre>
          </div>
        </div>

        {/* Direct Link */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <label className="block text-sm font-medium text-[#334155] mb-2">Or share this direct link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={directLink}
              className="flex-1 px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm bg-[#F8FAFC] text-[#475569] font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-[6px] border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#475569] transition-colors"
              title="Copy link"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
