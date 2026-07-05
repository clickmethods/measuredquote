import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Check,
  ChevronDown,
  Minus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ─── Types ─── */
type BillingPeriod = 'monthly' | 'annual'

interface PricingTier {
  name: string
  tagline: string
  monthlyPrice: number
  annualPrice: number
  annualBillingTotal: string
  highlighted: boolean
  features: string[]
  ctaVariant: 'primary' | 'secondary'
}

interface FaqItem {
  question: string
  answer: string
}

/* ─── Data ─── */
const tiers: PricingTier[] = [
  {
    name: 'Solo Pro',
    tagline: 'Perfect for independent contractors',
    monthlyPrice: 49,
    annualPrice: 39,
    annualBillingTotal: '$468 billed annually',
    highlighted: false,
    features: [
      '1 trade type',
      '50 leads/month',
      'Basic widget customization',
      'Email notifications',
      'PDF estimates',
      'Google Maps integration',
    ],
    ctaVariant: 'secondary',
  },
  {
    name: 'Contractor Pro',
    tagline: 'For growing contractor businesses',
    monthlyPrice: 99,
    annualPrice: 79,
    annualBillingTotal: '$948 billed annually',
    highlighted: true,
    features: [
      '6 trade types',
      'Unlimited leads',
      'Advanced widget customization',
      'SMS + Email notifications',
      'CRM webhooks (Zapier, n8n)',
      'Priority support',
      'Analytics dashboard',
    ],
    ctaVariant: 'primary',
  },
  {
    name: 'Ultimate Pro',
    tagline: 'For multi-crew operations',
    monthlyPrice: 199,
    annualPrice: 159,
    annualBillingTotal: '$1,908 billed annually',
    highlighted: false,
    features: [
      'Unlimited trade types + custom',
      'AI receptionist',
      'Voice-to-estimate',
      'Photo takeoff AI',
      'Stripe payments',
      'Team accounts (5 users)',
      'White-label PDFs',
      'Dedicated account manager',
    ],
    ctaVariant: 'secondary',
  },
]

const faqs: FaqItem[] = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, every plan includes a 14-day free trial. No credit card required.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade at any time. Prorated charges apply.',
  },
  {
    question: 'What happens when I hit my lead limit?',
    answer:
      'On Solo Pro, new leads are held for 48 hours. Upgrade to unlock instantly. Higher plans have no limits.',
  },
  {
    question: 'Do I need a Google Maps API key?',
    answer:
      'We include Google Maps usage up to 1,000 map loads/month. Beyond that, you can add your own API key.',
  },
  {
    question: 'Can I use this on multiple websites?',
    answer:
      'Yes, your embed code works on unlimited websites. Leads are tagged by source URL.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No long-term contracts. Month-to-month billing. Annual plans save 20%.',
  },
  {
    question: 'What languages does the widget support?',
    answer:
      'English and Spanish. The homeowner selects their language at the start of every estimate.',
  },
]

/* ─── Comparison table data ─── */
interface ComparisonRow {
  feature: string
  solo: React.ReactNode
  contractor: React.ReactNode
  ultimate: React.ReactNode
}

