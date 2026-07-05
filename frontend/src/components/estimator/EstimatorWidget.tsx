import { useState, useCallback } from 'react';
import type { TradeConfig } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';
import EstimatorStepStart from './EstimatorStepStart';
import EstimatorStepLanguage from './EstimatorStepLanguage';
import EstimatorStepLeadGate, { type LeadFormData } from './EstimatorStepLeadGate';
import EstimatorStepMap from './EstimatorStepMap';
import EstimatorStepMaterials, { type MaterialSelections } from './EstimatorStepMaterials';
import EstimatorStepResults from './EstimatorStepResults';
import { submitLead } from '@/lib/mq';
import { computeEstimate } from '@/lib/estimate';

interface Props {
  trade: TradeConfig;
  /** Tenant id when rendered inside the embeddable widget iframe. */
  tenant?: string | null;
  /** Signed widget token (from the `t` embed param) for lead API auth. */
  widgetToken?: string | null;
}

type WidgetStep = 'start' | 'language' | 'leadGate' | 'map' | 'materials' | 'results';

const stepOrder: WidgetStep[] = ['start', 'language', 'leadGate', 'map', 'materials', 'results'];

function stepIndex(step: WidgetStep): number {
  return stepOrder.indexOf(step);
}

function totalSteps(): number {
  // start + language + leadGate + map + materials = 5 before results
  return 5;
}

export default function EstimatorWidget({ trade, tenant = null, widgetToken = null }: Props) {
  void tenant; // tenant scoping is carried by the signed widget token
  const [step, setStep] = useState<WidgetStep>('start');
  const [lang, setLang] = useState<Language>('en');
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);
  const [measurement, setMeasurement] = useState<number>(0);
  const [selections, setSelections] = useState<MaterialSelections | null>(null);
  const [, setDirection] = useState<'forward' | 'backward'>('forward');

  const goTo = useCallback((target: WidgetStep) => {
    setDirection(stepIndex(target) > stepIndex(step) ? 'forward' : 'backward');
    setStep(target);
  }, [step]);

  function handleStart() {
    goTo('language');
  }

  function handleSelectLanguage(selectedLang: Language) {
    setLang(selectedLang);
    goTo('leadGate');
  }

  function handleLeadSubmit(data: LeadFormData) {
    setLeadData(data);
    goTo('map');
  }

  function handleMapContinue(measurement: number) {
    setMeasurement(measurement);
    goTo('materials');
  }

  function handleMaterialsSubmit(sel: MaterialSelections) {
    setSelections(sel);
    goTo('results');

    // Fire-and-forget lead capture to the MeasuredQuote backend, using the
    // same calculation the results screen renders so stored price == shown price.
    if (leadData) {
      const est = computeEstimate(trade, sel, measurement);
      void submitLead(
        {
          name: leadData.fullName,
          email: leadData.email,
          phone: leadData.phone,
          address: `${leadData.streetAddress}, ${leadData.city}, ${leadData.state} ${leadData.zipCode}`,
          language: lang,
          trade: trade.id,
          measurement,
          measurement_unit: trade.measurementType === 'linear' ? 'lf' : 'sqft',
          material: est.materialId,
          addons: sel.addonIds.map((id) => ({ id, qty: sel.addonQuantities[id] ?? 1 })),
          low_estimate: est.totalLow,
          high_estimate: est.totalHigh,
          line_items: est.lineItems,
          source_url: document.referrer || window.location.href,
        },
        widgetToken,
      );
    }
  }

  function handleStartOver() {
    setStep('start');
    setLang('en');
    setLeadData(null);
    setMeasurement(0);
    setSelections(null);
    setDirection('forward');
  }

  // Progress calculation: 0-based steps excluding results
  const currentStepNum = Math.min(stepIndex(step) + 1, totalSteps());
  const progressPercent = (currentStepNum / totalSteps()) * 100;

  const canGoBack = step !== 'start' && step !== 'language' && step !== 'results';

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Widget container */}
      <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-xl overflow-hidden">
        {/* Progress bar */}
        {step !== 'start' && step !== 'results' && (
          <div className="h-1 bg-[#F1F5F9] w-full">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Widget header */}
        <div className="px-6 md:px-8 pt-5 pb-0 flex items-center justify-between">
          {step !== 'start' && step !== 'results' && (
            <div className="flex items-center gap-2 mb-3">
              {canGoBack && (
                <button
                  onClick={() => {
                    const idx = stepIndex(step);
                    if (idx > 0) goTo(stepOrder[idx - 1]);
                  }}
                  className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors flex items-center gap-1 mr-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  {t(lang, 'widget.back')}
                </button>
              )}
            </div>
          )}
          {step !== 'start' && step !== 'results' && (
            <div className="flex items-center gap-2 mb-3 ml-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1A3A6B] text-xs font-medium">
                {lang === 'es' ? trade.nameEs : trade.name}
              </span>
              <span className="text-xs text-[#64748B]">
                {t(lang, 'widget.step', { current: String(currentStepNum), total: String(totalSteps()) })}
              </span>
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="px-6 md:px-8 pb-8">
          {step === 'start' && (
            <EstimatorStepStart trade={trade} lang={lang} onStart={handleStart} />
          )}
          {step === 'language' && (
            <EstimatorStepLanguage lang={lang} onSelectLanguage={handleSelectLanguage} />
          )}
          {step === 'leadGate' && (
            <EstimatorStepLeadGate lang={lang} onSubmit={handleLeadSubmit} />
          )}
          {step === 'map' && leadData && (
            <EstimatorStepMap
              trade={trade}
              lang={lang}
              leadData={leadData}
              onContinue={handleMapContinue}
            />
          )}
          {step === 'materials' && (
            <EstimatorStepMaterials
              trade={trade}
              lang={lang}
              measurement={measurement}
              onSubmit={handleMaterialsSubmit}
            />
          )}
          {step === 'results' && leadData && selections && (
            <EstimatorStepResults
              trade={trade}
              lang={lang}
              leadData={leadData}
              measurement={measurement}
              selections={selections}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}
