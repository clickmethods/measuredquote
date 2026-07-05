import { useEffect, useRef, useState } from 'react';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';

interface Props {
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
}

export default function EstimatorStepLanguage({ onSelectLanguage }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center py-6">
      <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
        {t('en', 'lang.title')}
      </h3>
      <p className="text-[#475569] text-sm mb-8">
        {t('en', 'lang.subtitle')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[480px]">
        {/* English */}
        <button
          onClick={() => onSelectLanguage('en')}
          onMouseEnter={() => setHovered('en')}
          onMouseLeave={() => setHovered(null)}
          className={
            'flex flex-col items-center p-6 rounded-[16px] border-2 cursor-pointer transition-all duration-200 ' +
            (hovered === 'en'
              ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_20px_rgba(37,99,235,0.15)]'
              : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:shadow-md')
          }
        >
          <span className="text-4xl mb-3">🇺🇸</span>
          <h4 className="text-lg font-semibold text-[#0F172A] mb-1">
            {t('en', 'lang.english')}
          </h4>
          <p className="text-sm text-[#64748B]">
            {t('en', 'lang.englishContinue')}
          </p>
        </button>

        {/* Spanish */}
        <button
          onClick={() => onSelectLanguage('es')}
          onMouseEnter={() => setHovered('es')}
          onMouseLeave={() => setHovered(null)}
          className={
            'flex flex-col items-center p-6 rounded-[16px] border-2 cursor-pointer transition-all duration-200 ' +
            (hovered === 'es'
              ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_20px_rgba(37,99,235,0.15)]'
              : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:shadow-md')
          }
        >
          <span className="text-4xl mb-3">🇲🇽</span>
          <h4 className="text-lg font-semibold text-[#0F172A] mb-1">
            {t('es', 'lang.spanish')}
          </h4>
          <p className="text-sm text-[#64748B]">
            {t('es', 'lang.spanishContinue')}
          </p>
        </button>
      </div>
    </div>
  );
}