const comparisonData: { category: string; rows: ComparisonRow[] }[] = [
  {
    category: 'Widget',
    rows: [
      {
        feature: 'Trade types',
        solo: '1',
        contractor: '6',
        ultimate: 'Unlimited + Custom',
      },
      {
        feature: 'Leads per month',
        solo: '50',
        contractor: 'Unlimited',
        ultimate: 'Unlimited',
      },
      {
        feature: 'Languages',
        solo: 'EN + ES',
        contractor: 'EN + ES',
        ultimate: 'EN + ES',
      },
      {
        feature: 'Embed code',
        solo: <CheckIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
    ],
  },
  {
    category: 'Notifications',
    rows: [
      {
        feature: 'Email alerts',
        solo: <CheckIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'SMS alerts',
        solo: <DashIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'Webhook pushes',
        solo: <DashIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'CRM integrations',
        solo: <DashIcon />,
        contractor: 'Zapier + n8n',
        ultimate: 'Zapier + n8n + API',
      },
    ],
  },
  {
    category: 'Estimating',
    rows: [
      {
        feature: 'Google Maps',
        solo: <CheckIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'PDF export',
        solo: <CheckIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'Ballpark calculator',
        solo: <CheckIcon />,
        contractor: <CheckIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'AI receptionist',
        solo: <DashIcon />,
        contractor: <DashIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'Voice-to-estimate',
        solo: <DashIcon />,
        contractor: <DashIcon />,
        ultimate: <CheckIcon />,
      },
      {
        feature: 'Photo takeoff',
        solo: <DashIcon />,
        contractor: <DashIcon />,
        ultimate: <CheckIcon />,
      },
    ],
  },
  {
    category: 'Business',
    rows: [
      {
        feature: 'Analytics',
        solo: 'Basic',
        contractor: 'Advanced',
        ultimate: 'Advanced',
      },
      {
        feature: 'Team seats',
        solo: '1',
        contractor: '1',
        ultimate: '5',
      },
      {
        feature: 'Custom branding',
        solo: 'Basic',
        contractor: 'Advanced',
        ultimate: 'White-label',
      },
      {
        feature: 'Support',
        solo: 'Email',
        contractor: 'Priority',
        ultimate: 'Dedicated',
      },
    ],
  },
]

/* ─── Shared icon helpers ─── */
function CheckIcon() {
  return (
    <span className="inline-flex items-center justify-center">
      <Check size={18} className="text-[#16A34A]" strokeWidth={2.5} />
    </span>
  )
}

function DashIcon() {
  return (
    <span className="inline-flex items-center justify-center">
      <Minus size={18} className="text-[#CBD5E1]" strokeWidth={2} />
    </span>
  )
}

/* ─── Animation variants ─── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

/* ─── Main component ─── */
export default function Pricing() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="bg-[#F8FAFC]">
      {/* ── Section 1: Hero ── */}
      <section className="pt-32 md:pt-36 pb-16 px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.span
            className="text-xs font-medium tracking-[0.01em] text-[#2563EB] uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            PRICING
          </motion.span>

          {/* Headline */}
          <motion.h1
            className="text-[36px] md:text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#0F172A] mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            Simple, transparent pricing
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-[16px] md:text-[18px] font-normal leading-[1.65] text-[#475569] max-w-[560px] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 }}
          >
            Start free. Scale as your business grows. No credit card required.
          </motion.p>

          {/* Monthly / Annual toggle */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
          >
            <span
              className={
                'text-sm font-medium transition-colors duration-150 ' +
                (billing === 'monthly' ? 'text-[#0F172A]' : 'text-[#94A3B8]')
              }
            >
              Monthly
            </span>

            {/* Toggle switch */}
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-[52px] h-[28px] rounded-full bg-[#CBD5E1] transition-colors duration-200 focus:outline-none"
              style={{ backgroundColor: billing === 'annual' ? '#2563EB' : '#CBD5E1' }}
              aria-label="Toggle billing period"
            >
              <span
                className="absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform duration-200 ease-out"
                style={{
                  transform: billing === 'annual' ? 'translateX(24px)' : 'translateX(0)',
                }}
              />
            </button>

            <span
              className={
                'text-sm font-medium transition-colors duration-150 ' +
                (billing === 'annual' ? 'text-[#0F172A]' : 'text-[#94A3B8]')
              }
            >
              Annual
            </span>

            {/* Save 20% badge */}
            {billing === 'annual' && (
              <span className="ml-1 text-xs font-medium text-[#15803D] bg-[#DCFCE7] rounded-full px-3 py-1">
                Save 20%
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Pricing Cards ── */}
      <section className="pb-16 px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={cardVariant}
                className={
                  'relative flex flex-col bg-white rounded-2xl p-6 lg:p-8 transition-all duration-300 ease-out ' +
                  (tier.highlighted
                    ? 'border-2 border-[#2563EB] shadow-xl md:-translate-y-2 ' 
                    : 'border border-[#E2E8F0] shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-[#BFDBFE] ')
                }
              >
                {/* Most Popular badge */}
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-white bg-[#16A34A] rounded-full px-4 py-1.5 shadow-sm">
                    Most Popular
                  </span>
                )}

                {/* Plan name */}
                <h3 className="text-[22px] font-semibold text-[#0F172A] mt-2 mb-1">
                  {tier.name}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-[#64748B] mb-4">{tier.tagline}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-semibold text-[#0F172A] tracking-[-0.02em]">
                      ${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                    </span>
                    <span className="text-sm text-[#64748B]">/month</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-xs text-[#64748B] mt-1">
                      {tier.annualBillingTotal}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/dashboard"
                  className={
                    'w-full text-center py-3 px-6 rounded-full text-sm font-medium transition-all duration-200 mb-6 ' +
                    (tier.ctaVariant === 'primary'
                      ? 'bg-[#2563EB] text-white hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg '
                      : 'bg-transparent text-[#2563EB] border-[1.5px] border-[#2563EB] hover:bg-[#EFF6FF] ')
                  }
                >
                  Start Free Trial
                </Link>

                {/* Features list */}
                <ul className="flex flex-col gap-3 mt-auto">
                  {tier.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-[#334155]">
                      <CheckCircle
                        size={18}
                        className="text-[#16A34A] mt-0.5 shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* All plans include note */}
          <motion.p
            className="text-center text-xs text-[#64748B] mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            All plans include: SSL security &bull; Daily backups &bull; 99.9% uptime &bull; Free updates
          </motion.p>
        </div>
      </section>

      {/* ── Section 3: Feature Comparison Table ── */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <motion.h3
            className="text-[28px] font-semibold text-[#0F172A] text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            Compare All Features
          </motion.h3>

          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <table className="w-full min-w-[640px] border-collapse">
              {/* Header */}
              <thead>
                <tr className="bg-[#F1F5F9] sticky top-0">
                  <th className="text-left text-sm font-medium text-[#334155] px-4 py-3 rounded-tl-lg w-[35%]">
                    Feature
                  </th>
                  <th className="text-center text-sm font-semibold text-[#0F172A] px-4 py-3 w-[21.6%]">
                    Solo Pro
                  </th>
                  <th className="text-center text-sm font-semibold text-[#0F172A] px-4 py-3 w-[21.6%]">
                    Contractor Pro
                  </th>
                  <th className="text-center text-sm font-semibold text-[#0F172A] px-4 py-3 rounded-tr-lg w-[21.6%]">
                    Ultimate Pro
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparisonData.map((group, gi) => (
                  <GroupRows key={gi} group={group} groupIndex={gi} />
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── Section 4: FAQ Accordion ── */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-[640px] mx-auto">
          <motion.h2
            className="text-[28px] md:text-[36px] font-bold text-[#0F172A] text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[#E2E8F0]"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-4 text-left group"
                  aria-expanded={openFaq === index}
                >
                  <span className="text-[16px] md:text-[18px] font-semibold text-[#0F172A] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={
                      'text-[#64748B] shrink-0 transition-transform duration-300 ease-out ' +
                      (openFaq === index ? 'rotate-180' : '')
                    }
                  />
                </button>
                <div
                  className={
                    'overflow-hidden transition-all duration-300 ease-out ' +
                    (openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')
                  }
                >
                  <p className="text-[14px] md:text-[16px] text-[#475569] leading-[1.6] pb-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 5: Final CTA ── */}
      <section
        className="py-20 px-6 lg:px-12"
        style={{
          background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)',
        }}
      >
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
          <motion.h2
            className="text-[28px] md:text-[36px] font-bold text-white mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            Start converting visitors into qualified leads today
          </motion.h2>

          <motion.p
            className="text-[16px] md:text-[18px] text-white/70 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
          >
            14-day free trial. No credit card required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-white text-[#2563EB] px-8 py-4 text-base font-semibold transition-all duration-200 hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

/* ─── Sub-component: comparison group rows ─── */
function GroupRows({
  group,
  groupIndex,
}: {
  group: { category: string; rows: ComparisonRow[] }
  groupIndex: number
}) {
  return (
    <>
      {/* Category header */}
      <tr className="bg-[#F8FAFC]">
        <td
          colSpan={4}
          className="text-xs font-semibold text-[#475569] uppercase tracking-wider px-4 py-2.5"
        >
          {group.category}
        </td>
      </tr>
      {group.rows.map((row, ri) => (
        <tr
          key={ri}
          className={
            'transition-colors duration-150 ' +
            ((groupIndex + ri) % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]')
          }
        >
          <td className="text-sm text-[#334155] px-4 py-3">{row.feature}</td>
          <td className="text-sm text-[#334155] text-center px-4 py-3">
            {row.solo}
          </td>
          <td className="text-sm text-[#334155] text-center px-4 py-3">
            {row.contractor}
          </td>
          <td className="text-sm text-[#334155] text-center px-4 py-3">
            {row.ultimate}
          </td>
        </tr>
      ))}
    </>
  )
}
