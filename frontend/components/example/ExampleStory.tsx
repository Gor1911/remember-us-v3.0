'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EXAMPLE } from '@/components/example/data';

gsap.registerPlugin(ScrollTrigger);

export function ExampleStory() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.name-label, .name-h1, .name-meta', {
        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
      });
      gsap.from('.bio-para', {
        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: '.bio-para', start: 'top 85%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="site-container text-center pt-8 pb-16">
      <div className="name-label flex items-center justify-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
        <span className="text-muted text-[11px] uppercase tracking-[0.14em] font-medium">In Memory Of</span>
      </div>
      <h1 className="name-h1 text-[#1A1614] font-bold text-3xl xl:text-[40px] tracking-tight leading-tight mb-2">
        {EXAMPLE.name}
        <span className="ml-3 align-middle inline-block rounded-full border border-[#8B0000]/30 bg-[#8B0000]/[0.06] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#8B0000]">
          Demo
        </span>
      </h1>
      <div className="name-meta">
        <p className="text-muted text-sm font-mono">{EXAMPLE.branch}</p>
        <p className="text-muted text-sm mt-1 tracking-widest">{EXAMPLE.years}</p>
      </div>
      <div className="flex flex-col gap-5 text-muted text-base leading-relaxed max-w-2xl mx-auto mt-8 text-left">
        {EXAMPLE.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="bio-para">{p}</p>
        ))}
      </div>
    </div>
  );
}
