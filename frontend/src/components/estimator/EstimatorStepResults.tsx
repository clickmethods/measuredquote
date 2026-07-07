import { useEffect, useRef, useState } from 'react';
import type { TradeConfig } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';
import type { LeadFormData } from './EstimatorStepLeadGate';
import type { MaterialSelections } from './EstimatorStepMaterials';
import PDFDownloadButton from './PDFDownloadButton';

interface Props {
  trade: TradeConfig;
  lang: Language;
  leadData: LeadFormData;
  measurement: number;
  selections: MaterialSelections;
  onStartOver: () => void;
}

interface LineItem {
  label: string;
  amountLow: number;
  amountHigh: number;
}

export default function EstimatorStepResults({ trade, lang, leadData, measurement, selections, onStartOver }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [animatedLow, setAnimatedLow] = useState(0);
  const [animatedHigh, setAnimatedHigh] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Get selected material info
  let selectedMaterialName = '';
  let selectedMaterialNameEs = '';
  let basePriceLow = 0;
  let basePriceHigh = 0;

  if (trade.projectTypes && selections.projectTypeId) {
    const pt = trade.projectTypes.find((p) => p.id === selections.projectTypeId);
    if (pt) {
      selectedMaterialName = pt.name;
      selectedMaterialNameEs = pt.nameEs;
      basePriceLow = pt.priceLow;
      basePriceHigh = pt.priceHigh;
      if (selections.subOptionId) {
        const so = pt.subOptions.find((s) => s.id === selections.subOptionId);
        if (so) {
          basePriceLow += so.priceLow;
          basePriceHigh += so.priceHigh;
          selectedMaterialName += ` (${so.name})`;
          selectedMaterialNameEs += ` (${so.nameEs})`;
        }
      }
    }
  } else if (selections.materialId) {
    const mat = trade.materials.find((m) => m.id === selections.materialId);
    if (mat) {
      selectedMaterialName = mat.name;
      selectedMaterialNameEs = mat.nameEs;
      basePriceLow = mat.priceLow;
      basePriceHigh = mat.priceHigh;
    }
  }

  // Height multiplier for fencing
  let heightMultiplier = 1;
  if (trade.heightOptions && selections.heightValue) {
    const ho = trade.heightOptions.find((h) => h.value === selections.heightValue);
    if (ho) heightMultiplier = ho.multiplier;
  }

  // Calculate line items
  const lineItems: LineItem[] = [];

  // Base material
  const baseLow = basePriceLow * heightMultiplier;
  const baseHigh = basePriceHigh * heightMultiplier;
  lineItems.push({
    label: t(lang, 'results.base').replace('{material}', lang === 'es' ? selectedMaterialNameEs : selectedMaterialName),
    amountLow: Math.round(baseLow * measurement),
    amountHigh: Math.round(baseHigh * measurement),
  });

  // Add-ons
  selections.addonIds.forEach((aid) => {
    const a = trade.addons.find((x) => x.id === aid);
    if (!a) return;
    const qty = selections.addonQuantities[aid] ?? 1;
    const isPerUnit = a.unit === 'sqft' || a.unit === 'linear';
    if (isPerUnit) {
      lineItems.push({
        label: lang === 'es' ? a.nameEs : a.name,
        amountLow: Math.round(a.priceLow * measurement * heightMultiplier),
        amountHigh: Math.round(a.priceHigh * measurement * heightMultiplier),
      });
    } else if (a.unit === 'per-fixture' || a.unit === 'per-step' || a.unit === 'per-gate') {
      lineItems.push({
        label: lang === 'es' ? a.nameEs : a.name,
        amountLow: Math.round(a.priceLow * qty),
        amountHigh: Math.round(a.priceHigh * qty),
      });
    } else {
      lineItems.push({
        label: lang === 'es' ? a.nameEs : a.name,
        amountLow: Math.round(a.priceLow),
        amountHigh: Math.round(a.priceHigh),
      });
    }
  });

  // Totals
  const totalLow = lineItems.reduce((s, i) => s + i.amountLow, 0);
  const totalHigh = lineItems.reduce((s, i) => s + i.amountHigh, 0);

  // ── PDF data preparation ──
  const measurementUnit = trade.measurementType === 'linear' ? 'linear ft' : 'sq ft';

  // Compute material rate (average of low/high per unit)
  const materialRate = basePriceLow;

  // Compute markup percent from price spread (default to 35% if can't calculate)
  let markupPercent = 35;
  if (basePriceLow > 0) {
    const spread = ((basePriceHigh - basePriceLow) / basePriceLow) * 100;
    markupPercent = Math.max(0, Math.round(spread));
  }

  // Compute subtotal (low-end total without margin spread = material + addons at low rates)
  const subtotal = totalLow;

  // Build PDF addons from line items (skip index 0 which is base material)
  const pdfAddons = lineItems.slice(1).map((item) => ({
    name: item.label,
    rate: 0, // Not shown individually in PDF table
    type: 'flat' as const,
    price: item.amountLow,
  }));

  // Build PDF line items
  const pdfLineItems = lineItems.map((item) => ({
    label: item.label,
    amountLow: item.amountLow,
    amountHigh: item.amountHigh,
  }));

  const today = new Date();
  const formattedDate = lang === 'es'
    ? today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Entrance animation
  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'scale(0.95)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'scale(1)';
        }
      });
    }
  }, []);

  // Price count-up animation
  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedLow(Math.round(totalLow * eased));
      setAnimatedHigh(Math.round(totalHigh * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalLow, totalHigh]);

  function handleRequestQuote() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  return (
    <div className="py-4">
      <div ref={ref} className="max-w-[480px] mx-auto">
        <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-1">
          {t(lang, 'results.title')}
        </h2>
        <p className="text-[#475569] text-sm text-center mb-1">
          {t(lang, 'results.thankYou').replace('{name}', leadData.fullName.split(' ')[0])}
        </p>
        <p className="text-[#94A3B8] text-xs text-center mb-6">
          {t(lang, 'results.emailSent').replace('{email}', leadData.email)}
        </p>

        <div className="bg-white rounded-[24px] shadow-xl border border-[#E2E8F0] p-6 md:p-8">
          {/* Project summary */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[#0F172A]">{lang === 'es' ? trade.nameEs : trade.name}</h4>
              <p className="text-xs text-[#64748B]">{leadData.streetAddress}, {leadData.city}, {leadData.state} {leadData.zipCode}</p>
            </div>
          </div>

          <div className="bg-[#EFF6FF] px-4 py-2 rounded-[10px] mb-5">
            <span className="text-sm font-mono font-medium text-[#2563EB]">
              {trade.measurementType === 'linear'
                ? `${t(lang, 'materials.lengthLabel').replace('{length}', measurement.toLocaleString())}`
                : `${measurement.toLocaleString()} ${t(lang, trade.id === 'roofing' ? 'materials.roofFootprint' : 'materials.areaLabel').replace(/.*?{area} /, '').replace('sq ft', '').trim() || 'sq ft'}`}
            </span>
          </div>

          {/* Line items */}
          <h5 className="text-sm font-semibold text-[#334155] mb-3 uppercase tracking-wide">
            {t(lang, 'results.lineItems')}
          </h5>
          <div className="flex flex-col gap-2.5 mb-5">
            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-sm"
                style={{
                  opacity: 0,
                  animation: `fadeSlideUp 400ms ease-out ${idx * 50 + 200}ms forwards`,
                }}
              >
                <span className="text-[#334155] flex-1 pr-3">{item.label}</span>
                <span className="text-[#0F172A] font-mono font-medium shrink-0">
                  ${item.amountLow.toLocaleString()}
                  {item.amountHigh !== item.amountLow && ` - $${item.amountHigh.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(15px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          {/* Estimate range */}
          <div className="bg-[#F8FAFC] rounded-[16px] p-5 text-center mb-6">
            <p className="text-sm font-semibold text-[#334155] mb-3">
              {t(lang, 'results.estimateRange')}
            </p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-3xl font-semibold text-[#16A34A] font-mono">
                ${animatedLow.toLocaleString()}
              </span>
              <span className="text-[#64748B] text-sm">{t(lang, 'results.to')}</span>
              <span className="text-3xl font-semibold text-[#D97706] font-mono">
                ${animatedHigh.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">{t(lang, 'results.ballparkOnly')}</p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRequestQuote}
              className="w-full bg-[#16A34A] text-white font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 hover:bg-[#15803D] hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t(lang, 'results.requestQuote')}
            </button>

            {/* PDF Download */}
            <PDFDownloadButton
              contractorName=""
              contractorPhone=""
              contractorEmail=""
              clientName={leadData.fullName}
              clientEmail={leadData.email}
              clientPhone={leadData.phone}
              projectAddress={`${leadData.streetAddress}, ${leadData.city}, ${leadData.state} ${leadData.zipCode}`}
              tradeName={trade.name}
              tradeNameEs={trade.nameEs}
              measurement={measurement}
              measurementUnit={measurementUnit}
              materialName={lang === 'es' ? selectedMaterialNameEs : selectedMaterialName}
              materialRate={materialRate}
              addons={pdfAddons}
              subtotal={subtotal}
              markupPercent={markupPercent}
              lowPrice={totalLow}
              highPrice={totalHigh}
              lineItems={pdfLineItems}
              date={formattedDate}
              lang={lang}
            />

            <button
              onClick={onStartOver}
              className="w-full text-[#475569] font-medium text-sm py-3 px-6 rounded-full transition-all duration-200 hover:bg-[#F1F5F9]"
            >
              {t(lang, 'results.startOver')}
            </button>
          </div>

          {/* Powered by */}
          <p className="text-center text-xs text-[#94A3B8] mt-5">
            {t(lang, 'results.poweredBy')}
          </p>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-50 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {t(lang, 'results.quoteMessage')}
        </div>
      )}
    </div>
  );
}
