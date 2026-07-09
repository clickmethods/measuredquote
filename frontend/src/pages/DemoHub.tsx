import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { allTradeConfigs } from '@/data/tradeConfigs';

export default function DemoHub() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    if (heroRef.current) {
      const children = heroRef.current.children;
      Array.from(children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = i < 2 ? 'translateY(30px)' : 'translateY(50px)';
        requestAnimationFrame(() => {
          el.style.transition = `opacity ${500 + i * 100}ms ease-out ${i * 150}ms, transform ${500 + i * 100}ms ease-out ${i * 150}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    }

    // Grid card stagger
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.trade-card');
      cards.forEach((card, i) => {
        const el = card as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        requestAnimationFrame(() => {
          el.style.transition = `opacity 600ms ease-out ${300 + i * 100}ms, transform 600ms ease-out ${300 + i * 100}ms`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    }
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Section 1: Hero */}
      <section className="bg-[#F8FAFC] pt-28 md:pt-32 pb-12 md:pb-16">
        <div ref={heroRef} className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold tracking-wider uppercase mb-4">
            LIVE DEMOS
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#0F172A] mb-4 leading-tight">
            Try Every Estimator Type
          </h1>
          <p className="text-[#475569] text-base md:text-lg max-w-[600px] mx-auto mb-8">
            See how homeowners experience your branded estimation widget. Select a trade below to launch the full interactive demo.
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-8 md:gap-12">
            <div>
              <span className="block text-3xl md:text-4xl font-semibold text-[#2563EB] font-mono">6</span>
              <span className="text-xs text-[#64748B] uppercase tracking-wide">Trade Types</span>
            </div>
            <div className="w-px h-10 bg-[#CBD5E1]" />
            <div>
              <span className="block text-3xl md:text-4xl font-semibold text-[#2563EB] font-mono">2</span>
              <span className="text-xs text-[#64748B] uppercase tracking-wide">Languages</span>
            </div>
            <div className="w-px h-10 bg-[#CBD5E1]" />
            <div>
              <span className="block text-3xl md:text-4xl font-semibold text-[#2563EB] font-mono">60s</span>
              <span className="text-xs text-[#64748B] uppercase tracking-wide">Avg. Completion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Trade Cards Grid */}
      <section className="bg-white pb-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {allTradeConfigs.map((trade) => (
              <Link
                key={trade.id}
                to={trade.route}
                className="trade-card group block rounded-[16px] border border-[#E2E8F0] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#BFDBFE]"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={trade.heroImage}
                    alt={trade.name}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.03]"
                  />
                  {/* Overlay badge */}
                  <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#0B1D3A]/80 text-white text-xs font-medium">
                    {trade.name}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5">
                    {trade.name}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mb-3 line-clamp-2">
                    {trade.pageDescription}
                  </p>
                  <div className="border-t border-[#F1F5F9] pt-3 flex items-center gap-4 mb-3">
                    <span className="text-sm font-mono font-medium text-[#334155]">
                      {trade.stats[0]?.value}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {trade.projectTypes
                        ? `${trade.projectTypes.length} project types`
                        : `${trade.materials.length} materials`}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {trade.addons.length} add-ons
                    </span>
                  </div>
                  <span className="inline-flex items-center text-sm font-semibold text-[#2563EB] group-hover:underline">
                    Launch Demo
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}

            {/* AI Receptionist Card */}
            <Link
              to="/demo/ai-receptionist"
              className="trade-card group block rounded-[16px] border border-[#E2E8F0] bg-gradient-to-br from-[#0B1D3A] to-[#1E293B] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#3B82F6]"
            >
              {/* Dark preview area */}
              <div className="relative aspect-video overflow-hidden bg-[#0B1D3A] flex items-center justify-center">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.sin(i * 1.2) * 12}px`,
                        background: i < 3 ? '#2563EB' : i < 5 ? '#3B82F6' : '#22C55E',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#2563EB]/20 text-[#93C5FD] text-xs font-medium border border-[#2563EB]/30">
                  AI-Powered
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  AI Receptionist
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-3 line-clamp-2">
                  24/7 AI-powered call answering. Never miss a lead. Simulated voice demo with lead capture.
                </p>
                <div className="border-t border-[#1E293B] pt-3 flex items-center gap-4 mb-3">
                  <span className="text-xs text-[#22C55E] font-medium">EN / ES</span>
                  <span className="text-xs text-[#64748B]">60-sec demo</span>
                  <span className="text-xs text-[#64748B]">Lead capture</span>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-[#60A5FA] group-hover:underline">
                  Try AI Demo
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="ml-1 transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: CTA Banner */}
      <section ref={ctaRef} className="bg-[#0B1D3A] py-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Want Your Own Branded Estimator?
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-[520px] mx-auto">
            Sign up in minutes, customize your pricing, and embed on your website today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex items-center rounded-full bg-[#16A34A] px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-[#15803D] hover:-translate-y-0.5"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="text-white/80 text-sm font-medium hover:text-white hover:underline transition-colors inline-flex items-center gap-1"
            >
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
