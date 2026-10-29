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

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export const MemorialHero = ({ memorial }: MemorialHeroProps) => {
  const heroRef   = useRef<HTMLDivElement>(null);
  const nameRef   = useRef<HTMLDivElement>(null);
  const portrait  = memorial.media_files.find((f) => f.is_primary_portrait);
  const dateRange = formatDateRange(memorial.birth_date, memorial.death_date);
  const isMilitary = memorial.page_type === 'military';

  // Portrait entrance
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.portrait-card', { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', delay: 0.3 });
      gsap.fromTo('.veteran-badge', { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.9 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Name + bio scroll reveal
  useEffect(() => {
    if (!nameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.name-label, .name-h1, .name-meta', {
        opacity: 0, y: 24, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: nameRef.current, start: 'top 90%', once: true },
      });
      gsap.from('.bio-para', {
        opacity: 0, y: 24, duration: 0.8, ease: 'power2.out', stagger: 0.1,
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
        className="relative w-full h-[45vh] min-h-[320px] pt-16 bg-[#F3F0EB]"
      >
        <div className="absolute inset-0 overflow-hidden">
          {isMilitary ? (
            <>
              <Image
                src="/images/arlington.jpg"
                alt=""
                fill priority
                sizes="100vw"
                aria-hidden="true"
                className="object-cover object-center opacity-35 blur-[2px] scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/70 via-[#F3F0EB]/20 to-[#FAF8F5]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB] via-[#F6F3EE] to-[#FAF8F5]" />
          )}
        </div>

        {/* Portrait — overflows below hero */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[35%] z-10">
          <div className="portrait-card opacity-0 relative w-72 h-[440px] md:h-[460px] rounded-[28px] overflow-hidden border border-[#1A1614]/10 shadow-[0_0_0_8px_rgba(139,0,0,0.08),0_40px_80px_rgba(26,22,20,0.15)]">
            {portrait ? (
              <Image
                src={portrait.file_url}
                alt={portrait.alt_text || memorial.full_name}
                fill priority
                unoptimized
                sizes="288px"
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-[#EDE8E0] flex flex-col items-center justify-center gap-3">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A7F74]" aria-hidden="true">
                  <circle cx="12" cy="8.5" r="3.5" />
                  <path d="M4.5 20c.6-3.6 3.6-5.5 7.5-5.5s6.9 1.9 7.5 5.5" />
                </svg>
                <span className="text-[#6B6560] text-2xl font-semibold tracking-[0.12em]">
                  {getInitials(memorial.full_name)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-[#1A1614]/10" />
          </div>

          <div className="veteran-badge opacity-0 absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000] border border-[#8B0000]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="text-white text-[10px] font-medium tracking-wider uppercase whitespace-nowrap">
              {isMilitary ? 'Veteran' : 'In Memory'}
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
          {isMilitary && (memorial.military_rank || memorial.military_branch) && (
            <p className="text-[#6B6560] text-sm font-mono">
              {[memorial.military_rank, memorial.military_branch].filter(Boolean).join(' · ')}
            </p>
          )}
          {dateRange && (
            <p className="text-[#8A7F74] text-sm mt-1 tracking-widest">{dateRange}</p>
          )}
        </div>

        {memorial.biography && (
          <div className="flex flex-col gap-4 text-[#6B6560] text-base leading-relaxed max-w-2xl mx-auto mt-8 text-left">
            {memorial.biography.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="bio-para">{para}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
