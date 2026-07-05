import { useState, useEffect, useRef } from 'react';
import type { TradeConfig, MaterialOption, AddonOption, ProjectType, SubOption } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';

export interface MaterialSelections {
  materialId: string;
  projectTypeId?: string;
  subOptionId?: string;
  heightValue?: number;
  addonIds: string[];
  addonQuantities: Record<string, number>;
}

interface Props {
  trade: TradeConfig;
  lang: Language;
  measurement: number;
  onSubmit: (selections: MaterialSelections) => void;
}

export default function EstimatorStepMaterials({ trade, lang, measurement, onSubmit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  const [selectedSubOption, setSelectedSubOption] = useState<string>('');
  const [selectedHeight, setSelectedHeight] = useState<number>(6);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateX(30px)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateX(0)';
        }
      });
    }
  }, []);

  // Initialize default addon quantities
  useEffect(() => {
    const defaults: Record<string, number> = {};
    trade.addons.forEach((a) => {
      if (a.qtyDefault !== undefined) defaults[a.id] = a.qtyDefault;
    });
    setAddonQuantities(defaults);
  }, [trade]);

  function toggleAddon(addonId: string) {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  }

  function setAddonQty(addonId: string, qty: number) {
    setAddonQuantities((prev) => ({ ...prev, [addonId]: Math.max(0, qty) }));
  }

  function getMaterialPriceLow(): number {
    if (trade.projectTypes && selectedProjectType) {
      const pt = trade.projectTypes.find((p) => p.id === selectedProjectType);
      if (!pt) return 0;
      const sub = pt.subOptions.find((s) => s.id === selectedSubOption);
      return pt.priceLow + (sub ? sub.priceLow : 0);
    }
    const mat = trade.materials.find((m) => m.id === selectedMaterial);
    return mat ? mat.priceLow : 0;
  }

  function getMaterialPriceHigh(): number {
    if (trade.projectTypes && selectedProjectType) {
      const pt = trade.projectTypes.find((p) => p.id === selectedProjectType);
      if (!pt) return 0;
      const sub = pt.subOptions.find((s) => s.id === selectedSubOption);
      return pt.priceHigh + (sub ? sub.priceHigh : 0);
    }
    const mat = trade.materials.find((m) => m.id === selectedMaterial);
    return mat ? mat.priceHigh : 0;
  }

  function getHeightMultiplier(): number {
    if (!trade.heightOptions) return 1;
    const ho = trade.heightOptions.find((h) => h.value === selectedHeight);
    return ho ? ho.multiplier : 1;
  }

  function calculateTotals() {
    const baseLow = getMaterialPriceLow() * getHeightMultiplier();
    const baseHigh = getMaterialPriceHigh() * getHeightMultiplier();

    let addonsLow = 0;
    let addonsHigh = 0;

    const visibleAddons = getVisibleAddons();
    visibleAddons.forEach((addon) => {
      if (selectedAddons.includes(addon.id)) {
        const qty = addonQuantities[addon.id] ?? 1;
        const isPerUnit = addon.unit === 'sqft' || addon.unit === 'linear';
        if (isPerUnit) {
          addonsLow += addon.priceLow * measurement * getHeightMultiplier();
          addonsHigh += addon.priceHigh * measurement * getHeightMultiplier();
        } else if (addon.unit === 'per-fixture' || addon.unit === 'per-step' || addon.unit === 'per-gate') {
          addonsLow += addon.priceLow * qty;
          addonsHigh += addon.priceHigh * qty;
        } else {
          addonsLow += addon.priceLow;
          addonsHigh += addon.priceHigh;
        }
      }
    });

    const low = Math.round((baseLow * measurement + addonsLow));
    const high = Math.round((baseHigh * measurement + addonsHigh));

    return { low, high };
  }

  function getVisibleAddons(): AddonOption[] {
    return trade.addons.filter((addon) => {
      if (!addon.showWhen) return true;
      if (addon.showWhen.materialId) {
        return selectedProjectType === addon.showWhen.materialId;
      }
      if (addon.showWhen.addonId) {
        return selectedAddons.includes(addon.showWhen.addonId);
      }
      return true;
    });
  }

  function handleSubmit() {
    if (!canSubmit()) return;
    onSubmit({
      materialId: trade.projectTypes ? '' : selectedMaterial,
      projectTypeId: trade.projectTypes ? selectedProjectType : undefined,
      subOptionId: selectedSubOption || undefined,
      heightValue: trade.heightOptions ? selectedHeight : undefined,
      addonIds: selectedAddons,
      addonQuantities,
    });
  }

  function canSubmit(): boolean {
    if (trade.projectTypes) return !!selectedProjectType && !!selectedSubOption;
    return !!selectedMaterial;
  }

  const totals = calculateTotals();
  const isLinear = trade.measurementType === 'linear';

  // ── Render helpers ──

  function renderMaterialCard(mat: MaterialOption, isSelected: boolean, onSelect: () => void) {
    return (
      <button
        key={mat.id}
        onClick={onSelect}
        className={
          'w-full text-left flex items-start gap-4 p-4 rounded-[16px] border-2 transition-all duration-200 cursor-pointer ' +
          (isSelected
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]')
        }
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isSelected && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <h5 className="font-semibold text-[#0F172A]">{lang === 'es' ? mat.nameEs : mat.name}</h5>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">{lang === 'es' ? mat.descriptionEs : mat.description}</p>
          <p className="text-xs text-[#16A34A] font-medium mt-1">
            ${mat.priceLow}-{mat.priceHigh}/{isLinear ? t(lang, 'materials.perLinearFt') : t(lang, 'materials.perSqft')}
          </p>
        </div>
      </button>
    );
  }

  function renderProjectTypeCard(pt: ProjectType, isSelected: boolean, onSelect: () => void) {
    return (
      <button
        key={pt.id}
        onClick={() => { onSelect(); setSelectedSubOption(''); }}
        className={
          'w-full text-left flex items-start gap-4 p-4 rounded-[16px] border-2 transition-all duration-200 cursor-pointer ' +
          (isSelected
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]')
        }
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isSelected && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <h5 className="font-semibold text-[#0F172A]">{lang === 'es' ? pt.nameEs : pt.name}</h5>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">{lang === 'es' ? pt.descriptionEs : pt.description}</p>
          <p className="text-xs text-[#16A34A] font-medium mt-1">
            ~${pt.priceLow}-{pt.priceHigh}/{t(lang, 'materials.perSqft')}
          </p>
        </div>
      </button>
    );
  }

  function renderSubOptionCard(so: SubOption, isSelected: boolean, onSelect: () => void) {
    return (
      <button
        key={so.id}
        onClick={onSelect}
        className={
          'w-full text-left flex items-start gap-3 p-3 rounded-[10px] border-2 transition-all duration-200 cursor-pointer ' +
          (isSelected
            ? 'border-[#2563EB] bg-[#EFF6FF]'
            : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]')
        }
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isSelected && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            <span className="font-medium text-sm text-[#0F172A]">{lang === 'es' ? so.nameEs : so.name}</span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">{lang === 'es' ? so.descriptionEs : so.description}</p>
          <p className={`text-xs font-medium mt-0.5 ${so.priceLow < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
            {so.priceLow === 0 && so.priceHigh === 0
              ? t(lang, 'materials.perSqft') + ' (base)'
              : `${so.priceLow > 0 ? '+' : ''}$${so.priceLow}/{t(lang, 'materials.perSqft')}`}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div ref={ref} className="py-4">
      <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
        {t(lang, 'materials.title')}
      </h3>
      <p className="text-[#475569] text-sm mb-4">
        {t(lang, 'materials.subtitle')}
      </p>

      {/* Measurement display */}
      <div className="bg-[#EFF6FF] px-4 py-2.5 rounded-[10px] mb-6">
        <span className="text-sm font-mono font-medium text-[#2563EB]">
          {trade.id === 'roofing'
            ? t(lang, 'materials.roofFootprint').replace('{area}', measurement.toLocaleString())
            : isLinear
              ? t(lang, 'materials.lengthLabel').replace('{length}', measurement.toLocaleString())
              : t(lang, 'materials.areaLabel').replace('{area}', measurement.toLocaleString())}
        </span>
        {trade.id === 'roofing' && (
          <p className="text-xs text-[#94A3B8] mt-0.5">{t(lang, 'materials.pitchNote')}</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: selections */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Materials or Project Types */}
          {trade.projectTypes ? (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-3">
                {t(lang, 'materials.projectTypeLabel')}
              </h4>
              <div className="flex flex-col gap-3">
                {trade.projectTypes.map((pt) =>
                  renderProjectTypeCard(pt, selectedProjectType === pt.id, () => setSelectedProjectType(pt.id))
                )}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-3">
                {t(lang, 'materials.materialLabel')}
              </h4>
              <div className="flex flex-col gap-3">
                {trade.materials.map((mat) =>
                  renderMaterialCard(mat, selectedMaterial === mat.id, () => setSelectedMaterial(mat.id))
                )}
              </div>
            </div>
          )}

          {/* Sub-options for project types */}
          {trade.projectTypes && selectedProjectType && (() => {
            const pt = trade.projectTypes.find((p) => p.id === selectedProjectType);
            if (!pt) return null;
            return (
              <div>
                <h4 className="text-base font-semibold text-[#0F172A] mb-3">
                  {lang === 'es' ? pt.subOptionLabelEs : pt.subOptionLabel}
                </h4>
                <div className="flex flex-col gap-2">
                  {pt.subOptions.map((so) =>
                    renderSubOptionCard(so, selectedSubOption === so.id, () => setSelectedSubOption(so.id))
                  )}
                </div>
              </div>
            );
          })()}

          {/* Height options (fencing) */}
          {trade.heightOptions && selectedMaterial && (
            <div>
              <h4 className="text-base font-semibold text-[#0F172A] mb-3">
                {t(lang, 'materials.heightLabel')}
              </h4>
              <div className="flex flex-col gap-2">
                {trade.heightOptions.map((ho) => (
                  <button
                    key={ho.value}
                    onClick={() => setSelectedHeight(ho.value)}
                    className={
                      'w-full text-left flex items-center justify-between p-3 rounded-[10px] border-2 transition-all duration-200 cursor-pointer ' +
                      (selectedHeight === ho.value
                        ? 'border-[#2563EB] bg-[#EFF6FF]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]')
                    }
                  >
                    <span className="font-medium text-sm text-[#0F172A]">
                      {lang === 'es' ? ho.labelEs : ho.label}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {ho.multiplier === 1 ? 'Base' : `x${ho.multiplier}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          <div>
            <h4 className="text-base font-semibold text-[#0F172A] mb-3">
              {t(lang, 'materials.addonsLabel')}
            </h4>
            <div className="flex flex-col divide-y divide-[#F1F5F9]">
              {getVisibleAddons().map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div key={addon.id} className="py-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="mt-0.5">
                        <div
                          onClick={() => toggleAddon(addon.id)}
                          className={
                            'w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ' +
                            (isChecked
                              ? 'bg-[#2563EB] border-[#2563EB]'
                              : 'border-[#CBD5E1] hover:border-[#93C5FD]')
                          }
                        >
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm text-[#0F172A]">
                          {lang === 'es' ? addon.nameEs : addon.name}
                        </span>
                        <p className="text-xs text-[#64748B]">
                          {lang === 'es' ? addon.descriptionEs : addon.description}
                        </p>
                        <p className="text-xs text-[#16A34A] font-medium mt-0.5">
                          +${addon.priceLow}
                          {addon.priceHigh !== addon.priceLow && `-${addon.priceHigh}`}
                          {addon.unit === 'sqft' ? `/${t(lang, 'materials.perSqft')}` :
                           addon.unit === 'linear' ? `/${t(lang, 'materials.perLinearFt')}` :
                           addon.unit === 'per-fixture' ? `/${t(lang, 'materials.perFixture')}` :
                           addon.unit === 'per-step' ? `/${t(lang, 'materials.perStep')}` :
                           addon.unit === 'per-gate' ? `/${t(lang, 'materials.perGate')}` : ` ${t(lang, 'materials.flat')}`}
                        </p>
                      </div>
                    </label>
                    {/* Quantity input for add-ons that need it */}
                    {isChecked && (addon.qtyMin !== undefined) && (
                      <div className="ml-8 mt-2 flex items-center gap-3">
                        <span className="text-xs text-[#64748B]">
                          {lang === 'es' ? addon.qtyLabelEs : addon.qtyLabel}:
                        </span>
                        <input
                          type="number"
                          min={addon.qtyMin}
                          max={addon.qtyMax}
                          value={addonQuantities[addon.id] ?? addon.qtyDefault ?? 1}
                          onChange={(e) => setAddonQty(addon.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-9 px-2 rounded-md border border-[#CBD5E1] text-sm text-[#0F172A] outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: running total sidebar */}
        <div className="lg:w-[260px] shrink-0">
          <div className="bg-[#F8FAFC] rounded-[16px] p-5 border border-[#E2E8F0] lg:sticky lg:top-4">
            <h5 className="font-semibold text-[#0F172A] mb-3">
              {t(lang, 'materials.yourSelections')}
            </h5>

            {/* Selected material */}
            {trade.projectTypes && selectedProjectType ? (() => {
              const pt = trade.projectTypes.find((p) => p.id === selectedProjectType);
              const so = pt?.subOptions.find((s) => s.id === selectedSubOption);
              return (
                <div className="mb-2">
                  <p className="text-sm text-[#334155]">{pt ? (lang === 'es' ? pt.nameEs : pt.name) : ''}</p>
                  {so && <p className="text-xs text-[#64748B]">{lang === 'es' ? so.nameEs : so.name}</p>}
                </div>
              );
            })() : selectedMaterial ? (() => {
              const mat = trade.materials.find((m) => m.id === selectedMaterial);
              return (
                <p className="text-sm text-[#334155] mb-2">{mat ? (lang === 'es' ? mat.nameEs : mat.name) : ''}</p>
              );
            })() : (
              <p className="text-sm text-[#94A3B8] mb-2">{t(lang, 'materials.selectOne')}</p>
            )}

            {/* Selected addons */}
            {selectedAddons.length > 0 && (
              <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-[#E2E8F0]">
                {selectedAddons.map((aid) => {
                  const a = trade.addons.find((x) => x.id === aid);
                  if (!a) return null;
                  return (
                    <p key={aid} className="text-xs text-[#64748B]">
                      {lang === 'es' ? a.nameEs : a.name}
                    </p>
                  );
                })}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
              <p className="text-sm text-[#64748B] mb-3">
                {t(lang, 'materials.estimateRange')}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-semibold text-[#16A34A] font-mono">
                  ${totals.low.toLocaleString()}
                </span>
                <span className="text-sm text-[#64748B]">{t(lang, 'results.to')}</span>
                <span className="text-2xl font-semibold text-[#D97706] font-mono">
                  ${totals.high.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                {t(lang, 'materials.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit()}
        className={
          'w-full font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 mt-8 ' +
          (canSubmit()
            ? 'bg-[#2563EB] text-white hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg'
            : 'bg-[#CBD5E1] text-[#94A3B8] cursor-not-allowed')
        }
      >
        {t(lang, 'materials.getEstimate')}
      </button>
    </div>
  );
}
