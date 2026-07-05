import { Link } from 'react-router-dom'

const productLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Demo', to: '/demo' },
  { label: 'Dashboard', to: '/dashboard' },
]

const resourceLinks = [
  { label: 'Help Center', to: '#' },
  { label: 'API Docs', to: '#' },
  { label: 'Blog', to: '#' },
  { label: 'Contact', to: '#' },
]

const legalLinks = [
  { label: 'Privacy', to: '#' },
  { label: 'Terms', to: '#' },
  { label: 'Security', to: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0B1D3A]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 pt-16 pb-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center text-xl font-bold tracking-tight mb-4">
              <span className="text-[#2563EB]">EZ</span>
              <span className="text-white font-semibold">-Estimates</span>
            </div>
            <p className="text-[#93C5FD] text-sm leading-relaxed">
              Turn estimates into revenue.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[#93C5FD] text-sm hover:text-white hover:underline transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="flex flex-col gap-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[#93C5FD] text-sm hover:text-white hover:underline transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[#93C5FD] text-sm hover:text-white hover:underline transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#142C4D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#93C5FD]/70 text-xs">
            &copy; 2025 Draw-to-Quote. All rights reserved.
          </p>
          <p className="text-[#93C5FD]/50 text-xs">
            Built for contractors.
          </p>
        </div>
      </div>
    </footer>
  )
}
