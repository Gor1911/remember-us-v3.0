'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { PortraitVideo } from '@/components/landing/PortraitVideo';

export function ExampleHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .fromTo('.portrait-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.0 })
        .fromTo('.veteran-badge', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative h-[75vh] min-h-[620px] pt-16 pb-16">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/arlington.jpg"
          alt="Arlington National Cemetery"
          fill priority sizes="100vw"
          className="object-cover object-center opacity-40 blur-[3px] scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/70 via-transparent to-[#F3F0EB]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,transparent_40%,#F3F0EB_100%)]" />
      </div>

      <div className="absolute bottom-24 md:bottom-16 left-1/2 -translate-x-1/2 z-10">
        <div className="portrait-card opacity-0 relative w-72 h-[400px] md:w-64 md:h-[420px] rounded-[28px] overflow-hidden border border-[#1A1614]/10 shadow-[0_0_0_8px_rgba(139,0,0,0.08),0_40px_80px_rgba(26,22,20,0.15)]">
          <PortraitVideo className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-[#1A1614]/10" />
        </div>
        <div className="veteran-badge opacity-0 absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000] border border-[#8B0000]">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          <span className="text-white text-[10px] font-medium tracking-wider uppercase whitespace-nowrap">Veteran</span>
        </div>
      </div>
    </div>
  );
}
