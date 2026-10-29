'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import { HeroPortraitCard, HeroQrTile, HeroTimelineTile } from '@/components/landing/HeroBento';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { handleCreateClick } = useModal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento-cell', {
        opacity: 0, y: 40, duration: 0.8,
        ease: 'power2.out', stagger: 0.1, delay: 0.15,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#F3F0EB] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/arlington.jpg"
          alt="" fill priority aria-hidden="true" sizes="100vw"
          className="object-cover object-center opacity-[0.60] scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/50 via-[#F3F0EB]/10 to-[#F3F0EB]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_50%,transparent_30%,#F3F0EB_100%)]" />
      </div>

      <div className="site-container relative z-10 py-20 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_3fr] gap-4">

          <HeroPortraitCard />

          <div className="bento-cell glass bento-pad-lg flex flex-col gap-4 order-first md:order-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="uppercase text-muted text-[11px] tracking-[0.12em] font-medium">
                Premium Digital Memorial
              </span>
            </div>
            <div>
              <h1 className="text-[#1A1614] font-bold leading-[1.08] tracking-tight mb-3 text-[2rem] md:text-4xl xl:text-[56px]">
                Memory&nbsp;that
                <br />
                <span className="text-[#8A7F74]">lives on.</span>
              </h1>
              <p className="text-muted text-sm md:text-base xl:text-lg leading-relaxed max-w-xl">
                A private digital memorial. Access by QR code only.
                A living animated portrait.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCreateClick}
                className="px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] active:bg-[#700000] text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
              >
                Create Memorial
              </button>
              <Link
                href="/example"
                className="px-6 py-3 glass text-muted hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
              >
                Explore an Example
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-6 py-3 glass text-muted hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
                >
                  My Memorials
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-[1fr_1.4fr]">
            <HeroQrTile />
            <HeroTimelineTile />
          </div>

        </div>
      </div>
    </section>
  );
}
