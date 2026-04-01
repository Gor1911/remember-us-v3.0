'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MemorialPageDetail } from '@/app/lib/types';

gsap.registerPlugin(ScrollTrigger);


interface MemorialHeroProps {
  memorial: MemorialPageDetail;
}

function formatDateRange(birthDate: string | null, deathDate: string | null): string {
  const birth = birthDate ? new Date(birthDate).getFullYear() : null;
  const death = deathDate ? new Date(deathDate).getFullYear() : null;
  if (birth && death) return `${birth} — ${death}`;
  if (birth) return `${birth} — present`;
  return '';
}

export const MemorialHero = ({ memorial }: MemorialHeroProps) => {
  const heroRef   = useRef<HTMLDivElement>(null);
  const nameRef   = useRef<HTMLDivElement>(null);
  const portrait  = memorial.media_files.find((f) => f.is_primary_portrait);
  const dateRange = formatDateRange(memorial.birth_date, memorial.death_date);

  // Portrait entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set('.portrait-card', { opacity: 0, y: 40 });
      gsap.set('.veteran-badge', { opacity: 0, y: 8 });
      gsap.to('.portrait-card', { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', delay: 0.3 });
      gsap.to('.veteran-badge', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.9 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Name + bio scroll reveal
  useEffect(() => {
    if (!nameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.name-label, .name-h1, .name-meta', {
        opacity: 0, y: 24, duration: 0.7, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: nameRef.current, start: 'top 90%', once: true },
      });
      gsap.from('.bio-para', {
        opacity: 0, y: 24, duration: 0.8, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.bio-para', start: 'top 88%', once: true },
      });
    }, nameRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Hero background + portrait ─────────────────────────────────── */}
      <div
        ref={heroRef}
        className="relative h-[45vh] min-h-[320px] pt-16 bg-[#F3F0EB]"
      >
        {/* Arlington background */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/arlington.jpg"
            alt="Arlington National Cemetery"
            fill priority
            aria-hidden="true"
            className="object-cover object-center opacity-35 blur-[2px] scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/70 via-[#F3F0EB]/20 to-[#F3F0EB]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_50%,#F3F0EB_100%)]" />
        </div>

        {/* Portrait — overflows below hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[35%] z-10">
          <div
            className="portrait-card relative w-72 h-[440px] md:w-72 md:h-[460px] rounded-[28px] overflow-hidden border border-[#1A1614]/10"
            style={{ boxShadow: '0 0 0 8px rgba(139,0,0,0.08), 0 40px 80px rgba(26,22,20,0.15)', opacity: 0, transform: 'translateY(40px)' }}
          >
            {portrait ? (
              <Image
                src={portrait.file_url}
                alt={portrait.alt_text || memorial.full_name}
                fill priority
                unoptimized
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-[#1A1614]/[0.04] flex items-center justify-center">
                <span className="text-[#1A1614]/20 text-4xl">👤</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-[#1A1614]/10" />
          </div>

          {/* Badge */}
          <div
            className="veteran-badge absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000]/90 border border-[#8B0000]"
            style={{ opacity: 0, transform: 'translateY(8px)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="text-white text-[10px] font-medium tracking-wider uppercase whitespace-nowrap">
              {memorial.page_type === 'military' ? 'Veteran' : 'In Memory'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Name + Bio ─────────────────────────────────────────────────── */}
      <div
        ref={nameRef}
        className="site-container text-center pt-[190px] md:pt-[200px] pb-16 bg-[#FAF8F5]"
      >
        <div className="name-label flex items-center justify-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.14em] font-medium">
            In Memory Of
          </span>
        </div>

        <h1 className="name-h1 text-[#1A1614] font-bold text-3xl xl:text-[40px] tracking-tight leading-tight mb-2">
          {memorial.full_name}
        </h1>

        <div className="name-meta">
          {memorial.page_type === 'military' && (memorial.military_rank || memorial.military_branch) && (
            <p className="text-[#1A1614]/40 text-sm font-mono">
              {[memorial.military_rank, memorial.military_branch].filter(Boolean).join(' · ')}
            </p>
          )}
          {dateRange && (
            <p className="text-[#1A1614]/25 text-sm mt-1 tracking-widest">{dateRange}</p>
          )}
        </div>

        {/* Biography inline */}
        {memorial.biography && (
          <div className="flex flex-col gap-4 text-[#1A1614]/55 text-base leading-relaxed max-w-2xl mx-auto mt-8 text-left">
            {memorial.biography.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="bio-para">{para}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
