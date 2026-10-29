import Link from 'next/link';

const NAV_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Features',     href: '/#features' },
      { label: 'QR Access',    href: '/#qr-access' },
      { label: 'FAQ',          href: '/#faq' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Memorial Example', href: '/example' },
      { label: 'My Memorials',     href: '/dashboard' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy',   href: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#F3F0EB] border-t border-[#1A1614]/[0.08]">
      <div className="site-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-x-6 gap-y-10 md:gap-12">

          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2.5 no-underline w-fit">
              <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
              <span className="text-[#1A1614] font-semibold text-[15px] tracking-tight">
                Remember<span className="text-muted font-normal"> US</span>
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-[260px]">
              A premium private digital memorial. Access by QR code only.
              Built with respect for memory.
            </p>
            <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-[#1A1614]/[0.10] bg-[#1A1614]/[0.03]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="text-muted text-[11px] tracking-widest uppercase font-medium">USA · Premium</span>
            </div>
          </div>

          {NAV_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <span className="text-muted text-[11px] uppercase tracking-widest font-medium">{col.title}</span>
              <ul className="flex flex-col gap-3 list-none">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-muted hover:text-[#1A1614] text-sm transition-colors duration-200 no-underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1A1614]/[0.06]">
        <div className="site-container py-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-muted text-xs">© {new Date().getFullYear()} Remember US. All rights reserved.</p>
          <p className="text-muted text-xs tracking-wide">Designed for Eternity. Built in USA.</p>
        </div>
      </div>
    </footer>
  );
}
