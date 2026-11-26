'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { FOCUS } from '@/components/ui/styles';

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features',     href: '/#features' },
  { label: 'Pricing',      href: '/#pricing' },
  { label: 'FAQ',          href: '/#faq' },
  { label: 'Example',      href: '/example' },
];

interface HeaderProps {
  /** Transparent until scrolled — only over the light opening scene of the landing page. */
  overlay?: boolean;
}

export function Header({ overlay = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleCreateClick, openAuth } = useModal();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const onCreateClick = () => { closeMenu(); handleCreateClick(); };
  const onSignInClick = () => { closeMenu(); openAuth('/'); };
  const onLogout = () => { closeMenu(); logout(); };

  const clear = overlay && !scrolled && !menuOpen;
  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Account';
  const linkTone = 'text-ink hover:text-muted';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        clear ? 'bg-transparent' : 'bg-canvas/90 backdrop-blur-xl shadow-hairline'
      }`}
    >
      {/* The inline nav needs ~1000px: below lg (1024) it wrapped, so tablets get the menu button. */}
      <div className={`content-1000 flex items-center justify-between ${overlay ? 'h-16 md:h-[72px]' : 'h-16'}`}>
        <Link
          href="/"
          className={`type-wordmark whitespace-nowrap no-underline text-ink rounded-sm ${FOCUS}`}
        >
          Remember US
        </Link>

        <nav className="hidden lg:flex items-center" aria-label="Main">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className={`type-action px-3 xl:px-5 py-2 whitespace-nowrap no-underline transition-colors rounded-full ${linkTone} ${FOCUS}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 min-h-[42px]">
          {!loading && (isAuthenticated ? (
            <>
              <Link href="/dashboard" className={`type-action px-3 py-2 truncate max-w-[140px] no-underline transition-colors rounded-full ${linkTone} ${FOCUS}`}>
                {displayName}
              </Link>
              <button type="button" onClick={onLogout} className={`type-action px-3 py-2 whitespace-nowrap transition-colors rounded-full ${linkTone} ${FOCUS}`}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" onClick={onSignInClick} className={`type-action px-3 py-2 whitespace-nowrap transition-colors rounded-full ${linkTone} ${FOCUS}`}>
              Sign in
            </button>
          ))}
          <button type="button" onClick={onCreateClick} className="pill pill-dark">
            Create memorial
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className={`lg:hidden flex flex-col justify-center items-center w-11 h-11 -mr-1.5 gap-[6px] rounded-full ${FOCUS}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {['rotate-45 translate-y-[7px]', 'opacity-0', '-rotate-45 -translate-y-[7px]'].map((open) => (
            <span
              key={open}
              className={`block w-5 h-[1.5px] transition-[transform,opacity] duration-300 motion-reduce:transition-none bg-ink ${menuOpen ? open : ''}`}
            />
          ))}
        </button>
      </div>

      {/* Opens like the FAQ rows (grid rows 0fr → 1fr); inert while closed so its links are out of the tab order. */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`lg:hidden grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
        <nav className="content-1000 flex flex-col pb-6 pt-2" aria-label="Mobile">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className={`type-action text-ink py-3.5 border-b border-ink/[0.08] no-underline ${FOCUS}`}
            >
              {label}
            </Link>
          ))}

          {!loading && isAuthenticated && (
            <div className="py-3.5 border-b border-ink/[0.08] flex items-center justify-between gap-4">
              <Link href="/dashboard" onClick={closeMenu} className={`type-action text-ink truncate no-underline rounded-sm ${FOCUS}`}>
                {displayName} · My memorials
              </Link>
              <button type="button" onClick={onLogout} className={`type-action text-muted shrink-0 min-h-11 rounded-sm ${FOCUS}`}>
                Sign out
              </button>
            </div>
          )}

          <button type="button" onClick={onCreateClick} className="pill pill-dark mt-6 w-full">
            Create memorial
          </button>
          {!loading && !isAuthenticated && (
            <button type="button" onClick={onSignInClick} className={`type-action text-ink py-3 mt-1 rounded-sm ${FOCUS}`}>
              Sign in
            </button>
          )}
        </nav>
        </div>
      </div>
    </header>
  );
}
