import { useEffect, useRef } from 'react';
import EstimatorWidget from '@/components/estimator/EstimatorWidget';
import { getEmbedContext, notifyResize } from '@/lib/mq';
import { getTradeConfig } from '@/data/tradeConfigs';

/**
 * Bare estimator page rendered inside the /widget/v1/widget.js iframe.
 * No navbar/footer. Reads tenant/trade/lang from the hash query and
 * reports its height to the parent loader via postMessage.
 */
export default function EmbedPage() {
  const ctx = getEmbedContext();
  const trade = getTradeConfig(ctx.trade || 'concrete');
  const wrapRef = useRef<HTMLDivElement>(null);

  // Auto-resize reporting to the parent loader.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const report = () => notifyResize(el.scrollHeight + 32);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!trade) {
    return (
      <div className="p-8 text-center text-sm text-[#64748B]">
        Unknown estimator type. Check the <code>data-mq-trade</code> value on your embed snippet.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="min-h-screen bg-[#F8FAFC] py-6 px-3 sm:px-6">
      <EstimatorWidget trade={trade} tenant={ctx.tenant} widgetToken={ctx.token} />
    </div>
  );
}
