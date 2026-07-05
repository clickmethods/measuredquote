import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'Demo', to: '/demo' },
  { label: 'Pricing', to: '/pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={
        'fixed top-0 left-0 right-0 z-50 h-[64px] md:h-[72px] border-b border-[rgba(203,213,225,0.5)] backdrop-blur-[12px] transition-shadow duration-300 ' +
        (scrolled ? 'shadow-sm ' : ' ') +
        'bg-[rgba(248,250,252,0.85)]'
      }
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl md:text-2xl font-bold tracking-tight">
          <span className="text-[#2563EB]">Draw</span>
          <span className="text-[#0F172A] font-semibold">-to-Quote</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="relative text-[15px] font-medium text-[#334155] transition-colors duration-150 hover:text-[#2563EB] group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#2563EB] transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          to="/dashboard"
          className="hidden md:inline-flex items-center rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg"
        >
          Get Started
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#334155]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed top-[64px] right-0 w-[280px] h-[calc(100dvh-64px)] bg-[rgba(248,250,252,0.97)] backdrop-blur-[16px] border-l border-[rgba(203,213,225,0.5)] z-50 flex flex-col p-6 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-[#334155] py-2 transition-colors hover:text-[#2563EB]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2563EB] px-5 py-3 text-sm font-medium text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}
