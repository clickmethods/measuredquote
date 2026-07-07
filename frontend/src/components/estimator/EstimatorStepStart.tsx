import { useEffect, useRef } from 'react';
import type { TradeConfig } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';

interface Props {
  trade: TradeConfig;
  lang: Language;
  onStart: () => void;
}

export default function EstimatorStepStart({ trade, lang, onStart }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(30px)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  const tradeName = lang === 'es' ? trade.nameEs : trade.name;

  return (
    <div ref={ref} className="flex flex-col items-center text-center py-8">
      <span className="inline-block px-4 py-1.5 rounded-full bg-[#DBEAFE] text-[#1A3A6B] text-xs font-medium mb-6">
        {t(lang, 'start.getStarted')}
      </span>

      <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
        {t(lang, 'start.headline').replace('{trade}', tradeName)}
      </h2>

      <p className="text-[#475569] text-base md:text-lg max-w-[480px] mb-2">
        {t(lang, 'start.description')}
      </p>

      <p className="text-[#94A3B8] text-sm mb-8">
        {t(lang, 'start.noObligation')}
      </p>

      <button
        onClick={onStart}
        className="w-full max-w-[320px] bg-[#2563EB] text-white font-semibold text-base py-3.5 px-8 rounded-full transition-all duration-200 hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg"
      >
        {t(lang, 'start.cta')}
      </button>

      <p className="text-[#94A3B8] text-xs mt-6 flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22C55E]">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        {t(lang, 'start.trust')}
      </p>
    </div>
  );
}
