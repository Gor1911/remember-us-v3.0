'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PortraitVideo } from '@/components/landing/PortraitVideo';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = ['Animated from a single photo', 'Natural micro-movements', 'Comes alive as you scroll'];

export function LivingPortraitSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.lp-label', { opacity: 0, y: 40 })
        .from('.lp-text', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.6')
        .from('.lp-item', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.6')
        .from('.lp-mockup', { opacity: 0, y: 40 }, 0.1);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="living-portrait" className="scroll-mt-16 bg-[#FAF8F5] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="lp-label flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">Living Portrait</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h2 className="lp-text text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
              A portrait that
              <br />
              <span className="text-[#8A7F74]">looks back at you.</span>
            </h2>
            <p className="lp-text text-[#1A1614]/50 text-base leading-relaxed max-w-md">
              LivePortrait technology brings a photograph to life. Eyes move,
              expressions breathe — as if the person is present beside you.
            </p>
            <ul className="flex flex-col gap-3">
              {ITEMS.map((item) => (
                <li key={item} className="lp-item flex items-center gap-3 text-[#1A1614]/60 text-sm">
                  <span className="w-1 h-1 rounded-full bg-[#8B0000] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <div className="lp-mockup relative w-[240px] h-[480px] rounded-[48px] overflow-hidden border border-[#1A1614]/[0.12] shadow-[0_0_0_8px_rgba(139,0,0,0.06),0_40px_80px_rgba(26,22,20,0.12)]">
              <PortraitVideo className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 rounded-[48px] ring-1 ring-inset ring-[#1A1614]/10" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#1A1614]/10 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                <span className="text-[#1A1614]/60 text-[10px] font-medium tracking-wider uppercase">Living Portrait</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
