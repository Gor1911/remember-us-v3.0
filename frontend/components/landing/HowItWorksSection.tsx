'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    title: 'Tell their story',
    desc: 'Create an account and enter their name, dates, biography and the events of a life.',
  },
  {
    title: 'Add photographs',
    desc: 'Upload portraits and family photos to bring the memorial to life.',
  },
  {
    title: 'We review every memorial',
    desc: 'Our team checks each page before it goes live, usually within 24 hours.',
  },
  {
    title: 'Receive your private link and QR code',
    desc: 'Engrave it on a plaque or headstone, or print it for a frame at home.',
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.how-header', { opacity: 0, y: 40 })
        .from('.how-step', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="scroll-mt-16 bg-[#FAF8F5] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="how-header text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">How it works</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
            Four quiet steps.
            <br />
            <span className="text-[#8A7F74]">Nothing left to chance.</span>
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 list-none">
          {STEPS.map(({ title, desc }, i) => (
            <li key={title} className="how-step glass bento-pad flex flex-col gap-4 rounded-[32px]">
              <span className="text-[#8B0000] font-semibold text-sm tracking-[0.12em] tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[#1A1614] font-semibold text-lg leading-snug">{title}</h3>
              <p className="text-[#6B6560] text-[15px] leading-relaxed">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
