'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookIcon, LockIcon, PhotoIcon } from '@/components/landing/icons';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    Icon: LockIcon,
    title: 'Private Access',
    desc: 'The memorial is not indexed or searchable. Access only via a personal QR code — for family and close ones.',
  },
  {
    Icon: BookIcon,
    title: 'Biography',
    desc: 'An interactive life timeline. Photos, videos, documents — everything in chronological order.',
  },
  {
    Icon: PhotoIcon,
    title: 'Photo Gallery',
    desc: 'Thousands of photographs in one place. Family members can add photos after the memorial is published.',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.feat-header', { opacity: 0, y: 40 })
        .from('.feat-card', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="scroll-mt-16 bg-[#F3F0EB] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="feat-header text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-muted text-[11px] tracking-[0.12em] font-medium">Features</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
            Everything you need for
            <br />
            <span className="text-[#8A7F74]">a meaningful tribute.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="feat-card glass bento-pad flex flex-col gap-4 rounded-[32px]">
              <span className="text-[#8B0000]"><Icon /></span>
              <h3 className="text-[#1A1614] font-semibold text-base">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
