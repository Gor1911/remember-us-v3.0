'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQ_ITEMS } from '@/components/landing/faqData';

gsap.registerPlugin(ScrollTrigger);

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={`w-5 h-5 shrink-0 text-[#8B0000] transition-transform duration-300 ease-out ${open ? 'rotate-45' : ''}`}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIds, setOpenIds] = useState<number[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.faq-header', { opacity: 0, y: 40 })
        .from('.faq-item', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggle = (i: number) =>
    setOpenIds((ids) => (ids.includes(i) ? ids.filter((x) => x !== i) : [...ids, i]));

  return (
    <section ref={sectionRef} id="faq" className="scroll-mt-16 bg-[#F3F0EB] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container max-w-3xl">
        <div className="faq-header text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">FAQ</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
            Questions,
            <br />
            <span className="text-[#8A7F74]">answered plainly.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const open = openIds.includes(i);
            return (
              <div key={q} className="faq-item glass rounded-[24px]">
                <h3>
                  <button
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 rounded-[24px] text-[#1A1614] font-semibold text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
                  >
                    <span>{q}</span>
                    <PlusIcon open={open} />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[#6B6560] text-[15px] leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
