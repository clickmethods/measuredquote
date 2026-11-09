import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronDown, Sparkles, Lock, MessageSquare, Map, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

/* ─── Pilot plan ─── */
const PLAN = {
  name: 'Founding Pilot',
  price: 99,
  tagline: 'Everything in Measured Quote, one flat price.',
  features: [
    'Satellite draw-to-quote widget for your website (one-line embed)',
    'All 7 trades: concrete, asphalt, landscape & hardscape, decks, roofing, fencing, temp fence rental',
    'Instant price range free, itemized PDF estimate unlocked with name + phone',
    'Plain-English project summary on every estimate and PDF',
    'Lead inbox with status, notes and Won/Lost tracking',
    'Follow-up assistant: drafts a text or email when a lead goes quiet for 48 hours, in English or Spanish',
    'Price confidence score on every lead, so you know which ballparks need a site visit',
    'Voice site notes: dictate on site, auto-tagged for gates, footage, slope, HOA and permits',
    'Lead insights: close rate by material, top ZIP codes, money sitting in quiet leads',
    'Webhooks to Zapier, n8n or your CRM',
  ],
}

const PILOT_TERMS = [
  { icon: Lock, title: '$99/month, locked for 12 months', body: 'Founding pilot price. It will not go up on you during the first year.' },
  { icon: MessageSquare, title: 'Direct line to the builder', body: 'A 20-minute call at week 1 and week 4. Your feedback decides what ships next.' },
  { icon: Sparkles, title: '30 days free, no card', body: 'Use it on your real site with real leads. Subscribe only if it books you jobs.' },
]

const HOW = [
  { icon: Map, title: 'Homeowner draws the job', body: 'They outline the driveway, roof, fence line or patio on a satellite map of their own address.' },
  { icon: FileText, title: 'They get a price range instantly', body: 'Rough range free. Full itemized PDF after they leave a name and phone number.' },
  { icon: MessageSquare, title: 'You get a pre-measured lead', body: 'Address, measurements, materials and budget, before you ever drive out.' },
]

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'How does the free trial work?',
    answer:
      'You get 30 days free with no credit card. Embed the widget, collect real leads, and decide at the end of the trial whether to subscribe at $99/month.',
  },
  {
    question: 'Do I have to honor the instant price?',
    answer:
      'No. Homeowners see a range, labeled as an estimate, and every PDF says the final price is confirmed after a site visit. Each lead also shows a price confidence score so you know which ones are likely to move.',
  },
  {
    question: 'Whose rates does the widget use?',
    answer:
      'During the pilot, ranges are based on 2026 national installed-cost averages for each material. Custom rates per contractor are the first feature shipping in the pilot. We set yours with you on the week-1 call.',
  },
  {
    question: 'Which trades work best?',
    answer:
      'Fencing, asphalt driveways and paver patios measure very cleanly from satellite. Concrete, decks and roofs work too, but homeowners get a wider ballpark because slab prep, deck height and roof pitch are not visible from above.',
  },
  {
    question: 'Will it work on my website?',
    answer:
      'Yes. It is a single line of code that works on WordPress, Wix, Squarespace, GoDaddy, Webflow and custom sites. There is also a hosted page you can link from Google Business Profile or Facebook.',
  },
  {
    question: 'Is the "AI" actually AI?',
    answer:
      'Straight answer: follow-up drafts, confidence scores, voice note tagging and insights are rule-based logic over your own lead data. That keeps them instant, private and explainable. Voice dictation uses your browser’s speech recognition. We will add language-model drafting where pilot contractors tell us it helps.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. Month to month, no contract, cancel from the dashboard billing page.',
  },
]

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#E2E8F0]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-[#0F172A] pr-4">{item.question}</span>
        <ChevronDown
          size={18}
          className={'text-[#64748B] shrink-0 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}
        />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-[#475569]">{item.answer}</p>}
    </div>
  )
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function Pricing() {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <section className="pt-28 pb-12 px-6 lg:px-12">
        <div className="max-w-[880px] mx-auto text-center flex flex-col items-center">
          <motion.span
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB] bg-[#EFF6FF] rounded-full px-4 py-1.5 mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            Founding pilot · limited spots
          </motion.span>
          <motion.h1
            className="text-[36px] md:text-[48px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#0F172A] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            One plan. $99 a month.
          </motion.h1>
          <motion.p
            className="text-[16px] md:text-[18px] leading-[1.65] text-[#475569] max-w-[600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.15 }}
          >
            Every feature, every trade, no per-lead fees. Try it free for 30 days on your own website. No credit card.
          </motion.p>
        </div>
      </section>

      {/* Plan card */}
      <section className="pb-16 px-6 lg:px-12">
        <motion.div
          className="max-w-[720px] mx-auto bg-white rounded-2xl border-2 border-[#2563EB] shadow-xl p-8 lg:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-[24px] font-semibold text-[#0F172A]">{PLAN.name}</h2>
              <p className="text-sm text-[#64748B] mt-1">{PLAN.tagline}</p>
            </div>
            <div className="md:text-right">
              <div className="flex items-baseline gap-1 md:justify-end">
                <span className="text-[44px] font-semibold text-[#0F172A] tracking-[-0.02em]">${PLAN.price}</span>
                <span className="text-sm text-[#64748B]">/month</span>
              </div>
              <p className="text-xs text-[#15803D] font-medium">Price locked for 12 months</p>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-3.5 px-6 rounded-full text-sm font-medium bg-[#2563EB] text-white hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 mb-3"
          >
            Start 30-Day Free Trial
          </Link>
          <p className="text-center text-xs text-[#64748B] mb-8">No credit card required · Cancel anytime</p>

          <ul className="grid grid-cols-1 gap-3">
            {PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-[#334155]">
                <CheckCircle size={18} className="text-[#16A34A] mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Pilot terms */}
      <section className="pb-16 px-6 lg:px-12">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILOT_TERMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#2563EB]" />
              </div>
              <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">{title}</h3>
              <p className="text-sm leading-relaxed text-[#475569]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 lg:px-12 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[28px] font-semibold text-[#0F172A] text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW.map(({ icon: Icon, title, body }, i) => (
              <div key={title}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-[#0F172A] text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <Icon size={18} className="text-[#2563EB]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1.5">{title}</h3>
                <p className="text-sm leading-relaxed text-[#475569]">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/demo" className="text-sm font-medium text-[#2563EB] hover:underline">
              Try the live demo on any trade →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-[28px] font-semibold text-[#0F172A] text-center mb-8">Questions</h2>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] px-6">
            {faqs.map((f) => (
              <FaqRow key={f.question} item={f} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="max-w-[880px] mx-auto rounded-2xl bg-[#0F172A] text-white p-10 text-center">
          <h2 className="text-[26px] md:text-[32px] font-semibold mb-3">Put an instant quote on your site this week</h2>
          <p className="text-sm text-white/70 mb-6">30 days free. $99/month after that, locked for a year.</p>
          <Link
            to="/login"
            className="inline-block py-3.5 px-8 rounded-full text-sm font-medium bg-white text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  )
}
