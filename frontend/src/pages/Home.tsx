import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Code, Users, TrendingUp, CheckCircle, ChevronRight,
  Star, ArrowRight
} from 'lucide-react'

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (d: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  })
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (d: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: d, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  })
}

/* ─── Section 1: Hero ─── */
function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setTimeout(() => setLoaded(true), 50) }, [])

  return (
    <section
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-800"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          opacity: loaded ? 1 : 0,
        }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(11,29,58,0.92) 0%, rgba(20,44,77,0.88) 50%, rgba(15,23,42,0.85) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[800px] px-6 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-4 py-1.5"
        >
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          <span className="text-sm font-medium text-[#15803D]">Now Serving 6 Trades</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-[64px]"
        >
          Turn Your Website Into a{' '}
          <span className="text-[#60A5FA]">Lead-Generating Machine</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-white/75"
        >
          Draw-to-Quote embeds on any contractor website. Homeowners get instant ballpark prices.
          You get qualified leads with full project scope, budget, and contact details.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={loaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full bg-[#16A34A] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#15803D] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Free 14-Day Trial
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center rounded-full border-[1.5px] border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            See Live Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <img
                key={i}
                src={`/contractor-portrait-${i}.jpg`}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-white/30 object-cover"
              />
            ))}
          </div>
          <span className="text-xs font-medium text-white/50 tracking-wide">
            Trusted by 500+ contractors nationwide
          </span>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 2: Logo Marquee ─── */
function MarqueeSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' })
  const platforms = ['WordPress', 'Wix', 'Squarespace', 'Webflow', 'GoDaddy', 'Weebly', 'Custom HTML']

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeIn}
      className="overflow-hidden bg-[#F8FAFC] py-12 border-b border-[#E2E8F0]"
    >
      <p className="text-center text-sm text-[#64748B] mb-6">
        Works with any website builder
      </p>
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...platforms, ...platforms, ...platforms, ...platforms].map((p, i) => (
            <span
              key={i}
              className="mx-3 inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#475569]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ─── Section 3: How It Works ─── */
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const steps = [
    {
      num: '01',
      title: 'Embed the Widget',
      body: 'Copy one line of code to your website. Works on WordPress, Wix, Squarespace, or any custom site.',
      icon: <Code className="h-6 w-6 text-white" />,
      bg: 'bg-[#2563EB]',
    },
    {
      num: '02',
      title: 'Capture Qualified Leads',
      body: 'Homeowners enter their details, draw their project on a satellite map, and select materials. Every submission is a warm lead with full scope.',
      icon: <Users className="h-6 w-6 text-white" />,
      bg: 'bg-[#16A34A]',
    },
    {
      num: '03',
      title: 'Close More Deals',
      body: 'Review leads in your dashboard, follow up with precise estimates, and watch your conversion rate climb. Average contractors see 3x more booked jobs.',
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      bg: 'bg-[#F59E0B]',
    },
  ]

  return (
    <section ref={ref} id="features" className="bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Header */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#2563EB]"
        >
          How It Works
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="text-center text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl"
        >
          From Website Visit to Qualified Lead in 60 Seconds
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className="mx-auto mt-4 max-w-[600px] text-center text-base text-[#475569]"
        >
          Homeowners answer a few questions, draw their project area, and get an instant estimate — while you capture their contact info and project scope.
        </motion.p>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.3 + i * 0.15}
              className="relative rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-md transition-all hover:shadow-lg"
            >
              <span className="absolute right-4 top-4 rounded-md bg-[#DBEAFE] px-2 py-1 font-mono text-xs font-medium text-[#2563EB]">
                {s.num}
              </span>
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${s.bg}`}>
                {s.icon}
              </div>
              <h4 className="text-lg font-semibold text-[#0F172A] mb-2">{s.title}</h4>
              <p className="text-sm leading-relaxed text-[#475569]">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 4: Feature Showcase ─── */
function FeatureSection() {
  const ref = useRef(null)
  useInView(ref, { once: true, margin: '-10% 0px' })

  const features = [
    {
      tag: 'ESTIMATES',
      tagBg: 'bg-[#DBEAFE]',
      tagColor: 'text-[#2563EB]',
      title: 'Homeowners Get Instant Ballpark Prices',
      body: 'Your pricing rules, your markup, your materials. The widget calculates a realistic price range based on square footage, material choices, and add-ons. Homeowners see a professional low-high range, not a single number.',
      img: '/feature-estimate.jpg',
      checks: [
        'Custom pricing per trade and material',
        'Automatic markup multiplier applied',
        'Low/high range builds trust (no sticker shock)',
        'Line-item breakdown in the results',
      ],
      imgLeft: true,
    },
    {
      tag: 'MEASUREMENT',
      tagBg: 'bg-[#DCFCE7]',
      tagColor: 'text-[#16A34A]',
      title: 'Draw Project Areas on Satellite Maps',
      body: 'Homeowners search their address, and Google Maps loads a satellite view. They draw polygons for area-based projects (driveways, decks) or polylines for linear projects (fences). Square footage and linear feet calculate automatically.',
      img: '/feature-map.jpg',
      checks: [
        'Google Maps satellite imagery',
        'Polygon tool for area measurements',
        'Polyline tool for linear measurements',
        'Auto-calculated sq ft / linear ft',
      ],
      imgLeft: false,
    },
    {
      tag: 'DASHBOARD',
      tagBg: 'bg-[#FEF3C7]',
      tagColor: 'text-[#D97706]',
      title: 'Every Lead, Organized and Actionable',
      body: 'Your dashboard shows every homeowner submission with name, email, phone, address, project type, measurements, material selections, estimated budget range, and submission timestamp. Export, filter, and follow up.',
      img: '/feature-leads.jpg',
      checks: [
        'Full contact details and project scope',
        'Filter by trade, date, or status',
        'Export leads to CSV',
        'Built-in follow-up reminders',
      ],
      imgLeft: true,
    },
  ]

  return (
    <section ref={ref} className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {features.map((f) => {
          const imgRef = useRef(null)
          const imgInView = useInView(imgRef, { once: true, margin: '-10% 0px' })

          return (
            <div
              key={f.tag}
              className={`flex flex-col ${f.imgLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 mb-20 last:mb-0`}
            >
              {/* Image */}
              <motion.div
                ref={imgRef}
                initial={{ opacity: 0, x: f.imgLeft ? -60 : 60 }}
                animate={imgInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="flex-1"
              >
                <img
                  src={f.img}
                  alt={f.title}
                  className="rounded-2xl shadow-lg w-full object-cover"
                />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={imgInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="flex-1"
              >
                <span className={`mb-3 inline-block rounded-full ${f.tagBg} px-3 py-1 text-xs font-semibold tracking-wide ${f.tagColor}`}>
                  {f.tag}
                </span>
                <h3 className="text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl">
                  {f.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[#475569]">
                  {f.body}
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {f.checks.map((c, ci) => (
                    <motion.li
                      key={ci}
                      initial={{ opacity: 0, y: 20 }}
                      animate={imgInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + ci * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="flex items-center gap-3 text-sm text-[#475569]"
                    >
                      <CheckCircle className="h-5 w-5 shrink-0 text-[#16A34A]" />
                      {c}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Section 5: ROI Calculator ─── */
function ROICalculatorSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [visitors, setVisitors] = useState(500)
  const [rate, setRate] = useState(2)

  const currentLeads = Math.round(visitors * (rate / 100))
  const ezLeads = Math.round(visitors * 0.12)
  const additionalLeads = Math.max(0, ezLeads - currentLeads)
  const revenue = Math.round(additionalLeads * 0.2 * 8000)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16"
      style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #142C4D 100%)' }}
    >
      <div className="mx-auto max-w-[960px] px-6 lg:px-12">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#93C5FD]"
        >
          The Math Is Simple
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl md:text-4xl"
        >
          What&apos;s Your Current Close Rate Costing You?
        </motion.h2>

        {/* Inputs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <div className="flex-1 max-w-[360px]">
            <label className="block mb-2 text-sm font-medium text-[#93C5FD]">
              Monthly website visitors
            </label>
            <input
              type="number"
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
              className="w-full rounded-md bg-[#0F172A] border border-[#1E293B] px-4 py-3 text-white text-lg focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div className="flex-1 max-w-[360px]">
            <label className="block mb-2 text-sm font-medium text-[#93C5FD]">
              Current lead capture rate
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full rounded-md bg-[#0F172A] border border-[#1E293B] px-4 py-3 pr-8 text-white text-lg focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">%</span>
            </div>
          </div>
        </motion.div>

        {/* Result card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mt-8 rounded-2xl bg-white/5 p-8 text-center border border-white/10"
        >
          <p className="text-sm text-[#93C5FD]">With Draw-to-Quote at 12% capture rate:</p>
          <p className="mt-3 font-mono text-3xl font-semibold text-[#4ADE80]">
            {ezLeads} leads/month
          </p>
          <p className="mt-1 text-sm text-white/50">
            vs. your current {currentLeads} leads/month
          </p>
          <p className="mt-6 text-xl font-semibold text-white">
            That&apos;s {additionalLeads} additional qualified leads every month
          </p>
          <p className="mt-2 text-base text-white/70">
            At a 20% close rate &times; $8,000 avg. job ={' '}
            <span className="font-mono font-semibold text-[#4ADE80]">
              ${revenue.toLocaleString()}
            </span>{' '}
            more monthly revenue
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Section 6: Trade Coverage ─── */
function TradeCoverageSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const trades = [
    { name: 'Concrete Driveway', img: '/concrete-hero.jpg', desc: 'Stamped, broom, and exposed aggregate driveways with reinforcement options.', path: '/demo/concrete', icon: '🚧' },
    { name: 'Asphalt Paving', img: '/asphalt-hero.jpg', desc: 'Hot mix asphalt with sealcoating, crack repair, and line striping.', path: '/demo/asphalt', icon: '🛣️' },
    { name: 'Landscape', img: '/landscape-hero.jpg', desc: 'Sod, pavers, mulch, and full yard transformations.', path: '/demo/landscape', icon: '🌿' },
    { name: 'Decks', img: '/deck-hero.jpg', desc: 'Pressure-treated, cedar, composite, and Ipe with railing options.', path: '/demo/decks', icon: '🏠' },
    { name: 'Roofing', img: '/roofing-hero.jpg', desc: 'Shingle, metal, and standing seam with tear-off and underlayment.', path: '/demo/roofing', icon: '🏡' },
    { name: 'Fencing', img: '/fencing-hero.jpg', desc: 'Wood and vinyl privacy fencing with walk and drive gates.', path: '/demo/fencing', icon: '🚧' },
  ]

  return (
    <section ref={ref} className="bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#2563EB]"
        >
          6 Trades, One Platform
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="text-center text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl"
        >
          Cover Every Major Exterior Project Type
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className="mx-auto mt-4 max-w-[550px] text-center text-base text-[#475569]"
        >
          Each trade has its own material options, add-ons, and pricing rules — fully customizable in your dashboard.
        </motion.p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trades.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.3 + i * 0.1}
              className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#BFDBFE] hover:shadow-glow-blue"
            >
              <div className="h-[180px] w-full overflow-hidden">
                <img
                  src={t.img}
                  alt={t.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h4 className="text-lg font-semibold text-[#0F172A]">{t.name}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-[#475569] line-clamp-2">
                  {t.desc}
                </p>
                <Link
                  to={t.path}
                  className="mt-3 inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Try Demo
                  <ChevronRight className="ml-0.5 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 7: Testimonials ─── */
function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const testimonials = [
    {
      quote: "I was losing leads to sticker shock. Now homeowners see a range upfront and call me already knowing the ballpark. My close rate went from 15% to 35%.",
      name: 'Mike Castellano',
      company: 'Castellano Concrete, NJ',
      img: '/contractor-portrait-1.jpg',
    },
    {
      quote: "The Spanish language option alone brought me 8 new jobs last month. My Hispanic customers love being able to estimate in their own language.",
      name: 'Sarah Mendez',
      company: 'GreenScape Landscaping, TX',
      img: '/contractor-portrait-2.jpg',
    },
    {
      quote: "I embedded the widget on my WordPress site in under 5 minutes. The leads started coming in the next day. Best ROI I've ever had on any marketing tool.",
      name: 'Jim Halverson',
      company: 'Halverson Roofing, MN',
      img: '/contractor-portrait-3.jpg',
    },
  ]

  return (
    <section ref={ref} className="bg-[#F8FAFC] py-20 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#2563EB]"
        >
          Contractor Stories
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="mb-14 text-center text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl"
        >
          Built by Contractors, for Contractors
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.2 + i * 0.15}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-md"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>

              <p className="text-base leading-relaxed text-[#334155] italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{t.name}</p>
                  <p className="text-xs text-[#64748B]">{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Section 8: Pricing Preview ─── */
function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const plans = [
    {
      name: 'Solo Pro',
      price: '$49',
      desc: 'Perfect for independent contractors',
      features: [
        '1 trade type',
        'Up to 50 leads/month',
        'Basic pricing editor',
        'Email notifications',
        'English & Spanish widget',
      ],
      highlighted: false,
    },
    {
      name: 'Contractor Pro',
      price: '$99',
      desc: 'For growing contractors with multiple trades',
      features: [
        '3 trade types',
        'Unlimited leads',
        'Advanced pricing rules',
        'Lead export (CSV)',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      name: 'Ultimate Pro',
      price: '$199',
      desc: 'For multi-crew operations',
      features: [
        'All 6 trade types',
        'Custom branding (logo, colors)',
        'Team member access (5 seats)',
        'API access',
        'White-label option',
      ],
      highlighted: false,
    },
  ]

  return (
    <section ref={ref} className="bg-white py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#2563EB]"
        >
          Simple Pricing
        </motion.p>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="text-center text-2xl font-bold text-[#0F172A] sm:text-3xl md:text-4xl"
        >
          Start Free. Scale as You Grow.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className="mx-auto mt-4 text-center text-base text-[#475569]"
        >
          14-day free trial on every plan. No credit card required. Cancel anytime.
        </motion.p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.3 + i * 0.12}
              className={`relative rounded-2xl border ${p.highlighted ? 'border-[#3B82F6] shadow-glow-blue' : 'border-[#E2E8F0] shadow-md'} bg-white p-8`}
            >
              {/* Badge */}
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-[#0F172A]">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-semibold text-[#0F172A]">{p.price}</span>
                <span className="text-sm text-[#64748B]">/month</span>
              </div>
              <p className="mt-2 text-sm text-[#475569]">{p.desc}</p>

              <ul className="mt-6 flex flex-col gap-3">
                {p.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm text-[#334155]">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/dashboard"
                className={`mt-8 block w-full rounded-md py-3 text-center text-sm font-semibold transition-all duration-200 ${p.highlighted ? 'bg-[#2563EB] text-white hover:bg-[#1A3A6B]' : 'border-[1.5px] border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]'}`}
              >
                Start Free Trial
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[#2563EB]">
          Need a custom plan for your enterprise?{' '}
          <Link to="#" className="font-medium hover:underline">
            Contact us &rarr;
          </Link>
        </p>
      </div>
    </section>
  )
}

/* ─── Section 9: Final CTA ─── */
function FinalCTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24"
      style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #142C4D 40%, #1E293B 100%)' }}
    >
      <div className="relative z-10 mx-auto max-w-[700px] px-6 text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="text-3xl font-bold text-white sm:text-4xl md:text-5xl"
        >
          Ready to Turn Estimates Into Revenue?
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className="mx-auto mt-5 max-w-[560px] text-lg leading-relaxed text-white/70"
        >
          Join 500+ contractors already using Draw-to-Quote to capture and convert more leads.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.4}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-full bg-[#16A34A] px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#15803D] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Your Free 14-Day Trial
          </Link>
          <Link
            to="#"
            className="inline-flex items-center rounded-full border-[1.5px] border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            Schedule a Demo Call
          </Link>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.6}
          className="mt-6 text-xs font-medium text-white/40 tracking-wide"
        >
          No credit card required &bull; Cancel anytime &bull; Setup in 5 minutes
        </motion.p>
      </div>
    </section>
  )
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <MarqueeSection />
      <HowItWorksSection />
      <FeatureSection />
      <ROICalculatorSection />
      <TradeCoverageSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTASection />
    </div>
  )
}
