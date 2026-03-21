'use client';

const NAV_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works',      href: '#how' },
      { label: 'Memorial Examples', href: '#examples' },
      { label: 'Pricing',           href: '#pricing' },
      { label: 'QR Access',         href: '#qr' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'Living Portrait', href: '#portrait' },
      { label: 'Awards in 3D',   href: '#medals' },
      { label: 'Biography',      href: '#timeline' },
      { label: 'Photo Gallery',  href: '#gallery' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',       href: '#about' },
      { label: 'Contact',        href: '#contact' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Use',   href: '#terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0A0F1E] border-t border-white/[0.06]">
      {/* Main block */}
      <div className="site-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-12">

          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <a href="/" className="flex items-center gap-2.5 no-underline w-fit">
              <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
              <span className="text-white font-semibold text-[15px] tracking-tight">
                Remember<span className="text-[#9BA4B5] font-normal"> US</span>
              </span>
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
              A premium private digital memorial. Access by QR code only.
              Built with respect for memory.
            </p>
            <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
              <span className="text-[#9BA4B5] text-[11px] tracking-widest uppercase font-medium">
                USA · Premium
              </span>
            </div>
          </div>

          {/* Nav columns — 2-col on mobile, individual on desktop */}
          <div className="grid grid-cols-2 md:contents gap-8">
          {NAV_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <span className="text-white/30 text-[11px] uppercase tracking-widest font-medium">
                {col.title}
              </span>
              <ul className="flex flex-col gap-3 list-none">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-white/50 hover:text-white text-sm transition-colors duration-200 no-underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="site-container py-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Remember US. All rights reserved.
          </p>
          <p className="text-white/20 text-xs tracking-wide">
            Designed for Eternity. Built in USA.
          </p>
        </div>
      </div>
    </footer>
  );
}
