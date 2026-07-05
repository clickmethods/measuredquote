import { useState, useMemo } from 'react'
import {
  GripVertical,
  Plus,
  Trash2,
  Calculator,
  Save,
  RotateCcw,
} from 'lucide-react'
import { mockPricingConfigs, mockSettings, type TradePricing, type MaterialOption, type AddonOption } from '../../data/mockSettings'

const tradeKeys = ['concrete', 'asphalt', 'landscape', 'deck', 'roof', 'fence'] as const
const tradeLabels: Record<string, string> = {
  concrete: 'Concrete',
  asphalt: 'Asphalt',
  landscape: 'Landscape',
  deck: 'Deck',
  roof: 'Roofing',
  fence: 'Fence',
}

export default function PricingTab() {
  const [activeTrade, setActiveTrade] = useState<string>('concrete')
  const [pricing, setPricing] = useState<Record<string, TradePricing>>(() =>
    JSON.parse(JSON.stringify(mockPricingConfigs))
  )
  const [markup, setMarkup] = useState(mockSettings.markup_multiplier)
  const [buffer, setBuffer] = useState(mockSettings.range_buffer_percent)
  const [testMeasurement, setTestMeasurement] = useState<string>('1000')
  const [, setShowMaterialModal] = useState(false)
  const [, setShowAddonModal] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const config = pricing[activeTrade]

  // Live preview calculation
  const preview = useMemo(() => {
    const measurement = parseFloat(testMeasurement) || 0
    const baseMaterial = config.materials.find((m) => m.is_default) || config.materials[0]
    const baseRate = (config.base_rate_low + config.base_rate_high) / 2
    const materialRate = baseMaterial ? (baseMaterial.low_rate + baseMaterial.high_rate) / 2 : 0
    const subtotal = measurement * (baseRate + materialRate)
    const markedUp = subtotal * markup
    const low = Math.round(markedUp * (1 - buffer / 100))
    const high = Math.round(markedUp * (1 + buffer / 100))
    return { measurement, baseRate, materialRate, subtotal, markedUp, low, high, materialName: baseMaterial?.name || '' }
  }, [config, testMeasurement, markup, buffer])

  function updateMaterial(trade: string, id: string, patch: Partial<MaterialOption>) {
    setPricing((prev) => {
      const next = { ...prev }
      next[trade] = {
        ...next[trade],
        materials: next[trade].materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }
      return next
    })
  }

  function updateAddon(trade: string, id: string, patch: Partial<AddonOption>) {
    setPricing((prev) => {
      const next = { ...prev }
      next[trade] = {
        ...next[trade],
        addons: next[trade].addons.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }
      return next
    })
  }

  function deleteMaterial(trade: string, id: string) {
    setPricing((prev) => ({
      ...prev,
      [trade]: { ...prev[trade], materials: prev[trade].materials.filter((m) => m.id !== id) },
    }))
  }

  function deleteAddon(trade: string, id: string) {
    setPricing((prev) => ({
      ...prev,
      [trade]: { ...prev[trade], addons: prev[trade].addons.filter((a) => a.id !== id) },
    }))
  }

  function handleSave() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  function formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Trade Selector */}
      <div className="lg:w-[200px] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Select Trade</h3>
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tradeKeys.map((key) => {
            const isActive = activeTrade === key
            return (
              <button
                key={key}
                onClick={() => setActiveTrade(key)}
                className={
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] text-sm font-medium whitespace-nowrap transition-all ' +
                  (isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] border-l-[3px] border-[#3B82F6]'
                    : 'text-[#475569] hover:bg-[#F1F5F9] border-l-[3px] border-transparent')
                }
              >
                {tradeLabels[key]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pricing Form */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">{tradeLabels[activeTrade]} Pricing</h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => setPricing(JSON.parse(JSON.stringify(mockPricingConfigs)))}
            className="text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-[#FEE2E2] rounded-[6px] transition-colors"
          >
            <RotateCcw size={13} />
            Reset to Defaults
          </button>
        </div>

        {/* Base Rate */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4">Base Rate Per Unit</h3>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Low Rate ($/{config.base_unit})</label>
              <input
                type="number"
                step="0.01"
                value={config.base_rate_low}
                onChange={(e) =>
                  setPricing((prev) => ({
                    ...prev,
                    [activeTrade]: { ...prev[activeTrade], base_rate_low: parseFloat(e.target.value) || 0 },
                  }))
                }
                className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">High Rate ($/{config.base_unit})</label>
              <input
                type="number"
                step="0.01"
                value={config.base_rate_high}
                onChange={(e) =>
                  setPricing((prev) => ({
                    ...prev,
                    [activeTrade]: { ...prev[activeTrade], base_rate_high: parseFloat(e.target.value) || 0 },
                  }))
                }
                className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
              />
            </div>
          </div>
          <p className="text-xs text-[#94A3B8] mt-2">The starting price before materials and add-ons.</p>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Material / Finish Options</h3>
              <p className="text-xs text-[#94A3B8]">Homeowners select one of these options.</p>
            </div>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2563EB] border-[1.5px] border-[#2563EB] rounded-[6px] hover:bg-[#EFF6FF] transition-colors"
            >
              <Plus size={16} />
              Add Material
            </button>
          </div>

          <div className="space-y-3">
            {config.materials.map((mat) => (
              <div
                key={mat.id}
                className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[10px] p-4"
              >
                <button className="text-[#94A3B8] hover:text-[#475569] cursor-grab">
                  <GripVertical size={16} />
                </button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={mat.name}
                    onChange={(e) => updateMaterial(activeTrade, mat.id, { name: e.target.value })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="Material name"
                  />
                  <input
                    type="text"
                    value={mat.description}
                    onChange={(e) => updateMaterial(activeTrade, mat.id, { description: e.target.value })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={mat.low_rate}
                    onChange={(e) => updateMaterial(activeTrade, mat.id, { low_rate: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="$0.00"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#64748B] cursor-pointer">
                      <input
                        type="radio"
                        name={`default-${activeTrade}`}
                        checked={mat.is_default}
                        onChange={() => {
                          setPricing((prev) => ({
                            ...prev,
                            [activeTrade]: {
                              ...prev[activeTrade],
                              materials: prev[activeTrade].materials.map((m) => ({
                                ...m,
                                is_default: m.id === mat.id,
                              })),
                            },
                          }))
                        }}
                        className="accent-[#2563EB]"
                      />
                      Default
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => deleteMaterial(activeTrade, mat.id)}
                  className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons Table */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Add-On Options</h3>
              <p className="text-xs text-[#94A3B8]">Homeowners can select any combination of these.</p>
            </div>
            <button
              onClick={() => setShowAddonModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2563EB] border-[1.5px] border-[#2563EB] rounded-[6px] hover:bg-[#EFF6FF] transition-colors"
            >
              <Plus size={16} />
              Add Add-on
            </button>
          </div>

          <div className="space-y-3">
            {config.addons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[10px] p-4"
              >
                <button className="text-[#94A3B8] hover:text-[#475569] cursor-grab">
                  <GripVertical size={16} />
                </button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <input
                    type="text"
                    value={addon.name}
                    onChange={(e) => updateAddon(activeTrade, addon.id, { name: e.target.value })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="Add-on name"
                  />
                  <input
                    type="text"
                    value={addon.description}
                    onChange={(e) => updateAddon(activeTrade, addon.id, { description: e.target.value })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="Description"
                  />
                  <select
                    value={addon.type}
                    onChange={(e) => updateAddon(activeTrade, addon.id, { type: e.target.value as 'flat' | 'per-unit' })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] text-[#334155]"
                  >
                    <option value="per-unit">Per Unit</option>
                    <option value="flat">Flat Fee</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={addon.low_price}
                    onChange={(e) => updateAddon(activeTrade, addon.id, { low_price: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                    placeholder="$0.00"
                  />
                  <div className="flex items-center text-xs text-[#64748B] capitalize">{addon.unit}</div>
                </div>
                <button
                  onClick={() => deleteAddon(activeTrade, addon.id)}
                  className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4">Estimate Range Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Markup Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
              />
              <p className="text-xs text-[#94A3B8] mt-1">Applied to subtotal for overhead and profit.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Range Buffer %</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={buffer}
                  onChange={(e) => setBuffer(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 pr-8 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">%</span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">The +/-percentage for low-high estimate range.</p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-[#F8FAFC] rounded-[16px] p-5 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} className="text-[#2563EB]" />
              <h4 className="text-sm font-semibold text-[#0F172A]">Live Preview Calculator</h4>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                Test Measurement ({config.base_unit})
              </label>
              <input
                type="number"
                value={testMeasurement}
                onChange={(e) => setTestMeasurement(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 border-[1.5px] border-[#CBD5E1] rounded-[6px] text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-[3px] focus:ring-[#DBEAFE]"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Material</span>
                <span className="font-medium text-[#334155]">{preview.materialName} — ${preview.materialRate.toFixed(2)}/{config.base_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Base Rate</span>
                <span className="font-medium text-[#334155]">${preview.baseRate.toFixed(2)}/{config.base_unit}</span>
              </div>
              <div className="border-t border-[#E2E8F0] my-2" />
              <div className="flex justify-between">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="font-medium font-mono text-[#334155]">{formatCurrency(preview.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">After Markup ({markup}x)</span>
                <span className="font-medium font-mono text-[#334155]">{formatCurrency(preview.markedUp)}</span>
              </div>
              <div className="border-t border-[#E2E8F0] my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#0F172A]">Estimate Range</span>
                <span className="text-[24px] font-bold font-mono text-[#2563EB]">
                  {formatCurrency(preview.low)} – {formatCurrency(preview.high)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          {savedToast && (
            <span className="text-sm font-medium text-[#16A34A] flex items-center gap-1.5">
              <Save size={15} />
              Saved successfully
            </span>
          )}
          <div className="ml-auto" />
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-[6px] hover:bg-[#1A3A6B] transition-colors hover:-translate-y-0.5 hover:shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
