import { Link } from 'react-router-dom';
import type { TradeConfig } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import EstimatorWidget from './EstimatorWidget';
import Footer from '@/components/Footer';

interface Props {
  trade: TradeConfig;
  lang: Language;
}

export default function TradeEstimatorPage({ trade, lang }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Section 1: Trade Hero */}
      <section className="bg-[#F8FAFC] pt-28 md:pt-32 pb-10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <p className="text-xs text-[#64748B] mb-3">
            <Link to="/demo" className="hover:text-[#2563EB] transition-colors">Demo</Link>
            <span className="mx-2">/</span>
            <span>{trade.breadcrumb}</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#0F172A] mb-3">{trade.pageTitle}</h1>
          <p className="text-[#475569] text-base md:text-lg max-w-[640px] mb-4">{trade.pageDescription}</p>
          <div className="flex flex-wrap items-center gap-8">
            {trade.stats.map((stat, idx) => (
              <div key={idx}>
                <span className={idx === 0 ? 'text-lg font-mono font-medium text-[#2563EB]' : 'text-sm text-[#334155]'}>
                  {stat.value}
                </span>
                <span className="text-xs text-[#64748B] ml-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Estimator Widget */}
      <section className="bg-white pb-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <EstimatorWidget trade={trade} />
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="bg-white py-16 border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
            How the {trade.name} Estimator Works
          </h2>
          <p className="text-[#475569] text-base mb-8">
            This demo shows exactly what your customers will see when the widget is embedded on your website.
          </p>

          <div className="relative pl-8 border-l-2 border-[#BFDBFE]">
            {trade.howItWorksSteps.map((step, idx) => (
              <div key={idx} className="relative mb-8 last:mb-0">
                <div className="absolute -left-[41px] w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
                  {idx + 1}
                </div>
                <h4 className="text-lg font-semibold text-[#0F172A] mb-1">
                  {lang === 'es' ? step.titleEs : step.title}
                </h4>
                <p className="text-sm text-[#475569]">
                  {lang === 'es' ? step.descriptionEs : step.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/pricing"
            className="inline-flex items-center mt-8 bg-[#2563EB] text-white font-semibold text-sm py-3 px-6 rounded-full transition-all duration-200 hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Get This Widget for Your Website
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
