'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MemorialPageDetail, TimelineEntry } from '@/app/lib/types';

gsap.registerPlugin(ScrollTrigger);

interface MemorialBioProps {
  memorial: MemorialPageDetail;
}

interface TimelineRowProps {
  entry: TimelineEntry;
  isLast: boolean;
}

const TimelineRow = ({ entry, isLast }: TimelineRowProps) => (
  <div className="timeline-item flex gap-5 items-start">
    <div className="flex flex-col items-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-[#8B0000] mt-[3px]" />
      {!isLast && (
        <div className="w-px flex-1 bg-[#1A1614]/[0.08] my-1 min-h-[40px]" />
      )}
    </div>
    <div className="pb-6">
      <span className="text-[#8B0000] text-xs font-mono">{entry.year}</span>
      <p className="text-[#1A1614] font-medium text-sm mt-0.5">{entry.title}</p>
      {entry.description && (
        <p className="text-[#6B6560] text-sm leading-relaxed mt-0.5">{entry.description}</p>
      )}
    </div>
  </div>
);

export const MemorialBio = ({ memorial }: MemorialBioProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  const hasContent = memorial.timeline_entries.length > 0;
  const sortedEntries = [...memorial.timeline_entries].sort((a, b) => a.year - b.year);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.bio-card', {
        opacity: 0, y: 36, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.timeline-item', {
        opacity: 0, x: -24, duration: 0.65, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: '.timeline-item', start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!hasContent) return null;

  return (
    <section ref={sectionRef} className="border-t border-[#1A1614]/[0.08] bg-[#F3F0EB]">
      <div className="site-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-8">

            {sortedEntries.length > 0 && (
              <div className="bio-card bg-white border border-[#1A1614]/[0.08] rounded-[32px] p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                  <span className="text-muted text-[11px] uppercase tracking-[0.12em] font-medium">
                    Life Events
                  </span>
                </div>
                <div className="flex flex-col">
                  {sortedEntries.map((entry, i) => (
                    <TimelineRow
                      key={entry.id}
                      entry={entry}
                      isLast={i === sortedEntries.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};
