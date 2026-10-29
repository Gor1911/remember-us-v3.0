'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EXAMPLE } from '@/components/example/data';
import { MedalIcon } from '@/components/landing/icons';

gsap.registerPlugin(ScrollTrigger);

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="section-label flex items-center gap-2.5 mb-10">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
      <span className="text-muted text-[11px] uppercase tracking-[0.12em] font-medium">{children}</span>
    </div>
  );
}

export function ExampleTimelineAwards() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const trigger = { trigger: ref.current, start: 'top 80%', once: true };
      gsap.from('.section-label', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', scrollTrigger: trigger });
      gsap.from('.timeline-item', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.1, scrollTrigger: trigger });
      gsap.from('.award-card', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.1, scrollTrigger: trigger });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="border-t border-[#1A1614]/[0.08]">
      <div className="site-container py-16">
        <div ref={ref} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div>
            <SectionLabel>Biography</SectionLabel>
            <div className="flex flex-col">
              {EXAMPLE.timeline.map((item, i) => (
                <div key={item.year} className="timeline-item">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#8B0000] shrink-0" />
                    <span className="text-[#8B0000] text-xs font-mono pl-3">{item.year}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex justify-center w-2 shrink-0">
                      {i < EXAMPLE.timeline.length - 1 && <div className="w-px bg-[#1A1614]/[0.08] min-h-[48px]" />}
                    </div>
                    <div className="pb-6 pt-1 pl-3">
                      <p className="text-[#1A1614] font-medium text-sm">{item.label}</p>
                      <p className="text-muted text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Military Awards</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAMPLE.awards.map((award) => (
                <div key={award.name} className="award-card glass rounded-[24px] p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/20 flex items-center justify-center text-[#8B0000]">
                    <MedalIcon />
                  </div>
                  <h3 className="text-[#1A1614] font-semibold text-sm">{award.name}</h3>
                  <p className="text-muted text-xs leading-relaxed">{award.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
