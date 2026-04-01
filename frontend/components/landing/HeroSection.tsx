'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';

gsap.registerPlugin(ScrollTrigger);

interface TimelineEvent {
  year: string;
  label: string;
  accent: boolean;
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { handleCreateClick } = useModal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento-cell', {
        opacity: 0, y: 40, duration: 0.8,
        ease: 'power2.out', stagger: 0.1, delay: 0.15,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-[#F3F0EB] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/arlington.jpg"
          alt="" fill priority aria-hidden="true"
          className="object-cover object-center opacity-[0.60] scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/50 via-[#F3F0EB]/10 to-[#F3F0EB]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_50%,transparent_30%,#F3F0EB_100%)]" />
      </div>

      {/* ── Bento Grid ── */}
      <div className="site-container relative z-10 py-20 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr] gap-4">

          {/* ── Portrait ── */}
          <Link href="/example" className="bento-cell glass relative overflow-hidden block group
                          h-[280px]
                          md:row-span-2 md:h-auto md:min-h-[480px]
                          lg:min-h-[560px]">
            <Image
              src="/images/portrait-placeholder.jpg"
              alt="Portrait of the deceased"
              fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#1A1614]/0 group-hover:bg-[#1A1614]/10 transition-colors duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F3F0EB] via-[#F3F0EB]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 bento-pad">
              <p className="uppercase text-[#8A7F74] text-[10px] mb-1.5 tracking-wide font-medium">
                In Memory Of
              </p>
              <h3 className="text-[#1A1614] text-lg font-semibold leading-snug">
                Chief Master Sergeant
              </h3>
              <p className="text-[#1A1614]/40 text-sm mt-1 font-mono">
                U.S. Air Force · WWII Veteran
              </p>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="text-[#8A7F74] text-[10px] font-medium tracking-wider uppercase">Veteran</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[#1A1614]/60 text-[11px] tracking-widest uppercase font-medium">View Memorial →</span>
            </div>
          </Link>

          {/* ── Title + CTA ── */}
          <div className="bento-cell glass lg:col-span-3 bento-pad-lg flex flex-col gap-4
                          order-first md:order-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
              <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">
                Premium Digital Memorial
              </span>
            </div>
            <div>
              <h1 className="text-[#1A1614] font-bold leading-[1.08] tracking-tight mb-3
                             text-[2rem] md:text-4xl xl:text-[56px]">
                Memory&nbsp;that
                <br />
                <span className="text-[#8A7F74]">lives on.</span>
              </h1>
              <p className="text-[#1A1614]/50 text-sm md:text-base xl:text-lg leading-relaxed max-w-xl">
                A private digital memorial. Access by QR code only.
                A living animated portrait. Military awards in&nbsp;3D.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCreateClick}
                className="px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] active:bg-[#700000] text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
              >
                Create Memorial
              </button>
              <a
                href="/example"
                className="px-6 py-3 glass text-[#1A1614]/60 hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
              >
                View Example
              </a>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-6 py-3 glass text-[#1A1614]/60 hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
                >
                  My Memorials
                </Link>
              )}
            </div>
          </div>

          {/* ── Bottom 3 cards ── */}
          <div className="col-span-1 md:contents">
            <div className="grid grid-cols-3 gap-3 md:contents">

              {/* Medal */}
              <div className="bento-cell glass bento-pad flex flex-col justify-between
                              min-h-[140px] md:min-h-[180px]
                              lg:col-start-2 lg:row-start-2">
                <span className="uppercase text-[#8A7F74] text-[10px] tracking-wide font-medium">Awards</span>
                <div className="flex justify-center items-center flex-1 py-1">
                  <MedalIcon />
                </div>
                <p className="text-[#1A1614]/30 text-[10px] text-center tracking-wide">3D · Interactive</p>
              </div>

              {/* QR */}
              <div className="bento-cell glass bento-pad flex flex-col items-center justify-between gap-2
                              lg:col-start-3 lg:row-start-2">
                <span className="uppercase text-[#8A7F74] text-[10px] tracking-wide font-medium self-start">QR</span>
                <QrPlaceholder />
                <p className="text-[#1A1614]/30 text-[10px] tracking-wide">Link only</p>
              </div>

              {/* Timeline */}
              <div className="bento-cell glass bento-pad flex flex-col
                              lg:col-start-4 lg:row-start-2">
                <span className="uppercase text-[#8A7F74] text-[10px] tracking-wide font-medium mb-3">Bio</span>
                <MiniTimeline events={[
                  { year: '1962', label: 'Born',     accent: false },
                  { year: '1980', label: 'Service',  accent: false },
                  { year: '1991', label: 'Gulf War', accent: true  },
                  { year: '2023', label: 'Memory',   accent: false },
                ]} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MedalIcon() {
  return (
    <svg width="60" height="64" viewBox="0 0 76 80" fill="none" aria-hidden="true">
      <line x1="28" y1="28" x2="28" y2="8"  stroke="#8A7F74" strokeWidth="2"   strokeLinecap="round" />
      <line x1="48" y1="28" x2="48" y2="8"  stroke="#8A7F74" strokeWidth="2"   strokeLinecap="round" />
      <rect x="22" y="4" width="32" height="8" rx="3" fill="#E8E3DB" stroke="#8A7F74" strokeWidth="1" />
      <rect x="34" y="4" width="8"  height="8" fill="#8B0000" fillOpacity="0.7" />
      <circle cx="38" cy="52" r="24" stroke="#8B0000" strokeWidth="1.5" />
      <circle cx="38" cy="52" r="18" stroke="#8A7F74" strokeWidth="0.75" strokeDasharray="3 3" />
      <path
        d="M38 34L40.94 43.02H50.5L42.78 48.46L45.72 57.48L38 52.04L30.28 57.48L33.22 48.46L25.5 43.02H35.06L38 34Z"
        fill="#8B0000" fillOpacity="0.85" stroke="#8B0000" strokeWidth="0.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function QrPlaceholder() {
  const pattern = [
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1],
    [0,1,0,0,0,1,0],
    [1,1,1,0,1,0,1],
    [1,0,0,1,0,1,1],
    [1,1,1,0,1,1,1],
  ];
  return (
    <div className="p-2 rounded-xl bg-[#1A1614]/[0.04] border border-[#1A1614]/[0.08]">
      <div className="grid grid-cols-7 gap-[2px]">
        {pattern.flat().map((filled, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${filled ? 'bg-[#1A1614]/70' : 'bg-transparent'}`} />
        ))}
      </div>
    </div>
  );
}

function MiniTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="flex flex-col">
      {events.map((ev, i) => (
        <div key={i}>
          <div className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.accent ? 'bg-[#8B0000]' : 'bg-[#1A1614]/20'}`} />
            <span className="text-[#8A7F74] text-[10px] font-mono pl-2">{ev.year}</span>
          </div>
          <div className="flex gap-2.5">
            <div className="flex justify-center w-1.5 shrink-0">
              {i < events.length - 1 && <div className="w-px h-6 bg-[#1A1614]/[0.08]" />}
            </div>
            <p className={`text-[11px] leading-snug pt-0.5 pb-1 pl-2 ${ev.accent ? 'text-[#1A1614] font-medium' : 'text-[#1A1614]/40'}`}>
              {ev.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
