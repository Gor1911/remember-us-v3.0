'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModal } from '@/app/context/ModalContext';

gsap.registerPlugin(ScrollTrigger);

export function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { handleCreateClick } = useModal();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      tl.from('.cta-card', { opacity: 0, y: 40 })
        .from('.cta-card > *', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#F3F0EB] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="cta-card glass rounded-[32px] bento-pad-lg flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-muted text-[11px] tracking-[0.12em] font-medium">Get Started Today</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight max-w-2xl">
            Create a memorial
            <br />
            <span className="text-[#8A7F74]">that lasts forever.</span>
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-lg">
            A premium memorial ready in 24 hours. You provide the photos and documents —
            we take care of everything else.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={handleCreateClick}
              className="px-8 py-4 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
            >
              Create Memorial
            </button>
            <Link
              href="/example"
              className="px-8 py-4 glass text-muted hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
            >
              Explore an Example
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
