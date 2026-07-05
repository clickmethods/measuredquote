// ═══════════════════════════════════════════════════════════════
// Shared estimate calculation — single source of truth used by
// the results screen AND the lead submission payload, so the
// price stored in Supabase always matches what the homeowner saw.
// Mirrors the logic previously inlined in EstimatorStepResults.
// ═══════════════════════════════════════════════════════════════

import type { TradeConfig } from '@/data/tradeConfigs';
import type { MaterialSelections } from '@/components/estimator/EstimatorStepMaterials';

export interface EstimateLineItem {
  label: string;
  labelEs: string;
  amountLow: number;
  amountHigh: number;
}

export interface EstimateResult {
  materialName: string;
  materialNameEs: string;
  materialId: string;
  lineItems: EstimateLineItem[];
  totalLow: number;
  totalHigh: number;
}

export function computeEstimate(
  trade: TradeConfig,
  selections: MaterialSelections,
  measurement: number,
): EstimateResult {
  let materialName = '';
  let materialNameEs = '';
  let materialId = selections.materialId || selections.projectTypeId || '';
  let basePriceLow = 0;
  let basePriceHigh = 0;

  if (trade.projectTypes && selections.projectTypeId) {
    const pt = trade.projectTypes.find((p) => p.id === selections.projectTypeId);
    if (pt) {
      materialName = pt.name;
      materialNameEs = pt.nameEs;
      basePriceLow = pt.priceLow;
      basePriceHigh = pt.priceHigh;
      if (selections.subOptionId) {
        const so = pt.subOptions.find((s) => s.id === selections.subOptionId);
        if (so) {
          basePriceLow += so.priceLow;
          basePriceHigh += so.priceHigh;
          materialName += ` (${so.name})`;
          materialNameEs += ` (${so.nameEs})`;
          materialId = `${pt.id}/${so.id}`;
        }
      }
    }
  } else if (selections.materialId) {
    const mat = trade.materials.find((m) => m.id === selections.materialId);
    if (mat) {
      materialName = mat.name;
      materialNameEs = mat.nameEs;
      basePriceLow = mat.priceLow;
      basePriceHigh = mat.priceHigh;
    }
  }

  let heightMultiplier = 1;
  if (trade.heightOptions && selections.heightValue) {
    const ho = trade.heightOptions.find((h) => h.value === selections.heightValue);
    if (ho) heightMultiplier = ho.multiplier;
  }

  const lineItems: EstimateLineItem[] = [
    {
      label: materialName,
      labelEs: materialNameEs,
      amountLow: Math.round(basePriceLow * heightMultiplier * measurement),
      amountHigh: Math.round(basePriceHigh * heightMultiplier * measurement),
    },
  ];

  selections.addonIds.forEach((aid) => {
    const a = trade.addons.find((x) => x.id === aid);
    if (!a) return;
    const qty = selections.addonQuantities[aid] ?? 1;
    const isPerMeasurement = a.unit === 'sqft' || a.unit === 'linear';
    const isPerCount = a.unit === 'per-fixture' || a.unit === 'per-step' || a.unit === 'per-gate';
    lineItems.push({
      label: a.name,
      labelEs: a.nameEs,
      amountLow: Math.round(
        isPerMeasurement ? a.priceLow * measurement * heightMultiplier : isPerCount ? a.priceLow * qty : a.priceLow,
      ),
      amountHigh: Math.round(
        isPerMeasurement ? a.priceHigh * measurement * heightMultiplier : isPerCount ? a.priceHigh * qty : a.priceHigh,
      ),
    });
  });

  return {
    materialName,
    materialNameEs,
    materialId,
    lineItems,
    totalLow: lineItems.reduce((s, i) => s + i.amountLow, 0),
    totalHigh: lineItems.reduce((s, i) => s + i.amountHigh, 0),
  };
}
