'use client';

import { useEffect, useState, useCallback } from 'react';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';

const NAV_LINKS: { label: string; href: string }[] = [];

export function Header() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { handleCreateClick, openAuth } = useModal();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const onCreateClick = () => {
    closeMenu();
    handleCreateClick();
  };

  const onSignInClick = () => {
    closeMenu();
    openAuth('/');
  };

  const onLogout = () => {
    closeMenu();
    logout();
  };

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'Account';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-[#0A0F1E]/95 backdrop-blur-xl border-white/[0.06]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="site-container flex items-center justify-between h-16">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <span className="w-2 h-2 rounded-full bg-[#8B0000]" />
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Remember<span className="text-[#9BA4B5] font-normal"> US</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-white/50 hover:text-white text-sm transition-colors duration-200 no-underline"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop auth area */}
        {!loading && (
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <a
                  href="/dashboard"
                  className="text-white/40 hover:text-white text-sm truncate max-w-[140px] transition-colors no-underline"
                >
                  {displayName}
                </a>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Sign Out
                </button>
                <button
                  onClick={onCreateClick}
                  className="px-5 py-2 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[10px] transition-colors duration-200"
                >
                  Create Memorial
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSignInClick}
                  className="px-4 py-2 text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={onCreateClick}
                  className="px-5 py-2 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[10px] transition-colors duration-200"
                >
                  Create Memorial
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile: hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[6px]"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <nav className="site-container flex flex-col gap-1 pb-6 pt-2">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={closeMenu}
              className="text-white/60 hover:text-white text-base py-3 border-b border-white/[0.06] no-underline transition-colors"
            >
              {label}
            </a>
          ))}

          {!loading && isAuthenticated && (
            <div className="py-3 border-b border-white/[0.06] flex items-center justify-between">
              <a
                href="/dashboard"
                onClick={closeMenu}
                className="text-white/60 hover:text-white text-sm truncate no-underline transition-colors"
              >
                {displayName} · My Memorials
              </a>
              <button
                onClick={onLogout}
                className="text-white/40 hover:text-white text-sm transition-colors shrink-0"
              >
                Sign Out
              </button>
            </div>
          )}

          <button
            onClick={onCreateClick}
            className="mt-4 w-full py-3.5 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors"
          >
            Create Memorial
          </button>

          {!loading && !isAuthenticated && (
            <button
              onClick={onSignInClick}
              className="w-full py-3 text-white/50 hover:text-white text-sm transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
