// Estimator widget — conversion-optimized flow (English only):
//   start → address → map draw → materials → results
// The results screen shows the rough price range immediately and gates the
// itemized line-item estimate behind name + phone (the lead capture moment).

import { useState, useCallback } from 'react';
import type { TradeConfig } from '@/data/tradeConfigs';
import EstimatorStepStart from './EstimatorStepStart';
import EstimatorStepAddress, { type AddressData } from './EstimatorStepAddress';
import type { LeadFormData } from './EstimatorStepLeadGate';
import EstimatorStepMap from './EstimatorStepMap';
import EstimatorStepMaterials, { type MaterialSelections } from './EstimatorStepMaterials';
import EstimatorStepResults, { type ContactData } from './EstimatorStepResults';
import { submitLead } from '@/lib/mq';
import { computeEstimate } from '@/lib/estimate';

interface Props {
  trade: TradeConfig;
  /** Tenant id when rendered inside the embeddable widget iframe. */
  tenant?: string | null;
  /** Signed widget token (from the `t` embed param) for lead API auth. */
  widgetToken?: string | null;
}

type WidgetStep = 'start' | 'address' | 'map' | 'materials' | 'results';

const stepOrder: WidgetStep[] = ['start', 'address', 'map', 'materials', 'results'];

function stepIndex(step: WidgetStep): number {
  return stepOrder.indexOf(step);
}

// start + address + map + materials = 4 before results
const TOTAL_STEPS = 4;

export default function EstimatorWidget({ trade, tenant = null, widgetToken = null }: Props) {
  void tenant; // tenant scoping is carried by the signed widget token
  const [step, setStep] = useState<WidgetStep>('start');
  const [address, setAddress] = useState<AddressData | null>(null);
  const [measurement, setMeasurement] = useState<number>(0);
  const [selections, setSelections] = useState<MaterialSelections | null>(null);
  const [, setDirection] = useState<'forward' | 'backward'>('forward');

  const goTo = useCallback(
    (target: WidgetStep) => {
      setDirection(stepIndex(target) > stepIndex(step) ? 'forward' : 'backward');
      setStep(target);
    },
    [step],
  );

  // Map step needs the address in LeadFormData shape (contact fields empty
  // until the results-screen gate captures them).
  const leadDataForMap: LeadFormData | null = address
    ? { fullName: '', email: '', phone: '', ...address }
    : null;

  function handleStart() {
    goTo('address');
  }

  function handleAddressSubmit(data: AddressData) {
    setAddress(data);
    goTo('map');
  }

  function handleMapContinue(m: number) {
    setMeasurement(m);
    goTo('materials');
  }

  function handleMaterialsSubmit(sel: MaterialSelections) {
    setSelections(sel);
    goTo('results');
  }

  // Fired when the homeowner unlocks the itemized estimate with name + phone.
  // This is the lead-capture moment: submit to the Measured Quote backend with
  // the same numbers the results screen renders.
  function handleLeadCapture(contact: ContactData) {
    if (!address || !selections) return;
    const est = computeEstimate(trade, selections, measurement);
    void submitLead(
      {
        name: contact.fullName,
        email: contact.email || 'not-provided@lead.measuredquote.com',
        phone: contact.phone,
        address: `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`,
        language: 'en',
        trade: trade.id,
        measurement,
        measurement_unit: trade.measurementType === 'linear' ? 'lf' : 'sqft',
        material: est.materialId,
        addons: selections.addonIds.map((id) => ({ id, qty: selections.addonQuantities[id] ?? 1 })),
        low_estimate: est.totalLow,
        high_estimate: est.totalHigh,
        line_items: est.lineItems,
        source_url: document.referrer || window.location.href,
      },
      widgetToken,
    );
  }

  function handleStartOver() {
    setStep('start');
    setAddress(null);
    setMeasurement(0);
    setSelections(null);
    setDirection('forward');
  }

  const currentStepNum = Math.min(stepIndex(step) + 1, TOTAL_STEPS);
  const progressPercent = (currentStepNum / TOTAL_STEPS) * 100;
  const canGoBack = step !== 'start' && step !== 'results';

  return (
    <div className="w-full max-w-[720px] mx-auto">
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
                  Back
                </button>
              )}
            </div>
          )}
          {step !== 'start' && step !== 'results' && (
            <div className="flex items-center gap-2 mb-3 ml-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1A3A6B] text-xs font-medium">
                {trade.name}
              </span>
              <span className="text-xs text-[#64748B]">
                Step {currentStepNum} of {TOTAL_STEPS}
              </span>
            </div>
          )}
        </div>

        {/* Step content */}
        <div className="px-6 md:px-8 pb-8">
          {step === 'start' && <EstimatorStepStart trade={trade} lang="en" onStart={handleStart} />}
          {step === 'address' && <EstimatorStepAddress onSubmit={handleAddressSubmit} />}
          {step === 'map' && leadDataForMap && (
            <EstimatorStepMap trade={trade} lang="en" leadData={leadDataForMap} onContinue={handleMapContinue} />
          )}
          {step === 'materials' && (
            <EstimatorStepMaterials trade={trade} lang="en" measurement={measurement} onSubmit={handleMaterialsSubmit} />
          )}
          {step === 'results' && address && selections && (
            <EstimatorStepResults
              trade={trade}
              lang="en"
              leadData={{ fullName: '', email: '', phone: '', ...address }}
              measurement={measurement}
              selections={selections}
              onStartOver={handleStartOver}
              onLeadCapture={handleLeadCapture}
            />
          )}
        </div>
      </div>
    </div>
  );
}
