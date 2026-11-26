import Link from 'next/link';
import { FOCUS_ON_DARK } from '@/components/ui/styles';

const NAV_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works',    href: '/#how-it-works' },
      { label: 'Features',        href: '/#features' },
      { label: 'Living portrait', href: '/#living-portrait' },
      { label: 'QR access',       href: '/#qr-access' },
    ],
  },
  {
    title: 'Plans',
    links: [
      { label: 'Pricing', href: '/#pricing' },
      { label: 'FAQ',     href: '/#faq' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Memorial example', href: '/example' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My memorials',   href: '/dashboard' },
      { label: 'Reset password', href: '/forgot-password' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy policy',   href: '/privacy' },
    ],
  },
];

/** Dense dark utility ending: link columns, wordmark row, legal paragraphs. */
export function Footer() {
  return (
    <footer className="bg-ink text-linen">
      <div className="content-1000 py-10">
        <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8">
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="type-utility-heading text-white">{col.title}</p>
              <ul className="mt-2 list-none">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`block py-2 type-utility text-linen no-underline rounded-sm transition-colors duration-150 hover:text-white active:text-white/80 ${FOCUS_ON_DARK}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className={`type-wordmark text-white no-underline rounded-sm ${FOCUS_ON_DARK}`}>
            Remember US
          </Link>
          <p className="type-utility">Designed for Eternity. Built in USA.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 max-w-[460px]">
          <p className="type-utility">
            Remember US memorials are private. They are not listed publicly or indexed by search
            engines, and open only through their QR code or private link. Every memorial, and every
            later change, is reviewed by our team before it becomes visible.
          </p>
          <p className="type-utility">
            Living Portrait animations are generated with AI from a photograph you provide, with your
            confirmation that you have the right to use it.
          </p>
          <p className="type-utility mt-2">© {new Date().getFullYear()} Remember US. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
